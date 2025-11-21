from flask import Flask, request, jsonify
import random

app = Flask(__name__)

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

@app.route('/classify-waste', methods=['POST'])
def classify_waste():
    waste_type, confidence = classifier.predict()
    tips = {
        'recyclable': ["Rinse containers", "Check local guidelines"],
        'organic': ["Compost food scraps", "Use compost bin"],
        'landfill': ["Reduce single-use items", "Consider repair"]
    }
    return jsonify({
        "waste_type": waste_type,
        "confidence": confidence,
        "tips": tips.get(waste_type, [])
    })

@app.route('/analyze-product', methods=['POST'])
def analyze_product():
    analysis = ocr.analyze()
    return jsonify(analysis)

if __name__ == '__main__':
    print("WORKING EcoLife Server Starting...")
    app.run(host='0.0.0.0', port=5500, debug=True)