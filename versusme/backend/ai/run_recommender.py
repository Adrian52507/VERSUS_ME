import json
import sys
from recommender import recommend_full

# Leer UNA línea del stdin
raw = sys.stdin.readline().strip()

try:
    data = json.loads(raw)
except Exception as e:
    print(json.dumps({"error": f"JSON decode error: {str(e)}"}))
    sys.exit(1)

result = recommend_full(
    data["gender"],
    int(data["age"]),
    int(data["height_cm"]),
    int(data["weight_kg"]),
    int(data["activity_0_4"]),
    data["goal_str"]
)

print(json.dumps(result))
