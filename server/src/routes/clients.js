import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStoreAndCache } from "./store.js";
import { logAudit, authEmployee } from "../audit.js";
import { requirePermission } from "../permissions.js";

export const clientsRouter = Router({ mergeParams: true });
clientsRouter.use(requireAuth, requireBusiness);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStoreAndCache(businessId) });

const clientSchema = z.object({
  name: z.string().min(1),
  tipo: z.string().optional().default("Particular"),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  nuit: z.string().optional().default(""),
  endereco: z.string().optional().default(""),
  cidade: z.string().optional().default(""),
  creditLimit: z.number().min(0).optional().default(0),
  notas: z.string().optional().default(""),
});

clientsRouter.post("/clients", requirePermission("clienteGerir"), async (req, res) => {
  const parsed = clientSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados do cliente inválidos." });
  const f = parsed.data;
  const businessId = req.params.businessId;
  const novo = (
    await query(
      `INSERT INTO clients (business_id, name, tipo, phone, email, nuit, endereco, cidade, credit_limit, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [businessId, f.name, f.tipo, f.phone, f.email, f.nuit, f.endereco, f.cidade, f.creditLimit, f.notas]
    )
  ).rows[0];
  await logAudit({ businessId, employee: authEmployee(req), acao: "CLIENTE", detalhe: `Criou o cliente "${f.name}"`, entityType: "cliente", entityId: novo.id });
  await respond(res, businessId, 201);
});

const clientPatchSchema = z.object({
  name: z.string().min(1).optional(),
  tipo: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  nuit: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  notas: z.string().optional(),
});

clientsRouter.patch("/clients/:id", requirePermission("clienteGerir"), async (req, res) => {
  const parsed = clientPatchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados do cliente inválidos." });
  const f = parsed.data;
  const { businessId, id } = req.params;
  const existing = (await query("SELECT * FROM clients WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  if (!existing) return res.status(404).json({ error: "Cliente não encontrado." });
  await query(
    `UPDATE clients SET name=$1, tipo=$2, phone=$3, email=$4, nuit=$5, endereco=$6, cidade=$7, credit_limit=$8, notas=$9 WHERE id = $10`,
    [
      f.name ?? existing.name, f.tipo ?? existing.tipo, f.phone ?? existing.phone, f.email ?? existing.email,
      f.nuit ?? existing.nuit, f.endereco ?? existing.endereco, f.cidade ?? existing.cidade,
      f.creditLimit ?? existing.credit_limit, f.notas ?? existing.notas, id,
    ]
  );
  const campos = { name: "name", tipo: "tipo", phone: "phone", email: "email", nuit: "nuit", endereco: "endereco", cidade: "cidade", creditLimit: "credit_limit", notas: "notas" };
  const mudancas = Object.keys(campos)
    .filter((k) => f[k] !== undefined && String(f[k] ?? "") !== String(existing[campos[k]] ?? ""))
    .map((k) => `${k}: "${existing[campos[k]] ?? ""}" → "${f[k] ?? ""}"`)
    .join("; ");
  await logAudit({ businessId, employee: authEmployee(req), acao: "CLIENTE", detalhe: `Editou o cliente "${f.name ?? existing.name}"${mudancas ? ` (${mudancas})` : ""}`, entityType: "cliente", entityId: id });
  await respond(res, businessId);
});

clientsRouter.delete("/clients/:id", requirePermission("clienteApagar"), async (req, res) => {
  const { businessId, id } = req.params;
  const antes = (await query("SELECT name FROM clients WHERE id = $1 AND business_id = $2", [id, businessId])).rows[0];
  await query("DELETE FROM clients WHERE id = $1 AND business_id = $2", [id, businessId]);
  if (antes) await logAudit({ businessId, employee: authEmployee(req), acao: "CLIENTE", detalhe: `Apagou o cliente "${antes.name}"`, entityType: "cliente", entityId: id });
  await respond(res, businessId);
});

clientsRouter.post("/clients/:id/pay-debt", requirePermission("fiadoReceber"), async (req, res) => {
  const { businessId, id } = req.params;
  const debtId = req.body?.debtId;
  if (!debtId) return res.status(400).json({ error: "Indique a dívida." });
  await query(
    "DELETE FROM client_debts WHERE id = $1 AND client_id = $2 AND client_id IN (SELECT id FROM clients WHERE business_id = $3)",
    [debtId, id, businessId]
  );
  await respond(res, businessId);
});

clientsRouter.post("/clients/:id/pay-partial", requirePermission("fiadoReceber"), async (req, res) => {
  const { businessId, id } = req.params;
  let remaining = Number(req.body?.valor) || 0;
  if (remaining <= 0) return res.status(400).json({ error: "Valor inválido." });

  await withTransaction(async (client) => {
    const dono = (await client.query("SELECT 1 FROM clients WHERE id = $1 AND business_id = $2", [id, businessId])).rows.length;
    if (!dono) return;
    const debts = (
      await client.query("SELECT * FROM client_debts WHERE client_id = $1 ORDER BY created_at ASC FOR UPDATE", [id])
    ).rows;
    for (const d of debts) {
      if (remaining <= 0) break;
      const amount = Number(d.amount);
      if (remaining >= amount) {
        remaining -= amount;
        // eslint-disable-next-line no-await-in-loop
        await client.query("DELETE FROM client_debts WHERE id = $1", [d.id]);
      } else {
        // eslint-disable-next-line no-await-in-loop
        await client.query("UPDATE client_debts SET amount = amount - $1 WHERE id = $2", [remaining, d.id]);
        remaining = 0;
      }
    }
  });

  await respond(res, businessId);
});
