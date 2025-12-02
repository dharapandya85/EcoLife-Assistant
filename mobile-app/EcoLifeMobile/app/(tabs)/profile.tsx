import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const API_BASE = "http://10.219.49.127:5500";

interface UserProfile {
  username: string;
  email: string;
  total_scans: number;
  recycling_score: number;
  co2_saved: number;
  member_since: string;
  location: string;
  waste_breakdown: { type: string; count: number }[];
  achievements: { type: string; earned_at: string }[];
}

interface ImpactData {
  total_co2_saved_kg: number;
  total_water_saved_liters: number;
  total_energy_saved_kwh: number;
  equivalents: {
    trees_planted: number;
    cars_off_road_days: number;
    smartphones_charged: number;
    miles_not_driven: number;
  };
  environmental_rank: {
    level: string;
    icon: string;
    next_level: number | null;
  };
}

const ProfileIcon = () => (
  <Svg width="96" height="96" viewBox="0 0 96 96">
    <Defs>
      <LinearGradient id="profileGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#0F766E" stopOpacity="1" />
        <Stop offset="1" stopColor="#134E4A" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Circle cx="48" cy="32" r="16" fill="url(#profileGradient)" />
    <Path
      d="M24 76C24 60 36 48 48 48C60 48 72 60 72 76"
      stroke="url(#profileGradient)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <Circle cx="48" cy="48" r="46" stroke="#D1FAE5" strokeWidth="1" opacity="0.3" />
  </Svg>
);

const TrophyIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28">
    <Defs>
      <LinearGradient id="trophyGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#F59E0B" stopOpacity="1" />
        <Stop offset="1" stopColor="#D97706" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M8 20H20M14 20V24M6 24H22M14 6V8M5 8H23C24.105 8 25 8.895 25 10V13C25 15.485 22.985 17.5 20.5 17.5H7.5C5.015 17.5 3 15.485 3 13V10C3 8.895 3.895 8 5 8Z"
      stroke="url(#trophyGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 12C16.209 12 18 10.209 18 8H10C10 10.209 11.791 12 14 12Z"
      fill="url(#trophyGradient)"
    />
  </Svg>
);

const ChartIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28">
    <Defs>
      <LinearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#059669" stopOpacity="1" />
        <Stop offset="1" stopColor="#047857" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M4 4V24H24"
      stroke="url(#chartGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 16L13 11L17 15L22 10"
      stroke="url(#chartGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8" cy="16" r="2" fill="url(#chartGradient)" />
    <Circle cx="13" cy="11" r="2" fill="url(#chartGradient)" />
    <Circle cx="17" cy="15" r="2" fill="url(#chartGradient)" />
    <Circle cx="22" cy="10" r="2" fill="url(#chartGradient)" />
  </Svg>
);

const ImpactIcon = () => (
  <Svg width="28" height="28" viewBox="0 0 28 28">
    <Defs>
      <LinearGradient id="impactGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#10B981" stopOpacity="1" />
        <Stop offset="1" stopColor="#059669" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Circle cx="14" cy="14" r="12" stroke="url(#impactGradient)" strokeWidth="2" />
    <Path
      d="M14 4C14 4 7 10 7 14C7 17.314 9.686 20 13 20C16.314 20 19 17.314 19 14C19 10 14 4 14 4Z"
      fill="url(#impactGradient)"
    />
    <Circle cx="14" cy="14" r="3" fill="white" />
  </Svg>
);

const LeafIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Defs>
      <LinearGradient id="leafGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#059669" stopOpacity="1" />
        <Stop offset="1" stopColor="#047857" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M10 2C6 2 2 6 2 10C2 14 6 18 10 18C14 18 18 14 18 10C18 6 14 2 10 2Z"
      stroke="url(#leafGradient)"
      strokeWidth="1.5"
      fill="none"
    />
    <Path
      d="M10 2C10 2 7 5 7 9C7 11.5 8.5 13.5 10.5 13.5C12.5 13.5 14 11.5 14 9C14 5 10 2 10 2Z"
      fill="url(#leafGradient)"
    />
  </Svg>
);

const CarIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Defs>
      <LinearGradient id="carGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#8B5CF6" stopOpacity="1" />
        <Stop offset="1" stopColor="#7C3AED" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Rect x="3" y="7" width="14" height="6" rx="2" fill="url(#carGradient)" />
    <Circle cx="7" cy="14" r="2" fill="#374151" />
    <Circle cx="13" cy="14" r="2" fill="#374151" />
    <Path d="M5 7L7 4H13L15 7" fill="url(#carGradient)" />
  </Svg>
);

const BatteryIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Defs>
      <LinearGradient id="batteryGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#F59E0B" stopOpacity="1" />
        <Stop offset="1" stopColor="#D97706" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Rect x="4" y="6" width="12" height="8" rx="1" fill="url(#batteryGradient)" />
    <Rect x="16" y="8" width="1" height="4" fill="#374151" />
    <Path d="M7 9H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

const WaterIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Defs>
      <LinearGradient id="waterGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#3B82F6" stopOpacity="1" />
        <Stop offset="1" stopColor="#1D4ED8" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M10 2L13 6C15 8.5 16 11 16 14C16 17.314 13.314 20 10 20C6.686 20 4 17.314 4 14C4 11 5 8.5 7 6L10 2Z"
      fill="url(#waterGradient)"
    />
    <Path d="M10 2V20" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
  </Svg>
);

const WasteTypeIcon = ({ type }: { type: string }) => {
  if (type.includes('recyclable')) {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="10" stroke="#059669" strokeWidth="2" fill="none" />
        <Path d="M9 9L15 15M15 9L9 15" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }
  if (type.includes('organic')) {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="10" stroke="#D97706" strokeWidth="2" fill="none" />
        <Path d="M8 12H16M12 8V16" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }
  if (type === 'hazardous') {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="10" stroke="#DC2626" strokeWidth="2" fill="none" />
        <Path d="M12 8V12M12 16H12.01" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke="#6B7280" strokeWidth="2" fill="none" />
      <Circle cx="12" cy="12" r="4" fill="#6B7280" />
    </Svg>
  );
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'impact' | 'achievements'>('stats');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const profileResponse = await fetch(`${API_BASE}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const impactResponse = await fetch(`${API_BASE}/impact`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (profileResponse.ok && impactResponse.ok) {
        const profileData = await profileResponse.json();
        const impactData = await impactResponse.json();
        setProfile(profileData);
        setImpact(impactData);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  const renderProgressBar = (value: number, max: number, color: string) => (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBarBackground}>
        <View 
          style={[
            styles.progressBarFill, 
            { width: `${Math.min((value / max) * 100, 100)}%`, backgroundColor: color }
          ]} 
        />
      </View>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressText}>{value.toFixed(1)}</Text>
        <Text style={styles.progressMax}>/{max} kg</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.loadingText}>Loading Profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <ProfileIcon />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{profile?.username || 'Eco Warrior'}</Text>
              <Text style={styles.memberSince}>
                Member since {profile?.member_since ? new Date(profile.member_since).getFullYear() : '2024'}
              </Text>
            </View>
          </View>
          
          {impact?.environmental_rank && (
            <View style={styles.rankContainer}>
              <View style={styles.rankBadge}>
                <View style={styles.rankIconBackground}>
                  <Text style={styles.rankIcon}>{impact.environmental_rank.icon}</Text>
                </View>
                <View>
                  <Text style={styles.rankLabel}>Current Rank</Text>
                  <Text style={styles.rankText}>{impact.environmental_rank.level}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <View style={[styles.tabIndicator, activeTab === 'stats' && styles.activeTabIndicator]} />
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              Statistics
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'impact' && styles.activeTab]}
            onPress={() => setActiveTab('impact')}
          >
            <View style={[styles.tabIndicator, activeTab === 'impact' && styles.activeTabIndicator]} />
            <Text style={[styles.tabText, activeTab === 'impact' && styles.activeTabText]}>
              Impact
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
            onPress={() => setActiveTab('achievements')}
          >
            <View style={[styles.tabIndicator, activeTab === 'achievements' && styles.activeTabIndicator]} />
            <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {activeTab === 'stats' && (
            <>
              <View style={styles.statsGrid}>
                {renderStatCard('Total Scans', profile?.total_scans || 0, <ChartIcon />)}
                {renderStatCard('Eco Score', `${profile?.recycling_score || 0}%`, <TrophyIcon />)}
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Waste Analysis</Text>
                  <Text style={styles.sectionSubtitle}>Detailed breakdown</Text>
                </View>
                {profile?.waste_breakdown?.map((item, index) => (
                  <View key={index} style={styles.wasteItem}>
                    <View style={styles.wasteTypeContainer}>
                      <WasteTypeIcon type={item.type} />
                      <Text style={styles.wasteType}>
                        {item.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                    <View style={styles.wasteStats}>
                      <Text style={styles.wasteCount}>{item.count}</Text>
                      <View style={styles.wasteBar}>
                        <View 
                          style={[
                            styles.wasteBarFill,
                            { 
                              width: `${(item.count / (profile?.total_scans || 1)) * 100}%`,
                              backgroundColor: getWasteColor(item.type)
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {activeTab === 'impact' && impact && (
            <>
              <View style={styles.impactHeader}>
                <ImpactIcon />
                <View style={styles.impactTitleContainer}>
                  <Text style={styles.impactTitle}>Environmental Impact</Text>
                  <Text style={styles.impactSubtitle}>
                    {impact.total_co2_saved_kg.toFixed(1)} kg CO₂ saved
                  </Text>
                </View>
              </View>

              <View style={styles.equivalentsGrid}>
                <View style={styles.equivalentCard}>
                  <View style={styles.equivalentIcon}>
                    <LeafIcon />
                  </View>
                  <Text style={styles.equivalentValue}>
                    {impact.equivalents.trees_planted.toFixed(1)}
                  </Text>
                  <Text style={styles.equivalentLabel}>Trees Planted</Text>
                </View>
                <View style={styles.equivalentCard}>
                  <View style={styles.equivalentIcon}>
                    <CarIcon />
                  </View>
                  <Text style={styles.equivalentValue}>
                    {impact.equivalents.cars_off_road_days.toFixed(1)}
                  </Text>
                  <Text style={styles.equivalentLabel}>Car Days</Text>
                </View>
                <View style={styles.equivalentCard}>
                  <View style={styles.equivalentIcon}>
                    <BatteryIcon />
                  </View>
                  <Text style={styles.equivalentValue}>
                    {impact.equivalents.smartphones_charged.toFixed(0)}
                  </Text>
                  <Text style={styles.equivalentLabel}>Charges</Text>
                </View>
                <View style={styles.equivalentCard}>
                  <View style={styles.equivalentIcon}>
                    <WaterIcon />
                  </View>
                  <Text style={styles.equivalentValue}>
                    {(impact.total_water_saved_liters / 1000).toFixed(1)}k
                  </Text>
                  <Text style={styles.equivalentLabel}>Water Saved</Text>
                </View>
              </View>

              {impact.environmental_rank.next_level && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Rank Progress</Text>
                    <Text style={styles.sectionSubtitle}>Next: {impact.environmental_rank.next_level} kg</Text>
                  </View>
                  {renderProgressBar(
                    impact.total_co2_saved_kg,
                    impact.environmental_rank.next_level,
                    '#059669'
                  )}
                </View>
              )}
            </>
          )}

          {activeTab === 'achievements' && (
            <View style={styles.achievementsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Achievements</Text>
                <Text style={styles.sectionSubtitle}>{profile?.achievements?.length || 0} earned</Text>
              </View>
              <View style={styles.achievementsGrid}>
                {profile?.achievements?.map((achievement, index) => (
                  <View key={index} style={styles.achievementCard}>
                    <View style={styles.achievementIconContainer}>
                      <Svg width="32" height="32" viewBox="0 0 32 32">
                        <Defs>
                          <LinearGradient id="achievementGradient" x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0" stopColor="#F59E0B" stopOpacity="1" />
                            <Stop offset="1" stopColor="#D97706" stopOpacity="1" />
                          </LinearGradient>
                        </Defs>
                        <Circle cx="16" cy="16" r="14" fill="url(#achievementGradient)" />
                        <Path
                          d="M12 16L15 19L21 13"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                    <View style={styles.achievementContent}>
                      <Text style={styles.achievementTitle}>
                        {achievement.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                      <Text style={styles.achievementDate}>
                        {new Date(achievement.earned_at).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                )) || (
                  <View style={styles.emptyAchievements}>
                    <Svg width="64" height="64" viewBox="0 0 64 64">
                      <Circle cx="32" cy="32" r="30" stroke="#E5E7EB" strokeWidth="2" fill="none" />
                      <Path
                        d="M24 32H40M32 24V40"
                        stroke="#E5E7EB"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </Svg>
                    <Text style={styles.emptyText}>No achievements yet</Text>
                    <Text style={styles.emptySubtext}>Start scanning to earn achievements</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getWasteColor(type: string): string {
  if (type.includes('recyclable')) return '#059669';
  if (type.includes('organic')) return '#D97706';
  if (type === 'hazardous') return '#DC2626';
  if (type === 'e_waste') return '#8B5CF6';
  return '#6B7280';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#0F766E',
    fontFamily: 'System',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  memberSince: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
  },
  rankContainer: {
    marginTop: 8,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  rankIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F766E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rankLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F766E',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {},
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    backgroundColor: 'transparent',
  },
  activeTabIndicator: {
    backgroundColor: '#0F766E',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: '#0F766E',
  },
  content: {
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
  },
  wasteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  wasteTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wasteType: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    marginLeft: 12,
  },
  wasteStats: {
    alignItems: 'flex-end',
    flex: 1,
  },
  wasteCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  wasteBar: {
    width: 120,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  wasteBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  impactTitleContainer: {
    marginLeft: 16,
  },
  impactTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  impactSubtitle: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '500',
  },
  equivalentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  equivalentCard: {
    width: (width - 72) / 2,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  equivalentIcon: {
    marginBottom: 12,
  },
  equivalentValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  equivalentLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  progressMax: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
  },
  achievementsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  achievementsGrid: {
    gap: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  achievementIconContainer: {
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '400',
  },
  emptyAchievements: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
});