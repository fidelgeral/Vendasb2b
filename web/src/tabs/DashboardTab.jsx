import { useState, useEffect, useMemo } from "react";
import { CARD, BORDER, INK, MUTED, TEAL, GREEN, BRICK, SOFTGOLD } from "../lib/theme.js";
import { isLowStock, getStock, nearExpiry, fmtMT } from "../lib/utils.js";
import { AreaChart, DonutChart, StatCardChart } from "../lib/charts.jsx";
import { AlertTriangle } from "../lib/icons.jsx";

function SimpleBar({ label, value, max, color = "#4F46E5" }) {
  return (
    <div className="flex items-center gap-2 text-xs py-0.5">
      <div className="w-28 truncate" style={{ color: INK }}>{label}</div>
      <div style={{ background: BORDER }} className="flex-1 h-3 rounded">
        <div style={{ background: color, width: `${Math.min(100, (value / (max || 1)) * 100)}%` }} className="h-3 rounded transition-all" />
      </div>
      <div className="w-8 text-right font-semibold" style={{ color: INK }}>{value}</div>
    </div>
  );
}

export default function DashboardTab({ store, shiftOpen, currentShift }) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const vendasHoje = useMemo(() => store.sales.filter((s) => s.status !== "void" && s.date?.slice(0, 10) === today), [store.sales, today]);
  const faturacaoHoje = vendasHoje.reduce((a, s) => a + Number(s.total), 0);

  const lucroHoje = useMemo(() => {
    let lucro = 0;
    for (const s of vendasHoje) {
      for (const it of s.items || []) {
        lucro += (Number(it.price) - Number(it.cost || 0)) * Number(it.qty);
      }
    }
    return lucro;
  }, [vendasHoje]);

  const movsTurno = currentShift ? store.movimentosCaixa.filter((m) => m.shiftId === currentShift.id) : [];
  const cashIn = currentShift ? store.sales.filter((s) => s.shiftId === currentShift.id && s.status !== "void").reduce((sum, s) => {
    const pays = Array.isArray(s.payments) ? s.payments : [];
    return sum + pays.filter((p) => p.method === "dinheiro").reduce((a, p) => a + Number(p.amount), 0);
  }, 0) : 0;
  const entTurno = movsTurno.filter((m) => m.type === "entrada").reduce((s, m) => s + m.amount, 0);
  const saiTurno = movsTurno.filter((m) => m.type === "saida").reduce((s, m) => s + m.amount, 0);
  const caixaAtual = shiftOpen ? (currentShift.openingCash || 0) + cashIn + entTurno - saiTurno : 0;

  // Vendas por hora (pontos para AreaChart)
  const vendasPorHora = useMemo(() => {
    const horas = new Array(17).fill(0);
    for (const s of vendasHoje) {
      const h = new Date(s.date).getHours();
      if (h >= 6 && h <= 22) horas[h - 6]++;
    }
    return horas;
  }, [vendasHoje]);
  const horaLabels = useMemo(() => Array.from({ length: 17 }, (_, i) => `${i + 6}h`), []);

  // Facturação por hora (para gráfico de área)
  const faturacaoPorHora = useMemo(() => {
    const horas = new Array(17).fill(0);
    for (const s of vendasHoje) {
      const h = new Date(s.date).getHours();
      if (h >= 6 && h <= 22) horas[h - 6] += Number(s.total);
    }
    return horas;
  }, [vendasHoje]);

  // Top produtos
  const produtosMaisVendidos = useMemo(() => {
    const agg = {};
    for (const s of vendasHoje) {
      for (const it of s.items || []) {
        agg[it.name] = (agg[it.name] || 0) + Number(it.qty);
      }
    }
    return Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [vendasHoje]);
  const topMax = produtosMaisVendidos.length > 0 ? produtosMaisVendidos[0][1] : 1;

  // Métodos de pagamento (para DonutChart)
  const metodosPagamento = useMemo(() => {
    const agg = {};
    for (const s of vendasHoje) {
      const pays = s.payments || [];
      for (const p of Array.isArray(pays) ? pays : Object.entries(pays).map(([method, amount]) => ({ method, amount }))) {
        const val = Number(p.amount || 0);
        if (val > 0) agg[p.method] = (agg[p.method] || 0) + val;
      }
    }
    return Object.entries(agg).map(([label, value]) => ({ label, value: Math.round(value) }));
  }, [vendasHoje]);

  const alertasStock = useMemo(() => store.products.filter((p) => isLowStock(p, store.products)), [store.products]);
  const alertasVencimento = useMemo(() => store.products.filter((p) => nearExpiry(p).length > 0), [store.products]);
  const alertasMargem = useMemo(() => store.products.filter((p) => {
    const price = Number(p.price), cost = Number(p.cost || 0);
    if (price <= 0 || cost <= 0) return false;
    const margem = ((price - cost) / price) * 100;
    return margem < 10;
  }).map((p) => ({ ...p, margem: Math.round(((Number(p.price) - Number(p.cost)) / Number(p.price)) * 100) })), [store.products]);
  const totalClientes = store.clients.length;
  const dividasTotal = store.clients.reduce((a, c) => a + c.debts.reduce((s, d) => s + d.amount, 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: INK }}>Dashboard</h2>
          <div className="text-xs" style={{ color: MUTED }}>
            {clock.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })} · {clock.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${shiftOpen ? "bg-green-500" : "bg-red-400"}`} />
          <span className="text-xs" style={{ color: MUTED }}>{shiftOpen ? "Caixa aberto" : "Caixa fechado"}</span>
        </div>
      </div>

      {/* KPIs com mini-gráficos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCardChart label="Vendas hoje" value={vendasHoje.length} points={vendasPorHora} labels={horaLabels} color="#4F46E5" />
        <StatCardChart label="Facturação" value={fmtMT(faturacaoHoje)} points={faturacaoPorHora} labels={horaLabels} color="#059669" />
        <StatCardChart label="Lucro estimado" value={fmtMT(lucroHoje)} sub={faturacaoHoje > 0 ? `Margem: ${Math.round((lucroHoje / faturacaoHoje) * 100)}%` : ""} color="#7C3AED" />
        <StatCardChart label="Caixa actual" value={fmtMT(caixaAtual)} sub={shiftOpen ? "Turno activo" : "Sem turno"} color={TEAL} />
      </div>

      {/* Alertas */}
      {(alertasStock.length > 0 || alertasVencimento.length > 0 || alertasMargem.length > 0) && (
        <div style={{ background: "color-mix(in srgb, var(--brick) 10%, transparent)", borderColor: "color-mix(in srgb, var(--brick) 30%, transparent)" }} className="border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} color={BRICK} />
            <span className="text-sm font-semibold" style={{ color: BRICK }}>Alertas ({alertasStock.length + alertasVencimento.length + alertasMargem.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs" style={{ color: INK }}>
            {alertasMargem.slice(0, 5).map((p) => (
              <div key={"m" + p.id}>⚠️ {p.name} — margem: {p.margem}%</div>
            ))}
            {alertasStock.slice(0, 5).map((p) => (
              <div key={p.id}>📦 {p.name} — stock: {getStock(p, store.products)}</div>
            ))}
            {alertasVencimento.slice(0, 5).map((p) => (
              <div key={p.id}>⏰ {p.name} — lote a vencer</div>
            ))}
            {(alertasStock.length + alertasVencimento.length + alertasMargem.length > 15) && (
              <div style={{ color: MUTED }}>+{alertasStock.length + alertasVencimento.length + alertasMargem.length - 15} mais…</div>
            )}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top produtos */}
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-xl p-4">
          <div className="text-sm font-semibold mb-3" style={{ color: INK }}>Produtos mais vendidos</div>
          {produtosMaisVendidos.length === 0 ? (
            <div className="text-xs text-center py-8" style={{ color: MUTED }}>Sem vendas hoje</div>
          ) : (
            <div className="space-y-1">
              {produtosMaisVendidos.map(([name, qty]) => (
                <SimpleBar key={name} label={name.length > 20 ? name.slice(0, 20) + "…" : name} value={qty} max={topMax} />
              ))}
            </div>
          )}
        </div>

        {/* Métodos de pagamento */}
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-xl p-4">
          <div className="text-sm font-semibold mb-3" style={{ color: INK }}>Pagamentos por método</div>
          {metodosPagamento.length === 0 ? (
            <div className="text-xs text-center py-8" style={{ color: MUTED }}>Sem vendas hoje</div>
          ) : (
            <DonutChart data={metodosPagamento} />
          )}
        </div>

        {/* Resumo rápido */}
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-xl p-4">
          <div className="text-sm font-semibold mb-3" style={{ color: INK }}>Resumo rápido</div>
          <div className="space-y-2 text-sm" style={{ color: INK }}>
            <div className="flex justify-between"><span>Total de produtos</span><span className="font-bold">{store.products.length}</span></div>
            <div className="flex justify-between"><span>Produtos com stock baixo</span><span className="font-bold" style={{ color: alertasStock.length > 0 ? BRICK : GREEN }}>{alertasStock.length}</span></div>
            <div className="flex justify-between"><span>Total de clientes</span><span className="font-bold">{totalClientes}</span></div>
            <div className="flex justify-between"><span>Dívidas em aberto</span><span className="font-bold" style={{ color: dividasTotal > 0 ? BRICK : GREEN }}>{fmtMT(dividasTotal)}</span></div>
            <div className="flex justify-between"><span>Funcionários activos</span><span className="font-bold">{store.employees.filter((e) => e.active).length}</span></div>
          </div>
        </div>

        {/* Últimas vendas */}
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-xl p-4">
          <div className="text-sm font-semibold mb-3" style={{ color: INK }}>Últimas vendas</div>
          {vendasHoje.length === 0 ? (
            <div className="text-xs text-center py-8" style={{ color: MUTED }}>Sem vendas hoje</div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-auto">
              {vendasHoje.slice(-8).reverse().map((s) => (
                <div key={s.id} className="flex justify-between text-xs py-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <span style={{ color: MUTED }}>{new Date(s.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span style={{ color: INK }}>{(s.items || []).length} {(s.items || []).length === 1 ? "item" : "itens"}</span>
                  <span className="font-semibold" style={{ color: "#4F46E5" }}>{fmtMT(s.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
