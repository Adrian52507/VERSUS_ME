"use client";

import { useState } from "react";
import "@/styles/styles_login.css";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMensaje(data.message || "Correo enviado si la cuenta existe ✅");
    } catch {
      setMensaje("Error al conectar con el servidor ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login">
      <div
        className="login-bg"
        style={{ backgroundImage: "url('/assets/img/img_index/fondof2.png')" }}
      ></div>
      <div className="login-overlay"></div>

      <div className="login-card">
        <div className="marca">VersusMe</div>
        <h1 className="titulo">Recuperar Contraseña</h1>
        <p className="desc">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <form className="formulario" onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">Correo electrónico</label>
          <input
            className="input"
            id="email"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>

          {mensaje && <p style={{ marginTop: "10px", color: "#fff" }}>{mensaje}</p>}
        </form>
      </div>
    </section>
  );
}
