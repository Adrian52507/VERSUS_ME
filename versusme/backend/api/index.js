import app from "../src/server.js";

// Vercel exige exportar una función handler, no un objeto o servidor iniciado.
export default function handler(req, res) {
  // Vercel usará esta función como el entrypoint.
  return app(req, res);
}
