import pool from "./db.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

/* 🌩️ Configurar Cloudinary */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/* 📦 Configuración del almacenamiento con multer */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "versusme_profiles",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

export const upload = multer({ storage });

/* 🧠 Obtener perfil */
export const getProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

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
    console.error("❌ Error al obtener perfil:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

/* ✏️ Actualizar información del perfil */
export const updateProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { description, district, favorite_sport, level } = req.body;

    await pool.query(
      `UPDATE profiles
       SET description = ?, district = ?, favorite_sport = ?, level = ?
       WHERE user_id = ?`,
      [description, district, favorite_sport, level, userId]
    );

    res.json({ message: "✅ Perfil actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar perfil:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

/* 🖼️ Subir imagen de perfil */
export const uploadProfilePicture = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cloudinary devuelve secure_url directamente
    const imageUrl = req.file?.path || req.file?.secure_url;
    if (!imageUrl) return res.status(400).json({ error: "No se recibió ninguna imagen" });

    await pool.query(
      "UPDATE profiles SET profile_picture = ? WHERE user_id = ?",
      [imageUrl, decoded.id]
    );

    res.json({ profile_picture: imageUrl });
  } catch (err) {
    console.error("❌ Error al actualizar imagen de perfil:", err);
    res.status(500).json({ error: "Error al actualizar imagen de perfil" });
  }
};

/* 🖼️ Subir foto de portada */
export const uploadCoverPhoto = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const imageUrl = req.file?.path || req.file?.secure_url;
    if (!imageUrl) return res.status(400).json({ error: "No se recibió ninguna imagen" });

    await pool.query(
      "UPDATE profiles SET cover_photo = ? WHERE user_id = ?",
      [imageUrl, decoded.id]
    );

    res.json({ cover_photo: imageUrl });
  } catch (err) {
    console.error("❌ Error al actualizar foto de portada:", err);
    res.status(500).json({ error: "Error al actualizar foto de portada" });
  }
};
