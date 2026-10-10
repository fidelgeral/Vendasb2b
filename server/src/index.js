import express from "express";
import cors from "cors";
import compression from "compression";
import "dotenv/config";

import { authRouter } from "./routes/auth.js";
import { businessesRouter } from "./routes/businesses.js";
import { storeRouter } from "./routes/store.js";
import { productsRouter } from "./routes/products.js";
import { clientsRouter } from "./routes/clients.js";
import { suppliersRouter } from "./routes/suppliers.js";
import { tablesRouter } from "./routes/tables.js";
import { employeesRouter } from "./routes/employees.js";
import { caixaRouter } from "./routes/caixa.js";
import { salesRouter } from "./routes/sales.js";
import { configRouter } from "./routes/config.js";
import { assistantRouter, publicRouter } from "./routes/assistant.js";
import { billingRouter, superBillingRouter } from "./routes/billing.js";
import { contasRouter } from "./routes/contas.js";
import { lotesRouter } from "./routes/lotes.js";
import { cronRouter } from "./routes/cron.js";
import { requireActiveSubscription } from "./auth/middleware.js";

const app = express();

// Comprime todas as respostas (JSON + fotos base64 encolhem ~80%) — a maior
// vitória de desempenho para ligações lentas em Moçambique.
app.use(compression());

const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: false,
  })
);
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api", authRouter);
app.use("/api/super/businesses", businessesRouter);
app.use("/api/super/billing", superBillingRouter);

// Billing da loja: fica FORA do bloqueio de assinatura, para a loja suspensa
// ainda conseguir ver os dados de pagamento e registar que pagou.
app.use("/api/businesses/:businessId", billingRouter);

// Bloqueio por assinatura suspensa aplica-se a todas as rotas operacionais abaixo.
app.use("/api/businesses/:businessId", requireActiveSubscription);

// :businessId vive no prefixo do mount (não em cada rota) para que já esteja
// disponível em req.params quando os middlewares requireAuth/requireBusiness
// de cada router (registados com .use(), sem path) correm.
app.use("/api/businesses/:businessId", storeRouter);
app.use("/api/businesses/:businessId", productsRouter);
app.use("/api/businesses/:businessId", lotesRouter);
app.use("/api/businesses/:businessId", clientsRouter);
app.use("/api/businesses/:businessId", suppliersRouter);
app.use("/api/businesses/:businessId", tablesRouter);
app.use("/api/businesses/:businessId", employeesRouter);
app.use("/api/businesses/:businessId", caixaRouter);
app.use("/api/businesses/:businessId", salesRouter);
app.use("/api/businesses/:businessId", configRouter);
app.use("/api/businesses/:businessId", contasRouter);
app.use("/api/businesses/:businessId", assistantRouter);
app.use("/api/public", publicRouter);
app.use("/api/cron", cronRouter);

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`VENDASB2B API a correr na porta ${port}`));
