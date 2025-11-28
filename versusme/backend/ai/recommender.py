import os
import numpy as np
import joblib
import tensorflow as tf
import pandas as pd

# -------------------------
# Cargar modelos ANFIS TFLite
# -------------------------

model_dir = os.path.dirname(__file__)

interpreter_int = tf.lite.Interpreter(model_path=os.path.join(model_dir, "anfis_int.tflite"))
interpreter_int.allocate_tensors()

interpreter_diet = tf.lite.Interpreter(model_path=os.path.join(model_dir, "anfis_diet.tflite"))
interpreter_diet.allocate_tensors()

def anfis_predict(interpreter, x):
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    interpreter.set_tensor(input_details[0]['index'], x.astype(np.float32))
    interpreter.invoke()

    return interpreter.get_tensor(output_details[0]['index'])[0,0]

# -------------------------
# Cargar scaler y modelos cardiacos
# -------------------------

scaler_X = joblib.load(os.path.join(model_dir, "scaler_X.joblib"))
clf      = joblib.load(os.path.join(model_dir, "heart_clf.joblib"))

try:
    heart_cols = joblib.load(os.path.join(model_dir, "heart_cols.joblib"))
except:
    heart_cols = None

# -------------------------
# Diccionarios
# -------------------------
INT2TXT  = {0:'Ligero', 1:'Moderado', 2:'Intenso'}
DIET2TXT = {0:'Hipocalórica', 1:'Balanceada', 2:'Proteica'}

# -------------------------
# Funciones auxiliares
# -------------------------

def _bmi_label(bmi):
    return ("Bajo peso" if bmi < 18.5 else
            "Normal" if bmi < 25 else
            "Sobrepeso" if bmi < 30 else "Obesidad")

def _intensity_note(level):
    if level == 0: return "Inicia suave: 2–3 sesiones/semana (movilidad, caminar, core básico)."
    if level == 1: return "Mantén 3–4 sesiones/semana (cardio moderado + fuerza ligera)."
    return "Planifica 4–5 sesiones/semana (fuerza + intervalos). Ajusta por fatiga."

def _build_heart_features(age, gender_str, bmi, activity_0_4, cols):
    sex = 'Male' if str(gender_str).lower().startswith('m') else 'Female'
    age_cat = ('18-24' if age<25 else '25-29' if age<30 else '30-34' if age<35 else
               '35-39' if age<40 else '40-44' if age<45 else '45-49' if age<50 else
               '50-54' if age<55 else '55-59' if age<60 else '60-64' if age<65 else
               '65-69' if age<70 else '70-74' if age<75 else '75-79' if age<80 else '80 or older')

    row = {
        'BMI': bmi,
        'Sex': sex,
        'AgeCategory': age_cat,
        'PhysicalActivity': 'Yes' if activity_0_4>=1 else 'No',
        'Smoking': 'No', 'AlcoholDrinking':'No', 'Stroke':'No', 'DiffWalking':'No',
        'Race':'White', 'Diabetic':'No', 'GenHealth':'Good', 'SleepTime':7,
        'Asthma':'No','KidneyDisease':'No','SkinCancer':'No',
        'PhysicalHealth':0,'MentalHealth':0
    }

    df = pd.DataFrame([row])
    if cols:
        df = df.reindex(columns=cols['num']+cols['cat'], fill_value=np.nan)
    return df

# -------------------------
# Función principal
# -------------------------

def recommend_full(gender_str, age, height_cm, weight_kg, activity_0_4, goal_str):
    bmi = weight_kg / ((height_cm/100)**2)
    bmr = 10*weight_kg + 6.25*height_cm - 5*age + (5 if gender_str.lower()[0]=='m' else -161)

    PAL = [1.2, 1.375, 1.55, 1.725, 1.9][activity_0_4]
    tdee = bmr * PAL

    goal_map = {'fat_burn': -400, 'maintain': 0, 'muscle_gain': +400}
    kcal = tdee + goal_map.get(goal_str, 0)

    # Vector entrada ANFIS
    gender_num = 0 if gender_str.lower()[0]=='m' else 1
    goal_num = {'fat_burn':0, 'maintain':1, 'muscle_gain':2}.get(goal_str,1)

    x_raw = np.array([[gender_num, age, height_cm, weight_kg, activity_0_4, goal_num, bmi]])
    x_cont = scaler_X.transform(x_raw[:, [1,2,3,6]])
    x_cat  = x_raw[:, [0,4,5]]
    x_in   = np.concatenate([x_cont, x_cat], axis=1).astype(np.float32)

    # Predicciones TFLite
    p_int  = float(anfis_predict(interpreter_int,  x_in))
    p_diet = float(anfis_predict(interpreter_diet, x_in))

    c_int  = int(np.clip(np.rint(p_int),  0, 2))
    c_diet = int(np.clip(np.rint(p_diet), 0, 2))

    # Riesgo cardiaco
    df = _build_heart_features(age, gender_str, bmi, activity_0_4, heart_cols)
    p_hd = float(clf.predict_proba(df)[0,1])
    risk = 'Bajo' if p_hd<0.12 else 'Medio' if p_hd<0.25 else 'Alto'

    return {
        "exercise": {
            "intensity": INT2TXT[c_int],
            "note": _intensity_note(c_int),
        },
        "diet": {
            "type": DIET2TXT[c_diet],
            "calorie_target_kcal": int(round(kcal)),
        },
        "heart_risk": {
            "prob": round(p_hd, 3),
            "bucket": risk,
        },
        "body": {
            "bmi": round(bmi, 2),
            "bmr": round(bmr, 1),
            "tdee": round(tdee, 1)
        }
    }
