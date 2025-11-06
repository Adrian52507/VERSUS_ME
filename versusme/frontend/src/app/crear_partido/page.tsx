"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import Link from "next/link";
import Image from "next/image";
import "@/styles/styles_crear_partido.css";
import Topbar from "@/components/Topbar";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// 🔹 Import dinámico del mapa sin SSR
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

export default function CrearPartidoPage() {

  const DefaultIcon = L.icon({
    iconUrl: (typeof markerIcon === "string" ? markerIcon : markerIcon.src) as string,
    shadowUrl: (typeof markerShadow === "string" ? markerShadow : markerShadow.src) as string,
  });

  L.Marker.prototype.options.icon = DefaultIcon;
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({
    sport: "",
    district: "",
    locationText: "",
    lat: -12.0835,
    lng: -76.9699,
    date: "",
    time: "",
    players: "",
    hasBet: false,
    betAmount: "",
    desc: "",
  });

  // Inicializar mapa una sola vez
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("map").setView([-12.0835, -76.9699], 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // Manejar clics en el mapa
    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;

      // Colocar marcador visible
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker([lat, lng]).addTo(map);

      // 🔹 Obtener dirección textual (reverse geocoding)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      const data = await res.json();
      const displayName = data.display_name || "Ubicación seleccionada";

      setForm({ ...form, lat, lng, locationText: displayName });
    });
  }, [form]);

  // 🔹 Buscar al hacer clic en el botón 🔍
  const handleSearch = async () => {
    if (!form.locationText.trim()) return;
    const q = form.locationText.trim();
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      q
    )}&addressdetails=1&accept-language=es`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.length) {
      const { lat, lon, display_name } = data[0];
      mapRef.current.setView([lat, lon], 15);

      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);

      setForm({
        ...form,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        locationText: display_name,
      });
    }
  };

  // 🔹 Autocompletar mientras escribes
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (form.locationText.length < 3) {
        setSuggestions([]);
        return;
      }
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          form.locationText
        )}&addressdetails=1&accept-language=es`
      );
      const data = await res.json();
      setSuggestions(data);
    }, 500); // 🔸 medio segundo de debounce

    return () => clearTimeout(delay);
  }, [form.locationText]);

  // 🔹 Seleccionar sugerencia
  const handleSuggestionSelect = (s: any) => {
    const { lat, lon, display_name } = s;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);

    mapRef.current.setView([lat, lon], 15);
    setForm({
      ...form,
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      locationText: display_name,
    });
    setSuggestions([]);
  };
  // progreso dinámico
  useEffect(() => {
    const done = [
      form.sport,
      form.district,
      form.locationText,
      form.date,
      form.time,
      form.players,
      form.hasBet ? form.betAmount : "ok",
      form.desc,
    ].filter(Boolean).length;
    setProgress((done / 8) * 100);
  }, [form]);


  const handleSubmit = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    const res = await fetch(`${API_BASE}/api/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    if (res.ok) alert("✅ Partido creado con éxito");
    else alert("❌ Error al crear el partido");
  };

  return (
    <>
      <Topbar />   {/* 🔹 Aquí insertas el navbar */}
      <main className="p-6 text-white bg-[#141517] min-h-screen font-[Inter]">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Sección de introducción */}
          <section className="intro flex items-center gap-4 mt-8 mb-4 px-6">
            {/* Icono verde */}
            <div className="intro-icon w-14 h-14 rounded-md bg-[#25C50E] flex items-center justify-center">
              <Image
                src="/assets/img/img_dashboard_principal/suma_icono.png"
                alt="crear partido"
                width={30}
                height={30}
              />
            </div>

            {/* Texto de bienvenida */}
            <div className="intro-copy">
              <h1 className="text-2xl font-extrabold text-white">Crear Nuevo Partido</h1>
              <p className="text-gray-400 font-semibold text-base">
                Organiza un partido y conecta con otros jugadores en Lima
              </p>
            </div>
          </section>

          {/* Barra de progreso */}
          <div className="panel progress-panel border border-gray-700 rounded-lg p-4 bg-transparent shadow-md">
            <div className="flex justify-between text-sm font-semibold">
              <span>Progreso del formulario</span>
              <span>{Math.round(progress / 12.5)}/8 completado</span>
            </div>

            {/* Barra de llenado */}
            <div className="w-full h-2 bg-gray-600 rounded-full mt-2 relative">
              <div
                className="h-2 bg-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 🔹 Steps con 8 puntos */}
            <div className="grid grid-cols-8 text-center font-semibold text-sm mt-3">
              {[
                "Deporte",
                "Distrito",
                "Ubicación",
                "Fecha",
                "Hora",
                "Jugadores",
                "Apuesta",
                "Descripción",
              ].map((label, i) => {
                const statuses = [
                  !!form.sport,                            // Deporte
                  !!form.district,                         // Distrito
                  !!form.locationText,                     // Ubicación
                  !!form.date,                             // Fecha
                  !!form.time,                             // Hora
                  !!form.players,                          // Jugadores
                  form.hasBet ? !!form.betAmount : true,   // Apuesta
                  !!form.desc.trim(),                      // Descripción
                ];
                const done = statuses[i];
                return (
                  <div key={i} className="flex flex-col items-center">
                    <span
                      className={`w-5 h-5 rounded-full mb-1 ${done ? "bg-yellow-400" : "bg-gray-300"
                        }`}
                    ></span>
                    <span className="text-gray-200 text-xs md:text-sm">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>



          {/* Formulario */}
          <div className="grid md:grid-cols-2 gap-12 mt-6">
            {/* Izquierda */}
            <div>
              <label>Deporte</label>
              <select
                value={form.sport}
                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                className="w-full bg-transparent border border-gray-600 rounded p-2 mt-1"
              >
                <option value="">Elige un deporte...</option>
                <option>Fútbol</option>
                <option>Baloncesto</option>
                <option>Vóleibol</option>
                <option>Tenis</option>
                <option>Pádel</option>
              </select>

              <label className="block mt-4">Distrito</label>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full bg-transparent border border-gray-600 rounded p-2 mt-1"
              >
                <option value="">Selecciona un distrito...</option>
                <option>Miraflores</option>
                <option>San Isidro</option>
                <option>Barranco</option>
                <option>Surco</option>
                <option>La Molina</option>
                <option>San Borja</option>
              </select>

              {/* 📍 Ubicación */}
              <label className="block mt-4">Ubicación donde se realizará el partido</label>

              <div className="relative mb-3">
                <input
                  type="text"
                  value={form.locationText}
                  onChange={(e) => setForm({ ...form, locationText: e.target.value })}
                  placeholder="Busca una dirección o lugar"
                  className="w-full bg-transparent border border-gray-600 rounded p-2 pr-10"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400"
                >
                  🔍
                </button>

                {/* 🔹 Lista de sugerencias */}
                {suggestions.length > 0 && (
                  <ul className="absolute bg-[#2B2F2A] border border-gray-600 rounded mt-1 w-full z-50 max-h-52 overflow-auto">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => handleSuggestionSelect(s)}
                        className="p-2 hover:bg-green-600 cursor-pointer text-gray-200 text-sm"
                      >
                        {s.display_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <MapComponent />


              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-transparent border border-gray-600 rounded p-2"
                  />
                </div>
                <div>
                  <label>Hora</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full bg-transparent border border-gray-600 rounded p-2"
                  />
                </div>
              </div>
            </div>

            {/* Derecha */}
            <div>
              <label>Número de jugadores</label>
              <input
                type="number"
                min="2"
                value={form.players}
                onChange={(e) => setForm({ ...form, players: e.target.value })}
                className="w-full bg-transparent border border-gray-600 rounded p-2"
              />

              <label className="block mt-4">¿Incluir apuesta?</label>
              <div className="flex items-center gap-3 mt-2">
                {/* Botón Sí */}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, hasBet: true })}
                  className={`px-4 py-2 rounded border transition ${form.hasBet ? "bg-green-600 border-green-600" : "border-gray-600"
                    }`}
                >
                  Sí
                </button>

                {/* Botón No */}
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, hasBet: false, betAmount: "" })
                  }
                  className={`px-4 py-2 rounded border transition ${!form.hasBet ? "bg-green-600 border-green-600" : "border-gray-600"
                    }`}
                >
                  No
                </button>

                {/* Input del monto → ahora dentro del mismo flex */}
                {form.hasBet && (
                  <input
                    type="number"
                    placeholder="Monto Ej: 100"
                    value={form.betAmount}
                    onChange={(e) =>
                      setForm({ ...form, betAmount: e.target.value })
                    }
                    className="w-120 bg-transparent border border-gray-600 rounded p-2 ml-2"
                  />
                )}
              </div>


              <label className="block mt-4">Descripción</label>
              <textarea
                maxLength={500}
                rows={6}
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="Describe el partido: nivel, reglas, punto de encuentro..."
                className="w-full bg-transparent border border-gray-600 rounded p-2"
              ></textarea>
              <small className="text-gray-500">
                {500 - form.desc.length} caracteres restantes
              </small>

              <div className="mt-4 p-3 bg-[#2B2F2A] rounded-lg">
                <strong>Sugerencias:</strong>
                <ul className="list-disc list-inside text-sm text-gray-300 mt-1">
                  <li>Nivel de juego (principiante, intermedio, avanzado)</li>
                  <li>Equipamiento necesario</li>
                  <li>Reglas especiales</li>
                  <li>Punto de encuentro</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 gap-6">
            <Link
              href="/dashboard"
              className="flex-1 text-center border border-gray-600 rounded py-3 hover:bg-green-600 transition"
            >
              Volver al Dashboard
            </Link>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 rounded py-3 font-semibold hover:bg-green-700 transition"
            >
              Vista Previa / Crear Partido
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
