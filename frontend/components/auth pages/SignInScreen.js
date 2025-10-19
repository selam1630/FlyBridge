import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Header from '../Header';
import { AuthContext } from '../context/AuthContext';

const COLORS = {
  BACKGROUND_LIGHT: '#F7F8FC',
  BACKGROUND_DARK: '#2D4B46',
  ACCENT_GOLD: '#FFB733',
  TEXT_DARK: '#333333',
  TEXT_LIGHT: '#FFFFFF',
  INPUT_BG: 'rgba(45, 75, 70, 0.05)',
  CARD_BG: '#FFFFFF',
  STATUS_GREEN: '#4CAF50',
  STATUS_RED: '#FF4C4C',
};

export default function SignInScreen() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('sender');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

 const handleSignIn = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please fill all fields');
    setMessage('Please fill all fields');
    return;
  }

  setLoading(true);
  setMessage('');

  try {
    // Call login from AuthContext; it now returns { token, user } or null
    const data = await login(email, password, role);

    if (!data) {
      // Login failed
      return;
    }

    const { token, user } = data;

    // Optional: handle pending approval / phone verification messages if needed
    if (user?.isApproved === false && role !== 'receiver' && role !== 'agent') {
      Alert.alert('Approval Pending', 'Your account is pending agent approval. Please wait.');
      setMessage('Your account is pending agent approval.');
      return;
    }

    if ((role === 'sender' || role === 'carrier') && !user?.phoneVerified) {
      Alert.alert('Phone Verification', 'Please verify your phone number before logging in.');
      setMessage('Please verify your phone number.');
      return;
    }

    // Successful login
    setMessage('Login successful!');
    Alert.alert('Success', 'Login successful!');

    if (role === 'agent') {
      navigation.navigate('AgentChat', {
        agentId: user.id,
        token, // token is correctly passed
      });
    } else {
      navigation.navigate('Dashboard', { role });
    }

  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Error', 'An error occurred. Please try again.');
    setMessage('An error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <LinearGradient
      colors={[COLORS.BACKGROUND_LIGHT, COLORS.BACKGROUND_LIGHT]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.logo}>SwiftLink</Text>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              {['sender', 'carrier', 'agent', 'receiver'].map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[
                    styles.roleButton,
                    { backgroundColor: role === r ? COLORS.ACCENT_GOLD : '#eee' },
                  ]}
                >
                  <Text
                    style={{
                      color: role === r ? COLORS.BACKGROUND_DARK : '#333',
                      fontWeight: 'bold',
                    }}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Message Display */}
            {message ? (
              <Text
                style={[
                  styles.message,
                  {
                    color: message.includes('successful')
                      ? COLORS.STATUS_GREEN
                      : COLORS.STATUS_RED,
                  },
                ]}
              >
                {message}
              </Text>
            ) : null}

            {/* Inputs */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInBtn, loading && { opacity: 0.6 }]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.signInText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don’t have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.link}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BACKGROUND_LIGHT },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  card: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 15,
    padding: 25,
    width: '90%',
    maxWidth: 450,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: { color: COLORS.ACCENT_GOLD, fontSize: 30, fontWeight: 'bold', alignSelf: 'center', marginBottom: 20 },
  title: { color: COLORS.TEXT_DARK, fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  subtitle: { color: '#888', textAlign: 'center', marginBottom: 30, fontSize: 14 },
  roleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' },
  roleButton: {
    margin: 5,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  message: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.INPUT_BG,
    borderRadius: 10,
    padding: 15,
    color: COLORS.TEXT_DARK,
    marginBottom: 15,
    width: '100%',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(45, 75, 70, 0.1)',
  },
  signInBtn: {
    backgroundColor: COLORS.ACCENT_GOLD,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: COLORS.ACCENT_GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  signInText: { color: COLORS.BACKGROUND_DARK, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
  footerText: { color: COLORS.TEXT_DARK, fontSize: 14 },
  link: { color: COLORS.ACCENT_GOLD, fontWeight: 'bold', fontSize: 14 },
});
