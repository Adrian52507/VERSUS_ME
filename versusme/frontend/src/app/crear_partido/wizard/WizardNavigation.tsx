"use client";

import { useWizard } from "./WizardContext";

export default function WizardNavigation() {
  const {
    step,
    setStep,
    totalSteps,
    validateStep,
    sendToBackend
  } = useWizard();

  const handleNext = () => {
    const ok = validateStep(step);
    if (!ok) return;

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const isLast = step === totalSteps;

  return (
    <div className="wizard-nav">

      <button
        className="wizard-nav-btn wizard-nav-prev"
        onClick={handlePrev}
        disabled={step === 1}
      >
        ← Anterior
      </button>

      {!isLast ? (
        <button
          className="wizard-nav-btn wizard-nav-next"
          onClick={handleNext}
        >
          Siguiente →
        </button>
      ) : (
        <button
          className="wizard-nav-btn wizard-nav-next"
          onClick={async () => {
            const ok = validateStep(step);
            if (!ok) return;
            await sendToBackend();
          }}
        >
          Publicar Partido
        </button>
      )}
    </div>
  );
}
