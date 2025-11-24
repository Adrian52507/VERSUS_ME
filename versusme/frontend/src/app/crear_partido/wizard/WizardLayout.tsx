"use client";

import { useRouter } from "next/navigation";
import { WizardProvider, useWizard } from "./WizardContext";
import {
  Step1Sport,
  Step2District,
  Step3Location,
  Step4DateTime,
  Step5Players,
  Step6Bet,
  Step7Description,
} from "./steps";
import WizardNavigation from "./WizardNavigation";
import "@/app/crear_partido/styles/wizard.css";
import "@/app/crear_partido/styles/steps.css";
import WizardFade from "@/components/WizardFade";

export default function WizardLayout() {
  return (
    <WizardProvider>
      <WizardInner />
    </WizardProvider>
  );
}

function WizardInner() {
  const router = useRouter();
  const { step, totalSteps } = useWizard();

  const stepsComponents = [
    <Step1Sport key={1} />,
    <Step2District key={2} />,
    <Step3Location key={3} />,
    <Step4DateTime key={4} />,
    <Step5Players key={5} />,
    <Step6Bet key={6} />,
    <Step7Description key={7} />,
  ];

  return (
    <main className="wizard-main">

      {/* ---------------------- HEADER DE REGRESO ---------------------- */}
      <div className="w-full max-w-[540px] px-4 mt-6 mb-4 flex items-center">
        <button
          onClick={() => router.push("/dashboard")}
          className="
            flex items-center gap-2
            text-white/90 
            hover:text-green-400 
            transition 
            font-semibold
            text-lg
          "
        >
          <span className="text-2xl">←</span> Volver
        </button>
      </div>

      {/* ------------------------ TARJETA PRINCIPAL ------------------------ */}
      <div className="wizard-card">
        <WizardFade key={step}>
          {stepsComponents[step - 1]}
        </WizardFade>
      </div>

      {/* ------------------------ NAVEGACIÓN ------------------------ */}
      <WizardNavigation />

      {/* ------------------------ INDICADOR DE PASOS ------------------------ */}
      <div className="wizard-steps-indicator">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span
            key={i}
            className={`wizard-step-dot ${i + 1 === step ? "active" : ""}`}
          ></span>
        ))}
      </div>
    </main>
  );
}
