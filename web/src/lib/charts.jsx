import { useState } from "react";
import { INK, TEAL, MUTED, BORDER, CARD } from "./theme.js";
import { fmtMT } from "./utils.js";
import { X } from "./icons.jsx";

export function AreaChart({ points, height = 70, color = TEAL, fill = "rgba(18,60,60,0.12)", labels }) {
  const [hover, setHover] = useState(null);
  if (!points || points.length === 0) return null;
  const max = Math.max(...points, 1);
  const w = 100;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const coords = points.map((v, i) => [i * step, height - (v / max) * (height - 8) - 4]);
  const linha = coords.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2)).join(" ");
  const area = linha + " L " + w + " " + height + " L 0 " + height + " Z";
  return (
    <div className="relative">
      <svg viewBox={"0 0 " + w + " " + height} preserveAspectRatio="none" style={{ width: "100%", height }} onMouseLeave={() => setHover(null)}>
        <path d={area} fill={fill} />
        <path d={linha} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        {coords.map(([x, y], i) => (
          <g key={i}>
            <rect x={x - step / 2} y="0" width={step} height={height} fill="transparent" onMouseEnter={() => setHover(i)} />
            {hover === i && <circle cx={x} cy={y} r="2.5" fill={color} vectorEffect="non-scaling-stroke" />}
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          style={{ background: INK, color: "#fff", left: Math.min(88, Math.max(2, (hover / Math.max(1, points.length - 1)) * 100)) + "%" }}
          className="absolute -top-1 text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap -translate-x-1/2"
        >
          {labels && labels[hover] ? labels[hover] + ": " : ""}
          {fmtMT(points[hover])}
        </div>
      )}
    </div>
  );
}

export function DonutChart({ data, size = 120 }) {
  const [hover, setHover] = useState(null);
  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) return null;
  const r = size / 2 - 10;
  const c = size / 2;
  let acc = 0;
  const cores = ["#123C3C", "#2E6E4E", "#C9973B", "#5B4FE0", "#B23A2E", "#2E5AAC", "#7C3AED"];
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => {
          const frac = d.value / total;
          const a0 = acc * 2 * Math.PI - Math.PI / 2;
          acc += frac;
          const a1 = acc * 2 * Math.PI - Math.PI / 2;
          const large = frac > 0.5 ? 1 : 0;
          const path = [
            "M", c + r * Math.cos(a0), c + r * Math.sin(a0),
            "A", r, r, 0, large, 1, c + r * Math.cos(a1), c + r * Math.sin(a1),
          ].join(" ");
          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={cores[i % cores.length]}
              strokeWidth={hover === i ? 20 : 15}
              onMouseEnter={() => setHover(i)}
              style={{ cursor: "pointer", transition: "stroke-width .12s" }}
            />
          );
        })}
        <text x={c} y={c - 2} textAnchor="middle" style={{ fontSize: 10, fill: MUTED }}>
          {hover !== null ? data[hover].label : "Total"}
        </text>
        <text x={c} y={c + 12} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: INK }}>
          {fmtMT(hover !== null ? data[hover].value : total)}
        </text>
      </svg>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span style={{ background: cores[i % cores.length] }} className="w-2.5 h-2.5 rounded-sm" />
            <span style={{ color: hover === i ? INK : MUTED }}>{d.label}</span>
            <span className="font-medium">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCardChart({ label, value, sub, points, labels, color }) {
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 overflow-hidden">
      <div className="text-xs" style={{ color: MUTED }}>
        {label}
      </div>
      <div style={{ color: color || TEAL }} className="text-xl font-semibold mt-1">
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: MUTED }}>
          {sub}
        </div>
      )}
      {points && points.length > 1 && (
        <div className="mt-2 -mx-3 -mb-3">
          <AreaChart points={points} labels={labels} height={46} color={color || TEAL} />
        </div>
      )}
    </div>
  );
}

// Painel flutuante com a evolução das vendas
export function FloatingChart({ sales, onClose }) {
  const dias = 14;
  const serie = [];
  const rotulos = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    rotulos.push(d.slice(8, 10) + "/" + d.slice(5, 7));
    serie.push(sales.filter((s) => s.status !== "void" && s.date.slice(0, 10) === d).reduce((a, s) => a + s.total, 0));
  }
  const totalPeriodo = serie.reduce((a, b) => a + b, 0);
  const metodos = {};
  sales.filter((s) => s.status !== "void").forEach((s) => s.payments.forEach((p) => (metodos[p.method] = (metodos[p.method] || 0) + p.amount)));
  const donut = Object.entries(metodos).map(([k, v]) => ({ label: k, value: v }));

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="fixed bottom-4 right-4 z-40 border rounded-xl shadow-2xl p-3 w-[320px] max-w-[92vw]">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold">Vendas — últimos 14 dias</div>
        <button onClick={onClose}>
          <X size={14} style={{ color: MUTED }} />
        </button>
      </div>
      <div style={{ color: TEAL }} className="text-xl font-bold">
        {fmtMT(totalPeriodo)}
      </div>
      <AreaChart points={serie} labels={rotulos} height={64} />
      {donut.length > 0 && (
        <div className="mt-2 pt-2" style={{ borderTop: "1px solid " + BORDER }}>
          <div className="text-[11px] font-semibold mb-1.5" style={{ color: MUTED }}>
            POR FORMA DE PAGAMENTO
          </div>
          <DonutChart data={donut} size={104} />
        </div>
      )}
    </div>
  );
}
