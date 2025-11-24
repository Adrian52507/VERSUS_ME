"use client";

import { useWizard } from "../WizardContext";

export default function Step4DateTime() {
  const { form, setForm, errors } = useWizard();

  return (
    <div className="step-card">
      <h2 className="step-title">Fecha y hora del partido</h2>

      {/* Grid responsivo */}
      <div className="step-row">
        
        {/* FECHA */}
        <div className="step-col">
          <label className="step-label">Fecha</label>
          <input
            type="date"
            className="step-input"
            value={form.date}
            onChange={(e) => setForm({ date: e.target.value })}
          />
          {errors.date && <p className="step-error">{errors.date}</p>}
        </div>

        {/* HORA */}
        <div className="step-col">
          <label className="step-label">Hora</label>
          <input
            type="time"
            className="step-input"
            value={form.time}
            onChange={(e) => setForm({ time: e.target.value })}
          />
          {errors.time && <p className="step-error">{errors.time}</p>}
        </div>

      </div>
    </div>
  );
}
