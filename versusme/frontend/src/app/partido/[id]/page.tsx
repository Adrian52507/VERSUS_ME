"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import "@/styles/styles_partido.css";

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
    if (res.ok) {
      setMatch(data);
    }
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

  if (loading) return <p>Cargando partido...</p>;
  if (!match) return <p>Error cargando partido</p>;

  return (
    <div className="partido-container">

      <button className="btn-volver" onClick={() => router.back()}>
        ← Volver
      </button>

      <div className="partido-header">
        <Image src={SPORT_ICONS[match.sport]} width={40} height={40} alt="" />
        <h1 className="partido-title">{match.sport}</h1>
      </div>

      <div className="partido-info">
        <p><b>Creador:</b> {match.creator_name}</p>
        <p><b>Distrito:</b> {match.district}</p>
        <p><b>Fecha:</b> {match.match_date}</p>
        <p><b>Hora:</b> {match.match_time}</p>
        <p><b>Jugadores:</b> {match.players.length}/{match.players_needed}</p>
        <p><b>Apuesta:</b> {match.has_bet ? `S/ ${match.bet_amount}` : "No"}</p>
      </div>

      <div className="partido-descripcion">
        <b>Descripción:</b>
        <p>{match.description}</p>
      </div>

      <div className="jugadores-box">
        <h3>Jugadores inscritos</h3>
        {match.players.map((p: any) => (
          <div key={p.id} className="jugador-item">
            <span className="jugador-nombre">{p.name}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2rem" }}>
        {!match.isJoined ? (
          <button className="btn-unirse" onClick={joinMatch}>
            Unirse al Partido
          </button>
        ) : (
          <>
            <button className="btn-cancelar" onClick={cancelMatch}>
              Cancelar participación
            </button>

            <Link
              href={`/partido/${id}/ganador`}
              className="btn-elegir-ganador"
              style={{ fontWeight: "700", padding: "0.8rem" }}
            >
              Elegir ganador
            </Link>

            <Link
              href={`/partido/${id}/calificar`}
              className="btn-calificar"
              style={{
                fontWeight: "700",
                padding: "0.8rem",
                background: "#0e7bff",
                borderRadius: "10px",
                marginLeft: "1rem",
              }}
            >
              Calificar jugadores ⭐
            </Link>

          </>
        )}
      </div>

    </div>
  );
}
