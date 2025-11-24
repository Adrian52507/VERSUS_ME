"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function RegistroPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [rules, setRules] = useState({
    len: false,
    upper: false,
    lower: false,
    digit: false,
    symbol: false,
    nospace: true,
  });

  useEffect(() => {
    const v = form.password;
    setRules({
      len: v.length >= 8,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      digit: /\d/.test(v),
      symbol: /[^A-Za-z0-9\s]/.test(v),
      nospace: !/\s/.test(v),
    });
  }, [form.password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!Object.values(rules).every(Boolean))
      return setError("La contraseña no cumple los requisitos");

    if (form.password !== form.confirmPassword)
      return setError("Las contraseñas no coinciden");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Cuenta creada 🎉");

      // 🔥 Guardar el correo del usuario para la verificación
      localStorage.setItem("correoUsuario", form.email);

      setTimeout(() => {
        window.location.href = "/verificacion";
      }, 700);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <section className="relative min-h-screen grid place-items-center text-white overflow-hidden">

      {/* Fondo */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/img/img_index/fondof2.png')",
        }}
      ></div>

      {/* Overlay IGUAL AL LOGIN */}
      <div className="absolute inset-0 -z-10 bg-black/80 backdrop-blur-sm"></div>

      {/* CARD — MISMO TAMAÑO QUE LOGIN */}
      <div className="
        w-[90%]
        max-w-[480px]
        bg-white/10
        backdrop-blur-xl
        rounded-2xl
        shadow-xl
        p-10
        text-white
      ">

        <h1 className="text-4xl font-bold text-center mb-6">
          <Link href="/">
            <span>Versus</span>
            <span className="text-[#25C50E]">Me</span>
          </Link>
        </h1>

        <p className="text-center text-gray-300 mb-6">
          Crea tu cuenta y comienza a disfrutar del<p>deporte en Lima.</p>
        </p>

        <p className="text-center text-gray-300 mb-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-[#25C50E] font-semibold">
            Inicia sesión
          </Link>
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="font-semibold text-sm">Nombre completo</label>
            <input
              type="text"
              className="w-full h-11 mt-1 px-4 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-[#25C50E]"
              placeholder="Nombre y apellidos"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="font-semibold text-sm">Correo electrónico</label>
            <input
              type="email"
              className="w-full h-11 mt-1 px-4 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-[#25C50E]"
              placeholder="tu@correo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="font-semibold text-sm">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="w-full h-11 mt-1 px-4 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-[#25C50E]"
                placeholder="********"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <Image
                src={showPass ? "/assets/img/img_login/cerrar_ojo.png" : "/assets/img/img_login/ojo.png"}
                width={20}
                height={20}
                alt="toggle"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer opacity-80"
                onClick={() => setShowPass(!showPass)}
              />
            </div>
          </div>

          {/* Reglas */}
          <ul className="text-xs text-gray-300 space-y-1 pl-1 mt-1">
            <li className={rules.len ? "text-[#25C50E]" : ""}>Mínimo 8 caracteres</li>
            <li className={rules.upper ? "text-[#25C50E]" : ""}>Al menos 1 mayúscula</li>
            <li className={rules.lower ? "text-[#25C50E]" : ""}>Al menos 1 minúscula</li>
            <li className={rules.digit ? "text-[#25C50E]" : ""}>Al menos 1 número</li>
            <li className={rules.symbol ? "text-[#25C50E]" : ""}>Al menos 1 símbolo</li>
            <li className={rules.nospace ? "text-[#25C50E]" : ""}>Sin espacios</li>
          </ul>

          {/* Confirmar contraseña */}
          <div>
            <label className="font-semibold text-sm">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full h-11 mt-1 px-4 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-[#25C50E]"
                placeholder="********"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                required
              />

              <Image
                src={showConfirm ? "/assets/img/img_login/cerrar_ojo.png" : "/assets/img/img_login/ojo.png"}
                width={20}
                height={20}
                alt="toggle"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer opacity-80"
                onClick={() => setShowConfirm(!showConfirm)}
              />
            </div>
          </div>

          {/* Mensajes */}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          {/* Botón */}
          <button
            type="submit"
            className={`w-full h-11 rounded-lg font-bold bg-[#25C50E] text-black mt-4 
              ${Object.values(rules).every(Boolean) ? "" : "opacity-40 cursor-not-allowed"}
            `}
          >
            Crear cuenta
          </button>
        </form>

      </div>
    </section>
  );
}
