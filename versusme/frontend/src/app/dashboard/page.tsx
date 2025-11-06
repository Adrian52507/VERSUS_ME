"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/styles/styles_dashboard_principal.css";

export default function DashboardPage() {
  const [usuario, setUsuario] = useState("Usuario");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);


  // 🔹 Fetch del dashboard y perfil
  useEffect(() => {
    // 💡 Define la variable fuera de las funciones internas
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

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

    // 👇 Agrega el fetch del perfil
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

    fetchDashboard();
    fetchProfile(); // <- Llamada al perfil
  }, []);


  const handleLogout = async () => {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    await fetch(`${API_BASE}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: "4rem" }}>Cargando...</p>;

  return (
    <div>
      <header className="topbar">
        <div className="container">
          <div className="brand">VersusMe</div>

          <nav className="top-actions">
            <Link className="pill" href="#">
              <Image
                src="/assets/img/img_dashboard_principal/casa_negro_icono.png"
                alt=""
                width={16}
                height={16}
              />
              DASHBOARDS
            </Link>

            <Link className="pill" href="/crear_partido">
              <Image
                src="/assets/img/img_dashboard_principal/suma_negro_icono.png"
                alt=""
                width={16}
                height={16}
              />
              CREAR PARTIDO
            </Link>

            <Link className="pill" href="/historial">
              <Image
                src="/assets/img/img_dashboard_principal/reloj_negro_icono.png"
                alt=""
                width={16}
                height={16}
              />
              HISTORIAL
            </Link>

            <div className="profile" style={{ position: "relative" }}>
              <div
                className="badge"
                style={{
                  overflow: "hidden",
                  padding: 0,
                  background: "none",
                  border: "2px solid #5F676D",
                }}
              >
                <Image
                  src={
                    perfil?.profile_picture
                      ? `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/${perfil.profile_picture.replace(/^\/+/, "")}`
                      : "/assets/img/img_perfil/default-user.jpg"
                  }
                  alt="Foto de perfil"
                  width={50}
                  height={50}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                  unoptimized
                />
              </div>

              {/* 🔽 Flecha interactiva */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <Image
                  src="/assets/img/img_dashboard_principal/menor_que_gris_icono.png"
                  alt="toggle menu"
                  width={18}
                  height={18}
                />
              </button>

              {/* 🔹 Menú desplegable */}
              {menuOpen && (
                <div className="profile-menu"
                  style={{
                    position: "absolute",
                    top: "60px",
                    right: 0,
                    background: "#2B2F2A",
                    border: "1px solid #5F676D",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    zIndex: 10,
                    minWidth: "180px",
                  }}
                >
                  <nav style={{ display: "flex", flexDirection: "column" }}>
                    <Link
                      href="/perfil"
                      style={{
                        padding: "0.7em 20px 0.7em 20px",
                        color: "#fff",
                        textDecoration: "none",
                        fontWeight: 500,
                        borderBottom: "1px solid #5F676D",
                        transition: "background 0.2s ease",
                      }}
                    >
                      Perfil del jugador
                    </Link>

                    <Link
                      href="/mensajeria"
                      style={{
                        padding: "0.7em 20px 0.7em 20px",
                        color: "#fff",
                        textDecoration: "none",
                        fontWeight: 500,
                        borderBottom: "1px solid #5F676D",
                        transition: "background 0.2s ease",
                      }}
                    >
                      Mensajería
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{
                        border: "none",
                        color: "#ff6b6b",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: "0.7em 20px 0.7em 20px",
                        textAlign: "left",
                        transition: "background 0.2s ease",
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </nav>
                </div>
              )}

            </div>
          </nav>
        </div>
      </header>

      {/* 🔹 Contenido principal en JSX real */}
      <main className="page">
        <div className="container">
          <section className="panel kpis">
            <div className="head">
              <div>
                <h2>¡Hola, {usuario}!</h2>
                <p className="sub">¿Listo para tu próximo partido?</p>
              </div>
            </div>

            <div className="kpi-grid">
              <div className="kpi">
                <div className="num green">12</div>
                <div className="label">Partidos jugados</div>
              </div>
              <div className="kpi">
                <div className="num">3</div>
                <div className="label">Partidos creados</div>
              </div>
              <div className="kpi">
                <div className="num">4.8</div>
                <div className="label">Calificación</div>
              </div>
            </div>

            <div className="actions-grid">
              <Link className="tile" href="#">
                <span className="tile-icon" style={{ "--tile": "#25C50E" } as any}>
                  <Image
                    src="/assets/img/img_dashboard_principal/suma_icono.png"
                    alt=""
                    width={20}
                    height={20}
                  />
                </span>
                <div className="tile-title">Crear Partido</div>
                <div className="tile-desc">Organiza un nuevo partido deportivo</div>
              </Link>

              <Link className="tile" href="#">
                <span className="tile-icon" style={{ "--tile": "#72D9EB" } as any}>
                  <Image
                    src="/assets/img/img_dashboard_principal/reloj2_blanco_icono.png"
                    alt=""
                    width={20}
                    height={20}
                  />
                </span>
                <div className="tile-title">Mi Historial</div>
                <div className="tile-desc">Ver partidos anteriores</div>
              </Link>

              <Link className="tile" href="#">
                <span className="tile-icon" style={{ "--tile": "#F7D41D" } as any}>
                  <Image
                    src="/assets/img/img_dashboard_principal/calendario_blanco_icono.png"
                    alt=""
                    width={20}
                    height={20}
                  />
                </span>
                <div className="tile-title">Partidos Hoy</div>
                <div className="tile-desc">Encuentra partidos para hoy</div>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
