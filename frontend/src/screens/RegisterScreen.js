import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import api from "../api/axios";
import { COLORS } from "../theme/colors";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    // Clear errors as user types
    setErrors({ ...errors, [field]: "" });

    // Live validation
    if (field === "confirmPassword" || field === "password") {
      if (form.password !== value && field === "confirmPassword") {
        setErrors({ ...errors, confirmPassword: "Passwords do not match" });
      }
    }
  };

  const isValid =
    form.username &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword;

  const register = async () => {
    if (!isValid) {
      Alert.alert("Invalid Input", "Please fill all fields correctly.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        confirm_password: form.confirmPassword,
        first_name: form.firstName,
        last_name: form.lastName,
      };

      console.log("Payload:", payload);

      await api.post("register/", payload);

      Alert.alert("Success! 🎉", "Account created successfully.");
      navigation.goBack();
    } catch (e) {
      console.log("REGISTER ERROR:", e.response?.data);
      Alert.alert(
        "Registration Failed",
        JSON.stringify(e.response?.data) || e.message
      );
    } finally {
      setLoading(false);
    }
  };

  const Input = ({
    label,
    value,
    field,
    icon,
    secureText,
    toggleSecure,
    keyboard = "default",
  }) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={(text) => handleChange(field, text)}
        placeholder={`Enter ${label}`}
        placeholderTextColor={COLORS.textSecondary}
        secureTextEntry={secureText}
        onFocus={() => setFocused(field)}
        onBlur={() => setFocused(null)}
        keyboardType={keyboard}
        mode="outlined"
        theme={{
          colors: {
            text: COLORS.text,
            placeholder: COLORS.textSecondary,
            primary: COLORS.primary,
            outline: COLORS.border,
          },
        }}
        style={styles.input}
        left={<TextInput.Icon icon={icon} />}
        right={
          toggleSecure ? (
            <TextInput.Icon
              icon={secureText ? "eye-off" : "eye"}
              onPress={toggleSecure}
            />
          ) : null
        }
      />

      {errors[field] ? (
        <Text style={styles.error}>{errors[field]}</Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.regContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient colors={[COLORS.background, COLORS.surface]} style={styles.gradient}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.headerContainer}>
          <Text style={styles.regTitle}>Create Account</Text>
          <Text style={styles.regSubtitle}>Join us and manage your money smarter</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formCard}>
          <Input label="Username" value={form.username} field="username" icon="account" />
          <Input label="Email" value={form.email} field="email" icon="email" keyboard="email-address" />
          <Input label="First Name" value={form.firstName} field="firstName" icon="account" />
          <Input label="Last Name" value={form.lastName} field="lastName" icon="account" />

          <Input
            label="Password"
            value={form.password}
            field="password"
            icon="lock"
            secureText={secure}
            toggleSecure={() => setSecure(!secure)}
          />

          <Input
            label="Confirm Password"
            value={form.confirmPassword}
            field="confirmPassword"
            icon="lock-check"
            secureText={secureConfirm}
            toggleSecure={() => setSecureConfirm(!secureConfirm)}
          />

          <TouchableOpacity
            onPress={register}
            disabled={loading || !isValid}
            style={{ opacity: loading || !isValid ? 0.5 : 1 }}
          >
            <LinearGradient colors={COLORS.gradient2} style={styles.regButton}>
              <Text style={styles.regButtonText}>
                {loading ? "Creating Account..." : "Register"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backText}>
              Already have an account? <Text style={styles.backTextBold}>Sign In</Text>
            </Text>
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
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 40,
  },
  regTitle: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "bold",
  },
  regSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 5,
  },
  regButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  regButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  backLink: {
    marginTop: 20,
    alignItems: "center",
  },
  backText: {
    color: COLORS.textSecondary,
  },
  backTextBold: {
    color: COLORS.primary,
  },
});
