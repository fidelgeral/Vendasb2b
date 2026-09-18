import { useState } from "react";
import { BG, CARD, BORDER, INK, TEAL, MUTED, BRICK } from "../lib/theme.js";
import { BRAND_NAME, BRAND_TAGLINE } from "../lib/theme.js";
import { BRAND_LOGO } from "../lib/logo.js";
import { auth, setSession } from "../lib/api.js";

export default function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("negocio");

  return (
    <div style={{ background: BG, color: INK, fontFamily: "system-ui, sans-serif" }} className="min-h-screen flex items-center justify-center p-6">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-6 w-full max-w-sm">
        <div className="text-center mb-4">
          <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: 54 }} className="mx-auto mb-2" />
          <div className="text-xs" style={{ color: MUTED }}>
            {BRAND_TAGLINE}
          </div>
        </div>

        <div className="flex gap-1.5 mb-4">
          <button
            onClick={() => setMode("negocio")}
            style={{ background: mode === "negocio" ? TEAL : "transparent", color: mode === "negocio" ? "#fff" : MUTED, borderColor: BORDER }}
            className="flex-1 border rounded px-3 py-1.5 text-xs font-medium"
          >
            Sou um negócio
          </button>
          <button
            onClick={() => setMode("super")}
            style={{ background: mode === "super" ? TEAL : "transparent", color: mode === "super" ? "#fff" : MUTED, borderColor: BORDER }}
            className="flex-1 border rounded px-3 py-1.5 text-xs font-medium"
          >
            Administrador
          </button>
        </div>

        {mode === "negocio" ? <BusinessLoginForm onLogin={onLogin} /> : <SuperLoginForm onLogin={onLogin} />}
      </div>
    </div>
  );
}

function BusinessLoginForm({ onLogin }) {
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!slug.trim() || !email.trim() || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await auth.login(slug.trim(), email.trim(), password);
      setSession(res.token, { type: "employee", businessId: res.business.id, businessName: res.business.name, employeeId: res.employee.id, employeeName: res.employee.name, role: res.employee.role, slug: slug.trim() });
      onLogin();
    } catch (err) {
      setError(err.message || "Não foi possível entrar.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Código do negócio</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ex: padaria-da-maria" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
      </div>
      {error && <div className="text-xs" style={{ color: BRICK }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ background: TEAL, color: "#fff" }} className="w-full rounded py-2 text-sm font-medium disabled:opacity-50">
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
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
      </div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
      </div>
      {error && <div className="text-xs" style={{ color: BRICK }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ background: TEAL, color: "#fff" }} className="w-full rounded py-2 text-sm font-medium disabled:opacity-50">
        {loading ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
