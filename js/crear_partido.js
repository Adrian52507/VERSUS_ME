/* ===========================
   MAPA (igual que tenías)
=========================== */
(function () {
  const START = [-12.0835, -76.9699];
  const map = L.map('map', { zoomControl: true }).setView(START, 14);
  let marker;

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  map.on('click', (e) => setMarker(e.latlng.lat, e.latlng.lng));

  function setMarker(lat, lng, label) {
    if (marker) marker.remove();
    marker = L.marker([lat, lng]).addTo(map);
    if (label) marker.bindPopup(label).openPopup();
  }

  const input = document.getElementById('map-search');
  const btn = document.getElementById('search-btn');

  async function searchPlace() {
    const q = (input.value || '').trim();
    if (!q) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(q)}`;
    try {
      const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
      const data = await res.json();
      if (!data.length) return alert('No se encontró esa ubicación');
      const { lat, lon, display_name } = data[0];
      map.setView([lat, lon], 15);
      setMarker(parseFloat(lat), parseFloat(lon), display_name);
    } catch (e) {
      console.error(e);
      alert('Error buscando la dirección');
    }
  }

  btn.addEventListener('click', searchPlace);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); searchPlace(); }
  });
})();

/* ======================================
   FORM / PROGRESO + LÍMITE DESCRIPCIÓN
====================================== */
(function () {
  const bar   = document.querySelector('.progress-bar');
  const count = document.querySelector('.progress-count');
  const dots  = Array.from(document.querySelectorAll('.progress-steps .dot'));

  const sport    = document.getElementById('sport');
  const district = document.getElementById('district');
  const date     = document.getElementById('date');
  const time     = document.getElementById('time');
  const players  = document.getElementById('players');
  const betYes   = document.getElementById('bet-yes');
  const betNo    = document.getElementById('bet-no');
  const amount   = document.querySelector('.bet-amount input');
  const desc     = document.getElementById('desc');

  // Botón Vista Previa
  const btnPreview = document.querySelector(".actions .btn-primary");

  // === Límite duro de descripción desde JS ===
  const MAX_DESC = 100;
  if (desc) {
    desc.removeAttribute('maxlength');
    const clampDesc = () => {
      if (desc.value.length > MAX_DESC) {
        desc.value = desc.value.slice(0, MAX_DESC);
      }
    };
    desc.addEventListener('input', clampDesc);
    clampDesc();
  }

  // Apuesta: estado inicial
  amount.disabled = true;
  betNo.classList.add('active');

  betYes?.addEventListener('click', () => {
    betYes.classList.add('active');
    betNo.classList.remove('active');
    amount.disabled = false;
    amount.focus();
    update();
  });
  betNo?.addEventListener('click', () => {
    betNo.classList.add('active');
    betYes.classList.remove('active');
    amount.value = '';
    amount.disabled = true;
    update();
  });

  [sport, district, date, time, players, amount, desc].forEach(el => {
    el?.addEventListener('input', update);
    el?.addEventListener('change', update);
  });

  function computeStatuses() {
    const sportDone    = !!sport?.value;
    const locationDone = !!district?.value;
    const datetimeDone = !!date?.value && !!time?.value;

    const playersNum   = parseInt(players?.value ?? '', 10);
    const playersDone  = !isNaN(playersNum) && playersNum >= 2;

    const choseNo      = betNo?.classList.contains('active');
    const choseYesAmt  = betYes?.classList.contains('active') && parseFloat(amount?.value || '0') > 0;
    const betDone      = !!(choseNo || choseYesAmt);

    const descDone     = !!(desc && desc.value.trim().length > 0);

    return [sportDone, locationDone, datetimeDone, playersDone, betDone, descDone];
  }

  function isFormComplete() {
    return computeStatuses().every(Boolean);
  }

  function paintDots(statuses) {
    statuses.forEach((ok, i) => {
      const dot = dots[i];
      if (!dot) return;
      dot.classList.toggle('is-done', !!ok);
    });
  }

  function update() {
    const statuses = computeStatuses();
    const done  = statuses.filter(Boolean).length;
    const total = statuses.length;

    const pct = (done / total) * 100;
    if (bar) bar.style.width = pct + '%';
    if (count) count.textContent = `${done}/${total} completado`;

    paintDots(statuses);

    // Habilitar/deshabilitar el botón de Vista Previa
    const completo = done === total;
    if (btnPreview) {
      btnPreview.disabled = !completo;        // bloquea la interacción
      btnPreview.style.opacity = completo ? "1" : "0.6";  // feedback visual suave
      btnPreview.style.pointerEvents = completo ? "auto" : "none"; // "como imagen"
    }
  }

  update();

  // --- Guardar y navegar a vista_previa ---
  btnPreview?.addEventListener("click", () => {
    // Si no está completo, no hace nada
    if (!isFormComplete()) return;

    const descripcionSegura = desc ? desc.value.slice(0, MAX_DESC) : "";

    const data = {
      sport:    document.getElementById("sport")?.value || "",
      district: document.getElementById("district")?.value || "",
      date:     document.getElementById("date")?.value || "",
      time:     document.getElementById("time")?.value || "",
      players:  document.getElementById("players")?.value || "",
      desc:     descripcionSegura,
      bet:      document.getElementById("bet-yes")?.classList.contains("active") ? "yes" : "no",
      betAmount: document.querySelector(".bet-amount input")?.value || ""
    };
    sessionStorage.setItem("vm_crear_partido", JSON.stringify(data));
    window.location.href = "vista_previa.html";
  });
})();
