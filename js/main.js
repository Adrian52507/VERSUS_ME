
function scrollToSomos() {
  const section = document.getElementById("somos");
  if (section) section.scrollIntoView({ behavior: "smooth" });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.revelar').forEach((el) => observer.observe(el));

(function initFAQ(){
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const head = item.querySelector('.faq-head');
    const body = item.querySelector('.faq-body');

    if (!head || !body) return;

    head.addEventListener('click', () => {
      const abierto = item.classList.toggle('abierto');
      head.setAttribute('aria-expanded', abierto ? 'true' : 'false');

      // Animación de altura
      if (abierto) {
        body.hidden = false;
        const h = body.scrollHeight;
        body.style.maxHeight = h + 'px';
      } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        requestAnimationFrame(() => {
          body.style.maxHeight = '0px';
        });
        body.addEventListener('transitionend', function onEnd(){
          if (!item.classList.contains('abierto')) body.hidden = true;
          body.removeEventListener('transitionend', onEnd);
        });
      }
    });
  });
})();
