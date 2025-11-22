from flask import Flask, request, jsonify
import random
import cv2
import numpy as np
import base64
from flask_cors import CORS
from advanced_classifier import AdvancedWasteClassifier
from waste_classifier import WasteClassifier
from ocr_processor import OCRProcessor

app = Flask(__name__)
CORS(app)

advanced_classifier = AdvancedWasteClassifier()
simple_classifier = WasteClassifier()
ocr_processor = OCRProcessor()

@app.route('/')
def home():
    return jsonify({
        "message": "EcoLife Advanced API",
        "status": "operational",
        "version": "2.0"
    })

@app.route('/classify-waste', methods=['POST', 'OPTIONS'])
def classify_waste():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        image_data = data['image']
        mode = data.get('mode', 'advanced')
        
        img_bytes = base64.b64decode(image_data)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({"error": "Invalid image data"}), 400
        
        if mode == 'advanced':
            result = advanced_classifier.predict(img)
            if 'error' in result:
                return jsonify(result), 400
            response_data = {
                "waste_type": result['waste_type'],
                "category_name": result['category_name'],
                "confidence": result['confidence'],
                "subcategories": result['subcategories'],
                "disposal_instructions": result['disposal_instructions'],
                "recycling_code": result['recycling_code'],
                "tips": result['eco_tips'],
                "contamination_warnings": result['contamination_warnings'],
                "mode": "advanced"
            }
        else:
            waste_type, confidence = simple_classifier.predict(img)
            response_data = {
                "waste_type": waste_type,
                "confidence": confidence,
                "tips": get_simple_tips(waste_type),
                "mode": "simple"
            }
        
        response = jsonify(response_data)
        return _corsify_actual_response(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/classify-waste/simple', methods=['POST', 'OPTIONS'])
def classify_waste_simple():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        image_data = data['image']
        
        img_bytes = base64.b64decode(image_data)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        waste_type, confidence = simple_classifier.predict(img)
        
        response = jsonify({
            "waste_type": waste_type,
            "confidence": confidence,
            "tips": get_simple_tips(waste_type),
            "mode": "simple"
        })
        return _corsify_actual_response(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/classify-waste/advanced', methods=['POST', 'OPTIONS'])
def classify_waste_advanced():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        image_data = data['image']
        
        img_bytes = base64.b64decode(image_data)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        result = advanced_classifier.predict(img)
        
        if 'error' in result:
            return jsonify(result), 400
            
        response = jsonify({
            "waste_type": result['waste_type'],
            "category_name": result['category_name'],
            "confidence": result['confidence'],
            "subcategories": result['subcategories'],
            "disposal_instructions": result['disposal_instructions'],
            "recycling_code": result['recycling_code'],
            "tips": result['eco_tips'],
            "contamination_warnings": result['contamination_warnings'],
            "mode": "advanced"
        })
        return _corsify_actual_response(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/analyze-product', methods=['POST', 'OPTIONS'])
def analyze_product():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        image_data = data.get('image', 'demo')
        
        if image_data and image_data != 'demo':
            img_bytes = base64.b64decode(image_data)
            with open('temp_product.jpg', 'wb') as f:
                f.write(img_bytes)
            text = ocr_processor.extract_text('temp_product.jpg')
            analysis = ocr_processor.analyze_product_impact(text)
        else:
            analysis = {
                "sustainability_score": random.randint(4, 9),
                "found_keywords": random.choice([
                    ["organic", "natural", "biodegradable"],
                    ["recyclable", "eco-friendly", "sustainable"],
                    ["plastic", "packaging", "container"]
                ]),
                "extracted_text": "Product analysis demo"
            }
        
        response = jsonify(analysis)
        return _corsify_actual_response(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/waste-categories', methods=['GET'])
def get_waste_categories():
    return jsonify(advanced_classifier.categories)

def get_simple_tips(waste_type):
    tips = {
        'recyclable': ["Rinse containers", "Check local guidelines"],
        'organic': ["Compost food scraps", "Use compost bin"],
        'landfill': ["Reduce single-use items", "Consider repair"]
    }
    return tips.get(waste_type, [])

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
    print("EcoLife Advanced Server Starting...")
    app.run(host='0.0.0.0', port=5500, debug=True)