import { useMemo, useState } from "react";
import { CARD, BORDER, MUTED, TEAL, INK, GREEN, BRICK } from "../lib/theme.js";
import { fmtMT, DESPESA_CATEGORIAS, ENTRADA_CATEGORIAS } from "../lib/utils.js";
import { DonutChart } from "../lib/charts.jsx";
import { Scale, PackageX, ArrowDownCircle, ArrowUpCircle, Banknote, AlertTriangle, CheckCircle2 } from "../lib/icons.jsx";
import { imprimirReciboTermico, gerarReciboPDF, enviarReciboPorWhatsApp } from "../lib/print.js";
import { VoidModal } from "../components/Shared.jsx";

export default function CaixaTab({ store, shiftOpen, currentShift, openShift, closeShift, registerQuebra, registerMovimento, podeVerEsperado, voidSale, canVoid, payShortage }) {
  const [sub, setSub] = useState("resumo");
  const [showShiftModal, setShowShiftModal] = useState(null);

  const shiftSales = store.sales.filter((s) => s.shiftId === store.currentShiftId && s.status !== "void");
  const paymentsByMethod = {};
  shiftSales.forEach((s) => s.payments.forEach((p) => (paymentsByMethod[p.method] = (paymentsByMethod[p.method] || 0) + p.amount)));
  const movs = store.movimentosCaixa.filter((m) => m.shiftId === store.currentShiftId);
  const entradas = movs.filter((m) => m.type === "entrada").reduce((s, m) => s + m.amount, 0);
  const saidas = movs.filter((m) => m.type === "saida").reduce((s, m) => s + m.amount, 0);
  const shiftQuebras = store.quebras.filter((q) => q.shiftId === store.currentShiftId);
  const quebrasCusto = shiftQuebras.reduce((s, q) => s + q.custoImpacto, 0);
  const expectedNow = (currentShift?.openingCash || 0) + (paymentsByMethod.dinheiro || 0) + entradas - saidas;

  const unpaidShortages = (store.cashShortages || []).filter((s) => !s.paid);

  const subtabs = [
    { id: "resumo", label: "Resumo", icon: Scale },
    { id: "historico", label: "Histórico de movimentos", icon: Banknote },
    { id: "quebrasCaixa", label: `Quebras de caixa${unpaidShortages.length ? ` (${unpaidShortages.length})` : ""}`, icon: AlertTriangle },
    { id: "quebras", label: "Quebras de stock", icon: PackageX },
    { id: "entrada", label: "Nova entrada", icon: ArrowDownCircle },
    { id: "saida", label: "Nova saída", icon: ArrowUpCircle },
  ];

  return (
    <div>
      <div
        style={{ background: shiftOpen ? "#D1FAE5" : "#FEE2E2", borderColor: shiftOpen ? "#6EE7B7" : "#FCA5A5" }}
        className="border rounded-lg p-4 mb-4 flex items-center justify-between flex-wrap gap-2"
      >
        <div className="flex items-center gap-2">
          <div style={{ background: shiftOpen ? GREEN : BRICK }} className="w-3 h-3 rounded-full" />
          <div>
            <div style={{ color: shiftOpen ? GREEN : BRICK }} className="text-sm font-semibold">
              {shiftOpen ? "Caixa aberto" : "Caixa fechado"}
            </div>
            {shiftOpen && currentShift && (
              <div className="text-xs" style={{ color: MUTED }}>
                desde {new Date(currentShift.openedAt).toLocaleString("pt-PT")}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowShiftModal(shiftOpen ? "close" : "open")}
          style={{ background: shiftOpen ? BRICK : GREEN, color: "#fff" }}
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
        >
          {shiftOpen ? "Fechar caixa" : "Abrir caixa"}
        </button>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {subtabs.map((t) => {
          const Icon = t.icon;
          const active = sub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              style={{ background: active ? TEAL : CARD, color: active ? "#fff" : INK, borderColor: BORDER }}
              className="border rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {sub === "resumo" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: "Abertura", value: fmtMT(currentShift?.openingCash || 0) },
              { label: "Vendas em dinheiro", value: fmtMT(paymentsByMethod.dinheiro || 0) },
              { label: "Entradas / Saídas", value: `+${fmtMT(entradas)} / -${fmtMT(saidas)}` },
              { label: "Esperado no caixa", value: podeVerEsperado ? fmtMT(expectedNow) : "•••" },
            ].map((c) => (
              <div key={c.label} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
                <div className="text-xs" style={{ color: MUTED }}>
                  {c.label}
                </div>
                <div style={{ color: TEAL }} className="text-base font-semibold mt-1">
                  {c.value}
                </div>
              </div>
            ))}
          </div>
          {Object.keys(paymentsByMethod).length > 0 && (
            <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">Distribuição do turno</div>
              <DonutChart data={Object.entries(paymentsByMethod).map(([k, v]) => ({ label: k, value: v }))} size={112} />
            </div>
          )}
          <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Vendas por forma de pagamento (turno actual)</div>
            {Object.keys(paymentsByMethod).length === 0 && (
              <div className="text-xs" style={{ color: MUTED }}>
                Sem vendas neste turno.
              </div>
            )}
            {Object.entries(paymentsByMethod).map(([m, v]) => (
              <div key={m} className="flex justify-between text-sm py-0.5">
                <span className="capitalize">{m}</span>
                <span style={{ color: TEAL }} className="font-medium">
                  {fmtMT(v)}
                </span>
              </div>
            ))}
          </div>
          {quebrasCusto > 0 && (
            <div style={{ background: "#FEE2E2", borderColor: "#FCA5A5", color: BRICK }} className="border rounded-lg p-3 text-sm">
              Perdas por quebra neste turno: {fmtMT(quebrasCusto)}
            </div>
          )}
        </div>
      )}
      {sub === "historico" && <CaixaHistorico store={store} voidSale={voidSale} canVoid={canVoid} />}
      {sub === "quebrasCaixa" && <CashShortagesList store={store} payShortage={payShortage} />}
      {sub === "quebras" && <QuebrasForm store={store} onSubmit={registerQuebra} />}
      {sub === "entrada" && <MovimentoForm type="entrada" shiftOpen={shiftOpen} onSubmit={registerMovimento} />}
      {sub === "saida" && <MovimentoForm type="saida" shiftOpen={shiftOpen} onSubmit={registerMovimento} />}

      {showShiftModal && (
        <ShiftModal
          mode={showShiftModal}
          expectedCash={expectedNow}
          podeVerEsperado={podeVerEsperado}
          onConfirmOpen={(v) => {
            openShift(v);
            setShowShiftModal(null);
          }}
          onConfirmClose={async (v) => {
            const result = await closeShift(v);
            if (result) setShowShiftModal({ closingResult: result, declared: v, expected: expectedNow });
          }}
          onClose={() => setShowShiftModal(null)}
        />
      )}
    </div>
  );
}

const METODO_LABEL = { dinheiro: "Numerário", mpesa: "M-Pesa", emola: "e-Mola", fiado: "Fiado", cartao: "Cartão", transferencia: "Transferência" };
const metodoLabel = (m) => METODO_LABEL[m] || (m ? m.charAt(0).toUpperCase() + m.slice(1) : "—");

// Histórico de Movimentações — a lista de vendas (antes "Vendas recentes" no
// separador Vender) com filtros por período e pesquisa, no estilo da referência.
function CaixaHistorico({ store, voidSale, canVoid }) {
  const [periodo, setPeriodo] = useState("hoje");
  const [busca, setBusca] = useState("");
  const [voidTarget, setVoidTarget] = useState(null);

  const nomePorFuncionario = useMemo(() => {
    const m = {};
    (store.employees || []).forEach((e) => (m[e.id] = e.name));
    return m;
  }, [store.employees]);

  const movimentos = useMemo(() => {
    const agora = new Date();
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()).getTime();
    const dentroDoPeriodo = (d) => {
      const t = new Date(d).getTime();
      if (periodo === "hoje") return t >= inicioHoje;
      if (periodo === "semana") return t >= inicioHoje - 6 * 864e5;
      if (periodo === "mes") return t >= new Date(agora.getFullYear(), agora.getMonth(), 1).getTime();
      return true; // todos
    };
    const q = busca.trim().toLowerCase();
    const correspondeBusca = (s) => {
      if (!q) return true;
      const itens = (s.items || []).map((i) => i.name).join(" ");
      const func = nomePorFuncionario[s.employeeId] || "";
      return (s.numero || "").toLowerCase().includes(q) || itens.toLowerCase().includes(q) || func.toLowerCase().includes(q);
    };
    return (store.sales || []).filter((s) => dentroDoPeriodo(s.date) && correspondeBusca(s));
  }, [store.sales, periodo, busca, nomePorFuncionario]);

  const periodos = [
    { id: "hoje", label: "Hoje" },
    { id: "semana", label: "Semana" },
    { id: "mes", label: "Mês" },
    { id: "todos", label: "Todos" },
  ];

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="text-sm font-semibold">Histórico de Movimentações</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {periodos.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              style={{ background: periodo === p.id ? TEAL : CARD, color: periodo === p.id ? "#fff" : MUTED, borderColor: BORDER }}
              className="border rounded-full px-2.5 py-1 text-xs font-medium"
            >
              {p.label}
            </button>
          ))}
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="pesquisar…"
            style={{ borderColor: BORDER }}
            className="border rounded-lg px-2.5 py-1 text-xs outline-none w-36"
          />
        </div>
      </div>

      {movimentos.length === 0 && (
        <div className="text-xs py-6 text-center" style={{ color: MUTED }}>
          Sem movimentos neste período.
        </div>
      )}

      <div className="space-y-1.5">
        {movimentos.map((s) => {
          const anulada = s.status === "void";
          const func = nomePorFuncionario[s.employeeId] || (s.employeeId ? "Funcionário" : "Sistema");
          const itensResumo = (s.items || []).map((i) => `${i.name} x${i.qty}`).join(", ");
          const metodos = [...new Set((s.payments || []).map((p) => metodoLabel(p.method)))].join(" + ");
          return (
            <div
              key={s.id}
              style={{ background: CARD, borderColor: BORDER, borderLeft: `3px solid ${anulada ? BRICK : GREEN}`, opacity: anulada ? 0.55 : 1 }}
              className="border rounded-lg px-3 py-2 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold flex items-center gap-2">
                  {s.numero || "VENDA"}
                  <span className="text-xs font-normal" style={{ color: MUTED }}>
                    {new Date(s.date).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {func}
                  </span>
                  {anulada && <span style={{ color: BRICK }} className="text-xs font-semibold">CANCELADA</span>}
                </div>
                {itensResumo && (
                  <div className="text-xs truncate mt-0.5" style={{ color: MUTED }}>
                    {itensResumo}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => imprimirReciboTermico(s, store, store.clients)} style={{ color: TEAL }} className="text-xs font-medium">
                    Imprimir
                  </button>
                  <button onClick={() => gerarReciboPDF(s, store, store.clients)} style={{ color: MUTED }} className="text-xs font-medium">
                    PDF
                  </button>
                  <button onClick={() => {
                    const cli = store.clients.find((c) => c.id === s.clientId);
                    enviarReciboPorWhatsApp(s, store, store.clients, cli?.phone || "");
                  }} style={{ color: "#25D366" }} className="text-xs font-medium">
                    WhatsApp
                  </button>
                  {canVoid && !anulada && (
                    <button onClick={() => setVoidTarget(s.id)} style={{ color: BRICK }} className="text-xs font-medium">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div style={{ color: anulada ? MUTED : GREEN, textDecoration: anulada ? "line-through" : "none" }} className="text-sm font-bold">
                  +{fmtMT(s.total)}
                </div>
                <div className="text-xs" style={{ color: MUTED }}>
                  {metodos || "—"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {voidTarget && (
        <VoidModal
          onConfirm={(reason) => {
            voidSale(voidTarget, reason);
            setVoidTarget(null);
          }}
          onClose={() => setVoidTarget(null)}
        />
      )}
    </div>
  );
}

function QuebrasForm({ store, onSubmit }) {
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState("");
  const [motivo, setMotivo] = useState("Danificado");
  const product = store.products.find((p) => p.id === productId);

  const submit = () => {
    if (!productId || !qty) return;
    onSubmit({ productId, variantId: variantId || null, qty: Number(qty), motivo });
    setQty("");
    setVariantId("");
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">Registar quebra / perda</div>
      <select
        value={productId}
        onChange={(e) => {
          setProductId(e.target.value);
          setVariantId("");
        }}
        style={{ borderColor: BORDER }}
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
      >
        <option value="">Produto</option>
        {store.products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {product?.variants && (
        <select value={variantId} onChange={(e) => setVariantId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm">
          <option value="">Variante</option>
          {product.variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="Quantidade" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm" />
        <select value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm">
          <option>Danificado</option>
          <option>Vencido</option>
          <option>Roubo/Perda</option>
          <option>Erro de registo</option>
          <option>Outro</option>
        </select>
      </div>
      <button onClick={submit} style={{ background: BRICK, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm">
        Registar
      </button>
      <div className="text-xs" style={{ color: MUTED }}>
        Isto retira a quantidade do stock e regista o custo como perda no relatório financeiro.
      </div>
    </div>
  );
}

function MovimentoForm({ type, shiftOpen, onSubmit }) {
  const isEntrada = type === "entrada";
  const cats = isEntrada ? ENTRADA_CATEGORIAS : DESPESA_CATEGORIAS;
  const [amount, setAmount] = useState("");
  const [motivo, setMotivo] = useState("");
  const [categoria, setCategoria] = useState(cats[0]);
  const submit = () => {
    if (!amount || !shiftOpen) return;
    onSubmit({ type, amount: Number(amount), motivo, categoria });
    setAmount("");
    setMotivo("");
  };
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">{isEntrada ? "Nova entrada de dinheiro" : "Nova saída de dinheiro"}</div>
      {!shiftOpen && (
        <div className="text-xs" style={{ color: BRICK }}>
          Abra o caixa para registar movimentos.
        </div>
      )}
      <input type="number" placeholder="Valor (MT)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm">
        {cats.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        placeholder="Descrição (opcional)"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        style={{ borderColor: BORDER }}
        className="w-full border rounded-lg px-2 py-1.5 text-sm"
      />
      <button onClick={submit} disabled={!shiftOpen} style={{ background: isEntrada ? GREEN : BRICK, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40">
        Registar {isEntrada ? "entrada" : "saída"}
      </button>
    </div>
  );
}

function CashShortagesList({ store, payShortage }) {
  const shortages = store.cashShortages || [];
  const [paying, setPaying] = useState(null);

  if (shortages.length === 0) {
    return (
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-6 text-center">
        <CheckCircle2 size={28} style={{ color: GREEN }} className="mx-auto mb-2" />
        <div className="text-sm font-semibold">Sem quebras de caixa</div>
        <div className="text-xs mt-1" style={{ color: MUTED }}>Todos os fechos de caixa tiveram os valores correctos.</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold mb-1">Quebras de caixa (diferenças ao fechar)</div>
      {shortages.map((s) => (
        <div key={s.id} style={{ background: CARD, borderColor: s.paid ? "#6EE7B7" : "#FCA5A5", borderLeftWidth: 3, borderLeftColor: s.paid ? GREEN : BRICK }} className="border rounded-lg px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                {s.employeeName}
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: s.paid ? "#D1FAE5" : "#FEE2E2", color: s.paid ? GREEN : BRICK }}>
                  {s.paid ? "PAGO" : "POR PAGAR"}
                </span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: MUTED }}>
                {new Date(s.createdAt).toLocaleString("pt-PT")} · Esperado: {fmtMT(s.expected)} · Declarado: {fmtMT(s.declared)}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold" style={{ color: BRICK }}>-{fmtMT(s.shortage)}</div>
              {!s.paid && (
                <button
                  disabled={paying === s.id}
                  onClick={async () => { setPaying(s.id); await payShortage(s.id); setPaying(null); }}
                  style={{ background: TEAL, color: "#fff" }}
                  className="text-[11px] px-2 py-1 rounded-lg font-medium mt-1 disabled:opacity-50"
                >
                  {paying === s.id ? "A registar…" : "Pagar do bolso"}
                </button>
              )}
              {s.paid && s.paidAt && (
                <div className="text-[10px] mt-1" style={{ color: GREEN }}>Pago em {new Date(s.paidAt).toLocaleDateString("pt-PT")}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShiftModal({ mode, expectedCash, podeVerEsperado, onConfirmOpen, onConfirmClose, onClose }) {
  const [value, setValue] = useState("");
  const [step, setStep] = useState("input");
  const [closing, setClosing] = useState(false);

  if (typeof mode === "object" && mode.closingResult) {
    const { declared, expected } = mode;
    const diff = +(declared - expected).toFixed(2);
    const isMatch = Math.abs(diff) < 0.01;
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div style={{ background: CARD }} className="rounded-xl p-5 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
          {isMatch ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ background: "#D1FAE5" }} className="p-2 rounded-full"><CheckCircle2 size={24} style={{ color: GREEN }} /></div>
                <div>
                  <div className="text-base font-bold" style={{ color: GREEN }}>Caixa fechado com sucesso!</div>
                  <div className="text-xs" style={{ color: MUTED }}>Os valores conferem perfeitamente.</div>
                </div>
              </div>
              <div style={{ background: "#D1FAE520", borderColor: "#6EE7B7" }} className="border rounded-lg p-3 mb-4 space-y-1">
                <div className="flex justify-between text-sm"><span>Valor esperado:</span><span className="font-semibold">{fmtMT(expected)}</span></div>
                <div className="flex justify-between text-sm"><span>Valor declarado:</span><span className="font-semibold">{fmtMT(declared)}</span></div>
                <div className="flex justify-between text-sm font-bold" style={{ color: GREEN }}><span>Diferença:</span><span>0,00 MT</span></div>
              </div>
              <div className="text-xs text-center" style={{ color: MUTED }}>
                Excelente trabalho! O caixa foi encerrado sem discrepâncias. Este é o resultado esperado de uma gestão rigorosa e responsável.
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ background: "#FEE2E2" }} className="p-2 rounded-full"><AlertTriangle size={24} style={{ color: BRICK }} /></div>
                <div>
                  <div className="text-base font-bold" style={{ color: BRICK }}>Discrepância detectada</div>
                  <div className="text-xs" style={{ color: MUTED }}>O valor declarado não corresponde ao esperado.</div>
                </div>
              </div>
              <div style={{ background: "#FEE2E220", borderColor: "#FCA5A5" }} className="border rounded-lg p-3 mb-3 space-y-1">
                <div className="flex justify-between text-sm"><span>Valor esperado:</span><span className="font-semibold">{fmtMT(expected)}</span></div>
                <div className="flex justify-between text-sm"><span>Valor declarado:</span><span className="font-semibold">{fmtMT(declared)}</span></div>
                <div className="flex justify-between text-sm font-bold" style={{ color: BRICK }}>
                  <span>Diferença:</span><span>{diff > 0 ? "+" : ""}{fmtMT(Math.abs(diff))}</span>
                </div>
              </div>
              <div style={{ background: "#FEF3C7", borderColor: "#F59E0B" }} className="border rounded-lg p-3 mb-3 text-xs">
                <div className="font-semibold mb-1" style={{ color: "#92400E" }}>O que pode ter acontecido:</div>
                <ul className="list-disc pl-4 space-y-0.5" style={{ color: "#92400E" }}>
                  <li>Troco dado a mais ou a menos ao cliente</li>
                  <li>Venda não registada no sistema</li>
                  <li>Retirada de dinheiro não registada como saída</li>
                  <li>Erro de contagem ao fechar o caixa</li>
                </ul>
              </div>
              <div className="text-xs" style={{ color: MUTED }}>
                Esta diferença ficou registada. O operador pode regularizar pagando do próprio bolso na secção "Quebras de caixa", ou o gestor pode analisar no relatório.
              </div>
            </>
          )}
          <button onClick={onClose} style={{ background: TEAL, color: "#fff" }} className="w-full rounded-lg py-2 text-sm font-medium mt-4">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const isClose = mode === "close";

  if (isClose && step === "confirm") {
    const declared = Number(value) || 0;
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div style={{ background: CARD }} className="rounded-xl p-5 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="text-base font-bold mb-2">Confirmação de fecho de caixa</div>
          <div className="text-sm mb-3" style={{ color: INK }}>
            Está prestes a encerrar o caixa. Por favor, confirme que o valor abaixo corresponde ao dinheiro <strong>físico</strong> que contou na gaveta do caixa neste momento.
          </div>
          <div style={{ background: "#F0F9FF", borderColor: TEAL }} className="border rounded-lg p-3 mb-3 text-center">
            <div className="text-xs" style={{ color: MUTED }}>Valor declarado</div>
            <div className="text-2xl font-extrabold" style={{ color: TEAL }}>{fmtMT(declared)}</div>
          </div>
          {podeVerEsperado && (
            <div className="text-xs mb-3 text-center" style={{ color: MUTED }}>
              Valor esperado pelo sistema: <strong>{fmtMT(expectedCash)}</strong>
            </div>
          )}
          <div className="text-xs mb-4 p-2 rounded-lg" style={{ background: "#FEF3C7", color: "#92400E" }}>
            Atenção: Após confirmar, o caixa será encerrado e qualquer diferença entre o valor declarado e o esperado ficará registada no sistema. Certifique-se de que o valor está correcto.
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep("input")} style={{ borderColor: BORDER }} className="flex-1 border rounded-lg py-2 text-sm font-medium">
              Voltar
            </button>
            <button
              disabled={closing}
              onClick={async () => { setClosing(true); await onConfirmClose(declared); setClosing(false); }}
              style={{ background: BRICK, color: "#fff" }}
              className="flex-1 rounded-lg py-2 text-sm font-medium disabled:opacity-50"
            >
              {closing ? "A fechar…" : "Confirmo, fechar caixa"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-xl p-5 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-base font-bold mb-1">{isClose ? "Fechar caixa" : "Abrir caixa"}</div>
        <div className="text-xs mb-3" style={{ color: MUTED }}>
          {isClose
            ? "Conte todo o dinheiro físico na gaveta do caixa e insira o valor total abaixo. Inclua notas, moedas e o troco."
            : "Insira o valor em dinheiro com que vai iniciar o turno. Este valor servirá como base para o cálculo do esperado."
          }
        </div>
        <label className="text-xs font-medium" style={{ color: INK }}>
          {isClose ? "Dinheiro contado no caixa (MT)" : "Dinheiro inicial no caixa (MT)"}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ borderColor: BORDER }}
          className="w-full border rounded-lg px-3 py-2 text-lg mt-1 mb-3 font-semibold"
          placeholder="0.00"
          autoFocus
        />
        <button
          onClick={() => {
            if (isClose) { setStep("confirm"); }
            else { onConfirmOpen(Number(value) || 0); }
          }}
          style={{ background: isClose ? BRICK : GREEN, color: "#fff" }}
          className="w-full rounded-lg py-2.5 text-sm font-semibold"
        >
          {isClose ? "Avançar para confirmação" : "Abrir caixa"}
        </button>
      </div>
    </div>
  );
}
