
(function () {
  const cards = document.querySelectorAll('.card');

  function setPct(bar, pct){
    bar.style.setProperty('--pct', Math.min(100, Math.max(0, pct)) + '%');
  }

  function updateCard(card){
    const curEl = card.querySelector('.cupos .cur');
    const maxEl = card.querySelector('.cupos .max');
    const bar   = card.querySelector('.progress .bar');
    const estado= card.querySelector('.estado');
    const btn   = card.querySelector('.btn-unirse');

    if(!curEl || !maxEl || !bar || !btn) return;

    const cur = Number(curEl.textContent.trim());
    const max = Number(maxEl.textContent.trim());
    const pct = Math.round((cur / max) * 100);
    setPct(bar, pct);

    const full = cur >= max;
    if (estado){
      estado.textContent = full ? 'Completo' : 'Disponible';
      estado.classList.toggle('completo', full);
      estado.classList.toggle('disponible', !full);
    }
    btn.disabled = full;
    btn.classList.toggle('outline', full);
  }

  cards.forEach(card => {
    updateCard(card);

    const btn = card.querySelector('.btn-unirse');
    const curEl = card.querySelector('.cupos .cur');
    const maxEl = card.querySelector('.cupos .max');
    if(!btn || !curEl || !maxEl) return;

    btn.addEventListener('click', () => {
      const cur = Number(curEl.textContent.trim());
      const max = Number(maxEl.textContent.trim());
      if(cur < max){
        curEl.textContent = String(cur + 1);
        updateCard(card);
      }
    });
  });

const [tabDisp, tabAcpt] = document.querySelectorAll('.tab');
const availableWrap = document.querySelector('.available-wrap');
const acceptedWrap  = document.querySelector('.accepted-wrap');

function show(which){
  if(which === 'accepted'){
    acceptedWrap.classList.remove('hidden');
    availableWrap.classList.add('hidden');
    tabAcpt.classList.add('active');
    tabDisp.classList.remove('active');
  }else{
    availableWrap.classList.remove('hidden');
    acceptedWrap.classList.add('hidden');
    tabDisp.classList.add('active');
    tabAcpt.classList.remove('active');
  }
}

tabDisp.addEventListener('click', () => show('available'));
tabAcpt.addEventListener('click', () => show('accepted'));

})();
