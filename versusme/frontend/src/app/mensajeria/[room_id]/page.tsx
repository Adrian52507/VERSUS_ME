"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import "@/styles/styles_mensajeria.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

// 🟢 Formato corto de fecha
function formatShortDate(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);

  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d.getDate()} ${meses[d.getMonth()]}`;
}

// 🟢 Formato corto de hora
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
    const res = await fetch(`${API_BASE}/api/chat/rooms`, {
      credentials: "include",
    });
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
      const interval = setInterval(() => fetchMessages(activeRoom), 2500);
      return () => clearInterval(interval);
    }
  }, [activeRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="mensajeria-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h3 style={{ color: "#fff", marginBottom: "1rem" }}>Mis Chats</h3>

        {rooms.map((r: any) => (
          <div
            key={r.room_id}
            className={`chat-item ${activeRoom === r.room_id ? "active" : ""}`}
            onClick={() => setActiveRoom(r.room_id)}
          >
            <strong>{r.sport} </strong>

            <small>
              {r.district} — {formatShortDate(r.match_date)}
            </small>
          </div>
        ))}

        <div className="bottom-link">
          <Link href="/dashboard" className="back-link">← Volver al Dashboard</Link>
        </div>
      </aside>

      {/* Main chat view */}
      <main className={`main-view ${!activeRoom ? "empty" : ""}`} style={{ color: "black" }}>
        {!activeRoom ? (
          <p className="placeholder-text">Selecciona un chat para comenzar</p>
        ) : (
          <>
            <div className="chat-window">
              {messages.map((m, i) => (
                <div className={`message-row ${m.isMine ? "mine" : "theirs"}`} key={i}>
                  {!m.isMine && (
                    <img
                      src={
                        m.profile_picture
                          ? (m.profile_picture.startsWith("http")
                            ? m.profile_picture
                            : `${API_BASE}/${m.profile_picture.replace(/^\/+/, "")}`
                          )
                          : "/assets/img/img_perfil/default-user.jpg"
                      }
                      className="msg-avatar"
                      alt="perfil"
                    /> 
                  )}

                  <div className={`message-bubble ${m.isMine ? "mine" : "theirs"}`}>
                    <span className="author" style={{ fontWeight: "bold" }}>{m.name}</span>
                    <p>{m.content}</p>
                  </div>
                </div>

              ))}
              <div ref={bottomRef}></div>
            </div>

            <div className="input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
              />
              <button onClick={sendMessage}>Enviar</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
