import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  uri: process.env.MYSQL_URL,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: true
  }
});

// Verificación de conexión
(async () => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    console.log("✅ DB conectada:", rows[0].time);
  } catch (err) {
    console.error("❌ Error conectando DB:", err);
  }
})();
