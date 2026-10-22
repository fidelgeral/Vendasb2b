import { useState } from "react";
import { getSession, clearSession } from "./lib/api.js";
import LoginScreen from "./auth/LoginScreen.jsx";
import SuperAdminApp from "./auth/SuperAdminApp.jsx";
import PdvApp from "./PdvApp.jsx";
import { ConfirmProvider } from "./components/ConfirmProvider.jsx";

export default function App() {
  const [session, setSessionState] = useState(getSession());
  const [viewingBusiness, setViewingBusiness] = useState(null);
  const [activeBusinessId, setActiveBusinessId] = useState(getSession()?.businessId || null);

  const refreshSession = () => {
    const s = getSession();
    setSessionState(s);
    setActiveBusinessId(s?.businessId || null);
  };
  const onLoggedOut = () => {
    clearSession();
    setViewingBusiness(null);
    setSessionState(null);
    setActiveBusinessId(null);
  };

  const filiais = session && session.filiais && session.filiais.length > 1 ? session.filiais : null;
  let inner;
  if (!session) {
    inner = <LoginScreen onLogin={refreshSession} />;
  } else if (session.type === "super") {
    inner = viewingBusiness ? (
      <PdvApp businessId={viewingBusiness.id} isSuperAdmin onExitBusiness={() => setViewingBusiness(null)} onLoggedOut={onLoggedOut} />
    ) : (
      <SuperAdminApp onOpenBusiness={(b) => setViewingBusiness(b)} onLoggedOut={onLoggedOut} />
    );
  } else {
    inner = (
      <PdvApp
        key={activeBusinessId}
        businessId={activeBusinessId || session.businessId}
        isSuperAdmin={false}
        onLoggedOut={onLoggedOut}
        filiais={filiais}
        activeBusinessId={activeBusinessId || session.businessId}
        onSwitchFilial={setActiveBusinessId}
      />
    );
  }

  return <ConfirmProvider>{inner}</ConfirmProvider>;
}
