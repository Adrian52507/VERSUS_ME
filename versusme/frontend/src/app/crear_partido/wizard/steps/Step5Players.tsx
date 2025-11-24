"use client";

import { useWizard } from "../WizardContext";

export default function Step5Players() {
  const { form, setForm, errors } = useWizard();

  return (
    <div className="step-card">
      <h2 className="step-title">¿Cuántos jugadores participarán?</h2>

      <input
        type="number"
        min={2}
        max={50}
        className="step-input"
        placeholder="Ej: 10"
        value={form.players}
        onChange={(e) => setForm({ players: e.target.value })}
      />

      {errors.players && <p className="step-error">{errors.players}</p>}
    </div>
  );
}
