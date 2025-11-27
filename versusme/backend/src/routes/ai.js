import express from "express";
import { spawn } from "child_process";

const router = express.Router();

router.post("/predict_full", (req, res) => {
  const py = spawn("C:/Users/Adrian/Miniconda3/envs/versusme-ia/python.exe", ["./ai/recommend_full.py"]);

  py.stdin.write(JSON.stringify(req.body));
  py.stdin.end();

  let output = "";

  py.stdout.on("data", (data) => {
    output += data.toString();
  });

  py.stderr.on("data", (data) => {
    console.error("PYTHON ERROR:", data.toString());
  });

  py.on("close", () => {
    try {
      res.json(JSON.parse(output));
    } catch (err) {
      console.error("JSON ERROR:", err);
      res.status(500).json({ error: "Python returned invalid output" });
    }
  });
});

export default router;
