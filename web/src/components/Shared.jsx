import { useEffect, useRef, useState } from "react";
import { CARD, BORDER, MUTED, TEAL, INK, GOLD, BRICK, BG, PRICE_GREEN, GREEN, SOFTGOLD } from "../lib/theme.js";
import { fmtMT, getStock, isLowStock, compressImageFile } from "../lib/utils.js";
import { Bell, AlertTriangle, ImageOff, Link2, Package, Percent, Split, X, Trash2 } from "../lib/icons.jsx";

const PAYMENT_COLORS = { dinheiro: "#10B981", mpesa: "#DC2626", emola: "#EA580C", fiado: "#7C3AED" };

export function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-xl p-3.5 relative overflow-hidden">
      <div style={{ background: "linear-gradient(90deg,#4F46E5,#7C3AED,#DB2777)" }} className="absolute top-0 left-0 right-0 h-1" />
      <div className="text-xs font-medium uppercase tracking-wide" style={{ color: MUTED }}>
        {label}
      </div>
      <div style={{ color: INK }} className="text-2xl font-bold mt-1">
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
      <div style={{ background: BORDER }} className="flex-1 h-2 rounded-lg">
        <div style={{ background: GOLD, width: `${(value / max) * 100}%` }} className="h-2 rounded-lg" />
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
      <button onClick={() => setOpen((o) => !o)} style={{ background: "rgba(255,255,255,0.15)" }} className="relative p-2 rounded-lg">
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
export function PhotoPicker({ value, onChange, api }) {
  const [mode, setMode] = useState("upload");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState(null); // null = ainda não pesquisou
  const [aPesquisar, setAPesquisar] = useState(false);
  const [erroBusca, setErroBusca] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (api?.uploadImage) {
        try {
          const { url } = await api.uploadImage(file);
          onChange(url);
          setUploading(false);
          return;
        } catch (_) { /* Cloudinary indisponível, fallback base64 */ }
      }
      const dataUrl = await compressImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      // ignora silenciosamente
    }
    setUploading(false);
  };

  const pesquisar = async () => {
    const q = busca.trim();
    if (!q || !api || aPesquisar) return;
    setAPesquisar(true);
    setErroBusca("");
    try {
      const r = await api.searchImages(q);
      setResultados(r);
      if (!r.length) setErroBusca("Nenhuma imagem encontrada. Tente outro nome.");
    } catch (e) {
      setResultados([]);
      setErroBusca("Não foi possível pesquisar imagens agora.");
    }
    setAPesquisar(false);
  };

  const Tab = ({ id, children }) => (
    <button type="button" onClick={() => setMode(id)} style={{ color: mode === id ? TEAL : MUTED }} className="text-xs font-medium flex items-center gap-1">
      {children}
    </button>
  );

  return (
    <div className="flex items-start gap-2">
      {value ? (
        <img src={value} alt="" style={{ borderColor: BORDER }} className="w-12 h-12 rounded-lg object-cover border shrink-0" />
      ) : (
        <div style={{ background: BG, borderColor: BORDER }} className="w-12 h-12 rounded-lg border flex items-center justify-center shrink-0">
          <ImageOff size={16} style={{ color: MUTED }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex gap-2 mb-1 flex-wrap items-center">
          <Tab id="upload">Carregar do PC</Tab>
          <span style={{ color: MUTED }} className="text-xs">·</span>
          <Tab id="url"><Link2 size={11} /> Usar URL</Tab>
          {api && <><span style={{ color: MUTED }} className="text-xs">·</span><Tab id="busca">🔍 Pesquisar imagem</Tab></>}
        </div>
        {mode === "upload" && (
          <>
            <input type="file" accept="image/*" onChange={handleFile} className="text-xs w-full" disabled={uploading} />
            {uploading && <div className="text-xs" style={{ color: MUTED }}>A carregar…</div>}
          </>
        )}
        {mode === "url" && (
          <div className="flex gap-1">
            <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://…" style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1 text-xs flex-1" />
            <button type="button" onClick={() => onChange(urlInput)} style={{ color: TEAL }} className="text-xs font-medium">Usar</button>
          </div>
        )}
        {mode === "busca" && (
          <div>
            <div className="flex gap-1">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); pesquisar(); } }}
                placeholder="Ex: pão francês, coca-cola…"
                style={{ borderColor: BORDER }}
                className="border rounded-lg px-2 py-1 text-xs flex-1"
              />
              <button type="button" onClick={pesquisar} disabled={aPesquisar} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-2.5 py-1 text-xs font-medium disabled:opacity-50">
                {aPesquisar ? "…" : "Pesquisar"}
              </button>
            </div>
            <div className="text-[10px] mt-1" style={{ color: MUTED }}>Só imagens livres de direitos de autor (Wikimedia Commons).</div>
            {erroBusca && <div className="text-[11px] mt-1" style={{ color: MUTED }}>{erroBusca}</div>}
            {aPesquisar && <div className="text-xs mt-2 text-center py-3" style={{ color: MUTED }}>A procurar imagens…</div>}
            {!aPesquisar && resultados && resultados.length === 0 && (
              <div className="text-xs mt-2 text-center py-3" style={{ color: MUTED }}>Nenhuma imagem encontrada. Tente outro nome.</div>
            )}
            {resultados && resultados.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2 max-h-80 overflow-auto">
                {resultados.map((img) => {
                  const src = img.thumbnail || img.url;
                  const sel = value === src;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => onChange(src)}
                      title={[img.title, img.license ? "Licença " + img.license : ""].filter(Boolean).join(" · ")}
                      style={{ borderColor: sel ? TEAL : BORDER, boxShadow: sel ? "0 0 0 2px " + TEAL : "none", background: "#fff" }}
                      className="border-2 rounded-lg overflow-hidden aspect-square hover:opacity-90"
                    >
                      <img src={src} alt={img.title} loading="lazy" className="w-full h-full object-contain" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Seletor com opção de criar um novo item rapidamente (ex.: fornecedor,
// categoria). Ao escolher "➕ criar novo", abre um campo para o nome; depois de
// criar, seleciona-o e continua-se o preenchimento. `onCreate(nome)` deve
// devolver o valor a seleccionar (id do fornecedor, ou o próprio nome da
// categoria).
export function SelectComCriar({ value, onChange, options, onCreate, placeholder = "Seleccionar…", createLabel = "➕ Criar novo", disabled }) {
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState("");
  const [busy, setBusy] = useState(false);
  const criar = async () => {
    const n = nome.trim();
    if (!n || busy) return;
    setBusy(true);
    try {
      const novo = await onCreate(n);
      if (novo !== undefined && novo !== null && novo !== "") onChange(novo);
      setCriando(false);
      setNome("");
    } finally {
      setBusy(false);
    }
  };
  if (criando) {
    return (
      <div className="flex gap-1.5">
        <input
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); criar(); }
            if (e.key === "Escape") { setCriando(false); setNome(""); }
          }}
          placeholder="Escreva o nome e Enter…"
          style={{ borderColor: BORDER }}
          className="flex-1 border rounded-lg px-2 py-1.5 text-sm"
        />
        <button onClick={criar} disabled={busy} style={{ background: GREEN, color: "#fff" }} className="rounded-lg px-2.5 py-1.5 text-sm font-medium disabled:opacity-50">
          {busy ? "…" : "Criar"}
        </button>
        <button onClick={() => { setCriando(false); setNome(""); }} style={{ borderColor: BORDER, color: MUTED }} className="border rounded-lg px-2 py-1.5 text-sm">
          ✕
        </button>
      </div>
    );
  }
  // Garante que o valor atual aparece mesmo que não esteja na lista (ex.: uma
  // unidade de medida personalizada acabada de criar).
  const opts = value && !options.some((o) => String(o.value) === String(value)) ? [{ value, label: value }, ...options] : options;
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => (e.target.value === "__novo__" ? setCriando(true) : onChange(e.target.value))}
      style={{ borderColor: BORDER }}
      className="w-full border rounded-lg px-2 py-1.5 text-sm"
    >
      <option value="">{placeholder}</option>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
      <option value="__novo__">{createLabel}</option>
    </select>
  );
}

// Ícone simples de "ver" (olho).
export function EyeIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Ícone de "editar" (lápis).
export function PencilIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

// Ícone de "copiar/duplicar".
export function CopyIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

// Ícone de "histórico" (relógio com seta).
export function ClockIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

// Conjunto reutilizável de acções por entidade: Visualizar, Editar, Histórico,
// Apagar. Cada botão só aparece se a respectiva função for passada.
export function AcoesEntidade({ onVer, onEditar, onDuplicar, onHistorico, onApagar, size = "sm" }) {
  const cls = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const Btn = ({ title, onClick, color, children }) => (
    <button onClick={onClick} title={title} style={{ borderColor: BORDER, color: color || INK }} className={`border rounded-full ${cls} flex items-center justify-center shrink-0 hover:bg-gray-50`}>
      {children}
    </button>
  );
  return (
    <div className="flex items-center gap-1">
      {onVer && <Btn title="Visualizar" onClick={onVer} color={TEAL}><EyeIcon size={14} /></Btn>}
      {onEditar && <Btn title="Editar" onClick={onEditar} color={TEAL}><PencilIcon size={13} /></Btn>}
      {onDuplicar && <Btn title="Duplicar" onClick={onDuplicar} color={MUTED}><CopyIcon size={13} /></Btn>}
      {onHistorico && <Btn title="Histórico (quem alterou e quando)" onClick={onHistorico} color={INK}><ClockIcon size={13} /></Btn>}
      {onApagar && <Btn title="Apagar" onClick={onApagar} color={BRICK}><Trash2 size={13} /></Btn>}
    </div>
  );
}

// Modal genérico de detalhes (só leitura): recebe uma lista de { label, value }.
export function DetalhesModal({ title, linhas, onClose, extra }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-2xl p-4 w-full max-w-sm max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">{title}</div>
          <button onClick={onClose} style={{ color: MUTED }}><X size={16} /></button>
        </div>
        <div className="space-y-1.5">
          {linhas.filter((l) => l).map((l, i) => (
            <div key={i} className="flex justify-between gap-3 text-sm">
              <span style={{ color: MUTED }}>{l.label}</span>
              <span className="text-right font-medium break-words">{l.value || "—"}</span>
            </div>
          ))}
        </div>
        {extra}
      </div>
    </div>
  );
}

const ACAO_COR = { PRODUTO: "#4F46E5", FORNECEDOR: "#0EA5E9", CATEGORIA: "#F59E0B" };

// Modal de histórico de alterações de uma entidade (o que mudou, quem, quando).
export function HistoricoEntidadeModal({ title, api, tipo, id, onClose }) {
  const [movs, setMovs] = useState(null);
  useEffect(() => {
    let vivo = true;
    api.auditEntidade(tipo, id).then((m) => vivo && setMovs(m)).catch(() => vivo && setMovs([]));
    return () => { vivo = false; };
  }, [api, tipo, id]);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-2xl p-4 w-full max-w-md max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold">Histórico — {title}</div>
          <button onClick={onClose} style={{ color: MUTED }}><X size={16} /></button>
        </div>
        <div className="text-[11px] mb-3" style={{ color: MUTED }}>O que mudou, quem alterou e quando.</div>
        {movs === null && <div className="text-xs py-4 text-center" style={{ color: MUTED }}>A carregar…</div>}
        {movs && movs.length === 0 && <div className="text-xs py-4 text-center" style={{ color: MUTED }}>Sem alterações registadas.</div>}
        <div className="space-y-2">
          {movs && movs.map((m) => (
            <div key={m.id} className="flex items-start gap-2">
              <div style={{ background: ACAO_COR[m.acao] || MUTED }} className="w-2 h-2 rounded-full mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs">{m.detalhe}</div>
                <div className="text-[11px]" style={{ color: MUTED }}>
                  {new Date(m.date).toLocaleString("pt-PT")} · {m.employeeName || "Sistema"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ p, onClick, onContextMenu, onLongPress, disabled, produtos, compact }) {
  const stock = getStock(p, produtos);
  const timer = useRef(null);
  const longFired = useRef(false);
  const lastLong = useRef(0); // quando um toque prolongado diminuiu (timestamp)
  // Toque prolongado (ecrã tátil) = equivalente ao botão direito do rato:
  // diminui a quantidade. No telemóvel não há botão direito, por isso usa-se
  // manter o dedo pressionado ~0,45 s.
  const startPress = () => {
    longFired.current = false;
    if (!onLongPress) return;
    timer.current = setTimeout(() => {
      longFired.current = true;
      lastLong.current = Date.now();
      onLongPress();
    }, 450);
  };
  const cancelPress = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };
  // Botão direito do rato: diminui SEMPRE (uma vez por clique). Só é ignorado se
  // um toque prolongado acabou mesmo agora de diminuir (o Android dispara também
  // o menu de contexto a seguir ao long-press), evitando diminuir a dobrar.
  const handleContext = (e) => {
    cancelPress();
    e.preventDefault();
    if (Date.now() - lastLong.current < 700) return;
    if (onContextMenu) onContextMenu(e);
  };
  const handleClick = (e) => {
    if (longFired.current) {
      // foi um toque prolongado: não adicionar ao carrinho a seguir
      longFired.current = false;
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
  };
  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContext}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      disabled={disabled}
      style={{ background: CARD, borderColor: BORDER, opacity: disabled ? 0.45 : 1 }}
      className="border rounded-2xl overflow-hidden text-left hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-300 transition disabled:cursor-not-allowed flex flex-col"
    >
      <div style={{ background: "linear-gradient(135deg,#EEF2FF,#FCE7F3)" }} className={"w-full flex items-center justify-center overflow-hidden relative " + (compact ? "aspect-[5/3]" : "aspect-[4/3]")}>
        {p.foto ? <img src={p.foto} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <Package size={compact ? 22 : 28} style={{ color: "#818CF8" }} />}
        <span
          style={{ background: stock <= 0 ? BRICK : isLowStock(p, produtos) ? GOLD : GREEN, color: "#fff" }}
          className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow"
        >
          {stock <= 0 ? "Esgotado" : `${stock}${p.unit !== "un" ? p.unit : ""}`}
        </span>
      </div>
      <div className={compact ? "p-2" : "p-2.5"}>
        <div className={"font-semibold leading-snug truncate " + (compact ? "text-xs" : "text-sm")}>{p.name}</div>
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
          className="w-full border rounded-lg px-2 py-1.5 text-sm mb-3"
        />
        <button onClick={() => onConfirm(reason)} style={{ background: BRICK, color: "#fff" }} className="w-full rounded-lg py-2 text-sm font-medium">
          Confirmar cancelamento
        </button>
      </div>
    </div>
  );
}

export function CategoriasModal({ categories, onAdd, onRemove, onRename, onClose, api, produtos = [] }) {
  const [name, setName] = useState("");
  const [renomear, setRenomear] = useState(null); // categoria em edição
  const [novoNome, setNovoNome] = useState("");
  const [ver, setVer] = useState(null);
  const [hist, setHist] = useState(null);
  const contar = (c) => produtos.filter((p) => p.category === c).length;

  const confirmarRename = () => {
    const n = novoNome.trim();
    if (n && renomear && n !== renomear && onRename) onRename(renomear, n);
    setRenomear(null);
    setNovoNome("");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Categorias de produto</div>
          <button onClick={onClose} style={{ color: MUTED }}><X size={16} /></button>
        </div>
        <div className="flex gap-2 mb-3">
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && name.trim() && (onAdd(name.trim()), setName(""))} placeholder="Nova categoria" style={{ borderColor: BORDER }} className="flex-1 border rounded-lg px-2 py-1.5 text-sm" />
          <button onClick={() => { if (name.trim()) { onAdd(name.trim()); setName(""); } }} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-sm">Adicionar</button>
        </div>
        <div className="space-y-1.5 max-h-72 overflow-auto">
          {categories.map((c) => (
            <div key={c} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-1.5 text-sm flex items-center justify-between gap-2">
              {renomear === c ? (
                <div className="flex gap-1.5 flex-1">
                  <input autoFocus value={novoNome} onChange={(e) => setNovoNome(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") confirmarRename(); if (e.key === "Escape") setRenomear(null); }} style={{ borderColor: BORDER }} className="flex-1 border rounded-lg px-2 py-1 text-sm" />
                  <button onClick={confirmarRename} style={{ background: GREEN, color: "#fff" }} className="rounded-lg px-2 py-1 text-xs font-medium">Guardar</button>
                  <button onClick={() => setRenomear(null)} style={{ borderColor: BORDER, color: MUTED }} className="border rounded-lg px-2 py-1 text-xs">✕</button>
                </div>
              ) : (
                <>
                  <span className="min-w-0 truncate">{c} <span style={{ color: MUTED }} className="text-xs">({contar(c)})</span></span>
                  <AcoesEntidade
                    onVer={() => setVer(c)}
                    onEditar={onRename ? () => { setRenomear(c); setNovoNome(c); } : undefined}
                    onHistorico={api ? () => setHist(c) : undefined}
                    onApagar={() => onRemove(c)}
                  />
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && <div className="text-xs" style={{ color: MUTED }}>Ainda não há categorias.</div>}
        </div>
      </div>

      {ver && (
        <DetalhesModal
          title={`Categoria: ${ver}`}
          onClose={() => setVer(null)}
          linhas={[
            { label: "Nome", value: ver },
            { label: "Produtos nesta categoria", value: contar(ver) },
          ]}
        />
      )}
      {hist && <HistoricoEntidadeModal title={`Categoria ${hist}`} api={api} tipo="categoria" id={hist} onClose={() => setHist(null)} />}
    </div>
  );
}

// ================= Checkout partilhado =================
export function CheckoutPanel({ items, extraChargePct = 0, clients, canDiscount, onConfirm, onPark, onAddClient, onQuote, mesas = null, onGuardarMesa, label = "Total", guardarLabel = "Guardar venda", paymentMethods, ivaConfig, config }) {
  const [discount, setDiscount] = useState(0);
  const [clientId, setClientId] = useState("");
  const [recebido, setRecebido] = useState("");
  const [usarPontos, setUsarPontos] = useState(false);
  const [split, setSplit] = useState(false);
  const [splitLines, setSplitLines] = useState([{ method: "dinheiro", amount: "" }]);
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]?.id || "dinheiro");
  const [guardarOpen, setGuardarOpen] = useState(false);
  const temMesas = Array.isArray(mesas);

  // IVA: só as taxas que o utilizador criou no Config aparecem como opção.
  // Sem taxas configuradas, não se aplica IVA (nada vem predefinido do sistema).
  const taxasDisponiveis = Array.isArray(ivaConfig?.taxas) ? ivaConfig.taxas : [];
  const [ivaRateSel, setIvaRateSel] = useState(
    taxasDisponiveis.includes(Number(ivaConfig?.taxa)) ? Number(ivaConfig?.taxa) : taxasDisponiveis[0] || 0
  );

  // Cliente novo (criar sem sair do ecrã de venda)
  const [novoCliente, setNovoCliente] = useState(false);
  const [ncNome, setNcNome] = useState("");
  const [ncTel, setNcTel] = useState("");
  const [ncBusy, setNcBusy] = useState(false);

  const cliente = clients.find((c) => c.id === clientId);
  const valorPorPonto = (config && config.valorPorPonto) || 1;
  const pontosDisponiveis = cliente ? cliente.points || 0 : 0;
  const subtotal = items.reduce((s, l) => s + l.price * l.qty, 0);
  const serviceCharge = subtotal * (extraChargePct / 100);
  const descontoPontos = usarPontos ? Math.min(pontosDisponiveis * valorPorPonto, subtotal + serviceCharge) : 0;
  const pontosUsados = usarPontos ? Math.ceil(descontoPontos / valorPorPonto) : 0;
  const afterDiscount = Math.max(0, subtotal + serviceCharge - Number(discount || 0) - descontoPontos);
  const ivaRate = ivaConfig?.isento ? 0 : Number(ivaRateSel) || 0;
  const ivaOnTop = !ivaConfig?.isento && ivaRate > 0 && !ivaConfig?.precosIncluemIva;
  const ivaAmount = ivaOnTop ? afterDiscount * (ivaRate / 100) : 0;
  const ivaIncluded = !ivaConfig?.isento && ivaRate > 0 && ivaConfig?.precosIncluemIva;
  const total = afterDiscount + ivaAmount;

  const addSplitLine = () => setSplitLines((s) => [...s, { method: "dinheiro", amount: "" }]);
  const updateSplitLine = (i, field, val) => setSplitLines((s) => s.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)));
  const removeSplitLine = (i) => setSplitLines((s) => s.filter((_, idx) => idx !== i));
  const splitSum = splitLines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const needsClient = split ? splitLines.some((l) => l.method === "fiado") : selectedMethod === "fiado";

  const dividaActual = cliente ? (cliente.debts || []).reduce((a, d) => a + d.amount, 0) : 0;
  const limite = cliente ? cliente.creditLimit || 0 : 0;
  const fiadoBloqueado = !!cliente && limite > 0 && dividaActual + total > limite;
  const trocoDevido = Number(recebido || 0) - total;

  const ivaTaxaVenda = ivaConfig?.isento ? null : ivaRate;
  const finalizar = () => {
    if (items.length === 0) return;
    if (split) {
      if (Math.round(splitSum) !== Math.round(total)) return;
      if (needsClient && !clientId) return;
      onConfirm({
        total,
        discount: Number(discount || 0),
        payments: splitLines.map((l) => ({ method: l.method, amount: Number(l.amount || 0) })),
        clientId: clientId || null,
        pontosUsados,
        ivaTaxa: ivaTaxaVenda,
      });
      setRecebido("");
      return;
    }
    if (selectedMethod === "fiado" && (!clientId || fiadoBloqueado)) return;
    onConfirm({ total, discount: Number(discount || 0), payments: [{ method: selectedMethod, amount: total }], clientId: clientId || null, pontosUsados, ivaTaxa: ivaTaxaVenda });
    setRecebido("");
  };

  const criarCliente = async () => {
    if (!onAddClient || !ncNome.trim()) return;
    setNcBusy(true);
    try {
      const novoId = await onAddClient({ name: ncNome.trim(), phone: ncTel.trim() });
      if (novoId) setClientId(novoId);
      setNovoCliente(false);
      setNcNome("");
      setNcTel("");
    } finally {
      setNcBusy(false);
    }
  };

  const finalizarDisabled =
    items.length === 0 ||
    (split ? Math.round(splitSum) !== Math.round(total) || (needsClient && !clientId) : selectedMethod === "fiado" && (!clientId || fiadoBloqueado));

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
            className="border rounded-lg px-2 py-1 text-xs flex-1"
          />
        </div>
      )}
      {!ivaConfig?.isento && taxasDisponiveis.length > 0 && (
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-sm" style={{ color: MUTED }}>IVA</span>
          <select value={ivaRateSel} onChange={(e) => setIvaRateSel(Number(e.target.value))} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm">
            {taxasDisponiveis.map((t) => (
              <option key={t} value={t}>{t}%</option>
            ))}
          </select>
        </div>
      )}
      {ivaOnTop && (
        <div className="flex justify-between text-sm mb-1" style={{ color: MUTED }}>
          <span>IVA ({ivaRate}%)</span>
          <span>+{fmtMT(ivaAmount)}</span>
        </div>
      )}
      {ivaIncluded && (
        <div className="text-xs mb-1" style={{ color: MUTED }}>
          IVA incluído ({ivaRate}%)
        </div>
      )}
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-lg font-semibold">{label}</span>
        <span style={{ color: TEAL }} className="text-3xl sm:text-4xl font-extrabold tracking-tight">{fmtMT(total)}</span>
      </div>

      {!novoCliente ? (
        <div className="flex items-center gap-2 mb-2">
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ borderColor: BORDER }} className="flex-1 min-w-0 border rounded-lg px-2 py-1.5 text-sm">
            <option value="">Cliente (necessário para dívida / pontos)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {onAddClient && (
            <button onClick={() => setNovoCliente(true)} style={{ borderColor: BORDER, color: TEAL }} className="border rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap shrink-0">
              + Novo
            </button>
          )}
        </div>
      ) : (
        <div style={{ borderColor: BORDER }} className="border rounded-lg p-2 mb-2 space-y-1.5">
          <div className="text-xs font-semibold">Novo cliente</div>
          <input autoFocus value={ncNome} onChange={(e) => setNcNome(e.target.value)} placeholder="Nome do cliente" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          <input value={ncTel} onChange={(e) => setNcTel(e.target.value)} placeholder="Telefone (opcional)" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          <div className="flex gap-1.5">
            <button onClick={criarCliente} disabled={!ncNome.trim() || ncBusy} style={{ background: TEAL, color: "#fff" }} className="flex-1 rounded-lg py-1.5 text-sm disabled:opacity-40">
              {ncBusy ? "A guardar…" : "Adicionar"}
            </button>
            <button onClick={() => setNovoCliente(false)} style={{ borderColor: BORDER, color: MUTED }} className="border rounded-lg px-3 py-1.5 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

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
        <div style={{ background: "#FEE2E2", color: BRICK }} className="rounded-lg p-2 text-xs mb-2">
          Limite de crédito excedido: {fmtMT(dividaActual)} em dívida + {fmtMT(total)} ultrapassa o limite de {fmtMT(limite)}. A dívida está bloqueada para este cliente.
        </div>
      )}

      <div className="mb-2">
        <label className="text-sm font-medium block mb-1" style={{ color: MUTED }}>
          Valor recebido (MT)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={recebido}
            onChange={(e) => setRecebido(e.target.value)}
            placeholder="0"
            style={{ borderColor: BORDER }}
            className="border rounded-lg px-3 py-2.5 text-2xl font-bold flex-1 w-full"
          />
          {recebido !== "" && (
            <div className="text-right shrink-0">
              <div className="text-xs" style={{ color: MUTED }}>
                Troco
              </div>
              <div style={{ color: trocoDevido < 0 ? BRICK : GREEN }} className="text-3xl sm:text-4xl font-extrabold leading-none tracking-tight">
                {fmtMT(Math.max(0, trocoDevido))}
              </div>
            </div>
          )}
        </div>
      </div>
      {recebido !== "" && trocoDevido < 0 && (
        <div className="text-base font-semibold mb-2" style={{ color: BRICK }}>
          Faltam {fmtMT(-trocoDevido)}
        </div>
      )}

      <button onClick={() => setSplit((s) => !s)} style={{ color: TEAL }} className="text-xs font-medium mb-2 flex items-center gap-1">
        <Split size={12} /> {split ? "Cancelar pagamento dividido" : "Dividir pagamento"}
      </button>

      {!split && (
        <>
          <div className="text-xs font-medium mb-1.5" style={{ color: MUTED }}>
            Método de pagamento
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {paymentMethods.map((p) => {
              const Icon = p.icon;
              const disabled = p.id === "fiado" && (!clientId || fiadoBloqueado);
              const sel = selectedMethod === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedMethod(p.id)}
                  disabled={disabled}
                  style={{
                    background: sel ? PAYMENT_COLORS[p.id] || TEAL : "#fff",
                    color: sel ? "#fff" : INK,
                    borderColor: sel ? PAYMENT_COLORS[p.id] || TEAL : BORDER,
                    boxShadow: sel ? "0 4px 10px rgba(15,23,42,0.15)" : "none",
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold border-2 disabled:opacity-40"
                >
                  <Icon size={13} />
                  {p.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {split && (
        <div className="space-y-1.5 mb-3">
          {splitLines.map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <select value={l.method} onChange={(e) => updateSplitLine(i, "method", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-1.5 py-1 text-xs">
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
                className="border rounded-lg px-2 py-1 text-xs flex-1"
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
        </div>
      )}

      <div className="flex gap-1.5">
        <button
          id="pdv-finalizar-venda"
          onClick={finalizar}
          disabled={finalizarDisabled}
          style={{ background: TEAL, color: "#fff", boxShadow: finalizarDisabled ? "none" : "0 4px 10px rgba(15,23,42,0.15)" }}
          className="flex-1 rounded-xl py-3 text-base font-bold disabled:opacity-40"
        >
          Finalizar Venda
        </button>
        {onPark && (
          <button
            onClick={() => (temMesas ? setGuardarOpen((o) => !o) : onPark())}
            disabled={items.length === 0}
            style={{ borderColor: TEAL, color: TEAL, background: "#fff" }}
            className="rounded-xl py-3 px-4 text-sm font-semibold border-2 disabled:opacity-40 whitespace-nowrap"
          >
            {temMesas ? "Guardar pedido" : guardarLabel}
          </button>
        )}
      </div>

      {onQuote && (
        <button
          onClick={() => onQuote({ items, total, discount: Number(discount || 0), clientId: clientId || null, ivaTaxa: ivaConfig?.isento ? null : ivaRate })}
          disabled={items.length === 0}
          style={{ color: TEAL }}
          className="w-full mt-2 text-sm font-medium disabled:opacity-40"
        >
          Gerar cotação / orçamento
        </button>
      )}

      {onPark && temMesas && guardarOpen && items.length > 0 && (
        <div style={{ borderColor: BORDER }} className="border rounded-lg p-2 mt-2 space-y-2">
          <div className="text-xs font-semibold">Guardar este pedido…</div>
          <button
            onClick={() => {
              onPark();
              setGuardarOpen(false);
            }}
            style={{ borderColor: BORDER, color: INK }}
            className="w-full border rounded-lg px-2 py-1.5 text-sm text-left"
          >
            Em espera (sem mesa)
          </button>
          {mesas.length > 0 && (
            <>
              <div className="text-xs" style={{ color: MUTED }}>
                Ou numa mesa:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {mesas.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onGuardarMesa && onGuardarMesa(m.id);
                      setGuardarOpen(false);
                    }}
                    style={{ borderColor: GOLD, background: SOFTGOLD, color: INK }}
                    className="border rounded-lg px-1.5 py-1.5 text-xs font-medium truncate"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {mesas.length === 0 && (
            <div className="text-xs" style={{ color: MUTED }}>
              Ainda não há mesas criadas. Crie mesas na aba "Mesas".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
