"use client";

import { useWizard } from "../WizardContext";

export default function Step6Bet() {
  const { form, setForm, errors } = useWizard();

  return (
    <div className="step-card">
      <h2 className="step-title">¿Quieres incluir apuesta?</h2>

      {/* Botones Sí / No */}
      <div className="step-options" style={{ marginTop: "14px" }}>
        <div
          className={`step-option ${form.hasBet ? "selected" : ""}`}
          onClick={() => setForm({ hasBet: true })}
        >
          Sí
        </div>

        <div
          className={`step-option ${!form.hasBet ? "selected" : ""}`}
          onClick={() => setForm({ hasBet: false, betAmount: "" })}
        >
          No
        </div>
      </div>

      {/* Input del monto SOLO cuando hasBet === true */}
      {form.hasBet && (
        <div style={{ marginTop: "24px" }}>
          <label className="step-label">Monto (S/)</label>
          <input
            className="step-input"
            type="number"
            min="1"
            placeholder="Ej: 50"
            value={form.betAmount}
            onChange={(e) => setForm({ betAmount: e.target.value })}
          />
        </div>
      )}

      {/* Error */}
      {errors.betAmount && (
        <p className="step-error" style={{ marginTop: "12px" }}>
          {errors.betAmount}
        </p>
      )}
    </div>
  );
}
