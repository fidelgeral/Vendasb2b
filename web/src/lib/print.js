import { fmtMT, saveBlob } from "./utils.js";
import { BRAND_NAME, BRAND_TAGLINE } from "./theme.js";
import { code128SVG } from "./barcode.js";

// Bibliotecas pesadas (jsPDF ~1 MB, XLSX) carregadas só quando é preciso gerar
// um PDF ou um Excel — assim não pesam no arranque da aplicação.
async function loadPdf() {
  const [{ jsPDF }, autoTableMod] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  return { jsPDF, autoTable: autoTableMod.default };
}
async function loadXlsx() {
  return import("xlsx");
}

// Recibo térmico 58/80mm — abre janela e chama a impressão do navegador
export function imprimirReciboTermico(sale, store, clientes) {
  const largura = (store.config.impressao && store.config.impressao.papel) === "58mm" ? 58 : 80;
  const emp = store.config.empresa || {};
  const iva = store.config.iva || {};
  const taxa = iva.isento ? 0 : sale.ivaTaxa != null ? Number(sale.ivaTaxa) : Number(iva.taxa) || 0;
  const cli = clientes.find((c) => c.id === sale.clientId);
  const bruto = sale.total;
  const base = iva.precosIncluemIva && taxa ? bruto / (1 + taxa / 100) : bruto;
  const valorIva = iva.precosIncluemIva && taxa ? bruto - base : bruto * (taxa / 100);
  const esc = (t) => String(t == null ? "" : t).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const linhas = sale.items
    .map(
      (it) =>
        '<tr><td colspan="2">' + esc(it.name) + "</td></tr>" +
        "<tr><td>" + it.qty + " x " + fmtMT(it.price) + '</td><td class="r">' + fmtMT(it.price * it.qty) + "</td></tr>"
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
      (emp.logo ? '<div class="c"><img src="' + emp.logo + '" style="max-width:85%;max-height:28mm;margin:0 auto 4px"/></div>' : "") +
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
      "<script>window.onload=function(){window.print();}<\/script></body></html>"
  );
  w.document.close();
  return true;
}

export async function gerarReciboPDF(sale, store, clientes) {
  try {
    const emp = store.config.empresa || {};
    const iva = store.config.iva || {};
    const taxa = iva.isento ? 0 : sale.ivaTaxa != null ? Number(sale.ivaTaxa) : Number(iva.taxa) || 0;
    const cli = clientes.find((c) => c.id === sale.clientId);
    const { jsPDF, autoTable } = await loadPdf();
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 42;
    if (emp.logo) {
      try {
        const props = doc.getImageProperties(emp.logo);
        const maxW = 150;
        const maxH = 70;
        let lw = props.width;
        let lh = props.height;
        const r = Math.min(maxW / lw, maxH / lh);
        lw = lw * r;
        lh = lh * r;
        doc.addImage(emp.logo, "PNG", 40, y - 18, lw, lh);
        y += lh - 2;
      } catch (e) {
        /* logótipo inválido: ignora */
      }
    }
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
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

    const linhas = sale.items.map((it) => [it.name, String(it.qty), fmtMT(it.price), taxa + "%", fmtMT(it.price * it.qty)]);
    autoTable(doc, {
      head: [["Descrição", "Qtd", "Preço un.", "IVA", "Total"]],
      body: linhas,
      startY: y,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
      margin: { left: 40, right: 40 },
    });
    y = doc.lastAutoTable.finalY + 18;

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
    saveBlob("recibo_" + String(sale.numero || sale.id).replace(/[^\w]+/g, "_") + ".pdf", doc.output("blob"));
    return true;
  } catch (e) {
    return false;
  }
}

// Cotação / orçamento (documento não-fiscal em folha A4) — abre o diálogo de impressão.
export function imprimirCotacao(cot, store, clientes) {
  const emp = store.config.empresa || {};
  const cli = clientes.find((c) => c.id === cot.clientId);
  const esc = (t) => String(t == null ? "" : t).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const taxa = cot.ivaTaxa == null ? 0 : Number(cot.ivaTaxa) || 0;
  const linhas = cot.items
    .map(
      (it) =>
        "<tr><td>" + esc(it.name) + "</td><td class='r'>" + it.qty + "</td><td class='r'>" + fmtMT(it.price) + "</td><td class='r'>" + fmtMT(it.price * it.qty) + "</td></tr>"
    )
    .join("");
  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) return false;
  w.document.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cotação ' + esc(cot.numero || "") + '</title><style>' +
      "body{font-family:system-ui,Arial,sans-serif;margin:14mm;color:#111;font-size:11pt}" +
      "h1{font-size:16pt;color:#4F46E5;margin:0}.muted{color:#666;font-size:9pt}" +
      ".doc{font-size:14pt;font-weight:700;margin:8mm 0 2mm}" +
      "table{width:100%;border-collapse:collapse;margin-top:4mm}" +
      "th,td{padding:5px 6px;border-bottom:1px solid #ddd;text-align:left}.r{text-align:right}" +
      "th{background:#4F46E5;color:#fff}tfoot td{font-weight:700;border:none}" +
      "@media print{@page{margin:12mm}}" +
      "</style></head><body>" +
      (emp.logo ? '<img src="' + emp.logo + '" style="max-height:26mm;max-width:70mm;display:block;margin-bottom:4mm"/>' : "") +
      "<h1>" + esc(emp.nome || store.config.businessName) + "</h1>" +
      '<div class="muted">' +
      [emp.endereco, [emp.bairro, emp.cidade, emp.provincia].filter(Boolean).join(", "), emp.contacto ? "Tel: " + esc(emp.contacto) : "", emp.nuit ? "NUIT: " + esc(emp.nuit) : ""]
        .filter(Boolean)
        .map(esc)
        .join(" · ") +
      "</div>" +
      '<div class="doc">COTAÇÃO ' + esc(cot.numero || "") + "</div>" +
      '<div class="muted">Data: ' + new Date(cot.date || Date.now()).toLocaleDateString("pt-PT") + "</div>" +
      '<div class="muted">Cliente: ' + esc(cli ? cli.name : "Consumidor Final") + "</div>" +
      "<table><thead><tr><th>Descrição</th><th class='r'>Qtd</th><th class='r'>Preço un.</th><th class='r'>Total</th></tr></thead>" +
      "<tbody>" + linhas + "</tbody>" +
      "<tfoot>" +
      (cot.discount ? "<tr><td colspan='3' class='r'>Desconto</td><td class='r'>-" + fmtMT(cot.discount) + "</td></tr>" : "") +
      (taxa ? "<tr><td colspan='3' class='r'>IVA (" + taxa + "%)</td><td class='r'>incluído</td></tr>" : "") +
      "<tr><td colspan='3' class='r'>TOTAL</td><td class='r'>" + fmtMT(cot.total) + "</td></tr>" +
      "</tfoot></table>" +
      '<p class="muted" style="margin-top:8mm">Documento não-fiscal. Cotação válida por 15 dias. Os preços podem variar conforme a disponibilidade de stock.</p>' +
      '<div class="muted" style="margin-top:10mm">Processado por ' + BRAND_NAME + "</div>" +
      "<script>window.onload=function(){window.print();}<\/script></body></html>"
  );
  w.document.close();
  return true;
}

// Pedido/comanda para a cozinha ou bar (talão térmico) — sem valores de pagamento.
export function imprimirPedidoMesa(mesaLabel, items, store) {
  const largura = (store.config.impressao && store.config.impressao.papel) === "58mm" ? 58 : 80;
  const esc = (t) => String(t == null ? "" : t).replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]));
  const linhas = items.map((it) => "<tr><td class='q'>" + it.qty + "x</td><td>" + esc(it.name) + "</td></tr>").join("");
  const w = window.open("", "_blank", "width=420,height=760");
  if (!w) return false;
  w.document.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pedido ' + esc(mesaLabel) + '</title><style>' +
      "*{box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:13px;margin:0;padding:4mm;width:" + largura + "mm;color:#000}" +
      ".c{text-align:center}h1{font-size:16px;margin:0 0 4px}table{width:100%;border-collapse:collapse}" +
      "td{padding:3px 0;vertical-align:top;font-size:14px;font-weight:bold}.q{width:34px}" +
      "hr{border:none;border-top:1px dashed #000;margin:4px 0}" +
      "@media print{@page{size:" + largura + "mm auto;margin:0}body{padding:3mm}}" +
      "</style></head><body>" +
      '<div class="c"><h1>PEDIDO</h1><div>' + esc(mesaLabel) + "</div><div>" + new Date().toLocaleString("pt-PT") + "</div></div>" +
      "<hr><table>" + linhas + "</table><hr>" +
      "<script>window.onload=function(){window.print();}<\/script></body></html>"
  );
  w.document.close();
  return true;
}

export function imprimirEtiquetas(produtos, empresaNome) {
  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) return false;
  const cells = produtos
    .map(
      (p) => '<div class="et"><div class="nome">' + String(p.name).replace(/</g, "&lt;") + "</div>" +
        (p.codigo ? '<div class="bc">' + code128SVG(p.codigo, { height: 34, moduleWidth: 1.4, textSize: 9 }) + "</div>" : '<div class="cod">&nbsp;</div>') +
        '<div class="preco">' + fmtMT(p.price) + "</div></div>"
    )
    .join("");
  w.document.write(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Etiquetas</title><style>' +
      "body{font-family:system-ui,sans-serif;margin:12mm;} h1{font-size:12pt;color:#4F46E5;margin:0 0 6mm;}" +
      ".grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;}" +
      ".et{border:1px solid #bbb;border-radius:3mm;padding:3mm;text-align:center;page-break-inside:avoid;}" +
      ".nome{font-size:9pt;font-weight:600;min-height:9mm;}" +
      ".cod{font-size:7pt;color:#666;font-family:monospace;margin:1mm 0;}" +
      ".bc{margin:1.5mm 0;}.bc svg{max-width:100%;height:auto;}" +
      ".preco{font-size:15pt;font-weight:800;color:#059669;}" +
      "@media print{ @page{margin:8mm;} }" +
      "</style></head><body><h1>" + String(empresaNome || "").replace(/</g, "&lt;") + " — etiquetas de preço</h1><div class=\"grid\">" + cells + "</div>" +
      "<script>window.onload=function(){window.print();}<\/script></body></html>"
  );
  w.document.close();
  return true;
}

export async function downloadWorkbook(rows, filename) {
  try {
    const XLSX = await loadXlsx();
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtos");
    const arr = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveBlob(filename, new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    return true;
  } catch (e) {
    return false;
  }
}

export async function exportReportExcel(title, columns, rows) {
  const data = rows.map((r) => {
    const o = {};
    columns.forEach((c, i) => (o[c] = r[i]));
    return o;
  });
  return downloadWorkbook(data, title.replace(/[^\w-]+/g, "_").toLowerCase() + ".xlsx");
}

export async function exportReportPDF(title, columns, rows, meta) {
  try {
    const { jsPDF, autoTable } = await loadPdf();
    const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait", unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const emp = (meta && meta.empresa) || {};

    // Logótipo da empresa (canto superior direito), proporcional.
    if (emp.logo) {
      try {
        const props = doc.getImageProperties(emp.logo);
        const maxW = 120;
        const maxH = 54;
        const r = Math.min(maxW / props.width, maxH / props.height);
        const lw = props.width * r;
        const lh = props.height * r;
        doc.addImage(emp.logo, "PNG", pageW - 40 - lw, 30, lw, lh);
      } catch (e) {
        /* logótipo inválido: ignora */
      }
    }

    // Cabeçalho com os dados da empresa.
    let y = 44;
    doc.setFontSize(15);
    doc.setTextColor(20, 20, 20);
    doc.text(emp.nome || (meta && meta.business) || BRAND_NAME, 40, y);
    y += 14;
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);
    [
      [emp.endereco, emp.bairro, emp.cidade, emp.provincia].filter(Boolean).join(", "),
      emp.nuit ? "NUIT: " + emp.nuit : "",
      [emp.contacto, emp.contacto2, emp.email].filter(Boolean).join(" · "),
    ]
      .filter(Boolean)
      .forEach((l) => { doc.text(String(l), 40, y); y += 11; });

    // Linha divisória.
    y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(40, y, pageW - 40, y);
    y += 16;

    // Título do relatório + metadados.
    doc.setFontSize(13);
    doc.setTextColor(30, 91, 168);
    doc.text(title, 40, y);
    y += 14;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    const sub = [meta && meta.period, "Emitido em " + new Date().toLocaleString("pt-PT"), BRAND_NAME].filter(Boolean).join("   ·   ");
    doc.text(sub, 40, y);
    y += 10;

    autoTable(doc, {
      head: [columns],
      body: rows.map((r) => r.map((v) => (v === null || v === undefined ? "" : String(v)))),
      startY: y,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30, 91, 168], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [244, 248, 246] },
      margin: { left: 40, right: 40 },
      // Valores negativos a vermelho (saídas de caixa, prejuízos, dívidas) —
      // igual aos relatórios de referência.
      didParseCell: (data) => {
        if (data.section === "body" && /^-\s*[\d.,]/.test(String(data.cell.raw).trim())) {
          data.cell.styles.textColor = [190, 30, 45];
        }
      },
    });
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const footY = doc.internal.pageSize.getHeight() - 20;
      doc.text("Gerado pelo Sistema " + BRAND_NAME, 40, footY);
      doc.text("Página " + i + " de " + total, pageW - 40, footY, { align: "right" });
    }
    saveBlob(title.replace(/[^\w-]+/g, "_").toLowerCase() + ".pdf", doc.output("blob"));
    return true;
  } catch (e) {
    return false;
  }
}
