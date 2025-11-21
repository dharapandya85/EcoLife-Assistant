import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const API_BASE = 'http://10.219.49.127:5500';

type WasteType = 'recyclable' | 'organic' | 'landfill';

interface WasteResult {
  waste_type: WasteType;
  confidence: number;
  tips: string[];
  error?: string;
}

interface ProductResult {
  sustainability_score: number;
  found_keywords: string[];
  extracted_text: string;
  error?: string;
}

type ApiResult = WasteResult | ProductResult | { error: string; details?: string };

const CameraIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2"/>
  </Svg>
);

const GalleryIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M4 16L8.586 11.414C8.96106 11.0391 9.46967 10.8284 10 10.8284C10.5303 10.8284 11.0389 11.0391 11.414 11.414L16 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M14 14L15.586 12.414C15.9611 12.0391 16.4697 11.8284 17 11.8284C17.5303 11.8284 18.0389 12.0391 18.414 12.414L20 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
  </Svg>
);

const AnalyzeIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const RecyclableIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path d="M16 2L20 6L16 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8 22L4 18L8 14" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M20 6H10C8.93913 6 7.92172 6.42143 7.17157 7.17157C6.42143 7.92172 6 8.93913 6 10V18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M4 18H14C15.0609 18 16.0783 17.5786 16.8284 16.8284C17.5786 16.0783 18 15.0609 18 14V6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const OrganicIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7.5 10.5C7.5 10.5 8.25 12 9.75 12C11.25 12 12 10.5 12 10.5C12 10.5 12.75 12 14.25 12C15.75 12 16.5 10.5 16.5 10.5" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 16C9 16 9.75 17 12 17C14.25 17 15 16 15 16" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const LandfillIcon = () => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path d="M3 6H5H21" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#10B981" : "none"}>
    <Path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const TipIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 16V12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 8H12.01" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ECO_TIPS = {
  recyclable: [
    "Rinse containers thoroughly to prevent contamination",
    "Flatten cardboard boxes to maximize recycling space",
    "Verify local recycling guidelines for specific materials",
    "Remove labels and caps for better processing efficiency",
    "Consider upcycling glass containers for storage",
    "Aluminum maintains quality through infinite recycling"
  ],
  organic: [
    "Establish compost system for food and yard waste",
    "Balance green and brown materials for optimal compost",
    "Maintain proper moisture levels in compost",
    "Aerate compost weekly for faster decomposition",
    "Use finished compost as organic soil amendment",
    "Exclude meat and dairy to prevent pests"
  ],
  landfill: [
    "Reduce single-use items by 30% monthly",
    "Develop repair skills to extend product life",
    "Organize community exchange events",
    "Choose minimal and recyclable packaging",
    "Invest in durable, long-lasting products",
    "Calculate and reduce carbon footprint"
  ]
};

export default function HomeScreen() {
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const takePicture = async (): Promise<void> => {
    setLoading(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        await classifyWaste(result.assets[0].base64);
      }
    } catch (error) {
      setResult({ error: 'Image capture failed' });
    }
    setLoading(false);
  };

  const pickImage = async (): Promise<void> => {
    setLoading(true);
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        await classifyWaste(result.assets[0].base64);
      }
    } catch (error) {
      setResult({ error: 'Image selection failed' });
    }
    setLoading(false);
  };

  const classifyWaste = async (base64Image: string): Promise<void> => {
    try {
      const response = await axios.post<WasteResult>(`${API_BASE}/classify-waste`, {
        image: base64Image
      }, {
        timeout: 10000,
        headers: {'Content-Type': 'application/json'}
      });
      
      const enhancedResult = {
        ...response.data,
        advanced_tips: ECO_TIPS[response.data.waste_type]
      };
      
      setResult(enhancedResult);
    } catch (error: any) {
      setResult({ error: `Connection failed: ${error.message}` });
    }
  };

  const analyzeProduct = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.post<ProductResult>(`${API_BASE}/analyze-product`, {
        image: 'demo'
      });
      
      const analysis = analyzeProductImpact(response.data.found_keywords);
      const enhancedResult = {
        ...response.data,
        sustainability_score: analysis.score,
        insights: analysis.insights,
        recommendation: getProductRecommendation(analysis.score)
      };
      
      setResult(enhancedResult);
    } catch (error: any) {
      setResult({ error: 'Analysis unavailable' });
    }
    setLoading(false);
  };

  const analyzeProductImpact = (keywords: string[]): { score: number; insights: string[] } => {
    let score = 5;
    const positiveKeywords = ['organic', 'biodegradable', 'compostable', 'recyclable', 'sustainable'];
    const negativeKeywords = ['plastic', 'chemical', 'toxic', 'pollution'];
    
    const positiveMatches = keywords.filter(kw => positiveKeywords.includes(kw.toLowerCase()));
    const negativeMatches = keywords.filter(kw => negativeKeywords.includes(kw.toLowerCase()));
    
    score += positiveMatches.length * 1.5;
    score -= negativeMatches.length * 2;
    score = Math.max(1, Math.min(10, Math.round(score)));
    
    const insights: string[] = [];
    if (positiveMatches.length > 0) insights.push(`Positive: ${positiveMatches.join(', ')}`);
    if (negativeMatches.length > 0) insights.push(`Improve: ${negativeMatches.join(', ')}`);
    if (score >= 8) insights.push("Excellent sustainable choice");
    else if (score >= 6) insights.push("Good environmental option");
    else insights.push("Consider alternatives");
    
    return { score, insights };
  };

  const getWasteColor = (type: WasteType) => {
    const colors: Record<WasteType, string> = { 
      recyclable: '#10B981', 
      organic: '#F59E0B', 
      landfill: '#6B7280' 
    };
    return { color: colors[type] };
  };

  const getWasteIcon = (type: WasteType) => {
    const icons = {
      recyclable: <RecyclableIcon />,
      organic: <OrganicIcon />,
      landfill: <LandfillIcon />
    };
    return icons[type];
  };

  const getScoreStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon key={i} filled={i < Math.floor(score / 2)} />
    ));
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#F59E0B';
    return '#EF4444';
  };

  const getProductRecommendation = (score: number): string => {
    if (score >= 8) return "Excellent Sustainable Choice";
    if (score >= 6) return "Good Environmental Option";
    if (score >= 4) return "Average Impact";
    return "High Environmental Impact";
  };

  const isWasteResult = (result: ApiResult): result is WasteResult & { advanced_tips?: string[] } => {
    return 'waste_type' in result;
  };

  const isProductResult = (result: ApiResult): result is ProductResult & { 
    insights?: string[]; 
    recommendation?: string;
  } => {
    return 'sustainability_score' in result;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>EcoLife</Text>
        <Text style={styles.subtitle}>Sustainability Intelligence</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Waste Classification</Text>
        <Text style={styles.cardDescription}>
          Identify waste categories using advanced computer vision
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={takePicture}>
            <CameraIcon />
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
            <GalleryIcon />
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Product Analysis</Text>
        <Text style={styles.cardDescription}>
          Evaluate environmental impact and sustainability metrics
        </Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={analyzeProduct}>
          <AnalyzeIcon />
          <Text style={styles.secondaryButtonText}>Analyze Product</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Processing Analysis</Text>
        </View>
      )}

      {result && !loading && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Analysis Results</Text>
          
          {'error' in result ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Service Unavailable</Text>
              <Text style={styles.errorDetail}>{result.error}</Text>
            </View>
          ) : (
            <>
              {isWasteResult(result) && (
                <>
                  <View style={styles.resultSection}>
                    <View style={styles.resultHeader}>
                      {getWasteIcon(result.waste_type)}
                      <Text style={[styles.resultValue, getWasteColor(result.waste_type)]}>
                        {result.waste_type.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.confidenceText}>
                      {Math.round(result.confidence * 100)}% confidence
                    </Text>
                  </View>

                  {result.advanced_tips && (
                    <View style={styles.tipsSection}>
                      <View style={styles.tipsHeader}>
                        <TipIcon />
                        <Text style={styles.tipsTitle}>Optimization Guidelines</Text>
                      </View>
                      {result.advanced_tips.map((tip, index) => (
                        <Text key={index} style={styles.tipText}>• {tip}</Text>
                      ))}
                    </View>
                  )}
                </>
              )}

              {isProductResult(result) && (
                <>
                  <View style={styles.resultSection}>
                    <Text style={styles.resultLabel}>Sustainability Rating</Text>
                    <View style={styles.ratingRow}>
                      <View style={styles.starsRow}>
                        {getScoreStars(result.sustainability_score)}
                      </View>
                      <Text style={[styles.scoreText, { color: getScoreColor(result.sustainability_score) }]}>
                        {result.sustainability_score}/10
                      </Text>
                    </View>
                    <Text style={styles.recommendationText}>
                      {result.recommendation}
                    </Text>
                  </View>

                  {result.insights && (
                    <View style={styles.insightsSection}>
                      <Text style={styles.resultLabel}>Analysis Insights</Text>
                      {result.insights.map((insight, index) => (
                        <Text key={index} style={styles.insightText}>• {insight}</Text>
                      ))}
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
    fontWeight: '400',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 14,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  secondaryButtonText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  resultSection: {
    marginBottom: 28,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  confidenceText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.2,
  },
  tipText: {
    fontSize: 15,
    color: '#374151',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '400',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  recommendationText: {
    fontSize: 15,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 6,
  },
  insightsSection: {
    marginBottom: 24,
  },
  resultLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  insightText: {
    fontSize: 15,
    color: '#374151',
    marginTop: 6,
    lineHeight: 22,
    fontWeight: '400',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDetail: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
  },
});