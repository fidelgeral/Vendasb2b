import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { requireAuth, requireBusiness, requireRole, requireSuperAdmin } from "../auth/middleware.js";

// Dados de pagamento do VENDASB2B (mensalidades pagas ao Fidel).
export const BILLING_INFO = {
  mpesa: "845508667",
  emola: "861132245",
  whatsapp: "861132245",
  titular: "VENDASB2B",
};

// ---------------- Lado da loja (NÃO passa pelo bloqueio de assinatura) ----------------
export const billingRouter = Router({ mergeParams: true });
billingRouter.use(requireAuth, requireBusiness);

billingRouter.get("/billing", async (req, res) => {
  const biz = (
    await query(
      `SELECT plan, subscription_status AS "subscriptionStatus", monthly_fee AS "monthlyFee", next_due_date AS "nextDueDate"
       FROM businesses WHERE id = $1`,
      [req.params.businessId]
    )
  ).rows[0];
  if (!biz) return res.status(404).json({ error: "Negócio não encontrado." });
  const submissions = (
    await query(
      `SELECT id, amount, method, reference, status, created_at AS "createdAt", reviewed_at AS "reviewedAt"
       FROM payment_submissions WHERE business_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.params.businessId]
    )
  ).rows;
  res.json({
    info: BILLING_INFO,
    plan: biz.plan,
    subscriptionStatus: biz.subscriptionStatus,
    monthlyFee: Number(biz.monthlyFee),
    nextDueDate: biz.nextDueDate,
    submissions: submissions.map((s) => ({ ...s, amount: Number(s.amount) })),
  });
});

const submitSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["mpesa", "emola"]),
  reference: z.string().max(200).optional().default(""),
});

// Só o dono regista que pagou (fica pendente até o super-admin confirmar).
billingRouter.post("/billing/submit", requireRole("dono"), async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Indique o valor e o método (M-Pesa ou e-Mola)." });
  const { amount, method, reference } = parsed.data;
  await query(
    "INSERT INTO payment_submissions (business_id, amount, method, reference) VALUES ($1,$2,$3,$4)",
    [req.params.businessId, amount, method, reference]
  );
  res.status(201).json({ ok: true });
});

// ---------------- Lado do super-admin ----------------
export const superBillingRouter = Router();
superBillingRouter.use(requireAuth, requireSuperAdmin);

superBillingRouter.get("/submissions", async (req, res) => {
  const { rows } = await query(
    `SELECT ps.id, ps.business_id AS "businessId", b.name AS "businessName", ps.amount, ps.method,
            ps.reference, ps.status, ps.created_at AS "createdAt"
     FROM payment_submissions ps JOIN businesses b ON b.id = ps.business_id
     WHERE ps.status = 'pendente' ORDER BY ps.created_at ASC`
  );
  res.json({ submissions: rows.map((s) => ({ ...s, amount: Number(s.amount) })) });
});

const planSchema = z.object({
  plan: z.string().min(1),
  monthlyFee: z.number().min(0),
  nextDueDate: z.string().optional().nullable(),
});

superBillingRouter.patch("/:id/plan", async (req, res) => {
  const parsed = planSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados do plano inválidos." });
  const { plan, monthlyFee, nextDueDate } = parsed.data;
  const { rows } = await query(
    "UPDATE businesses SET plan = $1, monthly_fee = $2, next_due_date = $3 WHERE id = $4 RETURNING id",
    [plan, monthlyFee, nextDueDate || null, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Negócio não encontrado." });
  res.json({ ok: true });
});

superBillingRouter.post("/:id/suspend", async (req, res) => {
  await query("UPDATE businesses SET subscription_status = 'suspenso' WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

superBillingRouter.post("/:id/reactivate", async (req, res) => {
  await query("UPDATE businesses SET subscription_status = 'ativo' WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// Confirmar um comprovativo: marca como confirmado, reactiva a conta e empurra a
// data de vencimento 30 dias para a frente.
superBillingRouter.post("/submissions/:subId/confirm", async (req, res) => {
  const sub = (await query("SELECT business_id FROM payment_submissions WHERE id = $1 AND status = 'pendente'", [req.params.subId])).rows[0];
  if (!sub) return res.status(404).json({ error: "Comprovativo não encontrado ou já tratado." });
  await query("UPDATE payment_submissions SET status = 'confirmado', reviewed_at = now() WHERE id = $1", [req.params.subId]);
  await query(
    `UPDATE businesses
     SET subscription_status = 'ativo',
         next_due_date = GREATEST(COALESCE(next_due_date, CURRENT_DATE), CURRENT_DATE) + INTERVAL '30 days'
     WHERE id = $1`,
    [sub.business_id]
  );
  res.json({ ok: true });
});

superBillingRouter.post("/submissions/:subId/reject", async (req, res) => {
  await query("UPDATE payment_submissions SET status = 'rejeitado', reviewed_at = now() WHERE id = $1 AND status = 'pendente'", [req.params.subId]);
  res.json({ ok: true });
});
