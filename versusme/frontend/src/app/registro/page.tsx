"use client";

import { useState } from "react";
import Link from "next/link";
import "@/styles/styles_registro.css";

export default function RegistroPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar usuario");

      setSuccess("Cuenta creada exitosamente 🎉");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main className="login">
      <div className="login-bg" style={{ backgroundImage: "url('/assets/img/img_index/fondof2.png')" }}></div>
      <div className="login-overlay" aria-hidden="true"></div>

      <section className="login-card" role="region" aria-labelledby="titulo">
        <div className="marca">VersusMe</div>

        <h1 className="titulo" id="titulo">¡Únete a VersusMe!</h1>

        <p className="desc">Crea tu cuenta y comienza a descubrir retos deportivos en Lima</p>
        <p className="alternativa">
          ¿Ya tienes cuenta? <Link className="link" href="/login">Iniciar Sesión</Link>
        </p>

        <form className="formulario" onSubmit={handleSubmit}>
          <label className="label" htmlFor="reg-nombre">Nombre completo</label>
          <input
            className="input"
            id="reg-nombre"
            name="name"
            type="text"
            placeholder="Nombre y apellidos"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />

          <label className="label" htmlFor="reg-email">Correo electrónico</label>
          <input
            className="input"
            id="reg-email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />

          <label className="label" htmlFor="reg-pass">Contraseña</label>
          <input
            className="input"
            id="reg-pass"
            name="password"
            type="password"
            placeholder="********"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />

          <label className="label" htmlFor="reg-pass2">Confirmar contraseña</label>
          <input
            className="input"
            id="reg-pass2"
            name="confirmPassword"
            type="password"
            placeholder="********"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />

          <button className="btn-submit" type="submit">Crear cuenta</button>

          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
          {success && <p style={{ color: "green", marginTop: "10px" }}>{success}</p>}

          <hr className="linea" />

          <p className="nota">
            Al crear una cuenta, aceptas nuestros{" "}
            <a className="link" href="#">Términos de Servicio y Condiciones</a>
          </p>
        </form>
      </section>
    </main>
  );
}
