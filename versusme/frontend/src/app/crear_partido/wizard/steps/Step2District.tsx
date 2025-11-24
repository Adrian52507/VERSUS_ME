"use client";

import { useWizard } from "../WizardContext";

const districts = [
  "Miraflores",
  "San Isidro",
  "Barranco",
  "Surco",
  "La Molina",
  "San Borja",
];

export default function Step2District() {
  const { form, setForm, errors } = useWizard();

  return (
    <div className="step-card">
      <h2 className="step-title">¿En qué distrito será?</h2>

      <div className="step-options">
        {districts.map((district) => (
          <div
            key={district}
            className={`step-option ${
              form.district === district ? "selected" : ""
            }`}
            onClick={() => setForm({ district })}
          >
            {district}
          </div>
        ))}
      </div>

      {errors.district && <p className="step-error">{errors.district}</p>}
    </div>
  );
}
