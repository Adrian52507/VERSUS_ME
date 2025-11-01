import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { register } from "./auth.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_, res) => res.send("Servidor funcionando ✅"));
app.post("/api/register", register);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API lista en http://localhost:${PORT}`));
