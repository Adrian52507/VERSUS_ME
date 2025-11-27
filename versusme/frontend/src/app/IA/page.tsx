"use client";

import { useState } from "react";
import Topbar from "@/components/Topbar";

export default function IA() {
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("");
  const [goal, setGoal] = useState("");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const handlePredict = async () => {
    if (!gender || !age || !height || !weight || !activity || !goal)
      return alert("Completa todos los campos.");

    const payload = {
      gender,
      age: Number(age),
      height_cm: Number(height),
      weight_kg: Number(weight),
      activity_0_4: Number(activity),
      goal_str: goal,
    };

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai/predict_full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Error al conectar con la IA.");
    }
    setLoading(false);
  };

  return (
    <>
      <Topbar />

      <div className="min-h-screen bg-[#0f0f11] px-5 py-10 flex justify-center">
        <div className="w-full max-w-2xl">
          
          {/* TITLE */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white">🤖 Asistente Fitness – IA</h1>
            <p className="text-gray-400 mt-2">
              Genera un plan personalizado con tu información corporal y objetivo.
            </p>
          </div>

          {/* INPUT CARD */}
          <div className="bg-[#16161a] p-6 rounded-2xl shadow-lg border border-gray-700 space-y-4">
            <h2 className="text-xl font-semibold text-white">Datos personales</h2>

            <div className="grid grid-cols-2 gap-4">
              <select className="field" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Género</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>

              <input
                className="field"
                type="number"
                placeholder="Edad"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="field"
                type="number"
                placeholder="Altura (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <input
                className="field"
                type="number"
                placeholder="Peso (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>

            <select className="field" value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="">Nivel de actividad</option>
              <option value="0">0 – Sedentario</option>
              <option value="1">1 – Ligero</option>
              <option value="2">2 – Moderado</option>
              <option value="3">3 – Activo</option>
              <option value="4">4 – Muy activo</option>
            </select>

            <select className="field" value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="">Objetivo</option>
              <option value="fat_burn">Perder grasa</option>
              <option value="maintain">Mantener peso</option>
              <option value="muscle_gain">Ganar músculo</option>
            </select>

            <button
              onClick={handlePredict}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-700 transition-all p-3 rounded-xl font-semibold text-white text-lg"
            >
              {loading ? "Procesando..." : "Generar Recomendación"}
            </button>
          </div>

          {/* RESULTS */}
          {result && (
            <div className="bg-[#16161a] p-6 rounded-2xl mt-8 shadow-lg border border-gray-700 text-white space-y-4 animate-fadeIn">
              <h2 className="text-2xl font-bold">📊 Tu Plan Personalizado</h2>

              <div>
                <h3 className="text-xl font-semibold mb-1">🔥 Ejercicio</h3>
                <p><b>Intensidad:</b> {result.exercise.intensity}</p>
                <p className="text-gray-300 italic">{result.exercise.note}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-1">🥗 Dieta</h3>
                <p><b>Tipo:</b> {result.diet.type}</p>
                <p><b>Calorías diarias:</b> {result.diet.calorie_target_kcal} kcal</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-1">❤️ Salud cardiaca</h3>
                <p><b>Riesgo:</b> {result.heart_risk.bucket}</p>
                <p><b>Probabilidad:</b> {result.heart_risk.prob}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-1">📌 Datos corporales</h3>
                <p><b>BMI:</b> {result.body.bmi}</p>
                <p><b>BMR:</b> {result.body.bmr} kcal</p>
                <p><b>TDEE:</b> {result.body.tdee} kcal</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* styles */}
      <style jsx>{`
        .field {
          background: #1e1e22;
          border: 1px solid #555;
          color: white;
          padding: 12px;
          border-radius: 10px;
          width: 100%;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
