"use client";

import Link from "next/link";
import "@/styles/styles_mensajeria.css";

export default function MensajeriaPage() {
  return (
    <div className="mensajeria-container">
      {/* Sidebar izquierdo */}
      <aside className="sidebar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar"
            className="search-input"
          />
        </div>

        <div className="bottom-link">
          <Link href="/dashboard" className="back-link">
            ← Volver al dashboard
          </Link>
        </div>
      </aside>

      {/* Área principal */}
      <main className="main-view">
        <p className="placeholder-text">Aquí podrás ver tus conversaciones</p>
      </main>
    </div>
  );
}
