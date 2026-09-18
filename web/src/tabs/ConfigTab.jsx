import { useState } from "react";
import { CARD, BORDER, MUTED, TEAL } from "../lib/theme.js";
import { ALL_MODULES } from "../lib/utils.js";
import { Settings, Percent, Wallet, Users, Lock } from "../lib/icons.jsx";

export default function ConfigTab({ store, setStore, api }) {
  const [cat, setCat] = useState("impressao");
  const categories = [
    { id: "impressao", label: "Impressão e Visor", icon: Settings },
    { id: "iva", label: "IVA", icon: Percent },
    { id: "contas", label: "Contas", icon: Wallet },
    { id: "empresa", label: "Empresa", icon: Users },
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
              style={{ background: active ? TEAL : CARD, color: active ? "#fff" : "#16241F", borderColor: BORDER }}
              className="border rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
            >
              <Icon size={13} />
              {c.label}
            </button>
          );
        })}
      </div>
      {cat === "impressao" && <ImpressaoConfig store={store} setStore={setStore} api={api} />}
      {cat === "iva" && <IvaConfig store={store} setStore={setStore} api={api} />}
      {cat === "contas" && <ContasConfig store={store} setStore={setStore} api={api} />}
      {cat === "empresa" && <EmpresaConfig store={store} setStore={setStore} api={api} />}
      {cat === "seguranca" && <SegurancaConfig store={store} />}
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 mt-4">
        <div className="text-sm font-semibold mb-2">Áreas activas do negócio</div>
        <ModulosConfig store={store} setStore={setStore} api={api} />
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
  const [mensagem, setMensagem] = useState(store.config.receiptMessage);
  const save = async () =>
    setStore(
      await api.patchConfig({
        receiptMessage: mensagem,
        impressao: { ...store.config.impressao, papel, visorCliente },
        docSeries: { prefixo: (prefixo || "FT").toUpperCase(), ano: new Date().getFullYear(), proximo: Number(proximo) || 1 },
      })
    );
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">Impressão e visor</div>
      <label className="text-xs" style={{ color: MUTED }}>
        Largura do papel do recibo
      </label>
      <select value={papel} onChange={(e) => setPapel(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm">
        <option value="58mm">58mm</option>
        <option value="80mm">80mm</option>
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={visorCliente} onChange={(e) => setVisorCliente(e.target.checked)} /> Tenho um visor voltado para o cliente
      </label>
      <label className="text-xs" style={{ color: MUTED }}>
        Série de documentos (facturas/recibos)
      </label>
      <div className="flex gap-2">
        <input value={prefixo} onChange={(e) => setPrefixo(e.target.value.toUpperCase())} placeholder="FT" style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm w-20" />
        <input type="number" value={proximo} onChange={(e) => setProximo(e.target.value)} placeholder="1" style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm flex-1" />
      </div>
      <div className="text-xs" style={{ color: MUTED }}>
        Próximo documento: {(prefixo || "FT") + new Date().getFullYear() + "/" + String(Number(proximo) || 1).padStart(4, "0")}
      </div>
      <label className="text-xs" style={{ color: MUTED }}>
        Mensagem no recibo
      </label>
      <input value={mensagem} onChange={(e) => setMensagem(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm" />
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded text-sm">
        Guardar
      </button>
    </div>
  );
}

function IvaConfig({ store, setStore, api }) {
  const [taxa, setTaxa] = useState(store.config.iva.taxa);
  const [precosIncluemIva, setPrecosIncluemIva] = useState(store.config.iva.precosIncluemIva);
  const [isento, setIsento] = useState(store.config.iva.isento);
  const save = async () => setStore(await api.patchConfig({ iva: { taxa: Number(taxa) || 0, precosIncluemIva, isento } }));
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">IVA</div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isento} onChange={(e) => setIsento(e.target.checked)} /> Negócio isento de IVA
      </label>
      {!isento && (
        <>
          <label className="text-xs" style={{ color: MUTED }}>
            Taxa de IVA (%)
          </label>
          <input type="number" value={taxa} onChange={(e) => setTaxa(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={precosIncluemIva} onChange={(e) => setPrecosIncluemIva(e.target.checked)} /> Os preços já incluem IVA
          </label>
        </>
      )}
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded text-sm">
        Guardar
      </button>
      <div className="text-xs" style={{ color: MUTED }}>
        Acredito que a taxa padrão em Moçambique tem sido 16%, mas confirme sempre o valor actual junto da Autoridade Tributária — esta taxa pode mudar.
      </div>
    </div>
  );
}

function ContasConfig({ store, setStore, api }) {
  const [contas, setContas] = useState(store.config.contas);
  const update = (id, field, value) => setContas((c) => ({ ...c, [id]: { ...c[id], [field]: value } }));
  const save = async () => setStore(await api.patchConfig({ contas }));
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-3">
      <div className="text-sm font-semibold">Contas de pagamento</div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={contas.dinheiro.activo} onChange={(e) => update("dinheiro", "activo", e.target.checked)} /> Dinheiro
      </label>
      <div style={{ borderColor: BORDER }} className="border rounded p-2 space-y-1.5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={contas.mpesa.activo} onChange={(e) => update("mpesa", "activo", e.target.checked)} /> M-Pesa
        </label>
        {contas.mpesa.activo && (
          <>
            <input placeholder="Número/agente M-Pesa" value={contas.mpesa.numero} onChange={(e) => update("mpesa", "numero", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1 text-xs" />
            <input placeholder="Titular da conta" value={contas.mpesa.titular} onChange={(e) => update("mpesa", "titular", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1 text-xs" />
          </>
        )}
      </div>
      <div style={{ borderColor: BORDER }} className="border rounded p-2 space-y-1.5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={contas.emola.activo} onChange={(e) => update("emola", "activo", e.target.checked)} /> e-Mola
        </label>
        {contas.emola.activo && (
          <>
            <input placeholder="Número/agente e-Mola" value={contas.emola.numero} onChange={(e) => update("emola", "numero", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1 text-xs" />
            <input placeholder="Titular da conta" value={contas.emola.titular} onChange={(e) => update("emola", "titular", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1 text-xs" />
          </>
        )}
      </div>
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded text-sm">
        Guardar
      </button>
      <div className="text-xs" style={{ color: MUTED }}>
        Desligar uma conta aqui remove-a dos botões de pagamento no ecrã de Vender.
      </div>
    </div>
  );
}

function EmpresaConfig({ store, setStore, api }) {
  const [businessName, setBusinessName] = useState(store.config.businessName);
  const [empresa, setEmpresa] = useState(store.config.empresa);
  const update = (field, value) => setEmpresa((e) => ({ ...e, [field]: value }));
  const save = async () => setStore(await api.patchConfig({ businessName, empresa }));
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">Dados da empresa</div>
      <input placeholder="Nome do negócio (mostrado no sistema)" value={businessName} onChange={(e) => setBusinessName(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm" />
      <input placeholder="Nome legal/completo" value={empresa.nome} onChange={(e) => update("nome", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm" />
      <input placeholder="NUIT" value={empresa.nuit} onChange={(e) => update("nuit", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input placeholder="Endereço (rua, nº)" value={empresa.endereco} onChange={(e) => update("endereco", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm sm:col-span-2" />
        <input placeholder="Bairro" value={empresa.bairro || ""} onChange={(e) => update("bairro", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        <input placeholder="Cidade" value={empresa.cidade} onChange={(e) => update("cidade", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        <select value={empresa.provincia || ""} onChange={(e) => update("provincia", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm">
          <option value="">Província…</option>
          {["Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input placeholder="Telefone principal" value={empresa.contacto} onChange={(e) => update("contacto", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        <input placeholder="Telefone alternativo" value={empresa.contacto2 || ""} onChange={(e) => update("contacto2", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        <input placeholder="Email" value={empresa.email} onChange={(e) => update("email", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        <input placeholder="Nº de Alvará / Licença" value={empresa.alvara || ""} onChange={(e) => update("alvara", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        <input placeholder="Ramo de actividade (CAE)" value={empresa.actividade || ""} onChange={(e) => update("actividade", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
      </div>
      <select value={empresa.regime} onChange={(e) => update("regime", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm">
        <option>Geral</option>
        <option>Simplificado (ISPC)</option>
      </select>
      <button onClick={save} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded text-sm">
        Guardar
      </button>
    </div>
  );
}

// Segurança: a cópia de segurança automática/manual agora é feita pela própria
// base de dados (Neon) — aqui fica apenas uma exportação de leitura, útil como
// cópia extra do próprio dono.
function SegurancaConfig({ store }) {
  const [exportText, setExportText] = useState("");
  const [msg, setMsg] = useState("");

  const generateExport = () => setExportText(JSON.stringify(store, null, 2));
  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setMsg("Copiado.");
    } catch (e) {
      setMsg("Não foi possível copiar automaticamente — seleccione o texto acima e copie manualmente.");
    }
  };

  return (
    <div className="space-y-3">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
        <div className="text-sm font-semibold">Exportar dados (cópia de segurança)</div>
        <div className="text-xs" style={{ color: MUTED }}>
          Os seus dados já ficam guardados de forma segura na base de dados do sistema. Esta exportação é apenas uma cópia extra, para guardar no seu computador.
        </div>
        <button onClick={generateExport} style={{ background: TEAL, color: "#fff" }} className="px-3 py-1.5 rounded text-sm">
          Gerar cópia
        </button>
        {exportText && (
          <>
            <textarea readOnly value={exportText} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-xs h-32" />
            <button onClick={copyExport} style={{ borderColor: BORDER, color: TEAL }} className="border rounded px-3 py-1 text-xs">
              Copiar
            </button>
          </>
        )}
        {msg && (
          <div className="text-xs" style={{ color: MUTED }}>
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
