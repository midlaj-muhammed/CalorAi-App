import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useOnboarding } from '../../contexts/OnboardingContext';

const goals = [
  {
    id: 'lose_weight',
    title: 'Lose weight',
    subtitle: 'Shed those extra pounds',
    emoji: '⚖️',
  },
  {
    id: 'maintain_weight',
    title: 'Maintain weight',
    subtitle: 'Keep your current weight',
    emoji: '🎯',
  },
  {
    id: 'gain_weight',
    title: 'Gain weight',
    subtitle: 'Build muscle and mass',
    emoji: '💪',
  },
  {
    id: 'build_muscle',
    title: 'Build muscle',
    subtitle: 'Increase lean muscle mass',
    emoji: '🏋️',
  },
  {
    id: 'improve_health',
    title: 'Improve health',
    subtitle: 'Better nutrition habits',
    emoji: '❤️',
  },
  {
    id: 'track_nutrition',
    title: 'Track nutrition',
    subtitle: 'Monitor macro and micronutrients',
    emoji: '📊',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { data, updateGoals } = useOnboarding();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(data.goals || []);

  // Load existing goals from context on mount
  useEffect(() => {
    if (data.goals && data.goals.length > 0) {
      setSelectedGoals(data.goals);
    }
  }, [data.goals]);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      // Save goals to context
      updateGoals(selectedGoals);
      router.push('/(onboarding)/activity-level');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>What are your goals?</Text>
          <Text style={styles.subtitle}>
            Select all that apply. We'll personalize your experience based on your goals.
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '16.6%' }]} />
          </View>
          <Text style={styles.progressText}>1 of 6</Text>
        </View>

        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoals.includes(goal.id) && styles.selectedGoalCard
              ]}
              onPress={() => handleGoalToggle(goal.id)}
              activeOpacity={0.7}
            >
              <View style={styles.goalContent}>
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <View style={styles.goalText}>
                  <Text style={[
                    styles.goalTitle,
                    selectedGoals.includes(goal.id) && styles.selectedGoalTitle
                  ]}>
                    {goal.title}
                  </Text>
                  <Text style={[
                    styles.goalSubtitle,
                    selectedGoals.includes(goal.id) && styles.selectedGoalSubtitle
                  ]}>
                    {goal.subtitle}
                  </Text>
                </View>
                <View style={[
                  styles.checkbox,
                  selectedGoals.includes(goal.id) && styles.checkedBox
                ]}>
                  {selectedGoals.includes(goal.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={selectedGoals.length === 0}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  goalsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  goalCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGoalCard: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedGoalTitle: {
    color: '#2E7D32',
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  selectedGoalSubtitle: {
    color: '#4CAF50',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  continueButton: {
    marginBottom: 0,
  },
});
