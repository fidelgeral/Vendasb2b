// Cálculo do IVA de uma venda, num único sítio (evita fórmulas duplicadas e
// divergentes pelo código). O `total` de uma venda JÁ inclui sempre o IVA
// (o ecrã de Vender acrescenta-o ao total quando os preços não o incluem), por
// isso a base tributável é sempre total / (1 + taxa/100) e o IVA é a diferença.
//
// taxaDaVenda: a taxa escolhida na venda (sale.ivaTaxa). Se não existir, usa a
// taxa padrão do Config. Se o negócio for isento, a taxa é 0.
export function computeIva(total, ivaConfig, taxaDaVenda) {
  const bruto = Number(total) || 0;
  const isento = !!(ivaConfig && ivaConfig.isento);
  const taxa = isento ? 0 : taxaDaVenda != null ? Number(taxaDaVenda) || 0 : Number(ivaConfig && ivaConfig.taxa) || 0;
  const base = taxa > 0 ? bruto / (1 + taxa / 100) : bruto;
  const valor = bruto - base;
  return { taxa, base, valor, total: bruto };
}
