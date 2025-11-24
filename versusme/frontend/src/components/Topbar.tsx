"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

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
      } catch (_) { }
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

  const goToMensajeria = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/rooms`, {
        credentials: "include",
      });

      const rooms = await res.json();
      const room = rooms?.[0];

      window.location.href = room
        ? `/mensajeria/${room.room_id}`
        : "/mensajeria";
    } catch {
      window.location.href = "/mensajeria";
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="backdrop-blur-md bg-[#1a1c1f]/70 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <Link href="/">
            <h1 className="text-4xl font-bold tracking-wide text-white font-squada">
              Versus<span className="text-[#25C50E]">Me</span>
            </h1>
          </Link>

          {/* === DESKTOP NAV === */}
          <nav className="hidden md:flex items-center gap-4">

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-black bg-white/90 hover:bg-green-600 font-semibold text-sm transition"
            >
              Dashboard
            </Link>

            <Link
              href="/crear_partido"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-black bg-white/90 hover:bg-green-600 font-semibold text-sm transition"
            >
              Crear Partido
            </Link>

            <Link
              href="/IA"
              className="flex items-center gap-2 px-4 py-2 rounded-md text-black bg-white/90 hover:bg-green-600 font-semibold text-sm transition"
            >
              IA
            </Link>

            {/* PROFILE DROPDOWN */}
            <div className="relative flex items-center gap-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/20 shadow-md">
                <Image
                  src={
                    perfil?.profile_picture
                      ? perfil.profile_picture.startsWith("http")
                        ? perfil.profile_picture
                        : `${API_BASE}/${perfil.profile_picture.replace(/^\/+/, "")}`
                      : "/assets/img/img_perfil/default-user.jpg"
                  }
                  width={48}
                  height={48}
                  alt="pf"
                  className="object-cover"
                  unoptimized
                />
              </div>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-md hover:bg-white/10 transition"
              >
                <Image
                  src="/assets/img/img_dashboard_principal/menor_que_gris_icono.png"
                  width={18}
                  height={18}
                  alt=""
                  className={`transition ${menuOpen ? "rotate-180" : "rotate-0"}`}
                />
              </button>

              {menuOpen && (
                <div className="
                  absolute top-14 right-0 w-52 rounded-lg shadow-xl
                  bg-[#2B2F2A]/90 backdrop-blur-xl border border-white/10
                  overflow-hidden animate-fadeIn
                ">
                  <nav className="flex flex-col text-sm font-medium">
                    <Link href="/perfil" className="px-5 py-3 text-white hover:bg-white/10">
                      Perfil del jugador
                    </Link>

                    <button
                      onClick={goToMensajeria}
                      className="text-left px-5 py-3 text-white hover:bg-white/10 border-t border-white/10"
                    >
                      Mensajería
                    </button>

                    <button
                      onClick={handleLogout}
                      className="text-left px-5 py-3 text-red-400 hover:bg-white/10 border-t border-white/10"
                    >
                      Cerrar sesión
                    </button>
                  </nav>
                </div>
              )}
            </div>

          </nav>

          {/* === MOBILE TOPBAR (FOTO + MENÚ) === */}
          <div className="md:hidden flex items-center gap-4">

            {/* Foto de perfil SIEMPRE visible */}
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-md">
              <Image
                src={
                  perfil?.profile_picture
                    ? perfil.profile_picture.startsWith("http")
                      ? perfil.profile_picture
                      : `${API_BASE}/${perfil.profile_picture.replace(/^\/+/, "")}`
                    : "/assets/img/img_perfil/default-user.jpg"
                }
                width={40}
                height={40}
                alt="pf"
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Botón menú móvil */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-white/10 transition"
              onClick={() => setMobileOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-7 h-7"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* === MOBILE MENU === */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50">

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel */}
          <div
            className="
              absolute right-0 top-0 h-full w-72
              bg-[#1e1f22]/95 backdrop-blur-xl
              border-l border-white/10 shadow-2xl
              p-6 flex flex-col gap-5
              animate-slide-in
            "
          >

            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 bg-white/20 text-white rounded-lg text-lg font-semibold hover:bg-white/30 hover:text-green-300 transition"
            >
              Dashboard
            </Link>
            
            <Link
              href="/perfil"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 bg-white/20 text-white rounded-lg text-lg font-semibold hover:bg-white/30 hover:text-green-300 transition"
            >
              Perfil del jugador
            </Link>

            <Link
              href="/crear_partido"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 bg-white/20 text-white rounded-lg text-lg font-semibold hover:bg-white/30 hover:text-green-300 transition"
            >
              Crear Partido
            </Link>

            <Link
              href="/IA"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 bg-white/20 text-white rounded-lg text-lg font-semibold hover:bg-white/30 hover:text-green-300 transition"
            >
              IA
            </Link>

            <button
              onClick={() => {
                goToMensajeria();
                setMobileOpen(false);
              }}
              className="text-left px-4 py-3 bg-white/20 text-white rounded-lg text-lg font-semibold hover:bg-white/30 hover:text-green-300 transition"
            >
              Mensajería
            </button>

            <button
              onClick={handleLogout}
              className="text-left px-4 py-3 bg-red-500/20 text-red-300 rounded-lg text-lg font-semibold hover:bg-red-500/30 hover:text-red-200 transition"
            >
              Cerrar sesión
            </button>

          </div>
        </div>
      )}
    </>
  );
}
