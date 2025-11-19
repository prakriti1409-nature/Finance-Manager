import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/mockApi';
import { COLORS } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('new_user');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const register = async () => {
    setLoading(true);
    try {
      await api.post('register/', { username, password });
      Alert.alert('Success! 🎉', 'Account created successfully. Please login.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Failed', e.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.regContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[COLORS.background, COLORS.surface]} style={styles.gradient}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerContainer}>
          <Text style={styles.regTitle}>Create Account</Text>
          <Text style={styles.regSubtitle}>Join us and take control of your finances</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formCard}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              placeholderTextColor={COLORS.textSecondary}
              style={[styles.input, focusedField === 'username' && styles.inputFocused]}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{ colors: { text: COLORS.text, placeholder: COLORS.textSecondary } }}
              left={<TextInput.Icon icon="account-plus" color={focusedField === 'username' ? COLORS.primary : COLORS.textSecondary} />}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a strong password"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              style={[styles.input, focusedField === 'password' && styles.inputFocused]}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{ colors: { text: COLORS.text, placeholder: COLORS.textSecondary } }}
              left={<TextInput.Icon icon="lock-plus" color={focusedField === 'password' ? COLORS.primary : COLORS.textSecondary} />}
            />
          </View>

          <TouchableOpacity onPress={register} disabled={loading}>
            <LinearGradient colors={COLORS.gradient2} style={styles.regButton}>
              <Text style={styles.regButtonText}>{loading ? 'Creating Account...' : 'Register'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backText}>Already have an account? <Text style={styles.backTextBold}>Sign In</Text></Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  regContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
  },
  regTitle: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  regSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  regButton: {
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
  regButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  backTextBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});