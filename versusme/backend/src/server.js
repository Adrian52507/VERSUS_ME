import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { register, login, dashboard, logout, verifyCode, resendCode, forgotPassword, resetPassword } from "./auth.js";


dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN_FRONTEND,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Rutas
app.get("/", (_, res) => res.send("Servidor funcionando ✅"));
app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/dashboard", dashboard);
app.post("/api/logout", logout);


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API lista en http://localhost:${PORT}`));
app.post("/api/verify", verifyCode);
app.post("/api/resend", resendCode);

app.post("/api/forgot-password", forgotPassword);
app.post("/api/reset-password", resetPassword);
