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

  const [demos, setDemos] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [showDemos, setShowDemos] = useState(false);
  const [showProofs, setShowProofs] = useState(false);
  const [showInvoice, setShowInvoice] = useState(null);

  const load = () => {
    superApi
      .listBusinesses()
      .then((list) => {
        setBusinesses(list);
        setLoaded(true);
      })
      .catch((e) => setError(e.message));
    superApi.pendingSubmissions().then(setPending).catch(() => {});
    superApi.listDemos().then(setDemos).catch(() => {});
    superApi.listProofs().then(setProofs).catch(() => {});
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

        {/* Contas demo */}
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Contas demonstração ({demos.length})</div>
            <button onClick={() => setShowDemos((s) => !s)} style={{ color: TEAL }} className="text-xs font-medium">
              {showDemos ? "Fechar" : "Gerir demos"}
            </button>
          </div>
          {showDemos && (
            <div className="space-y-1.5">
              {demos.length === 0 && <div className="text-xs" style={{ color: MUTED }}>Nenhuma conta demo activa.</div>}
              {demos.map((d) => (
                <div key={d.id} style={{ borderColor: BORDER }} className="border rounded-lg px-3 py-2 text-xs flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <b>{d.name}</b> · {d.demoContactEmail} · {d.demoContactPhone || "—"}
                    <br />Representante: {d.demoRepresentative || "—"} · Expira: {d.demoExpiresAt ? new Date(d.demoExpiresAt).toLocaleDateString("pt-PT") : "—"}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => { await superApi.activateDemo(d.id); load(); }}
                      style={{ background: GREEN, color: "#fff" }} className="rounded-lg px-2.5 py-1 font-semibold">
                      Activar subscrição
                    </button>
                    <button onClick={async () => { if (confirm("Apagar conta demo " + d.name + "?")) { await superApi.deleteDemo(d.id); load(); } }}
                      style={{ color: BRICK }} className="font-semibold">
                      Apagar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comprovativos com foto */}
        {proofs.length > 0 && (
          <div style={{ background: "#E0F2FE", borderColor: "#0284C7" }} className="border rounded-xl p-3">
            <div className="text-sm font-bold mb-2">Comprovativos de pagamento ({proofs.length})</div>
            <div className="space-y-1.5">
              {proofs.map((p) => (
                <div key={p.id} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg px-3 py-2 text-xs flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <b>{p.businessName}</b> · {Number(p.amount)} MT · {p.paymentMethod}
                    <br />Pago por: {p.payerName} · Tel: {p.payerPhone || "—"}
                    {p.notes && <> · {p.notes}</>}
                    <br />Data: {new Date(p.createdAt).toLocaleDateString("pt-PT")}
                    {p.photoUrl && <> · <a href={p.photoUrl} target="_blank" rel="noopener" style={{ color: TEAL }}>Ver comprovativo</a></>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={async () => { await superApi.confirmProof(p.id); load(); }}
                      style={{ background: GREEN, color: "#fff" }} className="rounded-lg px-2.5 py-1 font-semibold">
                      Confirmar (+30 dias)
                    </button>
                    <button onClick={async () => { await superApi.rejectProof(p.id); load(); }}
                      style={{ color: BRICK }} className="font-semibold">
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emitir fatura / recibo */}
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">Emitir fatura / recibo</div>
            <button onClick={() => setShowInvoice((s) => s ? null : "invoice")} style={{ color: TEAL }} className="text-xs font-medium">
              {showInvoice ? "Fechar" : "Emitir documento"}
            </button>
          </div>
          {showInvoice && (
            <InvoiceGenerator businesses={businesses} type={showInvoice} onChangeType={setShowInvoice} />
          )}
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
              businesses={businesses}
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
          {(() => {
            const sedes = businesses.filter((b) => !b.parentBusinessId);
            const filiais = businesses.filter((b) => b.parentBusinessId);
            const filiaisPorSede = {};
            filiais.forEach((f) => { (filiaisPorSede[f.parentBusinessId] ||= []).push(f); });
            const orphans = businesses.filter((b) => !b.parentBusinessId && !filiaisPorSede[b.id]);
            const groups = sedes.filter((s) => filiaisPorSede[s.id]?.length > 0);

            const renderCard = (b, indent = false) => {
              const active = b.active !== false;
              return (
                <div key={b.id} style={{ background: CARD, borderColor: indent ? "#7C3AED22" : BORDER, opacity: active ? 1 : 0.6, marginLeft: indent ? 20 : 0, borderLeftWidth: indent ? 3 : 1, borderLeftColor: indent ? "#7C3AED" : BORDER }} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        {indent && <span style={{ color: "#7C3AED" }} className="text-[10px]">↳ filial</span>}
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
                        onClick={() => onOpenBusiness(b, businesses)}
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
            };

            return (
              <>
                {groups.map((sede) => (
                  <div key={sede.id} className="space-y-1.5">
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs font-bold uppercase" style={{ color: "#7C3AED" }}>Grupo: {sede.name}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#7C3AED22", color: "#7C3AED" }}>
                        {(filiaisPorSede[sede.id]?.length || 0) + 1} estabelecimento(s)
                      </span>
                    </div>
                    {renderCard(sede, false)}
                    {(filiaisPorSede[sede.id] || []).map((f) => renderCard(f, true))}
                  </div>
                ))}
                {orphans.map((b) => renderCard(b, false))}
              </>
            );
          })()}
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

function InvoiceGenerator({ businesses, type, onChangeType }) {
  const [biz, setBiz] = useState("");
  const [docType, setDocType] = useState(type || "invoice");
  const [clientName, setClientName] = useState("");
  const [clientNuit, setClientNuit] = useState("");
  const [items, setItems] = useState([{ description: "Mensalidade VENDASB2B", qty: 1, unitPrice: 0 }]);
  const [period, setPeriod] = useState("");
  const [notes, setNotes] = useState("");

  const addItem = () => setItems((i) => [...i, { description: "", qty: 1, unitPrice: 0 }]);
  const updateItem = (idx, field, value) => setItems((i) => i.map((it, j) => j === idx ? { ...it, [field]: value } : it));
  const removeItem = (idx) => setItems((i) => i.filter((_, j) => j !== idx));

  const total = items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.unitPrice || 0), 0);
  const hoje = new Date().toLocaleDateString("pt-PT");
  const docNum = docType === "invoice"
    ? `FT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    : `RC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  const selectedBiz = businesses.find((b) => b.id === biz);

  const imprimir = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const isInvoice = docType === "invoice";
    const itemsHtml = items.map((it) => `
      <tr>
        <td style="border:1px solid #ddd;padding:8px">${it.description}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:center">${it.qty}</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right">${Number(it.unitPrice).toFixed(2)} MT</td>
        <td style="border:1px solid #ddd;padding:8px;text-align:right">${(Number(it.qty) * Number(it.unitPrice)).toFixed(2)} MT</td>
      </tr>`).join("");

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:40px">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:30px">
          <div>
            <h1 style="margin:0;color:#4F46E5;font-size:28px">VENDASB2B</h1>
            <p style="color:#666;margin:4px 0">Sistema de Gestão Comercial</p>
            <p style="color:#666;margin:0;font-size:12px">M-Pesa: 845508667 · e-Mola: 861132245</p>
          </div>
          <div style="text-align:right">
            <h2 style="margin:0;font-size:22px;color:#333">${isInvoice ? "FATURA" : "RECIBO DE PAGAMENTO"}</h2>
            <p style="color:#666;margin:4px 0">Nº ${docNum}</p>
            <p style="color:#666;margin:0">Data: ${hoje}</p>
          </div>
        </div>
        <hr style="border:none;border-top:2px solid #4F46E5;margin:20px 0"/>
        <div style="display:flex;justify-content:space-between;margin-bottom:20px">
          <div>
            <strong>Cliente:</strong><br/>
            ${clientName || (selectedBiz ? selectedBiz.name : "—")}<br/>
            ${clientNuit ? "NUIT: " + clientNuit : ""}
          </div>
          ${period ? `<div><strong>Período:</strong><br/>${period}</div>` : ""}
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <thead>
            <tr style="background:#4F46E5;color:#fff">
              <th style="padding:10px;text-align:left">Descrição</th>
              <th style="padding:10px;text-align:center;width:80px">Qtd</th>
              <th style="padding:10px;text-align:right;width:120px">Preço unit.</th>
              <th style="padding:10px;text-align:right;width:120px">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align:right;font-size:22px;font-weight:bold;color:#4F46E5;margin:20px 0">
          TOTAL: ${total.toFixed(2)} MT
        </div>
        ${notes ? `<div style="background:#f8f9fa;padding:12px;border-radius:8px;margin:20px 0"><strong>Observações:</strong> ${notes}</div>` : ""}
        <hr style="border:none;border-top:1px solid #ddd;margin:30px 0"/>
        <p style="text-align:center;color:#999;font-size:11px">Documento gerado por VENDASB2B · ${hoje}</p>
      </div>`;
    win.document.write(`<html><body>${html}<script>window.print();<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button onClick={() => { setDocType("invoice"); onChangeType("invoice"); }}
          style={{ background: docType === "invoice" ? TEAL : CARD, color: docType === "invoice" ? "#fff" : INK, borderColor: BORDER }}
          className="border rounded-lg px-3 py-1.5 text-xs font-semibold">
          Fatura profissional
        </button>
        <button onClick={() => { setDocType("receipt"); onChangeType("receipt"); }}
          style={{ background: docType === "receipt" ? TEAL : CARD, color: docType === "receipt" ? "#fff" : INK, borderColor: BORDER }}
          className="border rounded-lg px-3 py-1.5 text-xs font-semibold">
          Recibo de pagamento
        </button>
      </div>
      <select value={biz} onChange={(e) => setBiz(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm">
        <option value="">Seleccionar negócio (cliente)</option>
        {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Nome do cliente / instituição" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        <input value={clientNuit} onChange={(e) => setClientNuit(e.target.value)} placeholder="NUIT (opcional)" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
      </div>
      <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Período (ex: Outubro 2026)" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
      <div className="text-xs font-semibold mt-1">Linhas do documento</div>
      {items.map((it, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-1 items-center">
          <input value={it.description} onChange={(e) => updateItem(idx, "description", e.target.value)} placeholder="Descrição" style={{ borderColor: BORDER }} className="col-span-5 border rounded-lg px-2 py-1.5 text-xs" />
          <input type="number" value={it.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} style={{ borderColor: BORDER }} className="col-span-2 border rounded-lg px-2 py-1.5 text-xs text-center" />
          <input type="number" value={it.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} placeholder="Preço" style={{ borderColor: BORDER }} className="col-span-3 border rounded-lg px-2 py-1.5 text-xs text-right" />
          <button onClick={() => removeItem(idx)} style={{ color: BRICK }} className="col-span-2 text-xs">✕</button>
        </div>
      ))}
      <button onClick={addItem} style={{ color: TEAL }} className="text-xs font-semibold">+ Adicionar linha</button>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações (opcional)" rows={2}
        style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold" style={{ color: TEAL }}>Total: {total.toFixed(2)} MT</div>
        <button onClick={imprimir} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-4 py-2 text-sm font-semibold">
          Imprimir {docType === "invoice" ? "fatura" : "recibo"} A4
        </button>
      </div>
    </div>
  );
}

function NewBusinessForm({ onCreated, businesses = [] }) {
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [parentBusinessId, setParentBusinessId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Possíveis sedes: negócios que não são, eles próprios, filiais.
  const sedes = businesses.filter((b) => !b.parentBusinessId);

  const submit = async () => {
    if (!name.trim() || !ownerName.trim() || !ownerEmail.trim() || ownerPassword.length < 6) {
      setError("Preencha o nome do negócio, nome e email do dono, e uma senha com pelo menos 6 caracteres.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await superApi.createBusiness({ name: name.trim(), ownerName: ownerName.trim(), ownerEmail: ownerEmail.trim(), ownerPassword, parentBusinessId: parentBusinessId || null });
      onCreated();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do negócio (ex: Padaria da Maria)" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
      <select value={parentBusinessId} onChange={(e) => setParentBusinessId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm">
        <option value="">Negócio independente (sem sede)</option>
        {sedes.map((b) => (
          <option key={b.id} value={b.id}>Filial de: {b.name}</option>
        ))}
      </select>
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
