"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function CalificarJugadoresPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const [match, setMatch] = useState<any>(null);
  const [myRatings, setMyRatings] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);

  const fetchMatch = async () => {
    const res = await fetch(`${API_BASE}/api/matches/${id}`, {
      credentials: "include",
    });
    const data = await res.json();
    setMatch(data);
  };

  useEffect(() => {
    fetchMatch();
  }, []);

  const setStars = (playerId: number, stars: number) => {
    setMyRatings((prev) => ({ ...prev, [playerId]: stars }));
  };

  const enviarRatings = async () => {
    await fetch(`${API_BASE}/api/matches/${id}/rate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratings: myRatings }),
    });
    setSubmitted(true);
  };

  if (!match) return <p>Cargando...</p>;

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
        color: "white",
      }}
    >
      <button onClick={() => router.back()} style={{ color: "#25c50e", background: "none", border: "none" }}>
        ← Volver
      </button>

      <h1 style={{ marginTop: "1rem" }}>Calificar jugadores ⭐</h1>

      <p style={{ opacity: 0.8 }}>Califica a tus compañeros de 1 a 5 estrellas.</p>

      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {match.players.map((p: any) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #333",
              padding: "1.2rem",
              borderRadius: "14px",
              background: "#1b1c1e",
              textAlign: "center",
            }}
          >
            <Image
              src={
                p.profile_picture
                  ? p.profile_picture.startsWith("http")
                    ? p.profile_picture
                    : `${API_BASE}/${p.profile_picture.replace(/^\/+/, "")}`
                  : "/assets/img/img_perfil/default-user.jpg"
              }
              alt={p.name}
              width={80}
              height={80}
              style={{ marginLeft: "32%", borderRadius: "50%", marginBottom: "0.5rem" }}
            />

            <h3>{p.name}</h3>

            <div style={{ marginTop: "0.7rem", fontSize: "1.4rem" }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  onClick={() => setStars(p.id, s)}
                  style={{
                    cursor: "pointer",
                    marginRight: "5px",
                    color: myRatings[p.id] >= s ? "#FFD700" : "#666",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={enviarRatings}
          style={{
            marginTop: "2rem",
            padding: "14px 24px",
            background: "#25c50e",
            color: "#000",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Enviar calificaciones
        </button>
      ) : (
        <p style={{ marginTop: "2rem", color: "#25c50e" }}>
          ✔️ Calificaciones enviadas
        </p>
      )}
    </div>
  );
}
