const SPORT_ICONS = {
  "Fútbol":      "assets/img/img_dashboard_principal/balon_futbol_verde_icono.png",
  "Baloncesto":  "assets/img/img_dashboard_principal/balon_basquet_verde_icono.png",
  "Tenis":       "assets/img/img_dashboard_principal/raqueta_tenis_verde_icono.png",
  "Pádel":       "assets/img/img_dashboard_principal/padel_verde_icono.png",
  "Vóleibol":    "assets/img/img_dashboard_principal/balon_veloibol_verde_icono.png",
  "Natación":    "assets/img/img_dashboard_principal/natacion_verde_icono.png",
};

function formatFechaISOaCorto(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const dias = ["dom","lun","mar","mié","jue","vie","sáb"];
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${dias[d.getDay()]}, ${String(d.getDate()).padStart(2,"0")} ${meses[d.getMonth()]}.`;
}
function formatHora(hhmm) {
  if (!hhmm) return "";
  const [h,m] = hhmm.split(":").map(Number);
  const suf = h >= 12 ? "p.m." : "a.m.";
  const h12 = ((h + 11) % 12) + 1;
  return `${String(h12).padStart(2,"0")}:${String(m).padStart(2,"0")} ${suf}`;
}

(function loadPreview(){
  const data = JSON.parse(sessionStorage.getItem("vm_crear_partido") || "{}");

  const $sportName = document.getElementById("pv-sport-name");
  const $sportIcon = document.getElementById("pv-sport-icon");
  const $distrito  = document.getElementById("pv-distrito");
  const $fecha     = document.getElementById("pv-fecha");
  const $hora      = document.getElementById("pv-hora");
  const $desc      = document.getElementById("pv-desc");
  const $jugMax    = document.getElementById("pv-jugadores");
  const $bar       = document.getElementById("pv-bar");
  const $chipApuesta  = document.getElementById("pv-chip-apuesta");
  const $montoApuesta = document.getElementById("pv-monto-apuesta");

  const deporte   = data.sport    || "Fútbol";
  const distrito  = data.district || "Miraflores";
  const fechaIso  = data.date     || "2025-01-11";
  const horaHHMM  = data.time     || "18:00";
  const jugadores = Number(data.players || 11);
  const desc      = data.desc     || "Partido amistoso de fútbol en el parque Kennedy. Buscamos jugadores para completar el equipo.";

  $sportName.textContent = deporte;
  $sportIcon.src = SPORT_ICONS[deporte] || SPORT_ICONS["Fútbol"];
  $distrito.textContent = distrito;
  $fecha.textContent = formatFechaISOaCorto(fechaIso);
  $hora.textContent  = formatHora(horaHHMM);
  $desc.textContent  = desc;
  $jugMax.textContent = jugadores;

  const pct = Math.max(8, Math.min(100, Math.round((1 / Math.max(jugadores,1)) * 100)));
  $bar.style.setProperty("--pct", pct + "%");

  const hayApuesta = data.bet === "yes" && Number(data.betAmount) > 0;
  $chipApuesta.style.display  = hayApuesta ? "inline-block" : "none";
  $montoApuesta.style.display = hayApuesta ? "inline-block" : "none";
  if (hayApuesta) $montoApuesta.textContent = `S/ ${Number(data.betAmount).toLocaleString("es-PE")}`;
})();

document.getElementById("btn-publicar")?.addEventListener("click", () => {
  alert("Demo: aquí conectarías la publicación con tu backend/API.");
});
