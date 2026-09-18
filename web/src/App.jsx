import { useState } from "react";
import { getSession, clearSession } from "./lib/api.js";
import LoginScreen from "./auth/LoginScreen.jsx";
import SuperAdminApp from "./auth/SuperAdminApp.jsx";
import PdvApp from "./PdvApp.jsx";

export default function App() {
  const [session, setSessionState] = useState(getSession());
  const [viewingBusiness, setViewingBusiness] = useState(null);

  const refreshSession = () => setSessionState(getSession());
  const onLoggedOut = () => {
    clearSession();
    setViewingBusiness(null);
    setSessionState(null);
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

  return <PdvApp businessId={session.businessId} isSuperAdmin={false} onLoggedOut={onLoggedOut} />;
}
