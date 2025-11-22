import numpy as np
import cv2
from waste_categories import ADVANCED_WASTE_CATEGORIES, get_eco_tips

class AdvancedWasteClassifier:
    """Rule-based waste classifier using image analysis"""
    
    def __init__(self):
        self.categories = ADVANCED_WASTE_CATEGORIES
        print("Advanced Waste Classifier initialized with rule-based detection")
        
    def predict(self, image):
        """Predict waste type using color and texture analysis"""
        try:
            image_resized = cv2.resize(image, (224, 224))
            
            features = self._extract_features(image_resized)
            
            waste_type, confidence = self._classify_by_features(features)
            
            category_info = self.categories.get(waste_type, self.categories['landfill_general'])
            eco_tips = get_eco_tips(waste_type, confidence)
            
            return {
                'waste_type': waste_type,
                'category_name': category_info['name'],
                'confidence': round(confidence, 2),
                'subcategories': category_info['subcategories'],
                'disposal_instructions': category_info['disposal_instructions'],
                'recycling_code': category_info['recycling_code'],
                'eco_tips': eco_tips,
                'contamination_warnings': category_info['contamination_warnings']
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'waste_type': 'unknown',
                'confidence': 0.0
            }
    
    def _extract_features(self, image):
        """Extract color and texture features from image"""
        features = {}
    
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        features['avg_hue'] = np.mean(hsv[:, :, 0])
        features['avg_saturation'] = np.mean(hsv[:, :, 1])
        features['avg_value'] = np.mean(hsv[:, :, 2])
        features['std_hue'] = np.std(hsv[:, :, 0])
        
        features['avg_a'] = np.mean(lab[:, :, 1])  
        features['avg_b'] = np.mean(lab[:, :, 2]) 
        
        features['avg_blue'] = np.mean(image[:, :, 0])
        features['avg_green'] = np.mean(image[:, :, 1])
        features['avg_red'] = np.mean(image[:, :, 2])
        
        features['avg_brightness'] = np.mean(gray)
        features['std_brightness'] = np.std(gray)
        

        edges = cv2.Canny(gray, 50, 150)
        features['edge_density'] = np.sum(edges > 0) / edges.size
        
        features['blue_dominant'] = features['avg_blue'] > max(features['avg_green'], features['avg_red'])
        features['green_dominant'] = features['avg_green'] > max(features['avg_blue'], features['avg_red'])
        features['red_dominant'] = features['avg_red'] > max(features['avg_blue'], features['avg_green'])
        
        return features
    
    def _classify_by_features(self, f):
        """Rule-based classification using extracted features"""
        
        scores = {}
        
        paper_score = 0
        if 10 <= f['avg_hue'] <= 30: 
            paper_score += 30
        if 80 <= f['avg_brightness'] <= 200:  
            paper_score += 25
        if f['avg_saturation'] < 100: 
            paper_score += 20
        if f['edge_density'] > 0.1: 
            paper_score += 15
        if abs(f['avg_a'] - 128) < 10:  
            paper_score += 10
        scores['recyclable_paper'] = paper_score
        
        plastic_score = 0
        if f['avg_saturation'] > 80:  
            plastic_score += 25
        if f['std_brightness'] < 30:  
            plastic_score += 20
        if f['edge_density'] < 0.15: 
            plastic_score += 20
        if f['avg_brightness'] > 100: 
            plastic_score += 15
        if f['blue_dominant'] or f['red_dominant']:  
            plastic_score += 20
        scores['recyclable_plastic'] = plastic_score
    
        glass_score = 0
        if f['avg_brightness'] > 150:  
            glass_score += 30
        if f['std_brightness'] > 40:  
            glass_score += 30
        if f['avg_saturation'] < 50: 
            glass_score += 20
        if f['edge_density'] < 0.1:  
            glass_score += 20
        scores['recyclable_glass'] = glass_score
    
        metal_score = 0
        if abs(f['avg_a'] - 128) < 15 and abs(f['avg_b'] - 128) < 15:  
            metal_score += 30
        if f['avg_brightness'] > 120: 
            metal_score += 25
        if f['std_brightness'] > 35:  
            metal_score += 25
        if f['avg_saturation'] < 50: 
            metal_score += 20
        scores['recyclable_metal'] = metal_score
        

        food_score = 0
        if 5 <= f['avg_hue'] <= 50 or 150 <= f['avg_hue'] <= 180:  
            food_score += 25
        if 40 < f['avg_saturation'] < 150:  
            food_score += 20
        if 50 < f['avg_brightness'] < 180: 
            food_score += 20
        if f['edge_density'] > 0.15: 
            food_score += 20
        if f['std_hue'] > 15: 
            food_score += 15
        scores['organic_food'] = food_score
        
        yard_score = 0
        if 35 <= f['avg_hue'] <= 85:  
            yard_score += 35
        if f['green_dominant']:
            yard_score += 25
        if 40 < f['avg_saturation'] < 180:  
            yard_score += 20
        if f['edge_density'] > 0.2: 
            yard_score += 20
        scores['organic_yard'] = yard_score
        
        hazardous_score = 0
        if 0 <= f['avg_hue'] <= 15 or 160 <= f['avg_hue'] <= 180:  
            hazardous_score += 25
        if f['avg_saturation'] > 100:  
            hazardous_score += 20
        if f['red_dominant']:  
            hazardous_score += 20
        if f['edge_density'] > 0.2:  
            hazardous_score += 15
        scores['hazardous'] = hazardous_score
        

        ewaste_score = 0
        if f['avg_brightness'] < 100:  
            ewaste_score += 25
        if f['avg_saturation'] < 60:
            ewaste_score += 20
        if f['edge_density'] > 0.25: 
            ewaste_score += 25
        if abs(f['avg_a'] - 128) < 20: 
            ewaste_score += 15
        if f['std_brightness'] > 30:  
            ewaste_score += 15
        scores['e_waste'] = ewaste_score
    
        landfill_score = 0
        if all(score < 60 for score in scores.values()): 
            landfill_score += 50
        if 30 < f['avg_saturation'] < 120 and 60 < f['avg_brightness'] < 160: 
            landfill_score += 20
        scores['landfill_general'] = landfill_score
        
        if not scores:
            return 'landfill_general', 0.35
        
        best_type = max(scores, key=scores.get)
        best_score = scores[best_type]
        
        confidence = min(best_score / 100.0, 0.95) 
        confidence = max(confidence, 0.35) 
        
        confidence += np.random.uniform(-0.05, 0.05)
        confidence = max(0.35, min(0.95, confidence))
        
        return best_type, confidence
    
    def get_category_name(self, class_idx):
        """Legacy method for compatibility"""
        category_mapping = {
            0: 'recyclable_paper',
            1: 'recyclable_plastic', 
            2: 'recyclable_glass',
            3: 'recyclable_metal',
            4: 'organic_food',
            5: 'organic_yard',
            6: 'landfill_general',
            7: 'hazardous',
            8: 'e_waste'
        }
        return category_mapping.get(class_idx, 'landfill_general')

if __name__ == "__main__":
    classifier = AdvancedWasteClassifier()
    
    print("Classifier ready for testing!")
    print("\nTest with different colored images:")
    
    test_cases = [
        ("Brown/Tan (Paper)", np.full((224, 224, 3), [139, 180, 210], dtype=np.uint8)),
        ("Blue (Plastic)", np.full((224, 224, 3), [200, 100, 50], dtype=np.uint8)),
        ("Green (Yard)", np.full((224, 224, 3), [50, 180, 50], dtype=np.uint8)),
        ("White/Clear (Glass)", np.full((224, 224, 3), [240, 240, 240], dtype=np.uint8)),
        ("Gray (Metal)", np.full((224, 224, 3), [150, 150, 150], dtype=np.uint8)),
    ]
    
    for name, test_img in test_cases:
        result = classifier.predict(test_img)
        print(f"\n{name}:")
        print(f"  Classified as: {result['waste_type']}")
        print(f"  Confidence: {result['confidence']*100:.1f}%")