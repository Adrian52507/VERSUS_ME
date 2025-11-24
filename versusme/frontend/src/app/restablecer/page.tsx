"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function RestablecerContent() {
  const [password, setPassword] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error");

      setMensaje("Contraseña actualizada correctamente ✔");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1800);
    } catch (err: any) {
      setMensaje(err.message || "Error al conectar con el servidor ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative min-h-screen grid place-items-center overflow-hidden text-white">

      {/* Fondo */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-60"
        style={{
          backgroundImage: "url('/assets/img/img_index/fondof2.png')",
        }}
      ></div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 -z-10 bg-black/80 backdrop-blur-sm"></div>

      {/* CARD */}
      <div className="w-[90%] max-w-[480px] bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-xl">

        {/* Marca */}
        <h1 className="text-4xl font-extrabold text-center mb-2">
          <span className="text-[#25C50E]">Versus</span>Me
        </h1>

        <h2 className="text-xl text-center font-semibold mb-4">
          Restablecer contraseña
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <label className="block text-sm font-semibold text-gray-200">
            Nueva contraseña
          </label>

          {/* Campo contraseña */}
          <div className="relative">
            <input
              type={mostrarPass ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="
                w-full h-12 bg-white/10 border border-white/20 
                rounded-lg px-4 text-white outline-none
                focus:border-[#25C50E] focus:shadow-[0_0_8px_#25C50E]
              "
            />

            <img
              src={
                mostrarPass
                  ? "/assets/img/img_login/cerrar_ojo.png"
                  : "/assets/img/img_login/ojo.png"
              }
              width={22}
              height={22}
              alt="Mostrar contraseña"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer opacity-90"
              onClick={() => setMostrarPass(!mostrarPass)}
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full h-11 rounded-lg font-bold bg-[#25C50E] text-black mt-4
              ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>

          {/* Mensaje */}
          {mensaje && (
            <p className="text-center text-sm mt-3 text-gray-200">{mensaje}</p>
          )}
        </form>

        {/* Volver */}
        <div className="text-center mt-6">
          <a
            href="/login"
            className="text-[#25C50E] underline font-semibold text-sm"
          >
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    </section>
  );
}

export default function RestablecerPage() {
  return (
    <Suspense
      fallback={
        <p className="text-gray-300 p-10 text-center">Cargando...</p>
      }
    >
      <RestablecerContent />
    </Suspense>
  );
}
