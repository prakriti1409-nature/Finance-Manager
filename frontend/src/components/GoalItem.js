import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

export default function GoalItem({ item, onDelete }) {
  const progress = item.current_amount ? Math.min(item.current_amount / item.target_amount, 1) : 0;
  return (
    <View style={styles.card}>
      <View style={{flex:1}}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub}>{`Target: ₹${item.target_amount}`}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress*100}%` }]} />
        </View>
        <Text style={styles.sub}>{`Deadline: ${item.deadline}`}</Text>
      </View>
      <TouchableOpacity onPress={() => onDelete && onDelete(item.id)} style={styles.deleteBtn}>
        <Text style={{color: COLORS.danger}}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6 },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  deleteBtn: {
    marginLeft: 12,
  },
});
