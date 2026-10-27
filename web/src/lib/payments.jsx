import { Wallet, Smartphone, Landmark, HandCoins } from "./icons.jsx";

// Métodos de pagamento activos, a partir da configuração das contas. Vive à
// parte do utils.js porque precisa dos ícones (JSX) — assim o utils.js fica
// puro e testável em Node.
export function getActivePaymentMethods(config, paymentAccounts = []) {
  const list = [];
  if (config.contas?.dinheiro?.activo !== false) list.push({ id: "dinheiro", label: "Dinheiro", icon: Wallet });
  if (config.contas?.mpesa?.activo !== false) list.push({ id: "mpesa", label: "M-Pesa", icon: Smartphone });
  if (config.contas?.emola?.activo !== false) list.push({ id: "emola", label: "e-Mola", icon: Landmark });
  for (const acc of paymentAccounts) {
    if (acc.activo) list.push({ id: acc.name.toLowerCase().replace(/\s+/g, "_"), label: acc.name, icon: Wallet });
  }
  list.push({ id: "fiado", label: "Dívida", icon: HandCoins });
  return list;
}
