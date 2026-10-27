// Permissões por funcionário, agrupadas (modelo igual ao da vendas360).
export const PERMISSOES = [
  {
    grupo: "vendas",
    label: "Vendas",
    itens: [
      { id: "vender", label: "Registar venda" },
      { id: "guardarPedido", label: "Guardar pedidos / venda" },
      { id: "cotacao", label: "Gerar cotação" },
    ],
  },
  {
    grupo: "caixa",
    label: "Caixa & Movimentos",
    itens: [
      { id: "caixaAbrirFechar", label: "Abrir / fechar caixa" },
      { id: "caixaEntrada", label: "Registar entrada" },
      { id: "caixaSaida", label: "Registar saída" },
      { id: "quebras", label: "Reembolso e quebra" },
      { id: "verMovimentos", label: "Ver movimentos" },
    ],
  },
  {
    grupo: "estoque",
    label: "Gestão de Estoque",
    itens: [
      { id: "loteNovo", label: "Entrada novo lote" },
      { id: "loteAdicionar", label: "Adicionar no lote" },
      { id: "loteQuebra", label: "Quebra do lote" },
      { id: "loteEditar", label: "Editar lote" },
      { id: "loteApagar", label: "Apagar lote" },
    ],
  },
  {
    grupo: "produtos",
    label: "Gestão de Produtos",
    itens: [
      { id: "produtoAdicionar", label: "Adicionar produto" },
      { id: "produtoEditar", label: "Editar produto" },
      { id: "produtoApagar", label: "Apagar produto" },
      { id: "produtoVer", label: "Ver detalhes" },
      { id: "categoriaAdicionar", label: "Adicionar categoria" },
    ],
  },
  {
    grupo: "clientes",
    label: "Clientes",
    itens: [
      { id: "clienteGerir", label: "Adicionar / editar cliente" },
      { id: "clienteApagar", label: "Apagar cliente" },
      { id: "fiadoReceber", label: "Receber dívidas" },
    ],
  },
  {
    grupo: "relatorios",
    label: "Relatórios",
    itens: [
      { id: "verBalanco", label: "Ver Balanço / relatórios" },
      { id: "exportar", label: "Exportar PDF / Excel" },
    ],
  },
  {
    grupo: "gestao",
    label: "Administração",
    itens: [
      { id: "gerirEquipa", label: "Gerir equipa" },
      { id: "gerirConfig", label: "Configurações" },
    ],
  },
  {
    grupo: "notificacoes",
    label: "Notificações",
    itens: [
      { id: "receberEmail", label: "Receber resumo diário por email" },
    ],
  },
];

export const TODAS_PERMISSOES = PERMISSOES.flatMap((g) => g.itens.map((i) => i.id));

// Padrão por papel (quando o funcionário não tem a permissão definida à mão).
const PADRAO_POR_ROLE = {
  dono: () => true,
  gerente: (id) => id !== "gerirEquipa",
  caixa: (id) =>
    ["vender", "guardarPedido", "cotacao", "caixaAbrirFechar", "caixaEntrada", "caixaSaida", "verMovimentos", "produtoVer", "clienteGerir", "fiadoReceber"].includes(id),
  cozinha: (id) => ["verMovimentos", "produtoVer"].includes(id),
};

// O funcionário pode fazer `permId`? O Administrador (dono) pode sempre tudo.
export function temPermissao(employee, permId) {
  if (!employee) return false;
  if (employee.role === "dono") return true;
  const p = employee.permissions || {};
  if (Object.prototype.hasOwnProperty.call(p, permId)) return !!p[permId];
  const padrao = PADRAO_POR_ROLE[employee.role] || (() => false);
  return padrao(permId);
}
