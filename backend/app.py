from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
import traceback
from flask_cors import CORS
from advanced_classifier import AdvancedWasteClassifier
from waste_classifier import WasteClassifier
from product_analyzer import ProductAnalyzer
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

advanced_classifier = AdvancedWasteClassifier()
simple_classifier = WasteClassifier()
product_analyzer = ProductAnalyzer()

def decode_image(image_data):
    try:
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        img_bytes = base64.b64decode(image_data)
        
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if img is not None:
            return img
        
        try:
            pil_image = Image.open(io.BytesIO(img_bytes))
            
            if pil_image.mode != 'RGB':
                pil_image = pil_image.convert('RGB')
            
            img_array = np.array(pil_image)
            img = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            
            return img
            
        except Exception:
            pass
        
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        
        total_pixels = len(img_array) // 3
        side = int(np.sqrt(total_pixels))
        
        if side * side * 3 == len(img_array):
            img = img_array.reshape((side, side, 3))
            return img
        
        return None
            
    except Exception as e:
        print(f"Image decoding error: {e}")
        traceback.print_exc()
        return None

@app.route('/')
def home():
    return jsonify({
        "message": "EcoLife Advanced API",
        "status": "operational",
        "version": "3.2",
        "supported_formats": ["JPEG", "PNG", "WEBP", "AVIF", "HEIC", "BMP"],
        "endpoints": {
            "waste_classification_advanced": "/classify-waste/advanced",
            "waste_classification_simple": "/classify-waste/simple",
            "product_analysis": "/analyze-product",
            "barcode_scan": "/scan-barcode"
        }
    })

@app.route('/classify-waste/advanced', methods=['POST', 'OPTIONS'])
def classify_waste_advanced():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        image_data = data.get('image')
        if not image_data:
            return jsonify({"error": "No image data in request"}), 400
        
        img = decode_image(image_data)
        
        if img is None:
            return jsonify({
                "error": "Failed to decode image. Supported formats: JPEG, PNG, WEBP, AVIF, HEIC"
            }), 400
        
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
        
        response = jsonify(response_data)
        return _corsify_actual_response(response)
        
    except Exception as e:
        print(f"Advanced classification error: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/classify-waste/simple', methods=['POST', 'OPTIONS'])
def classify_waste_simple():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        image_data = data.get('image')
        if not image_data:
            return jsonify({"error": "No image data in request"}), 400
        
        img = decode_image(image_data)
        
        if img is None:
            return jsonify({
                "error": "Failed to decode image. Supported formats: JPEG, PNG, WEBP, AVIF, HEIC"
            }), 400
        
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
        print(f"Simple classification error: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/analyze-product', methods=['POST', 'OPTIONS'])
def analyze_product():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        image_data = data.get('image')
        
        if not image_data or image_data == 'demo':
            return jsonify({"error": "Please provide a product image"}), 400
        
        img = decode_image(image_data)
        
        if img is None:
            return jsonify({
                "error": "Failed to decode image. Supported formats: JPEG, PNG, WEBP, AVIF, HEIC"
            }), 400
        
        analysis = product_analyzer.analyze_product(img)
        
        response_data = {
            "sustainability_score": analysis['sustainability_score'],
            "confidence": analysis['confidence'],
            "barcode_detected": analysis['barcode_detected'],
            "found_keywords": [kw for kw, _ in analysis['found_keywords']],
            "extracted_text": analysis['extracted_text'][:200] if analysis['extracted_text'] else "No text detected",
            "recommendations": analysis['recommendations'],
            "analysis_method": "barcode" if analysis['barcode_detected'] else "ocr"
        }
        
        if analysis['barcode_detected'] and analysis['product_info'].get('found'):
            product_info = analysis['product_info']
            response_data['product_details'] = {
                "name": product_info.get('product_name', 'Unknown'),
                "brand": product_info.get('brands', 'Unknown'),
                "categories": product_info.get('categories', ''),
                "nutriscore": product_info.get('nutriscore_grade', 'N/A'),
                "ecoscore": product_info.get('ecoscore_grade', 'N/A'),
                "packaging": product_info.get('packaging', ''),
                "labels": product_info.get('labels', ''),
            }
            
            if analysis['packaging_materials']:
                response_data['packaging_analysis'] = {
                    "materials": analysis['packaging_materials'],
                    "packaging_score": analysis['packaging_score']
                }
        
        response = jsonify(response_data)
        return _corsify_actual_response(response)
        
    except Exception as e:
        print(f"Product analysis error: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

@app.route('/scan-barcode', methods=['POST', 'OPTIONS'])
def scan_barcode():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400
        
        img = decode_image(image_data)
        
        if img is None:
            return jsonify({
                "error": "Failed to decode image. Supported formats: JPEG, PNG, WEBP, AVIF, HEIC"
            }), 400
        
        barcodes = product_analyzer.detect_and_decode_barcode(img)
        
        if not barcodes:
            return jsonify({
                "barcode_detected": False,
                "message": "No barcode detected. Try adjusting camera angle or lighting."
            })
        
        barcode_data = barcodes[0]['data']
        
        product_info = product_analyzer.fetch_product_info_from_barcode(barcode_data)
        
        response_data = {
            "barcode_detected": True,
            "barcode": barcode_data,
            "barcode_type": barcodes[0]['type'],
            "product_found": product_info['found']
        }
        
        if product_info['found']:
            response_data['product_details'] = {
                "name": product_info.get('product_name', 'Unknown'),
                "brand": product_info.get('brands', 'Unknown'),
                "categories": product_info.get('categories', ''),
                "nutriscore": product_info.get('nutriscore_grade', 'N/A'),
                "ecoscore": product_info.get('ecoscore_grade', 'N/A'),
                "packaging": product_info.get('packaging', ''),
            }
        
        response = jsonify(response_data)
        return _corsify_actual_response(response)
        
    except Exception as e:
        print(f"Barcode scanning error: {e}")
        traceback.print_exc()
        return jsonify({"error": f"Scan failed: {str(e)}"}), 500

@app.route('/waste-categories', methods=['GET'])
def get_waste_categories():
    return jsonify(advanced_classifier.categories)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "version": "3.2",
        "supported_formats": ["JPEG", "PNG", "WEBP", "AVIF", "HEIC", "BMP"],
        "classifiers": {
            "advanced": "loaded",
            "simple": "loaded",
            "product_analyzer": "loaded"
        }
    })

def get_simple_tips(waste_type):
    tips = {
        'recyclable': ["Rinse containers before recycling", "Check local recycling guidelines"],
        'organic': ["Compost food scraps if possible", "Use designated compost bin"],
        'landfill': ["Reduce single-use items", "Consider repair or reuse options"]
    }
    return tips.get(waste_type, ["Dispose responsibly"])

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
    print("EcoLife Universal Image Processing Server")
    print("Features:")
    print("  Waste Classification (Simple & Advanced)")
    print("  Barcode Scanning")
    print("  Product Sustainability Analysis")
    print("  OCR Text Extraction")
    print("Supported Image Formats:")
    print("  JPEG / JPG")
    print("  PNG")
    print("  WEBP")
    print("  AVIF (Apple iOS format)")
    print("  HEIC (Apple format)")
    print("  BMP")
    print("Available Endpoints:")
    print("  POST /classify-waste/advanced")
    print("  POST /classify-waste/simple")
    print("  POST /analyze-product")
    print("  POST /scan-barcode")
    print("  GET  /waste-categories")
    print("  GET  /health")
    print("Server Configuration:")
    print("  Host: 0.0.0.0 (all interfaces)")
    print("  Port: 5500")
    print("  Debug: True")
    print("  CORS: Enabled")
    app.run(host='0.0.0.0', port=5500, debug=True)