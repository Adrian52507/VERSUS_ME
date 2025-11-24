"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al iniciar sesión");

      setSuccess("Inicio de sesión exitoso ✅");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (err: any) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-black flex items-center justify-center px-6">

      {/* Fondo */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/img/img_index/fondof2.png')" }}
      ></div>

      {/* Tarjeta login */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-10">

        {/* Marca */}
        <h1 className="text-center text-4xl font-bold text-[#25C50E]">
          <Link href="/">
            <span className="text-white">Versus</span>Me
          </Link>
        </h1>

        {/* Título */}
        <h2 className="text-center text-white text-2xl font-semibold mt-6">
          Inicia Sesión
        </h2>

        <p className="text-center text-gray-400 text-sm mt-2">
          Sigue descubriendo retos deportivos en Lima
        </p>

        {/* Alternativa */}
        <p className="text-center text-gray-300 text-sm mt-4">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-[#25C50E] hover:underline">
            Regístrate
          </Link>
        </p>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">

          {/* Email */}
          <div>
            <label className="block text-white font-medium mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/20 text-white rounded-lg px-4 py-3 outline-none focus:border-[#25C50E]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white font-medium mb-1">Contraseña</label>

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/20 text-white rounded-lg px-4 py-2 outline-none focus:border-[#25C50E]"
                required
              />

              <Image
                src={
                  showPass
                    ? "/assets/img/img_login/cerrar_ojo_2.png"
                    : "/assets/img/img_login/ojo2.png"
                }
                width={20}
                height={20}
                alt="Mostrar u ocultar contraseña"
                className="absolute right-3 top-3 cursor-pointer opacity-80"
                onClick={() => setShowPass(!showPass)}
              />
            </div>

            <div className="text-right mt-1">
              <Link href="/recuperar" className="text-gray-400 text-sm hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {/* Mensajes */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#25C50E] text-black font-semibold py-3 rounded-lg hover:bg-[#1ea90c] transition"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>

        </form>

        {/* Línea */}
        <div className="w-full h-px bg-white/10 my-8"></div>

        {/* Nota */}
        <p className="text-center text-gray-400 text-sm">
          Al iniciar sesión, aceptas nuestros{" "}
          <a className="text-[#25C50E] underline cursor-pointer">Términos</a> y{" "}
          <a className="text-[#25C50E] underline cursor-pointer">Condiciones</a>.
        </p>

      </div>
    </section>
  );
}
