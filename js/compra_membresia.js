const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const profile = document.getElementById("profileMenu");
const dropdown = document.getElementById("dropdownMenu");

// Abrir/cerrar menú móvil
menuToggle.addEventListener("click", (e) => {
menuToggle.classList.toggle("active");
navLinks.classList.toggle("show");
e.stopPropagation();
});

// Mostrar/ocultar dropdown perfil
profile.addEventListener("click", (e) => {
dropdown.classList.toggle("show");
e.stopPropagation();
});

// Cerrar menús al hacer click fuera
document.addEventListener("click", () => {
dropdown.classList.remove("show");
navLinks.classList.remove("show");
menuToggle.classList.remove("active");
});
// --- Validar campo CVC ---
const cvcInput = document.querySelector('.iconcvc');

if (cvcInput) {
  cvcInput.addEventListener('input', () => {
    // Eliminar todo lo que no sea número
    cvcInput.value = cvcInput.value.replace(/\D/g, '');

    // Limitar a máximo 3 dígitos
    if (cvcInput.value.length > 3) {
      cvcInput.value = cvcInput.value.slice(0, 3);
    }
  });
}
