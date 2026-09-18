# Especificação — Sistema PDV Multi-Negócio (VENDASB2B)

## 1. Visão do produto

Um sistema de gestão de vendas (PDV) na nuvem, ao estilo do Vendas360, com marca própria (VENDASB2B). Um único administrador (o Dino) gere a plataforma; cada negócio cliente (mercearia, restaurante, bar, loja de roupa, padaria, etc.) tem a sua própria conta, isolada das restantes, com os seus próprios produtos, vendas, clientes e funcionários.

Já existe um protótipo funcional e testado (ficheiro `pdv_fonte.jsx`), publicado como página web dentro do Claude (React + base de dados própria do Claude). Ele já inclui a estrutura multi-negócio, não só o ecrã de um único negócio — o trabalho que falta é sobretudo **sair do ambiente Claude para uma infraestrutura própria** (servidor, base de dados e domínio reais), não desenhar a lógica de novo.

## 2. Modelo de utilizadores (três níveis) — já implementado no protótipo

1. **Super-admin (Dino)** — painel próprio: cria, renomeia, suspende, reactiva ou apaga contas de negócio; vê contagem de contas activas.
2. **Conta de negócio** — cada cliente tem os seus dados completamente isolados (produtos, vendas, clientes, categorias, stock, caixa).
3. **Funcionários dentro de cada negócio** — contas com nome completo, email, telefone, senha, nº de documento e função (dono, gerente, caixa, cozinha), cada uma com permissões diferentes (ex.: caixa não vê o valor esperado no fecho de caixa — fecho "cego").

**O que falta aqui:** a autenticação é uma verificação simples de senha guardada sem encriptação — organiza o acesso do dia a dia, mas não é segurança de produção. Isto tem de ser refeito com hashing de senhas (bcrypt ou equivalente) e sessões/tokens reais.

## 3. Arquitectura técnica necessária para sair do Claude

- **Backend**: aplicação servidor (Node.js é o caminho natural, já que o protótipo está em React/JavaScript).
- **Base de dados real** com isolamento por negócio (multi-tenancy). Hoje cada negócio já grava num documento próprio (`stores/<id>`) na base de dados do Claude — a migração natural é uma tabela por entidade (produtos, vendas, clientes…) com coluna `business_id`, em vez de um documento único por loja (o documento único tem um limite de tamanho que já obrigou a cortar o histórico de vendas às últimas 400 por loja).
- **Autenticação real**: substituir a verificação de senha em texto simples por hashing (bcrypt/argon2) e sessões com token, não apenas comparação directa.
- **Hospedagem**: serviço que mantenha backend e base de dados sempre disponíveis (ex.: Railway, Render, Supabase).
- **Domínio próprio**: isto e a conta de alojamento são passos que só o Dino pode fazer (envolvem pagamento e registo em seu nome).
- **Pagamentos automáticos a clientes**: para cobrar mensalidades ou vendas via M-Pesa/e-Mola de forma automática, é necessário registo directo junto dessas operadoras — fora do alcance de qualquer ferramenta de IA.

## 4. Módulos já construídos no protótipo (referência: `pdv_fonte.jsx`)

- **Vender** — carrinho em 3 colunas, pesquisa com leitor de código de barras, atalhos de teclado (F2 finalizar, F3 pesquisar, ESC limpar), produtos mais vendidos fixados, modo "venda rápida", calculadora de troco, desconto, pagamento dividido, resgate de pontos de fidelidade, fiado com bloqueio automático acima do limite, IVA configurável (geral ou por produto).
- **Mesas** (só aparece se activado em Config) — mapa de mesas com adicionar/remover/renomear, comandas, taxa de serviço.
- **Caixa** — abertura/fecho de turno, fecho "cego" para operadores, quebras com motivo, entradas/saídas categorizadas, resumo com gráfico.
- **Produtos** — três tipos: **Simples** (com opção de já dar entrada no estoque ao criar), **Variação** (puxa o stock de um produto-pai, ex. "1/4 de frango" a partir de "Frango inteiro"), e **Composição/Combo** (lista de ingredientes, custo calculado automaticamente, stock limitado pelo ingrediente mais escasso). Fotos via upload ou URL, categorias geridas à parte, código de barras, activo/inactivo.
- **Estoque** — quantidades, lotes com validade, importação/exportação em massa via Excel, etiquetas de preço imprimíveis, alerta de ruptura.
- **Clientes** — ficha completa (NUIT, endereço, tipo), fiado com limite e pagamento parcial, lembrete por WhatsApp, pontos de fidelidade.
- **Compras/Fornecedores** — ficha completa de fornecedor, histórico de preços de compra.
- **Equipa** — contas com nome, email, senha, telefone, documento e função.
- **Balanço** — 13 relatórios (Vendas, Financeiro, Estoque) com filtro de período, exportação em Excel e PDF, gráficos modernos (área e donut) incluindo um painel flutuante.
- **Documentos** — numeração sequencial configurável, factura/recibo em PDF com NUIT e IVA discriminado, impressão térmica 58/80mm, exportação mensal para contabilidade.
- **Configurações** — Impressão e Visor, IVA, Contas de pagamento, Empresa (dados moçambicanos completos), Segurança e Backups (com cópias automáticas diárias e restauro).
- **Registo de auditoria** — todas as vendas, cancelamentos, descontos, quebras e movimentos de caixa ficam registados com utilizador e hora.

## 5. O que falta mesmo depois de sair para infraestrutura própria

- Multi-loja dentro do mesmo negócio (uma padaria com três balcões a partilhar ou transferir stock) — ainda não construído.
- Catálogo online público partilhável.
- Notificações push para o telemóvel do dono.
- Sincronização offline robusta entre dispositivos (hoje há um espelho local básico e aviso de "Offline", mas não sincronização automática ao reconectar).
- Dashboard compacto dedicado a telemóvel para o dono.

## 6. Fases sugeridas de implementação no Claude Code

1. **Fundação**: configurar o projecto, escolher e criar a base de dados real (schema com `business_id`), e reescrever a autenticação com hashing de senhas e sessões.
2. **Migração de dados**: portar a lógica de negócio já validada (ficheiro `pdv_fonte.jsx`) para componentes ligados à base de dados real, mantendo a mesma UI e fluxos.
3. **Módulos restantes e polimento**: qualquer ajuste fino, testes com dados reais de 1-2 negócios piloto.
4. **Domínio e alojamento**: o Dino compra o domínio e cria a conta no serviço de alojamento escolhido; o Claude Code configura o deployment.
5. **Pagamentos e abertura ao público**: registo nas APIs de M-Pesa/e-Mola, depois remoção das restrições de acesso.

## 7. Como usar este documento

Ao abrir o Claude Code, cole este documento e o ficheiro `pdv_fonte.jsx` como ponto de partida, e peça para começar pela Fase 1. O protótipo poupa tempo de desenho de interface e já testa toda a lógica de negócio — o trabalho no Claude Code é tornar os dados reais, seguros, e independentes do Claude.
