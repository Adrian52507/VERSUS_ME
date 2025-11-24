"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

function Loader() {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-4">
      <div className="
        w-14 h-14 border-4 border-green-500/30 
        border-t-green-500 rounded-full animate-spin
      " />
      <p className="text-gray-300 text-lg">Cargando ganador(es)...</p>
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
    if (res.ok) setWinners(data.winners || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchWinner();
  }, []);

  if (loading) return <Loader />;

  if (winners.length === 0) {
    return (
      <div className="h-screen flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-3xl font-bold mb-3">Aún no hay ganador 😕</h1>

        <button
          onClick={() => router.push("/dashboard")}
          className="
            bg-green-500 text-black px-6 py-3 rounded-xl 
            font-bold hover:bg-green-400 transition
          "
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 text-white text-center">

      <h1 className="text-4xl font-bold mb-8 animate-fade-in">
        🎉 ¡Felicidades a los ganadores!
      </h1>

      <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center justify-center">

        {winners.map((w) => (
          <div
            key={w.id}
            className="
              bg-white/5 backdrop-blur-xl p-8 rounded-2xl 
              border border-white/10 shadow-xl
              flex flex-col items-center
              animate-fade-up
            "
          >
            <Image
              src={
                w.profile_picture
                  ? (w.profile_picture.startsWith("http")
                      ? w.profile_picture
                      : `${API_BASE}/${w.profile_picture.replace(/^\/+/, "")}`)
                  : "/assets/img/img_perfil/default-user.jpg"
              }
              alt={w.name}
              width={160}
              height={160}
              className="
                rounded-full object-cover
                border border-green-500/50 shadow-[0_0_25px_rgba(37,197,14,0.45)]
              "
              unoptimized
            />

            <h2 className="text-2xl font-bold mt-5">🏆 {w.name}</h2>

            <p className="text-gray-300 mt-2">
              Total de votos: <span className="text-green-400">{w.votes}</span>
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/dashboard")}
        className="
          mt-12 px-7 py-3 bg-green-500 text-black 
          font-bold rounded-xl hover:bg-green-400 transition
        "
      >
        Volver al Dashboard
      </button>
    </div>
  );
}
