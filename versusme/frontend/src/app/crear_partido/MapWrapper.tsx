"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export default function MapWrapper({ form, setForm }: any) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Inicializar el mapa
  useEffect(() => {
    if (typeof window === "undefined") return; // ⚠️ evita SSR
    if (mapRef.current) return;

    const map = L.map("map").setView([-12.0835, -76.9699], 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    const DefaultIcon = L.icon({
      iconUrl: (typeof markerIcon === "string" ? markerIcon : markerIcon.src) as string,
      shadowUrl: (typeof markerShadow === "string" ? markerShadow : markerShadow.src) as string,
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker([lat, lng]).addTo(map);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      const data = await res.json();
      const displayName = data.display_name || "Ubicación seleccionada";

      setForm({ ...form, lat, lng, locationText: displayName });
    });
  }, [form, setForm]);

  // 🔹 Buscar dirección manualmente
  const handleSearch = async () => {
    if (!form.locationText.trim() || !mapRef.current) return;
    const q = form.locationText.trim();
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}&addressdetails=1&accept-language=es`
    );
    const data = await res.json();
    if (data.length) {
      const { lat, lon, display_name } = data[0];
      mapRef.current.setView([lat, lon], 15);
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);
      setForm({ ...form, lat: parseFloat(lat), lng: parseFloat(lon), locationText: display_name });
    }
  };

  // 🔹 Autocompletar direcciones
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (form.locationText.length < 3) {
        setSuggestions([]);
        return;
      }
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(form.locationText)}&addressdetails=1&accept-language=es`
      );
      const data = await res.json();
      setSuggestions(data);
    }, 500);
    return () => clearTimeout(delay);
  }, [form.locationText]);

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

  return (
    <div className="relative">
      <div className="relative mb-3">
        <label className="block mt-4">Ubicación donde se realizará el partido</label>
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
          className="absolute right-2 top-1/2 -translate-y-1 text-green-400 cursor-pointer hover:scale-110 transition-transform"
        >
          🔍
        </button>

        {/* Lista de sugerencias */}
        {suggestions.length > 0 && (
          <ul className="absolute bg-[#2B2F2A] border border-gray-600 rounded mt-1 w-full z-[10000] max-h-52 overflow-auto">
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

      <div id="map" className="w-full h-[340px] rounded-lg border border-gray-600 mt-2"></div>
    </div>
  );
}
