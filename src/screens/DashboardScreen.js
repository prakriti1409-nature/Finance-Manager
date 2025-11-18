import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LineChart } from 'react-native-chart-kit';
import api from '../api/mockApi';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [score, setScore] = useState(null);
  const [forecast, setForecast] = useState([]);
  const balanceScale = useSharedValue(0);
  const scoreValue = useSharedValue(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const s = await api.get('score/');
      setScore(s.data);
      const f = await api.get('forecast/');
      setForecast(f.data.next_7_days || []);
      
      // Animate on load
      balanceScale.value = withSpring(1, { damping: 15 });
      scoreValue.value = withTiming(1, { duration: 1000 });
    } catch (e) {
      // ignore for demo
    }
  };

  const balanceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: balanceScale.value }],
  }));

  const QuickActionButton = ({ icon, label, onPress, gradient }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickAction}>
      <LinearGradient colors={gradient} style={styles.quickActionGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <Text style={styles.quickActionIcon}>{icon}</Text>
      </LinearGradient>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.dashContainer} showsVerticalScrollIndicator={false}>
      {/* Balance Card */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={balanceStyle}>
        <LinearGradient colors={COLORS.gradient1} style={styles.balanceCard} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>$24,567.89</Text>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceSubLabel}>Income</Text>
              <Text style={styles.balanceSubAmount}>+$5,420</Text>
            </View>
            <View>
              <Text style={styles.balanceSubLabel}>Expenses</Text>
              <Text style={styles.balanceSubAmount}>-$3,210</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.quickActionsContainer}>
        <QuickActionButton icon="+" label="Add" onPress={() => navigation.navigate('AddTransaction')} gradient={COLORS.gradient2} />
        <QuickActionButton icon="↔" label="Transfer" onPress={() => {}} gradient={COLORS.gradient3} />
        <QuickActionButton icon="📊" label="Stats" onPress={() => navigation.navigate('Transactions')} gradient={COLORS.gradient1} />
        <QuickActionButton icon="💬" label="Chat" onPress={() => navigation.navigate('Chatbot')} gradient={['#F59E0B', '#D97706']} />
      </Animated.View>

      {/* Financial Health Score */}
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Financial Health</Text>
            <View style={[styles.badge, { backgroundColor: score?.status === 'healthy' ? COLORS.success : COLORS.warning }]}>
              <Text style={styles.badgeText}>{score?.status || 'Loading'}</Text>
            </View>
          </View>
          {score ? (
            <View style={styles.scoreContainer}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{score.financial_score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.scoreAdvice}>
                <Text style={styles.adviceText}>{score.advice}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.loadingText}>Analyzing your finances...</Text>
          )}
        </View>
      </Animated.View>

      {/* Forecast Chart */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>7-Day Expense Forecast</Text>
          {forecast.length > 0 ? (
            <LineChart
              data={{
                labels: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'],
                datasets: [{ data: forecast.map(f => Math.round(f)) }],
              }}
              width={width - 64}
              height={200}
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surfaceLight,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(160, 160, 160, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: COLORS.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.loadingText}>Loading forecast...</Text>
          )}
        </View>
      </Animated.View>

      {/* Recent Activity Preview */}
      <Animated.View entering={FadeInDown.delay(500).springify()}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Transactions')}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            <Text style={styles.seeAll}>See All →</Text>
          </View>
          <View style={styles.activityItem}>
            <View style={[styles.activityIcon, { backgroundColor: COLORS.error + '20' }]}>
              <Text style={styles.activityEmoji}>🛒</Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Groceries</Text>
              <Text style={styles.activityDate}>Today, 2:30 PM</Text>
            </View>
            <Text style={styles.activityAmount}>-$45.20</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 20,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceSubLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  balanceSubAmount: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionGradient: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  quickActionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '20',
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  scoreNumber: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  scoreAdvice: {
    flex: 1,
  },
  adviceText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  activityAmount: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
