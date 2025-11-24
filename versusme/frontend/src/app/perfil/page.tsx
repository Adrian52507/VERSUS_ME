"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Topbar from "@/components/Topbar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`${API_BASE}/api/profile`, { credentials: "include" });
      const data = await res.json();
      setPerfil(data);
      setLoading(false);
    })();
  }, []);

  const updateField = (e: any) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const saveChanges = async () => {
    const res = await fetch(`${API_BASE}/api/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(perfil),
    });

    res.ok
      ? setMsg("Cambios guardados correctamente 🎉")
      : setMsg("Error al guardar ❌");

    setEdit(false);
  };

  const uploadImage = async (e: any, type: "profile" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append(type === "profile" ? "profile_picture" : "cover_photo", file);

    const endpoint = type === "profile" ? "picture" : "cover";

    const res = await fetch(`${API_BASE}/api/profile/${endpoint}`, {
      method: "POST",
      credentials: "include",
      body: form,
    });

    if (!res.ok) return setMsg("Error al subir imagen ❌");

    const updated = await res.json();
    setPerfil({
      ...perfil,
      [type === "profile" ? "profile_picture" : "cover_photo"]:
        updated[type === "profile" ? "profile_picture" : "cover_photo"],
    });
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-gray-300">
        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-3" />
        Cargando perfil...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#141517] text-white">

      {/* ✔ Topbar REAL del sistema */}
      <Topbar />

      {/* ----------- PORTADA ----------- */}
      <section className="relative w-full h-72">
        <Image
          src={
            perfil.cover_photo
              ? perfil.cover_photo.startsWith("http")
                ? perfil.cover_photo
                : `${API_BASE}/${perfil.cover_photo.replace(/^\/+/, "")}`
              : "/assets/img/img_perfil/default-cover.jpg"
          }
          alt="cover"
          fill
          className="object-cover opacity-90"
        />

        {/* Botón cambiar portada */}
        <label className="absolute bottom-3 right-5 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-xl text-sm cursor-pointer hover:bg-white/30 transition">
          Cambiar portada
          <input type="file" hidden onChange={(e) => uploadImage(e, "cover")} />
        </label>

        {/* ----------- FOTO PERFIL ----------- */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <label className="relative cursor-pointer group">
            <Image
              src={
                perfil.profile_picture
                  ? perfil.profile_picture.startsWith("http")
                    ? perfil.profile_picture
                    : `${API_BASE}/${perfil.profile_picture.replace(/^\/+/, "")}`
                  : "/assets/img/img_perfil/default-user.jpg"
              }
              width={140}
              height={140}
              alt="profile"
              className="rounded-full border-4 border-white/20 shadow-xl object-cover group-hover:brightness-75 transition"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center text-2xl rounded-full transition">
              ✏️
            </div>
            <input type="file" hidden onChange={(e) => uploadImage(e, "profile")} />
          </label>
        </div>
      </section>

      {/* CONTENEDOR GENERAL */}
      <main className="max-w-5xl mx-auto pt-24 px-6 flex flex-col md:flex-row gap-10 ">

        {/* ----------- INFO USUARIO ----------- */}
        <div className="w-full md:w-2/3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl mb-10">
          <h2 className="text-3xl font-bold mb-5">Información del jugador</h2>

          {!edit ? (
            <div className="space-y-3 text-gray-300">
              <p><b>Nombre:</b> {perfil.name}</p>
              <p><b>Email:</b> {perfil.email}</p>
              <p><b>Descripción:</b> {perfil.description || "Sin descripción"}</p>
              <p><b>Distrito:</b> {perfil.district}</p>
              <p><b>Deporte favorito:</b> {perfil.favorite_sport}</p>
              <p><b>Nivel:</b> {perfil.level}</p>

              <button
                onClick={() => setEdit(true)}
                className="mt-4 bg-[#25C50E] text-black rounded-xl px-6 py-2 font-semibold hover:bg-green-500 transition"
              >
                Editar perfil
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2" name="name" value={perfil.name} onChange={updateField} />
              <textarea className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2" name="description" value={perfil.description || ""} onChange={updateField} />
              <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2" name="email" value={perfil.email} onChange={updateField} />
              <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2" name="district" value={perfil.district || ""} onChange={updateField} />
              <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2" name="favorite_sport" value={perfil.favorite_sport || ""} onChange={updateField} />
              <input className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2" name="level" value={perfil.level || ""} onChange={updateField} />

              <button
                onClick={saveChanges}
                className="mt-4 bg-green-600 text-white rounded-xl px-6 py-2 font-semibold hover:bg-green-700 transition"
              >
                Guardar cambios
              </button>
            </div>
          )}
        </div>

        {/* ----------- INSIGNIAS ----------- */}
        <div className="w-full md:w-1/3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl mb-10">
          <h3 className="text-2xl font-bold mb-5">Insignias</h3>

          <div className="flex gap-4">
            <Image src="/assets/img/img_insignias/insignia_creacion.png" width={70} height={70} alt="insignia" />
          </div>
        </div>

      </main>

      {msg && (
        <p className="mt-10 text-center bg-white/10 inline-block mx-auto px-6 py-3 rounded-xl">
          {msg}
        </p>
      )}
    </div>
  );
}
