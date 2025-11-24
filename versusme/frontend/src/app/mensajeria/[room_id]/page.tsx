"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

// -------------------------------
// Formato de fecha y hora
// -------------------------------
function formatShortDate(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d.getDate()} ${meses[d.getMonth()]}`;
}

export default function MensajeriaPage() {
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<number | null>(null);
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchRooms = async () => {
    const res = await fetch(`${API_BASE}/api/chat/rooms`, { credentials: "include" });
    const data = await res.json();
    setRooms(data);
  };

  const fetchMessages = async (roomId: number) => {
    const res = await fetch(`${API_BASE}/api/chat/messages/${roomId}`, {
      credentials: "include",
    });
    const data = await res.json();
    setMessages(data);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    await fetch(`${API_BASE}/api/chat/send`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: activeRoom, content: input }),
    });

    setInput("");
    fetchMessages(activeRoom!);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom);
      const interval = setInterval(() => fetchMessages(activeRoom), 2000);
      return () => clearInterval(interval);
    }
  }, [activeRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -------------------------------------------------
  //                 UI PRINCIPAL
  // -------------------------------------------------

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#141517] text-white">

      {/* -------------------------------------------------- */}
      {/*                 HEADER MÓVIL                       */}
      {/* -------------------------------------------------- */}
      <div className="md:hidden w-full p-4 bg-black/40 border-b border-white/10 flex items-center gap-3 sticky top-0 z-50">

        {/* Flecha volver (solo si hay chat activo) */}
        {activeRoom && (
          <button
            onClick={() => setActiveRoom(null)}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition"
          >
            <Image
              src="/chevron-down.svg"
              alt="volver"
              width={20}
              height={20}
              className="rotate-90"
            />
            {/* rotate-90 → la flecha apunta hacia la izquierda */}
            {/* invert → la vuelve blanca */}
          </button>
        )}

        {/* Selector de chats SIEMPRE visible */}
        <div className="flex-1 relative">
          <select
            value={activeRoom || ""}
            onChange={(e) => setActiveRoom(Number(e.target.value))}
            className="
        w-full bg-white/10 px-4 py-3 rounded-lg
        border border-white/20 text-white text-sm outline-none 
        appearance-none pr-10
      "
            style={{ paddingRight: "2.5rem" }} // espacio para el icono
          >
            <option value="">Selecciona un chat…</option>
            {rooms.map((r: any) => (
              <option key={r.room_id} value={r.room_id} className="bg-[#222]">
                {r.sport} — {r.district} ({formatShortDate(r.match_date)})
              </option>
            ))}
          </select>

          {/* Chevron con TU ícono, posicionado correctamente */}
          <Image
            src="/chevron-down.svg"
            alt="desplegar"
            width={18}
            height={18}
            className="
        absolute right-3 top-1/2 -translate-y-1/2 opacity-70
      "
          />
        </div>
      </div>


      {/* -------------------------------------------------- */}
      {/*                 SIDEBAR DESKTOP                    */}
      {/* -------------------------------------------------- */}
      <aside className="hidden md:flex w-80 bg-black/40 border-r border-white/10 p-6 flex-col">
        <h2 className="text-2xl font-bold mb-4">Mis Chats</h2>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {rooms.map((r: any) => (
            <div
              key={r.room_id}
              onClick={() => setActiveRoom(r.room_id)}
              className={`cursor-pointer rounded-xl p-4 border 
                ${activeRoom === r.room_id
                  ? "bg-green-600 text-black border-green-500"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
            >
              <div className="font-semibold">{r.sport}</div>
              <div className="text-sm text-gray-300">
                {r.district} · {formatShortDate(r.match_date)}
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="mt-6 text-sm text-gray-300 hover:text-green-400 transition"
        >
          ← Volver al dashboard
        </Link>
      </aside>

      {/* -------------------------------------------------- */}
      {/*                    PANEL CHAT                       */}
      {/* -------------------------------------------------- */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Nada seleccionado */}
        {!activeRoom && (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400">
            Selecciona un chat para comenzar
          </div>
        )}

        {/* Chat */}
        {activeRoom && (
          <>
            {/* Historial */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
                  {!m.isMine && (
                    <Image
                      src={
                        m.profile_picture
                          ? m.profile_picture.startsWith("http")
                            ? m.profile_picture
                            : `${API_BASE}/${m.profile_picture.replace(/^\/+/, "")}`
                          : "/assets/img/img_perfil/default-user.jpg"
                      }
                      alt="perfil"
                      width={36}   // <-- requerido por Next
                      height={36}  // <-- requerido por Next
                      className="rounded-full mr-2 border border-green-500 w-9 h-9 object-cover"
                    />

                  )}

                  <div
                    className={`
                      max-w-[80%] sm:max-w-[60%] px-4 py-3 rounded-2xl text-sm break-words shadow-lg
                      ${m.isMine
                        ? "bg-green-600 text-black rounded-br-sm"
                        : "bg-white/20 text-white backdrop-blur-xl"
                      }
                    `}
                  >
                    <div className="font-bold text-xs mb-1">{m.name}</div>
                    {m.content}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-black/30 border-t border-white/10 flex gap-2 sticky bottom-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none backdrop-blur-xl text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
                className="px-5 py-3 bg-green-500 hover:bg-green-600 text-black rounded-xl font-semibold"
              >
                Enviar
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
