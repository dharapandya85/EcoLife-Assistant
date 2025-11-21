import easyocr
import re

class OCRProcessor:
    def __init__(self):
        self.reader = easyocr.Reader(['en'])
        
    def extract_text(self, image_path):
        """Extract text from image using OCR"""
        try:
            results = self.reader.readtext(image_path)
            extracted_text = ' '.join([result[1] for result in results])
            return extracted_text
        except Exception as e:
            print(f"OCR Error: {e}")
            return ""
    
    def analyze_product_impact(self, text):
        """Simple analysis of product environmental impact"""
        text_lower = text.lower()
        
        eco_keywords = {
            'organic': 2,
            'recyclable': 2, 
            'biodegradable': 2,
            'compostable': 2,
            'sustainable': 2,
            'natural': 1,
            'eco': 1,
            'green': 1
        }
        
        negative_keywords = {
            'plastic': -1,
            'chemical': -1,
            'toxic': -2,
            'pollution': -2
        }
        
        score = 0
        found_keywords = []
        
        for keyword, points in eco_keywords.items():
            if keyword in text_lower:
                score += points
                found_keywords.append(keyword)
                
        for keyword, points in negative_keywords.items():
            if keyword in text_lower:
                score += points
                found_keywords.append(keyword)
        
        return {
            'sustainability_score': max(0, score),
            'found_keywords': found_keywords,
            'extracted_text': text[:100] + '...' if len(text) > 100 else text
        }

if __name__ == "__main__":
    ocr = OCRProcessor()
    print("OCR Processor ready!")