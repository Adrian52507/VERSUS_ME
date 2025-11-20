"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Topbar from "@/components/Topbar";
import "@/styles/styles_dashboard_principal.css";

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
          animation: "spin 0.7s linear infinite",
          boxShadow: "0 0 12px #25c50e70",
        }}
      />

      <p
        style={{
          color: "#bfbfbf",
          fontSize: "1.1rem",
          letterSpacing: "0.6px",
          opacity: 0.9,
        }}
      >
        Cargando...
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

const SPORT_ICONS: any = {
  Fútbol: "/assets/img/img_dashboard_principal/balon_futbol_verde_icono.png",
  Baloncesto: "/assets/img/img_dashboard_principal/balon_basquet_verde_icono.png",
  Tenis: "/assets/img/img_dashboard_principal/raqueta_tenis_verde_icono.png",
  Pádel: "/assets/img/img_dashboard_principal/padel_verde_icono.png",
  Vóleibol: "/assets/img/img_dashboard_principal/balon_veloibol_verde_icono.png",
  Natación: "/assets/img/img_dashboard_principal/natacion_verde_icono.png",
};

function formatDate(date: string) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const dias = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  return `${dias[d.getDay()]}, ${d.getDate().toString().padStart(2, "0")} ${meses[d.getMonth()]
    }.`;
}

function formatTime(time: string) {
  if (!time) return "";
  const [h, m] = time.split(":");
  const H = Number(h);
  const suf = H >= 12 ? "p.m." : "a.m.";
  const h12 = ((H + 11) % 12) + 1;
  return `${h12.toString().padStart(2, "0")}:${m} ${suf}`;
}

export default function DashboardPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const [usuario, setUsuario] = useState("Usuario");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [tab, setTab] = useState<"disponibles" | "aceptados">("disponibles");

  // KPI STATES
  const [kpiPlayed, setKpiPlayed] = useState(0);
  const [kpiCreated, setKpiCreated] = useState(0);
  const [kpiRating, setKpiRating] = useState(0);

  // FILTROS
  const [filterCreator, setFilterCreator] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterBet, setFilterBet] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const accepted = partidos.filter((p) => p.joined);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setUsuario(data.name || "Usuario");
        setMensaje(data.message || "");
      } else {
        setMensaje("No autorizado. Inicia sesión nuevamente.");
      }
    } catch {
      setMensaje("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        credentials: "include",
      });
      if (res.ok) {
        setPerfil(await res.json());
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
    }
  };

  const fetchMatches = async () => {
    try {
      const resAll = await fetch(`${API_BASE}/api/matches/all`, {
        credentials: "include",
      });
      const all = await resAll.json();

      const resAccepted = await fetch(`${API_BASE}/api/matches/accepted`, {
        credentials: "include",
      });
      const acc = await resAccepted.json();

      const acceptedIds = new Set(acc.map((p: any) => p.id));

      const finalList = all.map((p: any) => ({
        ...p,
        joined: acceptedIds.has(p.id),
      }));

      setPartidos(finalList);
    } catch (err) {
      console.error("Error cargando partidos:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/stats`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setKpiPlayed(data.played);
        setKpiCreated(data.created);
        setKpiRating(data.rating);
      }
    } catch (err) {
      console.error("Error obteniendo KPIs:", err);
    }
  };

  const joinMatch = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/matches/join/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setTab("aceptados");
        await fetchMatches();
      }
    } catch (err) {
      console.error("Error en joinMatch:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchProfile();
    fetchMatches();
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  // -------------- FILTRADO DE PARTIDOS ----------------
  const filteredMatches = partidos.filter((p) => {
    const matchCreator = p.creator_name
      .toLowerCase()
      .includes(filterCreator.toLowerCase());

    const matchSport = filterSport ? p.sport === filterSport : true;

    const matchDistrict = filterDistrict ? p.district === filterDistrict : true;

    const matchBet =
      filterBet === "si"
        ? p.has_bet === 1
        : filterBet === "no"
          ? p.has_bet === 0
          : true;

    const matchDate = filterDate ? p.match_date === filterDate : true;

    return matchCreator && matchSport && matchDistrict && matchBet && matchDate;
  });

  return (
    <div>
      <Topbar />

      <main className="page">
        <div className="container">
          {/* KPIS */}
          <section className="panel kpis">
            <div className="head">
              <div>
                <h2>¡Hola, {usuario}!</h2>
                <p className="sub">¿Listo para tu próximo partido?</p>
              </div>
            </div>

            <div className="kpi-grid">
              <div className="kpi">
                <div className="num green">{kpiPlayed}</div>
                <div className="label">Partidos unidos</div>
              </div>

              <div className="kpi">
                <div className="num">{kpiCreated}</div>
                <div className="label">Partidos creados</div>
              </div>

              <div className="kpi">
                <div className="num">{kpiRating}</div>
                <div className="label">Calificación</div>
              </div>
            </div>
          </section>

          {/* TABS */}
          <div className="tabs">
            <button
              className={`tab ${tab === "disponibles" ? "active" : ""}`}
              onClick={() => setTab("disponibles")}
            >
              <Image
                src="/assets/img/img_dashboard_principal/calendario_blanco_icono.png"
                width={20}
                height={20}
                alt=""
              />
              Partidos Disponibles
            </button>

            <button
              className={`tab ${tab === "aceptados" ? "active" : ""}`}
              onClick={() => setTab("aceptados")}
            >
              <Image
                src="/assets/img/img_dashboard_principal/check2_blanco_icono.png"
                width={20}
                height={20}
                alt=""
              />
              Partidos Aceptados
            </button>
          </div>

          {/* ------------------ LISTADOS ------------------ */}
          {/*** DISPONIBLES ***/}
          {tab === "disponibles" && (
            <div className="available-wrap">
              <div className="section-title">
                <Image
                  src="/assets/img/img_dashboard_principal/calendario_verde_icono.png"
                  width={35}
                  height={35}
                  alt=""
                />
                Partidos Disponibles
              </div>

              {/* FILTROS */}
              <section className="panel filters">
                <h3 className="filters-title">
                  <Image
                    src="/assets/img/img_dashboard_principal/filtro_verde_icono.png"
                    width={25}
                    height={25}
                    alt=""
                  />
                  Filtrar Partidos
                </h3>

                <div className="filters-row">
                  <div className="search">
                    <input
                      type="text"
                      placeholder="Buscar por creador"
                      value={filterCreator}
                      onChange={(e) => setFilterCreator(e.target.value)}
                    />
                  </div>

                  <div className="select">
                    <select
                      value={filterSport}
                      onChange={(e) => setFilterSport(e.target.value)}
                    >
                      <option value="">Seleccionar deportes</option>
                      {Object.keys(SPORT_ICONS).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="select">
                    <select
                      value={filterDistrict}
                      onChange={(e) => setFilterDistrict(e.target.value)}
                    >
                      <option value="">Seleccionar distrito</option>
                      {[...new Set(partidos.map((p) => p.district))].map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="select">
                    <select
                      value={filterBet}
                      onChange={(e) => setFilterBet(e.target.value)}
                    >
                      <option value="">Apuesta</option>
                      <option value="si">Con apuesta</option>
                      <option value="no">Sin apuesta</option>
                    </select>
                  </div>

                  <div className="select">
                    <input
                      type="date"
                      className="input"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* TARJETAS */}
              <section className="cards">
                {filteredMatches.map((p, i) => {
                  const pct = Math.round(
                    (p.current_players / p.players_needed) * 100
                  );
                  const full = p.current_players >= p.players_needed;

                  return (
                    <article className="card" key={i}>
                      <header className="card-head">
                        <div className="left">
                          <Image
                            src={SPORT_ICONS[p.sport]}
                            width={24}
                            height={24}
                            alt=""
                            className="sport"
                          />
                          <span className="sport-name">{p.sport}</span>
                          {p.has_bet === 1 || p.has_bet === true ? (
                            <span className="chip">Apuesta</span>
                          ) : (
                            <span className="chip no-bet">Sin apuesta</span>
                          )}

                        </div>

                        <span
                          className={`estado ${full
                              ? "completo"
                              : p.joined
                                ? "bloqueada"
                                : "disponible"
                            }`}
                        >
                          {full ? "Completo" : p.joined ? "Bloqueada" : "Disponible"}
                        </span>
                      </header>

                      <div className="meta">
                        <span>
                          <Image
                            src="/assets/img/img_dashboard_principal/ubicacion_blanco_icono.png"
                            width={16}
                            height={16}
                            alt=""
                          />
                          {p.district}
                        </span>

                        <span>
                          <Image
                            src="/assets/img/img_dashboard_principal/calendario_blanco_icono.png"
                            width={16}
                            height={16}
                            alt=""
                          />
                          {formatDate(p.match_date)}
                        </span>

                        <span>
                          <Image
                            src="/assets/img/img_dashboard_principal/reloj_blanco_icono.png"
                            width={16}
                            height={16}
                            alt=""
                          />
                          {formatTime(p.match_time)}
                        </span>
                      </div>

                      <p className="desc">{p.description}</p>

                      <div className="creator">
                        <span className="avatar" style={{ overflow: "hidden" }}>
                          {p.creator_photo ? (
                            <Image
                              src={
                                p.creator_photo.startsWith("http")
                                  ? p.creator_photo
                                  : `${API_BASE}/${p.creator_photo.replace(
                                    /^\/+/,
                                    ""
                                  )}`
                              }
                              width={38}
                              height={38}
                              style={{
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                              alt=""
                              unoptimized
                            />
                          ) : (
                            p.creator_name.charAt(0).toUpperCase()
                          )}
                        </span>

                        <div>
                          <div className="name">{p.creator_name}</div>
                          <div className="muted">
                            {p.current_players} jugadores
                          </div>
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
                          <b className="cur">{p.current_players}</b>/
                          {p.players_needed} jugadores
                        </span>
                      </div>

                      <div className="progress">
                        <span
                          className="bar"
                          style={{ ["--pct" as any]: `${pct}%` }}
                        ></span>
                      </div>

                      <button
                        className="btn-unirse"
                        disabled={full || p.joined}
                        onClick={() => joinMatch(p.id)}
                      >
                        <Image
                          src="/assets/img/img_dashboard_principal/usuario_blanco_icono.png"
                          width={22}
                          height={22}
                          alt=""
                        />
                        {full ? "Completo" : "Unirse al Partido"}
                      </button>
                    </article>
                  );
                })}
              </section>
            </div>
          )}

          {/* ------------------ PARTIDOS ACEPTADOS ------------------ */}
          {tab === "aceptados" && (
            <div className="accepted-wrap">
              <div className="section-title">
                <Image
                  src="/assets/img/img_dashboard_principal/check3_verde_icono.png"
                  width={35}
                  height={35}
                  alt=""
                />
                Partidos Aceptados
              </div>

              <section className="accepted-list">
                {accepted.map((p) => (
                  <div className="accepted-item" key={p.id}>
                    <div className="left">
                      <Image
                        src="/assets/img/img_dashboard_principal/check3_verde_icono.png"
                        width={30}
                        height={30}
                        alt=""
                      />
                      <div className="info">
                        <div className="title">
                          {p.sport} - {p.district}
                        </div>
                        <div className="date">{formatDate(p.match_date)}</div>
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        className="mini"
                        onClick={() =>
                          (window.location.href = `/partido/${p.id}`)
                        }
                      >
                        Detalles
                      </button>

                      <button
                        className="mini"
                        onClick={async () => {
                          const res = await fetch(
                            `${API_BASE}/api/chat/room-by-match/${p.id}`,
                            {
                              credentials: "include",
                            }
                          );

                          if (res.ok) {
                            const data = await res.json();
                            window.location.href = `/mensajeria/${data.room_id}`;
                          } else {
                            alert("No se pudo abrir el chat.");
                          }
                        }}
                      >
                        Mensajes
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
