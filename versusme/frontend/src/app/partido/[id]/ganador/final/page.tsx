"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

function Loader() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1.2rem",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          border: "6px solid rgba(37, 197, 14, 0.15)",
          borderTopColor: "#25c50e",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />

      <p style={{ color: "#bfbfbf", fontSize: "1.1rem", opacity: 0.9 }}>
        Cargando ganador(es)...
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function GanadorFinal() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWinner = async () => {
    const res = await fetch(`${API_BASE}/api/matches/${id}/winner`, {
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok) {
      setWinners(data.winners || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWinner();
  }, []);

  if (loading) return <Loader />;

  if (winners.length === 0) {
    return (
      <div style={{ textAlign: "center", paddingTop: "5rem", color: "#fff" }}>
        <h1 style={{ marginBottom: "1rem" }}>Aún no hay ganador 😕</h1>
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            background: "#25c50e",
            border: "none",
            padding: "12px 24px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        padding: "25vh 1vw",
        maxWidth: "900px",
        margin: "0 auto",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
        🎉 ¡Felicidades a los ganadores!
      </h1>

      {winners.map((w) => (
        <div key={w.id} style={{ marginTop: "2rem" }}>
          <center><Image
            src={
              w.profile_picture ||
              "/assets/img/img_perfil/default-user.jpg"
            }
            alt={w.name}
            width={140}
            height={140}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 0 20px #25c50e80",
            }}
          /></center>

          <h2 style={{ marginTop: "1.3rem", fontSize: "1.8rem" }}>
            🏆 {w.name}
          </h2>

          <p style={{ opacity: 0.8, marginTop: "0.5rem" }}>
            Total de votos: {w.votes}
          </p>
        </div>
      ))}

      <button
        onClick={() => router.push("/dashboard")}
        style={{
          marginTop: "2.5rem",
          padding: "14px 26px",
          background: "#25c50e",
          color: "#000",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "1.1rem",
          fontWeight: 700,
        }}
      >
        Volver al Dashboard
      </button>
    </div>
  );
}
