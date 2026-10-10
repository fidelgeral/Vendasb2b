import { useCallback, useEffect, useRef, useState } from "react";
import { BG, INK, TEAL, MUTED, BORDER, CARD, GREEN, BRICK, SOFTGOLD, GRADIENT } from "./lib/theme.js";
import { BRAND_NAME, BRAND_TAGLINE } from "./lib/theme.js";
import { BRAND_LOGO } from "./lib/logo.js";
import { businessApi, getSession, clearSession, ApiError } from "./lib/api.js";
import { enqueueSale, listPending, removePending, countPending, localSaleId } from "./lib/offlineQueue.js";
import { applyOfflineSale } from "./lib/offlineSale.js";
import { loadCachedStore, saveCachedStore } from "./lib/storeCache.js";
import { getActivePaymentMethods, isLowStock, getStock, nearExpiry } from "./lib/utils.js";
import HelpAssistant from "./components/HelpAssistant.jsx";
import BillingPanel from "./components/BillingPanel.jsx";
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

export default function PdvApp({ businessId, isSuperAdmin, onExitBusiness, onLoggedOut, filiais, activeBusinessId, onSwitchFilial }) {
  // Arranque instantâneo: começa com o último estado guardado no aparelho (se
  // existir) e só mostra "a carregar" quando não há nada em cache.
  const [store, setStore] = useState(() => loadCachedStore(businessId));
  const [loading, setLoading] = useState(() => !loadCachedStore(businessId));
  const [refreshing, setRefreshing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [tab, setTab] = useState("vender");
  const [toast, setToast] = useState(null);
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  const api = businessApi(businessId);
  const session = getSession();

  const load = useCallback(() => {
    setRefreshing(true);
    api
      .getStore()
      .then((s) => {
        setStore(s);
        saveCachedStore(businessId, s);
        setSaveError("");
        setSuspended(false);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) {
          onLoggedOut();
          return;
        }
        if (e instanceof ApiError && e.status === 402) {
          setSuspended(true);
          return;
        }
        // Se já mostramos dados da cache, não assustar o utilizador com erro —
        // só marcamos "offline"; o indicador do cabeçalho trata do resto.
        setSaveError("Sem ligação — não foi possível carregar os dados. Verifique a sua internet e tente novamente.");
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  // Mantém a cache local fresca após cada acção, para a próxima abertura ser
  // instantânea.
  useEffect(() => {
    if (store && !suspended) saveCachedStore(businessId, store);
  }, [store, businessId, suspended]);

  const showToast = useCallback((msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2400);
  }, []);

  const refreshPending = useCallback(() => {
    countPending(businessId).then(setPendingCount).catch(() => {});
  }, [businessId]);

  // Reenvia ao servidor as vendas feitas offline. O servidor atribui o número
  // real do documento, por isso não há duplicados. Corre uma de cada vez.
  const syncingRef = useRef(false);
  const syncPending = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const sales = await listPending(businessId);
      if (!sales.length) return;
      const client = businessApi(businessId);
      let enviados = 0;
      for (const item of sales) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await client.finalizeSale(item.payload);
          // eslint-disable-next-line no-await-in-loop
          await removePending(item.localId);
          enviados += 1;
        } catch (e) {
          if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 402) {
            // Erro permanente (ex.: dados inválidos): não adianta repetir — descarta.
            // eslint-disable-next-line no-await-in-loop
            await removePending(item.localId);
            enviados += 1;
          } else {
            // Erro de rede ou servidor: pára e tenta de novo mais tarde.
            break;
          }
        }
      }
      if (enviados > 0) {
        showToast(enviados + (enviados === 1 ? " venda sincronizada" : " vendas sincronizadas"));
        load();
      }
    } finally {
      syncingRef.current = false;
      refreshPending();
    }
  }, [businessId, load, showToast, refreshPending]);

  useEffect(() => {
    refreshPending();
  }, [refreshPending]);

  // Liga/desliga: actualiza o indicador e sincroniza quando a internet volta.
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      syncPending();
    };
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    if (navigator.onLine) syncPending();
    // Rede de segurança: tenta sincronizar a cada 60s caso haja vendas presas.
    const timer = setInterval(() => {
      if (navigator.onLine) syncPending();
    }, 60000);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      clearInterval(timer);
    };
  }, [syncPending]);

  if (suspended) {
    return (
      <div style={{ background: BG, color: INK, fontFamily: "system-ui, sans-serif" }} className="min-h-screen p-5">
        <div className="max-w-xl mx-auto space-y-4 pt-6">
          <div style={{ background: "#FEE2E2", borderColor: "#FCA5A5" }} className="border rounded-xl p-4">
            <div className="text-lg font-bold" style={{ color: BRICK }}>Conta suspensa</div>
            <div className="text-sm mt-1" style={{ color: INK }}>
              A assinatura do VENDASB2B está suspensa por falta de pagamento da mensalidade. Regularize o pagamento abaixo para reactivar o sistema.
            </div>
          </div>
          <BillingPanel api={api} canSubmit={session?.role === "dono" || isSuperAdmin} />
          <button
            onClick={() => {
              clearSession();
              onLoggedOut();
            }}
            style={{ borderColor: BORDER, color: MUTED }}
            className="border rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            Terminar sessão
          </button>
        </div>
      </div>
    );
  }

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
    ...store.products.filter((p) => nearExpiry(p).length > 0).map((p) => ({ text: `${p.name} — lote a vencer em breve`, color: "#F59E0B", tab: "estoque" })),
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
    // ID único por venda: torna o registo idempotente. Se o reenvio (offline ou
    // por resposta perdida) chegar duas vezes, o servidor não duplica a venda.
    const withId = payload.clientSaleId ? payload : { ...payload, clientSaleId: localSaleId() };
    try {
      const res = await api.finalizeSale(withId);
      setStore(res.store);
      showToast("Venda " + res.sale.numero + " registada");
      return res.sale;
    } catch (e) {
      // Sem ligação ao servidor (status 0): guarda a venda e reenvia quando a
      // internet voltar. A venda aparece já no ecrã (número "Offline").
      if (e instanceof ApiError && e.status === 0) {
        const entry = await enqueueSale({ businessId, payload: withId, employeeName });
        setStore((s) => applyOfflineSale(s, withId, { localId: entry?.localId, employeeName }));
        refreshPending();
        showToast("Sem internet — venda guardada para sincronizar", "warn");
        return { numero: "Offline", _offline: true };
      }
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
      className="w-full min-h-screen overflow-hidden flex flex-col relative"
    >
      <div style={{ background: GRADIENT, color: "#fff" }} className="flex items-center justify-between px-4 py-3.5 gap-2 flex-wrap shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div style={{ background: "#fff" }} className="rounded-xl p-1.5 shrink-0 shadow">
            <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: 30 }} className="block" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] tracking-wide opacity-80 truncate">{BRAND_NAME} · {BRAND_TAGLINE}</div>
            {filiais ? (
              <select
                value={activeBusinessId}
                onChange={(e) => onSwitchFilial(e.target.value)}
                className="text-lg font-bold leading-tight bg-transparent outline-none cursor-pointer"
                style={{ color: "#fff" }}
                title="Trocar de filial"
              >
                {filiais.map((f) => (
                  <option key={f.id} value={f.id} style={{ color: "#0F172A" }}>
                    {f.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xl font-bold leading-tight truncate">{store.config.businessName}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {refreshing && store && (
            <span style={{ background: "rgba(255,255,255,0.15)" }} className="text-xs px-2.5 py-1.5 rounded-lg font-medium opacity-80">
              a atualizar…
            </span>
          )}
          {(!isOnline || saveError) && (
            <span style={{ background: "rgba(239,68,68,0.45)" }} className="text-xs px-2.5 py-1.5 rounded-lg font-medium">
              Offline
            </span>
          )}
          {pendingCount > 0 && (
            <button
              onClick={syncPending}
              style={{ background: "rgba(245,158,11,0.55)" }}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium"
              title="Vendas feitas offline, ainda por enviar ao servidor. Toque para tentar sincronizar agora."
            >
              ⟳ {pendingCount} por sincronizar
            </button>
          )}
          {isSuperAdmin && (
            <button onClick={onExitBusiness} style={{ background: "rgba(255,255,255,0.15)" }} className="text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1">
              <ChevronLeft size={12} /> Contas
            </button>
          )}
          <NotificationBell alerts={alerts} onGo={(t) => setTab(t)} />
          <button
            onClick={() => setTab("caixa")}
            style={{ background: shiftOpen ? "rgba(16,185,129,0.45)" : "rgba(239,68,68,0.45)" }}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium"
          >
            <span style={{ background: shiftOpen ? GREEN : BRICK }} className="w-2 h-2 rounded-full" />
            {shiftOpen ? "Caixa aberto" : "Caixa fechado"}
          </button>
          {!isSuperAdmin && (
            <button
              onClick={() => setShowUserSwitch(true)}
              style={{ background: "rgba(255,255,255,0.15)" }}
              className="text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Lock size={12} /> {employeeName}
            </button>
          )}
          <button onClick={logout} style={{ background: "rgba(255,255,255,0.15)" }} className="p-1.5 rounded-lg">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      <div style={{ borderBottom: `1px solid ${BORDER}`, background: CARD }} className="flex gap-1 overflow-x-auto px-3 py-2 shadow-sm">
        {tabDefs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ color: active ? "#fff" : MUTED, background: active ? GRADIENT : "transparent", boxShadow: active ? "0 4px 12px rgba(79,70,229,0.3)" : "none" }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap hover:bg-indigo-50"
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 p-4 md:p-6">
        {!shiftOpen && tab === "vender" && (
          <div style={{ background: SOFTGOLD, borderColor: "#F59E0B" }} className="border rounded-lg p-4 text-sm mb-4">
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
            voidSale={voidSale}
            canVoid={canVoid}
          />
        )}
        {tab === "produtos" && <ProdutosTab store={store} setStore={setStore} api={api} modules={modules} onGoEstoque={() => setTab("estoque")} />}
        {tab === "estoque" && (
          <EstoqueTab store={store} setStore={setStore} api={api} showToast={showToast} registerQuebra={registerQuebra} onGoCompras={() => setTab("compras")} />
        )}
        {tab === "clientes" && <ClientesTab store={store} setStore={setStore} api={api} />}
        {tab === "compras" && <ComprasTab store={store} setStore={setStore} api={api} />}
        {tab === "equipa" && <EquipaTab store={store} setStore={setStore} api={api} />}
        {tab === "balanco" && <BalancoTab store={store} api={api} />}
        {tab === "config" && <ConfigTab store={store} setStore={setStore} api={api} />}
      </div>

      {saveError && (
        <div style={{ background: "#FEE2E2", color: BRICK }} className="text-xs px-4 py-2">
          {saveError}
        </div>
      )}
      {toast && (
        <div
          style={{ background: toast.tone === "warn" ? BRICK : TEAL, color: "#fff" }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-50"
        >
          <CheckCircle2 size={15} />
          {toast.msg}
        </div>
      )}

      <HelpAssistant api={api} />

      {showUserSwitch && (
        <SwitchUserModal
          businessId={businessId}
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
