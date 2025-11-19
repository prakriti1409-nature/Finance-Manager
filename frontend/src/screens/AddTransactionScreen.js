import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/mockApi';
import { COLORS } from '../theme/colors';

export default function AddTransactionScreen({ navigation }) {
  const [category, setCategory] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const buttonScale = useSharedValue(1);

  const validate = () => {
    if (!amount || isNaN(amount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid numeric amount');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description');
      return false;
    }
    return true;
  };

  const addTransaction = async () => {
    if (!validate()) return;
    buttonScale.value = withSpring(0.95);
    setTimeout(() => buttonScale.value = withSpring(1), 100);
    
    setLoading(true);
    try {
      await api.post('transactions/', {
        category,
        amount: parseFloat(amount),
        description: description.trim(),
      });
      Alert.alert('Success! ✨', 'Transaction added successfully');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Unable to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const CategoryButton = ({ type, label, emoji }) => (
    <TouchableOpacity onPress={() => setCategory(type)}>
      <LinearGradient
        colors={category === type ? COLORS.gradient2 : [COLORS.surface, COLORS.surface]}
        style={[styles.categoryBtn, category === type && styles.categoryBtnActive]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <Text style={styles.categoryEmoji}>{emoji}</Text>
        <Text style={[styles.categoryLabel, category === type && styles.categoryLabelActive]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.addContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.addTitle}>Add Transaction</Text>
          <Text style={styles.addSubtitle}>Keep track of your finances</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryContainer}>
            <CategoryButton type="expense" label="Expense" emoji="💸" />
            <CategoryButton type="income" label="Income" emoji="💰" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.amountInput}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              theme={{ colors: { text: COLORS.text, placeholder: COLORS.textSecondary } }}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What's this for?"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.input}
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            theme={{ colors: { text: COLORS.text, placeholder: COLORS.textSecondary, background: COLORS.surface } }}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()} style={buttonStyle}>
          <TouchableOpacity onPress={addTransaction} disabled={loading}>
            <LinearGradient colors={COLORS.gradient1} style={styles.submitButton}>
              <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Add Transaction'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  addContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  addTitle: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 40,
  },
  addSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryBtn: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  categoryBtnActive: {
    borderColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: COLORS.text,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencySymbol: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
