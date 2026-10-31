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
  const proofs = (
    await query(
      `SELECT id, payer_name AS "payerName", payer_phone AS "payerPhone", amount, payment_method AS "paymentMethod",
              reference, photo_url AS "photoUrl", notes, status, created_at AS "createdAt", reviewed_at AS "reviewedAt"
       FROM payment_proofs WHERE business_id = $1 ORDER BY created_at DESC LIMIT 20`,
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
    proofs: proofs.map((p) => ({ ...p, amount: Number(p.amount) })),
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

const proofSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().max(50).optional().default("mpesa"),
  payerName: z.string().min(1).max(200),
  payerPhone: z.string().max(50).optional().default(""),
  reference: z.string().max(200).optional().default(""),
  photoUrl: z.string().max(2000).optional().default(""),
  notes: z.string().max(1000).optional().default(""),
});

billingRouter.post("/billing/proof", requireRole("dono"), async (req, res) => {
  const parsed = proofSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Preencha os campos obrigatórios." });
  const { amount, paymentMethod, payerName, payerPhone, reference, photoUrl, notes } = parsed.data;
  await query(
    `INSERT INTO payment_proofs (business_id, payer_name, payer_phone, amount, payment_method, reference, photo_url, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [req.params.businessId, payerName, payerPhone, amount, paymentMethod, reference, photoUrl, notes]
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
  // Transição atómica pendente -> confirmado: um duplo clique não soma 30 dias duas vezes.
  const sub = (await query("UPDATE payment_submissions SET status = 'confirmado', reviewed_at = now() WHERE id = $1 AND status = 'pendente' RETURNING business_id", [req.params.subId])).rows[0];
  if (!sub) return res.status(404).json({ error: "Comprovativo não encontrado ou já tratado." });
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

// --- Contas demonstração ---
superBillingRouter.get("/demos", async (req, res) => {
  const { rows } = await query(
    `SELECT id, name, demo_expires_at AS "demoExpiresAt", demo_representative AS "representative",
            demo_contact_email AS "contactEmail", demo_contact_phone AS "contactPhone",
            subscription_status AS "status", created_at AS "createdAt"
     FROM businesses WHERE is_demo = true ORDER BY created_at DESC`
  );
  res.json({ demos: rows });
});

superBillingRouter.post("/demos/:id/activate", async (req, res) => {
  await query(
    `UPDATE businesses SET is_demo = false, demo_expires_at = NULL, subscription_status = 'ativo',
     plan = 'basico', next_due_date = CURRENT_DATE + INTERVAL '30 days' WHERE id = $1`,
    [req.params.id]
  );
  res.json({ ok: true });
});

superBillingRouter.delete("/demos/:id", async (req, res) => {
  const biz = (await query("SELECT is_demo FROM businesses WHERE id = $1", [req.params.id])).rows[0];
  if (!biz) return res.status(404).json({ error: "Negócio não encontrado." });
  if (!biz.is_demo) return res.status(400).json({ error: "Só é possível apagar contas demonstração." });
  await query("DELETE FROM businesses WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

// --- Comprovativos com foto ---
superBillingRouter.get("/proofs", async (req, res) => {
  const { rows } = await query(
    `SELECT pp.id, pp.business_id AS "businessId", b.name AS "businessName",
            pp.payer_name AS "payerName", pp.payer_phone AS "payerPhone",
            pp.amount, pp.payment_method AS "paymentMethod", pp.reference,
            pp.photo_url AS "photoUrl", pp.notes, pp.status,
            pp.created_at AS "createdAt"
     FROM payment_proofs pp JOIN businesses b ON b.id = pp.business_id
     WHERE pp.status = 'pendente' ORDER BY pp.created_at ASC`
  );
  res.json({ proofs: rows.map((p) => ({ ...p, amount: Number(p.amount) })) });
});

superBillingRouter.post("/proofs/:id/confirm", async (req, res) => {
  const proof = (await query("UPDATE payment_proofs SET status = 'confirmado', reviewed_at = now() WHERE id = $1 AND status = 'pendente' RETURNING business_id", [req.params.id])).rows[0];
  if (!proof) return res.status(404).json({ error: "Comprovativo não encontrado ou já tratado." });
  await query(
    `UPDATE businesses
     SET subscription_status = 'ativo',
         next_due_date = GREATEST(COALESCE(next_due_date, CURRENT_DATE), CURRENT_DATE) + INTERVAL '30 days'
     WHERE id = $1`,
    [proof.business_id]
  );
  res.json({ ok: true });
});

superBillingRouter.post("/proofs/:id/reject", async (req, res) => {
  await query("UPDATE payment_proofs SET status = 'rejeitado', reviewed_at = now() WHERE id = $1 AND status = 'pendente'", [req.params.id]);
  res.json({ ok: true });
});

// --- Dados para fatura/recibo (PDF gerado no frontend) ---
superBillingRouter.get("/:id/invoice-data", async (req, res) => {
  const biz = (await query(
    `SELECT id, name, config, plan, monthly_fee AS "monthlyFee", next_due_date AS "nextDueDate",
            subscription_status AS "subscriptionStatus"
     FROM businesses WHERE id = $1`,
    [req.params.id]
  )).rows[0];
  if (!biz) return res.status(404).json({ error: "Negócio não encontrado." });
  const emp = biz.config?.empresa || {};
  const proofs = (await query(
    `SELECT id, amount, payment_method, payer_name, created_at FROM payment_proofs
     WHERE business_id = $1 AND status = 'confirmado' ORDER BY created_at DESC LIMIT 50`,
    [req.params.id]
  )).rows;
  res.json({
    business: { id: biz.id, name: biz.name, nuit: emp.nuit || "", endereco: emp.endereco || "", contacto: emp.contacto || "" },
    plan: biz.plan,
    monthlyFee: Number(biz.monthlyFee || 0),
    nextDueDate: biz.nextDueDate,
    confirmedPayments: proofs.map((p) => ({ ...p, amount: Number(p.amount) })),
    billingInfo: BILLING_INFO,
  });
});
