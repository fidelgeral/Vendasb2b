import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, INK, BRICK, GREEN } from "../lib/theme.js";
import { Banknote, Package, Settings } from "../lib/icons.jsx";
import BillingPanel from "../components/BillingPanel.jsx";
import { fmtMT } from "../lib/utils.js";

export default function OutrosServicosTab({ store, setStore, api, showToast }) {
  const [cat, setCat] = useState("assinatura");

  const categories = [
    { id: "assinatura", label: "A minha assinatura", icon: Banknote },
    { id: "etiquetas", label: "Imprimir etiquetas", icon: Package },
    { id: "precos", label: "Imprimir preços", icon: Package },
    { id: "requisicoes", label: "Requisições", icon: Settings },
  ];

  return (
    <div>
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {categories.map((c) => {
          const Icon = c.icon;
          const active = cat === c.id;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ background: active ? TEAL : CARD, color: active ? "#fff" : INK, borderColor: BORDER }}
              className="border rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap">
              <Icon size={13} /> {c.label}
            </button>
          );
        })}
      </div>
      {cat === "assinatura" && <BillingPanel api={api} canSubmit />}
      {cat === "etiquetas" && <EtiquetasSection store={store} />}
      {cat === "precos" && <PrecosSection store={store} />}
      {cat === "requisicoes" && <RequisicoesSection store={store} setStore={setStore} api={api} showToast={showToast} />}
    </div>
  );
}

function EtiquetasSection({ store }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const filtered = store.products.filter((p) =>
    p.active !== false && (p.name.toLowerCase().includes(search.toLowerCase()) || (p.codigo || "").includes(search))
  );

  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const imprimir = () => {
    const produtos = store.products.filter((p) => selected.includes(p.id));
    if (!produtos.length) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const html = produtos.map((p) => `
      <div style="border:1px dashed #999;padding:8px;margin:4px;display:inline-block;font-family:monospace;text-align:center;min-width:200px">
        <div style="font-weight:bold;font-size:14px">${p.name}</div>
        ${p.codigo ? `<div style="font-size:24px;letter-spacing:4px;margin:4px 0">${p.codigo}</div>` : ""}
        <div style="font-size:11px;color:#666">${p.codigo || "Sem código"}</div>
      </div>
    `).join("");
    win.document.write(`<html><body style="padding:10px">${html}<script>window.print();<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-3">
      <div className="text-sm font-semibold" style={{ color: INK }}>Imprimir etiquetas de código de barras</div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar produto…"
        style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
      <div className="max-h-60 overflow-auto space-y-1">
        {filtered.slice(0, 50).map((p) => (
          <label key={p.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer" style={{ color: INK }}>
            <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
            {p.name} {p.codigo && <span className="text-xs" style={{ color: MUTED }}>({p.codigo})</span>}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setSelected(filtered.map((p) => p.id))} className="text-xs underline" style={{ color: TEAL }}>Seleccionar todos</button>
        <button onClick={() => setSelected([])} className="text-xs underline" style={{ color: MUTED }}>Limpar</button>
      </div>
      <button onClick={imprimir} disabled={!selected.length} style={{ background: TEAL, color: "#fff" }}
        className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
        Imprimir etiquetas ({selected.length})
      </button>
    </div>
  );
}

function PrecosSection({ store }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const filtered = store.products.filter((p) =>
    p.active !== false && (p.name.toLowerCase().includes(search.toLowerCase()) || (p.codigo || "").includes(search))
  );

  const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const imprimir = () => {
    const produtos = store.products.filter((p) => selected.includes(p.id));
    if (!produtos.length) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const html = produtos.map((p) => `
      <div style="border:1px solid #ccc;padding:10px;margin:4px;display:inline-block;text-align:center;min-width:180px;font-family:system-ui">
        <div style="font-size:12px;color:#666">${p.name}</div>
        <div style="font-size:28px;font-weight:bold;color:#000;margin:4px 0">${Number(p.price).toFixed(2)} MT</div>
        ${p.codigo ? `<div style="font-size:10px;color:#999">${p.codigo}</div>` : ""}
      </div>
    `).join("");
    win.document.write(`<html><body style="padding:10px">${html}<script>window.print();<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-3">
      <div className="text-sm font-semibold" style={{ color: INK }}>Imprimir preços de produtos</div>
      <p className="text-xs" style={{ color: MUTED }}>Seleccione os produtos para imprimir cartões de preço. Ideal para etiquetadoras e gôndolas.</p>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar produto…"
        style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm" />
      <div className="max-h-60 overflow-auto space-y-1">
        {filtered.slice(0, 50).map((p) => (
          <label key={p.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer" style={{ color: INK }}>
            <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
            {p.name} <span className="ml-auto font-semibold">{fmtMT(p.price)}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setSelected(filtered.map((p) => p.id))} className="text-xs underline" style={{ color: TEAL }}>Seleccionar todos</button>
        <button onClick={() => setSelected([])} className="text-xs underline" style={{ color: MUTED }}>Limpar</button>
      </div>
      <button onClick={imprimir} disabled={!selected.length} style={{ background: TEAL, color: "#fff" }}
        className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
        Imprimir preços ({selected.length})
      </button>
    </div>
  );
}

function RequisicoesSection({ store, setStore, api, showToast }) {
  const [reqs, setReqs] = useState([]);
  const [form, setForm] = useState({ produto: "", quantidade: "", destino: "", notas: "" });
  const [loading, setLoading] = useState(false);

  const adicionar = () => {
    if (!form.produto || !form.quantidade) return;
    const produto = store.products.find((p) => p.id === form.produto);
    setReqs((r) => [...r, {
      id: Date.now(),
      produtoId: form.produto,
      produtoNome: produto?.name || "—",
      quantidade: Number(form.quantidade),
      destino: form.destino,
      notas: form.notas,
    }]);
    setForm({ ...form, produto: "", quantidade: "", notas: "" });
  };

  const remover = (id) => setReqs((r) => r.filter((x) => x.id !== id));

  const imprimir = () => {
    if (!reqs.length) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = reqs.map((r) => `<tr><td style="border:1px solid #ddd;padding:6px">${r.produtoNome}</td><td style="border:1px solid #ddd;padding:6px;text-align:center">${r.quantidade}</td><td style="border:1px solid #ddd;padding:6px">${r.destino || "—"}</td><td style="border:1px solid #ddd;padding:6px">${r.notas || "—"}</td></tr>`).join("");
    const html = `
      <div style="font-family:system-ui;max-width:700px;margin:0 auto;padding:20px">
        <h2>Requisição de Produtos</h2>
        <p style="color:#666">Data: ${new Date().toLocaleDateString("pt-PT")} · ${new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</p>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:#f1f5f9"><th style="border:1px solid #ddd;padding:6px;text-align:left">Produto</th><th style="border:1px solid #ddd;padding:6px">Qtd</th><th style="border:1px solid #ddd;padding:6px;text-align:left">Destino</th><th style="border:1px solid #ddd;padding:6px;text-align:left">Notas</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:30px;border-top:1px solid #ddd;padding-top:10px">
          <strong>Assinatura:</strong> __________________________ &nbsp;&nbsp;&nbsp; <strong>Data:</strong> __/__/____
        </p>
      </div>`;
    win.document.write(`<html><body>${html}<script>window.print();<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-3">
      <div className="text-sm font-semibold" style={{ color: INK }}>Requisições de produtos</div>
      <p className="text-xs" style={{ color: MUTED }}>Crie requisições internas para solicitar produtos a fornecedores ou transferir entre filiais. Pode imprimir para arquivo.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <select value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })}
          style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm">
          <option value="">Seleccionar produto</option>
          {store.products.filter((p) => p.active !== false).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input type="number" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
          placeholder="Quantidade" style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm" />
        <input value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })}
          placeholder="Destino/Fornecedor" style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm" />
        <button onClick={adicionar} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-sm font-semibold">
          + Adicionar
        </button>
      </div>

      {reqs.length > 0 && (
        <div className="space-y-1">
          {reqs.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-sm py-1" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ color: INK }}>{r.produtoNome} × {r.quantidade}</span>
              <span className="text-xs" style={{ color: MUTED }}>{r.destino || ""}</span>
              <button onClick={() => remover(r.id)} className="text-xs" style={{ color: BRICK }}>Remover</button>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <button onClick={imprimir} style={{ background: TEAL, color: "#fff" }} className="px-4 py-1.5 rounded-lg text-sm font-semibold">
              Imprimir requisição
            </button>
            <button onClick={() => setReqs([])} className="px-3 py-1.5 rounded-lg text-sm border" style={{ borderColor: BORDER, color: MUTED }}>
              Limpar
            </button>
          </div>
        </div>
      )}

      {reqs.length === 0 && (
        <div className="text-xs text-center py-6" style={{ color: MUTED }}>
          Nenhuma linha adicionada. Seleccione um produto e a quantidade para criar a requisição.
        </div>
      )}
    </div>
  );
}
