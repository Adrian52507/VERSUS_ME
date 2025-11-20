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
          boxShadow: "0 0 12px #25c50e70",
        }}
      />
      <p style={{ color: "#bfbfbf", fontSize: "1.1rem" }}>Cargando...</p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function ElegirGanadorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const [match, setMatch] = useState<any>(null);
  const [votes, setVotes] = useState<any[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  /** 🔹 Cargar partido + votos */
  const fetchAll = async () => {
    const resMatch = await fetch(`${API_BASE}/api/matches/${id}`, {
      credentials: "include",
    });
    const dataMatch = await resMatch.json();
    setMatch(dataMatch);

    const resVotes = await fetch(`${API_BASE}/api/matches/${id}/votes`, {
      credentials: "include",
    });
    const dataVotes = await resVotes.json();

    setVotes(dataVotes.votes);
    setTotalPlayers(dataVotes.totalPlayers);
    setTotalVoters(dataVotes.totalVoters);

    if (dataVotes.userHasVoted) setHasVoted(true);

    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /** 🔹 Función para alternar selección */
  const toggleWinner = (playerId: number) => {
    if (hasVoted) return; // ya votó → no puede tocar nada
    setSelectedWinners((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  /** 🔹 Confirmar voto */
  const votar = async () => {
    const res = await fetch(`${API_BASE}/api/matches/${id}/vote`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winners: selectedWinners }),
    });

    if (res.ok) {
      setHasVoted(true);
      fetchAll();
    }
  };

  /** 🔹 Ir a la vista final */
  const verGanador = () => {
    router.push(`/partido/${id}/ganador/final`);
  };

  if (loading) return <Loader />;

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1000px",
        margin: "0 auto",
        color: "#fff",
      }}
    >
      <button
        onClick={() => router.back()}
        style={{
          marginBottom: "1.5rem",
          background: "none",
          color: "#25c50e",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
        }}
      >
        ← Volver
      </button>

      {/* ------------------ TARJETA PRINCIPAL ------------------ */}
      <div
        style={{
          background: "#1c1d1f",
          padding: "2rem",
          borderRadius: "18px",
          border: "2px solid #2e2f31",
          boxShadow: "0 4px 12px rgba(0,0,0,0.45)",
        }}
      >
        <h1>Elegir ganador</h1>

        {/* ------------------ PROGRESO DE VOTOS ------------------ */}
        <p style={{ marginTop: "0.5rem", opacity: 0.85 }}>
          {totalVoters}/{totalPlayers} jugadores ya votaron.
        </p>

        {/* Barra */}
        <div
          style={{
            width: "100%",
            height: "10px",
            background: "#333",
            borderRadius: "10px",
            margin: "1rem 0 1.5rem",
          }}
        >
          <div
            style={{
              width: `${(totalVoters / totalPlayers) * 100}%`,
              height: "100%",
              background: "#25c50e",
              borderRadius: "10px",
              transition: "0.3s",
            }}
          />
        </div>

        {/* ------------------ GRID DE JUGADORES ------------------ */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.3rem",
          }}
        >
          {match.players.map((p: any) => {
            const votosJugador =
              votes.find((v: any) => v.voted_player_id === p.id)?.votes || 0;

            return (
              <div
                key={p.id}
                onClick={() => toggleWinner(p.id)}
                style={{
                  border: selectedWinners.includes(p.id)
                    ? "3px solid #25c50e"
                    : "2px solid #3d3d3d",
                  background: selectedWinners.includes(p.id)
                    ? "rgba(37, 197, 14, 0.15)"
                    : "#252627",
                  borderRadius: "14px",
                  padding: "1.2rem",
                  cursor: hasVoted ? "not-allowed" : "pointer",
                  opacity: hasVoted ? 0.5 : 1,
                  transition: "0.25s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
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
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />

                <h3 style={{ marginTop: "0.8rem" }}>{p.name}</h3>

                <p style={{ marginTop: "0.5rem", color: "#bbb" }}>
                  {votosJugador} voto(s)
                </p>
              </div>
            );
          })}
        </div>

        {/* ------------------ BOTONES ------------------ */}
        {!hasVoted && (
          <button
            onClick={votar}
            disabled={selectedWinners.length === 0}
            style={{
              marginTop: "2rem",
              padding: "14px 24px",
              background:
                selectedWinners.length === 0 ? "#333" : "#25c50e",
              border: "none",
              color: selectedWinners.length === 0 ? "#777" : "#000",
              cursor:
                selectedWinners.length === 0 ? "not-allowed" : "pointer",
              borderRadius: "10px",
              fontWeight: 700,
            }}
          >
            Enviar voto
          </button>
        )}

        {hasVoted && totalVoters === totalPlayers && (
          <button
            onClick={verGanador}
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
            Ver ganador 🏆
          </button>
        )}
      </div>
    </div>
  );
}
