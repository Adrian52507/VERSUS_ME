"use client";

import { useWizard } from "../WizardContext";

const sports = ["Fútbol", "Baloncesto", "Vóleibol", "Tenis", "Pádel"];

export default function Step1Sport() {
  const { form, setForm, errors } = useWizard();

  return (
    <div className="step-card">
      <h2 className="step-title">¿Qué deporte quieres jugar?</h2>

      <div className="step-options">
        {sports.map((sport) => (
          <div
            key={sport}
            className={`step-option ${form.sport === sport ? "selected" : ""}`}
            onClick={() => setForm({ sport })}
          >
            {sport}
          </div>
        ))}
      </div>

      {errors.sport && <p className="step-error">{errors.sport}</p>}
    </div>
  );
}
