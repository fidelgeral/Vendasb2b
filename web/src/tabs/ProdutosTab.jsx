import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, GREEN, BRICK } from "../lib/theme.js";
import { fmtMT, getStock, UNIDADES, IVA_TAXAS } from "../lib/utils.js";
import { StatCard, PhotoPicker, CategoriasModal } from "../components/Shared.jsx";
import { Plus, X, Package } from "../lib/icons.jsx";

export default function ProdutosTab({ store, setStore, api, onGoEstoque }) {
  const blank = {
    tipo: "simples",
    vendaDirecta: true,
    name: "",
    codigo: "",
    category: "",
    unit: "un",
    qtdItens: 1,
    ivaTaxa: "",
    price: "",
    cost: "",
    minStock: "",
    prazoReembolso: 0,
    foto: "",
    parentId: "",
    consumo: 1,
    ingredientes: [],
    addEstoque: false,
    estoqueQtd: "",
    estoqueCustoTotal: "",
    estoqueValidade: "",
    estoqueFornecedor: "",
  };
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showCategorias, setShowCategorias] = useState(false);
  const [ingSel, setIngSel] = useState({ productId: "", qty: "" });
  const [erro, setErro] = useState("");

  const categories = store.categories && store.categories.length ? store.categories : [...new Set(store.products.map((p) => p.category).filter(Boolean))].sort();
  const activeCount = store.products.filter((p) => p.active !== false).length;
  const inactiveCount = store.products.length - activeCount;
  const filteredProducts = store.products.filter(
    (p) =>
      (p.name.toLowerCase().includes(query.toLowerCase()) || (p.codigo || "").toLowerCase().includes(query.toLowerCase())) &&
      (!categoryFilter || p.category === categoryFilter) &&
      (statusFilter === "todos" || (statusFilter === "ativos" ? p.active !== false : p.active === false))
  );
  const valorCatalogo = store.products.reduce((s, p) => s + (p.cost || 0) * getStock(p, store.products), 0);
  const possiveisPais = store.products.filter((p) => p.tipo !== "variacao" && p.tipo !== "composicao" && p.id !== editingId);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validar = () => {
    if (!form.name.trim()) return "Indique o nome do produto.";
    if (!form.price && form.vendaDirecta) return "Indique o preço de venda.";
    if (form.tipo === "variacao" && !form.parentId) return "Escolha o produto-pai de onde sai o stock.";
    if (form.tipo === "variacao" && (Number(form.consumo) || 0) <= 0) return "A quantidade consumida do produto-pai tem de ser maior que zero.";
    if (form.tipo === "composicao" && form.ingredientes.length === 0) return "Adicione pelo menos um ingrediente à composição.";
    return "";
  };

  const buildPayload = () => ({
    tipo: form.tipo,
    vendaDirecta: form.vendaDirecta,
    name: form.name.trim(),
    codigo: (form.codigo || "").trim(),
    category: form.category || "Geral",
    unit: form.unit,
    qtdItens: Number(form.qtdItens) || 1,
    ivaTaxa: form.ivaTaxa === "" ? null : Number(form.ivaTaxa),
    price: Number(form.price) || 0,
    cost: Number(form.cost) || 0,
    minStock: Number(form.minStock) || 0,
    prazoReembolso: Number(form.prazoReembolso) || 0,
    foto: form.foto || "",
    parentId: form.tipo === "variacao" ? form.parentId : null,
    consumo: form.tipo === "variacao" ? Number(form.consumo) || 1 : 1,
    ingredientes: form.tipo === "composicao" ? form.ingredientes : [],
    fornecedorId: form.estoqueFornecedor || null,
    addEstoque: form.tipo === "simples" && form.addEstoque && !editingId,
    estoqueQtd: Number(form.estoqueQtd) || 0,
    estoqueValidade: form.estoqueValidade || null,
  });

  const submit = async () => {
    const e = validar();
    if (e) {
      setErro(e);
      return;
    }
    setErro("");
    const payload = buildPayload();
    if (editingId) {
      setStore(await api.updateProduct(editingId, payload));
      setEditingId(null);
    } else {
      setStore(await api.createProduct(payload));
    }
    setForm(blank);
    setShowForm(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      ...blank,
      tipo: p.tipo || "simples",
      vendaDirecta: p.vendaDirecta !== false,
      name: p.name || "",
      codigo: p.codigo || "",
      category: p.category || "",
      unit: p.unit || "un",
      qtdItens: p.qtdItens || 1,
      ivaTaxa: p.ivaTaxa === null || p.ivaTaxa === undefined ? "" : p.ivaTaxa,
      price: p.price || "",
      cost: p.cost || "",
      minStock: p.minStock || "",
      prazoReembolso: p.prazoReembolso || 0,
      foto: p.foto || "",
      parentId: p.parentId || "",
      consumo: p.consumo || 1,
      ingredientes: p.ingredientes || [],
    });
    setShowForm(true);
    setErro("");
  };

  const removeProduct = async (id) => {
    try {
      setStore(await api.deleteProduct(id));
    } catch (e) {
      setErro(e.message);
    }
  };
  const updateProduct = async (id, fields) => setStore(await api.updateProduct(id, fields));
  const addCategory = async (name) => {
    if (categories.includes(name)) return;
    setStore(await api.addCategory(name));
  };
  const removeCategory = async (name) => setStore(await api.removeCategory(name));

  const addIngrediente = () => {
    if (!ingSel.productId || !(Number(ingSel.qty) > 0)) return;
    set("ingredientes", [...form.ingredientes, { productId: ingSel.productId, qty: Number(ingSel.qty) }]);
    setIngSel({ productId: "", qty: "" });
  };

  const custoComposicao = form.ingredientes.reduce((a, ing) => {
    const prod = store.products.find((x) => x.id === ing.productId);
    return a + (prod ? (prod.cost || 0) * ing.qty : 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div style={{ background: "#7C3AED", color: "#fff" }} className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
            P
          </div>
          <div className="text-base font-semibold">Gestão de Produtos</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategorias(true)} style={{ background: "#D9642C", color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            Categorias
          </button>
          <button onClick={onGoEstoque} style={{ background: "#5B4FE0", color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            Importar
          </button>
          <button
            onClick={() => {
              setShowForm((s) => !s);
              setEditingId(null);
              setForm(blank);
              setErro("");
            }}
            style={{ background: GREEN, color: "#fff" }}
            className="rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1"
          >
            <Plus size={13} /> Novo produto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        <StatCard label="Total Produtos" value={store.products.length} />
        <StatCard label="Ativos" value={activeCount} />
        <StatCard label="Inativos" value={inactiveCount} />
        <StatCard label="Valor catálogo" value={fmtMT(valorCatalogo)} />
      </div>

      {showForm && (
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-4">
          <div className="text-sm font-semibold mb-3">{editingId ? "Editar produto" : "Adicionar novo produto"}</div>

          <div className="flex gap-4 mb-3 flex-wrap text-sm">
            {[
              { id: "simples", label: "Produto Simples" },
              { id: "variacao", label: "Variação" },
              { id: "composicao", label: "Composição / Combo" },
            ].map((t) => (
              <label key={t.id} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="tipoprod" checked={form.tipo === t.id} onChange={() => set("tipo", t.id)} disabled={!!editingId} />
                {t.label}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm mb-3">
            <input type="checkbox" checked={form.vendaDirecta} onChange={(e) => set("vendaDirecta", e.target.checked)} />
            Produto para venda directa?
            <span className="text-xs" style={{ color: MUTED }}>
              (desligue para matérias-primas que só entram em composições)
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Nome do produto *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Coca-Cola 2L" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Código do produto (barras)</label>
              <input value={form.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="EX: 4589641235498" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
          </div>

          {form.tipo === "variacao" && (
            <div style={{ background: "#FDF1EA", borderColor: "#E7C3AC" }} className="border rounded-lg p-3 mb-3">
              <div className="text-xs font-semibold mb-2" style={{ color: "#B2591F" }}>
                Produto Pai (origem do stock) *
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select value={form.parentId} onChange={(e) => set("parentId", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm">
                  <option value="">Seleccionar produto pai…</option>
                  {possiveisPais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({getStock(p, store.products)} {p.unit})
                    </option>
                  ))}
                </select>
                <div>
                  <input type="number" step="0.01" value={form.consumo} onChange={(e) => set("consumo", e.target.value)} placeholder="Quantidade consumida" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm" />
                  <div className="text-[11px] mt-1" style={{ color: MUTED }}>
                    Quanto do produto-pai sai a cada venda desta variação.
                  </div>
                </div>
              </div>
            </div>
          )}

          {form.tipo === "composicao" && (
            <div style={{ background: "#F2EFFD", borderColor: "#C6BDF0" }} className="border rounded-lg p-3 mb-3">
              <div className="text-xs font-semibold mb-2" style={{ color: "#5B4FE0" }}>
                Ingredientes / Composição
              </div>
              <div className="flex gap-2 mb-2 flex-wrap">
                <select value={ingSel.productId} onChange={(e) => setIngSel({ ...ingSel, productId: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm flex-1 min-w-[160px]">
                  <option value="">Seleccionar produto/insumo…</option>
                  {store.products.filter((p) => p.id !== editingId && p.tipo !== "composicao").map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input type="number" step="0.01" value={ingSel.qty} onChange={(e) => setIngSel({ ...ingSel, qty: e.target.value })} placeholder="Qtd consumo" style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm w-32" />
                <button onClick={addIngrediente} style={{ background: "#5B4FE0", color: "#fff" }} className="rounded px-3 py-2 text-xs font-medium">
                  Adicionar
                </button>
              </div>
              <div style={{ background: CARD, borderColor: BORDER }} className="border rounded p-2 space-y-1">
                {form.ingredientes.length === 0 && (
                  <div className="text-xs italic" style={{ color: MUTED }}>
                    Nenhum ingrediente adicionado.
                  </div>
                )}
                {form.ingredientes.map((ing, i) => {
                  const prod = store.products.find((x) => x.id === ing.productId);
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>
                        {prod ? prod.name : "—"} × {ing.qty} {prod ? prod.unit : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <span style={{ color: MUTED }}>{fmtMT(prod ? (prod.cost || 0) * ing.qty : 0)}</span>
                        <button onClick={() => set("ingredientes", form.ingredientes.filter((_, ix) => ix !== i))}>
                          <X size={13} style={{ color: BRICK }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {form.ingredientes.length > 0 && (
                  <div className="text-xs font-semibold pt-1" style={{ borderTop: "1px solid " + BORDER }}>
                    Custo calculado: {fmtMT(custoComposicao)}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs" style={{ color: MUTED }}>Categoria *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
                <option value="">Seleccionar…</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Taxa de IVA</label>
              <select value={form.ivaTaxa} onChange={(e) => set("ivaTaxa", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
                <option value="">Usar a do sistema</option>
                {IVA_TAXAS.map((t) => (
                  <option key={t} value={t}>
                    {t}%
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Unidade de medida *</label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
                {UNIDADES.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Qtd de itens *</label>
              <input type="number" value={form.qtdItens} onChange={(e) => set("qtdItens", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Preço de venda (MT) *</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="EX: 100" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Custo unitário (MT)</label>
              <input type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Stock mínimo *</label>
              <input type="number" value={form.minStock} onChange={(e) => set("minStock", e.target.value)} placeholder="10" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Prazo reembolso (dias)</label>
              <input type="number" value={form.prazoReembolso} onChange={(e) => set("prazoReembolso", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
          </div>

          {form.tipo === "simples" && !editingId && (
            <div style={{ background: form.addEstoque ? "#E9F6EE" : "#EFF3F1", borderColor: form.addEstoque ? "#8FCBA6" : BORDER }} className="border rounded-lg p-3 mb-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.addEstoque} onChange={(e) => set("addEstoque", e.target.checked)} />
                Adicionar produto no estoque agora
              </label>
              {form.addEstoque && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mt-3">
                  <div>
                    <label className="text-xs" style={{ color: MUTED }}>Quantidade *</label>
                    <input type="number" value={form.estoqueQtd} onChange={(e) => set("estoqueQtd", e.target.value)} placeholder="EX: 100" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: MUTED }}>Preço de custo total *</label>
                    <input type="number" value={form.estoqueCustoTotal} onChange={(e) => set("estoqueCustoTotal", e.target.value)} placeholder="1500" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: MUTED }}>Data de validade</label>
                    <input type="date" value={form.estoqueValidade} onChange={(e) => set("estoqueValidade", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: MUTED }}>Fornecedor</label>
                    <select value={form.estoqueFornecedor} onChange={(e) => set("estoqueFornecedor", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
                      <option value="">Escolher fornecedor</option>
                      {store.suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {Number(form.estoqueQtd) > 0 && Number(form.estoqueCustoTotal) > 0 && (
                    <div className="sm:col-span-4 text-xs" style={{ color: GREEN }}>
                      Custo unitário calculado: {fmtMT(Number(form.estoqueCustoTotal) / Number(form.estoqueQtd))}
                      {Number(form.price) > 0 && " · Margem: " + fmtMT(Number(form.price) - Number(form.estoqueCustoTotal) / Number(form.estoqueQtd))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-3">
            <label className="text-xs block mb-1" style={{ color: MUTED }}>Imagem do produto</label>
            <PhotoPicker value={form.foto} onChange={(v) => set("foto", v)} />
          </div>

          {erro && (
            <div className="text-xs mb-2" style={{ color: BRICK }}>
              {erro}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={submit} style={{ background: GREEN, color: "#fff" }} className="px-4 py-2 rounded text-sm font-medium">
              {editingId ? "Salvar mudança" : "Adicionar produto"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(blank); setErro(""); }} style={{ background: "#F5827A", color: "#fff" }} className="rounded px-4 py-2 text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5">
          {[
            { id: "todos", label: "Todos" },
            { id: "ativos", label: "Ativos" },
            { id: "inativos", label: "Inativos" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              style={{ background: statusFilter === t.id ? "#16241F" : CARD, color: statusFilter === t.id ? "#fff" : "#16241F", borderColor: BORDER }}
              className="border rounded-full px-3 py-1.5 text-xs font-medium"
            >
              {t.label}
            </button>
          ))}
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ borderColor: BORDER, background: CARD }} className="border rounded px-2 py-1.5 text-xs">
          <option value="">Categorias: Todas</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto ou código…" style={{ borderColor: BORDER, background: CARD }} className="w-full border rounded px-3 py-2 text-sm" />

      {erro && !showForm && (
        <div style={{ background: "#FBE9E7", color: BRICK }} className="rounded p-2 text-xs">
          {erro}
        </div>
      )}

      <div className="space-y-1.5">
        {filteredProducts.map((p) => (
          <ProdutoRow
            key={p.id}
            p={p}
            produtos={store.products}
            onRemove={() => removeProduct(p.id)}
            onEdit={() => startEdit(p)}
            onToggleActive={() => updateProduct(p.id, { active: p.active === false })}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-sm" style={{ color: MUTED }}>
            {store.products.length === 0 ? "Ainda não há produtos." : "Nenhum produto corresponde à pesquisa."}
          </div>
        )}
      </div>

      {showCategorias && <CategoriasModal categories={categories} onAdd={addCategory} onRemove={removeCategory} onClose={() => setShowCategorias(false)} />}
    </div>
  );
}

function ProdutoRow({ p, produtos, onRemove, onEdit, onToggleActive }) {
  const active = p.active !== false;
  const stock = getStock(p, produtos);
  const tipoInfo =
    p.tipo === "variacao"
      ? { label: "Variação", color: "#B2591F", bg: "#FDF1EA" }
      : p.tipo === "composicao"
      ? { label: "Composição", color: "#5B4FE0", bg: "#F2EFFD" }
      : { label: "Simples", color: MUTED, bg: "#EFF3F1" };
  const pai = p.tipo === "variacao" ? produtos.find((x) => x.id === p.parentId) : null;

  return (
    <div style={{ background: CARD, borderColor: BORDER, opacity: active ? 1 : 0.6 }} className="border rounded-lg p-2.5">
      <div className="flex items-center gap-3">
        <div style={{ background: "#EFF3F1" }} className="w-12 h-12 rounded overflow-hidden flex items-center justify-center shrink-0">
          {p.foto ? <img src={p.foto} alt="" className="w-full h-full object-cover" /> : <Package size={18} style={{ color: MUTED }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate flex items-center gap-2 flex-wrap">
            {p.name}
            <span style={{ background: tipoInfo.bg, color: tipoInfo.color }} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              {tipoInfo.label}
            </span>
            <span
              style={{ background: active ? "#E4F4EA" : "#F1F1F1", color: active ? GREEN : MUTED }}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase"
            >
              {active ? "Ativo" : "Inativo"}
            </span>
            {p.vendaDirecta === false && (
              <span style={{ background: "#FDF1EA", color: "#B2591F" }} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                Insumo
              </span>
            )}
          </div>
          <div style={{ color: MUTED }} className="text-xs">
            {p.codigo ? "Cód: " + p.codigo + " · " : ""}
            {p.category} · Venda {fmtMT(p.price)} · Custo {fmtMT(p.cost)} · Margem {fmtMT(p.price - p.cost)}
          </div>
          <div style={{ color: stock <= (p.minStock || 0) ? BRICK : MUTED }} className="text-xs">
            Stock: {stock} {p.unit}
            {pai ? " (de " + pai.name + ", consome " + p.consumo + ")" : ""}
            {p.tipo === "composicao" ? " (limitado pelos ingredientes)" : ""}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onToggleActive} style={{ color: active ? MUTED : GREEN }} className="text-xs font-medium">
            {active ? "Desativar" : "Ativar"}
          </button>
          <button onClick={onEdit} style={{ color: TEAL }} className="text-xs font-medium">
            Editar
          </button>
          <button onClick={onRemove}>
            <X size={15} style={{ color: BRICK }} />
          </button>
        </div>
      </div>
    </div>
  );
}
