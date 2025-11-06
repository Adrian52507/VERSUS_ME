"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Topbar from "@/components/Topbar";
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
      <Topbar />

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
