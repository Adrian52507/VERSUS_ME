import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import { pool } from "./db.js";
import paymentsRouter from "./payments.js";

// STRIPE
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

import webhookRouter from "./webhook.js"; // lo crearás luego


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

dotenv.config();

const app = express();
app.set("trust proxy", 1);


/* ─────────────────────────────────────────────
   🔐 CORS CONFIG
────────────────────────────────────────────── */
app.use(
  cors({
    origin: process.env.ORIGIN_FRONTEND,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Sec-Fetch-Mode", "Sec-Fetch-Site", "Sec-Fetch-Dest"],

  })
);

// Preflight manual para Vercel
app.options(/.*/, cors({
  origin: process.env.ORIGIN_FRONTEND,
  credentials: true,
}));

app.use("/api/webhook", webhookRouter);
app.use(express.json());
app.use(cookieParser());
app.use("/api/payments", paymentsRouter);

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
app.post(
  "/api/profile/picture",
  authMiddleware,
  async (req, res, next) => {
    const user = req.user;

    // Para leer el mimetype ANTES del upload, usamos multer por campo
    upload.single("profile_picture")(req, res, (err) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });

      const mimetype = req.file?.mimetype || "";

      const allowedBasic = ["image/jpeg", "image/jpg", "image/png"];

      if (!user.is_pro && !allowedBasic.includes(mimetype)) {
        return res.status(403).json({
          error: "Debes ser usuario PRO para subir GIFs, WebP animados o videos."
        });
      }

      next();
    });
  },
  uploadProfilePicture
);
app.post(
  "/api/profile/cover",
  authMiddleware,
  async (req, res, next) => {
    const user = req.user;

    upload.single("cover_photo")(req, res, (err) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });

      const mimetype = req.file?.mimetype || "";

      const allowedBasic = ["image/jpeg", "image/jpg", "image/png"];

      if (!user.is_pro && !allowedBasic.includes(mimetype)) {
        return res.status(403).json({
          error: "Debes ser usuario PRO para subir GIFs, WebP animados o videos."
        });
      }

      next();
    });
  },
  uploadCoverPhoto
);
/* ─────────────────────────────────────────────
   💳 STRIPE: CREAR CHECKOUT SESSION
────────────────────────────────────────────── */
app.get("/api/payments/checkout", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener email y stripe_customer_id
    const [[user]] = await pool.query(
      "SELECT email, stripe_customer_id FROM users WHERE id = ?",
      [userId]
    );

    let customerId = user.stripe_customer_id;

    // Crear customer si no existe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId }
      });

      await pool.query(
        "UPDATE users SET stripe_customer_id = ? WHERE id = ?",
        [customer.id, userId]
      );

      customerId = customer.id;
    }

    // Crear sesion de pago
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_PRO,
          quantity: 1,
        },
      ],
      success_url: `${process.env.ORIGIN_FRONTEND}/pro/success`,
      cancel_url: `${process.env.ORIGIN_FRONTEND}/pro/cancel`,
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando sesión de pago" });
  }
});

/* ─────────────────────────────────────────────
   ❌ STRIPE: CANCELAR SUSCRIPCIÓN
────────────────────────────────────────────── */
app.post("/api/payments/cancel", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const [[user]] = await pool.query(
      "SELECT stripe_subscription_id FROM users WHERE id = ?",
      [userId]
    );

    if (!user.stripe_subscription_id)
      return res.status(400).json({ error: "No tienes suscripción activa" });

    await stripe.subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cancelando suscripción" });
  }
});


/* ─────────────────────────────────────────────
   ⚽ CREAR PARTIDO
────────────────────────────────────────────── */
app.post("/api/matches", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  // ===============================
  //  LIMITES PARA PLAN BÁSICO
  // ===============================
  const [[user]] = await pool.query(
    "SELECT is_pro FROM users WHERE id = ?",
    [userId]
  );

  // Si no es PRO → limitar creación semanal
  if (!user.is_pro) {
    const [[count]] = await pool.query(
      `SELECT COUNT(*) AS created
     FROM matches
     WHERE user_id = ?
     AND YEARWEEK(created_at, 1) = YEARWEEK(NOW(), 1)`,
      [userId]
    );

    if (count.created >= 1) {
      // Calcular próximo lunes
      const now = new Date();
      const day = now.getDay(); // 0=domingo, 1=lunes...
      const daysUntilMonday = (8 - day) % 7;
      const nextMonday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysUntilMonday
      );

      return res.status(403).json({
        error: "Solo puedes crear 1 partido por semana con el plan Básico.",
        nextAvailable: nextMonday.toISOString().slice(0, 10)
      });
    }

  }


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
   📌 PARTIDOS: LISTA GENERAL (versión segura)
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
        ANY_VALUE(u.email) AS creator_email,
        ANY_VALUE(u.is_pro) AS creator_is_pro,

        ANY_VALUE(p.profile_picture) AS creator_photo,
        ANY_VALUE(p.description) AS creator_description,

        (
          SELECT AVG(stars)
          FROM player_ratings pr
          WHERE pr.rated_player_id = u.id
        ) AS creator_rating,

        COUNT(mp.id) AS current_players


      FROM matches m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN match_players mp ON mp.match_id = m.id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `;

    const [rows] = await pool.execute(sql);

    // 🚀 SIEMPRE devolver array
    return res.json(rows || []);

  } catch (err) {
    console.error("❌ Error en /api/matches/all:", err);

    // 🚀 IMPORTANTE: devolver SIEMPRE array vacío, nunca error
    return res.json([]);
  }
});

/* ─────────────────────────────────────────────
   ➕ UNIRSE A PARTIDO
────────────────────────────────────────────── */
app.post("/api/matches/join/:id", authMiddleware, async (req, res) => {
  const matchId = req.params.id;
  const userId = req.user.id;

  // ===============================
  // LIMITES PARA PLAN BÁSICO
  // ===============================
  const [[user]] = await pool.query(
    "SELECT is_pro FROM users WHERE id = ?",
    [userId]
  );

  // Si no es PRO → limitar uniones por semana
  if (!user.is_pro) {
    const [[count]] = await pool.query(
      `SELECT COUNT(*) AS joined
     FROM match_players
     WHERE user_id = ?
     AND YEARWEEK(joined_at, 1) = YEARWEEK(NOW(), 1)`,
      [userId]
    );

    if (count.joined >= 1) {

      // Calcular próximo lunes (inicio de nueva semana ISO)
      const now = new Date();
      const day = now.getDay(); // 0 = domingo
      const daysUntilMonday = (8 - day) % 7;

      const nextMonday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysUntilMonday
      );

      return res.status(403).json({
        error: "Solo puedes unirte a 1 partido por semana con el Plan Básico.",
        nextAvailable: nextMonday.toISOString().slice(0, 10)
      });
    }
  }



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
      rating: rating.avg ? Number(rating.avg).toFixed(2) : 5.0,
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
