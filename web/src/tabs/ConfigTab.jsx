import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL, BRICK } from "../lib/theme.js";
import { ALL_MODULES } from "../lib/utils.js";
import { processarLogo } from "../lib/logoProcess.js";
import { useConfirm } from "../components/ConfirmProvider.jsx";
import { Settings, Percent, Wallet, Users, Lock, Gift, Palette } from "../lib/icons.jsx";

export default function ConfigTab({ store, setStore, api }) {
  const [cat, setCat] = useState("impressao");
  const categories = [
    { id: "impressao", label: "Impressão e Visor", icon: Settings },
    { id: "iva", label: "IVA", icon: Percent },
    { id: "contas", label: "Contas", icon: Wallet },
    { id: "empresa", label: "Empresa", icon: Users },
    { id: "fidelidade", label: "Fidelidade", icon: Gift },
    { id: "tema", label: "Personalização", icon: Palette },
    { id: "seguranca", label: "Segurança e Backups", icon: Lock },
  ];
  return (
    <div>
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {categories.map((c) => {
          const Icon = c.icon;
          const active = cat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              style={{ background: active ? TEAL : CARD, color: active ? "#fff" : "#0F172A", borderColor: BORDER }}
              className="border rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
            >
              <Icon size={13} />
              {c.label}
            </button>
          );
        })}
      </div>
      <AtendimentoLink store={store} />
      {cat === "impressao" && <ImpressaoConfig store={store} setStore={setStore} api={api} />}
      {cat === "iva" && <IvaConfig store={store} setStore={setStore} api={api} />}
      {cat === "contas" && <ContasConfig store={store} setStore={setStore} api={api} />}
      {cat === "empresa" && <EmpresaConfig store={store} setStore={setStore} api={api} />}
      {cat === "fidelidade" && <FidelidadeConfig store={store} setStore={setStore} api={api} />}
      {cat === "tema" && <TemaConfig store={store} setStore={setStore} api={api} />}
      {cat === "seguranca" && <SegurancaConfig store={store} api={api} />}
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 mt-4">
        <div className="text-sm font-semibold mb-2">Áreas activas do negócio</div>
        <ModulosConfig store={store} setStore={setStore} api={api} />
      </div>
    </div>
  );
}

function AtendimentoLink({ store }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/loja/${store.slug}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // ignora
    }
  };
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 mb-4">
      <div className="text-sm font-semibold mb-1">Assistente de atendimento para os seus clientes</div>
      <div className="text-xs mb-2" style={{ color: MUTED }}>
        Partilhe este link — os seus clientes podem tirar dúvidas sobre produtos, preços e contacto, respondidas automaticamente por IA.
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <code style={{ background: "#F1F5F9", borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-xs break-all">
          {link}
        </code>
        <button onClick={copy} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-3 py-1.5 text-xs font-medium">
          {copied ? "Copiado!" : "Copiar link"}
        </button>
      </div>
    </div>
  );
}

function ImpressaoConfig({ store, setStore, api }) {
  const ds = store.config.docSeries || { prefixo: "FT", proximo: 1 };
  const [prefixo, setPrefixo] = useState(ds.prefixo || "FT");
  const [proximo, setProximo] = useState(ds.proximo || 1);
  const [papel, setPapel] = useState(store.config.impressao.papel);
  const [visorCliente, setVisorCliente] = useState(store.config.impressao.visorCliente);
  const [imprimirAoFinalizar, setImprimirAoFinalizar] = useState(!!store.config.impressao.imprimirAoFinalizar);
  const [scannerUsb, setScannerUsb] = useState(store.config.impressao.scannerUsb !== false);
  const [mensagem, setMensagem] = useState(store.config.receiptMessage);
  const confirmar = useConfirm();
  const save = async () => {
    if (!(await confirmar({ title: "Guardar configurações de impressão?", message: "Vai guardar as definições de impressão, visor e série de documentos.", confirmLabel: "Guardar" }))) return;
    setStore(
      await api.patchConfig({
        receiptMessage: mensagem,
        impressao: { ...store.config.impressao, papel, visorCliente, imprimirAoFinalizar, scannerUsb },
        docSeries: { prefixo: (prefixo || "FT").toUpperCase(), ano: new Date().getFullYear(), proximo: Number(proximo) || 1 },
      })
    );
  };
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">Impressão e visor</div>
      <div style={{ borderColor: BORDER, background: "#F8FAFC" }} className="border rounded-lg p-2.5 space-y-2">
        <label className="text-xs font-semibold" style={{ color: "#0F172A" }}>
          Impressora térmica — tamanho do papel
        </label>
        <select value={papel} onChange={(e) => setPapel(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-2 text-sm font-medium">
          <option value="58mm">58mm (impressora pequena)</option>
          <option value="80mm">80mm (impressora grande)</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={imprimirAoFinalizar} onChange={(e) => setImprimirAoFinalizar(e.target.checked)} /> Imprimir a factura automaticamente ao finalizar a venda
        </label>
        <div className="text-[11px]" style={{ color: MUTED }}>
          O recibo é impresso no tamanho escolhido aqui. As impressoras térmicas comuns são de <b>58mm</b> (mais pequena) ou <b>80mm</b> (mais larga).
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={visorCliente} onChange={(e) => setVisorCliente(e.target.checked)} /> Tenho um visor voltado para o cliente
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={scannerUsb} onChange={(e) => setScannerUsb(e.target.checked)} /> Usar leitor de código de barras USB (máquina de scanner tipo supermercado)
      </label>
      <div className="text-xs" style={{ color: MUTED }}>
        A impressão usa o diálogo do seu aparelho — as impressoras térmicas de recibos ligadas por USB ou Bluetooth (com o controlador instalado) aparecem nessa lista.
      </div>
      <label className="text-xs" style={{ color: MUTED }}>
        Série de documentos (facturas/recibos)
      </label>
      <div className="flex gap-2">
        <input value={prefixo} onChange={(e) => setPrefixo(e.target.value.toUpperCase())} placeholder="FT" style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm w-20" />
        <input type="number" value={proximo} onChange={(e) => setProximo(e.target.value)} placeholder="1" style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1.5 text-sm flex-1" />
      </div>
      <div className="text-xs" style={{ color: MUTED }}>
        Próximo documento: {(prefixo || "FT") + new Date().getFullYear() + "/" + String(Number(proximo) || 1).padStart(4, "0")}
      </div>
      <label className="text-xs" style={{ color: MUTED }}>
        Mensagem no recibo
      </label>
      <input value={mensagem} onChange={(e) => setMensagem(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm">
        Guardar
      </button>
    </div>
  );
}

function IvaConfig({ store, setStore, api }) {
  const [precosIncluemIva, setPrecosIncluemIva] = useState(store.config.iva.precosIncluemIva);
  const [isento, setIsento] = useState(store.config.iva.isento);
  const [taxas, setTaxas] = useState(Array.isArray(store.config.iva.taxas) ? [...store.config.iva.taxas] : []);
  const [padrao, setPadrao] = useState(Number(store.config.iva.taxa) || 0);
  const [nova, setNova] = useState("");
  const confirmar = useConfirm();

  const addTaxa = () => {
    const n = Number(nova);
    if (isNaN(n) || n < 0) return;
    if (!taxas.includes(n)) setTaxas((t) => [...t, n].sort((a, b) => a - b));
    setNova("");
  };
  const removeTaxa = (n) => {
    const next = taxas.filter((t) => t !== n);
    setTaxas(next);
    if (padrao === n && next.length) setPadrao(next[0]);
  };

  const save = async () => {
    if (!(await confirmar({ title: "Guardar configuração de IVA?", message: "Vai guardar as taxas de IVA e a taxa padrão.", confirmLabel: "Guardar" }))) return;
    const lista = taxas;
    const def = lista.includes(padrao) ? padrao : lista[0] || 0;
    setStore(await api.patchConfig({ iva: { taxa: Number(def) || 0, taxas: lista, precosIncluemIva, isento } }));
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">IVA</div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isento} onChange={(e) => setIsento(e.target.checked)} /> Negócio isento de IVA
      </label>
      {!isento && (
        <>
          <label className="text-xs" style={{ color: MUTED }}>
            Taxas de IVA que quer usar nas vendas (%)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {taxas.map((t) => (
              <span key={t} style={{ borderColor: BORDER, background: "#F1F5F9" }} className="border rounded-full pl-2.5 pr-1.5 py-1 text-xs flex items-center gap-1.5">
                {t}%
                <button onClick={() => removeTaxa(t)} title="Remover" style={{ color: "#B91C1C" }} className="font-bold leading-none px-1">
                  ×
                </button>
              </span>
            ))}
            {taxas.length === 0 && <span className="text-xs" style={{ color: MUTED }}>Nenhuma taxa — adicione pelo menos uma.</span>}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={nova}
              onChange={(e) => setNova(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTaxa()}
              placeholder="Ex.: 16"
              style={{ borderColor: BORDER }}
              className="border rounded-lg px-2 py-1.5 text-sm w-28"
            />
            <button onClick={addTaxa} style={{ borderColor: BORDER, color: TEAL }} className="border rounded-lg px-3 py-1.5 text-sm">
              Adicionar taxa
            </button>
          </div>
          <label className="text-xs" style={{ color: MUTED }}>
            Taxa padrão (usada por defeito em cada venda)
          </label>
          <select value={padrao} onChange={(e) => setPadrao(Number(e.target.value))} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm">
            {taxas.map((t) => (
              <option key={t} value={t}>{t}%</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={precosIncluemIva} onChange={(e) => setPrecosIncluemIva(e.target.checked)} /> Os preços já incluem IVA
          </label>
        </>
      )}
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm">
        Guardar
      </button>
      <div className="text-xs" style={{ color: MUTED }}>
        No ecrã de Vender só aparecem as taxas que configurar aqui. Acredito que a taxa padrão em Moçambique tem sido 16%, mas confirme sempre o valor actual junto da Autoridade Tributária — pode mudar.
      </div>
    </div>
  );
}

function ContasConfig({ store, setStore, api }) {
  const [contas, setContas] = useState(store.config.contas);
  const confirmar = useConfirm();
  const update = (id, field, value) => setContas((c) => ({ ...c, [id]: { ...c[id], [field]: value } }));
  const save = async () => {
    if (!(await confirmar({ title: "Guardar contas de pagamento?", message: "Vai guardar as formas de pagamento activas.", confirmLabel: "Guardar" }))) return;
    setStore(await api.patchConfig({ contas }));
  };
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-3">
      <div className="text-sm font-semibold">Contas de pagamento</div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={contas.dinheiro.activo} onChange={(e) => update("dinheiro", "activo", e.target.checked)} /> Dinheiro
      </label>
      <div style={{ borderColor: BORDER }} className="border rounded-lg p-2 space-y-1.5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={contas.mpesa.activo} onChange={(e) => update("mpesa", "activo", e.target.checked)} /> M-Pesa
        </label>
        {contas.mpesa.activo && (
          <>
            <input placeholder="Número/agente M-Pesa" value={contas.mpesa.numero} onChange={(e) => update("mpesa", "numero", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1 text-xs" />
            <input placeholder="Titular da conta" value={contas.mpesa.titular} onChange={(e) => update("mpesa", "titular", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1 text-xs" />
          </>
        )}
      </div>
      <div style={{ borderColor: BORDER }} className="border rounded-lg p-2 space-y-1.5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={contas.emola.activo} onChange={(e) => update("emola", "activo", e.target.checked)} /> e-Mola
        </label>
        {contas.emola.activo && (
          <>
            <input placeholder="Número/agente e-Mola" value={contas.emola.numero} onChange={(e) => update("emola", "numero", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1 text-xs" />
            <input placeholder="Titular da conta" value={contas.emola.titular} onChange={(e) => update("emola", "titular", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1 text-xs" />
          </>
        )}
      </div>
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm">
        Guardar
      </button>
      <div className="text-xs" style={{ color: MUTED }}>
        Desligar uma conta aqui remove-a dos botões de pagamento no ecrã de Vender.
      </div>
      <CustomPaymentAccounts store={store} setStore={setStore} api={api} />
    </div>
  );
}

function CustomPaymentAccounts({ store, setStore, api }) {
  const [accounts, setAccounts] = useState(store.paymentAccounts || []);
  const [newName, setNewName] = useState("");
  const [newNumero, setNewNumero] = useState("");
  const confirmar = useConfirm();

  const criar = async () => {
    if (!newName.trim()) return;
    try {
      const created = await api.createPaymentAccount({ name: newName.trim(), tipo: "personalizado", numero: newNumero.trim(), activo: true });
      setAccounts((a) => [...a, created]);
      setNewName(""); setNewNumero("");
      setStore(await api.getStore());
    } catch (e) { alert(e.message); }
  };

  const toggleActivo = async (acc) => {
    try {
      await api.updatePaymentAccount(acc.id, { activo: !acc.activo });
      setAccounts((a) => a.map((x) => x.id === acc.id ? { ...x, activo: !x.activo } : x));
      setStore(await api.getStore());
    } catch (e) { alert(e.message); }
  };

  const apagar = async (acc) => {
    if (!(await confirmar({ title: "Apagar conta?", message: `Remover "${acc.name}" dos métodos de pagamento?`, confirmLabel: "Apagar" }))) return;
    try {
      await api.deletePaymentAccount(acc.id);
      setAccounts((a) => a.filter((x) => x.id !== acc.id));
      setStore(await api.getStore());
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
      <div className="text-sm font-semibold mb-2">Contas de pagamento personalizadas</div>
      <p className="text-xs mb-2" style={{ color: MUTED }}>Crie métodos de pagamento adicionais (ex: Cartão Visa, Transferência bancária, Conta Corrente).</p>
      {accounts.map((acc) => (
        <div key={acc.id} className="flex items-center justify-between gap-2 py-1.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={acc.activo} onChange={() => toggleActivo(acc)} />
            {acc.name} {acc.numero && <span className="text-xs" style={{ color: MUTED }}>({acc.numero})</span>}
          </label>
          <button onClick={() => apagar(acc)} style={{ color: BRICK }} className="text-xs">Apagar</button>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome (ex: Cartão Visa)" style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1 text-xs flex-1" />
        <input value={newNumero} onChange={(e) => setNewNumero(e.target.value)} placeholder="Número (opcional)" style={{ borderColor: BORDER }} className="border rounded-lg px-2 py-1 text-xs flex-1" />
        <button onClick={criar} style={{ background: TEAL, color: "#fff" }} className="rounded-lg px-3 py-1 text-xs font-semibold">Criar</button>
      </div>
    </div>
  );
}

function EmpresaConfig({ store, setStore, api }) {
  const [businessName, setBusinessName] = useState(store.config.businessName);
  const [empresa, setEmpresa] = useState(store.config.empresa);
  const [logoBusy, setLogoBusy] = useState(false);
  const confirmar = useConfirm();
  const update = (field, value) => setEmpresa((e) => ({ ...e, [field]: value }));
  const save = async () => {
    if (!(await confirmar({ title: "Guardar dados da empresa?", message: "Vai guardar o nome, logótipo e dados fiscais da empresa.", confirmLabel: "Guardar" }))) return;
    setStore(await api.patchConfig({ businessName, empresa }));
  };

  const onLogoFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setLogoBusy(true);
    try {
      const dataUrl = await processarLogo(file);
      update("logo", dataUrl);
    } catch (err) {
      alert("Não foi possível processar o logótipo: " + (err.message || err));
    } finally {
      setLogoBusy(false);
    }
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">Dados da empresa</div>
      <div>
        <label className="text-xs" style={{ color: MUTED }}>Logótipo (aparece nos recibos e cotações)</label>
        <div className="flex items-center gap-3 mt-1">
          <div style={{ borderColor: BORDER, background: "#fff" }} className="border rounded-lg flex items-center justify-center" >
            {empresa.logo ? (
              <img src={empresa.logo} alt="Logótipo" style={{ maxHeight: 64, maxWidth: 140, padding: 6 }} className="block object-contain" />
            ) : (
              <span className="text-xs px-6 py-6" style={{ color: MUTED }}>Sem logótipo</span>
            )}
          </div>
          <div className="space-y-1.5">
            <label style={{ borderColor: TEAL, color: TEAL }} className="border rounded-lg px-3 py-1.5 text-sm cursor-pointer inline-block">
              {logoBusy ? "A processar…" : empresa.logo ? "Mudar logótipo" : "Carregar logótipo"}
              <input type="file" accept="image/*" onChange={onLogoFile} className="hidden" disabled={logoBusy} />
            </label>
            {empresa.logo && (
              <button onClick={() => update("logo", "")} style={{ color: BRICK }} className="block text-xs">
                Remover logótipo
              </button>
            )}
          </div>
        </div>
        <div className="text-xs mt-1" style={{ color: MUTED }}>
          O sistema escurece e reforça o contraste do logótipo para ficar bem visível na impressão (sobretudo em impressoras térmicas).
        </div>
      </div>
      <input placeholder="Nome do negócio (mostrado no sistema)" value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
      <input placeholder="Nome legal/completo" value={empresa.nome} onChange={(e) => update("nome", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
      <input placeholder="NUIT" value={empresa.nuit} onChange={(e) => update("nuit", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input placeholder="Endereço (rua, nº)" value={empresa.endereco} onChange={(e) => update("endereco", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm sm:col-span-2" />
        <input placeholder="Bairro" value={empresa.bairro || ""} onChange={(e) => update("bairro", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        <input placeholder="Cidade" value={empresa.cidade} onChange={(e) => update("cidade", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        <select value={empresa.provincia || ""} onChange={(e) => update("provincia", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm">
          <option value="">Província…</option>
          {["Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input placeholder="Telefone principal" value={empresa.contacto} onChange={(e) => update("contacto", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        <input placeholder="Telefone alternativo" value={empresa.contacto2 || ""} onChange={(e) => update("contacto2", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        <input placeholder="Email" value={empresa.email} onChange={(e) => update("email", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        <input placeholder="Nº de Alvará / Licença" value={empresa.alvara || ""} onChange={(e) => update("alvara", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
        <input placeholder="Ramo de actividade (CAE)" value={empresa.actividade || ""} onChange={(e) => update("actividade", e.target.value)} style={{ borderColor: BORDER }} className="border rounded-lg px-2.5 py-2 text-sm" />
      </div>
      <select value={empresa.regime} onChange={(e) => update("regime", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm">
        <option>Geral</option>
        <option>Simplificado (ISPC)</option>
      </select>
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm">
        Guardar
      </button>
    </div>
  );
}

function FidelidadeConfig({ store, setStore, api }) {
  const loyalty = store.loyalty || { enabled: false, pointsPerMt: 1, mtPerPoint: 0.1 };
  const [enabled, setEnabled] = useState(loyalty.enabled);
  const [pointsPerMt, setPointsPerMt] = useState(loyalty.pointsPerMt);
  const [mtPerPoint, setMtPerPoint] = useState(loyalty.mtPerPoint);
  const confirmar = useConfirm();
  const save = async () => {
    if (!(await confirmar({ title: "Guardar configuração de fidelidade?", message: "Vai activar ou desactivar o programa de pontos.", confirmLabel: "Guardar" }))) return;
    setStore(await api.patchLoyalty({ enabled, pointsPerMt: Number(pointsPerMt) || 1, mtPerPoint: Number(mtPerPoint) || 0.1 }));
  };
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-3">
      <div className="text-sm font-semibold">Programa de fidelidade</div>
      <div className="text-xs" style={{ color: MUTED }}>
        Active para que os clientes acumulem pontos a cada compra. Os pontos podem ser usados como desconto em compras futuras.
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Programa de fidelidade activo
      </label>
      {enabled && (
        <>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Pontos ganhos por cada MT gasto</label>
            <input type="number" value={pointsPerMt} onChange={(e) => setPointsPerMt(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Valor em MT de cada ponto ao resgatar</label>
            <input type="number" step="0.01" value={mtPerPoint} onChange={(e) => setMtPerPoint(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded-lg px-2 py-1.5 text-sm" />
          </div>
          <div className="text-xs p-2 rounded-lg" style={{ background: "#F0FDF4", color: "#166534" }}>
            Exemplo: cliente gasta 1000 MT → ganha {Math.floor(1000 * (Number(pointsPerMt) || 1))} pontos → vale {(Math.floor(1000 * (Number(pointsPerMt) || 1)) * (Number(mtPerPoint) || 0.1)).toFixed(2)} MT de desconto.
          </div>
        </>
      )}
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm">Guardar</button>
    </div>
  );
}

function TemaConfig({ store, setStore, api }) {
  const [color, setColor] = useState(store.themeColor || "#2563eb");
  const confirmar = useConfirm();
  const COLORS = ["#2563eb", "#1f8e8e", "#7c3aed", "#dc2626", "#059669", "#d97706", "#0f172a", "#ec4899"];
  const save = async () => {
    if (!(await confirmar({ title: "Guardar personalização?", message: "Vai alterar a cor do tema do sistema.", confirmLabel: "Guardar" }))) return;
    setStore(await api.patchTheme({ themeColor: color }));
  };
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-3">
      <div className="text-sm font-semibold">Personalização visual</div>
      <div className="text-xs" style={{ color: MUTED }}>Escolha a cor principal do seu sistema. Esta cor será usada nos botões e destaques.</div>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((c) => (
          <button key={c} onClick={() => setColor(c)} style={{ background: c, outline: color === c ? "3px solid " + c : "none", outlineOffset: 2 }} className="w-8 h-8 rounded-full" />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs" style={{ color: MUTED }}>Cor personalizada:</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
        <span className="text-xs font-mono">{color}</span>
      </div>
      <div className="h-8 rounded-lg" style={{ background: color }} />
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm">Guardar</button>
    </div>
  );
}

// Segurança: a cópia de segurança automática/manual agora é feita pela própria
// base de dados (Neon) — aqui fica apenas uma exportação de leitura, útil como
// cópia extra do próprio dono.
function SegurancaConfig({ store, api }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const downloadBackup = async () => {
    setLoading(true);
    setMsg("");
    try {
      const data = await api.downloadBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${store.slug || store.id}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Backup descarregado com sucesso.");
    } catch (e) {
      setMsg("Erro ao gerar backup: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
        <div className="text-sm font-semibold">Cópia de segurança (Backup)</div>
        <div className="text-xs" style={{ color: MUTED }}>
          Os seus dados já ficam guardados de forma segura na base de dados (Neon). Esta exportação é uma cópia extra em ficheiro JSON que pode guardar no seu computador.
        </div>
        <button onClick={downloadBackup} disabled={loading} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">
          {loading ? "A gerar..." : "Descarregar backup"}
        </button>
        {msg && (
          <div className="text-xs" style={{ color: msg.includes("Erro") ? BRICK : MUTED }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}

function ModulosConfig({ store, setStore, api }) {
  const toggleModule = async (id) => setStore(await api.patchConfig({ modules: { ...store.config.modules, [id]: !store.config.modules[id] } }));
  return (
    <div className="space-y-1.5">
      {ALL_MODULES.map((m) => (
        <label key={m.id} className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!store.config.modules[m.id]} onChange={() => toggleModule(m.id)} />
          {m.label}
        </label>
      ))}
    </div>
  );
}
