import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não está definida. Copie server/.env.example para server/.env e preencha.");
  process.exit(1);
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

// A Neon (tier grátis) fecha ligações ociosas. Sem este listener, o evento "error"
// de um cliente ocioso derrubaria o processo inteiro. Apenas registamos — o pool
// descarta a ligação partida e abre outra no próximo pedido.
pool.on("error", (err) => {
  console.error("Aviso: ligação do pool caiu (será reaberta no próximo pedido):", err.message);
});

export const query = (text, params) => pool.query(text, params);

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
