import { pool } from "./db.js";
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
  params: (req, file) => ({
    folder: "versusme_profiles",

    // ⭐ Permite GIFs, WebP animado y VIDEOS
    resource_type: "auto",

    // Deja que Cloudinary determine el formato real
    // (NO forzar "jpg/png/etc", eso rompe animación)
    public_id: `profile_${req.user?.id || "guest"}_${Date.now()}`
  })
});



export const upload = multer({ storage });

/* 🧠 Obtener perfil */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[user]] = await pool.query(
      `SELECT 
         u.id, 
         u.name, 
         u.email, 
         u.is_pro,
         u.pro_until,
         u.stripe_customer_id,
         p.profile_picture, 
         p.cover_photo, 
         p.description,
         p.district,
         p.favorite_sport,
         p.level
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);

  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
};


/* ✏️ Actualizar perfil */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
      description,
      district,
      favorite_sport,
      level
    } = req.body;

    // Tabla users
    await pool.execute(
      `UPDATE users SET name = ?, email = ? WHERE id = ?`,
      [name, email, userId]
    );

    // Tabla profiles
    await pool.execute(
      `
      UPDATE profiles 
      SET description = ?, district = ?, favorite_sport = ?, level = ?
      WHERE user_id = ?
      `,
      [description, district, favorite_sport, level, userId]
    );

    res.json({ success: true, message: "Perfil actualizado correctamente." });

  } catch (err) {
    console.error("❌ Error actualizando perfil:", err);
    res.status(500).json({ error: "Error al actualizar el perfil" });
  }
};

/* 🖼️ Subir imagen de perfil */
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    const imageUrl = req.file?.path || req.file?.secure_url;
    if (!imageUrl) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }

    await pool.query(
      "UPDATE profiles SET profile_picture = ? WHERE user_id = ?",
      [imageUrl, userId]
    );

    res.json({ profile_picture: imageUrl });

  } catch (err) {
    console.error("❌ Error al actualizar imagen de perfil:", err);
    res.status(500).json({ error: "Error al actualizar imagen de perfil" });
  }
  console.log("FILE RECIBIDO:", req.file);

};

/* 🖼️ Subir foto de portada */
export const uploadCoverPhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    const imageUrl = req.file?.path || req.file?.secure_url;
    if (!imageUrl) return res.status(400).json({ error: "No se recibió ninguna imagen" });

    await pool.query(
      "UPDATE profiles SET cover_photo = ? WHERE user_id = ?",
      [imageUrl, userId]
    );

    res.json({ cover_photo: imageUrl });

  } catch (err) {
    console.error("❌ Error al actualizar foto de portada:", err);
    res.status(500).json({ error: "Error al actualizar foto de portada" });
  }
};
