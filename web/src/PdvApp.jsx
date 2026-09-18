import { useCallback, useEffect, useState } from "react";
import { BG, INK, TEAL, MUTED, BORDER, CARD, GREEN, BRICK, SOFTGOLD } from "./lib/theme.js";
import { BRAND_NAME, BRAND_TAGLINE } from "./lib/theme.js";
import { BRAND_LOGO } from "./lib/logo.js";
import { businessApi, getSession, clearSession, ApiError } from "./lib/api.js";
import { getActivePaymentMethods, isLowStock, getStock, nearExpiry } from "./lib/utils.js";
import { FloatingChart } from "./lib/charts.jsx";
import { NotificationBell } from "./components/Shared.jsx";
import SwitchUserModal from "./auth/SwitchUserModal.jsx";
import {
  ShoppingCart, LayoutGrid, Banknote, Package, Boxes, Users, Truck, UserCog, Scale, Settings,
  ChevronLeft, Lock, LogOut, CheckCircle2,
} from "./lib/icons.jsx";

import VenderTab from "./tabs/VenderTab.jsx";
import MesasTab from "./tabs/MesasTab.jsx";
import CaixaTab from "./tabs/CaixaTab.jsx";
import ProdutosTab from "./tabs/ProdutosTab.jsx";
import EstoqueTab from "./tabs/EstoqueTab.jsx";
import ClientesTab from "./tabs/ClientesTab.jsx";
import ComprasTab from "./tabs/ComprasTab.jsx";
import EquipaTab from "./tabs/EquipaTab.jsx";
import BalancoTab from "./tabs/BalancoTab.jsx";
import ConfigTab from "./tabs/ConfigTab.jsx";

export default function PdvApp({ businessId, isSuperAdmin, onExitBusiness, onLoggedOut }) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [tab, setTab] = useState("vender");
  const [toast, setToast] = useState(null);
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const api = businessApi(businessId);
  const session = getSession();

  const load = useCallback(() => {
    api
      .getStore()
      .then((s) => {
        setStore(s);
        setSaveError("");
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          onLoggedOut();
          return;
        }
        setSaveError("Sem ligação — não foi possível carregar os dados. Verifique a sua internet e tente novamente.");
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const showToast = useCallback((msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2400);
  }, []);

  if (loading || !store) {
    return (
      <div style={{ background: BG, color: INK }} className="flex items-center justify-center p-10 text-sm min-h-[400px]">
        {saveError || "A carregar o sistema…"}
      </div>
    );
  }

  const role = isSuperAdmin ? "dono" : session?.role || "dono";
  const employeeName = isSuperAdmin ? "Super-admin" : session?.employeeName || "";
  const canSeeFinance = role === "dono" || role === "gerente";
  const canDiscount = role === "dono" || role === "gerente";
  const canVoid = role === "dono" || role === "gerente";
  const canManageTeam = role === "dono";

  const modules = store.config.modules;
  const shiftOpen = !!store.currentShiftId;
  const currentShift = store.shifts.find((s) => s.id === store.currentShiftId);
  const paymentMethods = getActivePaymentMethods(store.config);

  const tabDefs = [
    { id: "vender", label: "Vender", icon: ShoppingCart, show: true },
    { id: "mesas", label: "Mesas", icon: LayoutGrid, show: modules.restaurante || modules.bar },
    { id: "caixa", label: "Caixa", icon: Banknote, show: true },
    { id: "produtos", label: "Produtos", icon: Package, show: true },
    { id: "estoque", label: "Estoque", icon: Boxes, show: true },
    { id: "clientes", label: "Clientes", icon: Users, show: true },
    { id: "compras", label: "Compras", icon: Truck, show: true },
    { id: "equipa", label: "Equipa", icon: UserCog, show: canManageTeam },
    { id: "balanco", label: "Balanço", icon: Scale, show: canSeeFinance },
    { id: "config", label: "Config", icon: Settings, show: canManageTeam },
  ].filter((t) => t.show);

  const alerts = [
    ...store.products.filter((p) => isLowStock(p, store.products)).map((p) => ({ text: `${p.name} — stock baixo (${getStock(p, store.products)})`, color: BRICK, tab: "estoque" })),
    ...store.products.filter((p) => nearExpiry(p).length > 0).map((p) => ({ text: `${p.name} — lote a vencer em breve`, color: "#C9973B", tab: "estoque" })),
    ...store.clients
      .filter((c) => c.creditLimit > 0 && c.debts.reduce((s, d) => s + d.amount, 0) > c.creditLimit)
      .map((c) => ({ text: `${c.name} passou o limite de fiado`, color: BRICK, tab: "clientes" })),
  ];

  const openShift = async (openingCash) => {
    try {
      setStore(await api.openShift(openingCash));
      showToast("Caixa aberto");
    } catch (e) {
      showToast(e.message, "warn");
    }
  };
  const closeShift = async (closingCash) => {
    try {
      setStore(await api.closeShift(closingCash));
      showToast("Caixa fechado");
    } catch (e) {
      showToast(e.message, "warn");
    }
  };
  const registerQuebra = async (payload) => {
    try {
      setStore(await api.registerQuebra(payload));
      showToast("Quebra registada");
    } catch (e) {
      showToast(e.message, "warn");
    }
  };
  const registerMovimento = async (payload) => {
    try {
      setStore(await api.registerMovimento(payload));
      showToast(payload.type === "entrada" ? "Entrada registada" : "Saída registada");
    } catch (e) {
      showToast(e.message, "warn");
    }
  };
  const finalizeSale = async (payload) => {
    try {
      const res = await api.finalizeSale(payload);
      setStore(res.store);
      showToast("Venda " + res.sale.numero + " registada");
      return res.sale;
    } catch (e) {
      showToast(e.message, "warn");
    }
  };
  const voidSale = async (saleId, reason) => {
    try {
      setStore(await api.voidSale(saleId, reason));
      showToast("Venda cancelada e stock devolvido", "warn");
    } catch (e) {
      showToast(e.message, "warn");
    }
  };

  const logout = () => {
    clearSession();
    onLoggedOut();
  };

  return (
    <div
      style={{ background: BG, color: INK, fontFamily: "system-ui, sans-serif" }}
      className="w-full min-h-[620px] rounded-lg overflow-hidden flex flex-col relative"
    >
      <div style={{ background: TEAL, color: "#fff" }} className="flex items-center justify-between px-4 py-3 gap-2 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div style={{ background: "#fff" }} className="rounded-md p-1 shrink-0">
            <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: 30 }} className="block" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] tracking-wide opacity-70 truncate">{BRAND_NAME} · {BRAND_TAGLINE}</div>
            <div className="text-lg font-semibold leading-tight truncate">{store.config.businessName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowChart((v) => !v)} style={{ background: "rgba(255,255,255,0.15)" }} className="text-xs px-2.5 py-1.5 rounded flex items-center gap-1">
            <Scale size={12} /> Gráfico
          </button>
          {saveError && (
            <span style={{ background: "rgba(178,58,46,0.35)" }} className="text-xs px-2.5 py-1.5 rounded font-medium">
              Offline
            </span>
          )}
          {isSuperAdmin && (
            <button onClick={onExitBusiness} style={{ background: "rgba(255,255,255,0.15)" }} className="text-xs px-2.5 py-1.5 rounded flex items-center gap-1">
              <ChevronLeft size={12} /> Contas
            </button>
          )}
          <NotificationBell alerts={alerts} onGo={(t) => setTab(t)} />
          <button
            onClick={() => setTab("caixa")}
            style={{ background: shiftOpen ? "rgba(46,110,78,0.35)" : "rgba(178,58,46,0.35)" }}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded font-medium"
          >
            <span style={{ background: shiftOpen ? GREEN : BRICK }} className="w-2 h-2 rounded-full" />
            {shiftOpen ? "Caixa aberto" : "Caixa fechado"}
          </button>
          {!isSuperAdmin && (
            <button
              onClick={() => setShowUserSwitch(true)}
              style={{ background: "rgba(255,255,255,0.15)" }}
              className="text-xs px-2.5 py-1.5 rounded flex items-center gap-1"
            >
              <Lock size={12} /> {employeeName}
            </button>
          )}
          <button onClick={logout} style={{ background: "rgba(255,255,255,0.15)" }} className="p-1.5 rounded">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <div style={{ borderBottom: `1px solid ${BORDER}`, background: CARD }} className="flex overflow-x-auto">
        {tabDefs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ color: active ? TEAL : MUTED, borderBottom: active ? "2px solid #C9973B" : "2px solid transparent" }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium whitespace-nowrap"
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-4">
        {!shiftOpen && tab === "vender" && (
          <div style={{ background: SOFTGOLD, borderColor: "#C9973B" }} className="border rounded-lg p-4 text-sm mb-4">
            O caixa está fechado. Abra o caixa na aba Caixa para começar a registar vendas.
          </div>
        )}
        {tab === "vender" && (
          <VenderTab
            store={store}
            setStore={setStore}
            api={api}
            finalizeSale={finalizeSale}
            voidSale={voidSale}
            shiftOpen={shiftOpen}
            canDiscount={canDiscount}
            canVoid={canVoid}
            showToast={showToast}
            paymentMethods={paymentMethods}
          />
        )}
        {tab === "mesas" && (
          <MesasTab
            store={store}
            setStore={setStore}
            api={api}
            finalizeSale={finalizeSale}
            shiftOpen={shiftOpen}
            canDiscount={canDiscount}
            showToast={showToast}
            paymentMethods={paymentMethods}
          />
        )}
        {tab === "caixa" && (
          <CaixaTab
            podeVerEsperado={canSeeFinance}
            store={store}
            shiftOpen={shiftOpen}
            currentShift={currentShift}
            openShift={openShift}
            closeShift={closeShift}
            registerQuebra={registerQuebra}
            registerMovimento={registerMovimento}
          />
        )}
        {tab === "produtos" && <ProdutosTab store={store} setStore={setStore} api={api} modules={modules} onGoEstoque={() => setTab("estoque")} />}
        {tab === "estoque" && (
          <EstoqueTab store={store} setStore={setStore} api={api} showToast={showToast} registerQuebra={registerQuebra} onGoCompras={() => setTab("compras")} />
        )}
        {tab === "clientes" && <ClientesTab store={store} setStore={setStore} api={api} />}
        {tab === "compras" && <ComprasTab store={store} setStore={setStore} api={api} />}
        {tab === "equipa" && <EquipaTab store={store} setStore={setStore} api={api} />}
        {tab === "balanco" && <BalancoTab store={store} />}
        {tab === "config" && <ConfigTab store={store} setStore={setStore} api={api} />}
      </div>

      {saveError && (
        <div style={{ background: "#FBE9E7", color: BRICK }} className="text-xs px-4 py-2">
          {saveError}
        </div>
      )}
      {toast && (
        <div
          style={{ background: toast.tone === "warn" ? BRICK : TEAL, color: "#fff" }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-lg text-sm flex items-center gap-2 z-50"
        >
          <CheckCircle2 size={15} />
          {toast.msg}
        </div>
      )}

      {showChart && <FloatingChart sales={store.sales} onClose={() => setShowChart(false)} />}

      {showUserSwitch && (
        <SwitchUserModal
          slug={session?.slug}
          onSwitched={() => {
            setShowUserSwitch(false);
            load();
          }}
          onClose={() => setShowUserSwitch(false)}
        />
      )}
    </div>
  );
}
