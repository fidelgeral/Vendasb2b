import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, BRICK, GREEN } from "../lib/theme.js";
import { ROLE_LABELS } from "../lib/utils.js";

export default function EquipaTab({ store, setStore, api }) {
  const blank = { name: "", email: "", phone: "", password: "", role: "caixa", docId: "" };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return "Indique o nome completo.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Indique um email válido.";
    if (!editingId && form.password.length < 4) return "A senha deve ter pelo menos 4 caracteres.";
    const dup = store.employees.find((e) => e.email && e.email.toLowerCase() === form.email.trim().toLowerCase() && e.id !== editingId);
    if (dup) return "Já existe uma conta com esse email.";
    return "";
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    const payload = {
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role, docId: form.docId.trim(),
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (editingId) {
        setStore(await api.updateEmployee(editingId, payload));
        setEditingId(null);
      } else {
        setStore(await api.createEmployee(payload));
      }
      setForm(blank);
    } catch (e) {
      setError(e.message);
    }
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setForm({ name: e.name || "", email: e.email || "", phone: e.phone || "", password: "", role: e.role || "caixa", docId: e.docId || "" });
    setError("");
  };
  const removeEmployee = async (id) => setStore(await api.deleteEmployee(id));
  const toggleActive = async (id) => setStore(await api.toggleEmployeeActive(id));

  return (
    <div className="space-y-4">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-4">
        <div className="text-sm font-semibold mb-3">{editingId ? "Editar conta de utilizador" : "Nova conta de utilizador"}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="sm:col-span-2">
            <label className="text-xs" style={{ color: MUTED }}>Nome completo *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Maria João Cossa" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nome@empresa.co.mz" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Telefone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+258 84 000 0000" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Nº de documento</label>
            <input value={form.docId} onChange={(e) => setForm({ ...form, docId: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Função</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
              <option value="dono">Administrador</option>
              <option value="gerente">Gerente</option>
              <option value="caixa">Operador de Caixa</option>
              <option value="cozinha">Cozinha / Bar</option>
            </select>
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>{editingId ? "Nova senha (deixe vazio para manter)" : "Senha *"}</label>
            <div className="flex gap-1.5 mt-1">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ borderColor: BORDER }}
                className="flex-1 border rounded px-2.5 py-2 text-sm"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} style={{ borderColor: BORDER, color: MUTED }} className="border rounded px-2 text-xs">
                {showPw ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="text-xs mt-2" style={{ color: BRICK }}>
            {error}
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <button onClick={submit} style={{ background: TEAL, color: "#fff" }} className="px-4 py-2 rounded text-sm font-medium">
            {editingId ? "Guardar" : "Adicionar"}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setForm(blank); setError(""); }} style={{ borderColor: BORDER }} className="border rounded px-3 py-2 text-sm">
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {store.employees.map((e) => {
          const active = e.active !== false;
          return (
            <div key={e.id} style={{ background: CARD, borderColor: BORDER, opacity: active ? 1 : 0.6 }} className="border rounded-lg p-3 flex items-center justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{e.name}</div>
                <div className="text-xs" style={{ color: MUTED }}>
                  {e.email} · {ROLE_LABELS[e.role] || e.role}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(e.id)} style={{ color: active ? MUTED : GREEN }} className="text-xs font-medium">
                  {active ? "Desativar" : "Ativar"}
                </button>
                <button onClick={() => startEdit(e)} style={{ color: TEAL }} className="text-xs font-medium">
                  Editar
                </button>
                <button onClick={() => removeEmployee(e.id)} style={{ color: BRICK }} className="text-xs font-medium">
                  Apagar
                </button>
              </div>
            </div>
          );
        })}
        {store.employees.length === 0 && (
          <div className="text-sm" style={{ color: MUTED }}>
            Ainda não há utilizadores.
          </div>
        )}
      </div>
    </div>
  );
}
