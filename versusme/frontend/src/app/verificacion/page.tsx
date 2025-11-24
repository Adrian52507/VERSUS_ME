"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function VerificacionPage() {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState(Array(6).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const correoGuardado = localStorage.getItem("correoUsuario");
    setEmail(correoGuardado || "");
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const nuevo = [...codigo];
    nuevo[index] = value;
    setCodigo(nuevo);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (!codigo[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = codigo.join("");

    if (code.length !== 6) {
      setMensaje("❌ Código incompleto");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMensaje("✅ Cuenta verificada, redirigiendo...");
      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch (err: any) {
      setMensaje("❌ Código inválido o expirado");
    }
  }

  async function reenviarCodigo() {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/resend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setMensaje(`📧 Código reenviado a ${email}`);
  }

  return (
    <section className="relative min-h-screen grid place-items-center overflow-hidden text-white">

      {/* Fondo */}
      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/img/img_index/fondof2.png')",
        }}
      ></div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 -z-10 bg-black/80 backdrop-blur-sm"></div>

      {/* CARD — IGUAL AL LOGIN */}
      <div className="w-[90%] max-w-[480px] bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-xl">

        {/* Marca */}
        <h1 className="text-4xl font-extrabold text-center mb-2">
          <span className="text-[#25C50E]">Versus</span>Me
        </h1>

        <h2 className="text-xl text-center font-semibold mb-2">
          Verificación de correo
        </h2>

        <p className="text-center text-gray-300">
          Hemos enviado un código de 6 dígitos a:
        </p>

        <p className="text-center font-bold text-[#25C50E] mb-6">
          {email}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <label className="block text-sm font-semibold text-gray-200 text-center">
            Ingresa el código
          </label>

          {/* Caja de inputs */}
          <div className="flex justify-center gap-3">
            {codigo.map((c, i) => (
              <input
                key={i}
                maxLength={1}
                value={c}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Backspace" && handleBackspace(i)
                }
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}

                className="
                  w-12 h-14 text-center text-2xl font-bold
                  bg-white/10 border border-white/20 
                  rounded-lg outline-none text-white
                  focus:border-[#25C50E] focus:shadow-[0_0_8px_#25C50E]
                "
              />
            ))}
          </div>

          {/* Botón */}
          <button
            type="submit"
            className={`
              w-full h-11 rounded-lg font-bold mt-4
              bg-[#25C50E] text-black
              ${codigo.some((c) => c === "")
                ? "opacity-40 cursor-not-allowed"
                : "cursor-pointer"
              }
            `}
            disabled={codigo.some((c) => c === "")}
          >
            Verificar código
          </button>

          <p className="text-center text-gray-300 text-sm mt-4">
            ¿No recibiste el código?{" "}
            <button
              type="button"
              onClick={reenviarCodigo}
              className="text-[#25C50E] font-semibold underline"
            >
              Reenviar
            </button>
          </p>
        </form>

        {/* Mensaje */}
        {mensaje && (
          <p className="text-center mt-4 text-sm text-gray-200">{mensaje}</p>
        )}
      </div>

      {/* Volver */}
      <div className="absolute bottom-6">
        <Link
          href="/registro"
          className="text-[#25C50E] underline font-semibold text-sm"
        >
          ← Volver a registro
        </Link>
      </div>
    </section>
  );
}
