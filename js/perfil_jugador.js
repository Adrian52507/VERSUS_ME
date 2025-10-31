document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // 1️⃣ MENÚ DESPLEGABLE PERFIL
  // =========================
  const profileMenu = document.getElementById("profileMenu");
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (profileMenu && dropdownMenu) {
    profileMenu.addEventListener("click", (e) => {
      e.stopPropagation(); // evita que el clic se propague
      dropdownMenu.classList.toggle("show");
    });

    // Cierra el menú si haces clic fuera
    document.addEventListener("click", (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== profileMenu) {
        dropdownMenu.classList.remove("show");
      }
    });
  }

  // =========================
  // 2️⃣ CAMBIAR FOTO DE PERFIL
  // =========================
  const iconoEditarPerfil = document.querySelector(".icono-editar");
  const imgPerfil = document.querySelector(".foto-perfil img");

  if (iconoEditarPerfil && imgPerfil) {
    const inputPerfil = document.createElement("input");
    inputPerfil.type = "file";
    inputPerfil.accept = "image/*";
    inputPerfil.style.display = "none";
    document.body.appendChild(inputPerfil);

    iconoEditarPerfil.addEventListener("click", (e) => {
      e.stopPropagation();
      inputPerfil.click();
    });

    inputPerfil.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          imgPerfil.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // =========================
  // 3️⃣ CAMBIAR FOTO DE PORTADA
  // =========================
  const btnEditarPortada = document.querySelector(".btn-editar-portada");
  const imgPortada = document.querySelector(".foto-portada");

  if (btnEditarPortada && imgPortada) {
    const inputPortada = document.createElement("input");
    inputPortada.type = "file";
    inputPortada.accept = "image/*";
    inputPortada.style.display = "none";
    document.body.appendChild(inputPortada);

    btnEditarPortada.addEventListener("click", (e) => {
      e.stopPropagation();
      inputPortada.click();
    });

    inputPortada.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          imgPortada.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // =========================
  // 4️⃣ MOSTRAR RANGO DE ESTRELLAS (PROMEDIO)
  // =========================
  const ratingContainer = document.querySelector(".rating");
  if (ratingContainer) {
    const stars = ratingContainer.querySelectorAll(".star");
    const ratingValue = parseFloat(ratingContainer.dataset.rating);
    const label = ratingContainer.querySelector(".valor-rating");

    stars.forEach((star) => {
      const starValue = parseInt(star.dataset.value);
      if (ratingValue >= starValue) {
        star.classList.add("active"); // estrella completa
      } else if (ratingValue >= starValue - 0.5) {
        star.classList.add("half"); // media estrella
      }
    });

    //if (label) label.textContent = `Puntaje: ${ratingValue.toFixed(1)}/5`;
  }

  // =========================
  // 5️⃣ BOTÓN DE EDITAR INFO (TEMPORAL)
  // =========================
  const btnEditar = document.querySelector(".btn-editar-info");
  if (btnEditar) {
    btnEditar.addEventListener("click", () => {
      alert("Función para editar la información próximamente disponible 🛠️");
    });
  }
});