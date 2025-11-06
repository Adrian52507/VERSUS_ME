"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent() {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // ⛔ evita ejecución en SSR
    if (mapRef.current) return;

    const map = L.map("map").setView([-12.0835, -76.9699], 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
  }, []);

  return (
    <div id="map" style={{ height: "340px", borderRadius: "8px", border: "1px solid #555" }}></div>
  );
}
