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

  amount.disabled = true;
  betNo.classList.add('active');


  betYes.addEventListener('click', () => {
    betYes.classList.add('active');
    betNo.classList.remove('active');
    amount.disabled = false;
    amount.focus();
    update();
  });
  betNo.addEventListener('click', () => {
    betNo.classList.add('active');
    betYes.classList.remove('active');
    amount.value = '';
    amount.disabled = true;
    update();
  });


  [sport, district, date, time, players, amount, desc].forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });

  function computeStatuses() {
    const sportDone    = !!sport.value;
    const locationDone = !!district.value;
    const datetimeDone = !!date.value && !!time.value;

    const playersNum   = parseInt(players.value, 10);
    const playersDone  = !isNaN(playersNum) && playersNum >= 2;

    const choseNo      = betNo.classList.contains('active');
    const choseYesAmt  = betYes.classList.contains('active') && parseFloat(amount.value) > 0;
    const betDone      = choseNo || choseYesAmt;

    const descDone     = desc.value.trim().length > 0;

    return [sportDone, locationDone, datetimeDone, playersDone, betDone, descDone];
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
    bar.style.width = pct + '%';

    count.textContent = `${done}/${total} completado`;

    paintDots(statuses);
  }

  update();
})();
