"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";
import { color } from "framer-motion";

export default function ProPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* =======================
        COMPRAR PRO
  =======================*/
  const comprarPro = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/payments/checkout`, {
        credentials: "include",
      });
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.log(err);
      alert("Error al iniciar el proceso de pago.");
    }
  };

  /* =======================
      CANCELAR SUSCRIPCIÓN
  =======================*/
  const cancelarPro = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/payments/cancel`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        alert("Tu suscripción será cancelada al finalizar el período actual.");
        window.location.reload();
      } else {
        alert("No se pudo cancelar la suscripción.");
      }
    } catch (err) {
      console.log(err);
      alert("Error en el proceso de cancelación.");
    }
  };

  if (loading) {
    return (
      <>
        <Topbar />
        <div className="text-center text-white mt-20">Cargando...</div>
      </>
    );
  }

  return (
    <>
      <Topbar />

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-20" style={{color:'#143e16ff'}}>

        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center font-squada">
          Mejora tu experiencia con{" "}
          <span className="text-[#25C50E]">VersusMe Pro</span>
        </h1>

        <p className="text-center text-gray-300 mt-3 text-lg">
          Más libertad. Más personalización. Más deporte.
        </p>

        {/* Comparación de planes */}
        <div className="grid md:grid-cols-2 gap-8 mt-14">

          {/* PLAN BÁSICO */}
          <div className="bg-[#1d1f22]/80 border border-white/10 rounded-2xl p-7 backdrop-blur-xl shadow-xl">
            <h2 className="text-2xl font-bold text-white">Plan Básico</h2>
            <p className="text-gray-300 mt-2 mb-6">
              El plan gratuito para empezar.
            </p>

            <ul className="space-y-3 text-gray-200">
              <li>• Crear <b>1 partido por semana</b></li>
              <li>• Unirte a <b>1 partido por semana</b></li>
              <li>• Subir solo <b>imágenes</b> como foto de perfil y portada</li>
              <li>• Funcionalidades estándar de la plataforma</li>
            </ul>
          </div>

          {/* PLAN PRO */}
          <div className="bg-gradient-to-br from-[#25C50E]/40 to-[#0e5720]/40 border border-green-500/40 rounded-2xl p-7 backdrop-blur-xl shadow-xl">
            <h2 className="text-2xl font-bold text-green-300">VersusMe Pro</h2>
            <p className="text-green-200 mt-2 mb-6">
              Todo sin límites. Tu juego al máximo nivel.
            </p>

            <ul className="space-y-3 text-green-100">
              <li>• Crear <b>partidos ilimitados</b></li>
              <li>• Unirte a <b>partidos ilimitados</b></li>
              <li>• Subir <b>fotos, videos, GIFs y animaciones</b></li>
              <li>• Distintivo exclusivo PRO</li>
              <li>• Prioridad en próximos features y mejoras</li>
            </ul>

            {/* Si NO es PRO → Botón de compra */}
            {!perfil?.is_pro && (
              <button
                onClick={comprarPro}
                className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-lg transition"
              >
                Hazme PRO - $5 / mes
              </button>
            )}

            {/* Si ES PRO → Botón de cancelación */}
            {perfil?.is_pro && (
              <>
                <p className="text-green-200 text-center mt-5 text-base">
                  Ya eres usuario PRO 🎉
                </p>

                <button
                  onClick={cancelarPro}
                  className="mt-5 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-lg transition"
                >
                  Cancelar suscripción
                </button>
              </>
            )}
          </div>

        </div>

      </div>
    </>
  );
}
