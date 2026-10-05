import { useState } from "react";
import { CARD, BORDER, INK, TEAL, MUTED, BRICK, GRADIENT } from "../lib/theme.js";
import { BRAND_NAME, BRAND_TAGLINE } from "../lib/theme.js";
import { BRAND_LOGO } from "../lib/logo.js";
import { auth, setSession } from "../lib/api.js";

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
            <button
              onClick={() => setMode("negocio")}
              style={{ background: mode === "negocio" ? CARD : "transparent", color: mode === "negocio" ? TEAL : MUTED, boxShadow: mode === "negocio" ? "0 1px 4px rgba(15,23,42,0.12)" : "none" }}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold"
            >
              Sou um negócio
            </button>
            <button
              onClick={() => setMode("super")}
              style={{ background: mode === "super" ? CARD : "transparent", color: mode === "super" ? TEAL : MUTED, boxShadow: mode === "super" ? "0 1px 4px rgba(15,23,42,0.12)" : "none" }}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold"
            >
              Administrador
            </button>
          </div>

          {mode === "negocio" ? <BusinessLoginForm onLogin={onLogin} /> : <SuperLoginForm onLogin={onLogin} />}
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
      setSession(res.token, { type: "employee", businessId: res.business.id, businessName: res.business.name, employeeId: res.employee.id, employeeName: res.employee.name, role: res.employee.role });
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
