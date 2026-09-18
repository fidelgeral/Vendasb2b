const { useState, useEffect, useMemo, useCallback, useContext, createContext } = React;

const CapsContext = createContext({ assets: null, downloads: null });

function Ico({ size = 16, color, style, children }) {
  const stroke = color || (style && style.color) || "currentColor";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}
function ShoppingCart(p) { return <Ico {...p}><path d="M3 4h2l1 4m0 0l1.5 8h9l2-8H7" /><circle cx="9" cy="19" r="1.3" /><circle cx="16" cy="19" r="1.3" /></Ico>; }
function LayoutGrid(p) { return <Ico {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Ico>; }
function Banknote(p) { return <Ico {...p}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></Ico>; }
function Package(p) { return <Ico {...p}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></Ico>; }
function Boxes(p) { return <Ico {...p}><rect x="3" y="9" width="9" height="9" rx="1" /><rect x="12" y="4" width="9" height="9" rx="1" /></Ico>; }
function Users(p) { return <Ico {...p}><circle cx="8" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" /><circle cx="17" cy="9" r="2.4" /><path d="M14.5 13.3c2.6.3 5 2.3 5 6.7" /></Ico>; }
function Truck(p) { return <Ico {...p}><rect x="1" y="7" width="13" height="9" rx="1" /><path d="M14 10h4l3 3v3h-7z" /><circle cx="6" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></Ico>; }
function UserCog(p) { return <Ico {...p}><circle cx="9" cy="7" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><circle cx="18" cy="17" r="2.3" /><path d="M18 13.5v1.2M18 19.3v1.2M14.5 17h1.2M20.3 17h1.2" /></Ico>; }
function Scale(p) { return <Ico {...p}><path d="M12 3v14" /><path d="M5 7h14" /><path d="M5 7l-2 6h6l-2-6" /><path d="M19 7l-2 6h6l-2-6" /><path d="M8 21h8" /></Ico>; }
function Settings(p) { return <Ico {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M4.2 7.5l2.2 1.3M17.6 15.2l2.2 1.3M4.2 16.5l2.2-1.3M17.6 8.8l2.2-1.3M3 12h2.5M18.5 12H21" /></Ico>; }
function Plus(p) { return <Ico {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Ico>; }
function Minus(p) { return <Ico {...p}><line x1="5" y1="12" x2="19" y2="12" /></Ico>; }
function Trash2(p) { return <Ico {...p}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></Ico>; }
function X(p) { return <Ico {...p}><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></Ico>; }
function AlertTriangle(p) { return <Ico {...p}><path d="M12 3l10 18H2z" /><line x1="12" y1="9" x2="12" y2="14" /><line x1="12" y1="16.4" x2="12" y2="16.7" /></Ico>; }
function CheckCircle2(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></Ico>; }
function Wallet(p) { return <Ico {...p}><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><circle cx="17" cy="14.5" r="1.2" /></Ico>; }
function Smartphone(p) { return <Ico {...p}><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="10" y1="19" x2="14" y2="19" /></Ico>; }
function Landmark(p) { return <Ico {...p}><path d="M3 21h18" /><path d="M5 21V10" /><path d="M19 21V10" /><path d="M9 21V10" /><path d="M15 21V10" /><path d="M2 10l10-6 10 6" /></Ico>; }
function HandCoins(p) { return <Ico {...p}><circle cx="9" cy="9" r="4" /><circle cx="15" cy="15" r="4" /></Ico>; }
function Lock(p) { return <Ico {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Ico>; }
function Percent(p) { return <Ico {...p}><line x1="19" y1="5" x2="5" y2="19" /><circle cx="7" cy="7" r="2.3" /><circle cx="17" cy="17" r="2.3" /></Ico>; }
function Split(p) { return <Ico {...p}><path d="M12 4v6" /><path d="M12 10l-6 8" /><path d="M12 10l6 8" /></Ico>; }
function PauseCircle(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><line x1="10" y1="9" x2="10" y2="15" /><line x1="14" y1="9" x2="14" y2="15" /></Ico>; }
function PlayCircle(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><path d="M10 8.5l6 3.5-6 3.5z" /></Ico>; }
function Layers(p) { return <Ico {...p}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></Ico>; }
function Ruler(p) { return <Ico {...p}><rect x="3" y="9" width="18" height="6" rx="1" /><line x1="7" y1="9" x2="7" y2="12" /><line x1="11" y1="9" x2="11" y2="12" /><line x1="15" y1="9" x2="15" y2="12" /><line x1="19" y1="9" x2="19" y2="12" /></Ico>; }
function ChevronLeft(p) { return <Ico {...p}><path d="M15 5l-7 7 7 7" /></Ico>; }
function Star(p) { return <Ico {...p}><path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20.1l1.4-6.3-4.8-4.3 6.4-.6z" /></Ico>; }
function Bell(p) { return <Ico {...p}><path d="M6 10a6 6 0 0 1 12 0v5l2 3H4l2-3z" /><path d="M10 20a2 2 0 0 0 4 0" /></Ico>; }
function Link2(p) { return <Ico {...p}><rect x="3" y="9" width="8" height="6" rx="3" /><rect x="13" y="9" width="8" height="6" rx="3" /><line x1="9" y1="12" x2="15" y2="12" /></Ico>; }
function LogOut(p) { return <Ico {...p}><path d="M15 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" /><line x1="10" y1="12" x2="21" y2="12" /><path d="M17 8l4 4-4 4" /></Ico>; }
function ArrowDownCircle(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><path d="M9 13l3 3 3-3" /></Ico>; }
function ArrowUpCircle(p) { return <Ico {...p}><circle cx="12" cy="12" r="9" /><line x1="12" y1="16" x2="12" y2="8" /><path d="M9 11l3-3 3 3" /></Ico>; }
function PackageX(p) { return <Ico {...p}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><line x1="9.5" y1="14" x2="14.5" y2="18" /><line x1="14.5" y1="14" x2="9.5" y2="18" /></Ico>; }
function ImageOff(p) { return <Ico {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="3" x2="21" y2="21" /><circle cx="9" cy="9" r="1.6" /><path d="M21 15l-5-5-4 4" /></Ico>; }

// ---------------- Tokens visuais ----------------
const INK = "#16241F";
const TEAL = "#123C3C";
const GOLD = "#C9973B";
const BG = "#EFF3F1";
const CARD = "#FFFFFF";
const BORDER = "#D8E0DC";
const BRICK = "#B23A2E";
const MUTED = "#5B6A63";
const SOFTGOLD = "#F6EBD3";
const GREEN = "#2E6E4E";
const PRICE_GREEN = "#1B8A4B";

const STORAGE_KEY = "pdv-dino-pro-v2";
const MAX_SALES_KEPT = 400;
const REGISTRY_PATH = "registry/businesses";
const BRAND_NAME = "VENDASB2B";
const BRAND_TAGLINE = "Soluções comerciais para empresas";
const BRAND_LOGO = "data:image/jpeg;base64,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";

// ---------------- Helpers ----------------
const uid = () => Math.random().toString(36).slice(2, 10);
const fmtMT = (n) =>
  new Intl.NumberFormat("pt-MZ", { minimumFractionDigits: 0 }).format(Math.round(n || 0)) + " MT";
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysUntil = (dateStr) => {
  if (!dateStr) return 999;
  const diff = new Date(dateStr + "T00:00:00") - new Date(todayStr() + "T00:00:00");
  return Math.round(diff / 86400000);
};

function ownStock(p) {
  if (!p) return 0;
  if (p.variants && p.variants.length) return p.variants.reduce((s, v) => s + v.stock, 0);
  if (p.batches && p.batches.length) return p.batches.reduce((s, b) => s + b.qty, 0);
  return p.stock || 0;
}

// Stock efectivo: produtos de variação puxam do produto-pai; composições são
// limitadas pelo ingrediente mais escasso.
function getStock(p, produtos) {
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

// Traduz uma linha de venda nos descontos reais de stock que ela provoca.
function expandDecrement(d, produtos) {
  const p = (produtos || []).find((x) => x.id === d.productId);
  if (!p) return [d];
  if (p.tipo === "variacao" && p.parentId) {
    return [{ productId: p.parentId, variantId: null, qty: d.qty * (Number(p.consumo) || 1) }];
  }
  if (p.tipo === "composicao" && p.ingredientes && p.ingredientes.length) {
    return p.ingredientes.map((ing) => ({ productId: ing.productId, variantId: null, qty: d.qty * (Number(ing.qty) || 0) }));
  }
  return [d];
}
function isLowStock(p, produtos) {
  return getStock(p, produtos) <= (p.minStock ?? 0);
}
function nearExpiry(p, days = 3) {
  if (!p.batches) return [];
  return p.batches.filter((b) => b.qty > 0 && daysUntil(b.expiryDate) <= days);
}

function applyDecrements(products, rawDecrements) {
  const decrements = rawDecrements.reduce((acc, d) => acc.concat(expandDecrement(d, products)), []);
  return products.map((p) => {
    const ds = decrements.filter((d) => d.productId === p.id);
    if (!ds.length) return p;
    let next = { ...p };
    ds.forEach((d) => {
      if (d.variantId && next.variants) {
        next = {
          ...next,
          variants: next.variants.map((v) =>
            v.id === d.variantId ? { ...v, stock: Math.max(0, v.stock - d.qty) } : v
          ),
        };
      } else if (next.batches && next.batches.length) {
        if (d.qty >= 0) {
          let remaining = d.qty;
          const ordered = [...next.batches].sort(
            (a, b) => new Date(a.expiryDate || "9999-12-31") - new Date(b.expiryDate || "9999-12-31")
          );
          const byId = {};
          next.batches.forEach((b) => (byId[b.id] = { ...b }));
          for (const b of ordered) {
            if (remaining <= 0) break;
            const take = Math.min(byId[b.id].qty, remaining);
            byId[b.id].qty -= take;
            remaining -= take;
          }
          next = { ...next, batches: next.batches.map((b) => byId[b.id]) };
        } else {
          const restoreQty = -d.qty;
          const batches = next.batches.map((b) => ({ ...b }));
          batches[0].qty += restoreQty;
          next = { ...next, batches };
        }
      } else {
        next = { ...next, stock: Math.max(0, (next.stock || 0) - d.qty) };
      }
    });
    return next;
  });
}

function compressImageFile(file, maxWidth = 420, quality = 0.72) {
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
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/jpeg", quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------------- Importação/exportação em massa (Excel) ----------------
function normKey(k) {
  return k
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
function mapImportRow(raw) {
  const out = {};
  Object.entries(raw).forEach(([k, v]) => {
    const field = IMPORT_HEADER_MAP[normKey(k)];
    if (field) out[field] = v;
  });
  return out;
}
async function downloadWorkbook(downloadsCap, rows, filename) {
  if (!downloadsCap) return false;
  try {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");
    const arr = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    await downloadsCap.save({ filename, data: blob });
    return true;
  } catch (e) {
    return false;
  }
}

const DESPESA_CATEGORIAS = ["Fornecedores", "Salários", "Renda", "Transporte", "Energia / Água", "Manutenção", "Impostos e taxas", "Troco / Fundo de caixa", "Outros"];
const ENTRADA_CATEGORIAS = ["Reforço de troco", "Recebimento de dívida", "Aporte do sócio", "Devolução de fornecedor", "Outros"];

function makeAudit(employee, acao, detalhe, valor) {
  return { id: uid(), date: new Date().toISOString(), employeeId: employee ? employee.id : null, employeeName: employee ? employee.name : "—", acao, detalhe: detalhe || "", valor: valor === undefined ? null : valor };
}

function nextDocNumber(config) {
  const ds = config.docSeries || { prefixo: "FT", ano: new Date().getFullYear(), proximo: 1 };
  const anoActual = new Date().getFullYear();
  const ano = ds.ano === anoActual ? ds.ano : anoActual;
  const proximo = ds.ano === anoActual ? ds.proximo || 1 : 1;
  return { numero: (ds.prefixo || "FT") + ano + "/" + String(proximo).padStart(4, "0"), nextSeries: { prefixo: ds.prefixo || "FT", ano, proximo: proximo + 1 } };
}

function whatsappLink(phone, text) {
  const n = String(phone || "").replace(/[^0-9]/g, "");
  const full = n.length <= 9 ? "258" + n : n;
  return "https://wa.me/" + full + "?text=" + encodeURIComponent(text);
}

async function gerarReciboPDF(downloadsCap, sale, store, clientes) {
  if (!downloadsCap || !window.jspdf) return false;
  try {
    const { jsPDF } = window.jspdf;
    const emp = store.config.empresa || {};
    const iva = store.config.iva || {};
    const taxa = iva.isento ? 0 : Number(iva.taxa) || 0;
    const cli = clientes.find((c) => c.id === sale.clientId);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 42;
    doc.setFontSize(16);
    doc.setTextColor(18, 60, 60);
    doc.text(emp.nome || store.config.businessName || "", 40, y);
    y += 15;
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    [emp.endereco, [emp.bairro, emp.cidade, emp.provincia].filter(Boolean).join(", "), [emp.contacto, emp.email].filter(Boolean).join(" · "), emp.nuit ? "NUIT: " + emp.nuit : "", emp.alvara ? "Alvará: " + emp.alvara : ""]
      .filter(Boolean)
      .forEach((l) => { doc.text(String(l), 40, y); y += 12; });

    y += 10;
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text(iva.isento ? "RECIBO " + (sale.numero || "") : "FACTURA / RECIBO " + (sale.numero || ""), 40, y);
    y += 16;
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text("Data: " + new Date(sale.date).toLocaleString("pt-PT"), 40, y);
    y += 12;
    doc.text("Cliente: " + (cli ? cli.name : "Consumidor Final") + (cli && cli.nuit ? "   NUIT: " + cli.nuit : ""), 40, y);
    y += 18;

    const linhas = sale.items.map((it) => {
      const bruto = it.price * it.qty;
      const base = iva.precosIncluemIva && taxa ? bruto / (1 + taxa / 100) : bruto;
      return [it.name, String(it.qty), fmtMT(it.price), taxa + "%", fmtMT(bruto)];
    });
    if (window.autoTable) {
      window.autoTable(doc, {
        head: [["Descrição", "Qtd", "Preço un.", "IVA", "Total"]],
        body: linhas,
        startY: y,
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [18, 60, 60], textColor: 255 },
        columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
        margin: { left: 40, right: 40 },
      });
      y = doc.lastAutoTable.finalY + 18;
    } else {
      linhas.forEach((l) => { doc.text(l.join("   "), 40, y); y += 13; });
      y += 10;
    }

    const bruto = sale.total;
    const base = iva.precosIncluemIva && taxa ? bruto / (1 + taxa / 100) : bruto;
    const valorIva = iva.precosIncluemIva && taxa ? bruto - base : bruto * (taxa / 100);
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    const right = doc.internal.pageSize.getWidth() - 40;
    const linhasTotais = [
      ["Base tributável", fmtMT(base)],
      ["IVA (" + taxa + "%)", fmtMT(valorIva)],
      sale.discount ? ["Desconto", "-" + fmtMT(sale.discount)] : null,
      ["TOTAL A PAGAR", fmtMT(bruto)],
    ].filter(Boolean);
    linhasTotais.forEach(([k, v], i) => {
      const bold = i === linhasTotais.length - 1;
      doc.setFont(undefined, bold ? "bold" : "normal");
      doc.text(k, right - 180, y);
      doc.text(v, right, y, { align: "right" });
      y += 15;
    });
    doc.setFont(undefined, "normal");
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text("Pagamento: " + sale.payments.map((p) => p.method + " " + fmtMT(p.amount)).join(", "), 40, y);
    y += 16;
    doc.text(store.config.receiptMessage || "", 40, y);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text("Processado por " + BRAND_NAME, 40, doc.internal.pageSize.getHeight() - 25);
    const blob = doc.output("blob");
    await downloadsCap.save({ filename: "recibo_" + String(sale.numero || sale.id).replace(/[^\w]+/g, "_") + ".pdf", data: blob });
    return true;
  } catch (e) {
    return false;
  }
}

// ================= Gráficos =================
function AreaChart({ points, height = 70, color = TEAL, fill = "rgba(18,60,60,0.12)", labels }) {
  const [hover, setHover] = useState(null);
  if (!points || points.length === 0) return null;
  const max = Math.max(...points, 1);
  const w = 100;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const coords = points.map((v, i) => [i * step, height - (v / max) * (height - 8) - 4]);
  const linha = coords.map(([x, y], i) => (i ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2)).join(" ");
  const area = linha + " L " + w + " " + height + " L 0 " + height + " Z";
  return (
    <div className="relative">
      <svg viewBox={"0 0 " + w + " " + height} preserveAspectRatio="none" style={{ width: "100%", height }} onMouseLeave={() => setHover(null)}>
        <path d={area} fill={fill} />
        <path d={linha} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        {coords.map(([x, y], i) => (
          <g key={i}>
            <rect x={x - step / 2} y="0" width={step} height={height} fill="transparent" onMouseEnter={() => setHover(i)} />
            {hover === i && <circle cx={x} cy={y} r="2.5" fill={color} vectorEffect="non-scaling-stroke" />}
          </g>
        ))}
      </svg>
      {hover !== null && (
        <div
          style={{ background: INK, color: "#fff", left: Math.min(88, Math.max(2, (hover / Math.max(1, points.length - 1)) * 100)) + "%" }}
          className="absolute -top-1 text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap -translate-x-1/2"
        >
          {labels && labels[hover] ? labels[hover] + ": " : ""}
          {fmtMT(points[hover])}
        </div>
      )}
    </div>
  );
}

function DonutChart({ data, size = 120 }) {
  const [hover, setHover] = useState(null);
  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) return null;
  const r = size / 2 - 10;
  const c = size / 2;
  let acc = 0;
  const cores = ["#123C3C", "#2E6E4E", "#C9973B", "#5B4FE0", "#B23A2E", "#2E5AAC", "#7C3AED"];
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} onMouseLeave={() => setHover(null)}>
        {data.map((d, i) => {
          const frac = d.value / total;
          const a0 = acc * 2 * Math.PI - Math.PI / 2;
          acc += frac;
          const a1 = acc * 2 * Math.PI - Math.PI / 2;
          const large = frac > 0.5 ? 1 : 0;
          const path = [
            "M", c + r * Math.cos(a0), c + r * Math.sin(a0),
            "A", r, r, 0, large, 1, c + r * Math.cos(a1), c + r * Math.sin(a1),
          ].join(" ");
          return (
            <path
              key={i}
              d={path}
              fill="none"
              stroke={cores[i % cores.length]}
              strokeWidth={hover === i ? 20 : 15}
              onMouseEnter={() => setHover(i)}
              style={{ cursor: "pointer", transition: "stroke-width .12s" }}
            />
          );
        })}
        <text x={c} y={c - 2} textAnchor="middle" style={{ fontSize: 10, fill: MUTED }}>
          {hover !== null ? data[hover].label : "Total"}
        </text>
        <text x={c} y={c + 12} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: INK }}>
          {fmtMT(hover !== null ? data[hover].value : total)}
        </text>
      </svg>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span style={{ background: cores[i % cores.length] }} className="w-2.5 h-2.5 rounded-sm" />
            <span style={{ color: hover === i ? INK : MUTED }}>{d.label}</span>
            <span className="font-medium">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCardChart({ label, value, sub, points, labels, color }) {
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 overflow-hidden">
      <div className="text-xs" style={{ color: MUTED }}>
        {label}
      </div>
      <div style={{ color: color || TEAL }} className="text-xl font-semibold mt-1">
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: MUTED }}>
          {sub}
        </div>
      )}
      {points && points.length > 1 && (
        <div className="mt-2 -mx-3 -mb-3">
          <AreaChart points={points} labels={labels} height={46} color={color || TEAL} />
        </div>
      )}
    </div>
  );
}

// Painel flutuante com a evolução das vendas
function FloatingChart({ sales, onClose }) {
  const dias = 14;
  const serie = [];
  const rotulos = [];
  for (let i = dias - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    rotulos.push(d.slice(8, 10) + "/" + d.slice(5, 7));
    serie.push(sales.filter((s) => s.status !== "void" && s.date.slice(0, 10) === d).reduce((a, s) => a + s.total, 0));
  }
  const totalPeriodo = serie.reduce((a, b) => a + b, 0);
  const metodos = {};
  sales.filter((s) => s.status !== "void").forEach((s) => s.payments.forEach((p) => (metodos[p.method] = (metodos[p.method] || 0) + p.amount)));
  const donut = Object.entries(metodos).map(([k, v]) => ({ label: k, value: v }));

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="fixed bottom-4 right-4 z-40 border rounded-xl shadow-2xl p-3 w-[320px] max-w-[92vw]">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-semibold">Vendas — últimos 14 dias</div>
        <button onClick={onClose}>
          <X size={14} style={{ color: MUTED }} />
        </button>
      </div>
      <div style={{ color: TEAL }} className="text-xl font-bold">
        {fmtMT(totalPeriodo)}
      </div>
      <AreaChart points={serie} labels={rotulos} height={64} />
      {donut.length > 0 && (
        <div className="mt-2 pt-2" style={{ borderTop: "1px solid " + BORDER }}>
          <div className="text-[11px] font-semibold mb-1.5" style={{ color: MUTED }}>
            POR FORMA DE PAGAMENTO
          </div>
          <DonutChart data={donut} size={104} />
        </div>
      )}
    </div>
  );
}

// Recibo térmico 58/80mm — abre janela e chama a impressão do navegador
function imprimirReciboTermico(sale, store, clientes) {
  const largura = (store.config.impressao && store.config.impressao.papel) === "58mm" ? 58 : 80;
  const emp = store.config.empresa || {};
  const iva = store.config.iva || {};
  const taxa = iva.isento ? 0 : Number(iva.taxa) || 0;
  const cli = clientes.find((c) => c.id === sale.clientId);
  const bruto = sale.total;
  const base = iva.precosIncluemIva && taxa ? bruto / (1 + taxa / 100) : bruto;
  const valorIva = iva.precosIncluemIva && taxa ? bruto - base : bruto * (taxa / 100);
  const esc = (t) => String(t == null ? "" : t).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const linhas = sale.items
    .map(
      (it) =>
        '<tr><td colspan="2">' + esc(it.name) + '</td></tr>' +
        '<tr><td>' + it.qty + " x " + fmtMT(it.price) + '</td><td class="r">' + fmtMT(it.price * it.qty) + "</td></tr>"
    )
    .join("");
  const w = window.open("", "_blank", "width=420,height=760");
  if (!w) return false;
  w.document.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Recibo ' + esc(sale.numero || "") + '</title><style>' +
      "*{box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:11px;margin:0;padding:4mm;width:" + largura + "mm;color:#000}" +
      ".c{text-align:center}.r{text-align:right}.b{font-weight:bold}" +
      "h1{font-size:13px;margin:0 0 2px}table{width:100%;border-collapse:collapse}td{padding:1px 0;vertical-align:top}" +
      "hr{border:none;border-top:1px dashed #000;margin:4px 0}" +
      ".tot{font-size:14px;font-weight:bold}" +
      "@media print{@page{size:" + largura + "mm auto;margin:0}body{padding:3mm}}" +
      "</style></head><body>" +
      '<div class="c"><h1>' + esc(emp.nome || store.config.businessName) + "</h1>" +
      (emp.endereco ? "<div>" + esc(emp.endereco) + "</div>" : "") +
      (emp.cidade ? "<div>" + esc(emp.cidade) + "</div>" : "") +
      (emp.contacto ? "<div>Tel: " + esc(emp.contacto) + "</div>" : "") +
      (emp.nuit ? '<div class="b">NUIT: ' + esc(emp.nuit) + "</div>" : "") +
      "</div><hr>" +
      '<div class="b">' + esc(sale.numero || "") + "</div>" +
      "<div>" + new Date(sale.date).toLocaleString("pt-PT") + "</div>" +
      "<div>Cliente: " + esc(cli ? cli.name : "Consumidor Final") + "</div>" +
      (cli && cli.nuit ? "<div>NUIT: " + esc(cli.nuit) + "</div>" : "") +
      "<hr><table>" + linhas + "</table><hr><table>" +
      (taxa ? "<tr><td>Base</td><td class='r'>" + fmtMT(base) + "</td></tr><tr><td>IVA " + taxa + "%</td><td class='r'>" + fmtMT(valorIva) + "</td></tr>" : "") +
      (sale.discount ? "<tr><td>Desconto</td><td class='r'>-" + fmtMT(sale.discount) + "</td></tr>" : "") +
      "<tr class='tot'><td>TOTAL</td><td class='r'>" + fmtMT(bruto) + "</td></tr></table><hr>" +
      "<div>" + esc(sale.payments.map((p) => p.method + ": " + fmtMT(p.amount)).join(" | ")) + "</div>" +
      (sale.pontosGanhos ? "<div>Pontos ganhos: " + sale.pontosGanhos + "</div>" : "") +
      '<hr><div class="c">' + esc(store.config.receiptMessage || "") + "</div>" +
      '<div class="c" style="margin-top:6px;font-size:9px">Processado por ' + BRAND_NAME + "</div>" +
      '<script>window.onload=function(){window.print();}<\/script></body></html>'
  );
  w.document.close();
  return true;
}

function getActivePaymentMethods(config) {
  const list = [];
  if (config.contas?.dinheiro?.activo !== false) list.push({ id: "dinheiro", label: "Dinheiro", icon: Wallet });
  if (config.contas?.mpesa?.activo !== false) list.push({ id: "mpesa", label: "M-Pesa", icon: Smartphone });
  if (config.contas?.emola?.activo !== false) list.push({ id: "emola", label: "e-Mola", icon: Landmark });
  list.push({ id: "fiado", label: "Fiado", icon: HandCoins });
  return list;
}

const ALL_MODULES = [
  { id: "mercearia", label: "Mercearia / loja geral" },
  { id: "restaurante", label: "Restaurante" },
  { id: "bar", label: "Bar" },
  { id: "roupa", label: "Loja de roupa" },
  { id: "padaria", label: "Padaria" },
];

function buildSeedStore() {
  return {
    config: {
      businessName: "Minha Loja",
      modules: { mercearia: true, restaurante: false, bar: false, roupa: false, padaria: false },
      receiptMessage: "Obrigado pela preferência! Volte sempre.",
      impressao: { papel: "80mm", visorCliente: false },
      iva: { taxa: 16, precosIncluemIva: true, isento: false },
      contas: {
        dinheiro: { activo: true },
        mpesa: { activo: true, numero: "", titular: "" },
        emola: { activo: true, numero: "", titular: "" },
      },
      empresa: { nome: "", nuit: "", endereco: "", cidade: "", contacto: "", email: "", regime: "Geral" },
    },
    products: [
      { id: "p1", name: "Arroz 5kg", category: "Mercearia", unit: "un", price: 350, cost: 260, stock: 18, minStock: 5, foto: "" },
      { id: "p2", name: "Óleo 1L", category: "Mercearia", unit: "un", price: 150, cost: 110, stock: 6, minStock: 8, foto: "" },
      {
        id: "p3",
        name: "Pão francês",
        category: "Padaria",
        unit: "kg",
        price: 120,
        cost: 70,
        minStock: 2,
        foto: "",
        batches: [{ id: uid(), qty: 8, expiryDate: todayStr() }],
      },
      { id: "p4", name: "Cerveja 2M 620ml", category: "Bar", unit: "un", price: 90, cost: 60, stock: 48, minStock: 12, foto: "" },
      {
        id: "p5",
        name: "T-shirt básica",
        category: "Roupa",
        unit: "un",
        price: 450,
        cost: 220,
        minStock: 3,
        foto: "",
        variants: [
          { id: uid(), label: "P", stock: 4 },
          { id: uid(), label: "M", stock: 7 },
          { id: uid(), label: "G", stock: 2 },
        ],
      },
      { id: "p6", name: "Amendoim torrado", category: "Bar", unit: "un", price: 40, cost: 20, stock: 25, minStock: 6, foto: "" },
    ],
    categories: ["Mercearia", "Padaria", "Bar", "Roupa", "Geral"],
    clients: [{ id: "c1", name: "Cliente balcão", phone: "", creditLimit: 0, points: 0, debts: [] }],
    employees: [{ id: "dono", name: "Dono(a)", pin: "", role: "dono" }],
    suppliers: [],
    purchases: [],
    tables: [1, 2, 3, 4, 5, 6].map((n) => ({ id: "t" + n, label: "Mesa " + n, seats: 4 })),
    comandas: [],
    shifts: [],
    sales: [],
    parkedSales: [],
    quebras: [],
    movimentosCaixa: [],
    currentShiftId: null,
  };
}

function withDefaults(raw) {
  const seed = buildSeedStore();
  const rc = raw?.config || {};
  return {
    ...seed,
    ...raw,
    config: {
      ...seed.config,
      ...rc,
      modules: { ...seed.config.modules, ...(rc.modules || {}) },
      impressao: { ...seed.config.impressao, ...(rc.impressao || {}) },
      iva: { ...seed.config.iva, ...(rc.iva || {}) },
      contas: {
        dinheiro: { ...seed.config.contas.dinheiro, ...(rc.contas?.dinheiro || {}) },
        mpesa: { ...seed.config.contas.mpesa, ...(rc.contas?.mpesa || {}) },
        emola: { ...seed.config.contas.emola, ...(rc.contas?.emola || {}) },
      },
      empresa: { ...seed.config.empresa, ...(rc.empresa || {}) },
    },
    products: raw?.products || seed.products,
    categories: raw?.categories && raw.categories.length ? raw.categories : seed.categories,
    clients: raw?.clients || seed.clients,
    employees: raw?.employees || seed.employees,
    suppliers: raw?.suppliers || [],
    purchases: raw?.purchases || [],
    tables: raw?.tables || seed.tables,
    comandas: raw?.comandas || [],
    shifts: raw?.shifts || [],
    sales: raw?.sales || [],
    parkedSales: raw?.parkedSales || [],
    quebras: raw?.quebras || [],
    movimentosCaixa: raw?.movimentosCaixa || [],
    currentShiftId: raw?.currentShiftId ?? null,
  };
}

// ================================================================
function PDVInner({ db, dbReady, business, onExitBusiness, isSuperAdmin }) {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [tab, setTab] = useState("vender");
  const [sessionEmployeeId, setSessionEmployeeId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [offline, setOffline] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const storePath = "stores/" + business.id;
  const localKey = STORAGE_KEY + ":" + business.id;

  useEffect(() => {
    if (!dbReady) return;
    let unsub = null;
    const loadLocal = () => {
      try {
        const raw = localStorage.getItem(localKey);
        setStore(withDefaults(raw ? JSON.parse(raw) : { config: { businessName: business.name } }));
      } catch (e) {
        setStore(withDefaults({ config: { businessName: business.name } }));
      }
      setLoading(false);
    };
    if (db) {
      const ref = db.doc(storePath);
      unsub = ref.onSnapshot(
        (snap) => {
          if (snap.exists) {
            setStore(withDefaults(snap.data()));
          } else {
            const seeded = withDefaults({ config: { businessName: business.name } });
            setStore(seeded);
            ref.set(seeded).catch(() => {});
          }
          setLoading(false);
        },
        () => loadLocal()
      );
    } else {
      loadLocal();
    }
    return () => {
      if (unsub) unsub();
    };
  }, [dbReady, db, storePath, localKey, business.name]);

  const persist = useCallback(
    async (next) => {
      const trimmed = next.sales && next.sales.length > MAX_SALES_KEPT ? { ...next, sales: next.sales.slice(-MAX_SALES_KEPT) } : next;
      setStore(trimmed);
      try {
        localStorage.setItem(localKey, JSON.stringify(trimmed));
      } catch (e) {
        // espelho local é best-effort
      }
      if (db) {
        try {
          await db.doc(storePath).set(trimmed);
          setSaveError("");
          setOffline(false);
        } catch (e) {
          setOffline(true);
          setSaveError("Sem ligação — a trabalhar offline. Os dados ficam guardados neste dispositivo e serão enviados quando a ligação voltar.");
        }
      } else {
        try {
          localStorage.setItem(localKey, JSON.stringify(trimmed));
          setSaveError("");
        } catch (e) {
          setSaveError("Erro ao guardar os dados.");
        }
      }
    },
    [db, storePath, localKey]
  );

  // cópia de segurança automática: guarda um instantâneo por dia no dispositivo
  useEffect(() => {
    if (!store) return;
    try {
      const hoje = todayStr();
      const chave = localKey + ":backup:" + hoje;
      if (!localStorage.getItem(chave)) {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(localKey + ":backup:") && k < localKey + ":backup:" + new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
          .forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(chave, JSON.stringify(store));
      }
    } catch (e) {
      // sem espaço: ignora
    }
  }, [store && store.sales && store.sales.length, localKey]);

  const showToast = useCallback((msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2400);
  }, []);

  if (loading || !store) {
    return (
      <div style={{ background: BG, color: INK }} className="flex items-center justify-center p-10 text-sm min-h-[400px]">
        A carregar o sistema…
      </div>
    );
  }

  if (!sessionEmployeeId) {
    return (
      <LoginGate
        employees={store.employees}
        businessName={store.config.businessName}
        onLogin={(id) => setSessionEmployeeId(id)}
      />
    );
  }

  const employee = store.employees.find((e) => e.id === sessionEmployeeId) || store.employees[0];
  const role = employee?.role || "dono";
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
    ...store.products.filter((p) => nearExpiry(p).length > 0).map((p) => ({ text: `${p.name} — lote a vencer em breve`, color: GOLD, tab: "estoque" })),
    ...store.clients
      .filter((c) => c.creditLimit > 0 && c.debts.reduce((s, d) => s + d.amount, 0) > c.creditLimit)
      .map((c) => ({ text: `${c.name} passou o limite de fiado`, color: BRICK, tab: "clientes" })),
  ];

  // -------- turno / caixa --------
  const openShift = async (openingCash) => {
    const shift = { id: uid(), openedAt: new Date().toISOString(), openingCash, closedAt: null, closingCash: null };
    await persist({ ...store, shifts: [...store.shifts, shift], currentShiftId: shift.id });
    showToast("Caixa aberto");
  };
  const closeShift = async (countedCash) => {
    const shiftSales = store.sales.filter((s) => s.shiftId === store.currentShiftId && s.status !== "void");
    const cashIn = shiftSales.reduce(
      (sum, s) => sum + s.payments.filter((p) => p.method === "dinheiro").reduce((a, p) => a + p.amount, 0),
      0
    );
    const movs = store.movimentosCaixa.filter((m) => m.shiftId === store.currentShiftId);
    const entradas = movs.filter((m) => m.type === "entrada").reduce((s, m) => s + m.amount, 0);
    const saidas = movs.filter((m) => m.type === "saida").reduce((s, m) => s + m.amount, 0);
    const expected = (currentShift?.openingCash || 0) + cashIn + entradas - saidas;
    const nextShifts = store.shifts.map((s) =>
      s.id === store.currentShiftId
        ? { ...s, closedAt: new Date().toISOString(), closingCash: countedCash, expectedCash: expected }
        : s
    );
    await persist({ ...store, shifts: nextShifts, currentShiftId: null });
    showToast("Caixa fechado");
  };

  const registerQuebra = async ({ productId, variantId, qty, motivo }) => {
    const product = store.products.find((p) => p.id === productId);
    if (!product || !qty) return;
    const nextProducts = applyDecrements(store.products, [{ productId, variantId, qty }]);
    const custoImpacto = (product.cost || 0) * qty;
    const record = {
      id: uid(),
      productId,
      variantId: variantId || null,
      qty,
      motivo,
      date: new Date().toISOString(),
      custoImpacto,
      shiftId: store.currentShiftId,
    };
    await persist({
      ...store,
      products: nextProducts,
      quebras: [...store.quebras, record],
      audit: [...(store.audit || []), makeAudit(employee, "QUEBRA", (product.name || "") + " × " + qty + " — " + motivo, custoImpacto)].slice(-600),
    });
    showToast("Quebra registada");
  };
  const registerMovimento = async ({ type, amount, motivo, categoria }) => {
    if (!store.currentShiftId || !amount) {
      showToast("Abra o caixa primeiro", "warn");
      return;
    }
    const record = { id: uid(), type, amount, motivo, categoria: categoria || "Outros", date: new Date().toISOString(), shiftId: store.currentShiftId, employeeId: employee.id };
    await persist({
      ...store,
      movimentosCaixa: [...store.movimentosCaixa, record],
      audit: [...(store.audit || []), makeAudit(employee, type === "entrada" ? "ENTRADA CAIXA" : "SAÍDA CAIXA", (categoria || "Outros") + (motivo ? " — " + motivo : ""), amount)].slice(-600),
    });
    showToast(type === "entrada" ? "Entrada registada" : "Saída registada");
  };

  // -------- venda --------
  const finalizeSale = async ({ items, total, discount, payments, clientId, tableId, pontosUsados }) => {
    const doc = nextDocNumber(store.config);
    const sale = {
      id: uid(),
      numero: doc.numero,
      date: new Date().toISOString(),
      items,
      total,
      discount: discount || 0,
      payments,
      clientId: clientId || null,
      employeeId: employee.id,
      shiftId: store.currentShiftId,
      tableId: tableId || null,
      status: "completed",
    };
    const decrements = items.map((it) => ({ productId: it.productId, variantId: it.variantId, qty: it.qty }));
    const nextProducts = applyDecrements(store.products, decrements);

    const fiadoAmount = payments.filter((p) => p.method === "fiado").reduce((s, p) => s + p.amount, 0);
    let nextClients = store.clients;
    if (fiadoAmount > 0 && clientId) {
      nextClients = store.clients.map((c) =>
        c.id === clientId
          ? { ...c, debts: [...c.debts, { id: uid(), amount: fiadoAmount, date: sale.date, saleId: sale.id }] }
          : c
      );
    }
    const pontosGanhos = Math.floor(total / (store.config.pontosPorMT || 50));
    if (clientId) {
      nextClients = nextClients.map((c) => (c.id === clientId ? { ...c, points: Math.max(0, (c.points || 0) - (pontosUsados || 0) + pontosGanhos) } : c));
    }
    sale.pontosUsados = pontosUsados || 0;
    sale.pontosGanhos = clientId ? pontosGanhos : 0;

    let nextComandas = store.comandas;
    if (tableId) {
      nextComandas = store.comandas.filter((c) => c.tableId !== tableId);
    }

    const auditEntries = [makeAudit(employee, "VENDA", "Documento " + sale.numero + (tableId ? " (mesa)" : ""), total)];
    if (discount > 0) auditEntries.push(makeAudit(employee, "DESCONTO", "Desconto na venda " + sale.numero, discount));

    await persist({
      ...store,
      config: { ...store.config, docSeries: doc.nextSeries },
      products: nextProducts,
      clients: nextClients,
      sales: [...store.sales, sale],
      comandas: nextComandas,
      audit: [...(store.audit || []), ...auditEntries].slice(-600),
    });
    setLastSale(sale);
    showToast("Venda " + sale.numero + " registada");
    return sale;
  };

  const voidSale = async (saleId, reason) => {
    const sale = store.sales.find((s) => s.id === saleId);
    if (!sale) return;
    const restore = sale.items.map((it) => ({ productId: it.productId, variantId: it.variantId, qty: -it.qty }));
    const nextProducts = applyDecrements(store.products, restore);
    const nextSales = store.sales.map((s) => (s.id === saleId ? { ...s, status: "void", voidReason: reason } : s));
    await persist({
      ...store,
      products: nextProducts,
      sales: nextSales,
      audit: [...(store.audit || []), makeAudit(employee, "CANCELAMENTO", "Venda " + (sale.numero || saleId) + " — motivo: " + (reason || "não indicado"), sale.total)].slice(-600),
    });
    showToast("Venda cancelada e stock devolvido", "warn");
  };

  return (
    <div
      style={{ background: BG, color: INK, fontFamily: "system-ui, sans-serif" }}
      className="w-full min-h-[620px] rounded-lg overflow-hidden flex flex-col relative"
    >
      {/* cabeçalho */}
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
          {offline && (
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
          <button
            onClick={() => setShowUserSwitch(true)}
            style={{ background: "rgba(255,255,255,0.15)" }}
            className="text-xs px-2.5 py-1.5 rounded flex items-center gap-1"
          >
            <Lock size={12} /> {employee?.name}
          </button>
          <button onClick={() => setSessionEmployeeId(null)} style={{ background: "rgba(255,255,255,0.15)" }} className="p-1.5 rounded">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* abas */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, background: CARD }} className="flex overflow-x-auto">
        {tabDefs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ color: active ? TEAL : MUTED, borderBottom: active ? `2px solid ${GOLD}` : "2px solid transparent" }}
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
          <div style={{ background: SOFTGOLD, borderColor: GOLD }} className="border rounded-lg p-4 text-sm mb-4">
            O caixa está fechado. Abra o caixa na aba Caixa para começar a registar vendas.
          </div>
        )}
        {tab === "vender" && (
          <VenderTab
            store={store}
            persist={persist}
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
            persist={persist}
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
        {tab === "produtos" && <ProdutosTab store={store} persist={persist} modules={modules} onGoEstoque={() => setTab("estoque")} />}
        {tab === "estoque" && (
          <EstoqueTab store={store} persist={persist} showToast={showToast} registerQuebra={registerQuebra} onGoCompras={() => setTab("compras")} />
        )}
        {tab === "clientes" && <ClientesTab store={store} persist={persist} />}
        {tab === "compras" && <ComprasTab store={store} persist={persist} />}
        {tab === "equipa" && <EquipaTab store={store} persist={persist} />}
        {tab === "balanco" && <BalancoTab store={store} />}
        {tab === "config" && <ConfigTab store={store} persist={persist} />}
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
        <UserSwitchModal employees={store.employees} onSelect={(id) => { setSessionEmployeeId(id); setShowUserSwitch(false); }} onClose={() => setShowUserSwitch(false)} />
      )}
    </div>
  );
}

function BusinessSelector({ businesses, onOpen, onCreate, onRename, onToggleActive, onDelete, saving, error }) {
  const [newName, setNewName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const activeCount = businesses.filter((b) => b.active !== false).length;

  return (
    <div style={{ background: BG, color: INK, fontFamily: "system-ui, sans-serif" }} className="min-h-screen p-5">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: 52 }} />
          <div>
            <div className="text-xs" style={{ color: MUTED }}>
              {BRAND_TAGLINE} · Painel do administrador
            </div>
            <div className="text-2xl font-semibold" style={{ color: TEAL }}>
              Contas de negócio
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Contas criadas" value={businesses.length} />
          <StatCard label="Contas activas" value={activeCount} />
        </div>

        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
          <div className="text-sm font-semibold mb-2">Nova conta de negócio</div>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome do negócio (ex: Padaria da Maria)"
              style={{ borderColor: BORDER }}
              className="flex-1 border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                if (newName.trim()) {
                  onCreate(newName.trim());
                  setNewName("");
                }
              }}
              disabled={saving}
              style={{ background: TEAL, color: "#fff" }}
              className="rounded px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Criar
            </button>
          </div>
          <div className="text-xs mt-2" style={{ color: MUTED }}>
            Cada conta tem os seus próprios produtos, stock, vendas, clientes e funcionários, totalmente separados das outras.
          </div>
        </div>

        {error && (
          <div style={{ background: "#FBE9E7", color: BRICK }} className="rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {businesses.length === 0 && (
            <div style={{ background: CARD, borderColor: BORDER, color: MUTED }} className="border rounded-lg p-6 text-center text-sm">
              Ainda não há contas. Crie a primeira acima.
            </div>
          )}
          {businesses.map((b) => {
            const active = b.active !== false;
            return (
              <div key={b.id} style={{ background: CARD, borderColor: BORDER, opacity: active ? 1 : 0.6 }} className="border rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {b.name}
                      <span
                        style={{ background: active ? "#E4F4EA" : "#F1F1F1", color: active ? GREEN : MUTED }}
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase"
                      >
                        {active ? "Activa" : "Suspensa"}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: MUTED }}>
                      Criada em {new Date(b.createdAt).toLocaleDateString("pt-PT")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        const n = prompt("Novo nome do negócio", b.name);
                        if (n && n.trim()) onRename(b.id, n.trim());
                      }}
                      style={{ color: TEAL }}
                      className="text-xs font-medium"
                    >
                      Renomear
                    </button>
                    <button onClick={() => onToggleActive(b.id)} style={{ color: active ? MUTED : GREEN }} className="text-xs font-medium">
                      {active ? "Suspender" : "Reactivar"}
                    </button>
                    <button
                      onClick={() => (confirmDelete === b.id ? onDelete(b.id) : setConfirmDelete(b.id))}
                      style={{ color: BRICK }}
                      className="text-xs font-medium"
                    >
                      {confirmDelete === b.id ? "Confirmar apagar?" : "Apagar"}
                    </button>
                    <button
                      onClick={() => onOpen(b)}
                      disabled={!active}
                      style={{ background: TEAL, color: "#fff" }}
                      className="rounded px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PDVRoot({ db, dbReady }) {
  const [businesses, setBusinesses] = useState([]);
  const [registryLoaded, setRegistryLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const localRegKey = STORAGE_KEY + ":registry";

  useEffect(() => {
    if (!dbReady) return;
    let unsub = null;
    const loadLocal = () => {
      try {
        const raw = localStorage.getItem(localRegKey);
        setBusinesses(raw ? JSON.parse(raw) : []);
      } catch (e) {
        setBusinesses([]);
      }
      setRegistryLoaded(true);
    };
    if (db) {
      unsub = db.doc(REGISTRY_PATH).onSnapshot(
        (snap) => {
          setBusinesses(snap.exists && Array.isArray(snap.data().list) ? snap.data().list : []);
          setRegistryLoaded(true);
        },
        () => loadLocal()
      );
    } else {
      loadLocal();
    }
    return () => {
      if (unsub) unsub();
    };
  }, [dbReady, db, localRegKey]);

  const saveRegistry = async (list) => {
    setBusinesses(list);
    setSaving(true);
    if (db) {
      try {
        await db.doc(REGISTRY_PATH).set({ list });
        setError("");
      } catch (e) {
        setError("Não foi possível guardar a lista de contas (" + (e && e.code ? e.code : "erro") + ").");
      }
    } else {
      try {
        localStorage.setItem(localRegKey, JSON.stringify(list));
        setError("");
      } catch (e) {
        setError("Erro ao guardar a lista de contas.");
      }
    }
    setSaving(false);
  };

  const createBusiness = (name) => saveRegistry([...businesses, { id: uid(), name, createdAt: new Date().toISOString(), active: true }]);
  const renameBusiness = (id, name) => saveRegistry(businesses.map((b) => (b.id === id ? { ...b, name } : b)));
  const toggleActive = (id) => saveRegistry(businesses.map((b) => (b.id === id ? { ...b, active: b.active === false } : b)));
  const deleteBusiness = async (id) => {
    await saveRegistry(businesses.filter((b) => b.id !== id));
    if (db) db.doc("stores/" + id).delete().catch(() => {});
    try {
      localStorage.removeItem(STORAGE_KEY + ":" + id);
    } catch (e) {
      // ignora
    }
  };

  if (!registryLoaded) {
    return (
      <div style={{ background: BG, color: INK }} className="flex items-center justify-center min-h-screen text-sm">
        A carregar…
      </div>
    );
  }

  if (!selected) {
    return (
      <BusinessSelector
        businesses={businesses}
        saving={saving}
        error={error}
        onOpen={(b) => setSelected(b)}
        onCreate={createBusiness}
        onRename={renameBusiness}
        onToggleActive={toggleActive}
        onDelete={deleteBusiness}
      />
    );
  }

  return <PDVInner db={db} dbReady={dbReady} business={selected} isSuperAdmin onExitBusiness={() => setSelected(null)} />;
}

function PDV() {
  const [caps, setCaps] = useState({ db: null, assets: null, downloads: null, ready: false });

  useEffect(() => {
    const api = window.claude || { use: async () => null };
    Promise.all([api.use("db"), api.use("assets"), api.use("downloads")]).then(([db, assets, downloads]) => {
      setCaps({ db, assets, downloads, ready: true });
    });
  }, []);

  return (
    <CapsContext.Provider value={{ assets: caps.assets, downloads: caps.downloads }}>
      <PDVRoot db={caps.db} dbReady={caps.ready} />
    </CapsContext.Provider>
  );
}

// ================= Login / troca de utilizador =================
function EmployeePicker({ employees, onConfirm }) {
  const [pending, setPending] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const choose = (emp) => {
    const secret = emp.password || emp.pin;
    if (!secret) {
      onConfirm(emp.id);
      return;
    }
    setPending(emp);
    setPin("");
    setError("");
  };
  const confirmPin = () => {
    const secret = pending.password || pending.pin;
    if (pin === secret) onConfirm(pending.id);
    else setError("Senha incorrecta");
  };

  if (pending) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Senha de {pending.name}</div>
        <div className="text-xs" style={{ color: MUTED }}>{pending.email}</div>
        <input
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={{ borderColor: BORDER }}
          className="w-full border rounded px-2 py-1.5 text-sm"
          autoFocus
        />
        {error && <div style={{ color: BRICK }} className="text-xs">{error}</div>}
        <div className="flex gap-2">
          <button onClick={confirmPin} style={{ background: TEAL, color: "#fff" }} className="flex-1 rounded py-1.5 text-sm">
            Entrar
          </button>
          <button onClick={() => setPending(null)} style={{ borderColor: BORDER }} className="border rounded py-1.5 px-3 text-sm">
            Voltar
          </button>
        </div>
      </div>
    );
  }
  const visible = employees.filter((e) => e.active !== false);
  return (
    <div className="space-y-1.5">
      {visible.map((e) => (
        <button
          key={e.id}
          onClick={() => choose(e)}
          style={{ borderColor: BORDER }}
          className="w-full border rounded px-3 py-2 text-sm text-left flex justify-between items-center"
        >
          <span>{e.name}</span>
          <span style={{ color: MUTED }} className="text-xs flex items-center gap-1">
            {(e.password || e.pin) && <Lock size={11} />}
            {ROLE_LABELS[e.role] || e.role}
          </span>
        </button>
      ))}
    </div>
  );
}

function LoginGate({ employees, businessName, onLogin }) {
  return (
    <div style={{ background: BG, color: INK }} className="min-h-[560px] flex items-center justify-center p-6 rounded-lg">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-5 w-full max-w-sm">
        <div className="text-center mb-4">
          <img src={BRAND_LOGO} alt={BRAND_NAME} style={{ height: 54 }} className="mx-auto mb-2" />
          <div className="text-xs" style={{ color: MUTED }}>
            Bem-vindo(a) a
          </div>
          <div className="text-lg font-semibold" style={{ color: TEAL }}>
            {businessName}
          </div>
        </div>
        <EmployeePicker employees={employees} onConfirm={onLogin} />
      </div>
    </div>
  );
}

function UserSwitchModal({ employees, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">Trocar utilizador</div>
        <EmployeePicker employees={employees} onConfirm={onSelect} />
      </div>
    </div>
  );
}

// ================= Notificações =================
function NotificationBell({ alerts, onGo }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} style={{ background: "rgba(255,255,255,0.15)" }} className="relative p-2 rounded">
        <Bell size={16} color="#fff" />
        {alerts.length > 0 && (
          <span style={{ background: BRICK }} className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] text-white flex items-center justify-center">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ background: CARD, borderColor: BORDER }} className="absolute right-0 mt-2 w-64 border rounded-lg shadow-lg z-50 max-h-72 overflow-auto text-left">
          <div style={{ borderBottom: `1px solid ${BORDER}`, color: INK }} className="p-2 text-xs font-semibold">
            Notificações
          </div>
          {alerts.length === 0 && (
            <div style={{ color: MUTED }} className="p-3 text-xs">
              Sem alertas por agora.
            </div>
          )}
          {alerts.map((a, i) => (
            <button
              key={i}
              onClick={() => {
                onGo(a.tab);
                setOpen(false);
              }}
              style={{ borderBottom: `1px solid ${BORDER}`, color: INK }}
              className="w-full text-left p-2 text-xs flex items-start gap-2 hover:bg-black/5"
            >
              <AlertTriangle size={13} style={{ color: a.color || GOLD, marginTop: 1 }} />
              <span>{a.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ================= Foto de produto =================
function PhotoPicker({ value, onChange }) {
  const { assets } = useContext(CapsContext);
  const [mode, setMode] = useState(assets ? "upload" : "url");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !assets) return;
    setUploading(true);
    try {
      const blob = await compressImageFile(file);
      const res = await assets.upload(blob, { type: "image/jpeg" });
      onChange("/_blob/" + res.id);
    } catch (err) {
      // ignora silenciosamente
    }
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {value ? (
        <img src={value} alt="" style={{ borderColor: BORDER }} className="w-12 h-12 rounded object-cover border" />
      ) : (
        <div style={{ background: BG, borderColor: BORDER }} className="w-12 h-12 rounded border flex items-center justify-center">
          <ImageOff size={16} style={{ color: MUTED }} />
        </div>
      )}
      <div className="flex-1">
        <div className="flex gap-2 mb-1">
          {assets && (
            <>
              <button type="button" onClick={() => setMode("upload")} style={{ color: mode === "upload" ? TEAL : MUTED }} className="text-xs font-medium">
                Carregar do PC
              </button>
              <span style={{ color: MUTED }} className="text-xs">
                ·
              </span>
            </>
          )}
          <button type="button" onClick={() => setMode("url")} style={{ color: mode === "url" ? TEAL : MUTED }} className="text-xs font-medium flex items-center gap-1">
            <Link2 size={11} /> Usar URL
          </button>
        </div>
        {mode === "upload" && assets ? (
          <>
            <input type="file" accept="image/*" onChange={handleFile} className="text-xs w-full" disabled={uploading} />
            {uploading && (
              <div className="text-xs" style={{ color: MUTED }}>
                A carregar…
              </div>
            )}
          </>
        ) : (
          <div className="flex gap-1">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://…"
              style={{ borderColor: BORDER }}
              className="border rounded px-2 py-1 text-xs flex-1"
            />
            <button type="button" onClick={() => onChange(urlInput)} style={{ color: TEAL }} className="text-xs font-medium">
              Usar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ p, onClick, disabled, produtos, compact }) {
  const stock = getStock(p, produtos);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ background: CARD, borderColor: BORDER, opacity: disabled ? 0.45 : 1 }}
      className="border rounded-xl overflow-hidden text-left hover:shadow-md transition disabled:cursor-not-allowed flex flex-col"
    >
      <div style={{ background: BG }} className={"w-full flex items-center justify-center overflow-hidden " + (compact ? "aspect-[5/3]" : "aspect-[4/3]")}>
        {p.foto ? <img src={p.foto} alt={p.name} className="w-full h-full object-cover" /> : <Package size={compact ? 20 : 26} style={{ color: MUTED }} />}
      </div>
      <div className={compact ? "p-1.5" : "p-2.5"}>
        <div className={"font-medium leading-snug truncate " + (compact ? "text-xs" : "text-sm")}>{p.name}</div>
        <div style={{ color: isLowStock(p, produtos) ? BRICK : MUTED }} className="text-[10px] mt-0.5">
          {stock <= 0 ? "Sem stock" : `${stock}${p.unit !== "un" ? p.unit : " un"}`}
        </div>
        <div style={{ color: PRICE_GREEN }} className={"font-bold " + (compact ? "text-sm" : "text-base mt-1")}>
          {fmtMT(p.price)}
        </div>
      </div>
    </button>
  );
}

// ================= Checkout partilhado =================
function CheckoutPanel({ items, extraChargePct = 0, clients, canDiscount, onConfirm, label = "Total", paymentMethods, ivaConfig, config }) {
  const [discount, setDiscount] = useState(0);
  const [clientId, setClientId] = useState("");
  const [recebido, setRecebido] = useState("");
  const [usarPontos, setUsarPontos] = useState(false);
  const [split, setSplit] = useState(false);
  const [splitLines, setSplitLines] = useState([{ method: "dinheiro", amount: "" }]);

  const cliente = clients.find((c) => c.id === clientId);
  const valorPorPonto = (config && config.valorPorPonto) || 1;
  const pontosDisponiveis = cliente ? cliente.points || 0 : 0;
  const subtotal = items.reduce((s, l) => s + l.price * l.qty, 0);
  const serviceCharge = subtotal * (extraChargePct / 100);
  const descontoPontos = usarPontos ? Math.min(pontosDisponiveis * valorPorPonto, subtotal + serviceCharge) : 0;
  const pontosUsados = usarPontos ? Math.ceil(descontoPontos / valorPorPonto) : 0;
  const afterDiscount = Math.max(0, subtotal + serviceCharge - Number(discount || 0) - descontoPontos);
  const ivaRate = ivaConfig?.isento ? 0 : Number(ivaConfig?.taxa) || 0;
  const ivaOnTop = !ivaConfig?.isento && ivaRate > 0 && !ivaConfig?.precosIncluemIva;
  const ivaAmount = ivaOnTop ? afterDiscount * (ivaRate / 100) : 0;
  const ivaIncluded = !ivaConfig?.isento && ivaRate > 0 && ivaConfig?.precosIncluemIva;
  const total = afterDiscount + ivaAmount;

  const addSplitLine = () => setSplitLines((s) => [...s, { method: "dinheiro", amount: "" }]);
  const updateSplitLine = (i, field, val) => setSplitLines((s) => s.map((l, idx) => (idx === i ? { ...l, [field]: val } : l)));
  const removeSplitLine = (i) => setSplitLines((s) => s.filter((_, idx) => idx !== i));
  const splitSum = splitLines.reduce((s, l) => s + Number(l.amount || 0), 0);
  const needsClient = split ? splitLines.some((l) => l.method === "fiado") : false;

  const dividaActual = cliente ? (cliente.debts || []).reduce((a, d) => a + d.amount, 0) : 0;
  const limite = cliente ? cliente.creditLimit || 0 : 0;
  const fiadoBloqueado = !!cliente && limite > 0 && dividaActual + total > limite;
  const trocoDevido = Number(recebido || 0) - total;

  const confirmSingle = (methodId) => {
    if (methodId === "fiado" && !clientId) return;
    if (methodId === "fiado" && fiadoBloqueado) return;
    onConfirm({ total, discount: Number(discount || 0), payments: [{ method: methodId, amount: total }], clientId: clientId || null, pontosUsados });
  };
  const confirmSplit = () => {
    if (Math.round(splitSum) !== Math.round(total)) return;
    if (needsClient && !clientId) return;
    onConfirm({
      total,
      discount: Number(discount || 0),
      payments: splitLines.map((l) => ({ method: l.method, amount: Number(l.amount || 0) })),
      clientId: clientId || null,
      pontosUsados,
    });
  };

  return (
    <div>
      {extraChargePct > 0 && (
        <div className="flex justify-between text-xs mb-1" style={{ color: MUTED }}>
          <span>Serviço ({extraChargePct}%)</span>
          <span>{fmtMT(serviceCharge)}</span>
        </div>
      )}
      {canDiscount && (
        <div className="flex items-center gap-2 mb-2">
          <Percent size={13} style={{ color: MUTED }} />
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            placeholder="Desconto (MT)"
            style={{ borderColor: BORDER }}
            className="border rounded px-2 py-1 text-xs flex-1"
          />
        </div>
      )}
      {ivaOnTop && (
        <div className="flex justify-between text-xs mb-1" style={{ color: MUTED }}>
          <span>IVA ({ivaRate}%)</span>
          <span>+{fmtMT(ivaAmount)}</span>
        </div>
      )}
      {ivaIncluded && (
        <div className="text-xs mb-1" style={{ color: MUTED }}>
          IVA incluído ({ivaRate}%)
        </div>
      )}
      <div className="flex justify-between text-base font-semibold mb-2">
        <span>{label}</span>
        <span style={{ color: TEAL }}>{fmtMT(total)}</span>
      </div>

      <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm mb-2">
        <option value="">Cliente (necessário para fiado / pontos)</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {cliente && pontosDisponiveis > 0 && (
        <label className="flex items-center gap-2 text-xs mb-2" style={{ color: TEAL }}>
          <input type="checkbox" checked={usarPontos} onChange={(e) => setUsarPontos(e.target.checked)} />
          Usar {pontosDisponiveis} pontos ({fmtMT(pontosDisponiveis * valorPorPonto)} de desconto)
        </label>
      )}
      {descontoPontos > 0 && (
        <div className="flex justify-between text-xs mb-1" style={{ color: GOLD }}>
          <span>Desconto por pontos</span>
          <span>-{fmtMT(descontoPontos)}</span>
        </div>
      )}
      {fiadoBloqueado && (
        <div style={{ background: "#FBE9E7", color: BRICK }} className="rounded p-2 text-xs mb-2">
          Limite de crédito excedido: {fmtMT(dividaActual)} em dívida + {fmtMT(total)} ultrapassa o limite de {fmtMT(limite)}. O fiado está bloqueado para este cliente.
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          value={recebido}
          onChange={(e) => setRecebido(e.target.value)}
          placeholder="Valor recebido (MT)"
          style={{ borderColor: BORDER }}
          className="border rounded px-2 py-1.5 text-sm flex-1"
        />
        {recebido !== "" && (
          <div className="text-right shrink-0">
            <div className="text-[10px]" style={{ color: MUTED }}>
              Troco
            </div>
            <div style={{ color: trocoDevido < 0 ? BRICK : GREEN }} className="text-lg font-bold leading-none">
              {fmtMT(Math.max(0, trocoDevido))}
            </div>
          </div>
        )}
      </div>
      {recebido !== "" && trocoDevido < 0 && (
        <div className="text-xs mb-2" style={{ color: BRICK }}>
          Faltam {fmtMT(-trocoDevido)}
        </div>
      )}

      <button onClick={() => setSplit((s) => !s)} style={{ color: TEAL }} className="text-xs font-medium mb-2 flex items-center gap-1">
        <Split size={12} /> {split ? "Cancelar pagamento dividido" : "Dividir pagamento"}
      </button>

      {!split && (
        <div className="grid grid-cols-2 gap-1.5">
          {paymentMethods.map((p) => {
            const Icon = p.icon;
            const disabled = items.length === 0 || (p.id === "fiado" && (!clientId || fiadoBloqueado));
            return (
              <button
                key={p.id}
                onClick={() => confirmSingle(p.id)}
                disabled={disabled}
                id={p.id === "dinheiro" ? "pdv-finalizar-dinheiro" : undefined}
                style={{ background: p.id === "fiado" ? GOLD : TEAL, color: "#fff" }}
                className="flex items-center justify-center gap-1.5 rounded py-2 text-xs font-medium disabled:opacity-40"
              >
                <Icon size={13} />
                {p.label}
              </button>
            );
          })}
        </div>
      )}

      {split && (
        <div className="space-y-1.5">
          {splitLines.map((l, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <select value={l.method} onChange={(e) => updateSplitLine(i, "method", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-1.5 py-1 text-xs">
                {paymentMethods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={l.amount}
                onChange={(e) => updateSplitLine(i, "amount", e.target.value)}
                placeholder="Valor"
                style={{ borderColor: BORDER }}
                className="border rounded px-2 py-1 text-xs flex-1"
              />
              <button onClick={() => removeSplitLine(i)}>
                <X size={13} style={{ color: BRICK }} />
              </button>
            </div>
          ))}
          <button onClick={addSplitLine} style={{ color: TEAL }} className="text-xs font-medium">
            + adicionar forma de pagamento
          </button>
          <div className="text-xs" style={{ color: Math.round(splitSum) === Math.round(total) ? MUTED : BRICK }}>
            Somado: {fmtMT(splitSum)} / {fmtMT(total)}
          </div>
          <button
            onClick={confirmSplit}
            disabled={Math.round(splitSum) !== Math.round(total) || (needsClient && !clientId)}
            style={{ background: TEAL, color: "#fff" }}
            className="w-full rounded py-2 text-xs font-medium disabled:opacity-40"
          >
            Confirmar pagamento dividido
          </button>
        </div>
      )}
    </div>
  );
}

// ================= VENDER =================
function VenderTab({ store, persist, finalizeSale, voidSale, shiftOpen, canDiscount, canVoid, showToast, paymentMethods }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [variantPicker, setVariantPicker] = useState(null);
  const [showParked, setShowParked] = useState(false);
  const [voidTarget, setVoidTarget] = useState(null);
  const [vendaRapida, setVendaRapida] = useState(false);
  const { downloads: downloadsCap } = useContext(CapsContext);

  const q = query.trim().toLowerCase();
  const filtered = store.products.filter(
    (p) => p.active !== false && p.vendaDirecta !== false && (p.name.toLowerCase().includes(q) || (p.codigo || "").toLowerCase().includes(q))
  );

  // produtos mais vendidos (favoritos fixados)
  const favoritos = useMemo(() => {
    const agg = {};
    store.sales.filter((s) => s.status !== "void").forEach((s) => s.items.forEach((it) => (agg[it.productId] = (agg[it.productId] || 0) + it.qty)));
    return Object.entries(agg)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => store.products.find((p) => p.id === id))
      .filter((p) => p && p.active !== false && getStock(p, store.products) > 0)
      .slice(0, 8);
  }, [store.sales, store.products]);

  const vendaImediata = async (p) => {
    if (!shiftOpen) {
      showToast("Abra o caixa antes de vender", "warn");
      return;
    }
    if (getStock(p, store.products) <= 0) return;
    if (p.variants && p.variants.length) {
      setVariantPicker(p);
      return;
    }
    const qty = p.unit === "un" ? 1 : 1;
    await finalizeSale({
      items: [{ productId: p.id, variantId: null, name: p.name, qty, price: p.price, cost: p.cost }],
      total: p.price * qty,
      discount: 0,
      payments: [{ method: "dinheiro", amount: p.price * qty }],
      clientId: null,
    });
  };

  const addToCart = (p, variant) => {
    if (getStock(p, store.products) <= 0) return;
    if (p.variants && p.variants.length && !variant) {
      setVariantPicker(p);
      return;
    }
    const key = p.id + (variant ? variant.id : "");
    setCart((c) => {
      const existing = c.find((x) => x.productId === p.id && x.variantId === (variant?.id || null));
      if (existing) {
        return c.map((x) => (x === existing ? { ...x, qty: x.qty + (p.unit === "un" ? 1 : 0.5) } : x));
      }
      return [
        ...c,
        {
          lineId: key + uid(),
          productId: p.id,
          variantId: variant ? variant.id : null,
          name: p.name + (variant ? " (" + variant.label + ")" : ""),
          price: p.price,
          cost: p.cost,
          unit: p.unit,
          qty: p.unit === "un" ? 1 : 0.5,
        },
      ];
    });
    setVariantPicker(null);
  };

  const updateQty = (lineId, qty) => setCart((c) => c.map((l) => (l.lineId === lineId ? { ...l, qty: Math.max(0, qty) } : l)).filter((l) => l.qty > 0));
  const removeLine = (lineId) => setCart((c) => c.filter((l) => l.lineId !== lineId));

  const parkSale = () => {
    if (cart.length === 0) return;
    const parked = { id: uid(), cart, date: new Date().toISOString() };
    persist({ ...store, parkedSales: [...store.parkedSales, parked] });
    setCart([]);
    showToast("Venda colocada em espera");
  };
  const resumeSale = (parked) => {
    setCart(parked.cart);
    persist({ ...store, parkedSales: store.parkedSales.filter((p) => p.id !== parked.id) });
    setShowParked(false);
  };

  const handleConfirm = async ({ total, discount, payments, clientId, pontosUsados }) => {
    if (!shiftOpen) {
      showToast("Abra o caixa antes de vender", "warn");
      return;
    }
    await finalizeSale({
      items: cart.map((l) => ({ productId: l.productId, variantId: l.variantId, name: l.name, qty: l.qty, price: l.price, cost: l.cost })),
      total,
      discount,
      payments,
      clientId,
      pontosUsados,
    });
    setCart([]);
  };

  const recentSales = [...store.sales].reverse().slice(0, 8);

  // leitor de código de barras: deteta digitação muito rápida terminada em Enter
  useEffect(() => {
    let buf = "";
    let last = 0;
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const emCampo = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      // atalhos
      if (e.key === "F3") {
        e.preventDefault();
        const el = document.getElementById("pdv-busca");
        if (el) el.focus();
        return;
      }
      if (e.key === "Escape" && !emCampo) {
        setCart([]);
        return;
      }
      if (e.key === "F2") {
        e.preventDefault();
        const btn = document.getElementById("pdv-finalizar-dinheiro");
        if (btn) btn.click();
        return;
      }
      if (emCampo) return;
      const now = Date.now();
      if (now - last > 80) buf = "";
      last = now;
      if (e.key === "Enter") {
        if (buf.length >= 3) {
          const found = store.products.find((p) => (p.codigo || "").toLowerCase() === buf.toLowerCase());
          if (found) {
            addToCart(found);
            showToast(found.name + " adicionado");
          } else {
            showToast("Código não encontrado: " + buf, "warn");
          }
        }
        buf = "";
        return;
      }
      if (e.key.length === 1) buf += e.key;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [store.products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      <div className="sm:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <input
            id="pdv-busca"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procurar produto ou ler código de barras… (F3)"
            style={{ borderColor: BORDER, background: CARD }}
            className="flex-1 border rounded px-3 py-2 text-sm outline-none"
          />
          <button onClick={() => setVendaRapida((v) => !v)} style={{ borderColor: vendaRapida ? GOLD : BORDER, color: vendaRapida ? GOLD : MUTED, background: vendaRapida ? SOFTGOLD : CARD }} className="border rounded px-2.5 py-2 text-xs font-medium whitespace-nowrap">
            Venda rápida
          </button>
          {store.parkedSales.length > 0 && (
            <button onClick={() => setShowParked(true)} style={{ borderColor: BORDER, color: TEAL }} className="border rounded px-2.5 py-2 text-xs flex items-center gap-1">
              <PlayCircle size={13} /> {store.parkedSales.length} em espera
            </button>
          )}
        </div>
        {favoritos.length > 0 && !q && (
          <div className="mb-3">
            <div className="text-[11px] font-semibold mb-1.5" style={{ color: MUTED }}>
              MAIS VENDIDOS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {favoritos.map((p) => (
                <button
                  key={p.id}
                  onClick={() => (vendaRapida ? vendaImediata(p) : addToCart(p))}
                  style={{ background: SOFTGOLD, borderColor: GOLD, color: INK }}
                  className="border rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  {p.name} · {fmtMT(p.price)}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} compact produtos={store.products} disabled={getStock(p, store.products) <= 0} onClick={() => (vendaRapida ? vendaImediata(p) : addToCart(p))} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-sm" style={{ color: MUTED }}>
              Nenhum produto encontrado.
            </div>
          )}
        </div>

        {recentSales.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold mb-1.5" style={{ color: MUTED }}>
              Vendas recentes
            </div>
            <div className="space-y-1">
              {recentSales.map((s) => (
                <div
                  key={s.id}
                  style={{ background: CARD, borderColor: BORDER, opacity: s.status === "void" ? 0.5 : 1 }}
                  className="border rounded px-2.5 py-1.5 flex items-center justify-between text-xs"
                >
                  <span>
                    {s.numero ? s.numero + " · " : ""}
                    {new Date(s.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} · {fmtMT(s.total)}
                    {s.status === "void" && " · CANCELADA"}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <button onClick={() => imprimirReciboTermico(s, store, store.clients)} style={{ color: TEAL }} className="font-medium">
                      Imprimir
                    </button>
                    <button onClick={() => gerarReciboPDF(downloadsCap, s, store, store.clients)} disabled={!downloadsCap} style={{ color: MUTED }} className="font-medium disabled:opacity-40">
                      PDF
                    </button>
                    {canVoid && s.status !== "void" && (
                      <button onClick={() => setVoidTarget(s.id)} style={{ color: BRICK }} className="font-medium">
                        Cancelar
                      </button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sm:col-span-3">
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="text-base font-semibold">Venda actual</div>
            {cart.length > 0 && (
              <button onClick={parkSale} style={{ color: MUTED }} className="text-xs flex items-center gap-1">
                <PauseCircle size={13} /> Colocar em espera
              </button>
            )}
          </div>
          <div className="space-y-2.5 overflow-auto" style={{ maxHeight: "45vh" }}>
            {cart.length === 0 && (
              <div className="text-xs" style={{ color: MUTED }}>
                Toque num produto para adicionar.
              </div>
            )}
            {cart.map((l) => (
              <div key={l.lineId} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="truncate">{l.name}</div>
                  <div style={{ color: MUTED }} className="text-xs">
                    {fmtMT(l.price)} × {l.qty}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(l.lineId, l.qty - (l.unit === "un" ? 1 : 0.5))} style={{ borderColor: BORDER }} className="border rounded p-1">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-xs">{l.qty}</span>
                  <button onClick={() => updateQty(l.lineId, l.qty + (l.unit === "un" ? 1 : 0.5))} style={{ borderColor: BORDER }} className="border rounded p-1">
                    <Plus size={12} />
                  </button>
                  <button onClick={() => removeLine(l.lineId)} className="ml-1">
                    <Trash2 size={13} style={{ color: BRICK }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}` }} className="pt-2 mt-2">
            <CheckoutPanel items={cart} clients={store.clients} canDiscount={canDiscount} onConfirm={handleConfirm} paymentMethods={paymentMethods} ivaConfig={store.config.iva} config={store.config} />
          </div>
        </div>
      </div>

      {variantPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setVariantPicker(null)}>
          <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-3">Escolha a variante — {variantPicker.name}</div>
            <div className="grid grid-cols-3 gap-1.5">
              {variantPicker.variants.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock <= 0}
                  onClick={() => addToCart(variantPicker, v)}
                  style={{ borderColor: BORDER, opacity: v.stock <= 0 ? 0.4 : 1 }}
                  className="border rounded p-2 text-xs text-center"
                >
                  <div className="font-medium">{v.label}</div>
                  <div style={{ color: MUTED }}>{v.stock} un</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showParked && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowParked(false)}>
          <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-3">Vendas em espera</div>
            <div className="space-y-1.5">
              {store.parkedSales.map((p) => (
                <button key={p.id} onClick={() => resumeSale(p)} style={{ borderColor: BORDER }} className="w-full border rounded px-3 py-2 text-sm text-left flex justify-between">
                  <span>{p.cart.length} item(ns)</span>
                  <span style={{ color: MUTED }} className="text-xs">
                    {new Date(p.date).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {voidTarget && (
        <VoidModal
          onConfirm={(reason) => {
            voidSale(voidTarget, reason);
            setVoidTarget(null);
          }}
          onClose={() => setVoidTarget(null)}
        />
      )}
    </div>
  );
}

function VoidModal({ onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-2">Cancelar venda</div>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo do cancelamento"
          style={{ borderColor: BORDER }}
          className="w-full border rounded px-2 py-1.5 text-sm mb-3"
        />
        <button onClick={() => onConfirm(reason)} style={{ background: BRICK, color: "#fff" }} className="w-full rounded py-2 text-sm font-medium">
          Confirmar cancelamento
        </button>
      </div>
    </div>
  );
}

// ================= MESAS =================
function MesasTab({ store, persist, finalizeSale, shiftOpen, canDiscount, showToast, paymentMethods }) {
  const [openTableId, setOpenTableId] = useState(null);
  const [query, setQuery] = useState("");

  const comandaOf = (tableId) => store.comandas.find((c) => c.tableId === tableId);

  const openTable = (tableId) => {
    if (!comandaOf(tableId)) {
      const comanda = { id: uid(), tableId, items: [], openedAt: new Date().toISOString(), serviceChargePct: 10 };
      persist({ ...store, comandas: [...store.comandas, comanda] });
    }
    setOpenTableId(tableId);
  };

  const addItem = (tableId, p) => {
    const comanda = comandaOf(tableId);
    if (!comanda || getStock(p, store.products) <= 0) return;
    const existing = comanda.items.find((it) => it.productId === p.id);
    const nextItems = existing
      ? comanda.items.map((it) => (it.productId === p.id ? { ...it, qty: it.qty + 1 } : it))
      : [...comanda.items, { productId: p.id, name: p.name, price: p.price, cost: p.cost, qty: 1 }];
    persist({ ...store, comandas: store.comandas.map((c) => (c.id === comanda.id ? { ...c, items: nextItems } : c)) });
  };

  const changeItemQty = (tableId, productId, delta) => {
    const comanda = comandaOf(tableId);
    const nextItems = comanda.items.map((it) => (it.productId === productId ? { ...it, qty: Math.max(0, it.qty + delta) } : it)).filter((it) => it.qty > 0);
    persist({ ...store, comandas: store.comandas.map((c) => (c.id === comanda.id ? { ...c, items: nextItems } : c)) });
  };

  const cancelComanda = (tableId) => {
    persist({ ...store, comandas: store.comandas.filter((c) => c.tableId !== tableId) });
    setOpenTableId(null);
  };

  const closeComanda = async ({ total, discount, payments, clientId }) => {
    if (!shiftOpen) {
      showToast("Abra o caixa antes de fechar contas", "warn");
      return;
    }
    const comanda = comandaOf(openTableId);
    await finalizeSale({
      items: comanda.items.map((it) => ({ productId: it.productId, name: it.name, qty: it.qty, price: it.price, cost: it.cost })),
      total,
      discount,
      payments,
      clientId,
      tableId: openTableId,
    });
    setOpenTableId(null);
  };

  const filtered = store.products.filter((p) => p.active !== false && p.name.toLowerCase().includes(query.toLowerCase()));
  const openComanda = openTableId ? comandaOf(openTableId) : null;

  if (openTableId && openComanda) {
    const table = store.tables.find((t) => t.id === openTableId);
    return (
      <div>
        <button onClick={() => setOpenTableId(null)} style={{ color: TEAL }} className="text-sm font-medium mb-3 flex items-center gap-1">
          <ChevronLeft size={15} /> Voltar às mesas
        </button>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Procurar produto…"
              style={{ borderColor: BORDER, background: CARD }}
              className="w-full border rounded px-3 py-2 text-sm mb-3"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filtered.map((p) => (
                <ProductCard key={p.id} p={p} produtos={store.products} disabled={getStock(p, store.products) <= 0} onClick={() => addItem(openTableId, p)} />
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">{table?.label} — comanda</div>
              <div className="space-y-2 mb-2 max-h-52 overflow-auto">
                {openComanda.items.length === 0 && (
                  <div className="text-xs" style={{ color: MUTED }}>
                    Sem itens ainda.
                  </div>
                )}
                {openComanda.items.map((it) => (
                  <div key={it.productId} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0 truncate">{it.name}</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => changeItemQty(openTableId, it.productId, -1)} style={{ borderColor: BORDER }} className="border rounded p-1">
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-xs">{it.qty}</span>
                      <button onClick={() => changeItemQty(openTableId, it.productId, 1)} style={{ borderColor: BORDER }} className="border rounded p-1">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => cancelComanda(openTableId)} style={{ color: BRICK }} className="text-xs font-medium mb-3">
                Cancelar comanda
              </button>
              <div style={{ borderTop: `1px solid ${BORDER}` }} className="pt-2">
                <CheckoutPanel
                  items={openComanda.items}
                  extraChargePct={openComanda.serviceChargePct}
                  clients={store.clients}
                  canDiscount={canDiscount}
                  onConfirm={closeComanda}
                  label="Total da mesa"
                  paymentMethods={paymentMethods}
                  ivaConfig={store.config.iva}
                  config={store.config}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const addMesa = () => {
    const n = store.tables.length + 1;
    persist({ ...store, tables: [...store.tables, { id: uid(), label: "Mesa " + n, seats: 4 }] });
  };
  const removeMesa = (id) => {
    if (comandaOf(id)) return;
    persist({ ...store, tables: store.tables.filter((t) => t.id !== id), comandas: store.comandas.filter((c) => c.tableId !== id) });
  };
  const renameMesa = (id) => {
    const t = store.tables.find((x) => x.id === id);
    const nome = prompt("Nome da mesa", t ? t.label : "");
    if (nome && nome.trim()) persist({ ...store, tables: store.tables.map((x) => (x.id === id ? { ...x, label: nome.trim() } : x)) });
  };
  const ocupadas = store.tables.filter((t) => comandaOf(t.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-base font-semibold">
          Mesas <span className="text-xs font-normal" style={{ color: MUTED }}>({ocupadas} ocupadas de {store.tables.length})</span>
        </div>
        <div className="flex gap-2">
          <button onClick={addMesa} style={{ background: GREEN, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1">
            <Plus size={13} /> Adicionar mesa
          </button>
          <button
            onClick={() => {
              const livres = store.tables.filter((t) => !comandaOf(t.id));
              if (livres.length) removeMesa(livres[livres.length - 1].id);
            }}
            disabled={store.tables.every((t) => comandaOf(t.id))}
            style={{ background: BRICK, color: "#fff" }}
            className="rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1 disabled:opacity-40"
          >
            <Minus size={13} /> Remover mesa livre
          </button>
        </div>
      </div>
      <div className="text-xs" style={{ color: MUTED }}>
        Toque longo não é preciso: use "Renomear" em cada mesa. Mesas ocupadas não podem ser removidas.
      </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {store.tables.map((t) => {
        const comanda = comandaOf(t.id);
        const total = comanda ? comanda.items.reduce((s, it) => s + it.price * it.qty, 0) : 0;
        return (
          <div key={t.id} style={{ background: comanda ? SOFTGOLD : CARD, borderColor: comanda ? GOLD : BORDER }} className="border rounded-lg p-3 text-center relative">
            <button onClick={() => openTable(t.id)} className="w-full">
              <div className="text-sm font-semibold">{t.label}</div>
              <div style={{ color: comanda ? GOLD : MUTED }} className="text-xs mt-1">
                {comanda ? `Ocupada · ${fmtMT(total)}` : "Livre"}
              </div>
            </button>
            <div className="flex justify-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid " + BORDER }}>
              <button onClick={() => renameMesa(t.id)} style={{ color: TEAL }} className="text-[10px] font-medium">
                Renomear
              </button>
              {!comanda && (
                <button onClick={() => removeMesa(t.id)} style={{ color: BRICK }} className="text-[10px] font-medium">
                  Remover
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}
function CategoriasModal({ categories, onAdd, onRemove, onClose }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">Categorias</div>
        <div className="flex gap-2 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nova categoria"
            style={{ borderColor: BORDER }}
            className="flex-1 border rounded px-2 py-1.5 text-sm"
          />
          <button
            onClick={() => {
              if (name.trim()) {
                onAdd(name.trim());
                setName("");
              }
            }}
            style={{ background: TEAL, color: "#fff" }}
            className="rounded px-3 py-1.5 text-sm"
          >
            Adicionar
          </button>
        </div>
        <div className="space-y-1 max-h-56 overflow-auto">
          {categories.map((c) => (
            <div key={c} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-1.5 text-sm flex items-center justify-between">
              <span>{c}</span>
              <button onClick={() => onRemove(c)}>
                <X size={14} style={{ color: BRICK }} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-xs" style={{ color: MUTED }}>
              Ainda não há categorias.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const UNIDADES = [
  { id: "un", label: "un (Unidade)" },
  { id: "kg", label: "kg (Quilograma)" },
  { id: "g", label: "g (Grama)" },
  { id: "l", label: "L (Litro)" },
  { id: "ml", label: "ml (Mililitro)" },
  { id: "cx", label: "cx (Caixa)" },
  { id: "pct", label: "pct (Pacote)" },
  { id: "dz", label: "dz (Dúzia)" },
];
const IVA_TAXAS = [0, 5, 16];

function ProdutosTab({ store, persist, modules, onGoEstoque }) {
  const blank = {
    tipo: "simples",
    vendaDirecta: true,
    name: "",
    codigo: "",
    category: "",
    unit: "un",
    qtdItens: 1,
    ivaTaxa: "",
    price: "",
    cost: "",
    minStock: "",
    prazoReembolso: 0,
    foto: "",
    parentId: "",
    consumo: 1,
    ingredientes: [],
    addEstoque: false,
    estoqueQtd: "",
    estoqueCustoTotal: "",
    estoqueValidade: "",
    estoqueFornecedor: "",
  };
  const [form, setForm] = useState(blank);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showCategorias, setShowCategorias] = useState(false);
  const [ingSel, setIngSel] = useState({ productId: "", qty: "" });
  const [erro, setErro] = useState("");

  const categories = store.categories && store.categories.length ? store.categories : [...new Set(store.products.map((p) => p.category).filter(Boolean))].sort();
  const activeCount = store.products.filter((p) => p.active !== false).length;
  const inactiveCount = store.products.length - activeCount;
  const filteredProducts = store.products.filter(
    (p) =>
      (p.name.toLowerCase().includes(query.toLowerCase()) || (p.codigo || "").toLowerCase().includes(query.toLowerCase())) &&
      (!categoryFilter || p.category === categoryFilter) &&
      (statusFilter === "todos" || (statusFilter === "ativos" ? p.active !== false : p.active === false))
  );
  const valorCatalogo = store.products.reduce((s, p) => s + (p.cost || 0) * getStock(p, store.products), 0);
  const possiveisPais = store.products.filter((p) => p.tipo !== "variacao" && p.tipo !== "composicao" && p.id !== editingId);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validar = () => {
    if (!form.name.trim()) return "Indique o nome do produto.";
    if (!form.price && form.vendaDirecta) return "Indique o preço de venda.";
    if (form.tipo === "variacao" && !form.parentId) return "Escolha o produto-pai de onde sai o stock.";
    if (form.tipo === "variacao" && (Number(form.consumo) || 0) <= 0) return "A quantidade consumida do produto-pai tem de ser maior que zero.";
    if (form.tipo === "composicao" && form.ingredientes.length === 0) return "Adicione pelo menos um ingrediente à composição.";
    return "";
  };

  const construirProduto = (id) => {
    const p = {
      id: id || uid(),
      tipo: form.tipo,
      vendaDirecta: form.vendaDirecta,
      name: form.name.trim(),
      codigo: (form.codigo || "").trim(),
      category: form.category || "Geral",
      unit: form.unit,
      qtdItens: Number(form.qtdItens) || 1,
      ivaTaxa: form.ivaTaxa === "" ? null : Number(form.ivaTaxa),
      price: Number(form.price) || 0,
      cost: Number(form.cost) || 0,
      minStock: Number(form.minStock) || 0,
      prazoReembolso: Number(form.prazoReembolso) || 0,
      foto: form.foto || "",
      active: true,
    };
    if (form.tipo === "variacao") {
      p.parentId = form.parentId;
      p.consumo = Number(form.consumo) || 1;
    } else if (form.tipo === "composicao") {
      p.ingredientes = form.ingredientes;
      const custoCalc = form.ingredientes.reduce((a, ing) => {
        const prod = store.products.find((x) => x.id === ing.productId);
        return a + (prod ? (prod.cost || 0) * (Number(ing.qty) || 0) : 0);
      }, 0);
      if (!p.cost) p.cost = custoCalc;
    } else if (form.addEstoque && !id) {
      const qtd = Number(form.estoqueQtd) || 0;
      const custoTotal = Number(form.estoqueCustoTotal) || 0;
      if (qtd > 0 && custoTotal > 0) p.cost = custoTotal / qtd;
      if (form.estoqueValidade) p.batches = [{ id: uid(), qty: qtd, expiryDate: form.estoqueValidade }];
      else p.stock = qtd;
      p.fornecedorId = form.estoqueFornecedor || "";
    } else if (!id) {
      p.stock = 0;
    }
    return p;
  };

  const submit = () => {
    const e = validar();
    if (e) {
      setErro(e);
      return;
    }
    setErro("");
    if (editingId) {
      const antigo = store.products.find((x) => x.id === editingId);
      const novo = construirProduto(editingId);
      // preserva o stock existente ao editar
      if (antigo.batches) novo.batches = antigo.batches;
      else if (antigo.variants) novo.variants = antigo.variants;
      else novo.stock = antigo.stock || 0;
      novo.active = antigo.active !== false;
      persist({ ...store, products: store.products.map((p) => (p.id === editingId ? novo : p)) });
      setEditingId(null);
    } else {
      const novo = construirProduto(null);
      let next = { ...store, products: [...store.products, novo] };
      if (form.tipo === "simples" && form.addEstoque && Number(form.estoqueQtd) > 0) {
        const compra = {
          id: uid(),
          supplierId: form.estoqueFornecedor || "",
          date: new Date().toISOString(),
          items: [{ productId: novo.id, qty: Number(form.estoqueQtd), cost: novo.cost }],
          total: Number(form.estoqueCustoTotal) || 0,
        };
        next = { ...next, purchases: [...store.purchases, compra] };
      }
      persist(next);
    }
    setForm(blank);
    setShowForm(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({
      ...blank,
      tipo: p.tipo || "simples",
      vendaDirecta: p.vendaDirecta !== false,
      name: p.name || "",
      codigo: p.codigo || "",
      category: p.category || "",
      unit: p.unit || "un",
      qtdItens: p.qtdItens || 1,
      ivaTaxa: p.ivaTaxa === null || p.ivaTaxa === undefined ? "" : p.ivaTaxa,
      price: p.price || "",
      cost: p.cost || "",
      minStock: p.minStock || "",
      prazoReembolso: p.prazoReembolso || 0,
      foto: p.foto || "",
      parentId: p.parentId || "",
      consumo: p.consumo || 1,
      ingredientes: p.ingredientes || [],
    });
    setShowForm(true);
    setErro("");
  };

  const removeProduct = (id) => {
    const usado = store.products.find((p) => (p.tipo === "variacao" && p.parentId === id) || (p.ingredientes || []).some((i) => i.productId === id));
    if (usado) {
      setErro('Não é possível apagar: o produto "' + usado.name + '" depende deste.');
      return;
    }
    persist({ ...store, products: store.products.filter((p) => p.id !== id) });
  };
  const updateProduct = (id, fields) => persist({ ...store, products: store.products.map((p) => (p.id === id ? { ...p, ...fields } : p)) });
  const addCategory = (name) => {
    if (categories.includes(name)) return;
    persist({ ...store, categories: [...categories, name].sort() });
  };
  const removeCategory = (name) => persist({ ...store, categories: categories.filter((c) => c !== name) });

  const addIngrediente = () => {
    if (!ingSel.productId || !(Number(ingSel.qty) > 0)) return;
    set("ingredientes", [...form.ingredientes, { productId: ingSel.productId, qty: Number(ingSel.qty) }]);
    setIngSel({ productId: "", qty: "" });
  };

  const custoComposicao = form.ingredientes.reduce((a, ing) => {
    const prod = store.products.find((x) => x.id === ing.productId);
    return a + (prod ? (prod.cost || 0) * ing.qty : 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div style={{ background: "#7C3AED", color: "#fff" }} className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
            P
          </div>
          <div className="text-base font-semibold">Gestão de Produtos</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCategorias(true)} style={{ background: "#D9642C", color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            Categorias
          </button>
          <button onClick={onGoEstoque} style={{ background: "#5B4FE0", color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            Importar
          </button>
          <button
            onClick={() => {
              setShowForm((s) => !s);
              setEditingId(null);
              setForm(blank);
              setErro("");
            }}
            style={{ background: GREEN, color: "#fff" }}
            className="rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1"
          >
            <Plus size={13} /> Novo produto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        <StatCard label="Total Produtos" value={store.products.length} />
        <StatCard label="Ativos" value={activeCount} />
        <StatCard label="Inativos" value={inactiveCount} />
        <StatCard label="Valor catálogo" value={fmtMT(valorCatalogo)} />
      </div>

      {showForm && (
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-4">
          <div className="text-sm font-semibold mb-3">{editingId ? "Editar produto" : "Adicionar novo produto"}</div>

          <div className="flex gap-4 mb-3 flex-wrap text-sm">
            {[
              { id: "simples", label: "Produto Simples" },
              { id: "variacao", label: "Variação" },
              { id: "composicao", label: "Composição / Combo" },
            ].map((t) => (
              <label key={t.id} className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="tipoprod" checked={form.tipo === t.id} onChange={() => set("tipo", t.id)} />
                {t.label}
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm mb-3">
            <input type="checkbox" checked={form.vendaDirecta} onChange={(e) => set("vendaDirecta", e.target.checked)} />
            Produto para venda directa?
            <span className="text-xs" style={{ color: MUTED }}>
              (desligue para matérias-primas que só entram em composições)
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Nome do produto *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Coca-Cola 2L" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Código do produto (barras)</label>
              <input value={form.codigo} onChange={(e) => set("codigo", e.target.value)} placeholder="EX: 4589641235498" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
          </div>

          {form.tipo === "variacao" && (
            <div style={{ background: "#FDF1EA", borderColor: "#E7C3AC" }} className="border rounded-lg p-3 mb-3">
              <div className="text-xs font-semibold mb-2" style={{ color: "#B2591F" }}>
                Produto Pai (origem do stock) *
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select value={form.parentId} onChange={(e) => set("parentId", e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm">
                  <option value="">Seleccionar produto pai…</option>
                  {possiveisPais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({getStock(p, store.products)} {p.unit})
                    </option>
                  ))}
                </select>
                <div>
                  <input type="number" step="0.01" value={form.consumo} onChange={(e) => set("consumo", e.target.value)} placeholder="Quantidade consumida" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm" />
                  <div className="text-[11px] mt-1" style={{ color: MUTED }}>
                    Quanto do produto-pai sai a cada venda desta variação.
                  </div>
                </div>
              </div>
            </div>
          )}

          {form.tipo === "composicao" && (
            <div style={{ background: "#F2EFFD", borderColor: "#C6BDF0" }} className="border rounded-lg p-3 mb-3">
              <div className="text-xs font-semibold mb-2" style={{ color: "#5B4FE0" }}>
                Ingredientes / Composição
              </div>
              <div className="flex gap-2 mb-2 flex-wrap">
                <select value={ingSel.productId} onChange={(e) => setIngSel({ ...ingSel, productId: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm flex-1 min-w-[160px]">
                  <option value="">Seleccionar produto/insumo…</option>
                  {store.products.filter((p) => p.id !== editingId && p.tipo !== "composicao").map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input type="number" step="0.01" value={ingSel.qty} onChange={(e) => setIngSel({ ...ingSel, qty: e.target.value })} placeholder="Qtd consumo" style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm w-32" />
                <button onClick={addIngrediente} style={{ background: "#5B4FE0", color: "#fff" }} className="rounded px-3 py-2 text-xs font-medium">
                  Adicionar
                </button>
              </div>
              <div style={{ background: CARD, borderColor: BORDER }} className="border rounded p-2 space-y-1">
                {form.ingredientes.length === 0 && (
                  <div className="text-xs italic" style={{ color: MUTED }}>
                    Nenhum ingrediente adicionado.
                  </div>
                )}
                {form.ingredientes.map((ing, i) => {
                  const prod = store.products.find((x) => x.id === ing.productId);
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span>
                        {prod ? prod.name : "—"} × {ing.qty} {prod ? prod.unit : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <span style={{ color: MUTED }}>{fmtMT(prod ? (prod.cost || 0) * ing.qty : 0)}</span>
                        <button onClick={() => set("ingredientes", form.ingredientes.filter((_, ix) => ix !== i))}>
                          <X size={13} style={{ color: BRICK }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {form.ingredientes.length > 0 && (
                  <div className="text-xs font-semibold pt-1" style={{ borderTop: "1px solid " + BORDER }}>
                    Custo calculado: {fmtMT(custoComposicao)}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs" style={{ color: MUTED }}>Categoria *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
                <option value="">Seleccionar…</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Taxa de IVA</label>
              <select value={form.ivaTaxa} onChange={(e) => set("ivaTaxa", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
                <option value="">Usar a do sistema</option>
                {IVA_TAXAS.map((t) => (
                  <option key={t} value={t}>
                    {t}%
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Unidade de medida *</label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
                {UNIDADES.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Qtd de itens *</label>
              <input type="number" value={form.qtdItens} onChange={(e) => set("qtdItens", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Preço de venda (MT) *</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="EX: 100" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Custo unitário (MT)</label>
              <input type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Stock mínimo *</label>
              <input type="number" value={form.minStock} onChange={(e) => set("minStock", e.target.value)} placeholder="10" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Prazo reembolso (dias)</label>
              <input type="number" value={form.prazoReembolso} onChange={(e) => set("prazoReembolso", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
          </div>

          {form.tipo === "simples" && !editingId && (
            <div style={{ background: form.addEstoque ? "#E9F6EE" : BG, borderColor: form.addEstoque ? "#8FCBA6" : BORDER }} className="border rounded-lg p-3 mb-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={form.addEstoque} onChange={(e) => set("addEstoque", e.target.checked)} />
                Adicionar produto no estoque agora
              </label>
              {form.addEstoque && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mt-3">
                  <div>
                    <label className="text-xs" style={{ color: MUTED }}>Quantidade *</label>
                    <input type="number" value={form.estoqueQtd} onChange={(e) => set("estoqueQtd", e.target.value)} placeholder="EX: 100" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: MUTED }}>Preço de custo total *</label>
                    <input type="number" value={form.estoqueCustoTotal} onChange={(e) => set("estoqueCustoTotal", e.target.value)} placeholder="1500" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: MUTED }}>Data de validade</label>
                    <input type="date" value={form.estoqueValidade} onChange={(e) => set("estoqueValidade", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="text-xs" style={{ color: MUTED }}>Fornecedor</label>
                    <select value={form.estoqueFornecedor} onChange={(e) => set("estoqueFornecedor", e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
                      <option value="">Escolher fornecedor</option>
                      {store.suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {Number(form.estoqueQtd) > 0 && Number(form.estoqueCustoTotal) > 0 && (
                    <div className="sm:col-span-4 text-xs" style={{ color: GREEN }}>
                      Custo unitário calculado: {fmtMT(Number(form.estoqueCustoTotal) / Number(form.estoqueQtd))}
                      {Number(form.price) > 0 && " · Margem: " + fmtMT(Number(form.price) - Number(form.estoqueCustoTotal) / Number(form.estoqueQtd))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="mb-3">
            <label className="text-xs block mb-1" style={{ color: MUTED }}>Imagem do produto</label>
            <PhotoPicker value={form.foto} onChange={(v) => set("foto", v)} />
          </div>

          {erro && (
            <div className="text-xs mb-2" style={{ color: BRICK }}>
              {erro}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={submit} style={{ background: GREEN, color: "#fff" }} className="px-4 py-2 rounded text-sm font-medium">
              {editingId ? "Salvar mudança" : "Adicionar produto"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(blank); setErro(""); }} style={{ background: "#F5827A", color: "#fff" }} className="rounded px-4 py-2 text-sm font-medium">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1.5">
          {[
            { id: "todos", label: "Todos" },
            { id: "ativos", label: "Ativos" },
            { id: "inativos", label: "Inativos" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              style={{ background: statusFilter === t.id ? INK : CARD, color: statusFilter === t.id ? "#fff" : INK, borderColor: BORDER }}
              className="border rounded-full px-3 py-1.5 text-xs font-medium"
            >
              {t.label}
            </button>
          ))}
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ borderColor: BORDER, background: CARD }} className="border rounded px-2 py-1.5 text-xs">
          <option value="">Categorias: Todas</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto ou código…" style={{ borderColor: BORDER, background: CARD }} className="w-full border rounded px-3 py-2 text-sm" />

      {erro && !showForm && (
        <div style={{ background: "#FBE9E7", color: BRICK }} className="rounded p-2 text-xs">
          {erro}
        </div>
      )}

      <div className="space-y-1.5">
        {filteredProducts.map((p) => (
          <ProdutoRow
            key={p.id}
            p={p}
            produtos={store.products}
            onRemove={() => removeProduct(p.id)}
            onEdit={() => startEdit(p)}
            onToggleActive={() => updateProduct(p.id, { active: p.active === false })}
          />
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-sm" style={{ color: MUTED }}>
            {store.products.length === 0 ? "Ainda não há produtos." : "Nenhum produto corresponde à pesquisa."}
          </div>
        )}
      </div>

      {showCategorias && <CategoriasModal categories={categories} onAdd={addCategory} onRemove={removeCategory} onClose={() => setShowCategorias(false)} />}
    </div>
  );
}

function ProdutoRow({ p, produtos, onRemove, onEdit, onToggleActive }) {
  const active = p.active !== false;
  const stock = getStock(p, produtos);
  const tipoInfo =
    p.tipo === "variacao"
      ? { label: "Variação", color: "#B2591F", bg: "#FDF1EA" }
      : p.tipo === "composicao"
      ? { label: "Composição", color: "#5B4FE0", bg: "#F2EFFD" }
      : { label: "Simples", color: MUTED, bg: BG };
  const pai = p.tipo === "variacao" ? produtos.find((x) => x.id === p.parentId) : null;

  return (
    <div style={{ background: CARD, borderColor: BORDER, opacity: active ? 1 : 0.6 }} className="border rounded-lg p-2.5">
      <div className="flex items-center gap-3">
        <div style={{ background: BG }} className="w-12 h-12 rounded overflow-hidden flex items-center justify-center shrink-0">
          {p.foto ? <img src={p.foto} alt="" className="w-full h-full object-cover" /> : <Package size={18} style={{ color: MUTED }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate flex items-center gap-2 flex-wrap">
            {p.name}
            <span style={{ background: tipoInfo.bg, color: tipoInfo.color }} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              {tipoInfo.label}
            </span>
            <span
              style={{ background: active ? "#E4F4EA" : "#F1F1F1", color: active ? GREEN : MUTED }}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase"
            >
              {active ? "Ativo" : "Inativo"}
            </span>
            {p.vendaDirecta === false && (
              <span style={{ background: "#FDF1EA", color: "#B2591F" }} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                Insumo
              </span>
            )}
          </div>
          <div style={{ color: MUTED }} className="text-xs">
            {p.codigo ? "Cód: " + p.codigo + " · " : ""}
            {p.category} · Venda {fmtMT(p.price)} · Custo {fmtMT(p.cost)} · Margem {fmtMT(p.price - p.cost)}
          </div>
          <div style={{ color: stock <= (p.minStock || 0) ? BRICK : MUTED }} className="text-xs">
            Stock: {stock} {p.unit}
            {pai ? " (de " + pai.name + ", consome " + p.consumo + ")" : ""}
            {p.tipo === "composicao" ? " (limitado pelos ingredientes)" : ""}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onToggleActive} style={{ color: active ? MUTED : GREEN }} className="text-xs font-medium">
            {active ? "Desativar" : "Ativar"}
          </button>
          <button onClick={onEdit} style={{ color: TEAL }} className="text-xs font-medium">
            Editar
          </button>
          <button onClick={onRemove}>
            <X size={15} style={{ color: BRICK }} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkImportExport({ products, onImport }) {
  const { downloads } = useContext(CapsContext);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const mapped = rows.map(mapImportRow).filter((r) => r.name);
      setPreview(mapped);
    } catch (err) {
      setPreview([]);
    }
  };

  const confirmImport = () => {
    if (preview && preview.length) onImport(preview);
    setPreview(null);
    setFileName("");
  };

  const downloadTemplate = () =>
    downloadWorkbook(
      downloads,
      [{ Nome: "Arroz 5kg", Categoria: "Mercearia", Unidade: "un", Preço: 350, Custo: 260, Stock: 10, "Stock Mínimo": 5 }],
      "modelo_produtos.xlsx"
    );

  const exportCurrent = () =>
    downloadWorkbook(
      downloads,
      products
        .filter((p) => !p.variants && !p.batches)
        .map((p) => ({ Nome: p.name, Categoria: p.category, Unidade: p.unit, Preço: p.price, Custo: p.cost, Stock: p.stock, "Stock Mínimo": p.minStock })),
      "estoque_actual.xlsx"
    );


  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">Importar / exportar em massa (Excel)</div>
      <div className="text-xs" style={{ color: MUTED }}>
        Colunas esperadas: Nome, Categoria, Unidade, Preço, Custo, Stock, Stock Mínimo. Se o produto já existir (mesmo nome), a quantidade é somada ao stock actual;
        senão, cria um produto novo. Não se aplica a produtos com variantes ou validade.
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={downloadTemplate} disabled={!downloads} style={{ borderColor: BORDER, color: TEAL }} className="border rounded px-3 py-1.5 text-xs font-medium disabled:opacity-40">
          Descarregar modelo
        </button>
        <button onClick={exportCurrent} disabled={!downloads} style={{ borderColor: BORDER, color: TEAL }} className="border rounded px-3 py-1.5 text-xs font-medium disabled:opacity-40">
          Exportar estoque actual
        </button>
        <label style={{ background: TEAL, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium cursor-pointer">
          Escolher ficheiro Excel
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
        </label>
        {fileName && (
          <span style={{ color: MUTED }} className="text-xs self-center">
            {fileName}
          </span>
        )}
      </div>

      {preview && (
        <div style={{ borderColor: BORDER }} className="border rounded p-2 mt-2">
          {preview.length === 0 ? (
            <div className="text-xs" style={{ color: BRICK }}>
              Não foi possível ler linhas válidas deste ficheiro. Verifique as colunas e tente novamente.
            </div>
          ) : (
            <>
              <div className="text-xs mb-1.5" style={{ color: MUTED }}>
                {preview.length} linha(s) encontrada(s):
              </div>
              <div className="max-h-32 overflow-auto text-xs space-y-0.5 mb-2">
                {preview.slice(0, 15).map((r, i) => (
                  <div key={i} style={{ color: INK }}>
                    {r.name} — {r.category || "Geral"} — {fmtMT(Number(r.price) || 0)} — stock: {r.stock || 0}
                  </div>
                ))}
                {preview.length > 15 && <div style={{ color: MUTED }}>… e mais {preview.length - 15}</div>}
              </div>
              <button onClick={confirmImport} style={{ background: GREEN, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
                Confirmar importação
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ================= ESTOQUE (gestão de estoque) =================
function NovoLoteModal({ products, onAdd, onClose }) {
  const batchProducts = products.filter((p) => p.batches);
  const [productId, setProductId] = useState(batchProducts[0]?.id || "");
  const [qty, setQty] = useState("");
  const [expiryDate, setExpiryDate] = useState(todayStr());
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">Novo lote</div>
        {batchProducts.length === 0 ? (
          <div className="text-xs" style={{ color: MUTED }}>
            Nenhum produto está configurado com validade/lotes. Marque essa opção ao criar o produto em "Produtos".
          </div>
        ) : (
          <>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm mb-2">
              {batchProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input type="number" placeholder="Quantidade" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm mb-2" />
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm mb-3" />
            <button
              onClick={() => {
                if (qty) {
                  onAdd(productId, qty, expiryDate);
                  onClose();
                }
              }}
              style={{ background: GREEN, color: "#fff" }}
              className="w-full rounded py-2 text-sm font-medium"
            >
              Adicionar lote
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SaidaEstoqueModal({ store, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">Saída de estoque</div>
        <QuebrasForm store={store} onSubmit={(payload) => { onSubmit(payload); onClose(); }} />
      </div>
    </div>
  );
}

function imprimirEtiquetas(produtos, empresaNome) {
  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) return false;
  const cells = produtos
    .map(
      (p) => '<div class="et"><div class="nome">' + String(p.name).replace(/</g, "&lt;") + '</div>' +
        (p.codigo ? '<div class="cod">' + String(p.codigo).replace(/</g, "&lt;") + '</div>' : '<div class="cod">&nbsp;</div>') +
        '<div class="preco">' + fmtMT(p.price) + '</div></div>'
    )
    .join("");
  w.document.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Etiquetas</title><style>' +
      'body{font-family:system-ui,sans-serif;margin:12mm;} h1{font-size:12pt;color:#123C3C;margin:0 0 6mm;}' +
      '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;}' +
      '.et{border:1px solid #bbb;border-radius:3mm;padding:3mm;text-align:center;page-break-inside:avoid;}' +
      '.nome{font-size:9pt;font-weight:600;min-height:9mm;}' +
      '.cod{font-size:7pt;color:#666;font-family:monospace;margin:1mm 0;}' +
      '.preco{font-size:15pt;font-weight:800;color:#1B8A4B;}' +
      '@media print{ @page{margin:8mm;} }' +
      '</style></head><body><h1>' + String(empresaNome || "").replace(/</g, "&lt;") + ' — etiquetas de preço</h1><div class="grid">' + cells + '</div>' +
      '<script>window.onload=function(){window.print();}<\/script></body></html>'
  );
  w.document.close();
  return true;
}

function EstoqueTab({ store, persist, showToast, registerQuebra, onGoCompras }) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showSaida, setShowSaida] = useState(false);
  const [showNovoLote, setShowNovoLote] = useState(false);
  const lowCount = store.products.filter((p) => isLowStock(p, store.products)).length;
  const expiringCount = store.products.reduce((s, p) => s + nearExpiry(p).length, 0);
  const expiredUnits = store.products.reduce((s, p) => s + (p.batches || []).filter((b) => b.qty > 0 && daysUntil(b.expiryDate) < 0).reduce((a, b) => a + b.qty, 0), 0);
  const outOfStockCount = store.products.filter((p) => getStock(p, store.products) <= 0).length;
  const valorStock = store.products.reduce((s, p) => s + (p.cost || 0) * getStock(p, store.products), 0);
  const valorPotencial = store.products.reduce((s, p) => s + (p.price || 0) * getStock(p, store.products), 0);
  const categories = store.categories && store.categories.length ? store.categories : [...new Set(store.products.map((p) => p.category).filter(Boolean))].sort();
  const filteredProducts = store.products.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) && (!categoryFilter || p.category === categoryFilter)
  );

  const bulkApply = (rows) => {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let nextProducts = [...store.products];
    rows.forEach((row) => {
      if (!row.name) return;
      const idx = nextProducts.findIndex((p) => p.name.toLowerCase() === String(row.name).toLowerCase());
      if (idx >= 0) {
        const existing = nextProducts[idx];
        if (existing.variants || existing.batches) {
          skipped++;
          return;
        }
        nextProducts[idx] = {
          ...existing,
          price: row.price !== undefined ? Number(row.price) || existing.price : existing.price,
          cost: row.cost !== undefined ? Number(row.cost) || existing.cost : existing.cost,
          stock: (existing.stock || 0) + (Number(row.stock) || 0),
        };
        updated++;
      } else {
        nextProducts.push({
          id: uid(),
          name: String(row.name),
          category: row.category || "Geral",
          unit: row.unit || "un",
          price: Number(row.price) || 0,
          cost: Number(row.cost) || 0,
          stock: Number(row.stock) || 0,
          minStock: Number(row.minStock) || 0,
          foto: "",
          active: true,
        });
        created++;
      }
    });
    persist({ ...store, products: nextProducts });
    showToast(`Importação concluída: ${created} criado(s), ${updated} actualizado(s)${skipped ? `, ${skipped} ignorado(s)` : ""}`);
  };

  const adjustStock = (id, delta) =>
    persist({ ...store, products: store.products.map((p) => (p.id === id && !p.variants && !p.batches ? { ...p, stock: Math.max(0, p.stock + delta) } : p)) });
  const addVariant = (id, label) =>
    persist({ ...store, products: store.products.map((p) => (p.id === id ? { ...p, variants: [...(p.variants || []), { id: uid(), label, stock: 0 }] } : p)) });
  const adjustVariantStock = (id, variantId, delta) =>
    persist({
      ...store,
      products: store.products.map((p) =>
        p.id === id ? { ...p, variants: p.variants.map((v) => (v.id === variantId ? { ...v, stock: Math.max(0, v.stock + delta) } : v)) } : p
      ),
    });
  const addBatch = (id, qty, expiryDate) =>
    persist({ ...store, products: store.products.map((p) => (p.id === id ? { ...p, batches: [...(p.batches || []), { id: uid(), qty: Number(qty) || 0, expiryDate }] } : p)) });

  const stats = [
    { label: "Stock baixo", value: lowCount, color: lowCount > 0 ? BRICK : TEAL },
    { label: "Esgotados", value: outOfStockCount, color: outOfStockCount > 0 ? BRICK : TEAL },
    { label: "A vencer em breve", value: expiringCount, color: expiringCount > 0 ? GOLD : TEAL },
    { label: "Unidades expiradas", value: expiredUnits, color: expiredUnits > 0 ? BRICK : TEAL },
    { label: "Valor em stock", value: fmtMT(valorStock), color: TEAL },
    { label: "Valor potencial (venda)", value: fmtMT(valorPotencial), color: TEAL },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div style={{ background: "#4338CA", color: "#fff" }} className="w-7 h-7 rounded-full flex items-center justify-center">
            <Boxes size={14} />
          </div>
          <div className="text-base font-semibold">Gestão de Stock</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSaida(true)} style={{ background: BRICK, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            − Saída Estoque
          </button>
          <button onClick={() => setShowNovoLote(true)} style={{ background: GREEN, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            + Novo Lote
          </button>
          <button onClick={onGoCompras} style={{ background: "#2E5AAC", color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium">
            Fornecedores
          </button>
          <button
            onClick={() => imprimirEtiquetas(filteredProducts, store.config.businessName)}
            style={{ borderColor: BORDER, color: INK }}
            className="border rounded px-3 py-1.5 text-xs font-medium"
          >
            Imprimir etiquetas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div key={s.label} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
            <div className="text-xs" style={{ color: MUTED }}>
              {s.label}
            </div>
            <div style={{ color: s.color }} className="text-xl font-semibold mt-1">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <BulkImportExport products={store.products} onImport={bulkApply} />

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar Produto ou Nome do Lote…"
          style={{ borderColor: BORDER, background: CARD }}
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ borderColor: BORDER, background: CARD }} className="border rounded px-2 py-2 text-sm">
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        {filteredProducts.map((p) => (
          <EstoqueRow
            key={p.id}
            p={p}
            onAdjustStock={(d) => adjustStock(p.id, d)}
            onAddVariant={(label) => addVariant(p.id, label)}
            onAdjustVariant={(vid, d) => adjustVariantStock(p.id, vid, d)}
            onAddBatch={(qty, exp) => addBatch(p.id, qty, exp)}
            produtos={store.products}
          />
        ))}
        {filteredProducts.length === 0 && store.products.length > 0 && (
          <div className="text-sm" style={{ color: MUTED }}>
            Nenhum produto corresponde à pesquisa.
          </div>
        )}
        {store.products.length === 0 && (
          <div className="text-sm" style={{ color: MUTED }}>
            Adicione produtos na aba Produtos primeiro.
          </div>
        )}
      </div>

      {showSaida && <SaidaEstoqueModal store={store} onSubmit={registerQuebra} onClose={() => setShowSaida(false)} />}
      {showNovoLote && (
        <NovoLoteModal products={store.products} onAdd={(id, qty, exp) => addBatch(id, qty, exp)} onClose={() => setShowNovoLote(false)} />
      )}
    </div>
  );
}

function EstoqueRow({ p, onAdjustStock, onAddVariant, onAdjustVariant, onAddBatch, produtos }) {
  const [expanded, setExpanded] = useState(false);
  const [newVariant, setNewVariant] = useState("");
  const [newBatchQty, setNewBatchQty] = useState("");
  const [newBatchExp, setNewBatchExp] = useState(todayStr());
  const stock = getStock(p, produtos);
  const expiring = nearExpiry(p);

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-2.5">
      <div className="flex items-center gap-3">
        <div style={{ background: BG }} className="w-10 h-10 rounded overflow-hidden flex items-center justify-center shrink-0">
          {p.foto ? <img src={p.foto} alt="" className="w-full h-full object-cover" /> : <Package size={16} style={{ color: MUTED }} />}
        </div>
        <button className="min-w-0 text-left flex-1" onClick={() => setExpanded((e) => !e)}>
          <div className="text-sm font-medium truncate flex items-center gap-1.5">
            {p.name}
            {p.variants && <Layers size={12} style={{ color: MUTED }} />}
            {p.batches && <Ruler size={12} style={{ color: MUTED }} />}
          </div>
          <div style={{ color: MUTED }} className="text-xs">
            {p.category}
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {!p.variants && !p.batches && (
            <>
              <button onClick={() => onAdjustStock(-1)} style={{ borderColor: BORDER }} className="border rounded p-1">
                <Minus size={12} />
              </button>
              <span style={{ color: stock <= p.minStock ? BRICK : INK }} className="w-8 text-center text-sm font-medium">
                {stock}
              </span>
              <button onClick={() => onAdjustStock(1)} style={{ borderColor: BORDER }} className="border rounded p-1">
                <Plus size={12} />
              </button>
            </>
          )}
          {(p.variants || p.batches) && (
            <span style={{ color: stock <= p.minStock ? BRICK : INK }} className="text-sm font-medium">
              {stock}
            </span>
          )}
        </div>
      </div>

      {expiring.length > 0 && (
        <div style={{ color: BRICK }} className="text-xs mt-1 flex items-center gap-1">
          <AlertTriangle size={11} /> {expiring.length} lote(s) a vencer em breve
        </div>
      )}

      {expanded && p.variants && (
        <div className="mt-2 pt-2 space-y-1" style={{ borderTop: `1px solid ${BORDER}` }}>
          {p.variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between text-xs">
              <span>{v.label}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => onAdjustVariant(v.id, -1)} style={{ borderColor: BORDER }} className="border rounded p-0.5">
                  <Minus size={10} />
                </button>
                <span className="w-6 text-center">{v.stock}</span>
                <button onClick={() => onAdjustVariant(v.id, 1)} style={{ borderColor: BORDER }} className="border rounded p-0.5">
                  <Plus size={10} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-1.5 mt-1">
            <input value={newVariant} onChange={(e) => setNewVariant(e.target.value)} placeholder="Nova variante (ex: GG)" style={{ borderColor: BORDER }} className="border rounded px-2 py-1 text-xs flex-1" />
            <button
              onClick={() => {
                if (newVariant) {
                  onAddVariant(newVariant);
                  setNewVariant("");
                }
              }}
              style={{ color: TEAL }}
              className="text-xs font-medium"
            >
              + adicionar
            </button>
          </div>
        </div>
      )}

      {expanded && p.batches && (
        <div className="mt-2 pt-2 space-y-1" style={{ borderTop: `1px solid ${BORDER}` }}>
          {p.batches.map((b) => (
            <div key={b.id} className="flex items-center justify-between text-xs" style={{ color: daysUntil(b.expiryDate) <= 3 ? BRICK : MUTED }}>
              <span>
                Lote: {b.qty}
                {p.unit}
              </span>
              <span>Val: {b.expiryDate}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 mt-1">
            <input type="number" value={newBatchQty} onChange={(e) => setNewBatchQty(e.target.value)} placeholder="Qtd" style={{ borderColor: BORDER }} className="border rounded px-2 py-1 text-xs w-16" />
            <input type="date" value={newBatchExp} onChange={(e) => setNewBatchExp(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1 text-xs flex-1" />
            <button
              onClick={() => {
                if (newBatchQty) {
                  onAddBatch(newBatchQty, newBatchExp);
                  setNewBatchQty("");
                }
              }}
              style={{ color: TEAL }}
              className="text-xs font-medium"
            >
              + lote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= CLIENTES =================
function PagamentoParcial({ cliente, total, onPay }) {
  const [valor, setValor] = useState("");
  const msg =
    "Ola " + cliente.name + ", tudo bem? Passamos para lembrar que tem um saldo em aberto de " +
    fmtMT(total) + " na nossa loja. Agradecemos a regularizacao. Obrigado!";
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <input
        type="number"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Valor pago (MT)"
        style={{ borderColor: BORDER }}
        className="border rounded px-2 py-1 text-xs flex-1 min-w-[120px]"
      />
      <button
        onClick={() => {
          onPay(valor);
          setValor("");
        }}
        disabled={!valor}
        style={{ background: GREEN, color: "#fff" }}
        className="rounded px-2.5 py-1 text-xs font-medium disabled:opacity-40"
      >
        Receber
      </button>
      <button
        onClick={() => onPay(total)}
        style={{ borderColor: BORDER, color: TEAL }}
        className="border rounded px-2.5 py-1 text-xs font-medium"
      >
        Liquidar tudo
      </button>
      {cliente.phone && (
        <a
          href={whatsappLink(cliente.phone, msg)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: "#25D366", color: "#fff" }}
          className="rounded px-2.5 py-1 text-xs font-medium"
        >
          Lembrar no WhatsApp
        </a>
      )}
    </div>
  );
}

function ClientesTab({ store, persist }) {
  const blank = { name: "", tipo: "Particular", phone: "", email: "", nuit: "", endereco: "", cidade: "", creditLimit: "", notas: "" };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  const submit = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      tipo: form.tipo,
      phone: form.phone.trim(),
      email: form.email.trim(),
      nuit: form.nuit.trim(),
      endereco: form.endereco.trim(),
      cidade: form.cidade.trim(),
      creditLimit: Number(form.creditLimit) || 0,
      notas: form.notas.trim(),
    };
    if (editingId) {
      persist({ ...store, clients: store.clients.map((c) => (c.id === editingId ? { ...c, ...payload } : c)) });
      setEditingId(null);
    } else {
      persist({ ...store, clients: [...store.clients, { id: uid(), ...payload, points: 0, debts: [], createdAt: new Date().toISOString() }] });
    }
    setForm(blank);
    setShowForm(false);
  };
  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name || "", tipo: c.tipo || "Particular", phone: c.phone || "", email: c.email || "",
      nuit: c.nuit || "", endereco: c.endereco || "", cidade: c.cidade || "",
      creditLimit: c.creditLimit || "", notas: c.notas || "",
    });
    setShowForm(true);
  };
  const removeClient = (id) => persist({ ...store, clients: store.clients.filter((c) => c.id !== id) });
  const payDebt = (clientId, debtId) =>
    persist({ ...store, clients: store.clients.map((c) => (c.id === clientId ? { ...c, debts: c.debts.filter((d) => d.id !== debtId) } : c)) });

  const payPartial = (clientId, valor) => {
    let restante = Number(valor) || 0;
    if (restante <= 0) return;
    persist({
      ...store,
      clients: store.clients.map((c) => {
        if (c.id !== clientId) return c;
        const novas = [];
        [...c.debts]
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .forEach((d) => {
            if (restante <= 0) {
              novas.push(d);
            } else if (restante >= d.amount) {
              restante -= d.amount;
            } else {
              novas.push({ ...d, amount: d.amount - restante });
              restante = 0;
            }
          });
        return { ...c, debts: novas };
      }),
    });
  };

  const filtered = store.clients.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || (c.phone || "").includes(query) || (c.nuit || "").includes(query)
  );
  const totalDivida = store.clients.reduce((a, c) => a + c.debts.reduce((x, d) => x + d.amount, 0), 0);
  const comDivida = store.clients.filter((c) => c.debts.length > 0).length;
  const acimaLimite = store.clients.filter((c) => c.creditLimit > 0 && c.debts.reduce((a, d) => a + d.amount, 0) > c.creditLimit).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-base font-semibold">Gestão de Clientes</div>
        <button onClick={() => { setShowForm((s) => !s); setEditingId(null); setForm(blank); }} style={{ background: TEAL, color: "#fff" }} className="rounded px-3 py-1.5 text-xs font-medium flex items-center gap-1.5">
          <Plus size={13} /> Novo cliente
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard label="Clientes" value={store.clients.length} />
        <StatCard label="Com dívida" value={comDivida} />
        <StatCard label="Total em dívida" value={fmtMT(totalDivida)} />
        <StatCard label="Acima do limite" value={acimaLimite} />
      </div>

      {showForm && (
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-4">
          <div className="text-sm font-semibold mb-3">{editingId ? "Editar cliente" : "Novo cliente"}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="text-xs" style={{ color: MUTED }}>Nome / Razão social *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
                <option>Particular</option>
                <option>Empresa</option>
                <option>Revendedor</option>
                <option>Instituição</option>
              </select>
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Telefone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+258 84 000 0000" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>NUIT</label>
              <input value={form.nuit} onChange={(e) => setForm({ ...form, nuit: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs" style={{ color: MUTED }}>Endereço</label>
              <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Cidade / Província</label>
              <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs" style={{ color: MUTED }}>Limite de crédito (fiado)</label>
              <input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs" style={{ color: MUTED }}>Notas internas</label>
              <input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={submit} style={{ background: TEAL, color: "#fff" }} className="px-4 py-2 rounded text-sm font-medium">
              {editingId ? "Guardar" : "Adicionar"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(blank); }} style={{ borderColor: BORDER }} className="border rounded px-3 py-2 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, telefone ou NUIT…" style={{ borderColor: BORDER, background: CARD }} className="w-full border rounded px-3 py-2 text-sm" />

      <div className="space-y-1.5">
        {filtered.map((c) => {
          const total = c.debts.reduce((s, d) => s + d.amount, 0);
          const overLimit = c.creditLimit > 0 && total > c.creditLimit;
          return (
            <div key={c.id} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div style={{ background: BG, color: TEAL }} className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                    {(c.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                      {c.name}
                      <span style={{ background: BG, color: MUTED }} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                        {c.tipo || "Particular"}
                      </span>
                      {c.points > 0 && (
                        <span style={{ color: GOLD }} className="text-xs flex items-center gap-0.5">
                          <Star size={11} /> {c.points}
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: MUTED }}>
                      {[c.phone, c.email, c.nuit ? "NUIT " + c.nuit : "", c.cidade].filter(Boolean).join(" · ") || "sem contactos"}
                    </div>
                    {c.notas && (
                      <div className="text-xs italic mt-0.5" style={{ color: MUTED }}>
                        {c.notas}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div style={{ color: total > 0 ? (overLimit ? BRICK : GOLD) : MUTED }} className="text-sm font-semibold">
                    {total > 0 ? fmtMT(total) : "Sem dívidas"}
                  </div>
                  <button onClick={() => startEdit(c)} style={{ color: TEAL }} className="text-xs font-medium">
                    Editar
                  </button>
                  <button onClick={() => removeClient(c.id)}>
                    <X size={15} style={{ color: BRICK }} />
                  </button>
                </div>
              </div>
              {c.creditLimit > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] mb-1" style={{ color: MUTED }}>
                    <span>Crédito usado</span>
                    <span>{fmtMT(total)} / {fmtMT(c.creditLimit)}</span>
                  </div>
                  <div style={{ background: BORDER }} className="h-1.5 rounded">
                    <div style={{ background: overLimit ? BRICK : GREEN, width: Math.min(100, (total / c.creditLimit) * 100) + "%" }} className="h-1.5 rounded" />
                  </div>
                </div>
              )}
              {c.debts.length > 0 && (
                <div className="mt-2 pt-2" style={{ borderTop: "1px solid " + BORDER }}>
                  <PagamentoParcial cliente={c} total={total} onPay={(v) => payPartial(c.id, v)} />
                </div>
              )}
              {c.debts.length > 0 && (
                <div className="mt-2 space-y-1 pt-2" style={{ borderTop: "1px solid " + BORDER }}>
                  {c.debts.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-xs" style={{ color: MUTED }}>
                      <span>{new Date(d.date).toLocaleDateString("pt-PT")} — {fmtMT(d.amount)}</span>
                      <button onClick={() => payDebt(c.id, d.id)} style={{ color: TEAL }} className="font-medium">
                        Marcar como pago
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-sm" style={{ color: MUTED }}>
            Nenhum cliente encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

function ComprasTab({ store, persist }) {
  const [sup, setSup] = useState({ name: "", contacto: "", phone: "", email: "", nuit: "", endereco: "", prazo: "" });
  const [supplierId, setSupplierId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [expiryDate, setExpiryDate] = useState(todayStr());

  const addSupplier = () => {
    if (!sup.name.trim()) return;
    persist({
      ...store,
      suppliers: [
        ...store.suppliers,
        { id: uid(), name: sup.name.trim(), contacto: sup.contacto.trim(), phone: sup.phone.trim(), email: sup.email.trim(), nuit: sup.nuit.trim(), endereco: sup.endereco.trim(), prazo: sup.prazo.trim(), createdAt: new Date().toISOString() },
      ],
    });
    setSup({ name: "", contacto: "", phone: "", email: "", nuit: "", endereco: "", prazo: "" });
  };
  const removeSupplier = (id) => persist({ ...store, suppliers: store.suppliers.filter((s) => s.id !== id) });

  const registerPurchase = () => {
    if (!supplierId || !productId || !qty) return;
    const product = store.products.find((p) => p.id === productId);
    if (!product) return;

    let nextProducts;
    if (product.batches) {
      nextProducts = store.products.map((p) =>
        p.id === productId ? { ...p, cost: Number(cost) || p.cost, batches: [...p.batches, { id: uid(), qty: Number(qty), expiryDate }] } : p
      );
    } else if (product.variants) {
      nextProducts = store.products;
    } else {
      nextProducts = store.products.map((p) => (p.id === productId ? { ...p, cost: Number(cost) || p.cost, stock: (p.stock || 0) + Number(qty) } : p));
    }

    const purchase = {
      id: uid(),
      supplierId,
      date: new Date().toISOString(),
      items: [{ productId, qty: Number(qty), cost: Number(cost) || product.cost }],
      total: Number(qty) * (Number(cost) || product.cost),
    };

    persist({ ...store, products: nextProducts, purchases: [...store.purchases, purchase] });
    setQty("");
    setCost("");
  };

  return (
    <div className="space-y-4">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
        <div className="text-sm font-semibold mb-2">Fornecedores</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
          <input placeholder="Nome / Empresa *" value={sup.name} onChange={(e) => setSup({ ...sup, name: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm sm:col-span-2" />
          <input placeholder="Pessoa de contacto" value={sup.contacto} onChange={(e) => setSup({ ...sup, contacto: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
          <input placeholder="Telefone" value={sup.phone} onChange={(e) => setSup({ ...sup, phone: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
          <input placeholder="Email" value={sup.email} onChange={(e) => setSup({ ...sup, email: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
          <input placeholder="NUIT" value={sup.nuit} onChange={(e) => setSup({ ...sup, nuit: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
          <input placeholder="Endereço" value={sup.endereco} onChange={(e) => setSup({ ...sup, endereco: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm sm:col-span-2" />
          <input placeholder="Prazo de pagamento (ex: 30 dias)" value={sup.prazo} onChange={(e) => setSup({ ...sup, prazo: e.target.value })} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-2 text-sm" />
        </div>
        <button onClick={addSupplier} style={{ background: TEAL, color: "#fff" }} className="px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5">
          <Plus size={14} /> Adicionar fornecedor
        </button>
        <div className="space-y-1.5 mt-3">
          {store.suppliers.map((s) => (
            <div key={s.id} style={{ borderColor: BORDER }} className="border rounded-lg p-2.5 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{s.name}</div>
                <div className="text-xs" style={{ color: MUTED }}>
                  {[s.contacto, s.phone, s.email, s.nuit ? "NUIT " + s.nuit : "", s.prazo].filter(Boolean).join(" · ") || "sem detalhes"}
                </div>
                {s.endereco && (
                  <div className="text-xs" style={{ color: MUTED }}>
                    {s.endereco}
                  </div>
                )}
              </div>
              <button onClick={() => removeSupplier(s.id)}>
                <X size={15} style={{ color: BRICK }} />
              </button>
            </div>
          ))}
          {store.suppliers.length === 0 && (
            <div className="text-xs" style={{ color: MUTED }}>
              Ainda não há fornecedores registados.
            </div>
          )}
        </div>
      </div>

      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
        <div className="text-sm font-semibold mb-2">Registar compra (entrada de stock)</div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm">
            <option value="">Fornecedor</option>
            {store.suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm">
            <option value="">Produto</option>
            {store.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input placeholder="Quantidade" type="number" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm" />
          <input placeholder="Custo unitário" type="number" value={cost} onChange={(e) => setCost(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm" />
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm" />
        </div>
        <button onClick={registerPurchase} style={{ background: TEAL, color: "#fff" }} className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded text-sm">
          <Plus size={14} /> Registar entrada
        </button>
      </div>

      <div className="space-y-1">
        {[...store.purchases]
          .reverse()
          .slice(0, 10)
          .map((p) => {
            const supplier = store.suppliers.find((s) => s.id === p.supplierId);
            const product = store.products.find((pr) => pr.id === p.items[0].productId);
            return (
              <div key={p.id} style={{ background: CARD, borderColor: BORDER }} className="border rounded px-2.5 py-1.5 text-xs flex justify-between">
                <span>
                  {product?.name} × {p.items[0].qty} — {supplier?.name}
                </span>
                <span style={{ color: MUTED }}>{fmtMT(p.total)}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ================= EQUIPA =================
const ROLE_LABELS = { dono: "Administrador", gerente: "Gerente", caixa: "Operador de Caixa", cozinha: "Cozinha / Bar" };

function EquipaTab({ store, persist }) {
  const blank = { name: "", email: "", phone: "", password: "", role: "caixa", docId: "" };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const validate = () => {
    if (!form.name.trim()) return "Indique o nome completo.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Indique um email válido.";
    if (!editingId && form.password.length < 4) return "A senha deve ter pelo menos 4 caracteres.";
    const dup = store.employees.find((e) => e.email && e.email.toLowerCase() === form.email.trim().toLowerCase() && e.id !== editingId);
    if (dup) return "Já existe uma conta com esse email.";
    return "";
  };

  const submit = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    if (editingId) {
      persist({
        ...store,
        employees: store.employees.map((e) =>
          e.id === editingId
            ? { ...e, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), role: form.role, docId: form.docId.trim(), ...(form.password ? { password: form.password } : {}) }
            : e
        ),
      });
      setEditingId(null);
    } else {
      persist({
        ...store,
        employees: [
          ...store.employees,
          { id: uid(), name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password, role: form.role, docId: form.docId.trim(), active: true, createdAt: new Date().toISOString() },
        ],
      });
    }
    setForm(blank);
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setForm({ name: e.name || "", email: e.email || "", phone: e.phone || "", password: "", role: e.role || "caixa", docId: e.docId || "" });
    setError("");
  };
  const removeEmployee = (id) => persist({ ...store, employees: store.employees.filter((e) => e.id !== id) });
  const toggleActive = (id) => persist({ ...store, employees: store.employees.map((e) => (e.id === id ? { ...e, active: e.active === false } : e)) });

  return (
    <div className="space-y-4">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-4">
        <div className="text-sm font-semibold mb-3">{editingId ? "Editar conta de utilizador" : "Nova conta de utilizador"}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="sm:col-span-2">
            <label className="text-xs" style={{ color: MUTED }}>Nome completo *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Maria João Cossa" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="nome@empresa.co.mz" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Telefone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+258 84 000 0000" style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>{editingId ? "Nova senha (deixe vazio para manter)" : "Senha *"}</label>
            <div className="flex gap-1 mt-1">
              <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ borderColor: BORDER }} className="flex-1 border rounded px-2.5 py-2 text-sm" />
              <button type="button" onClick={() => setShowPw((s) => !s)} style={{ borderColor: BORDER, color: MUTED }} className="border rounded px-2 text-xs">
                {showPw ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>Nº de documento (BI/NUIT)</label>
            <input value={form.docId} onChange={(e) => setForm({ ...form, docId: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs" style={{ color: MUTED }}>Função / permissões</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ borderColor: BORDER }} className="w-full border rounded px-2.5 py-2 text-sm mt-1">
              <option value="caixa">Operador de Caixa — só vende</option>
              <option value="cozinha">Cozinha / Bar — comandas</option>
              <option value="gerente">Gerente — vê relatórios, dá descontos</option>
              <option value="dono">Administrador — acesso total</option>
            </select>
          </div>
        </div>
        {error && (
          <div className="text-xs mt-2" style={{ color: BRICK }}>
            {error}
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <button onClick={submit} style={{ background: TEAL, color: "#fff" }} className="flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium">
            <Plus size={14} /> {editingId ? "Guardar alterações" : "Criar conta"}
          </button>
          {editingId && (
            <button onClick={() => { setEditingId(null); setForm(blank); setError(""); }} style={{ borderColor: BORDER }} className="border rounded px-3 py-2 text-sm">
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {store.employees.map((e) => {
          const active = e.active !== false;
          return (
            <div key={e.id} style={{ background: CARD, borderColor: BORDER, opacity: active ? 1 : 0.6 }} className="border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div style={{ background: TEAL, color: "#fff" }} className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                    {(e.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                      {e.name}
                      <span style={{ background: BG, color: TEAL }} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                        {ROLE_LABELS[e.role] || e.role}
                      </span>
                      {!active && (
                        <span style={{ background: "#F1F1F1", color: MUTED }} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full uppercase">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: MUTED }}>
                      {e.email || "sem email"}
                      {e.phone ? " · " + e.phone : ""}
                      {e.docId ? " · " + e.docId : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => startEdit(e)} style={{ color: TEAL }} className="text-xs font-medium">
                    Editar
                  </button>
                  {e.id !== "dono" && (
                    <>
                      <button onClick={() => toggleActive(e.id)} style={{ color: active ? MUTED : GREEN }} className="text-xs font-medium">
                        {active ? "Desactivar" : "Activar"}
                      </button>
                      <button onClick={() => removeEmployee(e.id)}>
                        <X size={15} style={{ color: BRICK }} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-xs" style={{ color: MUTED }}>
        Nota importante: a senha organiza o acesso no dia a dia, mas é guardada sem encriptação — não é segurança de nível bancário. Não reutilize aqui senhas que usa noutros serviços.
      </div>
    </div>
  );
}

function CaixaTab({ store, shiftOpen, currentShift, openShift, closeShift, registerQuebra, registerMovimento, podeVerEsperado }) {
  const [sub, setSub] = useState("resumo");
  const [showShiftModal, setShowShiftModal] = useState(null);

  const shiftSales = store.sales.filter((s) => s.shiftId === store.currentShiftId && s.status !== "void");
  const paymentsByMethod = {};
  shiftSales.forEach((s) => s.payments.forEach((p) => (paymentsByMethod[p.method] = (paymentsByMethod[p.method] || 0) + p.amount)));
  const movs = store.movimentosCaixa.filter((m) => m.shiftId === store.currentShiftId);
  const entradas = movs.filter((m) => m.type === "entrada").reduce((s, m) => s + m.amount, 0);
  const saidas = movs.filter((m) => m.type === "saida").reduce((s, m) => s + m.amount, 0);
  const shiftQuebras = store.quebras.filter((q) => q.shiftId === store.currentShiftId);
  const quebrasCusto = shiftQuebras.reduce((s, q) => s + q.custoImpacto, 0);
  const expectedNow = (currentShift?.openingCash || 0) + (paymentsByMethod.dinheiro || 0) + entradas - saidas;

  const subtabs = [
    { id: "resumo", label: "Resumo", icon: Scale },
    { id: "quebras", label: "Quebras", icon: PackageX },
    { id: "entrada", label: "Nova entrada", icon: ArrowDownCircle },
    { id: "saida", label: "Nova saída", icon: ArrowUpCircle },
  ];

  return (
    <div>
      <div
        style={{ background: shiftOpen ? "#E4F4EA" : "#FBE9E7", borderColor: shiftOpen ? "#8FCBA6" : "#F0C6C0" }}
        className="border rounded-lg p-4 mb-4 flex items-center justify-between flex-wrap gap-2"
      >
        <div className="flex items-center gap-2">
          <div style={{ background: shiftOpen ? GREEN : BRICK }} className="w-3 h-3 rounded-full" />
          <div>
            <div style={{ color: shiftOpen ? GREEN : BRICK }} className="text-sm font-semibold">
              {shiftOpen ? "Caixa aberto" : "Caixa fechado"}
            </div>
            {shiftOpen && currentShift && (
              <div className="text-xs" style={{ color: MUTED }}>
                desde {new Date(currentShift.openedAt).toLocaleString("pt-PT")}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowShiftModal(shiftOpen ? "close" : "open")}
          style={{ background: shiftOpen ? BRICK : GREEN, color: "#fff" }}
          className="text-xs px-3 py-1.5 rounded font-medium"
        >
          {shiftOpen ? "Fechar caixa" : "Abrir caixa"}
        </button>
      </div>

      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {subtabs.map((t) => {
          const Icon = t.icon;
          const active = sub === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              style={{ background: active ? TEAL : CARD, color: active ? "#fff" : INK, borderColor: BORDER }}
              className="border rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {sub === "resumo" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: "Abertura", value: fmtMT(currentShift?.openingCash || 0) },
              { label: "Vendas em dinheiro", value: fmtMT(paymentsByMethod.dinheiro || 0) },
              { label: "Entradas / Saídas", value: `+${fmtMT(entradas)} / -${fmtMT(saidas)}` },
              { label: "Esperado no caixa", value: podeVerEsperado ? fmtMT(expectedNow) : "•••" },
            ].map((c) => (
              <div key={c.label} style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
                <div className="text-xs" style={{ color: MUTED }}>
                  {c.label}
                </div>
                <div style={{ color: TEAL }} className="text-base font-semibold mt-1">
                  {c.value}
                </div>
              </div>
            ))}
          </div>
          {Object.keys(paymentsByMethod).length > 0 && (
            <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">Distribuição do turno</div>
              <DonutChart data={Object.entries(paymentsByMethod).map(([k, v]) => ({ label: k, value: v }))} size={112} />
            </div>
          )}
          <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Vendas por forma de pagamento (turno actual)</div>
            {Object.keys(paymentsByMethod).length === 0 && (
              <div className="text-xs" style={{ color: MUTED }}>
                Sem vendas neste turno.
              </div>
            )}
            {Object.entries(paymentsByMethod).map(([m, v]) => (
              <div key={m} className="flex justify-between text-sm py-0.5">
                <span className="capitalize">{m}</span>
                <span style={{ color: TEAL }} className="font-medium">
                  {fmtMT(v)}
                </span>
              </div>
            ))}
          </div>
          {quebrasCusto > 0 && (
            <div style={{ background: "#FBE9E7", borderColor: "#F0C6C0", color: BRICK }} className="border rounded-lg p-3 text-sm">
              Perdas por quebra neste turno: {fmtMT(quebrasCusto)}
            </div>
          )}
        </div>
      )}
      {sub === "quebras" && <QuebrasForm store={store} onSubmit={registerQuebra} />}
      {sub === "entrada" && <MovimentoForm type="entrada" shiftOpen={shiftOpen} onSubmit={registerMovimento} />}
      {sub === "saida" && <MovimentoForm type="saida" shiftOpen={shiftOpen} onSubmit={registerMovimento} />}

      {showShiftModal && (
        <ShiftModal
          mode={showShiftModal}
          onConfirmOpen={(v) => {
            openShift(v);
            setShowShiftModal(null);
          }}
          onConfirmClose={(v) => {
            closeShift(v);
            setShowShiftModal(null);
          }}
          onClose={() => setShowShiftModal(null)}
        />
      )}
    </div>
  );
}

function QuebrasForm({ store, onSubmit }) {
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [qty, setQty] = useState("");
  const [motivo, setMotivo] = useState("Danificado");
  const product = store.products.find((p) => p.id === productId);

  const submit = () => {
    if (!productId || !qty) return;
    onSubmit({ productId, variantId: variantId || null, qty: Number(qty), motivo });
    setQty("");
    setVariantId("");
  };

  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">Registar quebra / perda</div>
      <select
        value={productId}
        onChange={(e) => {
          setProductId(e.target.value);
          setVariantId("");
        }}
        style={{ borderColor: BORDER }}
        className="w-full border rounded px-2 py-1.5 text-sm"
      >
        <option value="">Produto</option>
        {store.products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {product?.variants && (
        <select value={variantId} onChange={(e) => setVariantId(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm">
          <option value="">Variante</option>
          {product.variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input type="number" placeholder="Quantidade" value={qty} onChange={(e) => setQty(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm" />
        <select value={motivo} onChange={(e) => setMotivo(e.target.value)} style={{ borderColor: BORDER }} className="border rounded px-2 py-1.5 text-sm">
          <option>Danificado</option>
          <option>Vencido</option>
          <option>Roubo/Perda</option>
          <option>Erro de registo</option>
          <option>Outro</option>
        </select>
      </div>
      <button onClick={submit} style={{ background: BRICK, color: "#fff" }} className="px-3 py-1.5 rounded text-sm">
        Registar
      </button>
      <div className="text-xs" style={{ color: MUTED }}>
        Isto retira a quantidade do stock e regista o custo como perda no relatório financeiro.
      </div>
    </div>
  );
}

function MovimentoForm({ type, shiftOpen, onSubmit }) {
  const isEntrada = type === "entrada";
  const cats = isEntrada ? ENTRADA_CATEGORIAS : DESPESA_CATEGORIAS;
  const [amount, setAmount] = useState("");
  const [motivo, setMotivo] = useState("");
  const [categoria, setCategoria] = useState(cats[0]);
  const submit = () => {
    if (!amount || !shiftOpen) return;
    onSubmit({ type, amount: Number(amount), motivo, categoria });
    setAmount("");
    setMotivo("");
  };
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
      <div className="text-sm font-semibold">{isEntrada ? "Nova entrada de dinheiro" : "Nova saída de dinheiro"}</div>
      {!shiftOpen && (
        <div className="text-xs" style={{ color: BRICK }}>
          Abra o caixa para registar movimentos.
        </div>
      )}
      <input type="number" placeholder="Valor (MT)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm" />
      <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ borderColor: BORDER }} className="w-full border rounded px-2 py-1.5 text-sm">
        {cats.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        placeholder="Descrição (opcional)"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        style={{ borderColor: BORDER }}
        className="w-full border rounded px-2 py-1.5 text-sm"
      />
      <button onClick={submit} disabled={!shiftOpen} style={{ background: isEntrada ? GREEN : BRICK, color: "#fff" }} className="px-3 py-1.5 rounded text-sm disabled:opacity-40">
        Registar {isEntrada ? "entrada" : "saída"}
      </button>
    </div>
  );
}

function ShiftModal({ mode, onConfirmOpen, onConfirmClose, onClose }) {
  const [value, setValue] = useState("");
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div style={{ background: CARD }} className="rounded-lg p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold mb-3">{mode === "open" ? "Abrir caixa" : "Fechar caixa"}</div>
        <label className="text-xs" style={{ color: MUTED }}>
          {mode === "open" ? "Dinheiro inicial no caixa" : "Dinheiro contado no caixa agora"}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ borderColor: BORDER }}
          className="w-full border rounded px-2 py-1.5 text-sm mt-1 mb-3"
          placeholder="0"
        />
        <button
          onClick={() => (mode === "open" ? onConfirmOpen(Number(value) || 0) : onConfirmClose(Number(value) || 0))}
          style={{ background: TEAL, color: "#fff" }}
          className="w-full rounded py-2 text-sm font-medium"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}

// ================= BALANÇO =================
function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
      <div className="text-xs" style={{ color: MUTED }}>
        {label}
      </div>
      <div style={{ color: TEAL }} className="text-xl font-semibold mt-1">
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-0.5" style={{ color: MUTED }}>
          {sub}
        </div>
      )}
    </div>
  );
}
function ReportBlock({ title, children }) {
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
      <div className="text-sm font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}
function EmptyNote({ text }) {
  return (
    <div className="text-xs" style={{ color: MUTED }}>
      {text}
    </div>
  );
}
function BarRow({ label, value, max }) {
  return (
    <div className="flex items-center gap-2 text-sm py-0.5">
      <div className="w-32 truncate">{label}</div>
      <div style={{ background: BORDER }} className="flex-1 h-2 rounded">
        <div style={{ background: GOLD, width: `${(value / max) * 100}%` }} className="h-2 rounded" />
      </div>
      <div className="w-8 text-right text-xs" style={{ color: MUTED }}>
        {value}
      </div>
    </div>
  );
}

// ---------- Exportação de relatórios ----------
function exportReportExcel(downloadsCap, title, columns, rows) {
  const data = rows.map((r) => {
    const o = {};
    columns.forEach((c, i) => (o[c] = r[i]));
    return o;
  });
  return downloadWorkbook(downloadsCap, data, title.replace(/[^\w\-]+/g, "_").toLowerCase() + ".xlsx");
}

async function exportReportPDF(downloadsCap, title, columns, rows, meta) {
  if (!downloadsCap || !window.jspdf) return false;
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFontSize(15);
    doc.setTextColor(18, 60, 60);
    doc.text(BRAND_NAME, 40, 40);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(BRAND_TAGLINE, 40, 54);
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text(title, 40, 82);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    const sub = [meta && meta.business, meta && meta.period, "Emitido em " + new Date().toLocaleString("pt-PT")].filter(Boolean).join("   ·   ");
    doc.text(sub, 40, 96);
    if (window.autoTable) {
      window.autoTable(doc, {
        head: [columns],
        body: rows.map((r) => r.map((v) => (v === null || v === undefined ? "" : String(v)))),
        startY: 112,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [18, 60, 60], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [244, 248, 246] },
        margin: { left: 40, right: 40 },
      });
    } else {
      let y = 120;
      doc.setFontSize(8);
      doc.setTextColor(20, 20, 20);
      rows.forEach((r) => {
        doc.text(r.map((v) => String(v == null ? "" : v)).join("  |  ").slice(0, 160), 40, y);
        y += 12;
        if (y > doc.internal.pageSize.getHeight() - 40) {
          doc.addPage();
          y = 40;
        }
      });
    }
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(BRAND_NAME + " — página " + i + " de " + total, pageW / 2, doc.internal.pageSize.getHeight() - 20, { align: "center" });
    }
    const blob = doc.output("blob");
    await downloadsCap.save({ filename: title.replace(/[^\w\-]+/g, "_").toLowerCase() + ".pdf", data: blob });
    return true;
  } catch (e) {
    return false;
  }
}

function ExportButtons({ title, columns, rows, meta }) {
  const { downloads } = useContext(CapsContext);
  const disabled = !downloads || !rows || rows.length === 0;
  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => exportReportExcel(downloads, title, columns, rows)}
        disabled={disabled}
        style={{ borderColor: BORDER, color: GREEN }}
        className="border rounded px-2.5 py-1 text-xs font-medium disabled:opacity-40"
      >
        Excel
      </button>
      <button
        onClick={() => exportReportPDF(downloads, title, columns, rows, meta)}
        disabled={disabled}
        style={{ background: BRICK, color: "#fff" }}
        className="rounded px-2.5 py-1 text-xs font-medium disabled:opacity-40"
      >
        PDF
      </button>
    </div>
  );
}

function ReportTable({ title, columns, rows, meta, note, align }) {
  return (
    <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {note && (
            <div className="text-xs" style={{ color: MUTED }}>
              {note}
            </div>
          )}
        </div>
        <ExportButtons title={title} columns={columns} rows={rows} meta={meta} />
      </div>
      {rows.length === 0 ? (
        <EmptyNote text="Sem dados para o período seleccionado." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: BG }}>
                {columns.map((c, i) => (
                  <th key={c} style={{ color: MUTED, textAlign: align && align[i] === "r" ? "right" : "left" }} className="font-semibold uppercase tracking-wide px-2 py-2 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri} style={{ borderTop: "1px solid " + BORDER }}>
                  {r.map((v, ci) => (
                    <td key={ci} style={{ textAlign: align && align[ci] === "r" ? "right" : "left" }} className="px-2 py-2 whitespace-nowrap">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------- helpers de período ----------
function inPeriod(dateIso, from, to) {
  const d = dateIso.slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

const REPORTS = {
  vendas: [
    { id: "detalhado", label: "Detalhado" },
    { id: "abc", label: "Curva ABC" },
    { id: "top", label: "Top Produtos" },
    { id: "categoria", label: "Por Categoria" },
    { id: "equipe", label: "Equipa" },
    { id: "clientes", label: "Clientes" },
    { id: "horarios", label: "Melhores Horários" },
  ],
  financeiro: [
    { id: "dre", label: "Resultados (DRE)" },
    { id: "despesas", label: "Despesas por Categoria" },
    { id: "contabilidade", label: "Exportar p/ Contabilidade" },
    { id: "fechamento", label: "Fecho de Caixa" },
    { id: "iva", label: "Fiscal (IVA)" },
    { id: "movimentos", label: "Movimentos de Caixa" },
  ],
  estoque: [
    { id: "inventario", label: "Inventário" },
    { id: "ruptura", label: "Previsão de Ruptura" },
    { id: "auditoria", label: "Histórico & Quebras" },
    { id: "reposicao", label: "Reposição" },
    { id: "precos", label: "Histórico de Compras" },
    { id: "log", label: "Registo de Auditoria" },
  ],
};

function BalancoTab({ store }) {
  const [group, setGroup] = useState("vendas");
  const [report, setReport] = useState("detalhado");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const sales = store.sales.filter((s) => s.status !== "void" && inPeriod(s.date, from, to));
  const periodLabel = from || to ? "Período: " + (from || "início") + " a " + (to || "hoje") : "Período: todo o histórico";
  const meta = { business: store.config.businessName, period: periodLabel };

  const groups = [
    { id: "vendas", label: "VENDAS", color: "#5B4FE0" },
    { id: "financeiro", label: "FINANCEIRO", color: GREEN },
    { id: "estoque", label: "ESTOQUE", color: "#2E5AAC" },
  ];

  const selectGroup = (g) => {
    setGroup(g);
    setReport(REPORTS[g][0].id);
  };

  return (
    <div className="space-y-3">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
        {groups.map((g) => (
          <div key={g.id} className="flex items-center gap-2 flex-wrap">
            <button onClick={() => selectGroup(g.id)} style={{ color: g.color }} className="text-xs font-bold w-24 text-left shrink-0">
              {g.label}
            </button>
            <div className="flex gap-1.5 flex-wrap">
              {REPORTS[g.id].map((r) => {
                const active = group === g.id && report === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setGroup(g.id);
                      setReport(r.id);
                    }}
                    style={{ background: active ? g.color : BG, color: active ? "#fff" : INK, borderColor: active ? g.color : BORDER }}
                    className="border rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap"
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex gap-3 flex-wrap pt-2" style={{ borderTop: "1px solid " + BORDER }}>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>
              Período início
            </label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ borderColor: BORDER }} className="block border rounded px-2 py-1.5 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs" style={{ color: MUTED }}>
              Período final
            </label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ borderColor: BORDER }} className="block border rounded px-2 py-1.5 text-sm mt-1" />
          </div>
          {(from || to) && (
            <button onClick={() => { setFrom(""); setTo(""); }} style={{ color: TEAL }} className="text-xs font-medium self-end pb-2">
              Limpar período
            </button>
          )}
        </div>
      </div>

      {group === "vendas" && <VendasReports store={store} sales={sales} report={report} meta={meta} />}
      {group === "financeiro" && <FinanceiroReports store={store} sales={sales} report={report} meta={meta} from={from} to={to} />}
      {group === "estoque" && <EstoqueReports store={store} report={report} meta={meta} from={from} to={to} sales={sales} />}
    </div>
  );
}

function VendasReports({ store, sales, report, meta }) {
  const empName = (id) => (store.employees.find((e) => e.id === id) || {}).name || "—";
  const cliName = (id) => (store.clients.find((c) => c.id === id) || {}).name || "Consumidor Final";
  const prodCat = (name) => {
    const p = store.products.find((x) => x.name === name || name.startsWith(x.name));
    return p ? p.category : "—";
  };
  const lucro = (s) => s.items.reduce((a, it) => a + (it.price - it.cost) * it.qty, 0);

  const totalFat = sales.reduce((a, s) => a + s.total, 0);
  const totalLucro = sales.reduce((a, s) => a + lucro(s), 0);
  const totalDesc = sales.reduce((a, s) => a + (s.discount || 0), 0);

  // séries diárias para os mini-gráficos
  const serieFat = [];
  const serieLuc = [];
  const serieRot = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const doDia = sales.filter((s) => s.date.slice(0, 10) === d);
    serieRot.push(d.slice(8, 10) + "/" + d.slice(5, 7));
    serieFat.push(doDia.reduce((a, s) => a + s.total, 0));
    serieLuc.push(doDia.reduce((a, s) => a + lucro(s), 0));
  }
  const metodosAgg = {};
  sales.forEach((s) => s.payments.forEach((p) => (metodosAgg[p.method] = (metodosAgg[p.method] || 0) + p.amount)));
  const donutPagamentos = Object.entries(metodosAgg).map(([k, v]) => ({ label: k, value: v }));

  if (report === "detalhado") {
    const rows = [...sales].reverse().map((s) => [
      "#" + s.id.slice(0, 6).toUpperCase(),
      new Date(s.date).toLocaleString("pt-PT"),
      cliName(s.clientId),
      empName(s.employeeId),
      fmtMT(s.discount || 0),
      fmtMT(s.total),
      fmtMT(lucro(s)),
      s.payments.map((p) => p.method + ": " + fmtMT(p.amount)).join(", "),
    ]);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCard label="Nº de vendas" value={sales.length} />
          <StatCardChart label="Facturação" value={fmtMT(totalFat)} points={serieFat} labels={serieRot} />
          <StatCard label="Descontos" value={fmtMT(totalDesc)} />
          <StatCardChart label="Lucro" value={fmtMT(totalLucro)} points={serieLuc} labels={serieRot} color={GREEN} />
        </div>
        {donutPagamentos.length > 0 && (
          <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Distribuição por forma de pagamento</div>
            <DonutChart data={donutPagamentos} size={120} />
          </div>
        )}
        <ReportTable title="Extrato de Vendas" columns={["ID", "Data", "Cliente", "Vendedor", "Desconto", "Total", "Lucro", "Pagamento"]} rows={rows} meta={meta} align={["l","l","l","l","r","r","r","l"]} />
      </div>
    );
  }

  if (report === "top") {
    const agg = {};
    sales.forEach((s) =>
      s.items.forEach((it) => {
        if (!agg[it.name]) agg[it.name] = { qty: 0, fat: 0, luc: 0 };
        agg[it.name].qty += it.qty;
        agg[it.name].fat += it.price * it.qty;
        agg[it.name].luc += (it.price - it.cost) * it.qty;
      })
    );
    const list = Object.entries(agg).sort((a, b) => b[1].fat - a[1].fat);
    const rows = list.map(([name, v], i) => ["#" + (i + 1), name, prodCat(name), v.qty, fmtMT(v.fat), fmtMT(v.luc), (v.fat ? ((v.luc / v.fat) * 100).toFixed(1) : "0") + "%"]);
    return <ReportTable title="Top Produtos" columns={["#", "Produto", "Categoria", "Qtd", "Facturação", "Lucro", "Margem"]} rows={rows} meta={meta} align={["l","l","l","r","r","r","r"]} />;
  }

  if (report === "abc") {
    const agg = {};
    sales.forEach((s) =>
      s.items.forEach((it) => {
        if (!agg[it.name]) agg[it.name] = { qty: 0, fat: 0, luc: 0 };
        agg[it.name].qty += it.qty;
        agg[it.name].fat += it.price * it.qty;
        agg[it.name].luc += (it.price - it.cost) * it.qty;
      })
    );
    const list = Object.entries(agg).sort((a, b) => b[1].fat - a[1].fat);
    const grand = list.reduce((a, [, v]) => a + v.fat, 0);
    let acum = 0;
    const rows = list.map(([name, v], i) => {
      acum += v.fat;
      const pctAcum = grand ? (acum / grand) * 100 : 0;
      const classe = pctAcum <= 80 ? "A" : pctAcum <= 95 ? "B" : "C";
      return ["#" + (i + 1), name, classe, v.qty, fmtMT(v.fat), (grand ? (v.fat / grand) * 100 : 0).toFixed(1) + "%", pctAcum.toFixed(1) + "%", fmtMT(v.luc)];
    });
    const contA = rows.filter((r) => r[2] === "A").length;
    const contB = rows.filter((r) => r[2] === "B").length;
    const contC = rows.filter((r) => r[2] === "C").length;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard label="Classe A" value={contA} sub="80% da facturação" />
          <StatCard label="Classe B" value={contB} sub="próximos 15%" />
          <StatCard label="Classe C" value={contC} sub="últimos 5%" />
        </div>
        <ReportTable title="Curva ABC de Produtos" note="A = onde está o seu dinheiro: nunca deixe faltar. C = candidatos a descontinuar." columns={["#", "Produto", "Classe", "Qtd", "Facturação", "Peso", "Acumulado", "Lucro"]} rows={rows} meta={meta} align={["l","l","l","r","r","r","r","r"]} />
      </div>
    );
  }

  if (report === "categoria") {
    const agg = {};
    sales.forEach((s) =>
      s.items.forEach((it) => {
        const c = prodCat(it.name);
        if (!agg[c]) agg[c] = { qty: 0, fat: 0, luc: 0 };
        agg[c].qty += it.qty;
        agg[c].fat += it.price * it.qty;
        agg[c].luc += (it.price - it.cost) * it.qty;
      })
    );
    const list = Object.entries(agg).sort((a, b) => b[1].fat - a[1].fat);
    const grand = list.reduce((a, [, v]) => a + v.fat, 0);
    const rows = list.map(([c, v], i) => ["#" + (i + 1), c, v.qty, fmtMT(v.fat), fmtMT(v.luc), (v.fat ? ((v.luc / v.fat) * 100).toFixed(1) : "0") + "%", (grand ? ((v.fat / grand) * 100).toFixed(1) : "0") + "%"]);
    return (
      <div className="space-y-3">
        <ReportTable title="Desempenho por Categoria" columns={["#", "Categoria", "Itens", "Facturação", "Lucro", "Margem", "Quota"]} rows={rows} meta={meta} align={["l","l","r","r","r","r","r"]} />
        <ReportBlock title="Ranking por categoria">
          {list.length === 0 && <EmptyNote text="Sem vendas no período." />}
          {list.slice(0, 8).map(([c, v]) => (
            <BarRow key={c} label={c} value={Math.round(v.fat)} max={Math.round(list[0][1].fat)} />
          ))}
        </ReportBlock>
      </div>
    );
  }

  if (report === "equipe") {
    const agg = {};
    sales.forEach((s) => {
      const k = s.employeeId || "—";
      if (!agg[k]) agg[k] = { qtd: 0, fat: 0, luc: 0 };
      agg[k].qtd += 1;
      agg[k].fat += s.total;
      agg[k].luc += lucro(s);
    });
    const rows = Object.entries(agg)
      .sort((a, b) => b[1].fat - a[1].fat)
      .map(([id, v]) => {
        const e = store.employees.find((x) => x.id === id) || {};
        return [e.name || "—", ROLE_LABELS[e.role] || "—", v.qtd, fmtMT(v.fat), fmtMT(v.luc)];
      });
    return <ReportTable title="Performance por Funcionário" columns={["Funcionário", "Função", "Vendas", "Facturado", "Lucro"]} rows={rows} meta={meta} align={["l","l","r","r","r"]} />;
  }

  if (report === "clientes") {
    const agg = {};
    sales.forEach((s) => {
      const k = s.clientId || "—";
      if (!agg[k]) agg[k] = { compras: 0, gasto: 0, luc: 0, last: s.date, fav: {} };
      agg[k].compras += 1;
      agg[k].gasto += s.total;
      agg[k].luc += lucro(s);
      if (s.date > agg[k].last) agg[k].last = s.date;
      s.items.forEach((it) => (agg[k].fav[it.name] = (agg[k].fav[it.name] || 0) + it.qty));
    });
    const rows = Object.entries(agg)
      .sort((a, b) => b[1].gasto - a[1].gasto)
      .map(([id, v], i) => {
        const c = store.clients.find((x) => x.id === id) || {};
        const fav = Object.entries(v.fav).sort((a, b) => b[1] - a[1])[0];
        const divida = (c.debts || []).reduce((a, d) => a + d.amount, 0);
        return ["#" + (i + 1), c.name || "Consumidor Final", c.phone || "—", fav ? fav[0] : "—", v.compras, fmtMT(v.gasto), fmtMT(v.luc), fmtMT(divida), new Date(v.last).toLocaleDateString("pt-PT")];
      });
    return <ReportTable title="Comportamento de Clientes (CRM)" note="Ranking por volume e lucratividade" columns={["#", "Cliente", "Contacto", "Favorito", "Compras", "Gasto Total", "Lucro", "Dívida", "Últ. Compra"]} rows={rows} meta={meta} align={["l","l","l","l","r","r","r","r","l"]} />;
  }

  if (report === "horarios") {
    const byHour = {};
    const byDay = {};
    const dias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    sales.forEach((s) => {
      const d = new Date(s.date);
      const h = d.getHours();
      byHour[h] = (byHour[h] || 0) + s.total;
      byDay[d.getDay()] = (byDay[d.getDay()] || 0) + s.total;
    });
    const rows = Object.entries(byHour)
      .sort((a, b) => b[1] - a[1])
      .map(([h, v]) => [String(h).padStart(2, "0") + ":00 - " + String(Number(h) + 1).padStart(2, "0") + ":00", fmtMT(v)]);
    const dayRows = Object.entries(byDay).sort((a, b) => b[1] - a[1]);
    return (
      <div className="space-y-3">
        <ReportTable title="Facturação por Hora" columns={["Faixa horária", "Facturação"]} rows={rows} meta={meta} align={["l","r"]} />
        <ReportBlock title="Melhores dias da semana">
          {dayRows.length === 0 && <EmptyNote text="Sem vendas no período." />}
          {dayRows.map(([d, v]) => (
            <BarRow key={d} label={dias[d]} value={Math.round(v)} max={Math.round(dayRows[0][1])} />
          ))}
        </ReportBlock>
      </div>
    );
  }
  return null;
}

function FinanceiroReports({ store, sales, report, meta, from, to }) {
  const lucro = (s) => s.items.reduce((a, it) => a + (it.price - it.cost) * it.qty, 0);
  const movs = store.movimentosCaixa.filter((m) => inPeriod(m.date, from, to));
  const quebras = store.quebras.filter((q) => inPeriod(q.date, from, to));

  if (report === "dre") {
    const faturamento = sales.reduce((a, s) => a + s.total, 0);
    const lucroBruto = sales.reduce((a, s) => a + lucro(s), 0);
    const perdas = quebras.reduce((a, q) => a + q.custoImpacto, 0);
    const saidas = movs.filter((m) => m.type === "saida").reduce((a, m) => a + m.amount, 0);
    const entradas = movs.filter((m) => m.type === "entrada").reduce((a, m) => a + m.amount, 0);
    const dividas = store.clients.reduce((a, c) => a + c.debts.reduce((x, d) => x + d.amount, 0), 0);
    const lucroReal = lucroBruto - perdas - saidas + entradas;
    const serieDre = (() => {
      const fat = [], luc = [], rot = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        const doDia = sales.filter((s) => s.date.slice(0, 10) === d);
        rot.push(d.slice(8, 10) + "/" + d.slice(5, 7));
        fat.push(doDia.reduce((a, s) => a + s.total, 0));
        luc.push(doDia.reduce((a, s) => a + lucro(s), 0));
      }
      return { fat, luc, rot };
    })();
    const rows = [
      ["Facturação total", fmtMT(faturamento)],
      ["Lucro bruto (receita − custo)", fmtMT(lucroBruto)],
      ["Quebras / perdas de stock", "-" + fmtMT(perdas)],
      ["Saídas de caixa (despesas)", "-" + fmtMT(saidas)],
      ["Entradas extra de caixa", "+" + fmtMT(entradas)],
      ["Resultado líquido estimado", fmtMT(lucroReal)],
      ["Dívidas de clientes (a receber)", fmtMT(dividas)],
    ];
    return (
      <div className="space-y-3">
        <div style={{ background: lucroReal >= 0 ? "#E4F4EA" : "#FBE9E7", borderColor: lucroReal >= 0 ? "#8FCBA6" : "#F0C6C0" }} className="border rounded-lg p-4">
          <div className="text-xs" style={{ color: MUTED }}>
            Resultado líquido estimado no período
          </div>
          <div style={{ color: lucroReal >= 0 ? GREEN : BRICK }} className="text-3xl font-semibold mt-1">
            {fmtMT(lucroReal)}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <StatCardChart label="Facturação" value={fmtMT(faturamento)} points={serieDre.fat} labels={serieDre.rot} />
          <StatCardChart label="Lucro bruto" value={fmtMT(lucroBruto)} points={serieDre.luc} labels={serieDre.rot} color={GREEN} />
          <StatCard label="Perdas" value={fmtMT(perdas)} />
          <StatCard label="A receber" value={fmtMT(dividas)} />
        </div>
        <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3">
          <div className="text-sm font-semibold mb-2">Composição do resultado</div>
          <DonutChart
            data={[
              { label: "Lucro líquido", value: Math.max(0, lucroReal) },
              { label: "Perdas", value: perdas },
              { label: "Despesas", value: saidas },
            ].filter((d) => d.value > 0)}
            size={120}
          />
        </div>
        <ReportTable title="Demonstração de Resultados" columns={["Rubrica", "Valor"]} rows={rows} meta={meta} align={["l","r"]} />
      </div>
    );
  }

  if (report === "despesas") {
    const agg = {};
    movs.forEach((m) => {
      const k = (m.type === "saida" ? "Saída · " : "Entrada · ") + (m.categoria || "Outros");
      agg[k] = (agg[k] || 0) + m.amount;
    });
    const list = Object.entries(agg).sort((a, b) => b[1] - a[1]);
    const rows = list.map(([k, v]) => [k, fmtMT(v)]);
    const totalSaidas = movs.filter((m) => m.type === "saida").reduce((a, m) => a + m.amount, 0);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Total de despesas" value={fmtMT(totalSaidas)} />
          <StatCard label="Categorias usadas" value={list.length} />
        </div>
        <ReportTable title="Movimentos por Categoria" columns={["Categoria", "Total"]} rows={rows} meta={meta} align={["l","r"]} />
        <ReportBlock title="Peso de cada categoria">
          {list.length === 0 && <EmptyNote text="Sem movimentos no período." />}
          {list.map(([k, v]) => (
            <BarRow key={k} label={k} value={Math.round(v)} max={Math.round(list[0][1])} />
          ))}
        </ReportBlock>
      </div>
    );
  }

  if (report === "contabilidade") {
    const iva = store.config.iva || {};
    const taxa = iva.isento ? 0 : Number(iva.taxa) || 0;
    const emp = store.config.empresa || {};
    const rows = [...sales].reverse().map((s) => {
      const bruto = s.total;
      const base = iva.precosIncluemIva && taxa ? bruto / (1 + taxa / 100) : bruto;
      const valorIva = iva.precosIncluemIva && taxa ? bruto - base : bruto * (taxa / 100);
      const cli = store.clients.find((c) => c.id === s.clientId);
      return [
        s.numero || s.id,
        new Date(s.date).toLocaleDateString("pt-PT"),
        cli ? cli.name : "Consumidor Final",
        cli && cli.nuit ? cli.nuit : "",
        base.toFixed(2),
        taxa + "%",
        valorIva.toFixed(2),
        bruto.toFixed(2),
        s.payments.map((p) => p.method).join("/"),
      ];
    });
    return (
      <div className="space-y-3">
        <div style={{ background: SOFTGOLD, borderColor: GOLD }} className="border rounded-lg p-3 text-xs">
          Ficheiro pronto a entregar ao contabilista: uma linha por documento, com base tributável, IVA e total. Exporte em Excel e envie mensalmente.
          Empresa: {emp.nome || store.config.businessName} {emp.nuit ? "· NUIT " + emp.nuit : ""}
        </div>
        <ReportTable title="Mapa de Vendas para Contabilidade" columns={["Documento", "Data", "Cliente", "NUIT", "Base", "Taxa", "IVA", "Total", "Meio pgto"]} rows={rows} meta={meta} align={["l","l","l","l","r","r","r","r","l"]} />
      </div>
    );
  }

  if (report === "fechamento") {
    const shifts = store.shifts.filter((s) => inPeriod(s.openedAt, from, to));
    const rows = [...shifts].reverse().map((s) => {
      const emp = "—";
      const dif = s.closedAt ? (s.closingCash || 0) - (s.expectedCash || 0) : null;
      return [
        new Date(s.openedAt).toLocaleString("pt-PT"),
        s.closedAt ? new Date(s.closedAt).toLocaleString("pt-PT") : "Em aberto",
        fmtMT(s.openingCash || 0),
        s.closedAt ? fmtMT(s.expectedCash || 0) : "—",
        s.closedAt ? fmtMT(s.closingCash || 0) : "—",
        dif === null ? "—" : (dif > 0 ? "+" : "") + fmtMT(dif),
        dif === null ? "Aberto" : dif === 0 ? "Certo" : dif > 0 ? "Sobra" : "Quebra",
      ];
    });
    return <ReportTable title="Fecho de Caixa" columns={["Abertura", "Fecho", "Fundo inicial", "Esperado", "Contado", "Diferença", "Estado"]} rows={rows} meta={meta} align={["l","l","r","r","r","r","l"]} />;
  }

  if (report === "iva") {
    const iva = store.config.iva || {};
    const taxa = iva.isento ? 0 : Number(iva.taxa) || 0;
    const rows = [...sales].reverse().map((s) => {
      const base = iva.precosIncluemIva && taxa ? s.total / (1 + taxa / 100) : s.total;
      const valorIva = iva.precosIncluemIva && taxa ? s.total - base : s.total * (taxa / 100);
      return ["#" + s.id.slice(0, 6).toUpperCase(), new Date(s.date).toLocaleDateString("pt-PT"), fmtMT(base), taxa + "%", fmtMT(valorIva), fmtMT(iva.precosIncluemIva ? s.total : s.total + valorIva)];
    });
    const totalIva = rows.reduce((a, r, i) => {
      const s = [...sales].reverse()[i];
      const base = iva.precosIncluemIva && taxa ? s.total / (1 + taxa / 100) : s.total;
      return a + (iva.precosIncluemIva && taxa ? s.total - base : s.total * (taxa / 100));
    }, 0);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Taxa aplicada" value={iva.isento ? "Isento" : taxa + "%"} sub={iva.precosIncluemIva ? "preços com IVA incluído" : "IVA acrescido"} />
          <StatCard label="IVA do período" value={fmtMT(totalIva)} />
        </div>
        <ReportTable title="Mapa Fiscal (IVA)" note="Valores calculados pelo sistema — confirme sempre com o seu contabilista antes de submeter à Autoridade Tributária." columns={["Documento", "Data", "Base tributável", "Taxa", "IVA", "Total"]} rows={rows} meta={meta} align={["l","l","r","r","r","r"]} />
      </div>
    );
  }

  if (report === "movimentos") {
    const entradas = movs.filter((m) => m.type === "entrada").reduce((a, m) => a + m.amount, 0);
    const saidas = movs.filter((m) => m.type === "saida").reduce((a, m) => a + m.amount, 0);
    const vendasPorMetodo = {};
    sales.forEach((s) => s.payments.forEach((p) => (vendasPorMetodo[p.method] = (vendasPorMetodo[p.method] || 0) + p.amount)));
    const rows = [...movs].reverse().map((m) => {
      const emp = "—";
      return [new Date(m.date).toLocaleString("pt-PT"), m.motivo || (m.type === "entrada" ? "Entrada" : "Saída"), m.type === "entrada" ? "ENTRADA" : "SAÍDA", (m.type === "entrada" ? "+" : "-") + fmtMT(m.amount)];
    });
    const metodoRows = Object.entries(vendasPorMetodo).map(([k, v]) => [k, fmtMT(v)]);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard label="Total entradas" value={fmtMT(entradas)} />
          <StatCard label="Total saídas" value={fmtMT(saidas)} />
          <StatCard label="Saldo do período" value={fmtMT(entradas - saidas)} />
        </div>
        <ReportTable title="Recebimentos por Forma de Pagamento" columns={["Forma de pagamento", "Total recebido"]} rows={metodoRows} meta={meta} align={["l","r"]} />
        <ReportTable title="Extrato de Movimentos de Caixa" columns={["Data", "Descrição", "Tipo", "Valor"]} rows={rows} meta={meta} align={["l","l","l","r"]} />
      </div>
    );
  }
  return null;
}

function EstoqueReports({ store, report, meta, from, to, sales }) {
  if (report === "inventario") {
    const custoTotal = store.products.reduce((a, p) => a + (p.cost || 0) * getStock(p, store.products), 0);
    const vendaPot = store.products.reduce((a, p) => a + (p.price || 0) * getStock(p, store.products), 0);
    const rows = store.products.map((p) => {
      const st = getStock(p, store.products);
      const estado = st <= 0 ? "Esgotado" : isLowStock(p, store.products) ? "Baixo stock" : nearExpiry(p).length ? "A vencer" : "Normal";
      return [p.name, p.category || "—", estado, st + " " + (p.unit || "un"), fmtMT(p.cost || 0), fmtMT(p.price || 0), fmtMT((p.cost || 0) * st), fmtMT((p.price || 0) * st)];
    });
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <StatCard label="Custo total do stock" value={fmtMT(custoTotal)} sub="dinheiro investido" />
          <StatCard label="Venda potencial" value={fmtMT(vendaPot)} sub="se vender tudo" />
          <StatCard label="Margem potencial" value={fmtMT(vendaPot - custoTotal)} />
        </div>
        <ReportTable title="Posição de Inventário" columns={["Produto", "Categoria", "Estado", "Stock", "Custo un.", "Preço un.", "Custo total", "Venda total"]} rows={rows} meta={meta} align={["l","l","l","r","r","r","r","r"]} />
      </div>
    );
  }

  if (report === "ruptura") {
    const dias = 30;
    const desde = new Date(Date.now() - dias * 86400000).toISOString();
    const vendasRecentes = store.sales.filter((s) => s.status !== "void" && s.date >= desde);
    const consumo = {};
    vendasRecentes.forEach((s) => s.items.forEach((it) => (consumo[it.productId] = (consumo[it.productId] || 0) + it.qty)));
    const rows = store.products
      .map((p) => {
        const total = consumo[p.id] || 0;
        const porDia = total / dias;
        const st = getStock(p, store.products);
        const diasRestantes = porDia > 0 ? st / porDia : null;
        return { p, porDia, st, diasRestantes };
      })
      .filter((r) => r.porDia > 0)
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
      .map((r) => [
        r.p.name,
        r.p.category || "—",
        r.st + " " + (r.p.unit || "un"),
        r.porDia.toFixed(2),
        r.diasRestantes === null ? "—" : Math.floor(r.diasRestantes) + " dias",
        r.diasRestantes === null ? "—" : new Date(Date.now() + r.diasRestantes * 86400000).toLocaleDateString("pt-PT"),
        r.diasRestantes < 3 ? "CRÍTICO" : r.diasRestantes < 7 ? "Atenção" : "Normal",
      ]);
    const criticos = rows.filter((r) => r[6] === "CRÍTICO").length;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Produtos em risco" value={criticos} sub="acabam em menos de 3 dias" />
          <StatCard label="Produtos analisados" value={rows.length} sub="com vendas nos últimos 30 dias" />
        </div>
        <ReportTable title="Previsão de Ruptura de Stock" note="Baseado na média de consumo dos últimos 30 dias. Produtos sem vendas recentes não aparecem." columns={["Produto", "Categoria", "Stock", "Consumo/dia", "Dura", "Acaba em", "Estado"]} rows={rows} meta={meta} align={["l","l","r","r","r","l","l"]} />
      </div>
    );
  }

  if (report === "precos") {
    const rows = [...store.purchases]
      .reverse()
      .map((c) => {
        const p = store.products.find((x) => x.id === c.items[0].productId) || {};
        const f = store.suppliers.find((s) => s.id === c.supplierId) || {};
        return [new Date(c.date).toLocaleDateString("pt-PT"), p.name || "—", f.name || "—", c.items[0].qty, fmtMT(c.items[0].cost), fmtMT(c.total)];
      });
    return <ReportTable title="Histórico de Compras e Preços" note="Compare o custo unitário ao longo do tempo para detectar subidas de preço dos fornecedores." columns={["Data", "Produto", "Fornecedor", "Qtd", "Custo un.", "Total"]} rows={rows} meta={meta} align={["l","l","l","r","r","r"]} />;
  }

  if (report === "log") {
    const registos = (store.audit || []).filter((a) => inPeriod(a.date, from, to));
    const rows = [...registos].reverse().map((a) => [new Date(a.date).toLocaleString("pt-PT"), a.employeeName || "—", a.acao, a.detalhe, a.valor === null ? "—" : fmtMT(a.valor)]);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Registos no período" value={registos.length} />
          <StatCard label="Cancelamentos" value={registos.filter((a) => a.acao === "CANCELAMENTO").length} />
        </div>
        <ReportTable title="Registo de Auditoria" note="Quem fez o quê e quando: vendas, cancelamentos, descontos, quebras e movimentos de caixa." columns={["Data/Hora", "Utilizador", "Acção", "Detalhe", "Valor"]} rows={rows} meta={meta} align={["l","l","l","l","r"]} />
      </div>
    );
  }

  if (report === "auditoria") {
    const quebras = store.quebras.filter((q) => inPeriod(q.date, from, to));
    const rows = [...quebras].reverse().map((q) => {
      const p = store.products.find((x) => x.id === q.productId) || {};
      return [new Date(q.date).toLocaleString("pt-PT"), p.name || "—", p.category || "—", q.motivo, q.qty, fmtMT(q.custoImpacto)];
    });
    const total = quebras.reduce((a, q) => a + q.custoImpacto, 0);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Ocorrências" value={quebras.length} />
          <StatCard label="Perda total" value={fmtMT(total)} />
        </div>
        <ReportTable title="Auditoria de Quebras e Perdas" columns={["Data/Hora", "Produto", "Categoria", "Motivo", "Qtd", "Custo"]} rows={rows} meta={meta} align={["l","l","l","l","r","r"]} />
      </div>
    );
  }

  if (report === "reposicao") {
    const list = store.products.filter((p) => isLowStock(p, store.products) || getStock(p, store.products) <= 0);
    const rows = list.map((p) => {
      const st = getStock(p, store.products);
      const sugerido = Math.max((p.minStock || 0) * 2 - st, 1);
      return [p.name, p.category || "—", st + " " + (p.unit || "un"), (p.minStock || 0) + " " + (p.unit || "un"), sugerido + " " + (p.unit || "un"), fmtMT(sugerido * (p.cost || 0))];
    });
    const investimento = rows.reduce((a, r, i) => {
      const p = list[i];
      const sugerido = Math.max((p.minStock || 0) * 2 - getStock(p, store.products), 1);
      return a + sugerido * (p.cost || 0);
    }, 0);
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Produtos a repor" value={list.length} />
          <StatCard label="Investimento estimado" value={fmtMT(investimento)} />
        </div>
        <ReportTable title="Sugestão de Reposição" note="Quantidade sugerida = o dobro do stock mínimo, menos o que resta." columns={["Produto", "Categoria", "Stock actual", "Stock mínimo", "Comprar", "Custo estimado"]} rows={rows} meta={meta} align={["l","l","r","r","r","r"]} />
      </div>
    );
  }
  return null;
}

function ImpressaoConfig({ store, persist }) {
  const ds = store.config.docSeries || { prefixo: "FT", proximo: 1 };
  const [prefixo, setPrefixo] = useState(ds.prefixo || "FT");
  const [proximo, setProximo] = useState(ds.proximo || 1);
  const [papel, setPapel] = useState(store.config.impressao.papel);
  const [visorCliente, setVisorCliente] = useState(store.config.impressao.visorCliente);
  const [mensagem, setMensagem] = useState(store.config.receiptMessage);
  const save = () =>
    persist({
      ...store,
      config: {
        ...store.config,
        receiptMessage: mensagem,
        impressao: { ...store.config.impressao, papel, visorCliente },
        docSeries: { prefixo: (prefixo || "FT").toUpperCase(), ano: new Date().getFullYear(), proximo: Number(proximo) || 1 },
      },
    });
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
      <div className="text-xs" style={{ color: MUTED }}>
        Estas definições ficam guardadas para quando ligarmos a impressão física de recibos e comandas.
      </div>
    </div>
  );
}

function IvaConfig({ store, persist }) {
  const [taxa, setTaxa] = useState(store.config.iva.taxa);
  const [precosIncluemIva, setPrecosIncluemIva] = useState(store.config.iva.precosIncluemIva);
  const [isento, setIsento] = useState(store.config.iva.isento);
  const save = () => persist({ ...store, config: { ...store.config, iva: { taxa: Number(taxa) || 0, precosIncluemIva, isento } } });
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

function ContasConfig({ store, persist }) {
  const [contas, setContas] = useState(store.config.contas);
  const update = (id, field, value) => setContas((c) => ({ ...c, [id]: { ...c[id], [field]: value } }));
  const save = () => persist({ ...store, config: { ...store.config, contas } });
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

function EmpresaConfig({ store, persist }) {
  const [businessName, setBusinessName] = useState(store.config.businessName);
  const [empresa, setEmpresa] = useState(store.config.empresa);
  const update = (field, value) => setEmpresa((e) => ({ ...e, [field]: value }));
  const save = () => persist({ ...store, config: { ...store.config, businessName, empresa } });
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
          {["Maputo Cidade","Maputo Província","Gaza","Inhambane","Sofala","Manica","Tete","Zambézia","Nampula","Cabo Delgado","Niassa"].map((p) => (
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

function BackupsLocais({ store, persist }) {
  const [confirmar, setConfirmar] = useState(null);
  const [msg, setMsg] = useState("");
  const chaves = [];
  try {
    Object.keys(localStorage)
      .filter((k) => k.includes(":backup:"))
      .sort()
      .reverse()
      .forEach((k) => chaves.push(k));
  } catch (e) {
    // sem acesso
  }
  const restaurar = (k) => {
    if (confirmar !== k) {
      setConfirmar(k);
      setMsg("Clique novamente para confirmar — isto substitui todos os dados actuais.");
      return;
    }
    try {
      const dados = JSON.parse(localStorage.getItem(k));
      persist(withDefaults(dados));
      setMsg("Dados restaurados a partir de " + k.split(":backup:")[1] + ".");
    } catch (e) {
      setMsg("Não foi possível ler essa cópia.");
    }
    setConfirmar(null);
  };
  if (chaves.length === 0) {
    return (
      <div className="text-xs" style={{ color: MUTED }}>
        Ainda não há cópias guardadas. A primeira é criada automaticamente após a próxima venda.
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {chaves.map((k) => {
        const data = k.split(":backup:")[1];
        let tamanho = 0;
        try {
          tamanho = (localStorage.getItem(k) || "").length;
        } catch (e) {}
        return (
          <div key={k} style={{ borderColor: BORDER }} className="border rounded px-2.5 py-1.5 flex items-center justify-between text-xs">
            <span>
              {data} <span style={{ color: MUTED }}>({Math.round(tamanho / 1024)} KB)</span>
            </span>
            <button onClick={() => restaurar(k)} style={{ color: confirmar === k ? BRICK : TEAL }} className="font-medium">
              {confirmar === k ? "Confirmar restauro" : "Restaurar"}
            </button>
          </div>
        );
      })}
      {msg && (
        <div className="text-xs" style={{ color: MUTED }}>
          {msg}
        </div>
      )}
    </div>
  );
}

function SegurancaConfig({ store, persist }) {
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [confirmImport, setConfirmImport] = useState(false);
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
  const doImport = () => {
    if (!confirmImport) {
      setConfirmImport(true);
      setMsg("Clique novamente para confirmar — isto substitui todos os dados actuais.");
      return;
    }
    try {
      const parsed = JSON.parse(importText);
      persist(withDefaults(parsed));
      setMsg("Dados restaurados.");
      setConfirmImport(false);
      setImportText("");
    } catch (e) {
      setMsg("JSON inválido.");
      setConfirmImport(false);
    }
  };

  return (
    <div className="space-y-3">
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
        <div className="text-sm font-semibold">Exportar dados (cópia de segurança)</div>
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
      </div>
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
        <div className="text-sm font-semibold">Cópias de segurança automáticas neste dispositivo</div>
        <div className="text-xs" style={{ color: MUTED }}>
          O sistema guarda um instantâneo por dia (últimos 7 dias) neste navegador. Restaurar substitui todos os dados actuais.
        </div>
        <BackupsLocais store={store} persist={persist} />
      </div>
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 space-y-2">
        <div className="text-sm font-semibold">Importar dados</div>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Cole aqui o JSON exportado anteriormente"
          style={{ borderColor: BORDER }}
          className="w-full border rounded px-2 py-1.5 text-xs h-32"
        />
        <button onClick={doImport} style={{ background: BRICK, color: "#fff" }} className="px-3 py-1.5 rounded text-sm">
          {confirmImport ? "Confirmar substituição" : "Restaurar"}
        </button>
      </div>
      {msg && (
        <div className="text-xs" style={{ color: MUTED }}>
          {msg}
        </div>
      )}
    </div>
  );
}

function ModulosConfig({ store, persist }) {
  const toggleModule = (id) => persist({ ...store, config: { ...store.config, modules: { ...store.config.modules, [id]: !store.config.modules[id] } } });
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

function ConfigTab({ store, persist }) {
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
              style={{ background: active ? TEAL : CARD, color: active ? "#fff" : INK, borderColor: BORDER }}
              className="border rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap"
            >
              <Icon size={13} />
              {c.label}
            </button>
          );
        })}
      </div>
      {cat === "impressao" && <ImpressaoConfig store={store} persist={persist} />}
      {cat === "iva" && <IvaConfig store={store} persist={persist} />}
      {cat === "contas" && <ContasConfig store={store} persist={persist} />}
      {cat === "empresa" && <EmpresaConfig store={store} persist={persist} />}
      {cat === "seguranca" && <SegurancaConfig store={store} persist={persist} />}
      <div style={{ background: CARD, borderColor: BORDER }} className="border rounded-lg p-3 mt-4">
        <div className="text-sm font-semibold mb-2">Áreas activas do negócio</div>
        <ModulosConfig store={store} persist={persist} />
      </div>
    </div>
  );
}

const rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(<PDV />);
