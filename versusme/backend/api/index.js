import 'dotenv/config';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { register, login, me, logout } from "../src/auth.js";
import { getProfile } from "../src/profile.js"; // ✅ importa tu controlador

const app = express();

app.use(cors({
  origin: process.env.ORIGIN_FRONTEND || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Rutas de autenticación
app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/me", me);
app.post("/api/logout", logout);

// ✅ Nueva ruta de perfil
app.get("/api/profile", getProfile);

export default app;
