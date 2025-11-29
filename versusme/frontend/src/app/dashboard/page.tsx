"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Topbar from "@/components/Topbar";

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
  return `${h12}:${m} ${suf}`;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export default function DashboardPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const [loading, setLoading] = useState(true);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [usuario, setUsuario] = useState("Usuario");
  const [stats, setStats] = useState({ played: 0, created: 0, rating: 0 });
  const [tab, setTab] = useState<"disponibles" | "aceptados">("disponibles");

  const [filters, setFilters] = useState({
    creator: "",
    sport: "",
    district: "",
    bet: "",
    date: "",
  });

  useEffect(() => {
    console.log("🔥 useEffect ejecutado → cargando dashboard...");
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);

      const [profileRes, matchesRes, acceptedRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/profile`, { credentials: "include" }),
        fetch(`${API_BASE}/api/matches/all`, { credentials: "include" }),
        fetch(`${API_BASE}/api/matches/accepted`, { credentials: "include" }),
        fetch(`${API_BASE}/api/user/stats`, { credentials: "include" }),
      ]);

      const profile = await safeJson(profileRes);
      const all = await safeJson(matchesRes);
      const accepted = await safeJson(acceptedRes);
      const statsData = await safeJson(statsRes);

      /* 👇 AGREGAR ESTO PARA DEBUG */
      console.log(">>> PROFILE:", profile);
      console.log(">>> ALL MATCHES:", all);
      console.log(">>> ACCEPTED MATCHES:", accepted);
      console.log(">>> USER STATS:", statsData);
      console.log(">>> FILTERS STATE:", filters);

      // Blindaje total
      const allList = Array.isArray(all) ? all : [];
      const acceptedList = Array.isArray(accepted) ? accepted : [];

      // Crear set para búsqueda rápida
      const acceptedIds = new Set(acceptedList.map((p: any) => p.id));

      setUsuario(profile.name || "Usuario");
      setStats(statsData || { played: 0, created: 0, rating: 0 });

      setPartidos(
        allList.map((p: any) => ({
          ...p,
          joined: acceptedIds.has(p.id),
        }))
      );
    } catch (e) {
      console.error("dashboard error", e);
    } finally {
      setLoading(false);
    }
  }


  async function joinMatch(id: number) {
    try {
      const res = await fetch(`${API_BASE}/api/matches/join/${id}`, {
        method: "POST",
        credentials: "include",
      });

      // SI OK → recargar dashboard
      if (res.ok) {
        await fetchDashboard();
        setTab("aceptados");
        return;
      }

      // SI FALLA, PERO SIN ROMPER
      let text = await res.text();
      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      let message = "❌ No se pudo unir al partido.";
      let nextAvailable = data?.nextAvailable;

      if (data?.error?.includes("1 partido por semana")) {
        if (nextAvailable) {
          const fecha = new Date(nextAvailable);
          const formato = fecha.toLocaleDateString("es-PE", {
            weekday: "long",
            month: "long",
            day: "numeric",
          });

          message = `❌ Límite semanal del Plan Básico alcanzado.\n📅 Podrás unirte nuevamente el: ${formato}`;
        } else {
          message =
            "❌ Solo puedes unirte a 1 partido por semana con el Plan Básico.";
        }
      }

      // TOAST
      const toast = document.createElement("div");
      toast.innerText = message;
      toast.style.position = "fixed";
      toast.style.bottom = "30px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.background = "#222";
      toast.style.color = "#fff";
      toast.style.padding = "14px 22px";
      toast.style.borderRadius = "12px";
      toast.style.fontWeight = "600";
      toast.style.fontSize = "15px";
      toast.style.whiteSpace = "pre-line";
      toast.style.border = "1px solid rgba(255,255,255,.12)";
      toast.style.boxShadow = "0 4px 14px rgba(0,0,0,0.3)";
      toast.style.zIndex = "9999";
      toast.style.opacity = "0";
      toast.style.transition = "opacity .3s ease";

      document.body.appendChild(toast);
      setTimeout(() => (toast.style.opacity = "1"), 50);
      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
      }, 3000);

      // ❗ Importante: NO cargar dashboard aquí
      return;

    } catch (err) {
      console.error("join error:", err);

      // Prevenir loading infinito
      await fetchDashboard();
    }
  }

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-300">
        <div className="w-14 h-14 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
        <p className="text-lg mt-4">Cargando...</p>
      </div>
    );

  const filtered = partidos.filter((p) => {
    const c = filters.creator ? p.creator_name.toLowerCase().includes(filters.creator.toLowerCase()) : true;
    const s = filters.sport ? p.sport === filters.sport : true;
    const d = filters.district ? p.district === filters.district : true;
    const b =
      filters.bet === "si"
        ? p.has_bet === 1
        : filters.bet === "no"
          ? p.has_bet === 0
          : true;
    const da = filters.date
      ? p.match_date.slice(0, 10) === filters.date
      : true;


    return c && s && d && b && da;
  });

  const acceptedMatches = filtered.filter((p) => p.joined);

  return (
    <div className="min-h-screen bg-[#141517] text-white">
      <Topbar />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* ========================== KPIs ============================ */}
        <section className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold">¡Hola, {usuario}!</h2>
          <p className="text-gray-400 font-semibold mt-1">
            ¿Listo para tu próximo partido?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            {/* KPI */}
            <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-5xl font-extrabold text-green-600">{stats.played}</div>
              <div className="text-gray-300 mt-1">Partidos unidos</div>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-5xl font-extrabold">{stats.created}</div>
              <div className="text-gray-300 mt-1">Partidos creados</div>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-5xl font-extrabold">{stats.rating}</div>
              <div className="text-gray-300 mt-1">Calificación</div>
            </div>
          </div>
        </section>

        {/* ========================== TABS ============================ */}
        <div className="flex mt-10 backdrop-blur-xl bg-white/10 border border-white/10 rounded-xl overflow-hidden text-lg font-semibold">
          <button
            onClick={() => setTab("disponibles")}
            className={`flex-1 py-3 transition ${tab === "disponibles" ? "bg-green-600 text-black" : "text-white"
              }`}
          >
            Partidos Disponibles
          </button>

          <button
            onClick={() => setTab("aceptados")}
            className={`flex-1 py-3 transition ${tab === "aceptados" ? "bg-green-600 text-black" : "text-white"
              }`}
          >
            Aceptados
          </button>
        </div>

        {/* ========================== FILTROS ============================ */}
        {tab === "disponibles" && (
          <section className="mt-10 backdrop-blur-xl bg-white/10 border border-white/10 p-6 rounded-2xl shadow-xl">
            <h3 className="text-2xl font-bold mb-5 flex items-center gap-3">
              <Image
                src="/assets/img/img_dashboard_principal/filtro_verde_icono.png"
                width={28}
                height={28}
                alt=""
              />
              Filtrar partidos
            </h3>

            <div className="grid md:grid-cols-5 gap-4">
              <input
                placeholder="Buscar creador"
                value={filters.creator}
                onChange={(e) => setFilters({ ...filters, creator: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none"
              />

              <select
                value={filters.sport}
                onChange={(e) => setFilters({ ...filters, sport: e.target.value })}
                className="
                bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none
                appearance-none pr-10
                bg-[url('/chevron-down.svg')] bg-no-repeat 
                bg-[position:calc(100%-12px)_center]
              "

              >
                <option value="">Deporte</option>
                {Object.keys(SPORT_ICONS).map((s) => (
                  <option className="bg-gray-600/50" key={s}>{s}</option>
                ))}
              </select>

              <select
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                className="
                bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none
                appearance-none pr-10
                bg-[url('/chevron-down.svg')] bg-no-repeat 
                bg-[position:calc(100%-12px)_center]
              "

              >
                <option value="">Distrito</option>
                {[...new Set(partidos.map((p) => p.district))].map((d) => (
                  <option className="bg-gray-600/50" key={d}>{d}</option>
                ))}
              </select>

              <select
                value={filters.bet}
                onChange={(e) => setFilters({ ...filters, bet: e.target.value })}
                className="
                  bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none
                  appearance-none pr-10
                  bg-[url('/chevron-down.svg')] bg-no-repeat 
                  bg-[position:calc(100%-12px)_center]
                "
              >
                <option className="bg-gray-600/50" value="">Apuesta</option>
                <option className="bg-gray-600/50" value="si">Con apuesta</option>
                <option className="bg-gray-600/50" value="no">Sin apuesta</option>
              </select>

              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none"
              />
            </div>
          </section>
        )}

        {/* ====================== LISTADOS ========================== */}
        {/* ----------- DISPONIBLES (tarjetas) ----------- */}
        {tab === "disponibles" && (
          <section className="mt-10 grid md:grid-cols-3 gap-8">

            {filtered.map((p) => {
              const pct = Math.round((p.current_players / p.players_needed) * 100);
              const full = pct >= 100;

              return (
                <article
                  key={p.id}
                  className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                >
                  {/* HEADER */}
                  <div className="flex items-center justify-between bg-white/10 px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <Image src={SPORT_ICONS[p.sport]} width={24} height={24} alt="" />
                      <span className="font-semibold">{p.sport}</span>

                      {p.has_bet ? (
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-300 border border-yellow-300 px-2 py-1 rounded-full text-xs">
                            Apuesta
                          </span>
                          <span className="text-yellow-300 font-bold text-xs">
                            S/ {p.bet_amount}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 border border-gray-300 px-2 py-1 rounded-full text-xs">
                          Sin apuesta
                        </span>
                      )}

                    </div>

                    <span className={`font-bold ${full ? "text-yellow-300" : p.joined ? "text-red-400" : "text-green-400"
                      }`}>
                      {full ? "Completo" : p.joined ? "Unido" : "Disponible"}
                    </span>
                  </div>

                  {/* META */}
                  <div className="px-5 py-3 text-sm font-semibold space-y-1 text-gray-200">
                    <div className="flex items-center gap-2">
                      <Image src="/assets/img/img_dashboard_principal/ubicacion_blanco_icono.png" width={16} height={16} alt="" />
                      {p.district}
                    </div>

                    <div className="flex items-center gap-2">
                      <Image src="/assets/img/img_dashboard_principal/calendario_blanco_icono.png" width={16} height={16} alt="" />
                      {formatDate(p.match_date)}
                    </div>

                    <div className="flex items-center gap-2">
                      <Image src="/assets/img/img_dashboard_principal/reloj_blanco_icono.png" width={16} height={16} alt="" />
                      {formatTime(p.match_time)}
                    </div>
                  </div>

                  {/* DESCRIPCIÓN */}
                  <p className="px-5 text-sm text-gray-300">{p.description}</p>
                  {/* CREATOR */}
                  <div className="px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                      <Image
                        src={
                          p.creator_photo
                            ? p.creator_photo.startsWith("http")
                              ? p.creator_photo
                              : `${API_BASE}/${p.creator_photo.replace(/^\/+/, "")}`
                            : "/assets/img/img_perfil/default-user.jpg"
                        }
                        alt="Creador"
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold">{p.creator_name}</span>
                      <span className="text-sm text-gray-400">
                        {p.current_players} jugadores
                      </span>
                    </div>
                  </div>

                  {/* PROGRESO */}
                  <div className="px-5 mt-4 text-sm font-semibold flex items-center gap-2">
                    <Image src="/assets/img/img_dashboard_principal/jugadores_gris_icono.png" width={18} height={18} alt="" />
                    <span>{p.current_players}/{p.players_needed} jugadores</span>
                  </div>

                  <div className="px-5 pb-4">
                    <div className="w-full h-3 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <div className="h-full bg-yellow-300 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* BUTTON */}
                  {!p.joined && !full && (
                    <div className="flex justify-center mb-5">
                      <button
                        onClick={() => joinMatch(p.id)}
                        className="w-full max-w-[85%] py-3 bg-green-500 hover:bg-green-600 transition rounded-xl text-black font-semibold"
                      >
                        Unirse al Partido
                      </button>
                    </div>
                  )}

                  {(p.joined || full) && (
                    <div className="flex justify-center mb-5">
                      <button
                        disabled
                        className="w-full max-w-[85%] py-3 bg-gray-600/50 rounded-xl text-gray-400 font-semibold"
                      >
                        {full ? "Completo" : "Ya unido"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {/* ----------- ACEPTADOS (lista con botones) ----------- */}
        {tab === "aceptados" && (
          <section className="mt-10 space-y-5">

            {acceptedMatches.map((p) => (
              <div
                key={p.id}
                className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-xl shadow-lg p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={SPORT_ICONS[p.sport]}
                    width={32}
                    height={32}
                    alt=""
                    className="opacity-90"
                  />

                  <div>
                    <h3 className="text-lg font-bold">
                      {p.sport} – {p.district}
                    </h3>
                    <p className="text-gray-400 text-sm">{formatDate(p.match_date)}</p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => (window.location.href = `/partido/${p.id}`)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg"
                  >
                    Detalles
                  </button>

                  <button
                    onClick={async () => {
                      const res = await fetch(`${API_BASE}/api/chat/room-by-match/${p.id}`, {
                        credentials: "include",
                      });

                      const data = await res.json();
                      window.location.href = `/mensajeria/${data.room_id}`;
                    }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg"
                  >
                    Mensajes
                  </button>
                </div>
              </div>
            ))}

          </section>
        )}

      </main>
    </div>
  );
}
