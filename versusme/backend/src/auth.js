import bcrypt from "bcryptjs";
import { pool } from "./db.js";

export async function register(req, res) {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hashed]
    );
    res.json({ message: "Usuario registrado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en registro" });
  }
}
