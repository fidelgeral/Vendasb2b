import jwt from "jsonwebtoken";
import "dotenv/config";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET não está definida. Copie server/.env.example para server/.env e preencha.");
  process.exit(1);
}

const SECRET = process.env.JWT_SECRET;

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
