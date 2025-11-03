import bcrypt from "bcryptjs";
import { pool } from "./db.js";
import { sendVerificationEmail } from "./mailer.js";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Todos los campos son obligatorios" });

    // Verificar duplicado
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(400).json({ error: "El correo ya está registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Insertar usuario
    await pool.query(
      "INSERT INTO users (name, email, password_hash, verification_code, verified) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, code, false]
    );

    // Enviar correo
    await sendVerificationEmail(email, code);

    res.json({ message: "Usuario registrado. Código enviado al correo." });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: "Error en registro" });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND verification_code = ?",
      [email, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Código inválido" });
    }

    await pool.query(
      "UPDATE users SET verified = true, verification_code = NULL WHERE email = ?",
      [email]
    );

    res.json({ message: "Cuenta verificada correctamente ✅" });
  } catch (err) {
    console.error("Error en verificación:", err);
    res.status(500).json({ error: "Error en verificación" });
  }
};


/**
 * Inicio de sesión
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar campos
    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña requeridos" });
    }

    // Buscar usuario
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Verificar que haya contraseña
    if (!user.password_hash) {
      return res.status(400).json({ error: "El usuario no tiene contraseña registrada" });
    }

    // Comparar hash
    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Crear token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Enviar cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    res.json({ message: "Inicio de sesión exitoso ✅" });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en login" });
  }
};

/**
 * Verificación de sesión (ruta protegida)
 */
export const dashboard = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // 🔐 Verificamos el JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Respondemos con ambos: mensaje y nombre
    res.json({
      message: `Bienvenido al dashboard, ${decoded.name}`,
      name: decoded.name,
    });
  } catch (err) {
    console.error("Error en dashboard:", err);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};


export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query("UPDATE users SET verification_code = ? WHERE email = ?", [code, email]);
    await sendVerificationEmail(email, code);

    res.json({ message: "Código reenviado correctamente ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al reenviar código" });
  }
};

/**
 * Cerrar sesión
 */
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada correctamente" });
};

