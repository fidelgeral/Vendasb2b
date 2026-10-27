import { useEffect, useState } from "react";
import { CARD, BORDER, MUTED, TEAL, INK, BRICK, GREEN, GOLD, SOFTGOLD } from "../lib/theme.js";
import { Banknote, Package, Settings, Users } from "../lib/icons.jsx";
import BillingPanel from "../components/BillingPanel.jsx";
import { fmtMT } from "../lib/utils.js";
import { code128SVG } from "../lib/barcode.js";

export default function OutrosServicosTab({ store, setStore, api, showToast }) {
  const [cat, setCat] = useState("assinatura");

  const categories = [
    { id: "assinatura", label: "A minha assinatura", icon: Banknote },
    { id: "etiquetas", label: "Imprimir etiquetas", icon: Package },
    { id: "precos", label: "Imprimir preços", icon: Package },
    { id: "rh", label: "Recursos Humanos", icon: Users },
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
      {cat === "rh" && <RecursosHumanosSection store={store} api={api} showToast={showToast} />}
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
    const html = produtos.map((p) => {
      const bc = p.codigo ? code128SVG(p.codigo, { height: 50, moduleWidth: 1.5, showText: true, textSize: 11 }) : "";
      return `
      <div style="border:1px dashed #999;padding:10px;margin:4px;display:inline-block;font-family:monospace;text-align:center;min-width:220px">
        <div style="font-weight:bold;font-size:13px;margin-bottom:6px">${p.name}</div>
        ${bc ? `<div style="margin:4px 0">${bc}</div>` : '<div style="font-size:11px;color:#999">Sem código de barras</div>'}
      </div>`;
    }).join("");
    win.document.write(`<html><body style="padding:10px">${html}<script>window.print();<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-3">
      <div className="text-sm font-semibold" style={{ color: INK }}>Imprimir etiquetas de código de barras</div>
      <p className="text-xs" style={{ color: MUTED }}>As etiquetas incluem códigos de barras escaneáveis (Code128).</p>
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
    const html = produtos.map((p) => {
      const bc = p.codigo ? code128SVG(p.codigo, { height: 40, moduleWidth: 1.2, showText: true, textSize: 10 }) : "";
      return `
      <div style="border:1px solid #ccc;padding:12px;margin:4px;display:inline-block;text-align:center;min-width:200px;font-family:system-ui">
        <div style="font-size:12px;color:#666">${p.name}</div>
        <div style="font-size:28px;font-weight:bold;color:#000;margin:4px 0">${Number(p.price).toFixed(2)} MT</div>
        ${bc ? `<div style="margin:4px 0">${bc}</div>` : ""}
      </div>`;
    }).join("");
    win.document.write(`<html><body style="padding:10px">${html}<script>window.print();<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-3">
      <div className="text-sm font-semibold" style={{ color: INK }}>Imprimir preços de produtos</div>
      <p className="text-xs" style={{ color: MUTED }}>Cartões de preço com código de barras escaneável. Ideal para etiquetadoras e gôndolas.</p>
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

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function RecursosHumanosSection({ store, api, showToast }) {
  const now = new Date();
  const [ano, setAno] = useState(now.getFullYear());
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: "", salarioBase: "", bonus: "", descontos: "", notas: "" });

  const employees = (store.employees || []).filter((e) => e.active !== false);

  const load = async () => {
    setLoading(true);
    try { setRows(await api.getPayroll(ano, mes)); } catch { setRows([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [ano, mes]);

  const totalSalarios = rows.reduce((s, r) => s + Number(r.total), 0);
  const totalPago = rows.filter((r) => r.pago).reduce((s, r) => s + Number(r.total), 0);
  const totalPendente = totalSalarios - totalPago;

  const submit = async () => {
    const emp = employees.find((e) => e.id === form.employeeId);
    if (!emp) return;
    const base = Number(form.salarioBase);
    if (!(base > 0)) return;
    try {
      const updated = await api.createPayroll({
        employeeId: emp.id,
        employeeName: emp.name,
        mes, ano,
        salarioBase: base,
        bonus: Number(form.bonus) || 0,
        descontos: Number(form.descontos) || 0,
        notas: form.notas,
      });
      setRows(updated);
      setForm({ employeeId: "", salarioBase: "", bonus: "", descontos: "", notas: "" });
      setShowForm(false);
      showToast?.("Salário processado com sucesso");
    } catch (e) {
      showToast?.(e.message || "Erro ao processar salário");
    }
  };

  const marcarPago = async (id) => {
    try {
      await api.markPayrollPaid(id);
      setRows((r) => r.map((x) => x.id === id ? { ...x, pago: true, pago_em: new Date().toISOString() } : x));
      showToast?.("Marcado como pago");
    } catch { showToast?.("Erro"); }
  };

  const apagar = async (id) => {
    try {
      await api.deletePayroll(id);
      setRows((r) => r.filter((x) => x.id !== id));
      showToast?.("Registo apagado");
    } catch { showToast?.("Erro"); }
  };

  const imprimirFolha = () => {
    if (!rows.length) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const trs = rows.map((r) => `
      <tr>
        <td style="border:1px solid #ddd;padding:6px">${r.employee_name}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:right">${Number(r.salario_base).toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:right">${Number(r.bonus).toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:right">${Number(r.descontos).toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:right;font-weight:bold">${Number(r.total).toFixed(2)}</td>
        <td style="border:1px solid #ddd;padding:6px;text-align:center">${r.pago ? "Pago" : "Pendente"}</td>
      </tr>`).join("");
    win.document.write(`<html><body style="font-family:system-ui;max-width:800px;margin:0 auto;padding:20px">
      <h2>Folha de Salários — ${MESES[mes - 1]} ${ano}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f1f5f9">
          <th style="border:1px solid #ddd;padding:6px;text-align:left">Funcionário</th>
          <th style="border:1px solid #ddd;padding:6px;text-align:right">Base</th>
          <th style="border:1px solid #ddd;padding:6px;text-align:right">Bónus</th>
          <th style="border:1px solid #ddd;padding:6px;text-align:right">Descontos</th>
          <th style="border:1px solid #ddd;padding:6px;text-align:right">Total</th>
          <th style="border:1px solid #ddd;padding:6px;text-align:center">Estado</th>
        </tr></thead>
        <tbody>${trs}</tbody>
        <tfoot><tr style="background:#f1f5f9;font-weight:bold">
          <td style="border:1px solid #ddd;padding:6px">TOTAL</td>
          <td style="border:1px solid #ddd;padding:6px;text-align:right">${rows.reduce((s, r) => s + Number(r.salario_base), 0).toFixed(2)}</td>
          <td style="border:1px solid #ddd;padding:6px;text-align:right">${rows.reduce((s, r) => s + Number(r.bonus), 0).toFixed(2)}</td>
          <td style="border:1px solid #ddd;padding:6px;text-align:right">${rows.reduce((s, r) => s + Number(r.descontos), 0).toFixed(2)}</td>
          <td style="border:1px solid #ddd;padding:6px;text-align:right">${totalSalarios.toFixed(2)} MT</td>
          <td style="border:1px solid #ddd;padding:6px;text-align:center">${rows.filter((r) => r.pago).length}/${rows.length} pagos</td>
        </tr></tfoot>
      </table>
      <p style="margin-top:30px;border-top:1px solid #ddd;padding-top:10px">
        <strong>Aprovado por:</strong> __________________________ &nbsp;&nbsp;&nbsp; <strong>Data:</strong> __/__/____
      </p>
    </body></html>`);
    win.document.write(`<script>window.print();<\/script>`);
    win.document.close();
  };

  return (
    <div className="space-y-3">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-sm font-semibold" style={{ color: INK }}>Processamento de Salários</div>
          <div className="flex items-center gap-2">
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))} style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1 text-xs">
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} style={{ borderColor: BORDER, width: 80 }} className="border rounded-lg px-2 py-1 text-xs" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div style={{ background: SOFTGOLD, borderColor: GOLD }} className="border rounded-lg p-2 text-center">
            <div className="text-xs" style={{ color: MUTED }}>Total salários</div>
            <div className="text-sm font-bold">{fmtMT(totalSalarios)}</div>
          </div>
          <div style={{ background: "#D1FAE5", borderColor: GREEN }} className="border rounded-lg p-2 text-center">
            <div className="text-xs" style={{ color: MUTED }}>Pago</div>
            <div className="text-sm font-bold" style={{ color: GREEN }}>{fmtMT(totalPago)}</div>
          </div>
          <div style={{ background: "#FEE2E2", borderColor: BRICK }} className="border rounded-lg p-2 text-center">
            <div className="text-xs" style={{ color: MUTED }}>Pendente</div>
            <div className="text-sm font-bold" style={{ color: BRICK }}>{fmtMT(totalPendente)}</div>
          </div>
        </div>

        {loading ? (
          <div className="text-xs py-4 text-center" style={{ color: MUTED }}>A carregar…</div>
        ) : rows.length === 0 ? (
          <div className="text-xs py-4 text-center" style={{ color: MUTED }}>
            Nenhum salário processado para {MESES[mes - 1]} {ano}.
          </div>
        ) : (
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div key={r.id} style={{ borderColor: BORDER }} className="border rounded-lg p-2.5 flex items-center justify-between gap-2 text-sm">
                <div>
                  <div className="font-medium" style={{ color: INK }}>{r.employee_name}</div>
                  <div className="text-xs" style={{ color: MUTED }}>
                    Base: {fmtMT(r.salario_base)}
                    {Number(r.bonus) > 0 && ` + Bónus: ${fmtMT(r.bonus)}`}
                    {Number(r.descontos) > 0 && ` − Desc: ${fmtMT(r.descontos)}`}
                    {r.notas && ` · ${r.notas}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold">{fmtMT(r.total)}</span>
                  {r.pago ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: GREEN }}>Pago</span>
                  ) : (
                    <button onClick={() => marcarPago(r.id)} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: SOFTGOLD, color: GOLD }}>
                      Marcar pago
                    </button>
                  )}
                  <button onClick={() => apagar(r.id)} className="text-xs" style={{ color: BRICK }}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button onClick={() => setShowForm(!showForm)} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm font-semibold">
            {showForm ? "Cancelar" : "+ Processar salário"}
          </button>
          {rows.length > 0 && (
            <button onClick={imprimirFolha} style={{ borderColor: BORDER }} className="border px-3 py-1.5 rounded-lg text-sm font-semibold">
              Imprimir folha
            </button>
          )}
        </div>

        {showForm && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg" style={{ background: SOFTGOLD }}>
            <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm sm:col-span-2">
              <option value="">Seleccionar funcionário</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
            </select>
            <input type="number" value={form.salarioBase} onChange={(e) => setForm({ ...form, salarioBase: e.target.value })}
              placeholder="Salário base (MT) *" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
            <input type="number" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })}
              placeholder="Bónus (MT)" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
            <input type="number" value={form.descontos} onChange={(e) => setForm({ ...form, descontos: e.target.value })}
              placeholder="Descontos (MT)" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
            <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })}
              placeholder="Observações" style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
            <button onClick={submit} style={{ background: TEAL, color: "#fff" }} className="sm:col-span-2 px-4 py-2 rounded-lg text-sm font-semibold">
              Processar salário
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function RequisicoesSection({ store, setStore, api, showToast }) {
  const [reqs, setReqs] = useState([]);
  const [form, setForm] = useState({ produto: "", quantidade: "", destino: "", notas: "" });

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
