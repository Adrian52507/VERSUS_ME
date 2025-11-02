"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/styles/styles_login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Error al iniciar sesión");
      setSuccess("Inicio de sesión exitoso ✅");

      // Redirigir a perfil o dashboard
      setTimeout(() => {
        window.location.href = "/perfil";
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Error de red");
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
        <h1 className="titulo">
          ¡Inicia Sesión en
          <br />
          VersusMe!
        </h1>
        <p className="desc">Sigue descubriendo retos deportivos en Lima</p>
        <p className="alternativa">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="link">
            Regístrate
          </Link>
        </p>

        <form className="formulario" onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <label className="label" htmlFor="pass">
            Contraseña
          </label>
          <div className="input-wrap">
            <input
              className="input"
              id="pass"
              name="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <Image
              className="ojo"
              src="/assets/img/img_login/ojo.png"
              width={20}
              height={20}
              alt="Mostrar u ocultar contraseña"
              onClick={() => {
                const input = document.getElementById("pass") as HTMLInputElement;
                if (input) {
                  input.type = input.type === "password" ? "text" : "password";
                }
              }}
            />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <hr className="linea" />

        <p className="nota">
          Al iniciar sesión, indicas tu consentimiento con nuestros{" "}
          <a href="#" className="link">
            Términos de Servicio
          </a>{" "}
          y{" "}
          <a href="#" className="link">
            Condiciones
          </a>
        </p>
      </div>
    </section>
  );
}
