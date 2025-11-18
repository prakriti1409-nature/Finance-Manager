import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/mockApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/store';
import { COLORS } from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('demo_user');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const dispatch = useDispatch();
  const shakeAnim = useSharedValue(0);

  const login = async () => {
    setLoading(true);
    try {
      const res = await api.post('token/', { username, password });
      const token = res.data.access;
      dispatch(setCredentials({ user: username, token }));
      navigation.replace('Dashboard');
    } catch (e) {
      shakeAnim.value = withSequence(
        withSpring(-10),
        withSpring(10),
        withSpring(-10),
        withSpring(10),
        withSpring(0)
      );
      Alert.alert('Login failed', e.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  return (
    <KeyboardAvoidingView style={styles.loginContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[COLORS.background, COLORS.surface]} style={styles.gradient}>
        {/* Logo/Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.logoContainer}>
          <LinearGradient colors={COLORS.gradient1} style={styles.logoCircle}>
            <Text style={styles.logoText}>💰</Text>
          </LinearGradient>
          <Text style={styles.appName}>FinanceApp</Text>
          <Text style={styles.tagline}>Smart money management</Text>
        </Animated.View>

        {/* Login Form */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.formContainer, shakeStyle]}>
          <Text style={styles.loginTitle}>Welcome Back</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={COLORS.textSecondary}
              style={[styles.textInput, focusedField === 'username' && styles.textInputFocused]}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{ colors: { text: COLORS.text, placeholder: COLORS.textSecondary } }}
              left={<TextInput.Icon icon="account" color={focusedField === 'username' ? COLORS.primary : COLORS.textSecondary} />}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              style={[styles.textInput, focusedField === 'password' && styles.textInputFocused]}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{ colors: { text: COLORS.text, placeholder: COLORS.textSecondary } }}
              left={<TextInput.Icon icon="lock" color={focusedField === 'password' ? COLORS.primary : COLORS.textSecondary} />}
            />
          </View>

          <TouchableOpacity onPress={login} disabled={loading}>
            <LinearGradient colors={COLORS.gradient1} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerTextBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  logoText: {
    fontSize: 48,
  },
  appName: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loginTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  textInputFocused: {
    borderColor: COLORS.primary,
  },
  loginButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  registerTextBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
