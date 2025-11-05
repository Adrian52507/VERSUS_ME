import pool from "./db.js";
import jwt from "jsonwebtoken";

/**
 * Obtener el perfil del usuario logueado
 */
export const getProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const [rows] = await pool.query(
      `SELECT u.name, u.email, p.description, p.district, p.favorite_sport, p.level, p.profile_picture, p.cover_photo
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener perfil:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

/**
 * Actualizar el perfil del usuario logueado
 */
export const updateProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { description, district, favorite_sport, level } = req.body;

    await pool.query(
      `UPDATE profiles
       SET description = ?, district = ?, favorite_sport = ?, level = ?
       WHERE user_id = ?`,
      [description, district, favorite_sport, level, userId]
    );

    res.json({ message: "Perfil actualizado correctamente ✅" });
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const filePath = `/uploads/${req.file.filename}`;

    await pool.query(
      "UPDATE profiles SET profile_picture = ? WHERE user_id = ?",
      [filePath, decoded.id]
    );

    res.json({ profile_picture: filePath });
  } catch (err) {
    console.error("❌ Error al actualizar imagen de perfil:", err);
    res.status(500).json({ error: "Error al actualizar imagen de perfil" });
  }
};

export const uploadCoverPhoto = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const filePath = `/uploads/${req.file.filename}`;

    await pool.query(
      "UPDATE profiles SET cover_photo = ? WHERE user_id = ?",
      [filePath, decoded.id]
    );

    res.json({ cover_photo: filePath });
  } catch (err) {
    console.error("❌ Error al actualizar foto de portada:", err);
    res.status(500).json({ error: "Error al actualizar foto de portada" });
  }
};