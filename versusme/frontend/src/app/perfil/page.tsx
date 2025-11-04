"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import "@/styles/styles_perfil.css";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/profile`, { credentials: "include" });
      const data = await res.json();
      setPerfil(data);
      setLoading(false);
    };
    fetchPerfil();
  }, []);

  if (loading) return <p>Cargando perfil...</p>;
  if (!perfil) return <p>No se pudo cargar tu perfil.</p>;

  return (
    <div className="perfil-container">
      <div className="perfil-portada">
        <Image src={perfil.cover_photo || "/assets/default-cover.jpg"} alt="Portada" fill />
        <div className="perfil-foto">
          <Image src={perfil.profile_picture || "/assets/default-user.jpg"} alt="Perfil" width={100} height={100} />
        </div>
      </div>

      <div className="perfil-info">
        <h2>{perfil.name}</h2>
        <p>{perfil.description || "Sin descripción"}</p>
        <p><b>Correo:</b> {perfil.email}</p>
        <p><b>Distrito:</b> {perfil.district}</p>
        <p><b>Deporte favorito:</b> {perfil.favorite_sport}</p>
        <p><b>Nivel:</b> {perfil.level}</p>
      </div>

      <div className="perfil-insignias">
        <h3>Insignias del jugador</h3>
        <div className="insignias-grid">
          <Image src="/assets/icons/insignia_creacion.png" alt="Creación de cuenta" width={60} height={60} />
        </div>
      </div>
    </div>
  );
}
