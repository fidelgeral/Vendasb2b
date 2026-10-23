import { useMemo, useState, useEffect } from "react";
import { CARD, BORDER, MUTED, TEAL, GREEN, BRICK, INK } from "../lib/theme.js";
import { fmtMT, getStock, daysUntil, todayStr, mapImportRow } from "../lib/utils.js";
import { imprimirEtiquetas, downloadWorkbook } from "../lib/print.js";
import { Boxes, Package, AlertTriangle, Minus, Plus, Trash2, ArrowDownCircle, PackageX, X } from "../lib/icons.jsx";
import { getSession } from "../lib/api.js";
import { SelectComCriar, AcoesEntidade, DetalhesModal, HistoricoEntidadeModal, PencilIcon, ClockIcon } from "../components/Shared.jsx";
import { useConfirm } from "../components/ConfirmProvider.jsx";

const GOLD = "#F59E0B";

// Mostra uma data de validade de forma legível (a BD devolve ISO).
const fmtData = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("pt-PT");
};
// Converte uma data (ISO ou YYYY-MM-DD) para o formato de um <input type="date">.
const toInputDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

// Estado de um lote/linha de stock.
function statusDe(l) {
  const dias = l.expiry ? daysUntil(l.expiry) : null;
  if (l.qty <= 0) return { k: "esgotado", label: "Esgotado", color: BRICK };
  if (dias != null && dias < 0) return { k: "expirado", label: "Expirado", color: BRICK };
  if (dias != null && dias <= 30) return { k: "expira", label: "Prestes a expirar", color: GOLD };
  if (l.qty <= (Number(l.product.minStock) || 0)) return { k: "baixo", label: "Baixo Stock", color: GOLD };
  return { k: "normal", label: "Normal", color: GREEN };
}

export default function EstoqueTab({ store, setStore, api, showToast, registerQuebra, onGoCompras, can = () => true }) {
  const confirmar = useConfirm();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showTipoAdicao, setShowTipoAdicao] = useState(false);
  const [novoLoteProduct, setNovoLoteProduct] = useState(null); // produto pré-seleccionado ou {} para individual
  const [showMultiplos, setShowMultiplos] = useState(false);
  const [editLote, setEditLote] = useState(null);
  const [histLote, setHistLote] = useState(null);
  const [quebraLote, setQuebraLote] = useState(null);
  const [entradaLote, setEntradaLote] = useState(null);
  const [showSaida, setShowSaida] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [verProduto, setVerProduto] = useState(null);
  const [editProduto, setEditProduto] = useState(null);
  const [histProduto, setHistProduto] = useState(null);

  const session = getSession();
  const outrasFiliais = (session?.filiais || []).filter((f) => f.id !== store.id);
  const nomeFornecedor = useMemo(() => {
    const m = {};
    (store.suppliers || []).forEach((s) => (m[s.id] = s.name));
    return m;
  }, [store.suppliers]);

  // Constrói as linhas: cada lote é uma linha; produtos sem lotes mostram o
  // stock simples; produtos com variantes mostram uma linha agregada.
  const linhas = useMemo(() => {
    const arr = [];
    store.products.forEach((p) => {
      if (p.variants && p.variants.length) {
        arr.push({ key: "v" + p.id, product: p, tipo: "variante", nome: p.name, qty: getStock(p, store.products), custoTotal: (Number(p.cost) || 0) * getStock(p, store.products), expiry: null, supplierId: null });
        return;
      }
      if (p.batches && p.batches.length) {
        p.batches.forEach((b) =>
          arr.push({ key: b.id, product: p, tipo: "lote", loteId: b.id, nome: b.name || p.name, qty: Number(b.qty), custoTotal: Number(b.costTotal) || 0, expiry: b.expiryDate, supplierId: b.supplierId, initialQty: Number(b.initialQty) || 0 })
        );
        return;
      }
      arr.push({ key: "s" + p.id, product: p, tipo: "stock", nome: p.name, qty: getStock(p, store.products), custoTotal: (Number(p.cost) || 0) * getStock(p, store.products), expiry: null, supplierId: null });
    });
    return arr;
  }, [store.products]);

  // Cartões de resumo.
  const totalLotes = linhas.filter((l) => l.tipo === "lote").length;
  const valorStock = linhas.reduce((s, l) => s + l.custoTotal, 0);
  const valorPotencial = linhas.reduce((s, l) => s + (Number(l.product.price) || 0) * l.qty, 0);
  const esgotados = linhas.filter((l) => l.qty <= 0).length;
  const prestesExpirar = linhas.filter((l) => statusDe(l).k === "expira").length;
  const unidadesExpiradas = linhas.filter((l) => l.expiry && daysUntil(l.expiry) < 0 && l.qty > 0).reduce((s, l) => s + l.qty, 0);
  const baixoStock = linhas.filter((l) => statusDe(l).k === "baixo").length;
  const quebrasUnid = (store.quebras || []).reduce((s, q) => s + Number(q.qty || 0), 0);

  const cards = [
    { label: "Produtos físicos", sub: "Itens de estoque", value: store.products.length, color: INK },
    { label: "Total de lotes", sub: "Entradas activas", value: totalLotes, color: INK },
    { label: "Valor total em stock", sub: "Custo real", value: fmtMT(valorStock), color: INK },
    { label: "Valor potencial", sub: "Previsão de venda", value: fmtMT(valorPotencial), color: INK },
    { label: "Esgotados", sub: "Produtos zerados", value: esgotados, color: esgotados ? BRICK : INK },
    { label: "Prestes a expirar", sub: "Unidades (30 dias)", value: prestesExpirar, color: prestesExpirar ? GOLD : INK },
    { label: "Itens expirados", sub: "Unidades vencidas", value: unidadesExpiradas, color: unidadesExpiradas ? BRICK : INK },
    { label: "Baixo stock", sub: "Abaixo do mínimo", value: baixoStock, color: baixoStock ? GOLD : INK },
    { label: "Quebras registadas", sub: "Unidades perdidas", value: quebrasUnid, color: quebrasUnid ? BRICK : INK },
  ];

  const chips = [
    { id: "todos", label: "Todos" },
    { id: "normal", label: "Normal" },
    { id: "baixo", label: "Baixo Stock" },
    { id: "esgotado", label: "Esgotados" },
    { id: "expira", label: "Prestes a Expirar" },
    { id: "expirado", label: "Expirados" },
  ];

  const categories = store.categories && store.categories.length ? store.categories : [...new Set(store.products.map((p) => p.category).filter(Boolean))].sort();

  const linhasFiltradas = linhas.filter((l) => {
    const q = query.trim().toLowerCase();
    if (q && !(l.nome.toLowerCase().includes(q) || l.product.name.toLowerCase().includes(q))) return false;
    if (categoryFilter && l.product.category !== categoryFilter) return false;
    if (supplierFilter && l.supplierId !== supplierFilter) return false;
    if (statusFilter !== "todos" && statusDe(l).k !== statusFilter) return false;
    return true;
  });

  // Acções
  const guard = async (fn, okMsg, tone = "ok") => {
    try {
      const st = await fn();
      if (st) setStore(st);
      if (okMsg) showToast(okMsg, tone);
    } catch (e) {
      showToast(e.message || "Ocorreu um erro", "warn");
    }
  };
  // Gera um código interno (EAN-like de 13 dígitos, prefixo "20" de uso interno)
  // para produtos que ainda não têm código, para a etiqueta ficar escaneável.
  const gerarCodigoInterno = () => "20" + String(Date.now()).slice(-7) + Math.floor(1000 + Math.random() * 9000);
  const imprimirEtiquetasComCodigo = async () => {
    const produtos = linhas.map((l) => l.product);
    const semCodigo = produtos.filter((p) => !(p.codigo || "").trim());
    let lista = produtos;
    if (semCodigo.length) {
      const ok = await confirmar({
        title: "Gerar códigos de barras?",
        message: `${semCodigo.length} produto(s) não têm código. Gerar um código interno para eles, para a etiqueta ficar escaneável?`,
        confirmLabel: "Gerar e imprimir",
      });
      if (ok) {
        let st = store;
        for (const p of semCodigo) {
          // eslint-disable-next-line no-await-in-loop
          st = await api.updateProduct(p.id, { codigo: gerarCodigoInterno() });
        }
        setStore(st);
        const porId = Object.fromEntries(st.products.map((x) => [x.id, x]));
        lista = produtos.map((p) => porId[p.id] || p);
      }
    }
    imprimirEtiquetas(lista, store.config.businessName);
  };

  const criarLote = async (payload) => {
    if (!(await confirmar({ title: "Guardar lote?", message: "Vai registar este lote no stock.", confirmLabel: "Guardar" }))) return;
    guard(() => api.createLote(payload), "Lote criado");
  };
  const criarLotesBulk = async (payload) => {
    if (!(await confirmar({ title: "Guardar lotes?", message: "Vai registar os lotes introduzidos no stock.", confirmLabel: "Guardar" }))) return;
    guard(() => api.createLotesBulk(payload), "Lotes registados");
  };
  const entradaSubmit = (id, qty) => guard(() => api.loteEntrada(id, qty), "Entrada registada");
  const editarSubmit = (id, payload) => guard(() => api.updateLote(id, payload), "Lote actualizado");
  const quebraSubmit = (id, qty, motivo) => guard(() => api.loteQuebra(id, qty, motivo), "Quebra registada", "warn");
  const apagarLote = async (id) => {
    if (!(await confirmar({ title: "Apagar lote?", message: "Vai apagar este lote. Esta acção não pode ser anulada.", confirmLabel: "Apagar", danger: true }))) return;
    guard(() => api.deleteLote(id), "Lote apagado", "warn");
  };
  const apagarProduto = async (p) => {
    if (!(await confirmar({ title: "Apagar produto?", message: `Vai apagar "${p.name}". Esta acção não pode ser anulada.`, confirmLabel: "Apagar", danger: true }))) return;
    guard(() => api.deleteProduct(p.id), "Produto apagado", "warn");
  };
  // Criação rápida de fornecedor a partir dos seletores dos modais.
  const criarFornecedorRapido = async (name) => {
    const novoStore = await api.createSupplier({ name });
    setStore(novoStore);
    const novo = [...(novoStore.suppliers || [])].reverse().find((s) => s.name === name);
    return novo ? novo.id : "";
  };

  const abrirNovoLote = (produto) => {
    setNovoLoteProduct(produto || {});
    setShowTipoAdicao(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div style={{ background: "#4F46E5", color: "#fff" }} className="w-7 h-7 rounded-full flex items-center justify-center">
            <Boxes size={14} />
          </div>
          <div className="text-base font-semibold">Gestão de Stock</div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {can("quebras") && (
            <button onClick={() => setShowSaida(true)} style={{ background: BRICK, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-xs font-medium">
              − Saída Estoque
            </button>
          )}
          {can("loteNovo") && (
            <button onClick={() => setShowTipoAdicao(true)} style={{ background: GREEN, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-xs font-medium">
              + Novo Lote
            </button>
          )}
          <button onClick={onGoCompras} style={{ background: "#2563EB", color: "#fff" }} className="rounded-lg px-3 py-1.5 text-xs font-medium">
            Fornecedores
          </button>
          {outrasFiliais.length > 0 && can("loteNovo") && (
            <button onClick={() => setShowTransfer(true)} style={{ background: "#7C3AED", color: "#fff" }} className="rounded-lg px-3 py-1.5 text-xs font-medium">
              ⇄ Transferir p/ filial
            </button>
          )}
          <button onClick={imprimirEtiquetasComCodigo} style={{ borderColor: BORDER, color: INK }} className="border rounded-lg px-3 py-1.5 text-xs font-medium">
            Imprimir etiquetas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {cards.map((c) => (
          <div key={c.label} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wide" style={{ color: MUTED }}>
              {c.label}
            </div>
            <div style={{ color: c.color }} className="text-xl font-bold mt-1 leading-tight">
              {c.value}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: MUTED }}>
              {c.sub}
            </div>
          </div>
        ))}
      </div>

      <BulkImportExport products={store.products} onImport={async (rows) => {
        const res = await api.bulkImportProducts(rows);
        setStore(res.store);
        const { created, updated, skipped } = res.summary;
        showToast(`Importação concluída: ${created} criado(s), ${updated} actualizado(s)${skipped ? `, ${skipped} ignorado(s)` : ""}`);
      }} />

      {/* Filtros por estado */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {chips.map((c) => {
          const active = statusFilter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setStatusFilter(c.id)}
              style={{ background: active ? TEAL : CARD, color: active ? "#fff" : INK, borderColor: BORDER }}
              className="border rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
            >
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar Produto ou Nome do Lote…" style={{ borderColor: BORDER, background: CARD }} className="flex-1 min-w-[160px] border rounded-lg px-3 py-2 text-sm" />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ borderColor: BORDER, background: CARD }} className="border rounded-lg px-2 py-2 text-sm">
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} style={{ borderColor: BORDER, background: CARD }} className="border rounded-lg px-2 py-2 text-sm">
          <option value="">Fornecedores</option>
          {(store.suppliers || []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 860 }}>
          <thead>
            <tr style={{ color: MUTED, borderBottom: `1px solid ${BORDER}`, background: "#F8FAFC" }} className="text-left text-[11px] uppercase tracking-wide">
              <th className="px-3 py-2 font-semibold">Stock</th>
              <th className="px-3 py-2 font-semibold">Produto</th>
              <th className="px-3 py-2 font-semibold">Categoria</th>
              <th className="px-3 py-2 font-semibold">Validade</th>
              <th className="px-3 py-2 font-semibold text-right">Qtd</th>
              <th className="px-3 py-2 font-semibold text-right">Preço</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold text-center">Acção</th>
            </tr>
          </thead>
          <tbody>
            {linhasFiltradas.map((l) => (
              <LoteRow
                key={l.key}
                l={l}
                fornecedor={nomeFornecedor[l.supplierId]}
                onEntrada={can("loteAdicionar") ? () => setEntradaLote(l) : undefined}
                onEditar={can("loteEditar") ? () => setEditLote(l) : undefined}
                onHistorico={() => setHistLote(l)}
                onQuebra={can("loteQuebra") ? () => setQuebraLote(l) : undefined}
                onApagar={can("loteApagar") ? () => apagarLote(l.loteId) : undefined}
                onCriarLote={can("loteNovo") ? () => abrirNovoLote(l.product) : undefined}
                onVerProduto={() => setVerProduto(l.product)}
                onEditarProduto={can("produtoEditar") ? () => setEditProduto(l.product) : undefined}
                onHistoricoProduto={() => setHistProduto(l.product)}
                onApagarProduto={can("produtoApagar") ? () => apagarProduto(l.product) : undefined}
              />
            ))}
            {linhasFiltradas.length === 0 && (
              <tr>
                <td colSpan={8} className="text-sm py-6 text-center" style={{ color: MUTED }}>
                  {store.products.length === 0 ? "Adicione produtos na aba Produtos primeiro." : "Nenhum lote corresponde aos filtros."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showTipoAdicao && (
        <TipoAdicaoModal
          onIndividual={() => abrirNovoLote(null)}
          onMultiplos={() => {
            setShowMultiplos(true);
            setShowTipoAdicao(false);
          }}
          onClose={() => setShowTipoAdicao(false)}
        />
      )}
      {novoLoteProduct && (
        <NovoLoteModal
          store={store} onCreateSupplier={criarFornecedorRapido}
          produtoInicial={novoLoteProduct.id ? novoLoteProduct : null}
          onAdd={(payload) => {
            criarLote(payload);
            setNovoLoteProduct(null);
          }}
          onClose={() => setNovoLoteProduct(null)}
        />
      )}
      {showMultiplos && (
        <MultiplosLotesModal
          store={store} onCreateSupplier={criarFornecedorRapido}
          onAdd={(payload) => {
            criarLotesBulk(payload);
            setShowMultiplos(false);
          }}
          onClose={() => setShowMultiplos(false)}
        />
      )}
      {entradaLote && (
        <EntradaLoteModal
          lote={entradaLote}
          onSubmit={(qty) => {
            entradaSubmit(entradaLote.loteId, qty);
            setEntradaLote(null);
          }}
          onClose={() => setEntradaLote(null)}
        />
      )}
      {editLote && (
        <EditarLoteModal
          lote={editLote}
          store={store} onCreateSupplier={criarFornecedorRapido}
          onSubmit={(payload) => {
            editarSubmit(editLote.loteId, payload);
            setEditLote(null);
          }}
          onClose={() => setEditLote(null)}
        />
      )}
      {quebraLote && (
        <QuebraLoteModal
          lote={quebraLote}
          onSubmit={(qty, motivo) => {
            quebraSubmit(quebraLote.loteId, qty, motivo);
            setQuebraLote(null);
          }}
          onClose={() => setQuebraLote(null)}
        />
      )}
      {histLote && <HistoricoLoteModal lote={histLote} api={api} onClose={() => setHistLote(null)} />}

      {verProduto && (
        <DetalhesModal
          title={verProduto.name}
          onClose={() => setVerProduto(null)}
          linhas={[
            { label: "Categoria", value: verProduto.category },
            { label: "Código", value: verProduto.codigo },
            { label: "Unidade", value: verProduto.unit },
            { label: "Preço de venda", value: fmtMT(verProduto.price) },
            { label: "Custo unitário", value: fmtMT(verProduto.cost) },
            { label: "Stock actual", value: `${getStock(verProduto, store.products)} ${verProduto.unit || "un"}` },
            { label: "Stock mínimo", value: verProduto.minStock },
            { label: "Fornecedor", value: nomeFornecedor[verProduto.fornecedorId] },
            { label: "Estado", value: verProduto.active === false ? "Inativo" : "Activo" },
          ]}
        />
      )}
      {editProduto && (
        <ProdutoEditModal
          produto={editProduto}
          store={store}
          onCreateCategoria={async (name) => { const st = await api.addCategory(name); setStore(st); return name; }}
          onSubmit={(payload) => { guard(() => api.updateProduct(editProduto.id, payload), "Produto actualizado"); setEditProduto(null); }}
          onClose={() => setEditProduto(null)}
        />
      )}
      {histProduto && <HistoricoEntidadeModal title={histProduto.name} api={api} tipo="produto" id={histProduto.id} onClose={() => setHistProduto(null)} />}

      {showSaida && <SaidaEstoqueModal store={store} onSubmit={registerQuebra} onClose={() => setShowSaida(false)} />}
      {showTransfer && (
        <TransferModal
          store={store}
          filiais={outrasFiliais}
          onSubmit={async (payload) => {
            try {
              setStore(await api.transferStock(payload));
              showToast("Stock transferido");
              setShowTransfer(false);
            } catch (e) {
              showToast(e.message, "warn");
            }
          }}
          onClose={() => setShowTransfer(false)}
        />
      )}
    </div>
  );
}

function IconBtn({ title, onClick, children, color }) {
  return (
    <button onClick={onClick} title={title} style={{ borderColor: BORDER, color: color || INK }} className="border rounded-full w-7 h-7 flex items-center justify-center shrink-0 hover:bg-gray-50">
      {children}
    </button>
  );
}

function LoteRow({ l, fornecedor, onEntrada, onEditar, onHistorico, onQuebra, onApagar, onCriarLote, onVerProduto, onEditarProduto, onHistoricoProduto, onApagarProduto }) {
  const st = statusDe(l);
  const p = l.product;
  const unit = p.unit && p.unit !== "un" ? p.unit : "un";
  const isLote = l.tipo === "lote";
  const td = "px-3 py-2 align-middle";
  return (
    <tr style={{ borderBottom: `1px solid ${BORDER}`, borderLeft: `3px solid ${st.color}` }} className="hover:bg-gray-50">
      <td className={td}>
        <div className="flex items-center gap-2 min-w-0">
          <div style={{ background: "#F1F5F9" }} className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
            {p.foto ? <img src={p.foto} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : <Package size={14} style={{ color: MUTED }} />}
          </div>
          <span className="font-medium truncate max-w-[160px]">{l.nome}</span>
        </div>
      </td>
      <td className={td}>
        <div className="truncate max-w-[180px]">{p.name}</div>
        <div style={{ color: MUTED }} className="text-[11px]">ID {String(p.id).slice(0, 4)} · {unit}{fornecedor ? ` · ${fornecedor}` : ""}</div>
      </td>
      <td className={td} style={{ color: MUTED }}>{p.category || "—"}</td>
      <td className={td} style={{ color: l.expiry && statusDe(l).k === "expirado" ? BRICK : MUTED }}>{fmtData(l.expiry)}</td>
      <td className={td + " text-right font-semibold"} style={{ color: l.qty <= 0 ? BRICK : INK }}>{l.qty}</td>
      <td className={td + " text-right"}>{fmtMT(l.custoTotal)}</td>
      <td className={td}>
        <span style={{ background: st.color, color: "#fff" }} className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">{st.label}</span>
      </td>
      <td className={td}>
        <div className="flex items-center justify-center gap-1">
          {isLote ? (
            <>
              {onEntrada && <IconBtn title="Entrada (adicionar quantidade)" onClick={onEntrada} color={GREEN}><ArrowDownCircle size={14} /></IconBtn>}
              {onEditar && <IconBtn title="Editar lote" onClick={onEditar} color={TEAL}><PencilIcon size={13} /></IconBtn>}
              <IconBtn title="Histórico" onClick={onHistorico}><ClockIcon size={13} /></IconBtn>
              {onQuebra && <IconBtn title="Quebra" onClick={onQuebra} color={GOLD}><PackageX size={13} /></IconBtn>}
              {onApagar && <IconBtn title="Apagar lote" onClick={onApagar} color={BRICK}><Trash2 size={13} /></IconBtn>}
            </>
          ) : l.tipo === "stock" ? (
            <>
              {onCriarLote && (
                <button onClick={onCriarLote} style={{ color: TEAL, borderColor: BORDER }} className="border rounded-full px-2.5 py-1 text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                  <Plus size={12} /> Criar lote
                </button>
              )}
              <AcoesEntidade onVer={onVerProduto} onEditar={onEditarProduto} onHistorico={onHistoricoProduto} onApagar={onApagarProduto} />
            </>
          ) : (
            <span className="text-[11px]" style={{ color: MUTED }}>variantes → Produtos</span>
          )}
        </div>
      </td>
    </tr>
  );
}

function ModalShell({ title, onClose, children, max = "max-w-md" }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className={"rounded-2xl p-4 w-full " + max + " max-h-[90vh] overflow-auto"} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">{title}</div>
          <button onClick={onClose} style={{ color: MUTED }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TipoAdicaoModal({ onIndividual, onMultiplos, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-2xl p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold text-center mb-4">📦 Escolha o tipo de adição</div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onIndividual} style={{ borderColor: BORDER }} className="border rounded-xl p-4 text-center hover:border-indigo-300 hover:shadow">
            <div className="font-semibold text-sm">Individual</div>
            <div className="text-xs mt-1" style={{ color: MUTED }}>Adicionar um único lote detalhado.</div>
          </button>
          <button onClick={onMultiplos} style={{ borderColor: BORDER }} className="border rounded-xl p-4 text-center hover:border-indigo-300 hover:shadow">
            <div className="font-semibold text-sm">Múltiplos Lotes</div>
            <div className="text-xs mt-1" style={{ color: MUTED }}>Adicionar vários lotes de forma rápida.</div>
          </button>
        </div>
      </div>
    </div>
  );
}

function NovoLoteModal({ store, produtoInicial, onAdd, onClose, onCreateSupplier }) {
  const produtos = store.products.filter((p) => p.tipo === "simples" && !(p.variants && p.variants.length));
  const [productId, setProductId] = useState(produtoInicial?.id || produtos[0]?.id || "");
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [custoUnit, setCustoUnit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const prod = produtos.find((p) => p.id === productId);
  const total = (Number(qty) || 0) * (Number(custoUnit) || 0);

  const submit = () => {
    if (!productId || !(Number(qty) >= 0)) return;
    onAdd({ productId, name: name || null, qty: Number(qty), costTotal: total, expiryDate: expiryDate || null, supplierId: supplierId || null });
  };

  return (
    <ModalShell title="📦 Adicionar Novo Lote" onClose={onClose}>
      {produtos.length === 0 ? (
        <div className="text-xs" style={{ color: MUTED }}>Crie primeiro um produto simples na aba Produtos.</div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Produto *</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1">
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Fornecedor</label>
            <div className="mt-1">
              <SelectComCriar
                value={supplierId}
                onChange={setSupplierId}
                options={(store.suppliers || []).map((s) => ({ value: s.id, label: s.name }))}
                onCreate={onCreateSupplier}
                placeholder="Escolher fornecedor"
                createLabel="➕ Novo fornecedor"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Nome do Lote</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={prod ? `${prod.name} -L001` : "Ex: LOTE-2026-001"} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Data de Expiração</label>
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Quantidade</label>
              <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Custo de Compra por Unidade *</label>
              <input type="number" value={custoUnit} onChange={(e) => setCustoUnit(e.target.value)} placeholder="Ex: 35" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
            </div>
          </div>
          <div style={{ background: "#F1F5F9" }} className="rounded-lg p-2.5 text-sm">
            <div className="flex justify-between"><span style={{ color: MUTED }}>Quantidade:</span><span>{Number(qty) || 0} Unidades</span></div>
            <div className="flex justify-between"><span style={{ color: MUTED }}>Custo por Unidade:</span><span>{fmtMT(Number(custoUnit) || 0)}</span></div>
            <div className="flex justify-between font-semibold"><span>Custo Total (calculado):</span><span>{fmtMT(total)}</span></div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} style={{ background: "#475569", color: "#fff" }} className="flex-1 rounded-lg py-2 text-sm font-semibold">Cancelar</button>
            <button onClick={submit} style={{ background: GREEN, color: "#fff" }} className="flex-1 rounded-lg py-2 text-sm font-semibold">Adicionar</button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

function MultiplosLotesModal({ store, onAdd, onClose, onCreateSupplier }) {
  const produtos = store.products.filter((p) => p.tipo === "simples" && !(p.variants && p.variants.length));
  const [supplierId, setSupplierId] = useState("");
  const linhaVazia = () => ({ productId: "", qty: "", custoUnit: "", expiryDate: "" });
  const [linhas, setLinhas] = useState([linhaVazia(), linhaVazia(), linhaVazia()]);
  const set = (i, campo, val) => setLinhas((ls) => ls.map((l, idx) => (idx === i ? { ...l, [campo]: val } : l)));
  const validas = linhas.filter((l) => l.productId && Number(l.qty) >= 0 && l.qty !== "");

  const submit = () => {
    if (!validas.length) return;
    onAdd({ supplierId: supplierId || null, lotes: validas.map((l) => ({ productId: l.productId, qty: Number(l.qty), costTotal: (Number(l.qty) || 0) * (Number(l.custoUnit) || 0), expiryDate: l.expiryDate || null })) });
  };

  return (
    <ModalShell title="📦 Entrada de Lotes por Fornecedor" onClose={onClose} max="max-w-2xl">
      <div className="space-y-3">
        <div>
          <label className="text-xs" style={{ color: MUTED }}>Fornecedor</label>
          <div className="mt-1">
            <SelectComCriar
              value={supplierId}
              onChange={setSupplierId}
              options={(store.suppliers || []).map((s) => ({ value: s.id, label: s.name }))}
              onCreate={onCreateSupplier}
              placeholder="Pesquisar Fornecedor…"
              createLabel="➕ Novo fornecedor"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-1.5 text-[11px] font-semibold" style={{ color: MUTED }}>
            <div className="col-span-4">PRODUTO *</div>
            <div className="col-span-2">QTD *</div>
            <div className="col-span-2">CUSTO/UNID *</div>
            <div className="col-span-2 text-right">TOTAL</div>
            <div className="col-span-1">VAL.</div>
            <div className="col-span-1"></div>
          </div>
          {linhas.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-1.5 items-center">
              <select value={l.productId} onChange={(e) => set(i, "productId", e.target.value)} style={{ borderColor: BORDER }} className="col-span-4 border rounded-lg px-2 py-1.5 text-sm">
                <option value="">Pesquisar Produto…</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input type="number" value={l.qty} onChange={(e) => set(i, "qty", e.target.value)} placeholder="Ex: 10" style={{ borderColor: BORDER }} className="col-span-2 border rounded-lg px-2 py-1.5 text-sm" />
              <input type="number" value={l.custoUnit} onChange={(e) => set(i, "custoUnit", e.target.value)} placeholder="Ex: 35" style={{ borderColor: BORDER }} className="col-span-2 border rounded-lg px-2 py-1.5 text-sm" />
              <div className="col-span-2 text-right text-sm" style={{ color: MUTED }}>{fmtMT((Number(l.qty) || 0) * (Number(l.custoUnit) || 0))}</div>
              <input type="date" value={l.expiryDate} onChange={(e) => set(i, "expiryDate", e.target.value)} style={{ borderColor: BORDER }} className="col-span-1 border rounded-lg px-1 py-1.5 text-xs" />
              <button onClick={() => setLinhas((ls) => ls.filter((_, idx) => idx !== i))} style={{ color: BRICK }} className="col-span-1 flex justify-center"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={() => setLinhas((ls) => [...ls, linhaVazia()])} style={{ color: GREEN }} className="text-xs font-medium flex items-center gap-1">
            <Plus size={12} /> Adicionar produto a este fornecedor
          </button>
        </div>
        <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${BORDER}` }}>
          <span className="text-xs" style={{ color: MUTED }}>Total de lotes a registar: {validas.length}</span>
          <div className="flex gap-2">
            <button onClick={onClose} style={{ borderColor: BORDER, color: INK }} className="border rounded-lg px-3 py-1.5 text-sm">Cancelar</button>
            <button onClick={submit} style={{ background: GREEN, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-sm font-semibold">Adicionar Tudo</button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function EntradaLoteModal({ lote, onSubmit, onClose }) {
  const [qty, setQty] = useState(1);
  const atalhos = [5, 10, 12, 24, 48];
  return (
    <ModalShell title="📦 Atualizar Lote" onClose={onClose}>
      <div style={{ background: "#F8FAFC", borderColor: BORDER }} className="border rounded-lg p-2.5 text-sm mb-3">
        <div className="font-semibold">{lote.product.name}</div>
        <div style={{ color: MUTED }} className="text-xs">{lote.nome} · Estoque atual: {lote.qty} Unidades</div>
      </div>
      <label className="text-xs" style={{ color: MUTED }}>Quantidade a adicionar</label>
      <div className="flex items-center gap-2 mt-1">
        <button onClick={() => setQty((q) => Math.max(1, Number(q) - 1))} style={{ borderColor: BORDER }} className="border rounded-lg p-2"><Minus size={14} /></button>
        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="flex-1 border rounded-lg px-2 py-2 text-center text-sm" style={{ borderColor: BORDER }} />
        <button onClick={() => setQty((q) => Number(q) + 1)} style={{ borderColor: BORDER }} className="border rounded-lg p-2"><Plus size={14} /></button>
      </div>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {atalhos.map((a) => (
          <button key={a} onClick={() => setQty((q) => Number(q) + a)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1 text-xs">+{a}</button>
        ))}
      </div>
      <div style={{ background: "#DCFCE7", color: "#166534" }} className="rounded-lg p-2.5 text-sm mt-3 flex justify-between">
        <span>Estoque: {lote.qty} + Add: {Number(qty) || 0}</span>
        <span className="font-semibold">= {lote.qty + (Number(qty) || 0)} un</span>
      </div>
      <button onClick={() => Number(qty) > 0 && onSubmit(Number(qty))} style={{ background: TEAL, color: "#fff" }} className="w-full rounded-lg py-2.5 text-sm font-semibold mt-3">
        Adicionar Produto ao Lote
      </button>
    </ModalShell>
  );
}

function EditarLoteModal({ lote, store, onSubmit, onClose, onCreateSupplier }) {
  const baseQtd = Number(lote.initialQty) > 0 ? Number(lote.initialQty) : Number(lote.qty) || 0;
  const custoUnitInicial = baseQtd > 0 ? (Number(lote.custoTotal) || 0) / baseQtd : 0;
  const [name, setName] = useState(lote.nome || "");
  const [expiryDate, setExpiryDate] = useState(toInputDate(lote.expiry));
  const [custoUnit, setCustoUnit] = useState(custoUnitInicial ? String(Number(custoUnitInicial.toFixed(2))) : "");
  const [qty, setQty] = useState(String(lote.qty));
  const [supplierId, setSupplierId] = useState(lote.supplierId || "");
  const [motivo, setMotivo] = useState("");
  const mudouQty = Number(qty) !== lote.qty;
  const total = (Number(qty) || 0) * (Number(custoUnit) || 0);

  const submit = () => {
    if (mudouQty && !motivo.trim()) return;
    onSubmit({ name, expiryDate: expiryDate || null, costTotal: total, qty: Number(qty), supplierId: supplierId || null, motivo });
  };

  return (
    <ModalShell title="📦 Editar Lote" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="text-xs" style={{ color: MUTED }}>Produto</label>
          <input value={lote.product.name} disabled style={{ borderColor: BORDER, background: "#F1F5F9" }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
        </div>
        <div>
          <label className="text-xs" style={{ color: MUTED }}>Fornecedor</label>
          <div className="mt-1">
            <SelectComCriar
              value={supplierId}
              onChange={setSupplierId}
              options={(store.suppliers || []).map((s) => ({ value: s.id, label: s.name }))}
              onCreate={onCreateSupplier}
              placeholder="Escolher fornecedor"
              createLabel="➕ Novo fornecedor"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Nome do Lote</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Data de Expiração</label>
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Quantidade</label>
            <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Custo de Compra por Unidade</label>
            <input type="number" value={custoUnit} onChange={(e) => setCustoUnit(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
          </div>
        </div>
        <div style={{ background: "#F1F5F9" }} className="rounded-lg p-2 text-xs flex justify-between">
          <span style={{ color: MUTED }}>Custo total do lote (calculado):</span>
          <span className="font-semibold">{fmtMT(total)}</span>
        </div>
        {mudouQty && (
          <div>
            <label className="text-xs" style={{ color: BRICK }}>Motivo da alteração de quantidade *</label>
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: Correção de contagem" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onClose} style={{ background: "#475569", color: "#fff" }} className="flex-1 rounded-lg py-2 text-sm font-semibold">Cancelar</button>
          <button onClick={submit} style={{ background: TEAL, color: "#fff" }} className="flex-1 rounded-lg py-2 text-sm font-semibold">Salvar Alterações</button>
        </div>
      </div>
    </ModalShell>
  );
}

function QuebraLoteModal({ lote, onSubmit, onClose }) {
  const [qty, setQty] = useState(1);
  const [motivo, setMotivo] = useState("Danificado");
  const atalhos = [5, 10, 12, 24, 48];
  return (
    <ModalShell title="📦 Adicionar Quebras" onClose={onClose}>
      <div style={{ background: "#F8FAFC", borderColor: BORDER }} className="border rounded-lg p-2.5 text-sm mb-3">
        <div className="font-semibold">{lote.product.name}</div>
        <div style={{ color: MUTED }} className="text-xs">{lote.nome} · Estoque atual: {lote.qty} Unidades</div>
      </div>
      <label className="text-xs" style={{ color: MUTED }}>Quantidade a adicionar</label>
      <div className="flex items-center gap-2 mt-1">
        <button onClick={() => setQty((q) => Math.max(1, Number(q) - 1))} style={{ borderColor: BORDER }} className="border rounded-lg p-2"><Minus size={14} /></button>
        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} className="flex-1 border rounded-lg px-2 py-2 text-center text-sm" style={{ borderColor: BORDER }} />
        <button onClick={() => setQty((q) => Number(q) + 1)} style={{ borderColor: BORDER }} className="border rounded-lg p-2"><Plus size={14} /></button>
      </div>
      <div className="flex gap-1.5 mt-2 flex-wrap">
        {atalhos.map((a) => (
          <button key={a} onClick={() => setQty((q) => Number(q) + a)} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1 text-xs">+{a}</button>
        ))}
      </div>
      <div style={{ background: "#FEE2E2", color: "#991B1B" }} className="rounded-lg p-2.5 text-sm mt-3 flex justify-between">
        <span>Prévia da Quebra</span>
        <span className="font-semibold">Estoque: {lote.qty} → {Math.max(0, lote.qty - (Number(qty) || 0))}</span>
      </div>
      <label className="text-xs mt-3 block" style={{ color: MUTED }}>Motivo</label>
      <select value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1">
        <option>Danificado</option>
        <option>Vencido</option>
        <option>Roubo/Perda</option>
        <option>Erro de registo</option>
        <option>Outro</option>
      </select>
      <button onClick={() => Number(qty) > 0 && onSubmit(Number(qty), motivo)} style={{ background: BRICK, color: "#fff" }} className="w-full rounded-lg py-2.5 text-sm font-semibold mt-3">
        Adicionar Quebras do Lote
      </button>
    </ModalShell>
  );
}

const MOV_INFO = {
  entrada: { label: "Entrada de Stock", color: GREEN, sign: "+" },
  saida: { label: "Saída de Stock (Venda)", color: BRICK, sign: "" },
  quebra: { label: "Quebra", color: "#B45309", sign: "" },
  ajuste: { label: "Ajuste", color: TEAL, sign: "" },
};

function HistoricoLoteModal({ lote, api, onClose }) {
  const [movs, setMovs] = useState(null);
  useEffect(() => {
    let vivo = true;
    api.loteHistorico(lote.loteId).then((m) => vivo && setMovs(m)).catch(() => vivo && setMovs([]));
    return () => { vivo = false; };
  }, [lote.loteId, api]);

  return (
    <ModalShell title={lote.product.name} onClose={onClose}>
      <div style={{ color: MUTED }} className="text-xs -mt-2 mb-2">Lote: {lote.nome}</div>
      <div style={{ background: "#F8FAFC", borderColor: BORDER }} className="border rounded-lg p-2.5 flex justify-between text-sm mb-3">
        <div><div className="text-[11px]" style={{ color: MUTED }}>QTD INICIAL</div><div className="font-semibold">{lote.initialQty || 0}</div></div>
        <div><div className="text-[11px]" style={{ color: MUTED }}>VALIDADE</div><div className="font-semibold">{fmtData(lote.expiry)}</div></div>
        <div className="text-right"><div className="text-[11px]" style={{ color: MUTED }}>SALDO ATUAL</div><div className="font-semibold">{lote.qty}</div></div>
      </div>
      {movs === null && <div className="text-xs py-4 text-center" style={{ color: MUTED }}>A carregar histórico…</div>}
      {movs && movs.length === 0 && <div className="text-xs py-4 text-center" style={{ color: MUTED }}>Sem movimentos registados.</div>}
      <div className="space-y-2">
        {movs && movs.map((m) => {
          const info = MOV_INFO[m.tipo] || { label: m.tipo, color: MUTED, sign: "" };
          return (
            <div key={m.id} className="flex items-start gap-2">
              <div style={{ background: info.color }} className="w-2 h-2 rounded-full mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{info.label}</div>
                <div className="text-[11px]" style={{ color: MUTED }}>
                  {new Date(m.createdAt).toLocaleString("pt-PT")} · {m.employeeName || "Sistema"}{m.descricao ? ` · ${m.descricao}` : ""}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-semibold" style={{ color: info.color }}>{Number(m.qty) > 0 ? "+" : ""}{Number(m.qty)}</div>
                <div className="text-[10px]" style={{ color: MUTED }}>Saldo: {Number(m.saldo)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}

function ProdutoEditModal({ produto, store, onSubmit, onClose, onCreateCategoria }) {
  const [name, setName] = useState(produto.name || "");
  const [category, setCategory] = useState(produto.category || "");
  const [codigo, setCodigo] = useState(produto.codigo || "");
  const [price, setPrice] = useState(String(produto.price ?? ""));
  const [cost, setCost] = useState(String(produto.cost ?? ""));
  const [minStock, setMinStock] = useState(String(produto.minStock ?? ""));
  const categorias = store.categories && store.categories.length ? store.categories : [...new Set(store.products.map((p) => p.category).filter(Boolean))].sort();

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), category, codigo, price: Number(price) || 0, cost: Number(cost) || 0, minStock: Number(minStock) || 0 });
  };

  return (
    <ModalShell title="📦 Editar Produto" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="text-xs" style={{ color: MUTED }}>Nome do produto *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Categoria</label>
            <div className="mt-1">
              <SelectComCriar value={category} onChange={setCategory} options={categorias.map((c) => ({ value: c, label: c }))} onCreate={onCreateCategoria} placeholder="Seleccionar…" createLabel="➕ Nova categoria" />
            </div>
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Código (barras)</label>
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Preço (MT)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Custo (MT)</label>
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Stock mín.</label>
            <input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm mt-1" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} style={{ background: "#475569", color: "#fff" }} className="flex-1 rounded-lg py-2 text-sm font-semibold">Cancelar</button>
          <button onClick={submit} style={{ background: TEAL, color: "#fff" }} className="flex-1 rounded-lg py-2 text-sm font-semibold">Guardar</button>
        </div>
      </div>
    </ModalShell>
  );
}

function TransferModal({ store, filiais, onSubmit, onClose }) {
  const confirmar = useConfirm();
  const simples = store.products.filter((p) => p.tipo === "simples" && !p.variants?.length && !p.batches?.length);
  const [productId, setProductId] = useState("");
  const [toBusinessId, setToBusinessId] = useState(filiais[0]?.id || "");
  const [qty, setQty] = useState("");
  const [nota, setNota] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("enviar"); // enviar | historico

  const prod = simples.find((p) => p.id === productId);
  const maxQty = prod ? prod.stock : 0;
  const valid = productId && toBusinessId && Number(qty) > 0 && Number(qty) <= maxQty;

  const transfers = (store.transfers || []);
  const enviadas = transfers.filter((t) => t.fromBusinessId === store.id);
  const recebidas = transfers.filter((t) => t.toBusinessId === store.id);

  const doTransfer = async () => {
    if (!valid) return;
    const destName = filiais.find((f) => f.id === toBusinessId)?.name || "filial";
    const ok = await confirmar({
      title: "Confirmar transferência",
      message: `Enviar ${qty} × ${prod.name} para ${destName}?`,
      confirmLabel: "Transferir",
    });
    if (!ok) return;
    setSending(true);
    await onSubmit({ productId, toBusinessId, qty: Number(qty), nota });
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: BORDER }}>
          <div className="text-base font-bold">Transferências entre filiais</div>
          <button onClick={onClose} className="p-1"><X size={16} /></button>
        </div>

        <div className="flex border-b" style={{ borderColor: BORDER }}>
          {["enviar", "historico"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 text-xs font-semibold py-2.5 text-center"
              style={{ color: tab === t ? TEAL : MUTED, borderBottom: tab === t ? `2px solid ${TEAL}` : "2px solid transparent" }}>
              {t === "enviar" ? "Enviar stock" : `Histórico (${transfers.length})`}
            </button>
          ))}
        </div>

        {tab === "enviar" ? (
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: MUTED }}>Produto (só simples, sem lotes/variantes)</label>
              <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1">
                <option value="">— Seleccione —</option>
                {simples.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: MUTED }}>Filial de destino</label>
              <select value={toBusinessId} onChange={(e) => setToBusinessId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1">
                {filiais.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: MUTED }}>Quantidade {maxQty > 0 ? `(máx. ${maxQty})` : ""}</label>
              <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} min="1" max={maxQty}
                placeholder="0" style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: MUTED }}>Nota (opcional)</label>
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ex: requisição do Sr. Jorge"
                style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2.5 py-2 text-sm mt-1" />
            </div>
            {Number(qty) > maxQty && maxQty > 0 && (
              <div className="text-xs" style={{ color: BRICK }}>Stock insuficiente (tem {maxQty})</div>
            )}
            <button onClick={doTransfer} disabled={!valid || sending}
              style={{ background: "#7C3AED", color: "#fff" }}
              className="w-full rounded-lg py-2.5 text-sm font-bold disabled:opacity-40">
              {sending ? "A transferir…" : "⇄ Confirmar transferência"}
            </button>
          </div>
        ) : (
          <div className="p-4 max-h-80 overflow-y-auto space-y-2">
            {transfers.length === 0 ? (
              <div className="text-center py-6 text-sm" style={{ color: MUTED }}>Nenhuma transferência registada</div>
            ) : (
              <>
                {recebidas.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-bold uppercase mb-1" style={{ color: GREEN }}>Recebidas</div>
                    {recebidas.map((t) => (
                      <div key={t.id} className="flex items-center justify-between py-1.5 border-b text-xs" style={{ borderColor: BORDER }}>
                        <div>
                          <span className="font-semibold">{t.productName}</span> × {t.qty}
                          <span style={{ color: MUTED }}> de {t.fromName}</span>
                          {t.nota ? <span style={{ color: MUTED }}> — {t.nota}</span> : null}
                        </div>
                        <div style={{ color: MUTED }}>{new Date(t.date).toLocaleDateString("pt-PT")}</div>
                      </div>
                    ))}
                  </div>
                )}
                {enviadas.length > 0 && (
                  <div>
                    <div className="text-xs font-bold uppercase mb-1" style={{ color: "#7C3AED" }}>Enviadas</div>
                    {enviadas.map((t) => (
                      <div key={t.id} className="flex items-center justify-between py-1.5 border-b text-xs" style={{ borderColor: BORDER }}>
                        <div>
                          <span className="font-semibold">{t.productName}</span> × {t.qty}
                          <span style={{ color: MUTED }}> para {t.toName}</span>
                          {t.nota ? <span style={{ color: MUTED }}> — {t.nota}</span> : null}
                        </div>
                        <div style={{ color: MUTED }}>{new Date(t.date).toLocaleDateString("pt-PT")}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BulkImportExport({ products, onImport }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [aberto, setAberto] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const XLSX = await import("xlsx");
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
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
      <button onClick={() => setAberto((a) => !a)} className="text-sm font-semibold flex items-center gap-1">
        {aberto ? "▾" : "▸"} Importar / exportar em massa (Excel)
      </button>
      {aberto && (
        <div className="space-y-2 mt-2">
          <div className="text-xs" style={{ color: MUTED }}>
            Colunas: Nome, Categoria, Unidade, Preço, Custo (por unidade), Stock, Stock Mínimo. O "Custo" é o preço de compra de cada unidade — o sistema calcula o custo total do estoque. Se o produto já existir (mesmo nome), a quantidade é somada; senão, cria um produto novo.
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={downloadTemplate} style={{ borderColor: BORDER, color: TEAL }} className="border rounded-lg px-3 py-1.5 text-xs font-medium">Descarregar modelo</button>
            <button onClick={exportCurrent} style={{ borderColor: BORDER, color: TEAL }} className="border rounded-lg px-3 py-1.5 text-xs font-medium">Exportar estoque actual</button>
            <label style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer">
              Escolher ficheiro Excel
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            </label>
            {fileName && <span style={{ color: MUTED }} className="text-xs self-center">{fileName}</span>}
          </div>
          {preview && (
            <div style={{ borderColor: BORDER }} className="border rounded-lg p-2 mt-2">
              {preview.length === 0 ? (
                <div className="text-xs" style={{ color: BRICK }}>Não foi possível ler linhas válidas deste ficheiro.</div>
              ) : (
                <>
                  <div className="text-xs mb-1.5" style={{ color: MUTED }}>{preview.length} linha(s):</div>
                  <div className="max-h-32 overflow-auto text-xs space-y-0.5 mb-2">
                    {preview.slice(0, 15).map((r, i) => (
                      <div key={i} style={{ color: INK }}>{r.name} — {r.category || "Geral"} — {fmtMT(Number(r.price) || 0)} — stock: {r.stock || 0}</div>
                    ))}
                    {preview.length > 15 && <div style={{ color: MUTED }}>… e mais {preview.length - 15}</div>}
                  </div>
                  <button onClick={confirmImport} style={{ background: GREEN, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-xs font-medium">Confirmar importação</button>
                </>
              )}
            </div>
          )}
        </div>
      )}
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
    <ModalShell title="Saída de estoque" onClose={onClose}>
      <div className="space-y-2">
        <select value={productId} onChange={(e) => { setProductId(e.target.value); setVariantId(""); }} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm">
          <option value="">Produto</option>
          {store.products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {product?.variants && (
          <select value={variantId} onChange={(e) => setVariantId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            <option value="">Variante</option>
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>{v.label}</option>
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
        <button onClick={submit} style={{ background: BRICK, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm">Registar</button>
      </div>
    </ModalShell>
  );
}
