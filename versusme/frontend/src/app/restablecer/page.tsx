"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import "@/styles/styles_login.css";

export default function RestablecerPage() {
  const [password, setPassword] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje("Contraseña actualizada ✅");
        // 🔹 Espera 2 segundos y redirige al login
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMensaje(data.error || "Error al actualizar la contraseña ❌");
      }
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
        <h1 className="titulo">Restablecer Contraseña</h1>

        <form className="formulario" onSubmit={handleSubmit}>
          <label className="label" htmlFor="pass">Nueva contraseña</label>

          <div className="input-wrap" style={{ position: "relative" }}>
            <input
              className="input"
              id="pass"
              type={mostrarPass ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={
                mostrarPass
                  ? "/assets/img/img_login/cerrar_ojo.png"
                  : "/assets/img/img_login/ojo.png"
              }
              alt="Mostrar u ocultar contraseña"
              width={22}
              height={22}
              onClick={() => setMostrarPass(!mostrarPass)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            />
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>

          {mensaje && (
            <p
              style={{
                marginTop: "10px",
                color: mensaje.includes("✅") ? "black" : "#fff",
                fontWeight: 100,
              }}
            >
              {mensaje}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
