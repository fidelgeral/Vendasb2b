# VENDASB2B — guia de publicação

Este projecto tem duas partes que funcionam junto mas são publicadas em separado:

- **`server/`** — o backend (API + ligação à base de dados). Vai ficar alojado no **Render**.
- **`web/`** — o site que os utilizadores veem (React). Vai ficar alojado na **Vercel**.
- A base de dados fica na **Neon** (Postgres gratuito).

Todos os serviços abaixo são gratuitos e não pedem cartão de crédito.

## 0. O que já está feito

- Todo o código já está escrito e testado localmente (`server/` e `web/`).
- As migrações da base de dados estão em `server/migrations/001_init.sql`.

## 1. Criar a base de dados (Neon)

1. Vá a [neon.com](https://neon.com) → **Sign up** → "Continue with GitHub".
2. Crie um novo projecto (ex: `vendasb2b`).
3. Copie o **Connection string** (começa por `postgresql://...`).
4. No seu computador, copie `server/.env.example` para `server/.env` e cole o connection string em `DATABASE_URL`.
5. Preencha também:
   - `JWT_SECRET`: um texto longo e aleatório (ex: 40 caracteres à sua escolha).
   - `SUPER_ADMIN_EMAIL` e `SUPER_ADMIN_PASSWORD`: o email e a senha que o Fidel vai usar para entrar como administrador da plataforma.
6. No terminal, dentro da pasta `server/`, corra:

```bash
npm install
npm run migrate
npm run seed:super
```

Isto cria todas as tabelas na Neon e a conta do super-admin.

## 2. Publicar o código no GitHub

1. Crie um repositório novo (vazio) no [github.com](https://github.com) — por exemplo `vendasb2b`.
2. No terminal, na pasta raiz do projecto (`PDV/`):

```bash
git init
git add .
git commit -m "VENDASB2B — versão inicial"
git branch -M main
git remote add origin https://github.com/<o-seu-utilizador>/vendasb2b.git
git push -u origin main
```

Quando pedir para autenticar, vai abrir uma janela do browser para confirmar a sua conta GitHub — não é preciso escrever senhas no terminal.

## 3. Publicar o backend (Render)

1. Vá a [render.com](https://render.com) → **Get Started** → entre com a conta GitHub.
2. **New +** → **Web Service** → escolha o repositório `vendasb2b`.
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Em **Environment Variables**, adicione as mesmas variáveis do `server/.env`:
   - `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (deixe em branco por agora, actualiza-se no passo 5), `PORT` = `4000`.
5. Clique **Create Web Service**. Aguarde o deploy terminar e copie o URL que o Render lhe dá (algo como `https://vendasb2b-api.onrender.com`).

**Nota sobre o plano gratuito**: o servidor "adormece" depois de 15 minutos sem pedidos, e demora uns 30-50 segundos a responder ao primeiro pedido seguinte. É normal — não é um erro.

## 4. Publicar o frontend (Vercel)

1. Vá a [vercel.com](https://vercel.com) → **Sign Up** → entre com a conta GitHub.
2. **Add New** → **Project** → escolha o repositório `vendasb2b`.
3. Em **Root Directory**, escolha `web`.
4. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = o URL do Render do passo anterior (ex: `https://vendasb2b-api.onrender.com`)
5. Clique **Deploy**.
6. Quando terminar, volte ao Render e actualize a variável `CORS_ORIGIN` do backend com o URL que a Vercel lhe deu (ex: `https://vendasb2b.vercel.app`), depois guarde — o Render reinicia automaticamente.

## 5. Primeiro acesso

1. Abra o URL da Vercel.
2. Escolha "Administrador", entre com o `SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD` que definiu no passo 1.
3. Crie a primeira conta de negócio (nome do negócio + nome, email e senha do dono).
4. Cada funcionário entra em "Sou um negócio" apenas com o seu email e senha — não é preciso nenhum código de negócio (o email é único em toda a plataforma).

## 6. Assistente de IA (opcional, gratuito)

O sistema tem um assistente de IA (Groq, gratuito, sem cartão de crédito) em dois sítios:
- Um botão de ajuda ("?") dentro do sistema, que explica como usar cada função.
- Uma página pública de atendimento por loja (`/loja/<código-do-negócio>`), onde os clientes finais tiram dúvidas sobre produtos e preços.

Para activar:
1. Vá a [console.groq.com](https://console.groq.com/keys) → entre com Google ou GitHub → **Create API Key** → copie a chave (começa por `gsk_...`).
2. Cole-a em `GROQ_API_KEY` no `server/.env` (local) e na mesma variável nas Environment Variables do Render (produção).

Sem esta chave, o resto do sistema funciona normalmente — só o assistente de IA fica indisponível.

## O que ficou fora desta fase

Conforme a especificação original: multi-loja dentro do mesmo negócio, catálogo online público, notificações push, sincronização offline avançada, dashboard móvel dedicado, pagamentos automáticos M-Pesa/e-Mola e domínio próprio. Nenhuma destas depende de código adicional imediato — podem ser feitas mais tarde.

## Desenvolvimento local

```bash
# Backend
cd server
npm install
npm run dev      # http://localhost:4000

# Frontend (noutro terminal)
cd web
npm install
npm run dev       # http://localhost:5173
```
