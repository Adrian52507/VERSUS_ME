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

function formatShortTime(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);

  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const suf = h >= 12 ? "p.m." : "a.m.";
  h = ((h + 11) % 12) + 1;

  return `${h}:${m} ${suf}`;
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
    <div className="h-screen flex bg-[#141517] text-white">
      {/* ---------------------------------------------------------------- */}
      {/*                          SIDEBAR CHATS                           */}
      {/* ---------------------------------------------------------------- */}
      <aside className="w-80 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Mis Chats</h2>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {rooms.map((r: any) => (
            <div
              key={r.room_id}
              onClick={() => setActiveRoom(r.room_id)}
              className={`cursor-pointer rounded-xl p-4 transition border 
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

      {/* ---------------------------------------------------------------- */}
      {/*                             CHAT PANEL                           */}
      {/* ---------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col p-6">
        {!activeRoom ? (
          <div className="flex-grow flex items-center justify-center text-gray-400">
            Selecciona un chat para comenzar
          </div>
        ) : (
          <>
            {/* ------------------------- VENTANA DE CHAT ------------------------- */}
            <div className="flex-1 overflow-y-auto pr-3 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex items-start ${m.isMine ? "justify-end" : "justify-start"}`}>
                  {/* Avatar solo de los otros */}
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
                      width={40}
                      height={40}
                      className="rounded-full mr-3 border border-green-500"
                    />
                  )}

                  {/* Burbuja */}
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-lg 
                      ${m.isMine ? "bg-green-600 text-black rounded-br-sm" : "bg-white/20 text-white backdrop-blur-xl"}`
                    }
                  >
                    <div className="font-bold mb-1">{m.name}</div>
                    <div>{m.content}</div>
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            {/* ------------------------- INPUT DE CHAT --------------------------- */}
            <div className="mt-4 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none backdrop-blur-xl"

                // ⬇⬇⬇ NUEVO: enviar con Enter
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // evita salto de línea
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={sendMessage}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black rounded-xl font-semibold transition"
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
