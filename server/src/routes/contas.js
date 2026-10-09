import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { requireAuth, requireBusiness } from "../auth/middleware.js";
import { buildStore } from "./store.js";

export const contasRouter = Router({ mergeParams: true });
contasRouter.use(requireAuth, requireBusiness);

const respond = async (res, businessId, status = 200) => res.status(status).json({ store: await buildStore(businessId) });

const contaSchema = z.object({
  descricao: z.string().min(1),
  categoria: z.string().optional().default("Outros"),
  valor: z.number().positive(),
  supplierId: z.string().uuid().optional().nullable(),
  vencimento: z.string().optional().nullable(),
});

contasRouter.post("/contas-pagar", async (req, res) => {
  const parsed = contaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados da conta inválidos." });
  const f = parsed.data;
  const businessId = req.params.businessId;
  await query(
    "INSERT INTO contas_pagar (business_id, descricao, categoria, valor, supplier_id, vencimento) VALUES ($1,$2,$3,$4,$5,$6)",
    [businessId, f.descricao, f.categoria, f.valor, f.supplierId || null, f.vencimento || null]
  );
  await respond(res, businessId, 201);
});

contasRouter.delete("/contas-pagar/:id", async (req, res) => {
  const { businessId, id } = req.params;
  await query("DELETE FROM contas_pagar WHERE id = $1 AND business_id = $2", [id, businessId]);
  await respond(res, businessId);
});

// Marcar como paga. Se o caixa estiver aberto, regista também uma saída de caixa
// (reutiliza a tabela movimentos_caixa) para o fluxo de caixa ficar certo.
contasRouter.post("/contas-pagar/:id/pagar", async (req, res) => {
  const { businessId, id } = req.params;
  const employee = req.auth.type === "employee" ? { id: req.auth.employeeId, name: req.auth.name } : { id: null, name: "Super-admin" };

  const conta = (await query("SELECT * FROM contas_pagar WHERE id = $1 AND business_id = $2 AND estado = 'aberta'", [id, businessId])).rows[0];
  if (!conta) return res.status(404).json({ error: "Conta não encontrada ou já paga." });

  const currentShift = (await query("SELECT id FROM shifts WHERE business_id = $1 AND closed_at IS NULL", [businessId])).rows[0];

  await withTransaction(async (client) => {
    await client.query("UPDATE contas_pagar SET estado = 'paga', paga_em = CURRENT_DATE WHERE id = $1", [id]);
    if (currentShift) {
      await client.query(
        "INSERT INTO movimentos_caixa (business_id, shift_id, tipo, categoria, amount, descricao, employee_id) VALUES ($1,$2,'saida',$3,$4,$5,$6)",
        [businessId, currentShift.id, conta.categoria || "Fornecedores", Number(conta.valor), "Conta paga: " + conta.descricao, employee.id]
      );
    }
    await client.query("INSERT INTO audit_log (business_id, employee_id, employee_name, acao, detalhe, valor) VALUES ($1,$2,$3,$4,$5,$6)", [
      businessId, employee.id, employee.name, "CONTA PAGA", conta.descricao, Number(conta.valor),
    ]);
  });

  await respond(res, businessId);
});
