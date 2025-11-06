import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import {
  register,
  login,
  dashboard,
  logout,
  verifyCode,
  resendCode,
  forgotPassword,
  resetPassword,
} from "./auth.js";
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverPhoto,
  upload, // 👈 importamos multer-cloudinary desde profile.js
} from "./profile.js";

dotenv.config();

const app = express();

// ✅ Configuración CORS reforzada
app.use(
  cors({
    origin: [
      process.env.ORIGIN_FRONTEND || "http://localhost:3000", // dominio del frontend
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ← incluye OPTIONS
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// ✅ Manejar preflight requests manualmente (muy importante para Vercel)
app.options(/.*/, cors({
  origin: process.env.ORIGIN_FRONTEND || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Rutas principales
app.get("/", (_, res) => res.send("Servidor funcionando ✅"));
app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/dashboard", dashboard);
app.post("/api/logout", logout);
app.post("/api/verify", verifyCode);
app.post("/api/resend", resendCode);
app.post("/api/forgot-password", forgotPassword);
app.post("/api/reset-password", resetPassword);

// ✅ Perfil de usuario
app.get("/api/profile", getProfile);
app.put("/api/profile", updateProfile);

// ✅ Subida de imágenes (Cloudinary)
app.post("/api/profile/picture", upload.single("profile_picture"), uploadProfilePicture);
app.post("/api/profile/cover", upload.single("cover_photo"), uploadCoverPhoto);

// 🚀 Si estás local, levantar servidor normalmente
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`🚀 API local lista en http://localhost:${PORT}`)
  );
}

// ✅ Exportar correctamente para Vercel
// Vercel necesita una función (req, res), no solo el app
export default function handler(req, res) {
  return app(req, res);
}