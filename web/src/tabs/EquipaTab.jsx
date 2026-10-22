import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, BRICK, GREEN, INK } from "../lib/theme.js";
import { ROLE_LABELS } from "../lib/utils.js";
import { DetalhesModal, HistoricoEntidadeModal, PencilIcon, EyeIcon, ClockIcon } from "../components/Shared.jsx";
import { Trash2, Plus } from "../lib/icons.jsx";
import { useConfirm } from "../components/ConfirmProvider.jsx";
import { PERMISSOES, temPermissao } from "../lib/permissions.js";

const ROLE_COR = { dono: "#7C3AED", gerente: "#1E5BA8", caixa: "#0F766E", cozinha: "#B45309" };

export default function EquipaTab({ store, setStore, api }) {
  const confirmar = useConfirm();
  const restauranteAtivo = !!(store.config.modules.restaurante || store.config.modules.bar);
  const blank = { name: "", email: "", phone: "", password: "", role: "caixa", docId: "" };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busca, setBusca] = useState("");
  const [verFunc, setVerFunc] = useState(null);
  const [histFunc, setHistFunc] = useState(null);
  const [permFunc, setPermFunc] = useState(null);

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
    if (err) return setError(err);
    setError("");
    if (!(await confirmar({ title: editingId ? "Guardar alterações?" : "Guardar funcionário?", message: `Vai guardar "${form.name.trim()}".`, confirmLabel: "Guardar" }))) return;
    const payload = {
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role, docId: form.docId.trim(),
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      setStore(editingId ? await api.updateEmployee(editingId, payload) : await api.createEmployee(payload));
      setEditingId(null);
      setForm(blank);
      setShowForm(false);
    } catch (e) {
      setError(e.message);
    }
  };

  const abrirNovo = () => { setEditingId(null); setForm(blank); setError(""); setShowForm(true); };
  const startEdit = (e) => {
    setEditingId(e.id);
    setForm({ name: e.name || "", email: e.email || "", phone: e.phone || "", password: "", role: e.role || "caixa", docId: e.docId || "" });
    setError("");
    setShowForm(true);
  };
  const cancelar = () => { setEditingId(null); setForm(blank); setError(""); setShowForm(false); };
  const removeEmployee = async (e) => {
    if (!(await confirmar({ title: "Remover funcionário?", message: `Vai remover "${e.name}". Esta acção não pode ser desfeita.`, confirmLabel: "Remover", danger: true }))) return;
    setStore(await api.deleteEmployee(e.id));
  };
  const toggleActive = async (id) => setStore(await api.toggleEmployeeActive(id));

  const lista = [...store.employees]
    .filter((e) => e.name.toLowerCase().includes(busca.trim().toLowerCase()))
    .sort((a, b) => (a.role === "dono" ? -1 : b.role === "dono" ? 1 : (a.name || "").localeCompare(b.name || "")));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-base font-semibold">Gestão de Equipa</div>
          <div className="text-xs" style={{ color: MUTED }}>
            {store.employees.length} funcionário(s) · só o Administrador pode gerir a equipa
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por nome…" style={{ borderColor: BORDER, background: CARD }} className="border rounded-lg px-3 py-1.5 text-sm" />
          <button onClick={abrirNovo} style={{ background: GREEN, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 whitespace-nowrap">
            <Plus size={14} /> Novo funcionário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {lista.map((e) => {
          const active = e.active !== false;
          const ehDono = e.role === "dono";
          return (
            <div key={e.id} style={{ background: CARD, borderColor: ehDono ? "#C4B5FD" : BORDER, opacity: active ? 1 : 0.6 }} className="border rounded-xl p-3 flex flex-col">
              <div className="flex items-center gap-3">
                <div style={{ background: (ROLE_COR[e.role] || TEAL) + "22", color: ROLE_COR[e.role] || TEAL }} className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
                  {(e.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{e.name}</div>
                  <div className="text-xs" style={{ color: ROLE_COR[e.role] || MUTED }}>{ROLE_LABELS[e.role] || e.role}</div>
                  {e.phone && <div className="text-xs" style={{ color: MUTED }}>{e.phone}</div>}
                </div>
              </div>
              <div className="mt-2">
                <span style={{ background: active ? "#DCFCE7" : "#FEE2E2", color: active ? GREEN : BRICK }} className="rounded-full px-2 py-0.5 text-[11px] font-medium">
                  {active ? "Ativo" : "Inativo"}
                </span>
                {ehDono && <span style={{ color: MUTED }} className="text-[10px] ml-2">padrão — permanente</span>}
              </div>
              <div style={{ borderTop: `1px solid ${BORDER}` }} className="flex items-center gap-1.5 mt-3 pt-2.5 flex-wrap">
                <IconBtn color={GREEN} title="Editar" onClick={() => startEdit(e)}><PencilIcon /></IconBtn>
                <IconBtn color="#4F46E5" title="Ver detalhes" onClick={() => setVerFunc(e)}><EyeIcon /></IconBtn>
                <IconBtn color="#64748B" title="Histórico" onClick={() => setHistFunc(e)}><ClockIcon /></IconBtn>
                {!ehDono && <IconBtn color="#EA580C" title="Permissões" onClick={() => setPermFunc(e)}>🔑</IconBtn>}
                {!ehDono && (
                  <button onClick={() => toggleActive(e.id)} style={{ borderColor: BORDER, color: active ? MUTED : GREEN }} className="border rounded-lg px-2 py-1 text-[11px] font-medium">
                    {active ? "Desativar" : "Ativar"}
                  </button>
                )}
                {!ehDono && <IconBtn color={BRICK} title="Apagar" onClick={() => removeEmployee(e)}><Trash2 size={14} /></IconBtn>}
              </div>
            </div>
          );
        })}
        {lista.length === 0 && <div className="text-sm col-span-full" style={{ color: MUTED }}>Nenhum funcionário encontrado.</div>}
      </div>

      {showForm && (
        <FuncionarioModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          error={error}
          showPw={showPw}
          setShowPw={setShowPw}
          restauranteAtivo={restauranteAtivo}
          onSubmit={submit}
          onClose={cancelar}
        />
      )}

      {permFunc && (
        <PermissoesModal
          funcionario={permFunc}
          onClose={() => setPermFunc(null)}
          onSave={async (perms) => { setStore(await api.updateEmployeePermissions(permFunc.id, perms)); setPermFunc(null); }}
        />
      )}

      {verFunc && (
        <DetalhesModal
          title={verFunc.name}
          linhas={[
            { label: "Email", value: verFunc.email },
            { label: "Telefone", value: verFunc.phone },
            { label: "Função", value: ROLE_LABELS[verFunc.role] || verFunc.role },
            { label: "Nº de documento", value: verFunc.docId },
            { label: "Estado", value: verFunc.active !== false ? "Ativo" : "Inativo" },
          ]}
          onClose={() => setVerFunc(null)}
        />
      )}
      {histFunc && <HistoricoEntidadeModal title={histFunc.name} api={api} tipo="funcionario" id={histFunc.id} onClose={() => setHistFunc(null)} />}
    </div>
  );
}

function IconBtn({ color, title, onClick, children }) {
  return (
    <button onClick={onClick} title={title} style={{ background: color, color: "#fff" }} className="rounded-lg w-8 h-8 flex items-center justify-center text-sm">
      {children}
    </button>
  );
}

function FuncionarioModal({ form, setForm, editingId, error, showPw, setShowPw, restauranteAtivo, onSubmit, onClose }) {
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <div onClick={onClose} className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} style={{ background: CARD, borderColor: BORDER }} className="border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-bold">{editingId ? "Editar funcionário" : "Novo funcionário"}</div>
          <button onClick={onClose} style={{ color: MUTED }} className="text-lg leading-none px-1">✕</button>
        </div>
        <div className="space-y-2.5">
          <Campo label="Nome completo *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Maria João Cossa" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
          </Campo>
          <div className="grid grid-cols-2 gap-2.5">
            <Campo label="Função">
              <select value={form.role} onChange={(e) => set("role", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm">
                <option value="dono">Administrador</option>
                <option value="gerente">Gerente</option>
                <option value="caixa">Operador de Caixa</option>
                {(restauranteAtivo || form.role === "cozinha") && <option value="cozinha">Cozinha / Bar</option>}
              </select>
            </Campo>
            <Campo label="Nº de documento">
              <input value={form.docId} onChange={(e) => set("docId", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
            </Campo>
          </div>
          <Campo label="Email *">
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nome@empresa.co.mz" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
          </Campo>
          <Campo label="Telefone">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+258 84 000 0000" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
          </Campo>
          <Campo label={editingId ? "Nova senha (deixe vazio para manter)" : "Senha *"}>
            <div className="flex gap-1.5">
              <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} style={{ borderColor: BORDER }} className="flex-1 border rounded-lg px-2.5 py-2 text-sm" />
              <button type="button" onClick={() => setShowPw((s) => !s)} style={{ borderColor: BORDER, color: MUTED }} className="border rounded-lg px-2 text-xs">{showPw ? "Ocultar" : "Ver"}</button>
            </div>
          </Campo>
          {error && <div className="text-xs" style={{ color: BRICK }}>{error}</div>}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onSubmit} style={{ background: TEAL, color: "#fff" }} className="flex-1 rounded-lg py-2 text-sm font-semibold">{editingId ? "Guardar" : "Adicionar"}</button>
          <button onClick={onClose} style={{ borderColor: BORDER }} className="border rounded-lg px-4 py-2 text-sm">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <div>
      <label className="text-xs" style={{ color: MUTED }}>{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Switch({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{ background: on ? GREEN : "#CBD5E1", width: 40, height: 22 }}
      className="relative rounded-full transition-colors shrink-0"
    >
      <span style={{ width: 18, height: 18, top: 2, left: on ? 20 : 2 }} className="absolute bg-white rounded-full shadow transition-all" />
    </button>
  );
}

function PermissoesModal({ funcionario, onClose, onSave }) {
  // Estado inicial: valor efectivo (permissão guardada ou o padrão do papel).
  const [perms, setPerms] = useState(() => {
    const out = {};
    PERMISSOES.forEach((g) => g.itens.forEach((i) => (out[i.id] = temPermissao(funcionario, i.id))));
    return out;
  });
  const setItem = (id, v) => setPerms((p) => ({ ...p, [id]: v }));
  const grupoLigado = (g) => g.itens.some((i) => perms[i.id]);
  const toggleGrupo = (g, v) => setPerms((p) => { const n = { ...p }; g.itens.forEach((i) => (n[i.id] = v)); return n; });

  return (
    <div onClick={onClose} className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
      <div onClick={(e) => e.stopPropagation()} style={{ background: CARD, borderColor: BORDER }} className="border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-auto">
        <div style={{ borderBottom: `1px solid ${BORDER}` }} className="flex items-center justify-between px-5 py-3 sticky top-0" >
          <div>
            <div className="text-base font-bold">Permissões do funcionário</div>
            <div className="text-xs" style={{ color: MUTED }}>{funcionario.name} · o que esta conta pode fazer</div>
          </div>
          <button onClick={onClose} style={{ color: MUTED }} className="text-lg leading-none px-1">✕</button>
        </div>
        <div className="p-4 space-y-4">
          {PERMISSOES.map((g) => (
            <div key={g.grupo}>
              <div className="flex items-center gap-2 mb-2">
                <div style={{ background: TEAL }} className="w-1 h-4 rounded" />
                <div className="text-sm font-semibold" style={{ color: INK }}>{g.label}</div>
                <Switch on={grupoLigado(g)} onChange={(v) => toggleGrupo(g, v)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {g.itens.map((i) => (
                  <label key={i.id} style={{ background: "#F8FAFC", borderColor: BORDER }} className="border rounded-lg px-3 py-2 flex items-center justify-between gap-2 cursor-pointer">
                    <span className="text-sm">{i.label}</span>
                    <Switch on={!!perms[i.id]} onChange={(v) => setItem(i.id, v)} />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${BORDER}` }} className="flex gap-2 justify-end px-5 py-3 sticky bottom-0" >
          <button onClick={onClose} style={{ borderColor: BORDER }} className="border rounded-lg px-4 py-2 text-sm">Cancelar</button>
          <button onClick={() => onSave(perms)} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-5 py-2 text-sm font-semibold">Guardar permissões</button>
        </div>
      </div>
    </div>
  );
}
