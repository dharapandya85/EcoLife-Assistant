from flask import Flask, request, jsonify
import random
from flask_cors import CORS  

app = Flask(__name__)
CORS(app)  


class SimpleClassifier:
    def __init__(self):
        self.waste_types = ['recyclable', 'organic', 'landfill']
    
    def predict(self, image_data=None):
        choice = random.randint(0, 2)
        confidence = round(random.uniform(0.75, 0.95), 2)
        return self.waste_types[choice], confidence

class SimpleOCR:
    def analyze(self, image_data=None):
        keywords_pool = [
            ["organic", "natural", "biodegradable"],
            ["recyclable", "eco-friendly", "sustainable"], 
            ["plastic", "packaging", "container"]
        ]
        return {
            "sustainability_score": random.randint(4, 9),
            "found_keywords": random.choice(keywords_pool),
            "extracted_text": "Product analysis demo"
        }

classifier = SimpleClassifier()
ocr = SimpleOCR()

@app.route('/')
def home():
    return jsonify({
        "message": "EcoLife Assistant - WORKING!",
        "status": "fully_operational"
    })

@app.route('/classify-waste', methods=['POST', 'OPTIONS']) 
def classify_waste():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    waste_type, confidence = classifier.predict()
    tips = {
        'recyclable': ["Rinse containers", "Check local guidelines"],
        'organic': ["Compost food scraps", "Use compost bin"],
        'landfill': ["Reduce single-use items", "Consider repair"]
    }
    
    response = jsonify({
        "waste_type": waste_type,
        "confidence": confidence,
        "tips": tips.get(waste_type, [])
    })
    
    return _corsify_actual_response(response)

@app.route('/analyze-product', methods=['POST', 'OPTIONS']) 
def analyze_product():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    analysis = ocr.analyze()
    response = jsonify(analysis)
    return _corsify_actual_response(response)

# CORS helper functions
def _build_cors_preflight_response():
    response = jsonify()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

if __name__ == '__main__':
    print("WORKING EcoLife Server Starting...")
    print("CORS Enabled - Frontend can now connect!")
    app.run(host='0.0.0.0', port=5500, debug=True)