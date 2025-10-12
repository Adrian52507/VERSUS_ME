// Toggle de contraseña con cambio de icono
(function () {
  const icons = document.querySelectorAll('.input-wrap .ojo');

  icons.forEach(icon => {
    const wrap = icon.closest('.input-wrap');
    if (!wrap) return;
    const input = wrap.querySelector('input');
    if (!input) return;

    const openSrc   = icon.getAttribute('data-eye-open')   || icon.src;
    const closedSrc = icon.getAttribute('data-eye-closed') || icon.src;

    icon.setAttribute('role', 'button');
    icon.setAttribute('tabindex', '0');
    icon.setAttribute('aria-pressed', 'false');
    icon.setAttribute('title', 'Mostrar contraseña');

    let visible = false;

    const apply = () => {
      input.type = visible ? 'text' : 'password';
      icon.src = visible ? closedSrc : openSrc;
      icon.setAttribute('aria-pressed', String(visible));
      icon.setAttribute('title', visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
    };

    const toggle = () => {
      visible = !visible;
      apply();
      input.focus({ preventScroll: true });
    };

    icon.addEventListener('click', toggle);
    icon.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
    apply();
  });
})();
