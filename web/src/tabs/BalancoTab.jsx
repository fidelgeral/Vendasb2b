import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, INK, GOLD, BRICK, GREEN, SOFTGOLD } from "../lib/theme.js";
import { fmtMT, getStock, isLowStock, nearExpiry, ROLE_LABELS } from "../lib/utils.js";
import { DonutChart, StatCardChart } from "../lib/charts.jsx";
import { exportReportExcel, exportReportPDF } from "../lib/print.js";
import { StatCard, ReportBlock, EmptyNote, BarRow } from "../components/Shared.jsx";

function ExportButtons({ title, columns, rows, meta }) {
  const disabled = !rows || rows.length === 0;
  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => exportReportExcel(title, columns, rows)}
        disabled={disabled}
        style={{ borderColor: BORDER, color: GREEN }}
        className="border rounded px-2.5 py-1 text-xs font-medium disabled:opacity-40"
      >
        Excel
      </button>
      <button
        onClick={() => exportReportPDF(title, columns, rows, meta)}
        disabled={disabled}
        style={{ background: BRICK, color: "#fff" }}
        className="rounded px-2.5 py-1 text-xs font-medium disabled:opacity-40"
      >
        PDF
      </button>
    </div>
  );
}

function ReportTable({ title, columns, rows, meta, note, align }) {
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {note && (
            <div className="text-xs" style={{ color: MUTED }}>
              {note}
            </div>
          )}
        </div>
        <ExportButtons title={title} columns={columns} rows={rows} meta={meta} />
      </div>
      {rows.length === 0 ? (
        <EmptyNote text="Sem dados para o período seleccionado." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#EFF3F1" }}>
                {columns.map((c, i) => (
                  <th key={c} style={{ color: MUTED, textAlign: align && align[i] === "r" ? "right" : "left" }} className="font-semibold uppercase tracking-wide px-2 py-2 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid " + BORDER }}>
                  {r.map((v, ci) => (
                    <td key={ci} style={{ textAlign: align && align[ci] === "r" ? "right" : "left" }} className="px-2 py-2 whitespace-nowrap">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function inPeriod(dateIso, from, to) {
  const d = dateIso.slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

const REPORTS = {
  vendas: [
    { id: "detalhado", label: "Detalhado" },
    { id: "abc", label: "Curva ABC" },
    { id: "top", label: "Top Produtos" },
    { id: "categoria", label: "Por Categoria" },
    { id: "equipe", label: "Equipa" },
    { id: "clientes", label: "Clientes" },
    { id: "horarios", label: "Melhores Horários" },
  ],
  financeiro: [
    { id: "dre", label: "Resultados (DRE)" },
    { id: "despesas", label: "Despesas por Categoria" },
    { id: "contabilidade", label: "Exportar p/ Contabilidade" },
    { id: "fechamento", label: "Fecho de Caixa" },
    { id: "iva", label: "Fiscal (IVA)" },
    { id: "movimentos", label: "Movimentos de Caixa" },
  ],
  estoque: [
    { id: "inventario", label: "Inventário" },
    { id: "ruptura", label: "Previsão de Ruptura" },
    { id: "auditoria", label: "Histórico & Quebras" },
    { id: "reposicao", label: "Reposição" },
    { id: "precos", label: "Histórico de Compras" },
    { id: "log", label: "Registo de Auditoria" },
  ],
};

export default function BalancoTab({ store }) {
  const [group, setGroup] = useState("vendas");
  const [report, setReport] = useState("detalhado");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const sales = store.sales.filter((s) => s.status !== "void" && inPeriod(s.date, from, to));
  const periodLabel = from || to ? "Período: " + (from || "início") + " a " + (to || "hoje") : "Período: todo o histórico";
  const meta = { business: store.config.businessName, period: periodLabel };

  const groups = [
    { id: "vendas", label: "VENDAS", color: "#5B4FE0" },
    { id: "financeiro", label: "FINANCEIRO", color: GREEN },
    { id: "estoque", label: "ESTOQUE", color: "#2E5AAC" },
  ];

  const selectGroup = (g) => {
    setGroup(g);
    setReport(REPORTS[g][0].id);
  };

  return (
    <div className="space-y-3">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
        {groups.map((g) => (
          <div key={g.id} className="flex items-center gap-2 flex-wrap">
            <button onClick={() => selectGroup(g.id)} style={{ color: g.color }} className="text-xs font-bold w-24 text-left shrink-0">
              {g.label}
            </button>
            <div className="flex gap-1.5 flex-wrap">
              {REPORTS[g.id].map((r) => {
                const active = group === g.id && report === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setGroup(g.id);
                      setReport(r.id);
                    }}
                    style={{ background: active ? g.color : "#EFF3F1", color: active ? "#fff" : INK, borderColor: active ? g.color : BORDER }}
                    className="border rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex gap-3 flex-wrap pt-2" style={{ borderTop: "1px solid " + BORDER }}>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>
              Período início
            </label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ borderColor: BORDER }} className="block border rounded px-2 py-1.5 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>
              Período final
            </label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ borderColor: BORDER }} className="block border rounded px-2 py-1.5 text-sm mt-1" />
          </div>
          {(from || to) && (
            <button onClick={() => { setFrom(""); setTo(""); }} style={{ color: TEAL }} className="text-xs font-medium self-end pb-2">
              Limpar período
            </button>
          )}
        </div>
      </div>

      {group === "vendas" && <VendasReports store={store} sales={sales} report={report} meta={meta} />}
      {group === "financeiro" && <FinanceiroReports store={store} sales={sales} report={report} meta={meta} from={from} to={to} />}
      {group === "estoque" && <EstoqueReports store={store} report={report} meta={meta} from={from} to={to} sales={sales} />}
    </div>
  );
}

function VendasReports({ store, sales, report, meta }) {
  const empName = (id) => (store.employees.find((e) => e.id === id) || {}).name || "—";
  const cliName = (id) => (store.clients.find((c) => c.id === id) || {}).name || "Consumidor Final";
  const prodCat = (name) => {
    const p = store.products.find((x) => x.name === name || name.startsWith(x.name));
    return p ? p.category : "—";
  };
  const lucro = (s) => s.items.reduce((a, it) => a + (it.price - it.cost) * it.qty, 0);

  const totalFat = sales.reduce((a, s) => a + s.total, 0);
  const totalLucro = sales.reduce((a, s) => a + lucro(s), 0);
  const totalDesc = sales.reduce((a, s) => a + (s.discount || 0), 0);

  const serieFat = [];
  const serieLuc = [];
  const serieRot = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const doDia = sales.filter((s) => s.date.slice(0, 10) === d);
    serieRot.push(d.slice(8, 10) + "/" + d.slice(5, 7));
    serieFat.push(doDia.reduce((a, s) => a + s.total, 0));
    serieLuc.push(doDia.reduce((a, s) => a + lucro(s), 0));
  }
  const metodosAgg = {};
  sales.forEach((s) => s.payments.forEach((p) => (metodosAgg[p.method] = (metodosAgg[p.method] || 0) + p.amount)));
  const donutPagamentos = Object.entries(metodosAgg).map(([k, v]) => ({ label: k, value: v }));

  if (report === "detalhado") {
    const rows = [...sales].reverse().map((s) => [
      "#" + s.id.slice(0, 6).toUpperCase(),
      new Date(s.date).toLocaleString("pt-PT"),
      cliName(s.clientId),
      empName(s.employeeId),
      fmtMT(s.discount || 0),
      fmtMT(s.total),
      fmtMT(lucro(s)),
      s.payments.map((p) => p.method + ": " + fmtMT(p.amount)).join(", "),
    ]);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard label="Nº de vendas" value={sales.length} />
          <StatCardChart label="Facturação" value={fmtMT(totalFat)} points={serieFat} labels={serieRot} />
          <StatCard label="Descontos" value={fmtMT(totalDesc)} />
          <StatCardChart label="Lucro" value={fmtMT(totalLucro)} points={serieLuc} labels={serieRot} color={GREEN} />
        </div>
        {donutPagamentos.length > 0 && (
          <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Distribuição por forma de pagamento</div>
            <DonutChart data={donutPagamentos} size={120} />
          </div>
        )}
        <ReportTable title="Extrato de Vendas" columns={["ID", "Data", "Cliente", "Vendedor", "Desconto", "Total", "Lucro", "Pagamento"]} rows={rows} meta={meta} align={["l", "l", "l", "l", "r", "r", "r", "l"]} />
      </div>
    );
  }

  if (report === "top") {
    const agg = {};
    sales.forEach((s) =>
      s.items.forEach((it) => {
        if (!agg[it.name]) agg[it.name] = { qty: 0, fat: 0, luc: 0 };
        agg[it.name].qty += it.qty;
        agg[it.name].fat += it.price * it.qty;
        agg[it.name].luc += (it.price - it.cost) * it.qty;
      })
    );
    const list = Object.entries(agg).sort((a, b) => b[1].fat - a[1].fat);
    const rows = list.map(([name, v], i) => ["#" + (i + 1), name, prodCat(name), v.qty, fmtMT(v.fat), fmtMT(v.luc), (v.fat ? ((v.luc / v.fat) * 100).toFixed(1) : "0") + "%"]);
    return <ReportTable title="Top Produtos" columns={["#", "Produto", "Categoria", "Qtd", "Facturação", "Lucro", "Margem"]} rows={rows} meta={meta} align={["l", "l", "l", "r", "r", "r", "r"]} />;
  }

  if (report === "abc") {
    const agg = {};
    sales.forEach((s) =>
      s.items.forEach((it) => {
        if (!agg[it.name]) agg[it.name] = { qty: 0, fat: 0, luc: 0 };
        agg[it.name].qty += it.qty;
        agg[it.name].fat += it.price * it.qty;
        agg[it.name].luc += (it.price - it.cost) * it.qty;
      })
    );
    const list = Object.entries(agg).sort((a, b) => b[1].fat - a[1].fat);
    const grand = list.reduce((a, [, v]) => a + v.fat, 0);
    let acum = 0;
    const rows = list.map(([name, v], i) => {
      acum += v.fat;
      const pctAcum = grand ? (acum / grand) * 100 : 0;
      const classe = pctAcum <= 80 ? "A" : pctAcum <= 95 ? "B" : "C";
      return ["#" + (i + 1), name, classe, v.qty, fmtMT(v.fat), (grand ? (v.fat / grand) * 100 : 0).toFixed(1) + "%", pctAcum.toFixed(1) + "%", fmtMT(v.luc)];
    });
    const contA = rows.filter((r) => r[2] === "A").length;
    const contB = rows.filter((r) => r[2] === "B").length;
    const contC = rows.filter((r) => r[2] === "C").length;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard label="Classe A" value={contA} sub="80% da facturação" />
          <StatCard label="Classe B" value={contB} sub="próximos 15%" />
          <StatCard label="Classe C" value={contC} sub="últimos 5%" />
        </div>
        <ReportTable title="Curva ABC de Produtos" note="A = onde está o seu dinheiro: nunca deixe faltar. C = candidatos a descontinuar." columns={["#", "Produto", "Classe", "Qtd", "Facturação", "Peso", "Acumulado", "Lucro"]} rows={rows} meta={meta} align={["l", "l", "l", "r", "r", "r", "r", "r"]} />
      </div>
    );
  }

  if (report === "categoria") {
    const agg = {};
    sales.forEach((s) =>
      s.items.forEach((it) => {
        const c = prodCat(it.name);
        if (!agg[c]) agg[c] = { qty: 0, fat: 0, luc: 0 };
        agg[c].qty += it.qty;
        agg[c].fat += it.price * it.qty;
        agg[c].luc += (it.price - it.cost) * it.qty;
      })
    );
    const list = Object.entries(agg).sort((a, b) => b[1].fat - a[1].fat);
    const grand = list.reduce((a, [, v]) => a + v.fat, 0);
    const rows = list.map(([c, v], i) => ["#" + (i + 1), c, v.qty, fmtMT(v.fat), fmtMT(v.luc), (v.fat ? ((v.luc / v.fat) * 100).toFixed(1) : "0") + "%", (grand ? ((v.fat / grand) * 100).toFixed(1) : "0") + "%"]);
    return (
      <div className="space-y-3">
        <ReportTable title="Desempenho por Categoria" columns={["#", "Categoria", "Itens", "Facturação", "Lucro", "Margem", "Quota"]} rows={rows} meta={meta} align={["l", "l", "r", "r", "r", "r", "r"]} />
        <ReportBlock title="Ranking por categoria">
          {list.length === 0 && <EmptyNote text="Sem vendas no período." />}
          {list.slice(0, 8).map(([c, v]) => (
            <BarRow key={c} label={c} value={Math.round(v.fat)} max={Math.round(list[0][1].fat)} />
          ))}
        </ReportBlock>
      </div>
    );
  }

  if (report === "equipe") {
    const agg = {};
    sales.forEach((s) => {
      const k = s.employeeId || "—";
      if (!agg[k]) agg[k] = { qtd: 0, fat: 0, luc: 0 };
      agg[k].qtd += 1;
      agg[k].fat += s.total;
      agg[k].luc += lucro(s);
    });
    const rows = Object.entries(agg)
      .sort((a, b) => b[1].fat - a[1].fat)
      .map(([id, v]) => {
        const e = store.employees.find((x) => x.id === id) || {};
        return [e.name || "—", ROLE_LABELS[e.role] || "—", v.qtd, fmtMT(v.fat), fmtMT(v.luc)];
      });
    return <ReportTable title="Performance por Funcionário" columns={["Funcionário", "Função", "Vendas", "Facturado", "Lucro"]} rows={rows} meta={meta} align={["l", "l", "r", "r", "r"]} />;
  }

  if (report === "clientes") {
    const agg = {};
    sales.forEach((s) => {
      const k = s.clientId || "—";
      if (!agg[k]) agg[k] = { compras: 0, gasto: 0, luc: 0, last: s.date, fav: {} };
      agg[k].compras += 1;
      agg[k].gasto += s.total;
      agg[k].luc += lucro(s);
      if (s.date > agg[k].last) agg[k].last = s.date;
      s.items.forEach((it) => (agg[k].fav[it.name] = (agg[k].fav[it.name] || 0) + it.qty));
    });
    const rows = Object.entries(agg)
      .sort((a, b) => b[1].gasto - a[1].gasto)
      .map(([id, v], i) => {
        const c = store.clients.find((x) => x.id === id) || {};
        const fav = Object.entries(v.fav).sort((a, b) => b[1] - a[1])[0];
        const divida = (c.debts || []).reduce((a, d) => a + d.amount, 0);
        return ["#" + (i + 1), c.name || "Consumidor Final", c.phone || "—", fav ? fav[0] : "—", v.compras, fmtMT(v.gasto), fmtMT(v.luc), fmtMT(divida), new Date(v.last).toLocaleDateString("pt-PT")];
      });
    return <ReportTable title="Comportamento de Clientes (CRM)" note="Ranking por volume e lucratividade" columns={["#", "Cliente", "Contacto", "Favorito", "Compras", "Gasto Total", "Lucro", "Dívida", "Últ. Compra"]} rows={rows} meta={meta} align={["l", "l", "l", "l", "r", "r", "r", "r", "l"]} />;
  }

  if (report === "horarios") {
    const byHour = {};
    const byDay = {};
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    sales.forEach((s) => {
      const d = new Date(s.date);
      const h = d.getHours();
      byHour[h] = (byHour[h] || 0) + s.total;
      byDay[d.getDay()] = (byDay[d.getDay()] || 0) + s.total;
    });
    const rows = Object.entries(byHour)
      .sort((a, b) => b[1] - a[1])
      .map(([h, v]) => [String(h).padStart(2, "0") + ":00 - " + String(Number(h) + 1).padStart(2, "0") + ":00", fmtMT(v)]);
    const dayRows = Object.entries(byDay).sort((a, b) => b[1] - a[1]);
    return (
      <div className="space-y-3">
        <ReportTable title="Facturação por Hora" columns={["Faixa horária", "Facturação"]} rows={rows} meta={meta} align={["l", "r"]} />
        <ReportBlock title="Melhores dias da semana">
          {dayRows.length === 0 && <EmptyNote text="Sem vendas no período." />}
          {dayRows.map(([d, v]) => (
            <BarRow key={d} label={dias[d]} value={Math.round(v)} max={Math.round(dayRows[0][1])} />
          ))}
        </ReportBlock>
      </div>
    );
  }
  return null;
}

function FinanceiroReports({ store, sales, report, meta, from, to }) {
  const lucro = (s) => s.items.reduce((a, it) => a + (it.price - it.cost) * it.qty, 0);
  const movs = store.movimentosCaixa.filter((m) => inPeriod(m.date, from, to));
  const quebras = store.quebras.filter((q) => inPeriod(q.date, from, to));

  if (report === "dre") {
    const faturamento = sales.reduce((a, s) => a + s.total, 0);
    const lucroBruto = sales.reduce((a, s) => a + lucro(s), 0);
    const perdas = quebras.reduce((a, q) => a + q.custoImpacto, 0);
    const saidas = movs.filter((m) => m.type === "saida").reduce((a, m) => a + m.amount, 0);
    const entradas = movs.filter((m) => m.type === "entrada").reduce((a, m) => a + m.amount, 0);
    const dividas = store.clients.reduce((a, c) => a + c.debts.reduce((x, d) => x + d.amount, 0), 0);
    const lucroReal = lucroBruto - perdas - saidas + entradas;
    const serieDre = (() => {
      const fat = [], luc = [], rot = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const doDia = sales.filter((s) => s.date.slice(0, 10) === d);
        rot.push(d.slice(8, 10) + "/" + d.slice(5, 7));
        fat.push(doDia.reduce((a, s) => a + s.total, 0));
        luc.push(doDia.reduce((a, s) => a + lucro(s), 0));
      }
      return { fat, luc, rot };
    })();
    const rows = [
      ["Facturação total", fmtMT(faturamento)],
      ["Lucro bruto (receita − custo)", fmtMT(lucroBruto)],
      ["Quebras / perdas de stock", "-" + fmtMT(perdas)],
      ["Saídas de caixa (despesas)", "-" + fmtMT(saidas)],
      ["Entradas extra de caixa", "+" + fmtMT(entradas)],
      ["Resultado líquido estimado", fmtMT(lucroReal)],
      ["Dívidas de clientes (a receber)", fmtMT(dividas)],
    ];
    return (
      <div className="space-y-3">
        <div style={{ background: lucroReal >= 0 ? "#E4F4EA" : "#FBE9E7", borderColor: lucroReal >= 0 ? "#8FCBA6" : "#F0C6C0" }} className="border rounded-lg p-4">
          <div className="text-xs" style={{ color: MUTED }}>
            Resultado líquido estimado no período
          </div>
          <div style={{ color: lucroReal >= 0 ? GREEN : BRICK }} className="text-3xl font-semibold mt-1">
            {fmtMT(lucroReal)}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCardChart label="Facturação" value={fmtMT(faturamento)} points={serieDre.fat} labels={serieDre.rot} />
          <StatCardChart label="Lucro bruto" value={fmtMT(lucroBruto)} points={serieDre.luc} labels={serieDre.rot} color={GREEN} />
          <StatCard label="Perdas" value={fmtMT(perdas)} />
          <StatCard label="A receber" value={fmtMT(dividas)} />
        </div>
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
          <div className="text-sm font-semibold mb-2">Composição do resultado</div>
          <DonutChart
            data={[
              { label: "Lucro líquido", value: Math.max(0, lucroReal) },
              { label: "Perdas", value: perdas },
              { label: "Despesas", value: saidas },
            ].filter((d) => d.value > 0)}
            size={120}
          />
        </div>
        <ReportTable title="Demonstração de Resultados" columns={["Rubrica", "Valor"]} rows={rows} meta={meta} align={["l", "r"]} />
      </div>
    );
  }

  if (report === "despesas") {
    const agg = {};
    movs.forEach((m) => {
      const k = (m.type === "saida" ? "Saída · " : "Entrada · ") + (m.categoria || "Outros");
      agg[k] = (agg[k] || 0) + m.amount;
    });
    const list = Object.entries(agg).sort((a, b) => b[1] - a[1]);
    const rows = list.map(([k, v]) => [k, fmtMT(v)]);
    const totalSaidas = movs.filter((m) => m.type === "saida").reduce((a, m) => a + m.amount, 0);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Total de despesas" value={fmtMT(totalSaidas)} />
          <StatCard label="Categorias usadas" value={list.length} />
        </div>
        <ReportTable title="Movimentos por Categoria" columns={["Categoria", "Total"]} rows={rows} meta={meta} align={["l", "r"]} />
        <ReportBlock title="Peso de cada categoria">
          {list.length === 0 && <EmptyNote text="Sem movimentos no período." />}
          {list.map(([k, v]) => (
            <BarRow key={k} label={k} value={Math.round(v)} max={Math.round(list[0][1])} />
          ))}
        </ReportBlock>
      </div>
    );
  }

  if (report === "contabilidade") {
    const iva = store.config.iva || {};
    const taxa = iva.isento ? 0 : Number(iva.taxa) || 0;
    const emp = store.config.empresa || {};
    const rows = [...sales].reverse().map((s) => {
      const bruto = s.total;
      const base = iva.precosIncluemIva && taxa ? bruto / (1 + taxa / 100) : bruto;
      const valorIva = iva.precosIncluemIva && taxa ? bruto - base : bruto * (taxa / 100);
      const cli = store.clients.find((c) => c.id === s.clientId);
      return [
        s.numero || s.id,
        new Date(s.date).toLocaleDateString("pt-PT"),
        cli ? cli.name : "Consumidor Final",
        cli && cli.nuit ? cli.nuit : "",
        base.toFixed(2),
        taxa + "%",
        valorIva.toFixed(2),
        bruto.toFixed(2),
        s.payments.map((p) => p.method).join("/"),
      ];
    });
    return (
      <div className="space-y-3">
        <div style={{ background: SOFTGOLD, borderColor: GOLD }} className="border rounded-lg p-3 text-xs">
          Ficheiro pronto a entregar ao contabilista: uma linha por documento, com base tributável, IVA e total. Exporte em Excel e envie mensalmente.
          Empresa: {emp.nome || store.config.businessName} {emp.nuit ? "· NUIT " + emp.nuit : ""}
        </div>
        <ReportTable title="Mapa de Vendas para Contabilidade" columns={["Documento", "Data", "Cliente", "NUIT", "Base", "Taxa", "IVA", "Total", "Meio pgto"]} rows={rows} meta={meta} align={["l", "l", "l", "l", "r", "r", "r", "r", "l"]} />
      </div>
    );
  }

  if (report === "fechamento") {
    const shifts = store.shifts.filter((s) => inPeriod(s.openedAt, from, to));
    const rows = [...shifts].reverse().map((s) => {
      const dif = s.closedAt ? (s.closingCash || 0) - (s.expectedCash || 0) : null;
      return [
        new Date(s.openedAt).toLocaleString("pt-PT"),
        s.closedAt ? new Date(s.closedAt).toLocaleString("pt-PT") : "Em aberto",
        fmtMT(s.openingCash || 0),
        s.closedAt ? fmtMT(s.expectedCash || 0) : "—",
        s.closedAt ? fmtMT(s.closingCash || 0) : "—",
        dif === null ? "—" : (dif > 0 ? "+" : "") + fmtMT(dif),
        dif === null ? "Aberto" : dif === 0 ? "Certo" : dif > 0 ? "Sobra" : "Quebra",
      ];
    });
    return <ReportTable title="Fecho de Caixa" columns={["Abertura", "Fecho", "Fundo inicial", "Esperado", "Contado", "Diferença", "Estado"]} rows={rows} meta={meta} align={["l", "l", "r", "r", "r", "r", "l"]} />;
  }

  if (report === "iva") {
    const iva = store.config.iva || {};
    const taxa = iva.isento ? 0 : Number(iva.taxa) || 0;
    const rows = [...sales].reverse().map((s) => {
      const base = iva.precosIncluemIva && taxa ? s.total / (1 + taxa / 100) : s.total;
      const valorIva = iva.precosIncluemIva && taxa ? s.total - base : s.total * (taxa / 100);
      return ["#" + s.id.slice(0, 6).toUpperCase(), new Date(s.date).toLocaleDateString("pt-PT"), fmtMT(base), taxa + "%", fmtMT(valorIva), fmtMT(iva.precosIncluemIva ? s.total : s.total + valorIva)];
    });
    const totalIva = [...sales].reverse().reduce((a, s) => {
      const base = iva.precosIncluemIva && taxa ? s.total / (1 + taxa / 100) : s.total;
      return a + (iva.precosIncluemIva && taxa ? s.total - base : s.total * (taxa / 100));
    }, 0);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Taxa aplicada" value={iva.isento ? "Isento" : taxa + "%"} sub={iva.precosIncluemIva ? "preços com IVA incluído" : "IVA acrescido"} />
          <StatCard label="IVA do período" value={fmtMT(totalIva)} />
        </div>
        <ReportTable title="Mapa Fiscal (IVA)" note="Valores calculados pelo sistema — confirme sempre com o seu contabilista antes de submeter à Autoridade Tributária." columns={["Documento", "Data", "Base tributável", "Taxa", "IVA", "Total"]} rows={rows} meta={meta} align={["l", "l", "r", "r", "r", "r"]} />
      </div>
    );
  }

  if (report === "movimentos") {
    const entradas = movs.filter((m) => m.type === "entrada").reduce((a, m) => a + m.amount, 0);
    const saidas = movs.filter((m) => m.type === "saida").reduce((a, m) => a + m.amount, 0);
    const vendasPorMetodo = {};
    sales.forEach((s) => s.payments.forEach((p) => (vendasPorMetodo[p.method] = (vendasPorMetodo[p.method] || 0) + p.amount)));
    const rows = [...movs].reverse().map((m) => [new Date(m.date).toLocaleString("pt-PT"), m.motivo || (m.type === "entrada" ? "Entrada" : "Saída"), m.type === "entrada" ? "ENTRADA" : "SAÍDA", (m.type === "entrada" ? "+" : "-") + fmtMT(m.amount)]);
    const metodoRows = Object.entries(vendasPorMetodo).map(([k, v]) => [k, fmtMT(v)]);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard label="Total entradas" value={fmtMT(entradas)} />
          <StatCard label="Total saídas" value={fmtMT(saidas)} />
          <StatCard label="Saldo do período" value={fmtMT(entradas - saidas)} />
        </div>
        <ReportTable title="Recebimentos por Forma de Pagamento" columns={["Forma de pagamento", "Total recebido"]} rows={metodoRows} meta={meta} align={["l", "r"]} />
        <ReportTable title="Extrato de Movimentos de Caixa" columns={["Data", "Descrição", "Tipo", "Valor"]} rows={rows} meta={meta} align={["l", "l", "l", "r"]} />
      </div>
    );
  }
  return null;
}

function EstoqueReports({ store, report, meta, from, to }) {
  if (report === "inventario") {
    const custoTotal = store.products.reduce((a, p) => a + (p.cost || 0) * getStock(p, store.products), 0);
    const vendaPot = store.products.reduce((a, p) => a + (p.price || 0) * getStock(p, store.products), 0);
    const rows = store.products.map((p) => {
      const st = getStock(p, store.products);
      const estado = st <= 0 ? "Esgotado" : isLowStock(p, store.products) ? "Baixo stock" : nearExpiry(p).length ? "A vencer" : "Normal";
      return [p.name, p.category || "—", estado, st + " " + (p.unit || "un"), fmtMT(p.cost || 0), fmtMT(p.price || 0), fmtMT((p.cost || 0) * st), fmtMT((p.price || 0) * st)];
    });
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <StatCard label="Custo total do stock" value={fmtMT(custoTotal)} sub="dinheiro investido" />
          <StatCard label="Venda potencial" value={fmtMT(vendaPot)} sub="se vender tudo" />
          <StatCard label="Margem potencial" value={fmtMT(vendaPot - custoTotal)} />
        </div>
        <ReportTable title="Posição de Inventário" columns={["Produto", "Categoria", "Estado", "Stock", "Custo un.", "Preço un.", "Custo total", "Venda total"]} rows={rows} meta={meta} align={["l", "l", "l", "r", "r", "r", "r", "r"]} />
      </div>
    );
  }

  if (report === "ruptura") {
    const dias = 30;
    const desde = new Date(Date.now() - dias * 86400000).toISOString();
    const vendasRecentes = store.sales.filter((s) => s.status !== "void" && s.date >= desde);
    const consumo = {};
    vendasRecentes.forEach((s) => s.items.forEach((it) => (consumo[it.productId] = (consumo[it.productId] || 0) + it.qty)));
    const rows = store.products
      .map((p) => {
        const total = consumo[p.id] || 0;
        const porDia = total / dias;
        const st = getStock(p, store.products);
        const diasRestantes = porDia > 0 ? st / porDia : null;
        return { p, porDia, st, diasRestantes };
      })
      .filter((r) => r.porDia > 0)
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .map((r) => [
        r.p.name,
        r.p.category || "—",
        r.st + " " + (r.p.unit || "un"),
        r.porDia.toFixed(2),
        r.diasRestantes === null ? "—" : Math.floor(r.diasRestantes) + " dias",
        r.diasRestantes === null ? "—" : new Date(Date.now() + r.diasRestantes * 86400000).toLocaleDateString("pt-PT"),
        r.diasRestantes < 3 ? "CRÍTICO" : r.diasRestantes < 7 ? "Atenção" : "Normal",
      ]);
    const criticos = rows.filter((r) => r[6] === "CRÍTICO").length;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Produtos em risco" value={criticos} sub="acabam em menos de 3 dias" />
          <StatCard label="Produtos analisados" value={rows.length} sub="com vendas nos últimos 30 dias" />
        </div>
        <ReportTable title="Previsão de Ruptura de Stock" note="Baseado na média de consumo dos últimos 30 dias. Produtos sem vendas recentes não aparecem." columns={["Produto", "Categoria", "Stock", "Consumo/dia", "Dura", "Acaba em", "Estado"]} rows={rows} meta={meta} align={["l", "l", "r", "r", "r", "l", "l"]} />
      </div>
    );
  }

  if (report === "precos") {
    const rows = [...store.purchases]
      .reverse()
      .map((c) => {
        const p = store.products.find((x) => x.id === c.productId) || {};
        const f = store.suppliers.find((s) => s.id === c.supplierId) || {};
        return [new Date(c.date).toLocaleDateString("pt-PT"), p.name || "—", f.name || "—", c.qty, fmtMT(c.cost), fmtMT(c.total)];
      });
    return <ReportTable title="Histórico de Compras e Preços" note="Compare o custo unitário ao longo do tempo para detectar subidas de preço dos fornecedores." columns={["Data", "Produto", "Fornecedor", "Qtd", "Custo un.", "Total"]} rows={rows} meta={meta} align={["l", "l", "l", "r", "r", "r"]} />;
  }

  if (report === "log") {
    const registos = (store.audit || []).filter((a) => inPeriod(a.date, from, to));
    const rows = [...registos].reverse().map((a) => [new Date(a.date).toLocaleString("pt-PT"), a.employeeName || "—", a.acao, a.detalhe, a.valor === null ? "—" : fmtMT(a.valor)]);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Registos no período" value={registos.length} />
          <StatCard label="Cancelamentos" value={registos.filter((a) => a.acao === "CANCELAMENTO").length} />
        </div>
        <ReportTable title="Registo de Auditoria" note="Quem fez o quê e quando: vendas, cancelamentos, descontos, quebras e movimentos de caixa." columns={["Data/Hora", "Utilizador", "Acção", "Detalhe", "Valor"]} rows={rows} meta={meta} align={["l", "l", "l", "l", "r"]} />
      </div>
    );
  }

  if (report === "auditoria") {
    const quebras = store.quebras.filter((q) => inPeriod(q.date, from, to));
    const rows = [...quebras].reverse().map((q) => {
      const p = store.products.find((x) => x.id === q.productId) || {};
      return [new Date(q.date).toLocaleString("pt-PT"), p.name || "—", p.category || "—", q.motivo, q.qty, fmtMT(q.custoImpacto)];
    });
    const total = quebras.reduce((a, q) => a + q.custoImpacto, 0);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Ocorrências" value={quebras.length} />
          <StatCard label="Perda total" value={fmtMT(total)} />
        </div>
        <ReportTable title="Auditoria de Quebras e Perdas" columns={["Data/Hora", "Produto", "Categoria", "Motivo", "Qtd", "Custo"]} rows={rows} meta={meta} align={["l", "l", "l", "l", "r", "r"]} />
      </div>
    );
  }

  if (report === "reposicao") {
    const list = store.products.filter((p) => isLowStock(p, store.products) || getStock(p, store.products) <= 0);
    const rows = list.map((p) => {
      const st = getStock(p, store.products);
      const sugerido = Math.max((p.minStock || 0) * 2 - st, 1);
      return [p.name, p.category || "—", st + " " + (p.unit || "un"), (p.minStock || 0) + " " + (p.unit || "un"), sugerido + " " + (p.unit || "un"), fmtMT(sugerido * (p.cost || 0))];
    });
    const investimento = list.reduce((a, p) => {
      const sugerido = Math.max((p.minStock || 0) * 2 - getStock(p, store.products), 1);
      return a + sugerido * (p.cost || 0);
    }, 0);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Produtos a repor" value={list.length} />
          <StatCard label="Investimento estimado" value={fmtMT(investimento)} />
        </div>
        <ReportTable title="Sugestão de Reposição" note="Quantidade sugerida = o dobro do stock mínimo, menos o que resta." columns={["Produto", "Categoria", "Stock actual", "Stock mínimo", "Comprar", "Custo estimado"]} rows={rows} meta={meta} align={["l", "l", "r", "r", "r", "r"]} />
      </div>
    );
  }
  return null;
}
