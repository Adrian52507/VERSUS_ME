"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

interface WizardForm {
    sport: string;
    district: string;
    locationText: string;
    lat: number | null;
    lng: number | null;
    date: string;
    time: string;
    players: string;
    hasBet: boolean;
    betAmount: string;
    desc: string;
}

interface WizardContextProps {
    form: WizardForm;
    setForm: (f: Partial<WizardForm>) => void;
    step: number;
    setStep: (n: number) => void;
    totalSteps: number;
    errors: Record<string, string>;
    validateStep: (step: number) => boolean;
    sendToBackend: () => Promise<boolean>;
}

const WizardContext = createContext<WizardContextProps | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    /* ==========================
       FORMULARIO
    =========================== */
    const [form, setFormState] = useState<WizardForm>({
        sport: "",
        district: "",
        locationText: "",
        lat: null,
        lng: null,
        date: "",
        time: "",
        players: "",
        hasBet: false,
        betAmount: "",
        desc: "",
    });

    const setForm = (data: Partial<WizardForm>) => {
        setFormState((prev) => ({ ...prev, ...data }));
    };

    /* ==========================
       STEPS
    =========================== */
    const [step, setStep] = useState(1);
    const totalSteps = 7;

    /* ==========================
       ERRORES
    =========================== */
    const [errors, setErrors] = useState<Record<string, string>>({});

    /* ==========================
       VALIDACIÓN
    =========================== */
    const validateStep = (currentStep: number): boolean => {
        let err: Record<string, string> = {};

        switch (currentStep) {
            case 1:
                if (!form.sport) err.sport = "Debes elegir un deporte";
                break;

            case 2:
                if (!form.district) err.district = "Debes seleccionar un distrito";
                break;

            case 3:
                if (!form.locationText.trim())
                    err.locationText = "Escribe una ubicación";
                if (form.lat === null || form.lng === null)
                    err.map = "Selecciona un punto en el mapa";
                break;

            case 4:
                if (!form.date) err.date = "Selecciona una fecha";
                if (!form.time) err.time = "Selecciona una hora";

                const hoy = new Date();
                const fechaSel = new Date(form.date + "T00:00");

                if (form.date && fechaSel < new Date(hoy.toDateString()))
                    err.date = "La fecha no puede ser anterior a hoy";
                break;

            case 5:
                const num = Number(form.players);
                if (!num) err.players = "Ingresa un número válido";
                else if (num < 2) err.players = "Debe haber al menos 2 jugadores";
                else if (num > 50) err.players = "Máximo permitido: 50 jugadores";
                break;

            case 6:
                if (form.hasBet) {
                    const monto = Number(form.betAmount);
                    if (!monto || monto <= 0)
                        err.betAmount = "Ingresa un monto válido";
                }
                break;

            case 7:
                if (!form.desc.trim())
                    err.desc = "La descripción no puede estar vacía";
                else if (form.desc.trim().length < 10)
                    err.desc = "Debe tener al menos 10 caracteres";
                break;
        }

        setErrors(err);
        return Object.keys(err).length === 0;
    };

    /* ==========================
       ENVÍO FINAL
    =========================== */
    const sendToBackend = async (): Promise<boolean> => {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

        const body = {
            sport: form.sport,
            district: form.district,
            locationText: form.locationText,
            lat: form.lat ?? null,
            lng: form.lng ?? null,
            date: form.date,
            time: form.time,
            players: Number(form.players),
            hasBet: form.hasBet ? 1 : 0,
            betAmount: form.hasBet ? Number(form.betAmount) : 0,
            desc: form.desc
        };

        const res = await fetch(`${API_BASE}/api/matches`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            console.error(await res.text());
            return false;
        }

        // 🎉 MENSAJE BONITO
        const toast = document.createElement("div");
        toast.innerText = "✔️ Partido creado con éxito";
        toast.style.position = "fixed";
        toast.style.bottom = "30px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.background = "#5e8a58ff";
        toast.style.color = "#000";
        toast.style.padding = "10px 18px";
        toast.style.borderRadius = "10px";
        toast.style.fontWeight = "700";
        toast.style.fontSize = "18px";
        toast.style.boxShadow = "0 4px 14px rgba(0,0,0,0.4)";
        toast.style.zIndex = "9999";
        toast.style.opacity = "0";
        toast.style.transition = "opacity .3s ease";

        document.body.appendChild(toast);

        // Animación
        setTimeout(() => {
            toast.style.opacity = "1";
        }, 50);

        // ⏳ Esperar 1.5 segundos antes de redirigir
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => {
                router.push("/dashboard");
            }, 300);
        }, 1500);

        return true;
    };


    /* ==========================
       CONTEXTO
    =========================== */
    return (
        <WizardContext.Provider
            value={{
                form,
                setForm,
                step,
                setStep,
                totalSteps,
                errors,
                validateStep,
                sendToBackend,
            }}
        >
            {children}
        </WizardContext.Provider>
    );
}

export function useWizard() {
    const ctx = useContext(WizardContext);
    if (!ctx) throw new Error("useWizard must be inside Provider");
    return ctx;
}
