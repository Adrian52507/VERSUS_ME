"use client";

import { useWizard } from "../WizardContext";
import dynamic from "next/dynamic";

// Carga dinámica del mapa
const MapWrapper = dynamic(() => import("../../MapWrapper"), {
  ssr: false,
});

export default function Step3Location() {
  const { form, setForm, errors } = useWizard();

  return (
    <div className="step-card">
      <h2 className="step-title">Ubicación del partido</h2>

      {/* Input de búsqueda */}
      <input
        className="step-input"
        placeholder="Busca un lugar: Ej. 'Canchas La Bombonera'"
        value={form.locationText}
        onChange={(e) => setForm({ locationText: e.target.value })}
      />

      {errors.locationText && (
        <p className="step-error">{errors.locationText}</p>
      )}

      {/* Mapa */}
      <div className="step-map">
        <MapWrapper form={form} setForm={setForm} />
      </div>

      {errors.map && <p className="step-error">{errors.map}</p>}
    </div>
  );
}
