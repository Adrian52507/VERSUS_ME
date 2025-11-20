"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import "@/styles/styles_vista_previa.css";
import Topbar from "@/components/Topbar";
import { useEffect, useState } from "react";

const SPORT_ICONS: any = {
  "Fútbol": "/assets/img/img_dashboard_principal/balon_futbol_verde_icono.png",
  "Baloncesto": "/assets/img/img_dashboard_principal/balon_basquet_verde_icono.png",
  "Tenis": "/assets/img/img_dashboard_principal/raqueta_tenis_verde_icono.png",
  "Pádel": "/assets/img/img_dashboard_principal/padel_verde_icono.png",
  "Vóleibol": "/assets/img/img_dashboard_principal/balon_veloibol_verde_icono.png",
  "Natación": "/assets/img/img_dashboard_principal/natacion_verde_icono.png",
};

function formatDate(date: string) {
  if (!date) return "";
  const d = new Date(date + "T00:00");
  const dias = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${dias[d.getDay()]}, ${d.getDate().toString().padStart(2, "0")} ${meses[d.getMonth()]}.`;
}

function formatTime(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const H = Number(h);
  const suf = H >= 12 ? "p.m." : "a.m.";
  const h12 = ((H + 11) % 12) + 1;
  return `${h12.toString().padStart(2, "0")}:${m} ${suf}`;
}

export default function VistaPreviaContent() {
  const [perfil, setPerfil] = useState<any>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
  const params = useSearchParams();
  const router = useRouter();

  const sport = params.get("sport") || "Fútbol";
  const district = params.get("district") || "Miraflores";
  const date = params.get("date") || "";
  const time = params.get("time") || "";
  const desc = params.get("desc") || "";
  const players = params.get("players") || "11";
  const hasBet = params.get("hasBet") === "true";
  const betAmount = params.get("betAmount") || "0";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setPerfil(data);
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
      }
    };

    fetchProfile();
  }, []);


  return (
    <>
      <Topbar />

      <main className="page">
        <div className="container">

          {/* Intro */}
          <section className="intro">
            <div className="intro-icon">
              <Image
                src="/assets/img/img_dashboard_principal/suma_icono.png"
                width={30}
                height={30}
                alt="crear"
              />
            </div>
            <div className="intro-copy">
              <h1>Crear Nuevo Partido</h1>
              <p>Organiza un partido y conecta con otros jugadores en Lima</p>
            </div>
          </section>

          <h3 className="section-mini">
            <Image
              src="/assets/img/img_dashboard_principal/calendario_verde_icono.png"
              width={28}
              height={28}
              alt="calendario"
            />
            Vista previa del partido
          </h3>

          {/* Tarjeta */}
          <article className="card preview">

            <header className="card-head">
              <div className="left">
                <Image
                  src={SPORT_ICONS[sport]}
                  width={24}
                  height={24}
                  alt="deporte"
                  className="sport"
                />
                <span className="sport-name">{sport}</span>

                {hasBet && (
                  <>
                    <span className="chip">Apuesta</span>
                    <span className="monto-apuesta">S/ {betAmount}</span>
                  </>
                )}
              </div>

              <span className="estado disponible">Disponible</span>
            </header>

            <div className="meta">
              <span>
                <Image
                  src="/assets/img/img_dashboard_principal/ubicacion_blanco_icono.png"
                  width={16}
                  height={16}
                  alt=""
                />
                {district}
              </span>

              <span>
                <Image
                  src="/assets/img/img_dashboard_principal/calendario_blanco_icono.png"
                  width={16}
                  height={16}
                  alt=""
                />
                {formatDate(date)}
              </span>

              <span>
                <Image
                  src="/assets/img/img_dashboard_principal/reloj_blanco_icono.png"
                  width={16}
                  height={16}
                  alt=""
                />
                {formatTime(time)}
              </span>
            </div>

            <p className="desc">{desc}</p>

            <div className="creator">
              {/* Avatar dinámico */}
              <span className="avatar" style={{ overflow: "hidden", padding: 0 }}>
                {perfil?.profile_picture ? (
                  <Image
                    src={
                      perfil.profile_picture.startsWith("http")
                        ? perfil.profile_picture
                        : `${API_BASE}/${perfil.profile_picture.replace(/^\/+/, "")}`
                    }
                    alt="Foto de perfil"
                    width={45}
                    height={45}
                    style={{ objectFit: "cover", borderRadius: "50%" }}
                    unoptimized
                  />
                ) : (
                  // Si no hay foto → primera letra del nombre
                  (perfil?.name?.charAt(0)?.toUpperCase() || "U")
                )}
              </span>

              {/* Nombre dinámico */}
              <div>
                <div className="name">{perfil?.name || "Tu perfil"}</div>
                <div className="muted">Creador del partido</div>
              </div>
            </div>

            <div className="cupos">
              <Image
                src="/assets/img/img_dashboard_principal/jugadores_gris_icono.png"
                width={20}
                height={20}
                alt=""
              />
              <span>
                <b>1</b>/{players} jugadores
              </span>
            </div>

            <div className="progress">
              <span
                className="bar"
                style={{ ["--pct" as any]: `${(1 / Number(players)) * 100}%` }}
              ></span>
            </div>

            <button className="btn-unirse" disabled>
              <Image
                src="/assets/img/img_dashboard_principal/usuario_blanco_icono.png"
                width={27}
                height={27}
                alt=""
              />
              Unirse al Partido
            </button>
          </article>

          {/* Final */}
          <div className="ready">
            <div className="ic">!</div>
            <div>
              <div className="ready-title">¿Todo listo?</div>
              <div className="ready-text">
                Tu partido será visible para otros jugadores. Podrás editarlo o cancelarlo después.
              </div>
            </div>
          </div>

          <section className="actions">
            <button className="btn-outline" onClick={() => router.back()}>
              Volver a crear
            </button>

            <button
              className="btn-primary"
              onClick={async () => {
                const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

                // reconstruimos el formulario desde params
                const body = {
                  sport,
                  district,
                  locationText: params.get("locationText") || "",
                  lat: params.get("lat"),
                  lng: params.get("lng"),
                  date,
                  time,
                  players,
                  hasBet,
                  betAmount,
                  desc
                };

                const res = await fetch(`${API_BASE}/api/matches`, {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body)
                });

                if (res.ok) {
                  alert("Partido publicado");
                  router.push("/dashboard"); // 🔥 redirigir al dashboard
                } else {
                  alert("Error al publicar");
                }
              }}
            >
              Publicar Partido
            </button>

          </section>

        </div>
      </main>
    </>
  );
}
