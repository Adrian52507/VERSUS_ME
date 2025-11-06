"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "@/styles/styles_perfil.css";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/profile`, { credentials: "include" });
      const data = await res.json();
      setPerfil(data);
      setUsuario(data.name || "U");
      setLoading(false);
    };
    fetchPerfil();
  }, []);

  const handleLogout = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    await fetch(`${API_BASE}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/login";
  };

  const handleInputChange = (e: any) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleGuardarCambios = async () => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    const res = await fetch(`${API_BASE}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(perfil),
    });
    if (res.ok) setMensaje("✅ Los cambios han sido guardados correctamente.");
    else setMensaje("❌ Error al guardar los cambios.");
    setEditando(false);
  };

  const handleChangeProfilePicture = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    const res = await fetch(`${API_BASE}/api/profile/picture`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      setPerfil({ ...perfil, profile_picture: updated.profile_picture });
      setMensaje("🖼️ Imagen de perfil actualizada con éxito.");
    } else {
      setMensaje("❌ Error al actualizar la imagen de perfil.");
    }
  };

  const handleChangeCoverPhoto = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("cover_photo", file);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
    const res = await fetch(`${API_BASE}/api/profile/cover`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      setPerfil({ ...perfil, cover_photo: updated.cover_photo });
      setMensaje("🖼️ Foto de portada actualizada con éxito.");
    } else {
      setMensaje("❌ Error al actualizar la foto de portada.");
    }
  };

  if (loading) return <p>Cargando perfil...</p>;
  if (!perfil) return <p>No se pudo cargar tu perfil.</p>;

  return (
    <>
      {/* 🔹 Top Navigation */}
      <div className="topbar">
        <div className="container">
          <Link href="/">
            <h1 className="brand">VersusMe</h1>
          </Link>
          <nav className="top-actions">
            <Link className="pill" href="/dashboard">
              <Image
                src="/assets/img/img_dashboard_principal/casa_negro_icono.png"
                alt=""
                width={16}
                height={16}
              />
              DASHBOARDS
            </Link>

            <Link className="pill" href="/crear_partido">
              <Image
                src="/assets/img/img_dashboard_principal/suma_negro_icono.png"
                alt=""
                width={16}
                height={16}
              />
              CREAR PARTIDO
            </Link>

            <Link className="pill" href="/historial">
              <Image
                src="/assets/img/img_dashboard_principal/reloj_negro_icono.png"
                alt=""
                width={16}
                height={16}
              />
              HISTORIAL
            </Link>

            <div className="profile" style={{ position: "relative" }}>
              <div
                className="badge"
                style={{
                  overflow: "hidden",
                  padding: 0,
                  background: "none",
                  border: "2px solid #5F676D",
                }}
              >
                <Image
                  src={
                    perfil?.profile_picture
                      ? `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/${perfil.profile_picture.replace(/^\/+/, "")}`
                      : "/assets/img/img_perfil/default-user.jpg"
                  }
                  alt="Foto de perfil"
                  width={50}
                  height={50}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                  unoptimized
                />
              </div>


              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              >
                <Image
                  src="/assets/img/img_dashboard_principal/menor_que_gris_icono.png"
                  alt="toggle menu"
                  width={18}
                  height={18}
                />
              </button>

              {menuOpen && (
                <div
                  className="profile-menu"
                  style={{
                    position: "absolute",
                    top: "60px",
                    right: 0,
                    background: "#2B2F2A",
                    border: "1px solid #5F676D",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    zIndex: 10,
                    minWidth: "180px",
                  }}
                >
                  <nav style={{ display: "flex", flexDirection: "column" }}>
                    <Link
                      href="/perfil"
                      style={{
                        padding: "0.7em 20px",
                        color: "#fff",
                        textDecoration: "none",
                        fontWeight: 500,
                        borderBottom: "1px solid #5F676D",
                      }}
                    >
                      Perfil del jugador
                    </Link>

                    <Link
                      href="/mensajeria"
                      style={{
                        padding: "0.7em 20px",
                        color: "#fff",
                        textDecoration: "none",
                        fontWeight: 500,
                        borderBottom: "1px solid #5F676D",
                      }}
                    >
                      Mensajería
                    </Link>

                    <button
                      onClick={handleLogout}
                      style={{
                        border: "none",
                        color: "#ff6b6b",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: "0.7em 20px",
                        textAlign: "left",
                        background: "none",
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* 🔹 Perfil principal */}
      <div className="perfil-container">
        <div className="perfil-portada">
          <Image
            src={
              perfil.cover_photo
                ? `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/${perfil.cover_photo.replace(/^\/+/, "")}`
                : "/assets/img/img_perfil/default-cover.jpg"
            }
            alt="Portada"
            fill
            className="cover-image"
            unoptimized
          />
          <label className="edit-cover-btn">
            ✏️ Editar portada
            <input type="file" accept="image/*" hidden onChange={handleChangeCoverPhoto} />
          </label>

          <div className="perfil-foto">
            <label className="foto-hover">
              <Image
                src={
                  perfil.profile_picture
                    ? `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"}/${perfil.profile_picture.replace(/^\/+/, "")}`
                    : "/assets/img/img_perfil/default-user.jpg"
                }
                alt="Perfil"
                width={120}
                height={120}
                className="foto-img"
                unoptimized
              />
              <div className="hover-overlay">✏️</div>
              <input type="file" accept="image/*" hidden onChange={handleChangeProfilePicture} />
            </label>
          </div>
        </div>

        <div className="perfil-main">
          <div className="perfil-info">
            <h2>Información del usuario</h2>
            {editando ? (
              <>
                <input name="name" value={perfil.name} onChange={handleInputChange} />
                <textarea
                  name="description"
                  value={perfil.description || ""}
                  onChange={handleInputChange}
                />
                <input name="email" value={perfil.email} onChange={handleInputChange} />
                <input name="district" value={perfil.district || ""} onChange={handleInputChange} />
                <input
                  name="favorite_sport"
                  value={perfil.favorite_sport || ""}
                  onChange={handleInputChange}
                />
                <input name="level" value={perfil.level || ""} onChange={handleInputChange} />
                <button onClick={handleGuardarCambios} className="btn-guardar">
                  Guardar cambios
                </button>
              </>
            ) : (
              <>
                <p><b>Nombre:</b> {perfil.name}</p>
                <p><b>Descripción:</b> {perfil.description || "Sin descripción"}</p>
                <p><b>Correo:</b> {perfil.email}</p>
                <p><b>Distrito:</b> {perfil.district}</p>
                <p><b>Deporte favorito:</b> {perfil.favorite_sport}</p>
                <p><b>Nivel:</b> {perfil.level}</p>
                <button onClick={() => setEditando(true)} className="btn-editar">
                  ✏️ Editar perfil
                </button>
              </>
            )}
          </div>

          <div className="perfil-insignias">
            <h3>Insignias del jugador</h3>
            <div className="insignias-grid">
              <Image src="/assets/img/img_insignias/insignia_creacion.png" alt="Creación" width={60} height={60} />
            </div>
          </div>
        </div>

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>
    </>
  );
}
