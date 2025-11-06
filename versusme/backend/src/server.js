import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import { register, login, dashboard, logout, verifyCode, resendCode, forgotPassword, resetPassword } from "./auth.js";
import { getProfile, updateProfile, uploadProfilePicture, uploadCoverPhoto } from "./profile.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN_FRONTEND || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ✅ Carpeta donde se guardarán las imágenes
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ✅ Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });

// ✅ Servir archivos estáticos
app.use("/uploads", express.static(uploadDir));

// ✅ Rutas
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

// ✅ Subida de imágenes
app.post("/api/profile/picture", upload.single("profile_picture"), uploadProfilePicture);
app.post("/api/profile/cover", upload.single("cover_photo"), uploadCoverPhoto);

// 🧩 Exportamos app para usarla en Vercel
export default app;

// 🧩 Si se ejecuta localmente (no en Vercel), iniciar servidor
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`🚀 API local lista en http://localhost:${PORT}`));
}
