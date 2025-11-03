"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/styles/styles_dashboard_principal.css";

export default function DashboardPage() {
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔹 Lógica original del dashboard (fetch del mensaje)
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

        const res = await fetch(`${API_BASE}/api/dashboard`, {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok) setMensaje(data.message);
        else setMensaje("No autorizado. Inicia sesión nuevamente.");
      } catch {
        setMensaje("Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // 🔹 Lógica de comportamiento (tarjetas, pestañas, etc.)
  useEffect(() => {
    const cards = document.querySelectorAll(".card");

    function setPct(bar: HTMLElement, pct: number) {
      bar.style.setProperty("--pct", Math.min(100, Math.max(0, pct)) + "%");
    }

    function updateCard(card: Element) {
      const curEl = card.querySelector(".cupos .cur");
      const maxEl = card.querySelector(".cupos .max");
      const bar = card.querySelector(".progress .bar") as HTMLElement;
      const estado = card.querySelector(".estado");
      const btn = card.querySelector(".btn-unirse") as HTMLButtonElement | null;

      if (!curEl || !maxEl || !bar || !btn) return;

      const cur = Number(curEl.textContent?.trim());
      const max = Number(maxEl.textContent?.trim());
      const pct = Math.round((cur / max) * 100);
      setPct(bar, pct);

      const full = cur >= max;
      if (estado) {
        estado.textContent = full ? "Completo" : "Disponible";
        estado.classList.toggle("completo", full);
        estado.classList.toggle("disponible", !full);
      }
      btn.disabled = full;
      btn.classList.toggle("outline", full);
    }

    cards.forEach((card) => {
      updateCard(card);

      const btn = card.querySelector(".btn-unirse");
      const curEl = card.querySelector(".cupos .cur");
      const maxEl = card.querySelector(".cupos .max");
      if (!btn || !curEl || !maxEl) return;

      btn.addEventListener("click", () => {
        const cur = Number(curEl.textContent?.trim());
        const max = Number(maxEl.textContent?.trim());
        if (cur < max) {
          curEl.textContent = String(cur + 1);
          updateCard(card);
        }
      });
    });

    const [tabDisp, tabAcpt] = document.querySelectorAll(".tab");
    const availableWrap = document.querySelector(".available-wrap");
    const acceptedWrap = document.querySelector(".accepted-wrap");

    function show(which: string) {
      if (which === "accepted") {
        acceptedWrap?.classList.remove("hidden");
        availableWrap?.classList.add("hidden");
        tabAcpt?.classList.add("active");
        tabDisp?.classList.remove("active");
      } else {
        availableWrap?.classList.remove("hidden");
        acceptedWrap?.classList.add("hidden");
        tabDisp?.classList.add("active");
        tabAcpt?.classList.remove("active");
      }
    }

    tabDisp?.addEventListener("click", () => show("available"));
    tabAcpt?.addEventListener("click", () => show("accepted"));
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
            <Link className="pill pill-solid" href="#">
              <Image
                src="/assets/img/img_dashboard_principal/casa_blanco_icono.png"
                alt=""
                width={16}
                height={16}
              />
              DASHBOARDS
            </Link>
            <Link className="pill" href="#">
              <Image
                src="/assets/img/img_dashboard_principal/suma_negro_icono.png"
                alt=""
                width={16}
                height={16}
              />
              CREAR PARTIDO
            </Link>
            <Link className="pill" href="#">
              <Image
                src="/assets/img/img_dashboard_principal/reloj_negro_icono.png"
                alt=""
                width={16}
                height={16}
              />
              HISTORIAL
            </Link>

            <div className="profile" style={{ position: "relative" }}>
              <span className="badge">A</span>

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
                <div
                  style={{
                    position: "absolute",
                    top: "60px",
                    right: 0,
                    background: "#2B2F2A",
                    border: "1px solid #5F676D",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    padding: "10px 20px",
                    zIndex: 10,
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* 🔹 Contenido principal */}
      <main
        className="page"
        dangerouslySetInnerHTML={{ __html: `
          <div class="container">
            <section class="panel kpis">
              <div class="head">
                <div>
                  <h2>¡Hola, Andy Morales!</h2>
                  <p class="sub">¿Listo para tu próximo partido?</p>
                </div>
              </div>

              <div class="kpi-grid">
                <div class="kpi">
                  <div class="num green">12</div>
                  <div class="label">Partidos jugados</div>
                </div>
                <div class="kpi">
                  <div class="num">3</div>
                  <div class="label">Partidos creados</div>
                </div>
                <div class="kpi">
                  <div class="num">4.8</div>
                  <div class="label">Calificación</div>
                </div>
              </div>

              <div class="actions-grid">
                <a class="tile" href="#">
                  <span class="tile-icon" style="--tile:#25C50E">
                    <img src="/assets/img/img_dashboard_principal/suma_icono.png" alt="">
                  </span>
                  <div class="tile-title">Crear Partido</div>
                  <div class="tile-desc">Organiza un nuevo partido deportivo</div>
                </a>

                <a class="tile" href="#">
                  <span class="tile-icon" style="--tile:#72D9EB">
                    <img src="/assets/img/img_dashboard_principal/reloj2_blanco_icono.png" alt="">
                  </span>
                  <div class="tile-title">Mi Historial</div>
                  <div class="tile-desc">Ver partidos anteriores</div>
                </a>

                <a class="tile" href="#">
                  <span class="tile-icon" style="--tile:#F7D41D">
                    <img src="/assets/img/img_dashboard_principal/calendario_blanco_icono.png" alt="">
                  </span>
                  <div class="tile-title">Partidos Hoy</div>
                  <div class="tile-desc">Encuentra partidos para hoy</div>
                </a>
              </div>
            </section>
          </div>
        ` }}
      />
    </div>
  );
}
