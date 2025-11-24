"use client";

import { useState } from "react";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

      const res = await fetch(`${API_BASE}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      setMensaje(
        data.message ||
          "Si el correo existe, se enviará un enlace de recuperación ✔"
      );
    } catch {
      setMensaje("Error al conectar con el servidor ❌");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative min-h-screen grid place-items-center overflow-hidden text-white">

      {/* Fondo image */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-60"
        style={{
          backgroundImage: "url('/assets/img/img_index/fondof2.png')",
        }}
      ></div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 -z-10 bg-black/80 backdrop-blur-sm"></div>

      {/* CARD — idéntica al login */}
      <div className="w-[90%] max-w-[480px] bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-xl">

        {/* Marca */}
        <h1 className="text-4xl font-extrabold text-center mb-2">
          <span className="text-[#25C50E]">Versus</span>Me
        </h1>

        <h2 className="text-xl text-center font-semibold mb-4">
          Recuperar contraseña
        </h2>

        <p className="text-center text-gray-300 mb-6">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <label className="block text-sm font-semibold text-gray-200">
            Correo electrónico
          </label>

          <input
            type="email"
            required
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full h-12 bg-white/10 border border-white/20 
              rounded-lg px-4 text-white outline-none
              focus:border-[#25C50E] focus:shadow-[0_0_8px_#25C50E]
            "
          />

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full h-11 rounded-lg font-bold bg-[#25C50E] text-black mt-4
              ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>

          {mensaje && (
            <p className="text-center text-sm mt-3 text-gray-200">
              {mensaje}
            </p>
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
