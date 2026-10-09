import { useState } from "react";
import { getSession, clearSession } from "./lib/api.js";
import LoginScreen from "./auth/LoginScreen.jsx";
import SuperAdminApp from "./auth/SuperAdminApp.jsx";
import PdvApp from "./PdvApp.jsx";

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

  if (!session) {
    return <LoginScreen onLogin={refreshSession} />;
  }

  if (session.type === "super") {
    if (viewingBusiness) {
      return <PdvApp businessId={viewingBusiness.id} isSuperAdmin onExitBusiness={() => setViewingBusiness(null)} onLoggedOut={onLoggedOut} />;
    }
    return <SuperAdminApp onOpenBusiness={(b) => setViewingBusiness(b)} onLoggedOut={onLoggedOut} />;
  }

  const filiais = session.filiais && session.filiais.length > 1 ? session.filiais : null;
  return (
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
