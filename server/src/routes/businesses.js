import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db.js";
import { hashPassword } from "../auth/hash.js";
import { requireAuth, requireSuperAdmin } from "../auth/middleware.js";

export const businessesRouter = Router();
businessesRouter.use(requireAuth, requireSuperAdmin);

function slugify(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "negocio"
  );
}

async function uniqueSlug(base) {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while ((await query("SELECT 1 FROM businesses WHERE slug = $1", [slug])).rows.length) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

businessesRouter.get("/", async (req, res) => {
  const { rows } = await query(
    `SELECT b.id, b.name, b.slug, b.active, b.created_at,
            (SELECT count(*) FROM employees e WHERE e.business_id = b.id) AS employee_count
     FROM businesses b ORDER BY b.created_at DESC`
  );
  res.json({ businesses: rows });
});

const createSchema = z.object({
  name: z.string().min(2),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(6),
});

businessesRouter.post("/", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Preencha nome do negócio, nome, email e senha do dono (mín. 6 caracteres)." });
  const { name, ownerName, ownerEmail, ownerPassword } = parsed.data;

  // O email do dono é único em toda a plataforma (é ele que faz login, sem código de negócio).
  const dup = (await query("SELECT 1 FROM employees WHERE lower(email) = lower($1)", [ownerEmail])).rows.length;
  if (dup) return res.status(409).json({ error: "Já existe uma conta com esse email noutro negócio." });

  const slug = await uniqueSlug(slugify(name));
  const passwordHash = await hashPassword(ownerPassword);

  const business = await withTransaction(async (client) => {
    const biz = (
      await client.query("INSERT INTO businesses (name, slug, config) VALUES ($1, $2, $3) RETURNING *", [
        name,
        slug,
        { businessName: name, modules: { mercearia: true, restaurante: false, bar: false, roupa: false, padaria: false } },
      ])
    ).rows[0];
    await client.query(
      "INSERT INTO employees (business_id, name, email, role, password_hash) VALUES ($1, $2, $3, 'dono', $4)",
      [biz.id, ownerName, ownerEmail.toLowerCase(), passwordHash]
    );
    return biz;
  });

  res.status(201).json({ business });
});

const renameSchema = z.object({ name: z.string().min(2) });

businessesRouter.patch("/:id", async (req, res) => {
  const parsed = renameSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Nome inválido." });
  const { rows } = await query("UPDATE businesses SET name = $1 WHERE id = $2 RETURNING *", [parsed.data.name, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Negócio não encontrado." });
  res.json({ business: rows[0] });
});

businessesRouter.patch("/:id/toggle-active", async (req, res) => {
  const { rows } = await query("UPDATE businesses SET active = NOT active WHERE id = $1 RETURNING *", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Negócio não encontrado." });
  res.json({ business: rows[0] });
});

businessesRouter.delete("/:id", async (req, res) => {
  await query("DELETE FROM businesses WHERE id = $1", [req.params.id]);
  res.status(204).end();
});
