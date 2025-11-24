"use client";

import { useWizard } from "../WizardContext";

export default function Step7Description() {
  const { form, setForm, errors } = useWizard();

  return (
    <div className="step-card">
      <h2 className="step-title">Descripción del partido</h2>

      {/* Campo de descripción */}
      <textarea
        className="step-textarea"
        maxLength={500}
        placeholder="Describe el nivel, reglas, punto de encuentro…"
        value={form.desc}
        onChange={(e) => setForm({ desc: e.target.value })}
      />

      {/* Contador de caracteres */}
      <p className="step-counter">
        {500 - form.desc.length} caracteres restantes
      </p>

      {/* Error de validación */}
      {errors.desc && <p className="step-error">{errors.desc}</p>}
    </div>
  );
}
