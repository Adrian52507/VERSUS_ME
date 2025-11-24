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

  if (!match) {
    return (
      <div className="text-center text-gray-300 py-32">
        Cargando jugadores...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-white">

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => router.back()}
        className="text-green-400 hover:text-green-300 text-sm mb-4"
      >
        ← Volver
      </button>

      {/* TÍTULO */}
      <h1 className="text-3xl font-bold">Calificar jugadores ⭐</h1>
      <p className="text-gray-400 mt-1">
        Califica a tus compañeros de 1 a 5 estrellas.
      </p>

      {/* GRID DE JUGADORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {match.players.map((p: any) => (
          <div
            key={p.id}
            className="
              bg-[#1a1c1f]/60 backdrop-blur-xl
              border border-white/10 rounded-xl shadow-lg
              p-6 flex flex-col items-center
              hover:bg-white/5 transition
            "
          >
            <Image
              src={
                p.profile_picture
                  ? p.profile_picture.startsWith("http")
                    ? p.profile_picture
                    : `${API_BASE}/${p.profile_picture.replace(/^\/+/, "")}`
                  : "/assets/img/img_perfil/default-user.jpg"
              }
              width={90}
              height={90}
              alt={p.name}
              className="rounded-full object-cover border border-white/20 shadow-md"
            />

            <h3 className="mt-4 font-semibold text-lg">{p.name}</h3>

            {/* ESTRELLAS */}
            <div className="mt-3 flex text-2xl">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  onClick={() => setStars(p.id, s)}
                  className={`
                    cursor-pointer transition select-none
                    ${myRatings[p.id] >= s ? "text-yellow-400" : "text-gray-600"}
                    hover:text-yellow-300
                  `}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* BOTÓN ENVIAR */}
      {!submitted ? (
        <button
          onClick={enviarRatings}
          className="
            mt-10 px-6 py-3 bg-green-500 text-black font-bold
            rounded-xl transition hover:bg-green-400
          "
        >
          Enviar calificaciones
        </button>
      ) : (
        <p className="mt-10 text-green-400 text-lg font-semibold animate-pulse text-center">
          ✔️ Calificaciones enviadas correctamente
        </p>
      )}
    </div>
  );
}
