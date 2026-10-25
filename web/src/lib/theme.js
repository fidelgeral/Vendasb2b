// Cores via CSS custom properties — permite dark mode sem alterar componentes.
// Cada constante devolve var(--nome), que o browser resolve em runtime.
export const INK = "var(--ink)";
export const TEAL = "var(--teal)";
export const GOLD = "var(--gold)";
export const BG = "var(--bg)";
export const CARD = "var(--card)";
export const BORDER = "var(--border)";
export const BRICK = "var(--brick)";
export const MUTED = "var(--muted)";
export const SOFTGOLD = "var(--softgold)";
export const GREEN = "var(--green)";
export const PRICE_GREEN = "var(--price-green)";
export const PRIMARY_SOFT = "var(--primary-soft)";
export const GRADIENT = "var(--gradient)";
export const GRADIENT_SOFT = "var(--gradient-soft)";

export const BRAND_NAME = "VENDASB2B";
export const BRAND_TAGLINE = "Soluções comerciais para empresas";

export function isDarkMode() {
  return document.documentElement.classList.contains("dark");
}

export function toggleDarkMode() {
  const dark = !isDarkMode();
  document.documentElement.classList.toggle("dark", dark);
  try { localStorage.setItem("vendasb2b-dark", dark ? "1" : "0"); } catch {}
  return dark;
}

export function initTheme() {
  try {
    if (localStorage.getItem("vendasb2b-dark") === "1") {
      document.documentElement.classList.add("dark");
    }
  } catch {}
}
