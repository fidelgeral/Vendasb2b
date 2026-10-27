import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, BRICK, GREEN } from "../lib/theme.js";
import { fmtMT, whatsappLink } from "../lib/utils.js";
import { StatCard, AcoesEntidade, DetalhesModal, HistoricoEntidadeModal } from "../components/Shared.jsx";
import { useConfirm } from "../components/ConfirmProvider.jsx";
import { Plus } from "../lib/icons.jsx";

export default function ClientesTab({ store, setStore, api, can = () => true }) {
  const confirmar = useConfirm();
  const blank = { name: "", tipo: "Particular", phone: "", email: "", nuit: "", endereco: "", cidade: "", creditLimit: "", notas: "" };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [verCliente, setVerCliente] = useState(null);
  const [histCliente, setHistCliente] = useState(null);

  const submit = async () => {
    if (!form.name.trim()) return;
    if (!(await confirmar({ title: editingId ? "Guardar alterações?" : "Guardar cliente?", message: `Vai guardar o cliente "${form.name.trim()}".`, confirmLabel: "Guardar" }))) return;
    const payload = {
      name: form.name.trim(),
      tipo: form.tipo,
      phone: form.phone.trim(),
      email: form.email.trim(),
      nuit: form.nuit.trim(),
      endereco: form.endereco.trim(),
      cidade: form.cidade.trim(),
      creditLimit: Number(form.creditLimit) || 0,
      notas: form.notas.trim(),
    };
    if (editingId) {
      setStore(await api.updateClient(editingId, payload));
      setEditingId(null);
    } else {
      setStore(await api.createClient(payload));
    }
    setForm(blank);
    setShowForm(false);
  };
  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || "", tipo: c.tipo || "Particular", phone: c.phone || "", email: c.email || "",
      nuit: c.nuit || "", endereco: c.endereco || "", cidade: c.cidade || "",
      creditLimit: c.creditLimit || "", notas: c.notas || "",
    });
    setShowForm(true);
  };
  const removeClient = async (c) => {
    if (!(await confirmar({ title: "Apagar cliente?", message: `Vai apagar "${c.name}". Esta acção não pode ser desfeita.`, confirmLabel: "Apagar", danger: true }))) return;
    setStore(await api.deleteClient(c.id));
  };
  const payPartial = async (clientId, valor) => {
    const v = Number(valor) || 0;
    if (v <= 0) return;
    setStore(await api.payPartial(clientId, v));
  };

  const filtered = store.clients.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || (c.phone || "").includes(query) || (c.nuit || "").includes(query)
  );
  const totalDivida = store.clients.reduce((a, c) => a + c.debts.reduce((x, d) => x + d.amount, 0), 0);
  const comDivida = store.clients.filter((c) => c.debts.length > 0).length;
  const acimaLimite = store.clients.filter((c) => c.creditLimit > 0 && c.debts.reduce((a, d) => a + d.amount, 0) > c.creditLimit).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-base font-semibold">Gestão de Clientes</div>
        {can("clienteGerir") && (
          <button onClick={() => { setShowForm((s) => !s); setEditingId(null); setForm(blank); }} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
            <Plus size={13} /> Novo cliente
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Clientes" value={store.clients.length} />
        <StatCard label="Com dívida" value={comDivida} />
        <StatCard label="Total em dívida" value={fmtMT(totalDivida)} />
        <StatCard label="Acima do limite" value={acimaLimite} />
      </div>

      {showForm && (
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-4">
          <div className="text-sm font-semibold mb-3">{editingId ? "Editar cliente" : "Novo cliente"}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="text-xs" style={{ color: MUTED }}>Nome / Razão social *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1">
                <option>Particular</option>
                <option>Empresa</option>
                <option>Revendedor</option>
                <option>Instituição</option>
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Telefone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+258 84 000 0000" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>NUIT</label>
              <input value={form.nuit} onChange={(e) => setForm({ ...form, nuit: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs" style={{ color: MUTED }}>Endereço</label>
              <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Cidade / Província</label>
              <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Limite de crédito (dívida)</label>
              <input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs" style={{ color: MUTED }}>Notas internas</label>
              <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={submit} style={{ background: TEAL, color: "#fff" }} className="px-4 py-2 rounded-lg text-sm font-medium">
              {editingId ? "Guardar" : "Adicionar"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(blank); }} style={{ borderColor: BORDER }} className="border rounded-lg px-3 py-2 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, telefone ou NUIT…" style={{ borderColor: BORDER, background: CARD }} className="w-full border rounded-lg px-3 py-2 text-sm" />

      <div className="space-y-1.5">
        {filtered.map((c) => {
          const total = c.debts.reduce((s, d) => s + d.amount, 0);
          const overLimit = c.creditLimit > 0 && total > c.creditLimit;
          return (
            <div key={c.id} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div style={{ background: "#F1F5F9", color: TEAL }} className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                    {(c.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-xs" style={{ color: MUTED }}>
                      {[c.tipo, c.phone, c.nuit ? "NUIT " + c.nuit : ""].filter(Boolean).join(" · ") || "sem detalhes"}
                    </div>
                    {c.points > 0 && (
                      <div className="text-xs" style={{ color: "#F59E0B" }}>
                        {c.points} pontos de fidelidade
                      </div>
                    )}
                  </div>
                </div>
                <AcoesEntidade
                  onVer={() => setVerCliente(c)}
                  onEditar={can("clienteGerir") ? () => startEdit(c) : undefined}
                  onHistorico={() => setHistCliente(c)}
                  onApagar={can("clienteApagar") ? () => removeClient(c) : undefined}
                />
              </div>

              {total > 0 && (
                <div style={{ background: overLimit ? "#FEE2E2" : "#FEF3C7", borderColor: overLimit ? "#FCA5A5" : "#F59E0B" }} className="border rounded-lg p-2 mt-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span style={{ color: overLimit ? BRICK : "#EA580C" }} className="font-medium">
                      Dívida: {fmtMT(total)} {c.creditLimit > 0 ? `(limite ${fmtMT(c.creditLimit)})` : ""}
                    </span>
                  </div>
                  {can("fiadoReceber") && <PagamentoParcial cliente={c} total={total} onPay={(v) => payPartial(c.id, v)} />}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-sm" style={{ color: MUTED }}>
            Nenhum cliente encontrado.
          </div>
        )}
      </div>

      {verCliente && (
        <DetalhesModal
          title={verCliente.name}
          linhas={[
            { label: "Tipo", value: verCliente.tipo },
            { label: "Telefone", value: verCliente.phone },
            { label: "Email", value: verCliente.email },
            { label: "NUIT", value: verCliente.nuit },
            { label: "Endereço", value: verCliente.endereco },
            { label: "Cidade / Província", value: verCliente.cidade },
            { label: "Limite de crédito", value: verCliente.creditLimit > 0 ? fmtMT(verCliente.creditLimit) : "—" },
            { label: "Dívida atual", value: fmtMT((verCliente.debts || []).reduce((s, d) => s + d.amount, 0)) },
            { label: "Pontos de fidelidade", value: String(verCliente.points || 0) },
            { label: "Notas", value: verCliente.notas },
          ]}
          onClose={() => setVerCliente(null)}
        />
      )}
      {histCliente && (
        <HistoricoEntidadeModal
          title={histCliente.name}
          api={api}
          tipo="cliente"
          id={histCliente.id}
          onClose={() => setHistCliente(null)}
        />
      )}
    </div>
  );
}

function PagamentoParcial({ cliente, total, onPay }) {
  const [valor, setValor] = useState("");
  const msg =
    "Ola " + cliente.name + ", tudo bem? Passamos para lembrar que tem um saldo em aberto de " +
    fmtMT(total) + " na nossa loja. Agradecemos a regularizacao. Obrigado!";
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input
        type="number"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Valor pago (MT)"
        style={{ borderColor: BORDER }}
        className="border rounded-lg px-2 py-1 text-xs flex-1 min-w-[120px]"
      />
      <button
        onClick={() => {
          onPay(valor);
          setValor("");
        }}
        disabled={!valor}
        style={{ background: GREEN, color: "#fff" }}
        className="rounded-lg px-2.5 py-1 text-xs font-medium disabled:opacity-40"
      >
        Receber
      </button>
      <button
        onClick={() => onPay(total)}
        style={{ borderColor: BORDER, color: TEAL }}
        className="border rounded-lg px-2.5 py-1 text-xs font-medium"
      >
        Liquidar tudo
      </button>
      {cliente.phone && (
        <a
          href={whatsappLink(cliente.phone, msg)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "#25D366", color: "#fff" }}
          className="rounded-lg px-2.5 py-1 text-xs font-medium"
        >
          Lembrar no WhatsApp
        </a>
      )}
    </div>
  );
}
