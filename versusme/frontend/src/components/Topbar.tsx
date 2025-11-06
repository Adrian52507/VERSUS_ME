"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/styles/styles_topbar.css";

export default function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

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

  const handleLogout = async () => {
    await fetch(`${API_BASE}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  };

  return (
    <header className="topbar">
      <div className="container">
        <div className="brand">VersusMe</div>

        <nav className="top-actions">
          <Link className="pill" href="/dashboard">
            <Image
              src="/assets/img/img_dashboard_principal/casa_negro_icono.png"
              alt=""
              width={16}
              height={16}
            />
            DASHBOARD
          </Link>

          <Link className="pill pill-solid" href="/crear_partido">
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
                    ? `${API_BASE}/${perfil.profile_picture.replace(/^\/+/, "")}`
                    : "/assets/img/img_perfil/default-user.jpg"
                }
                alt="Foto de perfil"
                width={50}
                height={50}
                style={{ objectFit: "cover", borderRadius: "50%" }}
                unoptimized
              />
            </div>

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

            {menuOpen && (
              <div
                className="profile-menu"
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
                      padding: "0.7em 20px",
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: 500,
                      borderBottom: "1px solid #5F676D",
                    }}
                  >
                    Perfil del jugador
                  </Link>

                  <Link
                    href="/mensajeria"
                    style={{
                      padding: "0.7em 20px",
                      color: "#fff",
                      textDecoration: "none",
                      fontWeight: 500,
                      borderBottom: "1px solid #5F676D",
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
                      padding: "0.7em 20px",
                      textAlign: "left",
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
  );
}
