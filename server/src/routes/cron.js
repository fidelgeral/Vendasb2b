import { Router } from "express";
import { query } from "../db.js";

export const cronRouter = Router();

// Protege os endpoints de cron com um segredo partilhado (CRON_SECRET), para
// que só o agendador do GitHub Actions os possa chamar.
cronRouter.use((req, res, next) => {
  const secret = req.headers["x-cron-secret"] || req.query.secret;
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(403).json({ error: "Acesso negado." });
  }
  next();
});

async function sendEmail(to, subject, html) {
  if (!process.env.BREVO_API_KEY) return { skipped: true };
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": process.env.BREVO_API_KEY },
    body: JSON.stringify({
      sender: { name: "VENDASB2B", email: process.env.BREVO_SENDER || "no-reply@vendasb2b.co.mz" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error("Brevo " + res.status + " " + t);
  }
  return { ok: true };
}

// Monta e envia o resumo do dia de cada negócio activo para o email do dono.
cronRouter.post("/daily-summary", async (req, res) => {
  const businesses = (
    await query("SELECT id, name, config FROM businesses WHERE active = true AND subscription_status <> 'suspenso'")
  ).rows;

  let enviados = 0;
  const erros = [];

  for (const biz of businesses) {
    // email do dono
    // eslint-disable-next-line no-await-in-loop
    const dono = (await query("SELECT email FROM employees WHERE business_id = $1 AND role = 'dono' AND active = true ORDER BY created_at LIMIT 1", [biz.id])).rows[0];
    if (!dono?.email) continue;

    // vendas de hoje
    // eslint-disable-next-line no-await-in-loop
    const vendas = (
      await query(
        `SELECT s.id, s.total, s.discount, s.payments
         FROM sales s WHERE s.business_id = $1 AND s.voided = false AND s.created_at::date = CURRENT_DATE`,
        [biz.id]
      )
    ).rows;
    // eslint-disable-next-line no-await-in-loop
    const itens = (
      await query(
        `SELECT si.name_snapshot AS name, si.qty, si.price, si.cost
         FROM sale_items si JOIN sales s ON s.id = si.sale_id
         WHERE s.business_id = $1 AND s.voided = false AND s.created_at::date = CURRENT_DATE`,
        [biz.id]
      )
    ).rows;
    // eslint-disable-next-line no-await-in-loop
    const dividasRow = (await query("SELECT COALESCE(SUM(amount),0) AS total FROM client_debts d JOIN clients c ON c.id = d.client_id WHERE c.business_id = $1", [biz.id])).rows[0];

    const faturacao = vendas.reduce((a, s) => a + Number(s.total), 0);
    const lucro = itens.reduce((a, it) => a + (Number(it.price) - Number(it.cost)) * Number(it.qty), 0);
    const topAgg = {};
    itens.forEach((it) => (topAgg[it.name] = (topAgg[it.name] || 0) + Number(it.qty)));
    const top = Object.entries(topAgg).sort((a, b) => b[1] - a[1])[0];
    const dividas = Number(dividasRow.total);

    if (vendas.length === 0) continue; // não envia em dias sem vendas

    const fmt = (n) => new Intl.NumberFormat("pt-MZ").format(Math.round(n)) + " MT";
    const nome = biz.config?.businessName || biz.name;
    const hoje = new Date().toLocaleDateString("pt-PT");
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED,#DB2777);color:#fff;padding:16px;border-radius:12px 12px 0 0">
          <div style="font-size:12px;opacity:.85">VENDASB2B · resumo do dia</div>
          <div style="font-size:20px;font-weight:bold">${nome}</div>
          <div style="font-size:12px;opacity:.85">${hoje}</div>
        </div>
        <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:16px">
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:6px 0">Nº de vendas</td><td style="text-align:right;font-weight:bold">${vendas.length}</td></tr>
            <tr><td style="padding:6px 0">Facturação</td><td style="text-align:right;font-weight:bold;color:#4F46E5">${fmt(faturacao)}</td></tr>
            <tr><td style="padding:6px 0">Lucro estimado</td><td style="text-align:right;font-weight:bold;color:#059669">${fmt(lucro)}</td></tr>
            <tr><td style="padding:6px 0">Produto mais vendido</td><td style="text-align:right">${top ? top[0] + " (" + top[1] + ")" : "—"}</td></tr>
            <tr><td style="padding:6px 0">Dívidas de clientes (total)</td><td style="text-align:right">${fmt(dividas)}</td></tr>
          </table>
          <div style="color:#64748B;font-size:11px;margin-top:12px">Resumo automático enviado pelo VENDASB2B.</div>
        </div>
      </div>`;

    try {
      // eslint-disable-next-line no-await-in-loop
      await sendEmail(dono.email, `Resumo do dia — ${nome} (${hoje})`, html);
      enviados++;
    } catch (e) {
      erros.push(biz.name + ": " + e.message);
    }
  }

  res.json({ enviados, erros });
});
