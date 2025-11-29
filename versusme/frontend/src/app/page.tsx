"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revelar-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".revelar").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white">

      {/* NAVBAR MINIMALISTA */}
      <nav className="fixed top-0 w-full z-30 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="text-xl md:text-2xl font-semibold text-white tracking-wide">
            Versus<span className="text-[#25C50E]">Me</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex gap-4">
            <Link href="/registro">
              <button className="px-5 py-2 rounded-md bg-[#25C50E] text-black font-medium hover:bg-[#1ea90c] transition">
                Registrarse
              </button>
            </Link>

            <Link href="/login">
              <button className="px-5 py-2 rounded-md border border-[#25C50E] text-[#25C50E] hover:bg-[#25C50E] hover:text-black transition">
                Iniciar Sesión
              </button>
            </Link>
          </div>

          {/* Mobile */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => {
              const m = document.getElementById("mobileMenu");
              m?.classList.toggle("hidden");
            }}
          >
            ☰
          </button>

        </div>

        {/* Mobile menu */}
        <div id="mobileMenu" className="hidden md:hidden bg-black/90 border-t border-white/10">
          <div className="px-6 py-4 flex flex-col gap-3">
            <Link href="/registro">
              <button className="w-full px-5 py-3 rounded-md bg-[#25C50E] text-black font-medium hover:bg-[#1ea90c] transition">
                Registrarse
              </button>
            </Link>

            <Link href="/login">
              <button className="w-full px-5 py-3 rounded-md border border-[#25C50E] text-[#25C50E] hover:bg-[#25C50E] hover:text-black transition">
                Iniciar Sesión
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO MINIMALISTA */}
      <section className="h-screen flex flex-col justify-center items-center text-center bg-black px-6 pt-32">

        <h1 className="font-[Bebas_Neue] text-white text-6xl md:text-8xl tracking-wide leading-[0.95]">
          TU DEPORTE,
        </h1>

        <h1 className="font-[Bebas_Neue] text-white text-6xl md:text-8xl tracking-wide leading-[0.95]">
          TU GENTE,
        </h1>

        <h1 className="font-[Bebas_Neue] text-[#25C50E] text-6xl md:text-8xl tracking-wide leading-[0.95]">
          TU APUESTA
        </h1>

        <Link href="#somos">
          <button className="mt-10 px-10 py-3 border border-[#25C50E] text-[#25C50E] rounded-md text-lg hover:bg-[#25C50E] hover:text-black transition">
            Conocer más
          </button>
        </Link>

      </section>

      {/* SOMOS — MINIMALISTA DARK UI PRO */}
      <section
        id="somos"
        className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center"
      >

        {/* Texto */}
        <div className="space-y-6">

          <h2 className="text-4xl md:text-5xl font-[Bebas_Neue] text-white tracking-wide">
            SOMOS
            <span className="text-[#25C50E]"> VERSUSME</span>
          </h2>

          <p className="text-gray-300 leading-relaxed text-lg">
            Una plataforma que une a los amantes del deporte en Lima para jugar, competir
            y mantenerse activos. Queremos que más personas puedan encontrar compañeros,
            amistades y experiencias deportivas reales.
          </p>

          <p className="text-[#25C50E] font-semibold text-lg">
            Diseñado especialmente para la comunidad deportiva limeña.
          </p>

          <p className="text-gray-300 leading-relaxed">
            Desde Miraflores hasta San Juan de Lurigancho, nuestra misión es conectar
            jugadores en todos los distritos de Lima. Creamos un espacio seguro donde
            puedas organizar partidos, unirte a nuevos grupos y descubrir nuevos deportes.
          </p>

        </div>

        {/* Imagen */}
        <div className="flex justify-center">
          <Image
            src="/assets/img/img_index/chicosfutbol.png"
            alt="Jugadores"
            width={500}
            height={400}
            className="rounded-xl border border-white/10"
          />
        </div>

      </section>

      {/* POR QUÉ — MINIMALISTA DARK UI PRO */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">

        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-[Bebas_Neue] text-white tracking-wide mb-14">
          ¿POR QUÉ <span className="text-[#25C50E]">VERSUSME</span>?
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Card 1 */}
          <div className="p-8 bg-white/5 border border-white/10 rounded-xl text-center space-y-4">
            <Image
              src="/assets/img/img_index/check1.png"
              alt="Verificación"
              width={50}
              height={50}
              className="mx-auto opacity-90"
            />
            <h3 className="text-white text-2xl font-semibold">Verificación de Usuarios</h3>
            <p className="text-gray-300 leading-relaxed">
              Todos los usuarios pasan por un proceso de validación para garantizar una comunidad segura
              y confiable.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-white/5 border border-white/10 rounded-xl text-center space-y-4">
            <Image
              src="/assets/img/img_index/escudo.png"
              alt="Seguridad"
              width={50}
              height={50}
              className="mx-auto opacity-90"
            />
            <h3 className="text-white text-2xl font-semibold">Ambiente Seguro</h3>
            <p className="text-gray-300 leading-relaxed">
              Promovemos el respeto y la deportividad en cada encuentro organizado dentro de nuestra plataforma.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-white/5 border border-white/10 rounded-xl text-center space-y-4">
            <Image
              src="/assets/img/img_index/hombre.png"
              alt="Pasión"
              width={50}
              height={50}
              className="mx-auto opacity-90"
            />
            <h3 className="text-white text-2xl font-semibold">Pasión por el Deporte</h3>
            <p className="text-gray-300 leading-relaxed">
              Somos deportistas creando una herramienta para deportistas. Entendemos lo que realmente
              necesitas para disfrutar al máximo.
            </p>
          </div>

        </div>
      </section>

      {/* BENEFICIOS — MINIMALISTA DARK UI PRO */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">

        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-[Bebas_Neue] text-white tracking-wide mb-14">
          BENEFICIOS DE <span className="text-[#25C50E]">LA PLATAFORMA</span>
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Beneficio 1 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center space-y-4">
            <Image
              src="/assets/img/img_index/home_beneficio_comunidad.png"
              alt="Comunidad"
              width={300}
              height={180}
              className="rounded-lg object-cover"
            />
            <Image
              src="/assets/img/img_index/grupo.png"
              alt="icono"
              width={40}
              height={40}
              className="opacity-90"
            />
            <h3 className="text-white font-semibold text-xl">Comunidad local</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Conecta con jugadores de tu distrito y forma parte de la comunidad deportiva más activa de Lima.
            </p>
          </div>

          {/* Beneficio 2 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center space-y-4">
            <Image
              src="/assets/img/img_index/home_beneficio_ubicacion.png"
              alt="Ubicación"
              width={300}
              height={180}
              className="rounded-lg object-cover"
            />
            <Image
              src="/assets/img/img_index/ubicaciones.png"
              alt="icono"
              width={40}
              height={40}
              className="opacity-90"
            />
            <h3 className="text-white font-semibold text-xl">Ubicaciones cercanas</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Encuentra partidos cerca de ti en todos los distritos de Lima Metropolitana.
            </p>
          </div>

          {/* Beneficio 3 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center space-y-4">
            <Image
              src="/assets/img/img_index/home_beneficio_horario.png"
              alt="Horarios"
              width={300}
              height={180}
              className="rounded-lg object-cover"
            />
            <Image
              src="/assets/img/img_index/calendario.png"
              alt="icono"
              width={40}
              height={40}
              className="opacity-90"
            />
            <h3 className="text-white font-semibold text-xl">Horarios flexibles</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Organiza y únete a partidos que se adapten a tu disponibilidad diaria.
            </p>
          </div>

          {/* Beneficio 4 */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center space-y-4">
            <Image
              src="/assets/img/img_index/home_beneficio_deporte.png"
              alt="Deportes"
              width={300}
              height={180}
              className="rounded-lg object-cover"
            />
            <Image
              src="/assets/img/img_index/copa.png"
              alt="icono"
              width={40}
              height={40}
              className="opacity-90"
            />
            <h3 className="text-white font-semibold text-xl">Todos los deportes</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Fútbol, básquet, tenis, pádel, vóleibol, natación y más. Encuentra tu actividad favorita.
            </p>
          </div>

        </div>
      </section>

      {/* PLANES — MINIMALISTA DARK UI PRO */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">

        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-[Bebas_Neue] text-white tracking-wide mb-6">
          ELIGE TU <span className="text-[#25C50E]">PLAN</span>
        </h2>

        <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-16">
          Comienza gratis y actualiza cuando estés listo para desbloquear todo el potencial de VersusMe.
        </p>

        {/* Grid de planes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* PLAN BASIC */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-left flex flex-col">
            <h3 className="text-3xl font-semibold text-white mb-2">Basic</h3>
            <p className="text-gray-400 mb-6">Perfecto para comenzar tu aventura deportiva.</p>

            {/* Precio */}
            <div className="text-5xl font-bold text-white mb-6">Gratis</div>

            {/* Features */}
            <ul className="text-gray-300 space-y-3 mb-10">
              {[
                "Crea 1 partido por semana",
                "Únete a un partido por semana",
                "Subida de imágenes como foto de perfil y portada",
                "Funcionalidades estándar de la plataforma",
                "Notificaciones por email",
                "Soporte por chat",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#25C50E] font-bold">•</span>
                  {t}
                </li>
              ))}
            </ul>

            {/* Botón */}
            <Link href="/registro" className="mt-auto">
              <button className="w-full px-6 py-3 bg-[#25C50E] text-black font-semibold rounded-lg hover:bg-[#1ea90c] transition">
                Comienza Gratis
              </button>
            </Link>
          </div>

          {/* PLAN PRO */}
          <div className="bg-[#111]/80 border border-[#25C50E]/40 rounded-2xl p-10 text-left flex flex-col relative">

            {/* Badge */}
            <div className="absolute top-0 right-0 bg-[#25C50E] text-black font-semibold text-xs px-3 py-1 rounded-bl-lg">
              MÁS POPULAR
            </div>

            <h3 className="text-3xl font-semibold text-white mb-2">Pro</h3>
            <p className="text-gray-400 mb-6">Para los verdaderos amantes del deporte.</p>

            {/* Precio */}
            <div className="text-white mb-2">
              <span className="text-3xl font-semibold">$</span>
              <span className="text-5xl font-bold"> 5.00</span>
            </div>
            <p className="text-gray-500 mb-6">por mes o $ 50 /año (ahorras $ 10)</p>

            {/* Features */}
            <ul className="text-gray-300 space-y-3 mb-10">
              {[
                "Unión y creación a partidos ilimitados",
                "Prioridad en partidos populares",
                "Subir fotos, videos, GIFs y animaciones en tu perfil",
                "Creación de grupos privados",
                "Notificaciones push",
                "Soporte prioritario 24/7",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#25C50E] font-bold">•</span>
                  {t}
                </li>
              ))}
            </ul>

            {/* Botón */}
            <Link href="/registro" className="mt-auto">
              <button className="w-full px-6 py-3 border border-[#25C50E] text-[#25C50E] font-semibold rounded-lg hover:bg-[#25C50E] hover:text-black transition">
                Comienza Pro
              </button>
            </Link>
          </div>

        </div>

      </section>

      {/* FOOTER — MINIMALISTA DARK UI PRO */}
      <footer className="w-full bg-black border-t border-white/10 mt-20">

        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Columna 1 — Marca */}
          <div>
            <h3 className="text-2xl font-semibold text-white tracking-wide">
              Versus<span className="text-[#25C50E]">Me</span>
            </h3>

            <p className="text-gray-400 mt-4 leading-relaxed">
              La plataforma que conecta a los amantes del deporte en Lima. Encuentra compañeros
              para jugar, competir y disfrutar del deporte en tu distrito.
            </p>

            <p className="text-gray-500 mt-6 text-sm">
              Lima, Perú — Todos los distritos
            </p>
          </div>

          {/* Columna 2 — Contacto */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Contacto</h4>

            <div className="space-y-4 text-gray-300">

              <div className="flex items-center gap-3">
                <Image
                  src="/assets/img/contactoyfoter/imgemail.png"
                  alt="email"
                  width={22}
                  height={22}
                  className="opacity-80"
                />
                <a
                  href="mailto:versusme.general@gmail.com"
                  className="hover:text-[#25C50E] transition"
                >
                  versusme.general@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Image
                  src="/assets/img/contactoyfoter/imgphone.png"
                  alt="phone"
                  width={22}
                  height={22}
                  className="opacity-80"
                />
                <span>+51 964 825 187</span>
              </div>

            </div>
          </div>

          {/* Columna 3 — Redes */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Síguenos</h4>

            <div className="flex gap-4">

              {[
                { img: "facebook.png", alt: "Facebook" },
                { img: "instagram.png", alt: "Instagram" },
                { img: "X.png", alt: "X" },
              ].map((r, i) => (
                <Link key={i} href="/proximamente" target="_blank">
                  <Image
                    src={`/assets/img/contactoyfoter/${r.img}`}
                    alt={r.alt}
                    width={28}
                    height={28}
                    className="opacity-90 hover:opacity-70 transition"
                  />
                </Link>
              ))}

            </div>
          </div>

        </div>

        {/* Línea final */}
        <div className="border-t border-white/10 py-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} VersusMe — Todos los derechos reservados
          </p>
        </div>

      </footer>


    </div>
  );
}
