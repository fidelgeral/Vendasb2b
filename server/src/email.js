const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","tempmail.com","throwaway.email","yopmail.com",
  "sharklasers.com","guerrillamailblock.com","grr.la","dispostable.com","maildrop.cc",
  "mailnesia.com","tempail.com","temp-mail.org","fakeinbox.com","trashmail.com",
  "10minutemail.com","minutemail.com","emailondeck.com","getnada.com","mohmal.com",
  "harakirimail.com","mailsac.com","burnermail.io","inboxbear.com","tempinbox.com",
  "mytemp.email","tempr.email","discard.email","mailcatch.com","tmail.ws",
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

export async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) return { skipped: true };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "VENDASB2B <onboarding@resend.dev>",
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

export function welcomeBusinessEmail({ ownerName, businessName, email, password, plan, monthlyFee }) {
  const planLabel = plan || "básico";
  const feeLabel = monthlyFee ? new Intl.NumberFormat("pt-MZ").format(monthlyFee) + " MT/mês" : "A definir";
  const appUrl = process.env.APP_URL || "https://vendasb2b.vercel.app";
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
    <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
      <div style="font-size:22px;font-weight:bold">VENDASB2B</div>
      <div style="font-size:13px;opacity:.85">Bem-vindo ao sistema</div>
    </div>
    <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      <p>Olá <strong>${esc(ownerName)}</strong>,</p>
      <p>A sua conta de negócio <strong>${esc(businessName)}</strong> foi criada com sucesso!</p>
      <div style="background:#F8FAFC;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:4px 0;font-size:14px;font-weight:bold;color:#4F46E5">Dados de acesso</p>
        <p style="margin:4px 0"><strong>Email:</strong> ${esc(email)}</p>
        <p style="margin:4px 0"><strong>Senha:</strong> <code style="background:#E0E7FF;padding:2px 8px;border-radius:4px;font-size:16px;letter-spacing:1px">${esc(password)}</code></p>
      </div>
      <div style="background:#F0FDF4;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:4px 0;font-size:14px;font-weight:bold;color:#059669">Plano da conta</p>
        <p style="margin:4px 0"><strong>Plano:</strong> ${esc(planLabel)}</p>
        <p style="margin:4px 0"><strong>Valor:</strong> ${esc(feeLabel)}</p>
      </div>
      <div style="text-align:center;margin:20px 0">
        <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;font-size:15px">Aceder ao sistema</a>
      </div>
      <p style="color:#64748B;font-size:12px">Recomendamos que altere a sua senha após o primeiro login.</p>
    </div>
  </div>`;
}

export function demoBizEmail({ ownerName, businessName, email, password, representative }) {
  const appUrl = process.env.APP_URL || "https://vendasb2b.vercel.app";
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
    <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
      <div style="font-size:22px;font-weight:bold">VENDASB2B</div>
      <div style="font-size:13px;opacity:.85">Conta Demonstração</div>
    </div>
    <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      <p>Olá <strong>${esc(ownerName)}</strong>,</p>
      <p>A sua conta demonstração foi criada com sucesso! Tem <strong>3 dias</strong> para avaliar o sistema gratuitamente.</p>
      <div style="background:#F8FAFC;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:4px 0;font-size:14px;font-weight:bold;color:#4F46E5">Dados de acesso</p>
        <p style="margin:4px 0"><strong>Negócio:</strong> ${esc(businessName)}</p>
        <p style="margin:4px 0"><strong>Email:</strong> ${esc(email)}</p>
        <p style="margin:4px 0"><strong>Senha:</strong> <code style="background:#E0E7FF;padding:2px 8px;border-radius:4px;font-size:16px;letter-spacing:1px">${esc(password)}</code></p>
      </div>
      <div style="background:#FFF7ED;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:4px 0;font-size:14px;font-weight:bold;color:#EA580C">Plano</p>
        <p style="margin:4px 0"><strong>Tipo:</strong> Demonstração gratuita (3 dias)</p>
        <p style="margin:4px 0"><strong>Após expirar:</strong> Contacte o representante para activar a subscrição</p>
        <p style="margin:4px 0"><strong>Representante:</strong> ${esc(representative)}</p>
      </div>
      <div style="text-align:center;margin:20px 0">
        <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;font-size:15px">Experimentar agora</a>
      </div>
      <p style="color:#64748B;font-size:12px">Representante: ${esc(representative)}</p>
    </div>
  </div>`;
}
