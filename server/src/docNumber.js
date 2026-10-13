// Numeração sequencial de documentos (facturas/recibos), por ano. Puro e sem
// dependências — testável em isolamento. Se o ano da série não for o ano actual,
// recomeça a numeração em 1 (nova série anual).
export function nextDocNumber(config) {
  const ds = (config && config.docSeries) || { prefixo: "FT", ano: new Date().getFullYear(), proximo: 1 };
  const anoActual = new Date().getFullYear();
  const ano = ds.ano === anoActual ? ds.ano : anoActual;
  const proximo = ds.ano === anoActual ? ds.proximo || 1 : 1;
  return {
    numero: (ds.prefixo || "FT") + ano + "/" + String(proximo).padStart(4, "0"),
    nextSeries: { prefixo: ds.prefixo || "FT", ano, proximo: proximo + 1 },
  };
}
