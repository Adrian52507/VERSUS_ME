"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import Link from "next/link";
import "@/styles/styles_crear_partido.css";

export default function CrearPartidoPage() {
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

  // inicializar mapa
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("map").setView([form.lat, form.lng], 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    map.on("click", (e: any) => {
      setForm({ ...form, lat: e.latlng.lat, lng: e.latlng.lng });
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker(e.latlng).addTo(map);
    });
  }, []);

  // búsqueda por texto
  const handleSearch = async () => {
    if (!form.locationText.trim()) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      form.locationText
    )}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.length) {
      const { lat, lon, display_name } = data[0];
      mapRef.current.setView([lat, lon], 15);
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker([lat, lon])
        .addTo(mapRef.current)
        .bindPopup(display_name)
        .openPopup();
      setForm({
        ...form,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        locationText: display_name,
      });
    } else alert("No se encontró esa ubicación");
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
      form.desc,
      form.hasBet ? form.betAmount : "ok",
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
    <main className="p-6 text-white bg-[#141517] min-h-screen font-[Inter]">
      <div className="max-w-6xl mx-auto space-y-8">
        <section>
          <h1 className="text-3xl font-bold mb-1">Crear Nuevo Partido</h1>
          <p className="text-gray-400">
            Organiza un partido y conecta con otros jugadores en Lima
          </p>
        </section>

        {/* Barra de progreso */}
        <div>
          <div className="flex justify-between text-sm font-semibold">
            <span>Progreso del formulario</span>
            <span>{Math.round(progress / 12.5)}/8 completado</span>
          </div>
          <div className="w-full h-2 bg-gray-600 rounded-full mt-2">
            <div
              className="h-2 bg-yellow-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
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

            <label className="block mt-4">Ubicación</label>
            <div className="relative mb-3">
              <input
                value={form.locationText}
                onChange={(e) =>
                  setForm({ ...form, locationText: e.target.value })
                }
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
            </div>
            <div id="map" className="h-[340px] rounded-lg border border-gray-600"></div>

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
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setForm({ ...form, hasBet: true })}
                className={`px-4 py-2 rounded border ${
                  form.hasBet ? "bg-green-600" : "border-gray-600"
                }`}
              >
                Sí
              </button>
              <button
                onClick={() =>
                  setForm({ ...form, hasBet: false, betAmount: "" })
                }
                className={`px-4 py-2 rounded border ${
                  !form.hasBet ? "bg-green-600" : "border-gray-600"
                }`}
              >
                No
              </button>
            </div>

            {form.hasBet && (
              <input
                type="number"
                placeholder="Monto Ej: 100"
                value={form.betAmount}
                onChange={(e) =>
                  setForm({ ...form, betAmount: e.target.value })
                }
                className="w-full bg-transparent border border-gray-600 rounded p-2 mt-2"
              />
            )}

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
  );
}
