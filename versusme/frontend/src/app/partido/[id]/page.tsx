"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const SPORT_ICONS: any = {
  "Fútbol": "/assets/img/img_dashboard_principal/balon_futbol_verde_icono.png",
  "Baloncesto": "/assets/img/img_dashboard_principal/balon_basquet_verde_icono.png",
  "Tenis": "/assets/img/img_dashboard_principal/raqueta_tenis_verde_icono.png",
  "Pádel": "/assets/img/img_dashboard_principal/padel_verde_icono.png",
  "Vóleibol": "/assets/img/img_dashboard_principal/balon_veloibol_verde_icono.png",
  "Natación": "/assets/img/img_dashboard_principal/natacion_verde_icono.png",
};

export default function PartidoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatch = async () => {
    const res = await fetch(`${API_BASE}/api/matches/${id}`, {
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) setMatch(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMatch();
  }, []);

  const joinMatch = async () => {
    await fetch(`${API_BASE}/api/matches/join/${id}`, {
      method: "POST",
      credentials: "include",
    });
    fetchMatch();
  };

  const cancelMatch = async () => {
    await fetch(`${API_BASE}/api/matches/join/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchMatch();
  };

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(dateString: string) {
    const d = new Date(dateString);
    return d.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }


  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 border-4 border-green-400/30 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-gray-300 text-lg">Cargando partido...</p>
      </div>
    );
  }

  if (!match) return <p>Error cargando partido</p>;

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => router.back()}
        className="text-gray-300 hover:text-white mb-6 transition"
      >
        ← Volver
      </button>

      {/* HEADER DEL PARTIDO */}
      <div
        className="
          w-full p-6 rounded-2xl
          bg-[#1e1f22]/70 backdrop-blur-xl border border-white/10
          shadow-lg flex items-center gap-5
          mb-8
        "
      >
        <Image
          src={SPORT_ICONS[match.sport]}
          width={50}
          height={50}
          alt="icono"
        />

        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            {match.sport}
            <span className="text-[#25C50E]">• {match.district}</span>
          </h1>

          <p className="text-gray-300 mt-1">
            {formatDate(match.match_date)} — {formatTime(match.match_date)}
          </p>
        </div>
      </div>

      {/* GRID DE DATOS PRINCIPALES */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1e1f22]/60 border border-white/10 rounded-xl p-4">
          <p className="text-sm text-gray-400">Creador</p>
          <span className="text-white font-semibold">{match.creator_name}</span>
        </div>

        <div className="bg-[#1e1f22]/60 border border-white/10 rounded-xl p-4">
          <p className="text-sm text-gray-400">Jugadores</p>
          <span className="text-white font-semibold">
            {match.players.length}/{match.players_needed}
          </span>
        </div>

        <div className="bg-[#1e1f22]/60 border border-white/10 rounded-xl p-4">
          <p className="text-sm text-gray-400">Apuesta</p>
          <span className="text-white font-semibold">
            {match.has_bet ? `S/ ${match.bet_amount}` : "Sin apuesta"}
          </span>
        </div>

        <div className="bg-[#1e1f22]/60 border border-white/10 rounded-xl p-4">
          <p className="text-sm text-gray-400">Ubicación</p>
          <span className="text-white font-semibold">{match.location_text}</span>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <div className="bg-[#1e1f22]/70 border border-white/10 rounded-xl p-5 mb-8">
        <h3 className="text-lg font-semibold text-white mb-2">
          Descripción
        </h3>
        <p className="text-gray-300 leading-relaxed">{match.description}</p>
      </div>

      {/* JUGADORES */}
      <div className="bg-[#1e1f22]/70 border border-white/10 rounded-xl p-5 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Jugadores inscritos ({match.players.length})
        </h3>

        {match.players.map((p: any) => (
          <div
            key={p.id}
            className="
              flex items-center gap-3 p-3 mb-2
              bg-[#242628]/80 border border-white/10 rounded-lg
            "
          >
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              {p.name[0]}
            </div>
            <span className="text-white">{p.name}</span>
          </div>
        ))}
      </div>

      {/* BOTONES */}
      <div className="flex flex-wrap gap-4">

        {!match.isJoined ? (
          <button
            onClick={joinMatch}
            className="
              px-6 py-3 bg-[#25C50E] text-black font-bold rounded-xl
              hover:bg-green-500 transition
            "
          >
            Unirse al Partido
          </button>
        ) : (
          <>
            <button
              onClick={cancelMatch}
              className="
                px-5 py-3 bg-red-500 text-white font-semibold rounded-xl
                hover:bg-red-600 transition
              "
            >
              Cancelar participación
            </button>

            <Link
              href={`/partido/${id}/ganador`}
              className="
                px-5 py-3 bg-yellow-400 text-black font-semibold rounded-xl
                hover:bg-yellow-500 transition
              "
            >
              Elegir ganador
            </Link>

            <Link
              href={`/partido/${id}/calificar`}
              className="
                px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl
                hover:bg-blue-500 transition
              "
            >
              Calificar jugadores ⭐
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
