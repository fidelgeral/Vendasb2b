import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";

const GROQ_MODEL = "openai/gpt-oss-20b";

async function askGroq(systemPrompt, history) {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error("O assistente de IA ainda não está configurado neste servidor.");
    err.status = 503;
    throw err;
  }
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...history],
      temperature: 0.4,
      max_tokens: 500,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Groq error", res.status, text);
    const err = new Error(
      res.status === 429 ? "O assistente está muito solicitado neste momento. Tente novamente daqui a pouco." : "Não foi possível obter resposta do assistente."
    );
    err.status = res.status === 429 ? 429 : 502;
    throw err;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "Não consegui gerar uma resposta.";
}

const messageSchema = z.object({
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1000) }))
    .min(1)
    .max(12),
});

// ---------------- Assistente interno (ajuda a usar o sistema) ----------------
export const assistantRouter = Router({ mergeParams: true });
assistantRouter.use(requireAuth, requireBusiness);

const HELP_SYSTEM_PROMPT = `Você é o assistente de ajuda do VENDASB2B, um sistema de ponto de venda (PDV) para pequenos negócios em Moçambique (mercearias, restaurantes, bares, lojas de roupa, padarias).

Ajude a pessoa a perceber como usar as funcionalidades do sistema:
- Vender: pesquisar/ler código de barras, carrinho, venda rápida, desconto, pagamento dividido, fiado, pontos de fidelidade, vendas em espera.
- Mesas: só aparece se o módulo restaurante/bar estiver activo; comandas por mesa, taxa de serviço.
- Caixa: abrir/fechar turno, quebras de stock, entradas/saídas de dinheiro, fecho "cego" para operadores de caixa (não veem o valor esperado).
- Produtos: produto simples, variação (puxa stock de um produto-pai, ex. tamanhos), composição/combo (ingredientes, custo automático).
- Estoque: ajustar quantidades, lotes com validade, importação/exportação em massa via Excel, etiquetas de preço.
- Clientes: fiado com limite de crédito, pagamento parcial, pontos de fidelidade, lembrete por WhatsApp.
- Compras: fornecedores e histórico de compras.
- Equipa: só o "Administrador" pode gerir contas; funções são Administrador, Gerente, Operador de Caixa, Cozinha/Bar.
- Balanço: relatórios de vendas, financeiro e estoque, exportáveis em Excel/PDF.
- Configurações: IVA, impressão, contas de pagamento (Dinheiro/M-Pesa/e-Mola), dados da empresa.

Responda sempre em português, de forma curta e directa, com passos práticos. Se a pergunta não for sobre como usar o VENDASB2B, diga educadamente que só pode ajudar com isso.`;

assistantRouter.post("/assistant/chat", rateLimit({ windowMs: 60 * 1000, max: 15 }), async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Mensagem inválida." });
  try {
    const reply = await askGroq(HELP_SYSTEM_PROMPT, parsed.data.history);
    res.json({ reply });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});

// ---------------- Assistente público (clientes de cada loja) ----------------
export const publicRouter = Router();

const publicChatLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

async function loadPublicBusiness(slug) {
  const biz = (await query("SELECT id, name, config FROM businesses WHERE slug = $1 AND active = true", [slug])).rows[0];
  if (!biz) return null;
  const products = (
    await query(
      `SELECT name, category, unit, price FROM products
       WHERE business_id = $1 AND active = true AND venda_directa = true ORDER BY name LIMIT 300`,
      [biz.id]
    )
  ).rows;
  return { biz, products };
}

publicRouter.get("/:slug/info", async (req, res) => {
  const data = await loadPublicBusiness(req.params.slug.toLowerCase());
  if (!data) return res.status(404).json({ error: "Negócio não encontrado." });
  const { biz, products } = data;
  const empresa = biz.config?.empresa || {};
  res.json({
    business: {
      name: biz.config?.businessName || biz.name,
      endereco: empresa.endereco || "",
      cidade: empresa.cidade || "",
      contacto: empresa.contacto || "",
    },
    products: products.map((p) => ({ name: p.name, category: p.category, unit: p.unit, price: Number(p.price) })),
  });
});

publicRouter.post("/:slug/assistant/chat", publicChatLimiter, async (req, res) => {
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Mensagem inválida." });

  const data = await loadPublicBusiness(req.params.slug.toLowerCase());
  if (!data) return res.status(404).json({ error: "Negócio não encontrado." });
  const { biz, products } = data;
  const empresa = biz.config?.empresa || {};
  const businessName = biz.config?.businessName || biz.name;

  const catalogo = products.length
    ? products.map((p) => `- ${p.name} (${p.category || "Geral"}): ${Number(p.price).toFixed(0)} MT / ${p.unit}`).join("\n")
    : "(sem produtos publicados)";

  const systemPrompt = `Você é o assistente virtual de atendimento de "${businessName}", um negócio em Moçambique. Responda em português, de forma simpática e breve, apenas com base na informação abaixo.

Nunca invente produtos ou preços que não estejam na lista. Se não souber a resposta, diga que não tem essa informação e sugira contactar a loja directamente. Nunca fale de assuntos fora deste negócio.

Endereço: ${empresa.endereco || "não indicado"}
Cidade: ${empresa.cidade || "não indicada"}
Contacto: ${empresa.contacto || "não indicado"}

Produtos disponíveis:
${catalogo}`;

  try {
    const reply = await askGroq(systemPrompt, parsed.data.history);
    res.json({ reply });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
});
