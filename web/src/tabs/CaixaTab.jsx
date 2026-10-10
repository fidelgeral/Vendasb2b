import { useMemo, useState } from "react";
import { CARD, BORDER, MUTED, TEAL, INK, GREEN, BRICK } from "../lib/theme.js";
import { fmtMT, DESPESA_CATEGORIAS, ENTRADA_CATEGORIAS } from "../lib/utils.js";
import { DonutChart } from "../lib/charts.jsx";
import { Scale, PackageX, ArrowDownCircle, ArrowUpCircle, Banknote } from "../lib/icons.jsx";
import { imprimirReciboTermico, gerarReciboPDF } from "../lib/print.js";
import { VoidModal } from "../components/Shared.jsx";

export default function CaixaTab({ store, shiftOpen, currentShift, openShift, closeShift, registerQuebra, registerMovimento, podeVerEsperado, voidSale, canVoid }) {
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

  const subtabs = [
    { id: "resumo", label: "Resumo", icon: Scale },
    { id: "historico", label: "Histórico de movimentos", icon: Banknote },
    { id: "quebras", label: "Quebras", icon: PackageX },
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
      {sub === "quebras" && <QuebrasForm store={store} onSubmit={registerQuebra} />}
      {sub === "entrada" && <MovimentoForm type="entrada" shiftOpen={shiftOpen} onSubmit={registerMovimento} />}
      {sub === "saida" && <MovimentoForm type="saida" shiftOpen={shiftOpen} onSubmit={registerMovimento} />}

      {showShiftModal && (
        <ShiftModal
          mode={showShiftModal}
          onConfirmOpen={(v) => {
            openShift(v);
            setShowShiftModal(null);
          }}
          onConfirmClose={(v) => {
            closeShift(v);
            setShowShiftModal(null);
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

function ShiftModal({ mode, onConfirmOpen, onConfirmClose, onClose }) {
  const [value, setValue] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">{mode === "open" ? "Abrir caixa" : "Fechar caixa"}</div>
        <label className="text-xs" style={{ color: MUTED }}>
          {mode === "open" ? "Dinheiro inicial no caixa" : "Dinheiro contado no caixa agora"}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ borderColor: BORDER }}
          className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1 mb-3"
          placeholder="0"
        />
        <button
          onClick={() => (mode === "open" ? onConfirmOpen(Number(value) || 0) : onConfirmClose(Number(value) || 0))}
          style={{ background: TEAL, color: "#fff" }}
          className="w-full rounded-lg py-2 text-sm font-medium"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
