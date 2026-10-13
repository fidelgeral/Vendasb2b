// Helpers de período usados pelos relatórios (puros, sem React/DOM — testáveis).

// Verifica se uma data ISO cai dentro de [from, to] (datas "YYYY-MM-DD"; limites
// vazios = sem limite).
export function inPeriod(dateIso, from, to) {
  const d = String(dateIso).slice(0, 10);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

// Período imediatamente anterior, com a mesma duração do período escolhido —
// para a comparação "Atual vs Anterior". Só existe quando há uma data inicial.
export function periodoAnterior(from, to) {
  if (!from) return null;
  // Trabalha em UTC (sufixo "Z") para que o dia não mude ao formatar com
  // toISOString() em fusos à frente de UTC (ex.: Moçambique, UTC+2).
  const f = new Date(from + "T00:00:00Z");
  const t = to ? new Date(to + "T00:00:00Z") : new Date();
  const dias = Math.max(1, Math.round((t - f) / 86400000) + 1);
  const prevTo = new Date(f.getTime() - 86400000);
  const prevFrom = new Date(prevTo.getTime() - (dias - 1) * 86400000);
  return { from: prevFrom.toISOString().slice(0, 10), to: prevTo.toISOString().slice(0, 10) };
}

// Variação percentual entre dois valores, formatada (com sinal). "—" quando o
// anterior é zero (não há base de comparação).
export function variacao(atual, anterior) {
  if (!anterior) return "—";
  const v = ((atual - anterior) / Math.abs(anterior)) * 100;
  return (v >= 0 ? "+" : "") + v.toFixed(1) + "%";
}
