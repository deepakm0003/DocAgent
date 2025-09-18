from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import pickle
import os
import time
import requests

# Initialize Flask app
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Load the model and encoder
with open('assets/model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('assets/encoder.pkl', 'rb') as f:
    encoder = pickle.load(f)

# Dictionary containing symptoms along with its index
symptoms_index_mapping = {
    'abdominal_pain': 0,
    'abnormal_menstruation': 1,
    'altered_sensorium': 2,
    'back_pain': 3,
    'belly_pain': 4,
    'bladder_discomfort': 5,
    'blister': 6,
    'breathlessness': 7,
    'brittle_nails': 8,
    'burning_micturition': 9,
    'chest_pain': 10,
    'continuous_feel_of_urine': 11,
    'cough': 12,
    'dark_urine': 13,
    'dehydration': 14,
    'depression': 15,
    'diarrhoea': 16,
    'dischromic_patches': 17,
    'enlarged_thyroid': 18,
    'family_history': 19,
    'fatigue': 20,
    'foul_smell_ofurine': 21,
    'headache': 22,
    'hip_joint_pain': 23,
    'increased_appetite': 24,
    'inflammatory_nails': 25,
    'internal_itching': 26,
    'irritability': 27,
    'itching': 28,
    'joint_pain': 29,
    'knee_pain': 30,
    'lack_of_concentration': 31,
    'loss_of_balance': 32,
    'loss_of_smell': 33,
    'mucoid_sputum': 34,
    'muscle_pain': 35,
    'nausea': 36,
    'painful_walking': 37,
    'passage_of_gases': 38,
    'polyuria': 39,
    'red_sore_around_nose': 40,
    'red_spots_over_body': 41,
    'rusty_sputum': 42,
    'silver_like_dusting': 43,
    'skin_peeling': 44,
    'skin_rash': 45,
    'small_dents_in_nails': 46,
    'spinning_movements': 47,
    'spotting_urination': 48,
    'sunken_eyes': 49,
    'swelling_joints': 50,
    'swollen_extremeties': 51,
    'toxic_look_(typhos)': 52,
    'unsteadiness': 53,
    'vomiting': 54,
    'watering_from_eyes': 55,
    'weakness_in_limbs': 56,
    'weakness_of_one_body_side': 57,
    'yellow_crust_ooze': 58,
    'yellowish_skin': 59
}

# Welcome GET Request API
@app.route('/', methods=['GET'])
@cross_origin()
def status():
    return jsonify({'service': 'diagnoze-api', 'status': 'active'}), 200

# Prediction POST Request API
@app.route('/predict', methods=['POST'])
@cross_origin()
def predict():
    data = request.json
    features = [0] * 60
    y_pred = None

    try:
        symptoms = data["symptoms"]
        for symptom in symptoms:
            features[symptoms_index_mapping[symptom]] = 1
        y_pred = model.predict([features])

    except KeyError:
        return jsonify({'error': 'Invalid JSON format'}), 400

    except Exception as e:
        return jsonify({'error': str(e)}), 400

    disease = encoder.inverse_transform([y_pred])[0]
    return jsonify({'prediction': disease}), 200


# Proxy endpoint to call Gemini safely from the backend
@app.route('/ai/generate', methods=['POST'])
@cross_origin()
def ai_generate():
    data = request.json or {}
    prompt = (data.get('prompt') or '').strip()
    if not prompt:
        return jsonify({'error': 'prompt is required'}), 400

    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print('[ai_generate] Missing GEMINI_API_KEY')
        return jsonify({'error': 'GEMINI_API_KEY not configured on server'}), 500

    model = data.get('model') or 'gemini-1.5-flash'

    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
    headers = {'Content-Type': 'application/json'}
    payload = {
        'contents': [{
            'parts': [{'text': prompt}]
        }]
    }

    max_retries = 3
    base_delay = 1.5

    for attempt in range(max_retries + 1):
        try:
            resp = requests.post(url, headers=headers, params={'key': api_key}, json=payload, timeout=30)
            if resp.status_code == 200:
                data = resp.json()
                text = ''
                try:
                    text = data['candidates'][0]['content']['parts'][0]['text']
                except Exception:
                    text = ''
                return jsonify({'text': text, 'raw': data}), 200
            elif resp.status_code == 429 and attempt < max_retries:
                time.sleep(base_delay * (2 ** attempt))
                continue
            else:
                print(f"[ai_generate] Upstream error {resp.status_code}: {resp.text[:500]}")
                return jsonify({'error': 'gemini_error', 'status': resp.status_code, 'body': resp.text}), resp.status_code
        except requests.RequestException as e:
            if attempt < max_retries:
                time.sleep(base_delay * (2 ** attempt))
                continue
            print(f"[ai_generate] Network error: {e}")
            return jsonify({'error': 'network_error', 'message': str(e)}), 502


if __name__ == '__main__':
    app.run()
