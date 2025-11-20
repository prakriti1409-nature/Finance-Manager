import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { addGoal } from '../services/goals';
import { COLORS } from '../theme/colors';

export default function AddGoalScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const onAdd = async () => {
    if (!title || !target || !deadline) {
      return Alert.alert('Missing', 'Please fill all fields');
    }
    setLoading(true);
    try {
      await addGoal({ title, target_amount: parseFloat(target), deadline, note: '' });
      Alert.alert('Success', 'Goal added');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Unable to add goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{flex:1, padding:16, backgroundColor: COLORS.background}}>
      <Text style={{fontSize:22, marginBottom:12}}>Add Goal</Text>
      <TextInput label="Title" value={title} onChangeText={setTitle} style={{marginBottom:10}} />
      <TextInput label="Target Amount" value={target} onChangeText={setTarget} keyboardType="numeric" style={{marginBottom:10}} />
      <TextInput label="Deadline (YYYY-MM-DD)" value={deadline} onChangeText={setDeadline} style={{marginBottom:10}} />
      <Button mode="contained" onPress={onAdd} loading={loading}>Add Goal</Button>
    </View>
  );
}
