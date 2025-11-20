import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getGoals, deleteGoal } from '../services/goals';
import GoalItem from '../components/GoalItem';
import { COLORS } from '../theme/colors';

export default function GoalsScreen({ navigation }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (e) {
      Alert.alert('Error', 'Unable to load goals');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (e) {
      Alert.alert('Error', 'Unable to delete goal');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.bgStart, COLORS.bgEnd]} style={styles.header}>
        <Text style={styles.headerTitle}>Goals</Text>
        <Button title="Add Goal" onPress={() => navigation.navigate('AddGoal')} />
      </LinearGradient>
      <FlatList
        data={goals}
        keyExtractor={(item) => String(item.id)}
        renderItem={({item}) => <GoalItem item={item} onDelete={onDelete} />}
        contentContainerStyle={{padding:16}}
        refreshing={loading}
        onRefresh={fetchGoals}
        ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>No goals yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: COLORS.background },
  header: { padding: 16 },
  headerTitle: { fontSize: 24, color: COLORS.text, fontWeight: '700' },
});
