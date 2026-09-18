import { useEffect, useState } from "react";
import { BG, CARD, BORDER, INK, TEAL, MUTED, BRICK, GREEN } from "../lib/theme.js";
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

  const load = () =>
    superApi
      .listBusinesses()
      .then((list) => {
        setBusinesses(list);
        setLoaded(true);
      })
      .catch((e) => setError(e.message));

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
    <div style={{ background: BG, color: INK, fontFamily: "system-ui, sans-serif" }} className="min-h-screen p-5">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: 52 }} />
            <div>
              <div className="text-xs" style={{ color: MUTED }}>
                {BRAND_TAGLINE} · Painel do administrador
              </div>
              <div className="text-2xl font-semibold" style={{ color: TEAL }}>
                Contas de negócio
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              clearSession();
              onLoggedOut();
            }}
            style={{ borderColor: BORDER, color: MUTED }}
            className="border rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"
          >
            <LogOut size={13} /> Sair
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Contas criadas" value={businesses.length} />
          <StatCard label="Contas activas" value={activeCount} />
        </div>

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
          <div style={{ background: "#FBE9E7", color: BRICK }} className="rounded-lg p-3 text-sm">
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
                        style={{ background: active ? "#E4F4EA" : "#F1F1F1", color: active ? GREEN : MUTED }}
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
                      className="rounded px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
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
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do negócio (ex: Padaria da Maria)" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm" />
      <div className="text-xs" style={{ color: MUTED }}>
        Conta do dono (para o primeiro acesso):
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Nome do dono" style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="Email" style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder="Senha (mín. 6 caracteres)" style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
      </div>
      {error && <div className="text-xs" style={{ color: BRICK }}>{error}</div>}
      <button onClick={submit} disabled={saving} style={{ background: TEAL, color: "#fff" }} className="rounded px-4 py-2 text-sm font-medium disabled:opacity-50">
        {saving ? "A criar…" : "Criar conta"}
      </button>
    </div>
  );
}
