import { Wallet, Smartphone, Landmark, HandCoins } from "./icons.jsx";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const fmtMT = (n) => new Intl.NumberFormat("pt-MZ", { minimumFractionDigits: 0 }).format(Math.round(n || 0)) + " MT";

export const todayStr = () => new Date().toISOString().slice(0, 10);

export const daysUntil = (dateStr) => {
  if (!dateStr) return 999;
  const diff = new Date(dateStr + "T00:00:00") - new Date(todayStr() + "T00:00:00");
  return Math.round(diff / 86400000);
};

// Stock próprio do produto (sem olhar para variação/composição).
export function ownStock(p) {
  if (!p) return 0;
  if (p.variants && p.variants.length) return p.variants.reduce((s, v) => s + v.stock, 0);
  if (p.batches && p.batches.length) return p.batches.reduce((s, b) => s + b.qty, 0);
  return p.stock || 0;
}

// Stock efectivo: produtos de variação puxam do produto-pai; composições são
// limitadas pelo ingrediente mais escasso.
export function getStock(p, produtos) {
  if (!p) return 0;
  if (p.tipo === "variacao" && p.parentId) {
    const lista = produtos || [];
    const pai = lista.find((x) => x.id === p.parentId);
    const consumo = Number(p.consumo) || 1;
    if (!pai || consumo <= 0) return 0;
    return Math.floor(ownStock(pai) / consumo);
  }
  if (p.tipo === "composicao" && p.ingredientes && p.ingredientes.length) {
    const lista = produtos || [];
    let menor = Infinity;
    p.ingredientes.forEach((ing) => {
      const prod = lista.find((x) => x.id === ing.productId);
      const q = Number(ing.qty) || 0;
      if (!prod || q <= 0) {
        menor = 0;
        return;
      }
      menor = Math.min(menor, Math.floor(ownStock(prod) / q));
    });
    return menor === Infinity ? 0 : menor;
  }
  return ownStock(p);
}

export function isLowStock(p, produtos) {
  return getStock(p, produtos) <= (p.minStock ?? 0);
}

export function nearExpiry(p, days = 3) {
  if (!p.batches) return [];
  return p.batches.filter((b) => b.qty > 0 && daysUntil(b.expiryDate) <= days);
}

// Comprime e converte uma foto para data URL (guardada directamente na base
// de dados) — evita depender de um serviço de armazenamento de ficheiros à parte.
export function compressImageFile(file, maxWidth = 420, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------- Importação em massa (Excel) ----------------
function normKey(k) {
  return k
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}
const IMPORT_HEADER_MAP = {
  nome: "name",
  produto: "name",
  categoria: "category",
  unidade: "unit",
  un: "unit",
  preco: "price",
  precovenda: "price",
  venda: "price",
  custo: "cost",
  precocusto: "cost",
  stock: "stock",
  estoque: "stock",
  quantidade: "stock",
  qtd: "stock",
  stockminimo: "minStock",
  estoqueminimo: "minStock",
  minimo: "minStock",
};
export function mapImportRow(raw) {
  const out = {};
  Object.entries(raw).forEach(([k, v]) => {
    const field = IMPORT_HEADER_MAP[normKey(k)];
    if (field) out[field] = v;
  });
  return out;
}

// Dispara o download de um Blob no browser (substitui a capability "downloads" do Claude).
export function saveBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function whatsappLink(phone, text) {
  const n = String(phone || "").replace(/[^0-9]/g, "");
  const full = n.length <= 9 ? "258" + n : n;
  return "https://wa.me/" + full + "?text=" + encodeURIComponent(text);
}

export const DESPESA_CATEGORIAS = ["Fornecedores", "Salários", "Renda", "Transporte", "Energia / Água", "Manutenção", "Impostos e taxas", "Troco / Fundo de caixa", "Outros"];
export const ENTRADA_CATEGORIAS = ["Reforço de troco", "Recebimento de dívida", "Aporte do sócio", "Devolução de fornecedor", "Outros"];

export const ROLE_LABELS = { dono: "Administrador", gerente: "Gerente", caixa: "Operador de Caixa", cozinha: "Cozinha / Bar" };

export const UNIDADES = [
  { id: "un", label: "un (Unidade)" },
  { id: "kg", label: "kg (Quilograma)" },
  { id: "g", label: "g (Grama)" },
  { id: "l", label: "L (Litro)" },
  { id: "ml", label: "ml (Mililitro)" },
  { id: "cx", label: "cx (Caixa)" },
  { id: "pct", label: "pct (Pacote)" },
  { id: "dz", label: "dz (Dúzia)" },
];
export const IVA_TAXAS = [0, 5, 16];

export function getActivePaymentMethods(config) {
  const list = [];
  if (config.contas?.dinheiro?.activo !== false) list.push({ id: "dinheiro", label: "Dinheiro", icon: Wallet });
  if (config.contas?.mpesa?.activo !== false) list.push({ id: "mpesa", label: "M-Pesa", icon: Smartphone });
  if (config.contas?.emola?.activo !== false) list.push({ id: "emola", label: "e-Mola", icon: Landmark });
  list.push({ id: "fiado", label: "Fiado", icon: HandCoins });
  return list;
}

export const ALL_MODULES = [
  { id: "mercearia", label: "Mercearia / loja geral" },
  { id: "restaurante", label: "Restaurante" },
  { id: "bar", label: "Bar" },
  { id: "roupa", label: "Loja de roupa" },
  { id: "padaria", label: "Padaria" },
];
