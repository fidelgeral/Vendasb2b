import { Wallet, Smartphone, Landmark, HandCoins } from "./icons.jsx";

// Métodos de pagamento activos, a partir da configuração das contas. Vive à
// parte do utils.js porque precisa dos ícones (JSX) — assim o utils.js fica
// puro e testável em Node.
export function getActivePaymentMethods(config) {
  const list = [];
  if (config.contas?.dinheiro?.activo !== false) list.push({ id: "dinheiro", label: "Dinheiro", icon: Wallet });
  if (config.contas?.mpesa?.activo !== false) list.push({ id: "mpesa", label: "M-Pesa", icon: Smartphone });
  if (config.contas?.emola?.activo !== false) list.push({ id: "emola", label: "e-Mola", icon: Landmark });
  list.push({ id: "fiado", label: "Fiado", icon: HandCoins });
  return list;
}
