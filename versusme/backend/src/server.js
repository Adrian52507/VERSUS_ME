import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { pool } from "./db.js";

import {
  register,
  login,
  dashboard,
  logout,
  verifyCode,
  resendCode,
  forgotPassword,
  resetPassword,
  authMiddleware,
} from "./auth.js";

import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCoverPhoto,
  upload, // multer-cloudinary
} from "./profile.js";

import aiRoutes from "./routes/ai.js";


dotenv.config();

const app = express();
app.set("trust proxy", 1);
  

/* ─────────────────────────────────────────────
   🔐 CORS CONFIG
────────────────────────────────────────────── */

const allowedOrigins = [
  "http://localhost:3000",
  process.env.ORIGIN_FRONTEND
].filter(Boolean); // limpia null

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);

      console.warn("🚫 CORS bloqueado para:", origin);
      return callback(new Error("No permitido por CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept"
    ]
  })
);




app.use(express.json());
app.use(cookieParser());


//ai routes
app.use("/api/ai", aiRoutes);

/* ─────────────────────────────────────────────
   🌐 AUTH + PROFILE
────────────────────────────────────────────── */
app.get("/", (_, res) => res.send("Servidor funcionando ✅"));
app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/dashboard", authMiddleware, dashboard);
app.post("/api/logout", logout);
app.post("/api/verify", verifyCode);
app.post("/api/resend", resendCode);
app.post("/api/forgot-password", forgotPassword);
app.post("/api/reset-password", resetPassword);

// Perfil
app.get("/api/profile", authMiddleware, getProfile);
app.put("/api/profile", authMiddleware, updateProfile);

// Subida de imágenes
app.post("/api/profile/picture", authMiddleware, upload.single("profile_picture"), uploadProfilePicture);
app.post("/api/profile/cover", authMiddleware, upload.single("cover_photo"), uploadCoverPhoto);

/* ─────────────────────────────────────────────
   ⚽ CREAR PARTIDO
────────────────────────────────────────────── */
app.post("/api/matches", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  const {
    sport,
    district,
    locationText,
    lat,
    lng,
    date,
    time,
    players,
    hasBet,
    betAmount,
    desc
  } = req.body;

  try {
    const sql = `
      INSERT INTO matches (
        user_id, sport, district, location_text, latitude, longitude,
        match_date, match_time, players_needed, has_bet, bet_amount, description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      userId,
      sport,
      district,
      locationText,
      lat,
      lng,
      date,
      time,
      players,
      hasBet,
      betAmount,
      desc
    ]);

    const matchId = result.insertId;

    // Crear sala de chat
    const [roomResult] = await pool.execute(
      "INSERT INTO chat_rooms (match_id) VALUES (?)",
      [matchId]
    );

    const roomId = roomResult.insertId;

    // Agregar creador como jugador
    await pool.execute(
      "INSERT INTO match_players (match_id, user_id) VALUES (?, ?)",
      [matchId, userId]
    );

    // Agregar creador a la sala de chat
    await pool.execute(
      "INSERT INTO match_chat_members (room_id, user_id) VALUES (?, ?)",
      [roomId, userId]
    );

    res.json({ success: true, message: "Partido creado con chat y jugador inicial agregado" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando el partido" });
  }
});

/* ─────────────────────────────────────────────
   📌 PARTIDOS: LISTA GENERAL
────────────────────────────────────────────── */
app.get("/api/matches/all", async (req, res) => {
  try {
    const sql = `
      SELECT 
        m.id,
        m.user_id,
        m.sport,
        m.district,
        m.location_text,
        m.latitude,
        m.longitude,
        m.match_date,
        m.match_time,
        m.players_needed,
        m.has_bet,
        m.bet_amount,
        m.description,
        m.created_at,

        ANY_VALUE(u.name) AS creator_name,
        ANY_VALUE(p.profile_picture) AS creator_photo,
        COUNT(mp.id) AS current_players

      FROM matches m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN match_players mp ON mp.match_id = m.id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `;

    const [rows] = await pool.execute(sql);
    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo partidos" });
  }
});

/* ─────────────────────────────────────────────
   ➕ UNIRSE A PARTIDO
────────────────────────────────────────────── */
app.post("/api/matches/join/:id", authMiddleware, async (req, res) => {
  const matchId = req.params.id;
  const userId = req.user.id;

  try {
    // Registrar unión
    await pool.execute(
      "INSERT IGNORE INTO match_players (match_id, user_id) VALUES (?, ?)",
      [matchId, userId]
    );

    // Asegurar sala de chat
    const [rooms] = await pool.execute(
      "SELECT id FROM chat_rooms WHERE match_id = ?",
      [matchId]
    );

    let roomId;

    if (rooms.length === 0) {
      const [r] = await pool.execute(
        "INSERT INTO chat_rooms (match_id) VALUES (?)",
        [matchId]
      );
      roomId = r.insertId;
    } else {
      roomId = rooms[0].id;
    }

    // Registrar miembro en el chat
    await pool.execute(
      "INSERT IGNORE INTO match_chat_members (room_id, user_id) VALUES (?, ?)",
      [roomId, userId]
    );

    res.json({ success: true, message: "Unido al partido" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo unir" });
  }
});

/* ─────────────────────────────────────────────
   ❌ SALIR DEL PARTIDO
────────────────────────────────────────────── */
app.delete("/api/matches/join/:id", authMiddleware, async (req, res) => {
  const matchId = req.params.id;
  const userId = req.user.id;

  try {
    await pool.execute(
      "DELETE FROM match_players WHERE match_id = ? AND user_id = ?",
      [matchId, userId]
    );

    res.json({ success: true, message: "Has salido del partido" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo salir del partido" });
  }
});

/* ─────────────────────────────────────────────
   ✔ PARTIDOS ACEPTADOS POR EL USUARIO
────────────────────────────────────────────── */
app.get("/api/matches/accepted", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.execute(`
      SELECT m.*, u.name AS creator_name, p.profile_picture AS creator_photo
      FROM match_players mp
      JOIN matches m ON mp.match_id = m.id
      JOIN users u ON m.user_id = u.id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE mp.user_id = ?
      ORDER BY m.match_date ASC
    `, [userId]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo tus partidos" });
  }
});

/* ─────────────────────────────────────────────
   📄 DETALLE DEL PARTIDO
────────────────────────────────────────────── */
app.get("/api/matches/:id", authMiddleware, async (req, res) => {
  const matchId = req.params.id;
  const userId = req.user.id;

  try {
    const [matchRows] = await pool.execute(
      `SELECT 
        m.*, u.name AS creator_name, p.profile_picture AS creator_photo
      FROM matches m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE m.id = ?`,
      [matchId]
    );

    if (matchRows.length === 0)
      return res.status(404).json({ error: "Partido no encontrado" });

    const match = matchRows[0];

    const [players] = await pool.execute(
      `SELECT u.id, u.name, pr.profile_picture
       FROM match_players mp
       JOIN users u ON mp.user_id = u.id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       WHERE mp.match_id = ?`,
      [matchId]
    );

    const isJoined = players.some((p) => p.id === userId);

    res.json({
      ...match,
      players,
      isJoined,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo partido" });
  }
});

/* ─────────────────────────────────────────────
   💬 CHAT: SALAS
────────────────────────────────────────────── */
app.get("/api/chat/rooms", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.execute(
      `SELECT cr.id AS room_id, cr.match_id, m.sport, m.district, m.match_date,
              u.name AS creator_name
       FROM chat_rooms cr
       JOIN matches m ON cr.match_id = m.id
       JOIN users u ON m.user_id = u.id
       JOIN match_players mp ON mp.match_id = m.id
       WHERE mp.user_id = ?
       ORDER BY m.match_date ASC`,
      [userId]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo salas" });
  }
});

/* ─────────────────────────────────────────────
   💬 CHAT: MENSAJES
────────────────────────────────────────────── */
app.get("/api/chat/messages/:room_id", authMiddleware, async (req, res) => {
  const roomId = req.params.room_id;
  const userId = req.user.id;

  try {
    const [rows] = await pool.execute(
      `SELECT 
        cm.id,
        cm.room_id,
        cm.user_id,
        cm.content,
        cm.created_at,
        u.name,
        p.profile_picture,
        (cm.user_id = ?) AS isMine
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE cm.room_id = ?
      ORDER BY cm.created_at ASC`,
      [userId, roomId]
    );

    res.json(rows);

  } catch (err) {
    console.error("Error obteniendo mensajes:", err);
    res.status(500).json({ error: "Error obteniendo mensajes" });
  }
});

/* ─────────────────────────────────────────────
   💬 CHAT: OBTENER ROOM POR PARTIDO
────────────────────────────────────────────── */
app.get("/api/chat/room-by-match/:id", authMiddleware, async (req, res) => {
  const matchId = req.params.id;

  try {
    const [rows] = await pool.execute(
      `SELECT id FROM chat_rooms WHERE match_id = ?`,
      [matchId]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "No existe sala para este partido" });

    res.json({ room_id: rows[0].id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo sala" });
  }
});

/* ─────────────────────────────────────────────
   💬 CHAT: ENVIAR MENSAJE
────────────────────────────────────────────── */
app.post("/api/chat/send", authMiddleware, async (req, res) => {
  const { room_id, content } = req.body;
  const userId = req.user.id;

  if (!content || !room_id)
    return res.status(400).json({ error: "Datos incompletos" });

  try {
    await pool.execute(
      `INSERT INTO chat_messages (room_id, user_id, content)
       VALUES (?, ?, ?)`,
      [room_id, userId, content]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("Error enviando mensaje:", err);
    res.status(500).json({ error: "Error enviando mensaje" });
  }
});

/* ─────────────────────────────────────────────
   🏆 VOTAR GANADOR
────────────────────────────────────────────── */
app.post("/api/matches/:id/vote", authMiddleware, async (req, res) => {
  const matchId = req.params.id;
  const voterId = req.user.id;
  const { winners } = req.body;

  try {
    // Validar participación
    const [check] = await pool.query(
      "SELECT 1 FROM match_players WHERE match_id = ? AND user_id = ?",
      [matchId, voterId]
    );
    if (check.length === 0)
      return res.status(403).json({ error: "No participaste en el partido" });

    // Validar si ya votó
    const [existing] = await pool.query(
      "SELECT 1 FROM match_votes WHERE match_id = ? AND voter_id = ?",
      [matchId, voterId]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: "Ya votaste en este partido" });

    // Guardar votos
    for (const winnerId of winners) {
      await pool.query(
        "INSERT INTO match_votes (match_id, voter_id, voted_player_id) VALUES (?, ?, ?)",
        [matchId, voterId, winnerId]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Error guardando voto:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

/* ─────────────────────────────────────────────
   🏆 ESTADO DE VOTO DEL USUARIO
────────────────────────────────────────────── */
app.get("/api/matches/:id/vote/status", authMiddleware, async (req, res) => {
  const matchId = req.params.id;
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      "SELECT 1 FROM match_votes WHERE match_id = ? AND voter_id = ? LIMIT 1",
      [matchId, userId]
    );

    res.json({ hasVoted: rows.length > 0 });

  } catch (err) {
    console.error("Error vote status:", err);
    res.status(500).json({ error: "Error verificando voto" });
  }
});

/* ─────────────────────────────────────────────
   🏆 CONTAR VOTOS Y PROGRESO
────────────────────────────────────────────── */
app.get("/api/matches/:id/votes", authMiddleware, async (req, res) => {
  const matchId = req.params.id;

  try {
    // votos por jugador
    const [rows] = await pool.query(
      `SELECT voted_player_id, COUNT(*) AS votes
       FROM match_votes
       WHERE match_id = ?
       GROUP BY voted_player_id`,
      [matchId]
    );

    // total jugadores
    const [[players]] = await pool.query(
      "SELECT COUNT(*) AS total FROM match_players WHERE match_id = ?",
      [matchId]
    );

    // total votantes
    const [[voters]] = await pool.query(
      "SELECT COUNT(DISTINCT voter_id) AS voted FROM match_votes WHERE match_id = ?",
      [matchId]
    );

    res.json({
      votes: rows,
      totalPlayers: players.total,
      totalVoters: voters.voted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error obteniendo votos" });
  }
});

/* ─────────────────────────────────────────────
   🏆 OBTENER GANADOR(ES)
────────────────────────────────────────────── */
app.get("/api/matches/:id/winner", authMiddleware, async (req, res) => {
  const matchId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT voted_player_id AS player_id, COUNT(*) AS votes
       FROM match_votes
       WHERE match_id = ?
       GROUP BY voted_player_id`,
      [matchId]
    );

    if (rows.length === 0)
      return res.json({ winners: [] });

    const maxVotes = Math.max(...rows.map(r => r.votes));

    const winnersIds = rows
      .filter(r => r.votes === maxVotes)
      .map(r => r.player_id);

    const [winnerDetails] = await pool.query(
      `SELECT u.id, u.name, p.profile_picture
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id IN (?)`,
      [winnersIds]
    );

    const finalWinners = winnerDetails.map(w => ({
      ...w,
      votes: maxVotes
    }));

    res.json({ winners: finalWinners });

  } catch (err) {
    console.error("Error obteniendo ganadores:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

/* ─────────────────────────────────────────────
   ⭐ RATING DE JUGADORES
────────────────────────────────────────────── */
app.post("/api/matches/:id/rate", authMiddleware, async (req, res) => {
  const matchId = req.params.id;
  const raterId = req.user.id;
  const { ratings } = req.body; // { playerId: stars }

  try {
    for (const ratedId in ratings) {
      const stars = ratings[ratedId];

      await pool.query(
        `INSERT INTO player_ratings (match_id, rater_id, rated_player_id, stars)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE stars = VALUES(stars)`,
        [matchId, raterId, ratedId, stars]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Error guardando rating:", err);
    res.status(500).json({ error: "Error guardando rating" });
  }
});

/* ─────────────────────────────────────────────
   📊 KPI DEL USUARIO
────────────────────────────────────────────── */
app.get("/api/user/stats", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const [[played]] = await pool.query(
      "SELECT COUNT(*) AS total FROM match_players WHERE user_id = ?",
      [userId]
    );

    const [[created]] = await pool.query(
      "SELECT COUNT(*) AS total FROM matches WHERE user_id = ?",
      [userId]
    );

    const [[rating]] = await pool.query(
      "SELECT AVG(stars) AS avg FROM player_ratings WHERE rated_player_id = ?",
      [userId]
    );

    res.json({
      played: played.total,
      created: created.total,
      rating: rating.avg ? Number(rating.avg).toFixed(2) : 0,
    });

  } catch (err) {
    console.error("Error user stats:", err);
    res.status(500).json({ error: "Error obteniendo KPIs" });
  }
});

/* ─────────────────────────────────────────────
   🚀 START SERVER LOCAL
────────────────────────────────────────────── */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`🚀 API local lista en http://localhost:${PORT}`)
  );
}

export default app;
