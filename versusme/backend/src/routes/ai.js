// src/routes/ai.js
import express from "express";

const router = express.Router();

// 🚀 Tu endpoint de IA en Railway
const AI_API = process.env.AI_API_URL || "https://versusme-ai-service-production.up.railway.app";

router.post("/recommend", async (req, res) => {
  try {
    console.log("📩 Recibido desde frontend:", req.body);

    const response = await fetch(`${AI_API}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    console.log("🤖 Respuesta IA:", data);

    return res.json(data);
  } catch (err) {
    console.error("❌ Error comunicando con IA:", err);
    return res.status(500).json({
      error: "Error comunicando con el servicio de IA",
    });
  }
});

export default router;
