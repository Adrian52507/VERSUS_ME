"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import "@/styles/styles_registro.css";

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

  // 🔍 Valida contraseña en tiempo real
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

    // Validaciones
    const allOk = Object.values(rules).every(Boolean);
    if (!allOk) {
      setError("La contraseña no cumple con todos los requisitos");
      return;
    }

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
      localStorage.setItem("correoUsuario", form.email);

      setTimeout(() => {
        window.location.href = "/verificacion";
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <main className="login">
      <div
        className="login-bg"
        style={{ backgroundImage: "url('/assets/img/img_index/fondof2.png')" }}
      ></div>
      <div className="login-overlay" aria-hidden="true"></div>

      <section className="login-card" role="region" aria-labelledby="titulo">
        <div className="marca">VersusMe</div>

        <h1 className="titulo" id="titulo">
          ¡Únete a VersusMe!
        </h1>

        <p className="desc">
          Crea tu cuenta y comienza a descubrir retos deportivos en Lima
        </p>
        <p className="alternativa">
          ¿Ya tienes cuenta?{" "}
          <Link className="link" href="/login">
            Iniciar Sesión
          </Link>
        </p>

        <form className="formulario" onSubmit={handleSubmit}>
          {/* Nombre */}
          <label className="label" htmlFor="reg-nombre">
            Nombre completo
          </label>
          <input
            className="input"
            id="reg-nombre"
            name="name"
            type="text"
            placeholder="Nombre y apellidos"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          {/* Email */}
          <label className="label" htmlFor="reg-email">
            Correo electrónico
          </label>
          <input
            className="input"
            id="reg-email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          {/* Contraseña */}
          <label className="label" htmlFor="reg-pass">
            Contraseña
          </label>
          <div className="input-wrap">
            <input
              className="input"
              id="reg-pass"
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="********"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Image
              className="ojo"
              src={
                showPass
                  ? "/assets/img/img_login/cerrar_ojo.png"
                  : "/assets/img/img_login/ojo.png"
              }
              width={20}
              height={20}
              alt="Mostrar u ocultar contraseña"
              onClick={() => setShowPass(!showPass)}
            />
          </div>

          {/* Reglas de contraseña */}
          <ul className="pw-rules" id="pw-rules">
            <li className={rules.len ? "ok" : ""}>Mínimo 8 caracteres</li>
            <li className={rules.upper ? "ok" : ""}>
              Al menos 1 letra mayúscula (A-Z)
            </li>
            <li className={rules.lower ? "ok" : ""}>
              Al menos 1 letra minúscula (a-z)
            </li>
            <li className={rules.digit ? "ok" : ""}>Al menos 1 número (0-9)</li>
            <li className={rules.symbol ? "ok" : ""}>
              Al menos 1 símbolo (!@#…)
            </li>
            <li className={rules.nospace ? "ok" : ""}>Sin espacios</li>
          </ul>

          {/* Confirmar contraseña */}
          <label className="label" htmlFor="reg-pass2">
            Confirmar contraseña
          </label>
          <div className="input-wrap">
            <input
              className="input"
              id="reg-pass2"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="********"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />
            <Image
              className="ojo"
              src={
                showConfirm
                  ? "/assets/img/img_login/cerrar_ojo.png"
                  : "/assets/img/img_login/ojo.png"
              }
              width={20}
              height={20}
              alt="Mostrar u ocultar contraseña"
              onClick={() => setShowConfirm(!showConfirm)}
            />
          </div>

          {/* Estado */}
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
          {success && (
            <p style={{ color: "green", marginTop: "10px" }}>{success}</p>
          )}

          <button
            className="btn-submit"
            type="submit"
            disabled={!Object.values(rules).every(Boolean)}
            style={{
              opacity: Object.values(rules).every(Boolean) ? "1" : ".6",
              cursor: Object.values(rules).every(Boolean)
                ? "pointer"
                : "not-allowed",
            }}
          >
            Crear cuenta
          </button>

          <hr className="linea" />

          <p className="nota">
            Al crear una cuenta, aceptas nuestros{" "}
            <a className="link" href="#">
              Términos de Servicio y Condiciones
            </a>
          </p>
        </form>
      </section>
    </main>
  );
}
