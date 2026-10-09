import { useEffect, useState } from "react";
import { BG, CARD, BORDER, INK, TEAL, MUTED, BRICK, GREEN, GRADIENT } from "../lib/theme.js";
import { BRAND_NAME, BRAND_TAGLINE } from "../lib/theme.js";
import { BRAND_LOGO } from "../lib/logo.js";
import { superApi, clearSession } from "../lib/api.js";
import { StatCard } from "../components/Shared.jsx";
import { LogOut } from "../lib/icons.jsx";

export default function SuperAdminApp({ onOpenBusiness, onLoggedOut }) {
  const [businesses, setBusinesses] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [pending, setPending] = useState([]);

  const load = () => {
    superApi
      .listBusinesses()
      .then((list) => {
        setBusinesses(list);
        setLoaded(true);
      })
      .catch((e) => setError(e.message));
    superApi.pendingSubmissions().then(setPending).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const rename = async (b) => {
    const n = prompt("Novo nome do negócio", b.name);
    if (n && n.trim()) {
      await superApi.renameBusiness(b.id, n.trim());
      load();
    }
  };
  const toggleActive = async (b) => {
    await superApi.toggleActive(b.id);
    load();
  };
  const remove = async (b) => {
    if (confirmDelete !== b.id) {
      setConfirmDelete(b.id);
      return;
    }
    await superApi.deleteBusiness(b.id);
    setConfirmDelete(null);
    load();
  };

  const activeCount = businesses.filter((b) => b.active !== false).length;

  if (!loaded) {
    return (
      <div style={{ background: BG, color: INK }} className="flex items-center justify-center min-h-screen text-sm">
        A carregar…
      </div>
    );
  }

  return (
    <div style={{ background: BG, color: INK, fontFamily: "system-ui, sans-serif" }} className="min-h-screen">
      <div style={{ background: GRADIENT }} className="px-5 pt-6 pb-16 text-white shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-2xl p-1.5 shadow">
              <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: 46 }} className="block" />
            </div>
            <div>
              <div className="text-xs opacity-85">{BRAND_TAGLINE} · Painel do administrador</div>
              <div className="text-2xl font-extrabold tracking-tight">Contas de negócio</div>
            </div>
          </div>
          <button
            onClick={() => {
              clearSession();
              onLoggedOut();
            }}
            style={{ background: "rgba(255,255,255,0.2)" }}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          >
            <LogOut size={13} /> Sair
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto space-y-4 px-5 -mt-10 pb-8">

        <div className="grid grid-cols-3 gap-2.5">
          <StatCard label="Contas criadas" value={businesses.length} />
          <StatCard label="Contas activas" value={activeCount} />
          <StatCard label="Pagamentos a confirmar" value={pending.length} />
        </div>

        {pending.length > 0 && (
          <div style={{ background: "#FEF3C7", borderColor: "#F59E0B" }} className="border rounded-xl p-3">
            <div className="text-sm font-bold mb-2">Comprovativos de mensalidade pendentes</div>
            <div className="space-y-1.5">
              {pending.map((p) => (
                <div key={p.id} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg px-3 py-2 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span>
                    <b>{p.businessName}</b> · {Number(p.amount)} MT · {p.method === "mpesa" ? "M-Pesa" : "e-Mola"}
                    {p.reference ? " · ref: " + p.reference : ""} · {new Date(p.createdAt).toLocaleDateString("pt-PT")}
                  </span>
                  <span className="flex gap-2">
                    <button
                      onClick={async () => { await superApi.confirmSubmission(p.id); load(); }}
                      style={{ background: GREEN, color: "#fff" }}
                      className="rounded-lg px-2.5 py-1 font-semibold"
                    >
                      Confirmar (+30 dias)
                    </button>
                    <button
                      onClick={async () => { await superApi.rejectSubmission(p.id); load(); }}
                      style={{ color: BRICK }}
                      className="font-semibold"
                    >
                      Rejeitar
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Nova conta de negócio</div>
            <button onClick={() => setShowForm((s) => !s)} style={{ color: TEAL }} className="text-xs font-medium">
              {showForm ? "Fechar" : "Criar nova conta"}
            </button>
          </div>
          {showForm && (
            <NewBusinessForm
              onCreated={() => {
                setShowForm(false);
                load();
              }}
            />
          )}
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: BRICK }} className="rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {businesses.length === 0 && (
            <div style={{ background: CARD, borderColor: BORDER, color: MUTED }} className="border rounded-lg p-6 text-center text-sm">
              Ainda não há contas. Crie a primeira acima.
            </div>
          )}
          {businesses.map((b) => {
            const active = b.active !== false;
            return (
              <div key={b.id} style={{ background: CARD, borderColor: BORDER, opacity: active ? 1 : 0.6 }} className="border rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {b.name}
                      <span
                        style={{ background: active ? "#D1FAE5" : "#F1F5F9", color: active ? GREEN : MUTED }}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase"
                      >
                        {active ? "Activa" : "Suspensa"}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: MUTED }}>
                      Código: {b.slug} · {b.employee_count} conta(s) de utilizador · criada em {new Date(b.created_at).toLocaleDateString("pt-PT")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => rename(b)} style={{ color: TEAL }} className="text-xs font-medium">
                      Renomear
                    </button>
                    <button onClick={() => toggleActive(b)} style={{ color: active ? MUTED : GREEN }} className="text-xs font-medium">
                      {active ? "Suspender" : "Reactivar"}
                    </button>
                    <button onClick={() => remove(b)} style={{ color: BRICK }} className="text-xs font-medium">
                      {confirmDelete === b.id ? "Confirmar apagar?" : "Apagar"}
                    </button>
                    <button
                      onClick={() => onOpenBusiness(b)}
                      disabled={!active}
                      style={{ background: TEAL, color: "#fff" }}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                    >
                      Abrir
                    </button>
                  </div>
                </div>
                <BillingControls b={b} onChanged={load} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BillingControls({ b, onChanged }) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState(b.plan || "Gratuito");
  const [fee, setFee] = useState(b.monthlyFee || 0);
  const [due, setDue] = useState(b.nextDueDate ? String(b.nextDueDate).slice(0, 10) : "");
  const sub = b.subscriptionStatus || "ativo";
  const subColor = sub === "ativo" ? GREEN : sub === "suspenso" ? BRICK : "#F59E0B";
  const subLabel = sub === "ativo" ? "Assinatura activa" : sub === "suspenso" ? "Assinatura SUSPENSA" : "Pagamento em análise";

  const save = async () => {
    await superApi.setPlan(b.id, { plan, monthlyFee: Number(fee) || 0, nextDueDate: due || null });
    setOpen(false);
    onChanged();
  };

  return (
    <div className="mt-2 pt-2 flex items-center justify-between gap-2 flex-wrap text-xs" style={{ borderTop: "1px solid " + BORDER }}>
      <span style={{ color: subColor }} className="font-semibold">
        {subLabel} · {b.plan || "Gratuito"}{b.monthlyFee > 0 ? ` · ${b.monthlyFee} MT/mês` : ""}
        {b.nextDueDate ? ` · vence ${new Date(b.nextDueDate).toLocaleDateString("pt-PT")}` : ""}
      </span>
      <span className="flex gap-2 items-center">
        <button onClick={() => setOpen((o) => !o)} style={{ color: TEAL }} className="font-semibold">
          {open ? "Fechar" : "Definir plano"}
        </button>
        {sub === "suspenso" ? (
          <button onClick={async () => { await superApi.reactivate(b.id); onChanged(); }} style={{ color: GREEN }} className="font-semibold">
            Reactivar cobrança
          </button>
        ) : (
          <button onClick={async () => { await superApi.suspend(b.id); onChanged(); }} style={{ color: BRICK }} className="font-semibold">
            Suspender por falta de pagamento
          </button>
        )}
      </span>
      {open && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-2 mt-1">
          <input value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Nome do plano" style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5" />
          <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="Mensalidade (MT)" style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5" />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5" />
          <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-3 py-1.5 font-semibold">
            Guardar plano
          </button>
        </div>
      )}
    </div>
  );
}

function NewBusinessForm({ onCreated }) {
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name.trim() || !ownerName.trim() || !ownerEmail.trim() || ownerPassword.length < 6) {
      setError("Preencha o nome do negócio, nome e email do dono, e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await superApi.createBusiness({ name: name.trim(), ownerName: ownerName.trim(), ownerEmail: ownerEmail.trim(), ownerPassword });
      onCreated();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do negócio (ex: Padaria da Maria)" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
      <div className="text-xs" style={{ color: MUTED }}>
        Conta do dono (para o primeiro acesso):
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Nome do dono" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="Email" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder="Senha (mín. 6 caracteres)" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
      </div>
      {error && <div className="text-xs" style={{ color: BRICK }}>{error}</div>}
      <button onClick={submit} disabled={saving} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50">
        {saving ? "A criar…" : "Criar conta"}
      </button>
    </div>
  );
}
