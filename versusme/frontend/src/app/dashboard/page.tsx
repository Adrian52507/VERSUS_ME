"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

        const res = await fetch(`${API_BASE}/api/dashboard`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) setMensaje(data.message);
        else setMensaje("No autorizado. Inicia sesión nuevamente.");
      } catch {
        setMensaje("Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando...</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>{mensaje}</h1>
      <button
        onClick={async () => {
          const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
          await fetch(`${API_BASE}/api/logout`, {
            method: "POST",
            credentials: "include",
          });
          window.location.href = "/login";
        }}
        style={{
          marginTop: "2rem",
          padding: "10px 20px",
          background: "#25C50E",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
