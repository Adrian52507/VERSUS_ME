import sys, os
sys.path.append(os.path.dirname(__file__))

import json
import numpy as np
from tensorflow.keras.models import load_model
import joblib

# 🔹 Importamos la lógica de recomendación
from recommender import recommend_full

# 🔹 Cargar modelos ANFIS y recursos necesarios
#    (estos deben estar en backend/ai/)
custom_objs = {
    "FuzzyLayer": None,  # se reemplaza luego
    "RuleLayer": None,
    "NormLayer": None,
    "DefuzzLayer": None,
    "SummationLayer": None,
}

# Cargar myanfis para registrar las capas
import myanfis
custom_objs["FuzzyLayer"] = myanfis.FuzzyLayer
custom_objs["RuleLayer"] = myanfis.RuleLayer
custom_objs["NormLayer"] = myanfis.NormLayer
custom_objs["DefuzzLayer"] = myanfis.DefuzzLayer
custom_objs["SummationLayer"] = myanfis.SummationLayer

# 🔹 Cargar modelos entrenados
fis_int  = load_model(os.path.join(os.path.dirname(__file__), "anfis_int.h5"), custom_objects=custom_objs, compile=False)
fis_diet = load_model(os.path.join(os.path.dirname(__file__), "anfis_diet.h5"), custom_objects=custom_objs, compile=False)

# 🔹 Cargar normalizador y modelo cardiaco
scaler_X = joblib.load(os.path.join(os.path.dirname(__file__), "scaler_X.joblib"))
clf      = joblib.load(os.path.join(os.path.dirname(__file__), "heart_clf.joblib"))
heart_cols = joblib.load(os.path.join(os.path.dirname(__file__), "heart_cols.joblib"))

# 🔹 Inyectar estos objetos dentro de recommend_full()
#    (opcional según cómo lo implementaste)
recommender_globals = vars(__import__("recommender"))
recommender_globals["fis_int"] = fis_int
recommender_globals["fis_diet"] = fis_diet
recommender_globals["scaler_X"] = scaler_X
recommender_globals["clf"] = clf
recommender_globals["heart_cols"] = heart_cols


# -------------------------
# 🔹 Leer JSON del backend
# -------------------------
raw = sys.stdin.read()
data = json.loads(raw)

gender = data["gender"]
age = data["age"]
height = data["height_cm"]
weight = data["weight_kg"]
activity = data["activity_0_4"]
goal = data["goal_str"]

# -------------------------
# 🔹 Ejecutar recomendación
# -------------------------
result = recommend_full(gender, age, height, weight, activity, goal)

# -------------------------
# 🔹 Devolver a Node.js
# -------------------------
print(json.dumps(result))
