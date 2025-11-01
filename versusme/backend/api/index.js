import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { register, login, me, logout } from "../src/auth.js";

const app = express();
app.use(cors({ origin: process.env.ORIGIN_FRONTEND, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/me", me);
app.post("/api/logout", logout);

// Exporta el handler para Vercel
export default app;
