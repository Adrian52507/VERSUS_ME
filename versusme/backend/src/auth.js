import bcrypt from "bcryptjs";
import { pool } from "./db.js";
import { sendVerificationEmail } from "./mailer.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

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

    // Insertar usuario y obtener ID
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, verification_code, verified) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, code, false]
    );

    const userId = result.insertId; // 🔥 AHORA SÍ EXISTE

    // Crear perfil vacío
    await pool.query(`
      INSERT INTO profiles (user_id, description, district, favorite_sport, level)
      VALUES (?, '', '', '', '')
    `, [userId]);

    // Enviar correo
    await sendVerificationEmail(email, code);

    res.json({ message: "Usuario registrado. Código enviado al correo." });
  } catch (err) {
    console.error("Error en registro:", err);
    return res.status(500).json({ error: "Error en registro" });
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
    return res.status(500).json({ error: "Error en verificación" });
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

    // 🔐 Verificamos el JWT
    console.log("🔑 JWT_SECRET usado para verificar:", process.env.JWT_SECRET);

    console.log("✅ Generando cookie con token:", token);

    // Enviar cookie HTTP-only
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none", // 🔥 necesario si backend y frontend están en dominios distintos
      secure: true, // 🔥 obligatorio en producción (HTTPS)
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log("✅ Cookie seteada correctamente");

    res.json({ message: "Inicio de sesión exitoso ✅" });
  } catch (err) {
    console.error("Error en login:", err);
    return res.status(500).json({ error: "Error en login" });
  }
};

export function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token no encontrado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ahora tienes req.user.id
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}


/**
 * Verificación de sesión (ruta protegida)
 */
export const dashboard = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

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
    return res.status(500).json({ error: "Error al reenviar código" });
  }
};

/**
 * Cerrar sesión
 */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none", // 🔥 Necesario para cross-domain
      secure: true,     // 🔒 Obligatorio en HTTPS (Vercel)
    });
    return res.json({ message: "Sesión cerrada correctamente ✅" });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return res.status(500).json({ error: "Error al cerrar sesión" });
  }
};




/**
 * Enviar enlace de recuperación de contraseña
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Correo requerido" });

  try {
    // Buscar usuario en la base de datos
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      // ⚠️ No indicamos si existe o no, para evitar revelar información
      return res.json({ message: "Si existe una cuenta, se ha enviado un enlace de recuperación" });
    }

    const user = rows[0];

    // Crear token de recuperación válido por 15 minutos
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `${process.env.ORIGIN_FRONTEND}/restablecer?token=${token}`;

    // Configurar el transporte de correo (Gmail, Outlook, etc.)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"VersusMe 🏆" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de contraseña — VersusMe",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola ${user.name},</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña (válido por 15 minutos):</p>
        <a href="${resetLink}" style="background:#25C50E;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Restablecer contraseña</a>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
      `,
    });

    res.json({ message: "Correo de recuperación enviado si la cuenta existe ✅" });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    return res.status(500).json({ error: "Error al enviar correo" });
  }
};


/**
 * Restablecer contraseña
 */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: "Datos incompletos" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashed = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hashed, decoded.id]);

    res.json({ message: "Contraseña actualizada correctamente ✅" });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(400).json({ error: "Token inválido o expirado" });
  }
};
