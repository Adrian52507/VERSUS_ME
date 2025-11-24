"use client";

import Topbar from "@/components/Topbar";

export default function IA() {
    return (
        <>
            <Topbar />

            <div className="max-w-3xl mx-auto mt-16 px-6 text-center text-white">
                <h1 className="text-4xl font-bold mb-4">IA en desarrollo</h1>

                <p className="text-lg text-white/70 leading-relaxed">
                    Estamos trabajando en integrar un sistema de Inteligencia Artificial que podrá 
                    recomendarte rutinas personalizadas, dietas optimizadas y planes de entrenamiento 
                    basados en tu perfil y objetivos.
                </p>

                <p className="text-lg text-white/70 mt-4">
                    Esta función estará disponible próximamente. ¡Gracias por tu paciencia!
                </p>

                <div className="mt-10">
                    <span className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm backdrop-blur-sm">
                        🚀 Próximamente en Versus<strong className="text-green-400">Me</strong>
                    </span>
                </div>
            </div>
        </>
    );
}
