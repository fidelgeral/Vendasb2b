import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, INK, GOLD, BRICK, BG, PRICE_GREEN, GREEN, SOFTGOLD } from "../lib/theme.js";
import { fmtMT, getStock, isLowStock, compressImageFile } from "../lib/utils.js";
import { Bell, AlertTriangle, ImageOff, Link2, Package, Percent, Split, X } from "../lib/icons.jsx";

export function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
      <div className="text-xs" style={{ color: MUTED }}>
        {label}
      </div>
      <div style={{ color: TEAL }} className="text-xl font-semibold mt-1">
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: MUTED }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function ReportBlock({ title, children }) {
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}

export function EmptyNote({ text }) {
  return (
    <div className="text-xs" style={{ color: MUTED }}>
      {text}
    </div>
  );
}

export function BarRow({ label, value, max }) {
  return (
    <div className="flex items-center gap-2 text-sm py-0.5">
      <div className="w-32 truncate">{label}</div>
      <div style={{ background: BORDER }} className="flex-1 h-2 rounded">
        <div style={{ background: GOLD, width: `${(value / max) * 100}%` }} className="h-2 rounded" />
      </div>
      <div className="w-8 text-right text-xs" style={{ color: MUTED }}>
        {value}
      </div>
    </div>
  );
}

export function NotificationBell({ alerts, onGo }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} style={{ background: "rgba(255,255,255,0.15)" }} className="relative p-2 rounded">
        <Bell size={16} color="#fff" />
        {alerts.length > 0 && (
          <span style={{ background: BRICK }} className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ background: CARD, borderColor: BORDER }} className="absolute right-0 mt-2 w-64 border rounded-lg shadow-lg z-50 max-h-72 overflow-auto text-left">
          <div style={{ borderBottom: `1px solid ${BORDER}`, color: INK }} className="p-2 text-xs font-semibold">
            Notificações
          </div>
          {alerts.length === 0 && (
            <div style={{ color: MUTED }} className="p-3 text-xs">
              Sem alertas por agora.
            </div>
          )}
          {alerts.map((a, i) => (
            <button
              key={i}
              onClick={() => {
                onGo(a.tab);
                setOpen(false);
              }}
              style={{ borderBottom: `1px solid ${BORDER}`, color: INK }}
              className="w-full text-left p-2 text-xs flex items-start gap-2 hover:bg-black/5"
            >
              <AlertTriangle size={13} style={{ color: a.color || GOLD, marginTop: 1 }} />
              <span>{a.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Foto de produto: comprimida no browser e guardada como data URL (sem serviço de storage à parte).
export function PhotoPicker({ value, onChange }) {
  const [mode, setMode] = useState("upload");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      // ignora silenciosamente
    }
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {value ? (
        <img src={value} alt="" style={{ borderColor: BORDER }} className="w-12 h-12 rounded object-cover border" />
      ) : (
        <div style={{ background: BG, borderColor: BORDER }} className="w-12 h-12 rounded border flex items-center justify-center">
          <ImageOff size={16} style={{ color: MUTED }} />
        </div>
      )}
      <div className="flex-1">
        <div className="flex gap-2 mb-1">
          <button type="button" onClick={() => setMode("upload")} style={{ color: mode === "upload" ? TEAL : MUTED }} className="text-xs font-medium">
            Carregar do PC
          </button>
          <span style={{ color: MUTED }} className="text-xs">
            ·
          </span>
          <button type="button" onClick={() => setMode("url")} style={{ color: mode === "url" ? TEAL : MUTED }} className="text-xs font-medium flex items-center gap-1">
            <Link2 size={11} /> Usar URL
          </button>
        </div>
        {mode === "upload" ? (
          <>
            <input type="file" accept="image/*" onChange={handleFile} className="text-xs w-full" disabled={uploading} />
            {uploading && (
              <div className="text-xs" style={{ color: MUTED }}>
                A carregar…
              </div>
            )}
          </>
        ) : (
          <div className="flex gap-1">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://…"
              style={{ borderColor: BORDER }}
              className="border rounded px-2 py-1 text-xs flex-1"
            />
            <button type="button" onClick={() => onChange(urlInput)} style={{ color: TEAL }} className="text-xs font-medium">
              Usar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductCard({ p, onClick, disabled, produtos, compact }) {
  const stock = getStock(p, produtos);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: CARD, borderColor: BORDER, opacity: disabled ? 0.45 : 1 }}
      className="border rounded-xl overflow-hidden text-left hover:shadow-md transition disabled:cursor-not-allowed flex flex-col"
    >
      <div style={{ background: BG }} className={"w-full flex items-center justify-center overflow-hidden " + (compact ? "aspect-[5/3]" : "aspect-[4/3]")}>
        {p.foto ? <img src={p.foto} alt={p.name} className="w-full h-full object-cover" /> : <Package size={compact ? 20 : 26} style={{ color: MUTED }} />}
      </div>
      <div className={compact ? "p-1.5" : "p-2.5"}>
        <div className={"font-medium leading-snug truncate " + (compact ? "text-xs" : "text-sm")}>{p.name}</div>
        <div style={{ color: isLowStock(p, produtos) ? BRICK : MUTED }} className="text-[10px] mt-0.5">
          {stock <= 0 ? "Sem stock" : `${stock}${p.unit !== "un" ? p.unit : " un"}`}
        </div>
        <div style={{ color: PRICE_GREEN }} className={"font-bold " + (compact ? "text-sm" : "text-base mt-1")}>
          {fmtMT(p.price)}
        </div>
      </div>
    </button>
  );
}

export function VoidModal({ onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-2">Cancelar venda</div>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo do cancelamento"
          style={{ borderColor: BORDER }}
          className="w-full border rounded px-2 py-1.5 text-sm mb-3"
        />
        <button onClick={() => onConfirm(reason)} style={{ background: BRICK, color: "#fff" }} className="w-full rounded py-2 text-sm font-medium">
          Confirmar cancelamento
        </button>
      </div>
    </div>
  );
}

export function CategoriasModal({ categories, onAdd, onRemove, onClose }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">Categorias</div>
        <div className="flex gap-2 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nova categoria"
            style={{ borderColor: BORDER }}
            className="flex-1 border rounded px-2 py-1.5 text-sm"
          />
          <button
            onClick={() => {
              if (name.trim()) {
                onAdd(name.trim());
                setName("");
              }
            }}
            style={{ background: TEAL, color: "#fff" }}
            className="rounded px-3 py-1.5 text-sm"
          >
            Adicionar
          </button>
        </div>
        <div className="space-y-1 max-h-56 overflow-auto">
          {categories.map((c) => (
            <div key={c} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-1.5 text-sm flex items-center justify-between">
              <span>{c}</span>
              <button onClick={() => onRemove(c)}>
                <X size={14} style={{ color: BRICK }} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-xs" style={{ color: MUTED }}>
              Ainda não há categorias.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================= Checkout partilhado =================
export function CheckoutPanel({ items, extraChargePct = 0, clients, canDiscount, onConfirm, label = "Total", paymentMethods, ivaConfig, config }) {
  const [discount, setDiscount] = useState(0);
  const [clientId, setClientId] = useState("");
  const [recebido, setRecebido] = useState("");
  const [usarPontos, setUsarPontos] = useState(false);
  const [split, setSplit] = useState(false);
  const [splitLines, setSplitLines] = useState([{ method: "dinheiro", amount: "" }]);

  const cliente = clients.find((c) => c.id === clientId);
  const valorPorPonto = (config && config.valorPorPonto) || 1;
  const pontosDisponiveis = cliente ? cliente.points || 0 : 0;
  const subtotal = items.reduce((s, l) => s + l.price * l.qty, 0);
  const serviceCharge = subtotal * (extraChargePct / 100);
  const descontoPontos = usarPontos ? Math.min(pontosDisponiveis * valorPorPonto, subtotal + serviceCharge) : 0;
  const pontosUsados = usarPontos ? Math.ceil(descontoPontos / valorPorPonto) : 0;
  const afterDiscount = Math.max(0, subtotal + serviceCharge - Number(discount || 0) - descontoPontos);
  const ivaRate = ivaConfig?.isento ? 0 : Number(ivaConfig?.taxa) || 0;
  const ivaOnTop = !ivaConfig?.isento && ivaRate > 0 && !ivaConfig?.precosIncluemIva;
  const ivaAmount = ivaOnTop ? afterDiscount * (ivaRate / 100) : 0;
  const ivaIncluded = !ivaConfig?.isento && ivaRate > 0 && ivaConfig?.precosIncluemIva;
  const total = afterDiscount + ivaAmount;

  const addSplitLine = () => setSplitLines((s) => [...s, { method: "dinheiro", amount: "" }]);
  const updateSplitLine = (i, field, val) => setSplitLines((s) => s.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)));
  const removeSplitLine = (i) => setSplitLines((s) => s.filter((_, idx) => idx !== i));
  const splitSum = splitLines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const needsClient = split ? splitLines.some((l) => l.method === "fiado") : false;

  const dividaActual = cliente ? (cliente.debts || []).reduce((a, d) => a + d.amount, 0) : 0;
  const limite = cliente ? cliente.creditLimit || 0 : 0;
  const fiadoBloqueado = !!cliente && limite > 0 && dividaActual + total > limite;
  const trocoDevido = Number(recebido || 0) - total;

  const confirmSingle = (methodId) => {
    if (methodId === "fiado" && !clientId) return;
    if (methodId === "fiado" && fiadoBloqueado) return;
    onConfirm({ total, discount: Number(discount || 0), payments: [{ method: methodId, amount: total }], clientId: clientId || null, pontosUsados });
  };
  const confirmSplit = () => {
    if (Math.round(splitSum) !== Math.round(total)) return;
    if (needsClient && !clientId) return;
    onConfirm({
      total,
      discount: Number(discount || 0),
      payments: splitLines.map((l) => ({ method: l.method, amount: Number(l.amount || 0) })),
      clientId: clientId || null,
      pontosUsados,
    });
  };

  return (
    <div>
      {extraChargePct > 0 && (
        <div className="flex justify-between text-xs mb-1" style={{ color: MUTED }}>
          <span>Serviço ({extraChargePct}%)</span>
          <span>{fmtMT(serviceCharge)}</span>
        </div>
      )}
      {canDiscount && (
        <div className="flex items-center gap-2 mb-2">
          <Percent size={13} style={{ color: MUTED }} />
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="Desconto (MT)"
            style={{ borderColor: BORDER }}
            className="border rounded px-2 py-1 text-xs flex-1"
          />
        </div>
      )}
      {ivaOnTop && (
        <div className="flex justify-between text-xs mb-1" style={{ color: MUTED }}>
          <span>IVA ({ivaRate}%)</span>
          <span>+{fmtMT(ivaAmount)}</span>
        </div>
      )}
      {ivaIncluded && (
        <div className="text-xs mb-1" style={{ color: MUTED }}>
          IVA incluído ({ivaRate}%)
        </div>
      )}
      <div className="flex justify-between text-base font-semibold mb-2">
        <span>{label}</span>
        <span style={{ color: TEAL }}>{fmtMT(total)}</span>
      </div>

      <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm mb-2">
        <option value="">Cliente (necessário para fiado / pontos)</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {cliente && pontosDisponiveis > 0 && (
        <label className="flex items-center gap-2 text-xs mb-2" style={{ color: TEAL }}>
          <input type="checkbox" checked={usarPontos} onChange={(e) => setUsarPontos(e.target.checked)} />
          Usar {pontosDisponiveis} pontos ({fmtMT(pontosDisponiveis * valorPorPonto)} de desconto)
        </label>
      )}
      {descontoPontos > 0 && (
        <div className="flex justify-between text-xs mb-1" style={{ color: GOLD }}>
          <span>Desconto por pontos</span>
          <span>-{fmtMT(descontoPontos)}</span>
        </div>
      )}
      {fiadoBloqueado && (
        <div style={{ background: "#FBE9E7", color: BRICK }} className="rounded p-2 text-xs mb-2">
          Limite de crédito excedido: {fmtMT(dividaActual)} em dívida + {fmtMT(total)} ultrapassa o limite de {fmtMT(limite)}. O fiado está bloqueado para este cliente.
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          value={recebido}
          onChange={(e) => setRecebido(e.target.value)}
          placeholder="Valor recebido (MT)"
          style={{ borderColor: BORDER }}
          className="border rounded px-2 py-1.5 text-sm flex-1"
        />
        {recebido !== "" && (
          <div className="text-right shrink-0">
            <div className="text-[10px]" style={{ color: MUTED }}>
              Troco
            </div>
            <div style={{ color: trocoDevido < 0 ? BRICK : GREEN }} className="text-lg font-bold leading-none">
              {fmtMT(Math.max(0, trocoDevido))}
            </div>
          </div>
        )}
      </div>
      {recebido !== "" && trocoDevido < 0 && (
        <div className="text-xs mb-2" style={{ color: BRICK }}>
          Faltam {fmtMT(-trocoDevido)}
        </div>
      )}

      <button onClick={() => setSplit((s) => !s)} style={{ color: TEAL }} className="text-xs font-medium mb-2 flex items-center gap-1">
        <Split size={12} /> {split ? "Cancelar pagamento dividido" : "Dividir pagamento"}
      </button>

      {!split && (
        <div className="grid grid-cols-2 gap-1.5">
          {paymentMethods.map((p) => {
            const Icon = p.icon;
            const disabled = items.length === 0 || (p.id === "fiado" && (!clientId || fiadoBloqueado));
            return (
              <button
                key={p.id}
                onClick={() => confirmSingle(p.id)}
                disabled={disabled}
                id={p.id === "dinheiro" ? "pdv-finalizar-dinheiro" : undefined}
                style={{ background: p.id === "fiado" ? GOLD : TEAL, color: "#fff" }}
                className="flex items-center justify-center gap-1.5 rounded py-2 text-xs font-medium disabled:opacity-40"
              >
                <Icon size={13} />
                {p.label}
              </button>
            );
          })}
        </div>
      )}

      {split && (
        <div className="space-y-1.5">
          {splitLines.map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <select value={l.method} onChange={(e) => updateSplitLine(i, "method", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-1.5 py-1 text-xs">
                {paymentMethods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={l.amount}
                onChange={(e) => updateSplitLine(i, "amount", e.target.value)}
                placeholder="Valor"
                style={{ borderColor: BORDER }}
                className="border rounded px-2 py-1 text-xs flex-1"
              />
              <button onClick={() => removeSplitLine(i)}>
                <X size={13} style={{ color: BRICK }} />
              </button>
            </div>
          ))}
          <button onClick={addSplitLine} style={{ color: TEAL }} className="text-xs font-medium">
            + adicionar forma de pagamento
          </button>
          <div className="text-xs" style={{ color: Math.round(splitSum) === Math.round(total) ? MUTED : BRICK }}>
            Somado: {fmtMT(splitSum)} / {fmtMT(total)}
          </div>
          <button
            onClick={confirmSplit}
            disabled={Math.round(splitSum) !== Math.round(total) || (needsClient && !clientId)}
            style={{ background: TEAL, color: "#fff" }}
            className="w-full rounded py-2 text-xs font-medium disabled:opacity-40"
          >
            Confirmar pagamento dividido
          </button>
        </div>
      )}
    </div>
  );
}
