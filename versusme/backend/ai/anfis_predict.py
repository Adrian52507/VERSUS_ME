import json
import numpy as np
import joblib
from tensorflow.keras.models import load_model
import myanfis

# Cargar capas personalizadas
custom_objs = {
    "FuzzyLayer": myanfis.FuzzyLayer,
    "RuleLayer": myanfis.RuleLayer,
    "NormLayer": myanfis.NormLayer,
    "DefuzzLayer": myanfis.DefuzzLayer,
    "SummationLayer": myanfis.SummationLayer,
}

# Cargar modelos
fis_int  = load_model("models/anfis_int.h5",  custom_objects=custom_objs, compile=False)
fis_diet = load_model("models/anfis_diet.h5", custom_objects=custom_objs, compile=False)
scaler_X = joblib.load("models/scaler_X.joblib")
clf      = joblib.load("models/heart_clf.joblib")

try:
    heart_cols = joblib.load("models/heart_cols.joblib")
except:
    heart_cols = None

# --------------------------
# Recibir datos desde Node
# --------------------------
raw = json.loads(open(0).read())
X = np.array(raw["features"]).reshape(1, -1)

# Normalizar entrada
X_scaled = scaler_X.transform(X)

# Predicciones ANFIS
intensity = float(fis_int.predict(X_scaled)[0][0])
diet      = float(fis_diet.predict(X_scaled)[0][0])

# Clasificador extra
risk = int(clf.predict(X_scaled)[0])

# Respuesta final
result = {
    "intensity": intensity,
    "diet": diet,
    "risk": risk
}

print(json.dumps(result))
