import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AuthService from '../../services/authService';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect, G } from 'react-native-svg';

const LeafPattern = () => (
  <Svg width="400" height="400" viewBox="0 0 400 400" opacity="0.03" style={styles.backgroundPattern}>
    <Defs>
      <LinearGradient id="leafPatternGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#0F766E" stopOpacity="1" />
        <Stop offset="1" stopColor="#134E4A" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Path
      d="M200,100 C250,80 300,120 280,180 C260,240 180,260 120,220 C60,180 40,120 80,80 C120,40 180,60 200,100 Z"
      fill="url(#leafPatternGradient)"
    />
    <Path
      d="M100,300 C120,280 160,290 170,320 C180,350 150,380 120,370 C90,360 80,330 90,300 C100,270 80,320 100,300 Z"
      fill="url(#leafPatternGradient)"
    />
    <Path
      d="M320,320 C340,300 370,310 350,340 C330,370 300,350 290,320 C280,290 300,340 320,320 Z"
      fill="url(#leafPatternGradient)"
    />
  </Svg>
);

const AuthIcon = () => (
  <Svg width="80" height="80" viewBox="0 0 80 80">
    <Defs>
      <LinearGradient id="authGradient" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#0F766E" stopOpacity="1" />
        <Stop offset="1" stopColor="#134E4A" stopOpacity="1" />
      </LinearGradient>
    </Defs>
    <Circle cx="40" cy="40" r="38" stroke="url(#authGradient)" strokeWidth="2" fill="none" />
    <Path
      d="M40 20C30 20 22 28 22 38C22 48 30 56 40 56C50 56 58 48 58 38C58 28 50 20 40 20Z"
      stroke="url(#authGradient)"
      strokeWidth="2"
      fill="none"
    />
    <Circle cx="40" cy="38" r="12" fill="url(#authGradient)" opacity="0.1" />
    <Path
      d="M40 32L44 36L48 32"
      stroke="url(#authGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Path
      d="M40 44L44 40L48 44"
      stroke="url(#authGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const EmailIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Rect x="2" y="4" width="16" height="12" rx="2" stroke="#64748B" strokeWidth="1.5" fill="none" />
    <Path d="M2 6L10 11L18 6" stroke="#64748B" strokeWidth="1.5" fill="none" />
  </Svg>
);

const UserIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Circle cx="10" cy="6" r="3" stroke="#64748B" strokeWidth="1.5" fill="none" />
    <Path
      d="M16 16C16 12 13 9 10 9C7 9 4 12 4 16"
      stroke="#64748B"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);

const LockIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 20 20">
    <Rect x="4" y="8" width="12" height="9" rx="2" stroke="#64748B" strokeWidth="1.5" fill="none" />
    <Path d="M6 8V5C6 3.343 7.343 2 9 2H11C12.657 2 14 3.343 14 5V8" stroke="#64748B" strokeWidth="1.5" fill="none" />
    <Circle cx="10" cy="12" r="1" fill="#64748B" />
  </Svg>
);

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username || !password || (!isLogin && !email)) {
      Alert.alert('Required', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await AuthService.login(username, password);
        Alert.alert('Welcome', 'Logged in successfully');
      } else {
        await AuthService.register(username, email, password);
        Alert.alert('Success', 'Account created successfully');
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LeafPattern />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <AuthIcon />
          </View>
          <Text style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to continue your eco-journey' : 'Join our sustainability community'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <UserIcon />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#94A3B8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {!isLogin && (
            <View style={styles.inputContainer}>
              <View style={styles.inputIcon}>
                <EmailIcon />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <LockIcon />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.9}
          >
            <View style={styles.buttonGradient}>
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
            activeOpacity={0.7}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchHighlight}>
                {isLogin ? 'Register' : 'Sign In'}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    paddingLeft: 20,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    paddingRight: 20,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '400',
  },
  button: {
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    backgroundColor: '#0F766E',
    paddingVertical: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  switchButton: {
    paddingVertical: 12,
  },
  switchText: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '400',
  },
  switchHighlight: {
    color: '#0F766E',
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});