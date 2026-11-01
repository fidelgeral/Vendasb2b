import dns from "node:dns/promises";

const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","tempmail.com","throwaway.email","yopmail.com",
  "sharklasers.com","guerrillamailblock.com","grr.la","dispostable.com","maildrop.cc",
  "mailnesia.com","tempail.com","temp-mail.org","fakeinbox.com","trashmail.com",
  "10minutemail.com","minutemail.com","emailondeck.com","getnada.com","mohmal.com",
  "harakirimail.com","mailsac.com","burnermail.io","inboxbear.com","tempinbox.com",
  "mytemp.email","tempr.email","discard.email","mailcatch.com","tmail.ws",
  "guerrillamail.info","guerrillamail.net","guerrillamail.de","guerrillamail.biz",
  "tempmailo.com","temp-mail.io","emailfake.com","crazymailing.com","armyspy.com",
  "dayrep.com","einrot.com","fleckens.hu","gustr.com","jourrapide.com","rhyta.com",
  "superrito.com","teleworm.us","tempmailaddress.com","trash-mail.com","trashmail.net",
  "trashmail.org","wegwerfmail.de","wegwerfmail.net","mytrashmail.com","mt2015.com",
  "thankyou2010.com","trash2009.com","binkmail.com","bobmail.info","chammy.info",
  "devnullmail.com","jetable.org","mailexpire.com","mailforspam.com","mailmoat.com",
  "mailnull.com","mailshell.com","mailzilla.com","nomail.xl.cx","nowmymail.com",
  "spambox.us","spamfree24.org","spamgourmet.com","spamhole.com","spaml.com",
  "uggsrock.com","mailtemp.info","tempinbox.co.uk","tempomail.fr","disposableemailaddresses.emailmiser.com",
]);

export function isDisposableEmail(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;
  return DISPOSABLE_DOMAINS.has(domain);
}

export function isValidEmailFormat(email) {
  if (!email || typeof email !== "string") return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  if (!domain || domain.length < 4) return false;
  const domainParts = domain.split(".");
  if (domainParts.length < 2) return false;
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;
  return true;
}

export async function hasValidMxRecords(email) {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch {
    return false;
  }
}

export async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "VENDASB2B <vendasb2b.geral@gmail.com>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error("Resend " + res.status + " " + t);
  }
  return { ok: true };
}

export const PLANOS = [
  {
    id: "basico", nome: "Básico", mensal: 1199, anual: 10000,
    treinamento: { presencial: 2500, presencialLabel: "2.500 MT/pessoa", online: "Grátis" },
    recursos: ["POS de vendas completo", "Gestão de stock", "Até 2 utilizadores", "Relatórios básicos", "Leitor de código de barras", "Suporte por WhatsApp"],
  },
  {
    id: "profissional", nome: "Profissional", mensal: 1999, anual: 15499,
    treinamento: { presencial: 3500, presencialLabel: "3.500 MT/pessoa", online: "Grátis" },
    recursos: ["Tudo do Básico +", "Até 5 utilizadores", "Relatórios avançados (DRE, Balanço)", "Gestão de clientes e dívidas", "Contas a pagar", "Programa de fidelidade", "Cotações e orçamentos", "Exportação PDF e Excel"],
  },
  {
    id: "vitalicio", nome: "Vitalício", mensal: null, anual: null, unico: 85000,
    treinamento: { presencial: 10000, presencialLabel: "10.000 MT (grupo, opcional)", online: "Grátis" },
    recursos: ["Tudo do Profissional +", "Utilizadores ilimitados", "Multi-filial com transferência de stock", "Processamento de salários", "Assistente IA", "Funciona offline (PWA)", "Resumo diário por email", "Suporte prioritário", "Sem mensalidade — pague uma vez, use para sempre"],
  },
];

function fmt(n) { return new Intl.NumberFormat("pt-MZ").format(n); }

function emailWrapper(content) {
  return `<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;background:#fff">
  <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED,#DB2777);color:#fff;padding:28px 24px;border-radius:12px 12px 0 0;text-align:center">
    <div style="font-size:26px;font-weight:bold;letter-spacing:1px">VENDASB2B</div>
    <div style="font-size:13px;opacity:.85;margin-top:4px">Sistema de Gestão de Vendas e Stock</div>
  </div>
  <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:28px 24px">
    ${content}
  </div>
  <div style="text-align:center;padding:16px;font-size:11px;color:#9CA3AF">
    © ${new Date().getFullYear()} VENDASB2B — Moçambique · vendasb2b.vercel.app
  </div>
</div>`;
}

function vantagensHtml() {
  return `<div style="margin:20px 0">
  <div style="font-size:15px;font-weight:bold;color:#1E293B;margin-bottom:12px">Porquê escolher o VENDASB2B?</div>
  <table style="width:100%;font-size:13px;color:#374151;border-collapse:collapse">
    <tr><td style="padding:6px 0;vertical-align:top">✅</td><td style="padding:6px 8px"><strong>Vendas rápidas</strong> — POS completo com leitor de código de barras, múltiplos métodos de pagamento e recibos profissionais</td></tr>
    <tr><td style="padding:6px 0;vertical-align:top">📦</td><td style="padding:6px 8px"><strong>Controlo total do stock</strong> — lotes com validade, alertas de stock baixo, transferência entre filiais</td></tr>
    <tr><td style="padding:6px 0;vertical-align:top">📊</td><td style="padding:6px 8px"><strong>Relatórios inteligentes</strong> — DRE, balanço, lucros, exportação para PDF e Excel</td></tr>
    <tr><td style="padding:6px 0;vertical-align:top">👥</td><td style="padding:6px 8px"><strong>Gestão de equipa</strong> — permissões granulares, turnos de caixa, processamento de salários</td></tr>
    <tr><td style="padding:6px 0;vertical-align:top">🏪</td><td style="padding:6px 8px"><strong>Multi-filial</strong> — gerencie várias lojas numa só conta, com transferência de stock entre elas</td></tr>
    <tr><td style="padding:6px 0;vertical-align:top">📱</td><td style="padding:6px 8px"><strong>Funciona offline</strong> — continue a vender mesmo sem internet, sincroniza quando voltar</td></tr>
    <tr><td style="padding:6px 0;vertical-align:top">🤖</td><td style="padding:6px 8px"><strong>Assistente IA</strong> — pergunte qualquer coisa sobre o seu negócio em linguagem natural</td></tr>
    <tr><td style="padding:6px 0;vertical-align:top">🔒</td><td style="padding:6px 8px"><strong>Seguro e fiável</strong> — dados na cloud, backups automáticos, acesso de qualquer dispositivo</td></tr>
  </table>
</div>`;
}

function precoHtml(plano) {
  if (plano.unico) return `<strong>${fmt(plano.unico)} MT</strong> (pagamento único — vitalício)`;
  return `<strong>${fmt(plano.mensal)} MT/mês</strong> ou <strong>${fmt(plano.anual)} MT/ano</strong>`;
}

function pagamentoHtml(plano) {
  const whatsLink = "https://wa.me/258861132245";
  return `<div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:10px;padding:18px;margin:20px 0">
  <div style="font-size:14px;font-weight:bold;color:#92400E;margin-bottom:8px">💳 Como pagar</div>
  <div style="font-size:13px;color:#78350F;line-height:1.6">
    <p style="margin:0 0 8px"><strong>Plano:</strong> ${esc(plano.nome)} — ${precoHtml(plano)}</p>
    <p style="margin:0 0 4px"><strong>Treinamento presencial:</strong> ${esc(plano.treinamento.presencialLabel)} · <strong>Online:</strong> ${esc(plano.treinamento.online)}</p>
    <p style="margin:8px 0 6px">Faça a transferência por:</p>
    <div style="background:#FFF;border-radius:6px;padding:10px;margin:6px 0">
      <p style="margin:2px 0"><strong>📲 M-Pesa:</strong> <code style="background:#E0E7FF;padding:2px 6px;border-radius:3px;font-size:14px">845508667</code></p>
      <p style="margin:2px 0"><strong>📲 E-Mola:</strong> <code style="background:#E0E7FF;padding:2px 6px;border-radius:3px;font-size:14px">861132245</code></p>
    </div>
    <p style="margin:8px 0 4px">Após a transferência:</p>
    <ol style="margin:0;padding-left:18px">
      <li>Tire um <strong>print/screenshot</strong> do comprovativo</li>
      <li>Envie pelo sistema (secção Mensalidade) <strong>ou</strong> pelo WhatsApp:</li>
    </ol>
    <div style="text-align:center;margin:10px 0">
      <a href="${whatsLink}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:bold;font-size:14px">📱 Enviar pelo WhatsApp: 861132245</a>
    </div>
    <p style="margin:4px 0;font-size:12px;color:#92400E">A sua conta será activada em até 24 horas após confirmação do pagamento.</p>
  </div>
</div>`;
}

export function welcomeBusinessEmail({ ownerName, businessName, email, password, plan, monthlyFee }) {
  const plano = PLANOS.find((p) => p.id === plan) || PLANOS[0];
  const appUrl = process.env.APP_URL || "https://vendasb2b.vercel.app";
  return emailWrapper(`
    <p style="font-size:15px;color:#1E293B">Olá <strong>${esc(ownerName)}</strong>,</p>
    <p style="font-size:14px;color:#374151;line-height:1.6">Bem-vindo ao <strong>VENDASB2B</strong> — o sistema de gestão de vendas e stock mais completo de Moçambique! A sua conta <strong>${esc(businessName)}</strong> foi criada com sucesso.</p>

    <div style="background:#F0F4FF;border:1px solid #C7D2FE;border-radius:10px;padding:18px;margin:20px 0">
      <div style="font-size:14px;font-weight:bold;color:#4F46E5;margin-bottom:8px">🔑 Dados de acesso</div>
      <table style="font-size:13px;color:#374151">
        <tr><td style="padding:3px 0"><strong>Email:</strong></td><td style="padding:3px 8px">${esc(email)}</td></tr>
        <tr><td style="padding:3px 0"><strong>Senha:</strong></td><td style="padding:3px 8px"><code style="background:#E0E7FF;padding:2px 8px;border-radius:4px;font-size:15px;letter-spacing:1px">${esc(password)}</code></td></tr>
      </table>
    </div>

    <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:18px;margin:20px 0">
      <div style="font-size:14px;font-weight:bold;color:#059669;margin-bottom:8px">📋 O seu plano</div>
      <table style="font-size:13px;color:#374151">
        <tr><td style="padding:3px 0"><strong>Plano:</strong></td><td style="padding:3px 8px">${esc(plano.nome)}</td></tr>
        <tr><td style="padding:3px 0"><strong>Valor:</strong></td><td style="padding:3px 8px">${precoHtml(plano)}</td></tr>
        <tr><td style="padding:3px 0"><strong>Treinamento presencial:</strong></td><td style="padding:3px 8px">${esc(plano.treinamento.presencialLabel)}</td></tr>
        <tr><td style="padding:3px 0"><strong>Treinamento online:</strong></td><td style="padding:3px 8px">${esc(plano.treinamento.online)}</td></tr>
      </table>
    </div>

    ${vantagensHtml()}
    ${pagamentoHtml(plano)}

    <div style="text-align:center;margin:24px 0">
      <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;padding:14px 40px;border-radius:10px;font-weight:bold;font-size:16px;box-shadow:0 4px 12px rgba(79,70,229,0.3)">Aceder ao VENDASB2B →</a>
    </div>

    <p style="color:#64748B;font-size:12px;text-align:center">Recomendamos que altere a sua senha após o primeiro login.</p>
  `);
}

export function demoBizEmail({ ownerName, businessName, email, password, representative, plan }) {
  const plano = PLANOS.find((p) => p.id === plan);
  const appUrl = process.env.APP_URL || "https://vendasb2b.vercel.app";
  return emailWrapper(`
    <p style="font-size:15px;color:#1E293B">Olá <strong>${esc(ownerName)}</strong>,</p>
    <p style="font-size:14px;color:#374151;line-height:1.6">A sua conta demonstração do <strong>VENDASB2B</strong> foi criada! Tem <strong>3 dias gratuitos</strong> para experimentar todas as funcionalidades do sistema de gestão de vendas mais completo de Moçambique.</p>

    <div style="background:#F0F4FF;border:1px solid #C7D2FE;border-radius:10px;padding:18px;margin:20px 0">
      <div style="font-size:14px;font-weight:bold;color:#4F46E5;margin-bottom:8px">🔑 Dados de acesso</div>
      <table style="font-size:13px;color:#374151">
        <tr><td style="padding:3px 0"><strong>Negócio:</strong></td><td style="padding:3px 8px">${esc(businessName)}</td></tr>
        <tr><td style="padding:3px 0"><strong>Email:</strong></td><td style="padding:3px 8px">${esc(email)}</td></tr>
        <tr><td style="padding:3px 0"><strong>Senha:</strong></td><td style="padding:3px 8px"><code style="background:#E0E7FF;padding:2px 8px;border-radius:4px;font-size:15px;letter-spacing:1px">${esc(password)}</code></td></tr>
      </table>
    </div>

    ${vantagensHtml()}

    <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:10px;padding:18px;margin:20px 0">
      <div style="font-size:14px;font-weight:bold;color:#92400E;margin-bottom:8px">⏰ Período de teste: 3 dias</div>
      <p style="font-size:13px;color:#78350F;margin:0 0 8px">Aproveite para testar todas as funcionalidades sem compromisso. Após o período de teste, escolha o plano ideal para o seu negócio:</p>
      <table style="width:100%;font-size:12px;border-collapse:collapse;color:#374151">
        ${PLANOS.map((p) => `<tr style="border-bottom:1px solid #FDE68A"><td style="padding:6px 0;font-weight:bold">${esc(p.nome)}</td><td style="padding:6px 4px;text-align:right;white-space:nowrap">${p.unico ? `<strong>${fmt(p.unico)} MT</strong> (único)` : `<strong>${fmt(p.mensal)} MT/mês</strong> ou ${fmt(p.anual)} MT/ano`}</td><td style="padding:6px 0 6px 8px;color:#78350F">Trein. presencial: ${esc(p.treinamento.presencialLabel)}</td></tr>`).join("")}
      </table>
    </div>

    ${plano ? pagamentoHtml(plano) : `<div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:10px;padding:18px;margin:20px 0">
      <div style="font-size:14px;font-weight:bold;color:#92400E;margin-bottom:8px">💳 Pagamento</div>
      <div style="font-size:13px;color:#78350F;line-height:1.6">
        <p style="margin:0 0 6px">Quando estiver pronto para activar, faça a transferência por:</p>
        <div style="background:#FFF;border-radius:6px;padding:10px;margin:6px 0">
          <p style="margin:2px 0"><strong>📲 M-Pesa:</strong> <code style="background:#E0E7FF;padding:2px 6px;border-radius:3px;font-size:14px">845508667</code></p>
          <p style="margin:2px 0"><strong>📲 E-Mola:</strong> <code style="background:#E0E7FF;padding:2px 6px;border-radius:3px;font-size:14px">861132245</code></p>
        </div>
        <p style="margin:8px 0 4px">Envie o comprovativo pelo sistema ou WhatsApp:</p>
        <div style="text-align:center;margin:10px 0">
          <a href="https://wa.me/258861132245" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:bold;font-size:14px">📱 WhatsApp: 861132245</a>
        </div>
      </div>
    </div>`}

    <p style="font-size:13px;color:#475569;margin:16px 0">Representante: <strong>${esc(representative)}</strong> — contacte-o para qualquer dúvida sobre activação ou planos.</p>

    <div style="text-align:center;margin:24px 0">
      <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;padding:14px 40px;border-radius:10px;font-weight:bold;font-size:16px;box-shadow:0 4px 12px rgba(79,70,229,0.3)">Experimentar agora →</a>
    </div>

    <p style="color:#64748B;font-size:12px;text-align:center">Não perca esta oportunidade — simplifique a gestão do seu negócio com o VENDASB2B!</p>
  `);
}
