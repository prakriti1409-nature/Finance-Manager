import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';

const CATEGORY_ICONS = {
  expense: '💸',
  income: '💰',
  food: '🍔',
  transport: '🚗',
  shopping: '🛒',
  entertainment: '🎬',
  default: '💳',
};

export default function TransactionItem({ item }) {
  const isIncome = item.category.toLowerCase() === 'income';
  const icon = CATEGORY_ICONS[item.category.toLowerCase()] || CATEGORY_ICONS.default;

  return (
    <TouchableOpacity>
      <View style={styles.itemContainer}>
        <View style={[styles.iconContainer, { backgroundColor: isIncome ? COLORS.success + '20' : COLORS.error + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.category}>{item.category.toUpperCase()}</Text>
        </View>
        <Text style={[styles.amount, { color: isIncome ? COLORS.success : COLORS.error }]}>
          {isIncome ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  description: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
