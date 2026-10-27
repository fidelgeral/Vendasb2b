import { useState } from "react";
import { CARD, BORDER, INK, TEAL, MUTED, BRICK, GRADIENT } from "../lib/theme.js";
import { BRAND_NAME, BRAND_TAGLINE } from "../lib/theme.js";
import { BRAND_LOGO } from "../lib/logo.js";
import { auth, setSession, setRefreshToken } from "../lib/api.js";

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("negocio");

  return (
    <div style={{ background: GRADIENT, color: INK, fontFamily: "system-ui, sans-serif" }} className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-5 text-white">
          <div className="inline-block bg-white rounded-2xl p-2.5 shadow-lg mb-3">
            <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: 52 }} className="block" />
          </div>
          <div className="text-2xl font-extrabold tracking-tight">Bem-vindo de volta</div>
          <div className="text-sm opacity-85">{BRAND_TAGLINE}</div>
        </div>

        <div style={{ background: CARD }} className="rounded-2xl p-6 shadow-2xl">
          <div style={{ background: "#F1F5F9" }} className="flex gap-1 mb-5 p-1 rounded-xl">
            {[
              { id: "negocio", label: "Sou um negócio" },
              { id: "super", label: "Administrador" },
              { id: "demo", label: "Experimentar" },
            ].map((t) => (
              <button key={t.id} onClick={() => setMode(t.id)}
                style={{ background: mode === t.id ? CARD : "transparent", color: mode === t.id ? TEAL : MUTED, boxShadow: mode === t.id ? "0 1px 4px rgba(15,23,42,0.12)" : "none" }}
                className="flex-1 rounded-lg px-2 py-2 text-xs font-semibold">
                {t.label}
              </button>
            ))}
          </div>

          {mode === "negocio" && <BusinessLoginForm onLogin={onLogin} />}
          {mode === "super" && <SuperLoginForm onLogin={onLogin} />}
          {mode === "demo" && <DemoForm />}
        </div>
        <div className="text-center text-xs text-white/70 mt-4">© {new Date().getFullYear()} {BRAND_NAME}</div>
      </div>
    </div>
  );
}

function BusinessLoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await auth.login(email.trim(), password);
      setSession(res.token, { type: "employee", businessId: res.business.id, businessName: res.business.name, employeeId: res.employee.id, employeeName: res.employee.name, role: res.employee.role, filiais: res.filiais || [] });
      onLogin();
    } catch (err) {
      setError(err.message || "Não foi possível entrar.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
      </div>
      {error && <div className="text-xs" style={{ color: BRICK }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ background: GRADIENT, color: "#fff", boxShadow: "0 6px 16px rgba(79,70,229,0.35)" }} className="w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-50">
        {loading ? "A entrar…" : "Entrar"}
      </button>
      <div className="text-center mt-2">
        <button type="button" onClick={() => setShowReset(true)} className="text-xs underline" style={{ color: TEAL }}>Esqueci a minha senha</button>
      </div>
      {showReset && <ResetPasswordModal email={email} onClose={() => setShowReset(false)} />}
    </form>
  );
}

function ResetPasswordModal({ email: initialEmail, onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!email.trim()) { setError("Insira o seu email."); return; }
    setLoading(true); setError("");
    try {
      await auth.forgotPassword(email.trim());
      setStep(2);
      setSuccess("Se o email existir, enviámos um código de 6 dígitos.");
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const resetPwd = async () => {
    if (!code.trim() || !newPassword) { setError("Preencha todos os campos."); return; }
    setLoading(true); setError("");
    try {
      await auth.resetPassword(email.trim(), code.trim(), newPassword);
      setSuccess("Senha alterada com sucesso! Pode fazer login.");
      setStep(3);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-bold mb-3" style={{ color: INK }}>Recuperar senha</div>
        {step === 1 && (
          <>
            <p className="text-xs mb-3" style={{ color: MUTED }}>Insira o email da sua conta para receber um código de recuperação.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mb-2" />
            {error && <div className="text-xs mb-2" style={{ color: BRICK }}>{error}</div>}
            <button onClick={sendCode} disabled={loading} style={{ background: TEAL, color: "#fff" }} className="w-full rounded-xl py-2 text-sm font-bold disabled:opacity-50">{loading ? "A enviar…" : "Enviar código"}</button>
          </>
        )}
        {step === 2 && (
          <>
            {success && <div className="text-xs mb-2" style={{ color: "#059669" }}>{success}</div>}
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Código de 6 dígitos" maxLength={6} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mb-2 text-center tracking-widest text-lg font-bold" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha (min. 6 chars, letras + números)" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mb-2" />
            {error && <div className="text-xs mb-2" style={{ color: BRICK }}>{error}</div>}
            <button onClick={resetPwd} disabled={loading} style={{ background: TEAL, color: "#fff" }} className="w-full rounded-xl py-2 text-sm font-bold disabled:opacity-50">{loading ? "A redefinir…" : "Redefinir senha"}</button>
          </>
        )}
        {step === 3 && (
          <>
            <div className="text-xs mb-3 text-center" style={{ color: "#059669" }}>{success}</div>
            <button onClick={onClose} style={{ background: TEAL, color: "#fff" }} className="w-full rounded-xl py-2 text-sm font-bold">Fechar</button>
          </>
        )}
        {step !== 3 && <button onClick={onClose} className="w-full text-xs mt-2 underline" style={{ color: MUTED }}>Cancelar</button>}
      </div>
    </div>
  );
}

function DemoForm() {
  const [form, setForm] = useState({ businessName: "", ownerName: "", email: "", phone: "", representative: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.ownerName.trim() || !form.email.trim()) {
      setError("Preencha o nome do negócio, o seu nome e o email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await auth.createDemo(form);
      setSuccess(res);
    } catch (err) {
      setError(err.message || "Erro ao criar conta.");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="space-y-3 text-center">
        <div className="text-2xl">🎉</div>
        <div className="text-sm font-bold" style={{ color: INK }}>Conta demonstração criada!</div>
        <div className="text-xs" style={{ color: MUTED }}>A conta é válida por 3 dias. Use os dados abaixo para entrar:</div>
        <div style={{ background: "#F1F5F9", borderColor: BORDER }} className="border rounded-lg p-3 text-left space-y-1">
          <div className="text-xs"><strong>Email:</strong> {success.email}</div>
          <div className="text-xs"><strong>Senha:</strong> {success.password}</div>
          <div className="text-xs"><strong>Negócio:</strong> {success.businessName}</div>
        </div>
        <div className="text-xs" style={{ color: MUTED }}>Guarde estes dados. Também enviámos por email (se configurado).</div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div className="text-xs text-center mb-2" style={{ color: MUTED }}>
        Crie uma conta gratuita por 3 dias para avaliar o sistema.
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Nome do negócio</label>
        <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" placeholder="Ex: Padaria do João" />
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Seu nome completo</label>
        <input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Telefone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" placeholder="Ex: 84 123 4567" />
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Nome do representante VendasB2B</label>
        <input value={form.representative} onChange={(e) => setForm({ ...form, representative: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" placeholder="Quem lhe apresentou o sistema?" />
      </div>
      {error && <div className="text-xs" style={{ color: BRICK }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ background: GRADIENT, color: "#fff", boxShadow: "0 6px 16px rgba(79,70,229,0.35)" }} className="w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-50">
        {loading ? "A criar…" : "Criar conta demonstração"}
      </button>
    </form>
  );
}

function SuperLoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Preencha email e senha.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await auth.superLogin(email.trim(), password);
      setSession(res.token, { type: "super", adminEmail: res.admin.email });
      onLogin();
    } catch (err) {
      setError(err.message || "Não foi possível entrar.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Email do administrador</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
      </div>
      {error && <div className="text-xs" style={{ color: BRICK }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ background: GRADIENT, color: "#fff", boxShadow: "0 6px 16px rgba(79,70,229,0.35)" }} className="w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-50">
        {loading ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
