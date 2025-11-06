// Esperar a que todo el DOM cargue antes de ejecutar
document.addEventListener('DOMContentLoaded', function() {

  // ========= LÓGICA DE VOTACIÓN =========
  const botonesVotar = document.querySelectorAll('.btn-votar');
  const votosEquipo = document.querySelectorAll('.contador-votos p');
  let votos = [0, 0]; // valores iniciales como en el HTML

  botonesVotar.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      votos[index]++; // sumar voto
      votosEquipo[index].textContent = `★ Votos Equipo : ${votos[index]}`;
    });
  });

  // ========= LÓGICA DE SELECCIÓN Y MODALES =========
  const botonesSeleccionar = document.querySelectorAll('.btn-seleccionar');
  const modalDevolucion = document.getElementById('modal-devolucion');
  const modalDesacuerdo = document.getElementById('modal-desacuerdo');

  botonesSeleccionar.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      if (index === 0) {
        // Primer botón -> devolución
        modalDevolucion.style.display = 'flex';
      } else if (index === 1) {
        // Segundo botón -> desacuerdo
        modalDesacuerdo.style.display = 'flex';
      }
    });
  });

  // Cerrar modales
  document.querySelectorAll('.cerrar-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').style.display = 'none';
    });
  });

  // Cerrar modal al hacer clic fuera del contenido
  window.addEventListener('click', function(e){
    if(e.target.classList.contains('modal')){
      e.target.style.display = 'none';
    }
  });

  // ========= LÓGICA DE SUBIR VIDEO =========
  const cajaVideo = document.getElementById('cajaVideo');
  const inputVideo = document.getElementById('inputVideo');

  cajaVideo.addEventListener('click', () => {
    inputVideo.click(); // abrir explorador de archivos
  });

  inputVideo.addEventListener('change', () => {
    if (inputVideo.files.length > 0) {
      const nombreArchivo = inputVideo.files[0].name;
      alert(`Video "${nombreArchivo}" subido correctamente ✅`);
    }
  });

  // ========= ENVIAR FORMULARIO DE DESACUERDO =========
  const btnEnviarFinal = document.querySelector('.btn-enviar-final');

  btnEnviarFinal.addEventListener('click', () => {
    alert("Gracias, la información ha sido enviada correctamente.");
    modalDesacuerdo.style.display = 'none';
    inputVideo.value = ""; // limpiar video
    document.getElementById('descripcion').value = ""; // limpiar descripción
  });

});
