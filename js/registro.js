// Toggle de contraseña con cambio de icono
(() => {
  const icons = document.querySelectorAll('.input-wrap .ojo');
  if (!icons.length) return;

  icons.forEach((icon) => {
    const wrap  = icon.closest('.input-wrap');
    if (!wrap) return;

    const input = wrap.querySelector('input[type="password"], input[type="text"]');
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

// Validación
(() => {
  const pass    = document.getElementById('reg-pass');
  const rulesEl = document.getElementById('pw-rules');
  const submit  = document.querySelector('.btn-submit');
  if (!pass || !rulesEl) return;

  const items = {
    len:     rulesEl.querySelector('li[data-rule="len"]'),
    upper:   rulesEl.querySelector('li[data-rule="upper"]'),
    lower:   rulesEl.querySelector('li[data-rule="lower"]'),
    digit:   rulesEl.querySelector('li[data-rule="digit"]'),
    symbol:  rulesEl.querySelector('li[data-rule="symbol"]'),
    nospace: rulesEl.querySelector('li[data-rule="nospace"]'),
  };

  const hasUpper  = s => /[A-Z]/.test(s);
  const hasLower  = s => /[a-z]/.test(s);
  const hasDigit  = s => /\d/.test(s);
  const hasSymbol = s => /[^A-Za-z0-9\s]/.test(s);

  function evaluate() {
    const v = pass.value;

    const state = {
      len:     v.length >= 8,
      upper:   hasUpper(v),
      lower:   hasLower(v),
      digit:   hasDigit(v),
      symbol:  hasSymbol(v),
      nospace: !/\s/.test(v),
    };

    Object.entries(state).forEach(([key, ok]) => {
      items[key]?.classList.toggle('ok', ok);
    });

    const allOk = Object.values(state).every(Boolean);
    if (submit) submit.disabled = !allOk;
    if (submit) submit.style.opacity = allOk ? '1' : '.6';
    if (submit) submit.style.cursor  = allOk ? 'pointer' : 'not-allowed';
  }

  pass.addEventListener('input', evaluate);
  evaluate();
})();

// BONUS: Guardar correo y redirigir a verificación
(() => {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('reg-email'); // asegúrate de que tu input del correo tenga este id

  if (!form || !emailInput) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const correo = emailInput.value.trim();

    if (correo === "") {
      alert("Por favor, ingresa tu correo electrónico.");
      return;
    }

    // Guardamos el correo temporalmente
    localStorage.setItem("correoUsuario", correo);

    // Redirigimos a la página de verificación
    window.location.href = "verificacion.html";
  });
})();
