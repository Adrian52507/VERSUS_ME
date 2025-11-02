"use client";

import { useEffect } from "react"; // 👈 IMPORTANTE
import Image from "next/image";
import Link from "next/link";
import "@/styles/styles_index.css";

export default function Home() {
  // Función para desplazarse a la sección "somos"
  const scrollToSomos = () => {
    const section = document.getElementById("somos");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Animaciones de aparición (.revelar)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".revelar").forEach((el) => observer.observe(el));

    // FAQ interactivo
    const items = document.querySelectorAll(".faq-item");

    items.forEach((item) => {
      const head = item.querySelector(".faq-head") as HTMLElement | null;
      const body = item.querySelector(".faq-body") as HTMLElement | null;

      if (!head || !body) return;

      head.addEventListener("click", () => {
        const abierto = item.classList.toggle("abierto");
        head.setAttribute("aria-expanded", abierto ? "true" : "false");

        if (abierto) {
          body.hidden = false;
          const h = body.scrollHeight;
          body.style.maxHeight = h + "px";
        } else {
          body.style.maxHeight = body.scrollHeight + "px";
          requestAnimationFrame(() => {
            body.style.maxHeight = "0px";
          });
          body.addEventListener("transitionend", function onEnd() {
            if (!item.classList.contains("abierto")) body.hidden = true;
            body.removeEventListener("transitionend", onEnd);
          });
        }
      });
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* INTRO */}
      <section className="intro">
        <div className="intro-fondo"></div>

        <nav className="navbar">
          <div className="navbar-titulo">VersusMe</div>
          <div className="navbar-botones">
            <Link href="/registro">
              <button className="btn-registro">COMIENZA GRATIS</button>
            </Link>
            <Link href="/login">
              <button className="btn-login">INICIAR SESIÓN</button>
            </Link>
          </div>
        </nav>

        <div className="lema">
          <h1>TU DEPORTE,</h1>
          <h1>TU GENTE,</h1>
          <h1>TU APUESTA</h1>
          <button className="btn-empecemos" onClick={scrollToSomos}>
            EMPECEMOS
          </button>
        </div>
      </section>

      <div className="transition"></div>

      {/* SOMOS */}
      <section id="somos" className="somos container">
        <div className="revelar">
          <h2>SOMOS...</h2>
          <p>
            Una plataforma que une a los amantes del deporte en Lima. Nuestra misión es crear una
            comunidad vibrante donde cada persona pueda encontrar compañeros de juego, mantenerse
            activa y disfrutar del deporte en la ciudad que amamos.
          </p>
          <p className="subtitulo">Una plataforma hecha para Lima</p>
          <p>
            Entendemos la cultura deportiva limeña y hemos diseñado una experiencia que refleja
            nuestra pasión por el deporte y la comunidad. Desde Miraflores hasta San Juan de
            Lurigancho, conectamos jugadores en toda la ciudad.
          </p>
        </div>

        <div className="revelar">
          <Image
            src="/assets/img/img_index/chicosfutbol.png"
            alt="Jugadores felices"
            width={500}
            height={400}
          />
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="porque container">
        <h2 className="revelar">
          <span>¿POR QUÉ</span> VERSUS ME <span>?</span>
        </h2>
        <div className="cards">
          {[
            {
              icon: "check1.png",
              title: "Verificación de Usuarios",
              desc: "Todos nuestros usuarios pasan por un proceso de verificación para garantizar una comunidad segura.",
            },
            {
              icon: "escudo.png",
              title: "Ambiente Seguro",
              desc: "Promovemos el respeto y la deportividad en cada partido organizado a través de nuestra plataforma.",
            },
            {
              icon: "hombre.png",
              title: "Pasión por el deporte",
              desc: "Creado por deportistas para deportistas, entendemos lo que necesitas para disfrutar al máximo.",
            },
          ].map((c, i) => (
            <div key={i} className="card revelar">
              <div className="icon">
                <Image
                  src={`/assets/img/img_index/${c.icon}`}
                  alt={c.title}
                  width={50}
                  height={50}
                />
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="beneficios">
        <div className="container">
          <h2 className="beneficios-titulo revelar">BENEFICIOS DE LA PLATAFORMA</h2>
          <div className="beneficios-cards">
            {[
              {
                img: "home_beneficio_comunidad.png",
                icono: "grupo.png",
                title: "Comunidad local",
                desc: "Conecta con jugadores de tu distrito y forma parte de la comunidad deportiva más activa de Lima.",
              },
              {
                img: "home_beneficio_ubicacion.png",
                icono: "ubicaciones.png",
                title: "Ubicaciones Cercanas",
                desc: "Encuentra partidos en canchas cerca de ti en todos los distritos de Lima Metropolitana.",
              },
              {
                img: "home_beneficio_horario.png",
                icono: "calendario.png",
                title: "Horarios Flexibles",
                desc: "Organiza y únete a partidos que se adapten a tu horario, desde temprano en la mañana hasta la noche.",
              },
              {
                img: "home_beneficio_deporte.png",
                icono: "copa.png",
                title: "Todos los deportes",
                desc: "Fútbol, básquet, tenis, pádel, vóleibol, natación y más. Encuentra tu deporte favorito.",
              },
            ].map((b, i) => (
              <div key={i} className="card revelar">
                <Image
                  src={`/assets/img/img_index/${b.img}`}
                  alt={b.title}
                  width={350}
                  height={230}
                />
                <div className="icono">
                  <Image
                    src={`/assets/img/img_index/${b.icono}`}
                    alt={b.title}
                    width={40}
                    height={40}
                  />
                </div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="planes revelar">
        <div className="container">
          <h2 className="planes-titulo">
            ELIGE <span>TU PLAN</span>
          </h2>
          <p className="planes-sub">
            Comienza gratis y actualiza cuando estés listo para desbloquear todo el potencial de VersusMe
          </p>

          <div className="planes-grid">
            <article className="precio basic">
              <h3>Basic</h3>
              <div className="precio-monto gratis">Gratis</div>
              <p className="descripcion">Para siempre</p>
              <p className="explicacion">Perfecto para comenzar tu aventura deportiva</p>
              <h4>Incluye</h4>
              <ul className="lista">
                {[
                  "Hasta 2 partidos por semana",
                  "Acceso a deportes básicos",
                  "Perfil de jugador",
                  "Notificaciones por email",
                  "Soporte por chat",
                ].map((t, i) => (
                  <li key={i}>
                    <Image
                      className="check"
                      src="/assets/img/img_index/check2.png"
                      alt="check"
                      width={20}
                      height={20}
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-cta">Comienza Gratis</button>
            </article>

            <article className="precio pro destacado">
              <div className="badge">Más Popular</div>
              <h3>Pro</h3>
              <div className="precio-monto">
                <span className="moneda">S/</span>
                <span className="numero">5.00</span>
              </div>
              <div className="precio-detalle">
                <div className="linea">/mes</div>
                <div className="linea">o S/ 50/año (ahorras S/ 10)</div>
              </div>
              <p className="explicacion">Para los verdaderos amantes del deporte</p>
              <h4>Incluye</h4>
              <ul className="lista">
                {[
                  "Partidos ilimitados",
                  "Acceso a todos los deportes",
                  "Prioridad en partidos populares",
                  "Estadísticas avanzadas",
                  "Creación de grupos privados",
                  "Notificaciones push",
                  "Soporte prioritario 24/7",
                  "Descuentos en canchas afiliadas",
                ].map((t, i) => (
                  <li key={i}>
                    <Image
                      className="check"
                      src="/assets/img/img_index/check2.png"
                      alt="check"
                      width={20}
                      height={20}
                    />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <button className="btn-cta">Comienza Crack</button>
              <p className="nota">
                El primer mes es gratis • Cancela en cualquier momento • Sin compromisos
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FOOTER / CONTACTO */}
      <footer className="footer">
        <div className="footer-contenedor revelar">
          <div className="columna">
            <h3>VersusMe</h3>
            <p>
              La plataforma que conecta a los amantes del deporte en Lima. Únete a nuestra comunidad y
              descubre una nueva forma de mantenerte activo en la ciudad.
            </p>
            <div className="footer-item">
              <Image src="/assets/img/contactoyfoter/imglocation.png" alt="Ubicación" width={20} height={20} />
              <span>Lima, Perú - Todos los distritos</span>
            </div>
            <div className="footer-item">
              <Image src="/assets/img/contactoyfoter/imgemail.png" alt="Correo" width={20} height={20} />
              <a href="mailto:hola@versusme.com">hola@versusme.com</a>
            </div>
            <div className="footer-item">
              <Image src="/assets/img/contactoyfoter/imgphone.png" alt="Teléfono" width={20} height={20} />
              <span>+51 1 234-5678</span>
            </div>
            <div className="redes">
              <Image src="/assets/img/contactoyfoter/facebook.png" alt="Facebook" width={24} height={24} />
              <Image src="/assets/img/contactoyfoter/instagram.png" alt="Instagram" width={24} height={24} />
              <Image src="/assets/img/contactoyfoter/X.png" alt="X" width={24} height={24} />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}



