// === Simulación: correo del usuario guardado ===
const correoUsuario = localStorage.getItem("correoUsuario") || "usuario@versusme.com";
document.getElementById("correo-mostrado").textContent = correoUsuario;

// === Inputs de verificación ===
const inputs = document.querySelectorAll(".codigo-input");
const form = document.getElementById("form-codigo");

// Mover foco automáticamente
inputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) {
      e.target.value = ""; // Solo números
      return;
    }

    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

    // Si todos los campos tienen valor, permitir enviar
    const filled = Array.from(inputs).every(i => i.value !== "");
    form.querySelector(".btn-submit").disabled = !filled;
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

// === Sistema de notificaciones tipo toast ===
function mostrarToast(mensaje, tipo = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// === Enviar el formulario ===
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const codigo = Array.from(inputs).map(i => i.value).join("");

  if (codigo.length === 6) {
    mostrarToast(`Código ${codigo} verificado correctamente.`, "success");
    // Aquí podrías redirigir al home
    // window.location.href = "home.html";
  } else {
    mostrarToast("Código inválido. Verifica e inténtalo nuevamente.", "error");
  }
});

// === Reenviar código ===
document.querySelector(".reenviar").addEventListener("click", (e) => {
  e.preventDefault();
  mostrarToast("Se ha reenviado el código al correo " + correoUsuario, "info");
});