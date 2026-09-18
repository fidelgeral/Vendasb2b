import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, BRICK } from "../lib/theme.js";
import { auth, setSession } from "../lib/api.js";

// Troca rápida de utilizador: a pessoa introduz o seu próprio email/senha —
// substitui o selector de nomes do protótipo original por segurança (evita
// expor a lista de funcionários sem autenticação).
export default function SwitchUserModal({ slug, onSwitched, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await auth.login(slug, email.trim(), password);
      setSession(res.token, { type: "employee", businessId: res.business.id, businessName: res.business.name, employeeId: res.employee.id, employeeName: res.employee.name, role: res.employee.role, slug });
      onSwitched();
    } catch (err) {
      setError(err.message || "Não foi possível entrar.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form onSubmit={submit} style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-1">Trocar de utilizador</div>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm" autoFocus />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm" />
        {error && <div className="text-xs" style={{ color: BRICK }}>{error}</div>}
        <div className="flex gap-2">
          <button type="submit" disabled={loading} style={{ background: TEAL, color: "#fff" }} className="flex-1 rounded py-1.5 text-sm disabled:opacity-50">
            {loading ? "A entrar…" : "Entrar"}
          </button>
          <button type="button" onClick={onClose} style={{ borderColor: BORDER }} className="border rounded py-1.5 px-3 text-sm">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
