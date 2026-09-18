import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, GREEN, BRICK } from "../lib/theme.js";
import { fmtMT, getStock, isLowStock, nearExpiry, daysUntil, todayStr, mapImportRow } from "../lib/utils.js";
import { imprimirEtiquetas, downloadWorkbook } from "../lib/print.js";
import { Boxes, Package, AlertTriangle, Layers, Ruler, Minus, Plus } from "../lib/icons.jsx";
import * as XLSX from "xlsx";

export default function EstoqueTab({ store, setStore, api, showToast, registerQuebra, onGoCompras }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showSaida, setShowSaida] = useState(false);
  const [showNovoLote, setShowNovoLote] = useState(false);
  const lowCount = store.products.filter((p) => isLowStock(p, store.products)).length;
  const expiringCount = store.products.reduce((s, p) => s + nearExpiry(p).length, 0);
  const expiredUnits = store.products.reduce((s, p) => s + (p.batches || []).filter((b) => b.qty > 0 && daysUntil(b.expiryDate) < 0).reduce((a, b) => a + b.qty, 0), 0);
  const outOfStockCount = store.products.filter((p) => getStock(p, store.products) <= 0).length;
  const valorStock = store.products.reduce((s, p) => s + (p.cost || 0) * getStock(p, store.products), 0);
  const valorPotencial = store.products.reduce((s, p) => s + (p.price || 0) * getStock(p, store.products), 0);
  const categories = store.categories && store.categories.length ? store.categories : [...new Set(store.products.map((p) => p.category).filter(Boolean))].sort();
  const filteredProducts = store.products.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) && (!categoryFilter || p.category === categoryFilter)
  );

  const bulkApply = async (rows) => {
    const res = await api.bulkImportProducts(rows);
    setStore(res.store);
    const { created, updated, skipped } = res.summary;
    showToast(`Importação concluída: ${created} criado(s), ${updated} actualizado(s)${skipped ? `, ${skipped} ignorado(s)` : ""}`);
  };

  const adjustStock = async (id, delta) => setStore(await api.adjustStock(id, delta));
  const addVariant = async (id, label) => setStore(await api.addVariant(id, label));
  const adjustVariantStock = async (id, variantId, delta) => setStore(await api.adjustVariant(id, variantId, delta));
  const addBatch = async (id, qty, expiryDate) => setStore(await api.addBatch(id, qty, expiryDate));

  const stats = [
    { label: "Stock baixo", value: lowCount, color: lowCount > 0 ? BRICK : TEAL },
    { label: "Esgotados", value: outOfStockCount, color: outOfStockCount > 0 ? BRICK : TEAL },
    { label: "A vencer em breve", value: expiringCount, color: expiringCount > 0 ? "#C9973B" : TEAL },
    { label: "Unidades expiradas", value: expiredUnits, color: expiredUnits > 0 ? BRICK : TEAL },
    { label: "Valor em stock", value: fmtMT(valorStock), color: TEAL },
    { label: "Valor potencial (venda)", value: fmtMT(valorPotencial), color: TEAL },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div style={{ background: "#4338CA", color: "#fff" }} className="w-7 h-7 rounded-full flex items-center justify-center">
            <Boxes size={14} />
          </div>
          <div className="text-base font-semibold">Gestão de Stock</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSaida(true)} style={{ background: BRICK, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            − Saída Estoque
          </button>
          <button onClick={() => setShowNovoLote(true)} style={{ background: GREEN, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            + Novo Lote
          </button>
          <button onClick={onGoCompras} style={{ background: "#2E5AAC", color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            Fornecedores
          </button>
          <button
            onClick={() => imprimirEtiquetas(filteredProducts, store.config.businessName)}
            style={{ borderColor: BORDER, color: "#16241F" }}
            className="border rounded px-3 py-1.5 text-xs font-medium"
          >
            Imprimir etiquetas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
            <div className="text-xs" style={{ color: MUTED }}>
              {s.label}
            </div>
            <div style={{ color: s.color }} className="text-xl font-semibold mt-1">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <BulkImportExport products={store.products} onImport={bulkApply} />

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar Produto ou Nome do Lote…"
          style={{ borderColor: BORDER, background: CARD }}
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ borderColor: BORDER, background: CARD }} className="border rounded px-2 py-2 text-sm">
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        {filteredProducts.map((p) => (
          <EstoqueRow
            key={p.id}
            p={p}
            onAdjustStock={(d) => adjustStock(p.id, d)}
            onAddVariant={(label) => addVariant(p.id, label)}
            onAdjustVariant={(vid, d) => adjustVariantStock(p.id, vid, d)}
            onAddBatch={(qty, exp) => addBatch(p.id, qty, exp)}
            produtos={store.products}
          />
        ))}
        {filteredProducts.length === 0 && store.products.length > 0 && (
          <div className="text-sm" style={{ color: MUTED }}>
            Nenhum produto corresponde à pesquisa.
          </div>
        )}
        {store.products.length === 0 && (
          <div className="text-sm" style={{ color: MUTED }}>
            Adicione produtos na aba Produtos primeiro.
          </div>
        )}
      </div>

      {showSaida && <SaidaEstoqueModal store={store} onSubmit={registerQuebra} onClose={() => setShowSaida(false)} />}
      {showNovoLote && (
        <NovoLoteModal products={store.products} onAdd={(id, qty, exp) => addBatch(id, qty, exp)} onClose={() => setShowNovoLote(false)} />
      )}
    </div>
  );
}

function EstoqueRow({ p, onAdjustStock, onAddVariant, onAdjustVariant, onAddBatch, produtos }) {
  const [expanded, setExpanded] = useState(false);
  const [newVariant, setNewVariant] = useState("");
  const [newBatchQty, setNewBatchQty] = useState("");
  const [newBatchExp, setNewBatchExp] = useState(todayStr());
  const stock = getStock(p, produtos);
  const expiring = nearExpiry(p);

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-2.5">
      <div className="flex items-center gap-3">
        <div style={{ background: "#EFF3F1" }} className="w-10 h-10 rounded overflow-hidden flex items-center justify-center shrink-0">
          {p.foto ? <img src={p.foto} alt="" className="w-full h-full object-cover" /> : <Package size={16} style={{ color: MUTED }} />}
        </div>
        <button className="min-w-0 text-left flex-1" onClick={() => setExpanded((e) => !e)}>
          <div className="text-sm font-medium truncate flex items-center gap-1.5">
            {p.name}
            {p.variants && <Layers size={12} style={{ color: MUTED }} />}
            {p.batches && <Ruler size={12} style={{ color: MUTED }} />}
          </div>
          <div style={{ color: MUTED }} className="text-xs">
            {p.category}
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {!p.variants && !p.batches && (
            <>
              <button onClick={() => onAdjustStock(-1)} style={{ borderColor: BORDER }} className="border rounded p-1">
                <Minus size={12} />
              </button>
              <span style={{ color: stock <= p.minStock ? BRICK : "#16241F" }} className="w-8 text-center text-sm font-medium">
                {stock}
              </span>
              <button onClick={() => onAdjustStock(1)} style={{ borderColor: BORDER }} className="border rounded p-1">
                <Plus size={12} />
              </button>
            </>
          )}
          {(p.variants || p.batches) && (
            <span style={{ color: stock <= p.minStock ? BRICK : "#16241F" }} className="text-sm font-medium">
              {stock}
            </span>
          )}
        </div>
      </div>

      {expiring.length > 0 && (
        <div style={{ color: BRICK }} className="text-xs mt-1 flex items-center gap-1">
          <AlertTriangle size={11} /> {expiring.length} lote(s) a vencer em breve
        </div>
      )}

      {expanded && p.variants && (
        <div className="mt-2 pt-2 space-y-1" style={{ borderTop: `1px solid ${BORDER}` }}>
          {p.variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between text-xs">
              <span>{v.label}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => onAdjustVariant(v.id, -1)} style={{ borderColor: BORDER }} className="border rounded p-0.5">
                  <Minus size={10} />
                </button>
                <span className="w-6 text-center">{v.stock}</span>
                <button onClick={() => onAdjustVariant(v.id, 1)} style={{ borderColor: BORDER }} className="border rounded p-0.5">
                  <Plus size={10} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-1.5 mt-1">
            <input value={newVariant} onChange={(e) => setNewVariant(e.target.value)} placeholder="Nova variante (ex: GG)" style={{ borderColor: BORDER }} className="border rounded px-2 py-1 text-xs flex-1" />
            <button
              onClick={() => {
                if (newVariant) {
                  onAddVariant(newVariant);
                  setNewVariant("");
                }
              }}
              style={{ color: TEAL }}
              className="text-xs font-medium"
            >
              + adicionar
            </button>
          </div>
        </div>
      )}

      {expanded && p.batches && (
        <div className="mt-2 pt-2 space-y-1" style={{ borderTop: `1px solid ${BORDER}` }}>
          {p.batches.map((b) => (
            <div key={b.id} className="flex items-center justify-between text-xs" style={{ color: daysUntil(b.expiryDate) <= 3 ? BRICK : MUTED }}>
              <span>
                Lote: {b.qty}
                {p.unit}
              </span>
              <span>Val: {b.expiryDate}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 mt-1">
            <input type="number" value={newBatchQty} onChange={(e) => setNewBatchQty(e.target.value)} placeholder="Qtd" style={{ borderColor: BORDER }} className="border rounded px-2 py-1 text-xs w-16" />
            <input type="date" value={newBatchExp} onChange={(e) => setNewBatchExp(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1 text-xs flex-1" />
            <button
              onClick={() => {
                if (newBatchQty) {
                  onAddBatch(newBatchQty, newBatchExp);
                  setNewBatchQty("");
                }
              }}
              style={{ color: TEAL }}
              className="text-xs font-medium"
            >
              + lote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BulkImportExport({ products, onImport }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const mapped = rows.map(mapImportRow).filter((r) => r.name);
      setPreview(mapped);
    } catch (err) {
      setPreview([]);
    }
  };

  const confirmImport = () => {
    if (preview && preview.length) onImport(preview);
    setPreview(null);
    setFileName("");
  };

  const downloadTemplate = () =>
    downloadWorkbook([{ Nome: "Arroz 5kg", Categoria: "Mercearia", Unidade: "un", Preço: 350, Custo: 260, Stock: 10, "Stock Mínimo": 5 }], "modelo_produtos.xlsx");

  const exportCurrent = () =>
    downloadWorkbook(
      products
        .filter((p) => !p.variants && !p.batches)
        .map((p) => ({ Nome: p.name, Categoria: p.category, Unidade: p.unit, Preço: p.price, Custo: p.cost, Stock: p.stock, "Stock Mínimo": p.minStock })),
      "estoque_actual.xlsx"
    );

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">Importar / exportar em massa (Excel)</div>
      <div className="text-xs" style={{ color: MUTED }}>
        Colunas esperadas: Nome, Categoria, Unidade, Preço, Custo, Stock, Stock Mínimo. Se o produto já existir (mesmo nome), a quantidade é somada ao stock actual;
        senão, cria um produto novo. Não se aplica a produtos com variantes ou validade.
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={downloadTemplate} style={{ borderColor: BORDER, color: TEAL }} className="border rounded px-3 py-1.5 text-xs font-medium">
          Descarregar modelo
        </button>
        <button onClick={exportCurrent} style={{ borderColor: BORDER, color: TEAL }} className="border rounded px-3 py-1.5 text-xs font-medium">
          Exportar estoque actual
        </button>
        <label style={{ background: TEAL, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium cursor-pointer">
          Escolher ficheiro Excel
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
        </label>
        {fileName && (
          <span style={{ color: MUTED }} className="text-xs self-center">
            {fileName}
          </span>
        )}
      </div>

      {preview && (
        <div style={{ borderColor: BORDER }} className="border rounded p-2 mt-2">
          {preview.length === 0 ? (
            <div className="text-xs" style={{ color: BRICK }}>
              Não foi possível ler linhas válidas deste ficheiro. Verifique as colunas e tente novamente.
            </div>
          ) : (
            <>
              <div className="text-xs mb-1.5" style={{ color: MUTED }}>
                {preview.length} linha(s) encontrada(s):
              </div>
              <div className="max-h-32 overflow-auto text-xs space-y-0.5 mb-2">
                {preview.slice(0, 15).map((r, i) => (
                  <div key={i} style={{ color: "#16241F" }}>
                    {r.name} — {r.category || "Geral"} — {fmtMT(Number(r.price) || 0)} — stock: {r.stock || 0}
                  </div>
                ))}
                {preview.length > 15 && <div style={{ color: MUTED }}>… e mais {preview.length - 15}</div>}
              </div>
              <button onClick={confirmImport} style={{ background: GREEN, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
                Confirmar importação
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function NovoLoteModal({ products, onAdd, onClose }) {
  const batchProducts = products.filter((p) => p.batches);
  const [productId, setProductId] = useState(batchProducts[0]?.id || "");
  const [qty, setQty] = useState("");
  const [expiryDate, setExpiryDate] = useState(todayStr());
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">Novo lote</div>
        {batchProducts.length === 0 ? (
          <div className="text-xs" style={{ color: MUTED }}>
            Nenhum produto está configurado com validade/lotes. Marque essa opção ao criar o produto em "Produtos".
          </div>
        ) : (
          <>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm mb-2">
              {batchProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input type="number" placeholder="Quantidade" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm mb-2" />
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm mb-3" />
            <button
              onClick={() => {
                if (qty) {
                  onAdd(productId, qty, expiryDate);
                  onClose();
                }
              }}
              style={{ background: GREEN, color: "#fff" }}
              className="w-full rounded py-2 text-sm font-medium"
            >
              Adicionar lote
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SaidaEstoqueModal({ store, onSubmit, onClose }) {
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState("");
  const [motivo, setMotivo] = useState("Danificado");
  const product = store.products.find((p) => p.id === productId);

  const submit = () => {
    if (!productId || !qty) return;
    onSubmit({ productId, variantId: variantId || null, qty: Number(qty), motivo });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">Saída de estoque</div>
        <div className="space-y-2">
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setVariantId("");
            }}
            style={{ borderColor: BORDER }}
            className="w-full border rounded px-2 py-1.5 text-sm"
          >
            <option value="">Produto</option>
            {store.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {product?.variants && (
            <select value={variantId} onChange={(e) => setVariantId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm">
              <option value="">Variante</option>
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Quantidade" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm" />
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm">
              <option>Danificado</option>
              <option>Vencido</option>
              <option>Roubo/Perda</option>
              <option>Erro de registo</option>
              <option>Outro</option>
            </select>
          </div>
          <button onClick={submit} style={{ background: BRICK, color: "#fff" }} className="px-3 py-1.5 rounded text-sm">
            Registar
          </button>
        </div>
      </div>
    </div>
  );
}
