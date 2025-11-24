"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

function Loader() {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4">
      <div className="w-14 h-14 rounded-full border-4 border-green-500/30 border-t-green-500 animate-spin shadow-lg" />
      <p className="text-gray-300 text-lg">Cargando…</p>
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

  const [hasVoted, setHasVoted] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 variable central
  const votosTotales = votes.length;
  const votosNecesarios = totalPlayers;

  const fetchAll = async () => {
    const m = await fetch(`${API_BASE}/api/matches/${id}`, {
      credentials: "include",
    });
    const matchData = await m.json();
    setMatch(matchData);

    const v = await fetch(`${API_BASE}/api/matches/${id}/votes`, {
      credentials: "include",
    });
    const voteData = await v.json();

    setVotes(voteData.votes);
    setTotalPlayers(voteData.totalPlayers);
    setHasVoted(voteData.userHasVoted);

    setLoading(false);
  };

  // Carga inicial
  useEffect(() => {
    fetchAll();
  }, []);

  // Refrescar automáticamente hasta completar votos
  useEffect(() => {
    if (votosTotales >= votosNecesarios) return;

    const ref = setInterval(fetchAll, 2000);
    return () => clearInterval(ref);
  }, [votosTotales, votosNecesarios]);

  const toggleWinner = (playerId: number) => {
    if (hasVoted) return;
    setSelectedWinners((p) =>
      p.includes(playerId) ? p.filter((id) => id !== playerId) : [...p, playerId]
    );
  };

  const votar = async () => {
    await fetch(`${API_BASE}/api/matches/${id}/vote`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winners: selectedWinners }),
    });

    setHasVoted(true);
    fetchAll();
  };

  const verGanador = () => {
    router.push(`/partido/${id}/ganador/final`);
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">

      {/* VOLVER */}
      <button
        onClick={() => router.back()}
        className="text-green-400 hover:text-green-300 text-sm mb-4"
      >
        ← Volver
      </button>

      <div className="bg-[#1a1c1f]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">
        
        <h1 className="text-3xl font-bold">Elegir ganador</h1>
        <p className="text-gray-400 mt-1">
          {votosTotales}/{votosNecesarios} jugadores ya votaron.
        </p>

        {/* Barra */}
        <div className="w-full bg-gray-700/50 h-3 rounded-full mt-4 mb-8">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${(votosTotales / votosNecesarios) * 100}%` }}
          />
        </div>

        {/* GRID JUGADORES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {match.players.map((p: any) => {
            const votosJugador =
              votes.filter((v: any) => v.voted_player_id === p.id).length;

            return (
              <div
                key={p.id}
                className={`
                  p-5 rounded-xl flex flex-col items-center transition border 
                  ${selectedWinners.includes(p.id)
                    ? "border-green-500 bg-green-500/20"
                    : "border-white/10 bg-white/5"}
                  ${hasVoted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
                onClick={() => toggleWinner(p.id)}
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
                  width={85}
                  height={85}
                  className="rounded-full object-cover border border-white/20"
                />
                <h3 className="mt-3 font-semibold">{p.name}</h3>
                <p className="text-gray-400 text-sm">{votosJugador} voto(s)</p>
              </div>
            );
          })}
        </div>

        {/* BOTÓN ENVIAR VOTO (se bloquea después de votar) */}
        <button
          onClick={votar}
          disabled={hasVoted || selectedWinners.length === 0}
          className={`
            mt-8 px-6 py-3 rounded-xl font-bold transition
            ${
              hasVoted || selectedWinners.length === 0
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-green-500 text-black hover:bg-green-400"
            }
          `}
        >
          Enviar voto
        </button>

        {/* BOTÓN VER GANADOR (cuando ya todos votaron) */}
        <button
          onClick={verGanador}
          disabled={votosTotales < votosNecesarios}
          className={`
            ml-4 mt-4 px-6 py-3 rounded-xl font-bold transition
            ${
              votosTotales < votosNecesarios
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-green-500 text-black hover:bg-green-400"
            }
          `}
        >
          Ver ganador 🏆
        </button>

      </div>
    </div>
  );
}
