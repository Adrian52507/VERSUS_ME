import express from "express";
import { PythonShell } from "python-shell";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PYTHON_PATH = "C:/Users/Adrian/Miniconda3/envs/versusme-ia/python.exe";

router.post("/predict_full", async (req, res) => {
  console.log("🔥 LLEGÓ la petición a /predict_full");
  console.log("📤 Enviando a Python:", req.body);

  const pyPath = path.join(__dirname, "../../ai/run_recommender.py");

  const pyshell = new PythonShell(pyPath, {
    pythonPath: PYTHON_PATH,
    mode: "text",
    pythonOptions: ["-u"],
  });

  // Enviar el JSON correctamente
  pyshell.send(JSON.stringify(req.body));
  pyshell.end();


  pyshell.on("message", (msg) => {
    console.log("🐍 PY STDOUT:", msg);

    try {
      const parsed = JSON.parse(msg);
      return res.json(parsed);
    } catch (err) {
      console.error("❌ ERROR PARSEANDO PYTHON:", err, msg);
    }
  });

  pyshell.on("stderr", (stderr) => {
    console.error("🐍 PY STDERR:", stderr);
  });

  pyshell.on("error", (err) => {
    console.error("⛔ PYTHON ERROR:", err);
    res.status(500).json({ error: "Error ejecutando IA" });
  });

  pyshell.on("close", () => {
    console.log("🐍 Python finalizó");
  });
});

// ✨ IMPORTANTE ✨
export default router;
