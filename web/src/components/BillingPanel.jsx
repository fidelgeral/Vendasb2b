import { useEffect, useState } from "react";
import { CARD, BORDER, MUTED, TEAL, GREEN, BRICK, GOLD, SOFTGOLD, INK } from "../lib/theme.js";
import { fmtMT, whatsappLink } from "../lib/utils.js";

const STATUS_INFO = {
  ativo: { label: "Activa", color: GREEN, bg: "#D1FAE5" },
  pendente: { label: "Pagamento em análise", color: GOLD, bg: SOFTGOLD },
  suspenso: { label: "Suspensa", color: BRICK, bg: "#FEE2E2" },
};

export default function BillingPanel({ api, canSubmit = true }) {
  const [data, setData] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mpesa");
  const [reference, setReference] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => api.getBilling().then(setData).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  if (!data) {
    return <div className="text-sm" style={{ color: MUTED }}>A carregar assinatura…</div>;
  }

  const st = STATUS_INFO[data.subscriptionStatus] || STATUS_INFO.ativo;
  const waMsg = `Ola, sou da loja e acabei de pagar a mensalidade VENDASB2B via ${method === "mpesa" ? "M-Pesa" : "e-Mola"}${amount ? " de " + amount + " MT" : ""}. Segue o comprovativo.`;

  const submit = async () => {
    if (!(Number(amount) > 0)) {
      setMsg("Indique o valor pago.");
      return;
    }
    setSending(true);
    setMsg("");
    try {
      await api.submitPayment({ amount: Number(amount), method, reference: reference.trim() });
      setMsg("Pagamento registado! Aguarde a confirmação (normalmente no mesmo dia). Não esqueça de enviar o comprovativo pelo WhatsApp.");
      setAmount("");
      setReference("");
      load();
    } catch (e) {
      setMsg(e.message);
    }
    setSending(false);
  };

  return (
    <div className="space-y-3">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs uppercase tracking-wide" style={{ color: MUTED }}>Plano</div>
            <div className="text-lg font-bold">{data.plan} · {data.monthlyFee > 0 ? fmtMT(data.monthlyFee) + "/mês" : "sem custo"}</div>
            {data.nextDueDate && (
              <div className="text-xs" style={{ color: MUTED }}>
                Próximo vencimento: {new Date(data.nextDueDate).toLocaleDateString("pt-PT")}
              </div>
            )}
          </div>
          <span style={{ background: st.bg, color: st.color }} className="text-xs font-bold px-3 py-1 rounded-full">
            {st.label}
          </span>
        </div>
      </div>

      <div style={{ background: SOFTGOLD, borderColor: GOLD }} className="border rounded-xl p-4 text-sm">
        <div className="font-bold mb-1" style={{ color: INK }}>Como pagar a mensalidade</div>
        <div style={{ color: INK }}>
          Transfira o valor para um dos números abaixo (titular <b>{data.info.titular}</b>) e envie o comprovativo pelo WhatsApp:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg px-3 py-2">
            <div className="text-xs" style={{ color: MUTED }}>M-Pesa</div>
            <div className="text-base font-bold">{data.info.mpesa}</div>
          </div>
          <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg px-3 py-2">
            <div className="text-xs" style={{ color: MUTED }}>e-Mola</div>
            <div className="text-base font-bold">{data.info.emola}</div>
          </div>
        </div>
        <a
          href={whatsappLink(data.info.whatsapp, waMsg)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "#25D366", color: "#fff" }}
          className="inline-flex items-center gap-1.5 mt-3 rounded-lg px-3 py-2 text-sm font-semibold"
        >
          Enviar comprovativo por WhatsApp
        </a>
      </div>

      {canSubmit && (
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-xl p-4">
          <div className="text-sm font-semibold mb-2">Já paguei — registar pagamento</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor pago (MT)" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
            <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm">
              <option value="mpesa">M-Pesa</option>
              <option value="emola">e-Mola</option>
            </select>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Nº da transacção (opcional)" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
          </div>
          <button onClick={submit} disabled={sending} style={{ background: TEAL, color: "#fff" }} className="mt-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
            {sending ? "A registar…" : "Registar pagamento"}
          </button>
          {msg && <div className="text-xs mt-2" style={{ color: MUTED }}>{msg}</div>}
        </div>
      )}

      {data.submissions.length > 0 && (
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-xl p-4">
          <div className="text-sm font-semibold mb-2">Histórico de pagamentos</div>
          <div className="space-y-1">
            {data.submissions.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs py-1" style={{ borderTop: "1px solid " + BORDER }}>
                <span>{new Date(s.createdAt).toLocaleDateString("pt-PT")} · {fmtMT(s.amount)} · {s.method === "mpesa" ? "M-Pesa" : "e-Mola"}</span>
                <span style={{ color: s.status === "confirmado" ? GREEN : s.status === "rejeitado" ? BRICK : GOLD }} className="font-semibold">
                  {s.status === "confirmado" ? "Confirmado" : s.status === "rejeitado" ? "Rejeitado" : "Pendente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
