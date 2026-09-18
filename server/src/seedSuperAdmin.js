import "dotenv/config";
import { pool } from "./db.js";
import { hashPassword } from "./auth/hash.js";

async function run() {
  const email = (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.SUPER_ADMIN_PASSWORD || "";
  if (!email || password.length < 6) {
    console.error("Defina SUPER_ADMIN_EMAIL e SUPER_ADMIN_PASSWORD (mín. 6 caracteres) no ficheiro .env antes de correr este script.");
    process.exit(1);
  }

  const hash = await hashPassword(password);
  await pool.query(
    `INSERT INTO super_admins (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, hash]
  );
  console.log(`Super-admin pronto: ${email}`);
  await pool.end();
}

run();
