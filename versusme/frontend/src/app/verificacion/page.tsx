"use client";

import { useState, useEffect, useRef } from "react";
import "@/styles/styles_verificacion.css";

export default function VerificacionPage() {
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState(Array(6).fill(""));
  const [mensaje, setMensaje] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const correoGuardado = localStorage.getItem("correoUsuario");
    setEmail(correoGuardado || "usuario@versusme.com");
  }, []);

  const handleChange = (index: number, value: string) => {
    if (/[^0-9]/.test(value)) return;

    const nuevo = [...codigo];
    nuevo[index] = value;
    setCodigo(nuevo);

    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleBackspace = (index: number) => {
    if (!codigo[index] && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = codigo.join("");
    if (code.length !== 6) {
      setMensaje("Código incompleto ❌");
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
      setMensaje("✅ Cuenta verificada con éxito. Redirigiendo...");
      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch (err: any) {
      setMensaje("❌ Código inválido o expirado");
    }
  };

  const reenviarCodigo = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/resend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMensaje("📧 Se ha reenviado el código al correo " + email);
  };

  return (
    <main className="login">
      <div
        className="login-bg"
        style={{ backgroundImage: "url('/assets/img/img_index/fondof2.png')" }}
      ></div>
      <div className="login-overlay"></div>

      <section className="login-card">
        <div className="marca">VersusMe</div>
        <h1 className="titulo">Verificación de correo</h1>
        <p className="desc">Hemos enviado un código de 6 dígitos a tu correo:</p>
        <p className="correo">{email}</p>

        <form onSubmit={handleSubmit}>
          <label className="label">Ingrese el código recibido</label>
          <div className="codigo-box">
            {codigo.map((c, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="codigo-input"
                value={c}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => e.key === "Backspace" && handleBackspace(i)}
                ref={(el) => {inputsRef.current[i] = el;}}
                required
              />
            ))}
          </div>

          <button
            className="btn-submit"
            type="submit"
            disabled={codigo.some((c) => c === "")}
          >
            Verificar código
          </button>
        </form>

        <p className="nota">
          ¿No recibiste el código?{" "}
          <a href="#" className="reenviar" onClick={reenviarCodigo}>
            Reenviar código
          </a>
        </p>

        {mensaje && <p style={{ marginTop: "15px" }}>{mensaje}</p>}
      </section>

      <div className="volver">
        <a href="/registro" className="btn-volver">
          ← Volver a registro
        </a>
      </div>
    </main>
  );
}
