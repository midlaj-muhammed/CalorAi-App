import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useOnboarding } from '../../contexts/OnboardingContext';

const weeklyGoals = [
  { id: '0.25', title: 'Slow & Steady', subtitle: '0.25 kg/week', emoji: '🐌' },
  { id: '0.5', title: 'Moderate', subtitle: '0.5 kg/week', emoji: '🚶' },
  { id: '0.75', title: 'Aggressive', subtitle: '0.75 kg/week', emoji: '🏃' },
  { id: '1', title: 'Very Aggressive', subtitle: '1 kg/week', emoji: '🏃‍♂️' },
];

export default function TargetWeightScreen() {
  const router = useRouter();
  const { data, updateTargetWeight } = useOnboarding();
  const [targetWeight, setTargetWeight] = useState<string>(data.targetWeight ? data.targetWeight.toString() : '');
  const [selectedWeeklyGoal, setSelectedWeeklyGoal] = useState<string>(data.weeklyGoal ? data.weeklyGoal.toString() : '0.5');

  // Load existing data from context on mount
  useEffect(() => {
    if (data.targetWeight) setTargetWeight(data.targetWeight.toString());
    if (data.weeklyGoal) setSelectedWeeklyGoal(data.weeklyGoal.toString());
  }, [data]);

  const handleWeeklyGoalSelect = (goalId: string) => {
    setSelectedWeeklyGoal(goalId);
  };

  const handleContinue = () => {
    if (targetWeight && selectedWeeklyGoal) {
      // Save target weight and weekly goal to context
      updateTargetWeight(parseInt(targetWeight), parseFloat(selectedWeeklyGoal));
      router.push('/(onboarding)/personalized-plan');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isFormValid = () => {
    return targetWeight && 
           parseInt(targetWeight) > 0 && 
           parseInt(targetWeight) < 500 &&
           selectedWeeklyGoal;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>What's your target weight?</Text>
          <Text style={styles.subtitle}>
            Set a realistic goal and choose how fast you want to reach it.
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '66.6%' }]} />
          </View>
          <Text style={styles.progressText}>4 of 6</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Target Weight Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Weight</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={targetWeight}
                onChangeText={setTargetWeight}
                placeholder="Enter your target weight"
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
            <Text style={styles.inputHint}>
              Choose a weight that's healthy and sustainable for you
            </Text>
          </View>

          {/* Weekly Goal Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Goal</Text>
            <Text style={styles.sectionSubtitle}>
              How fast do you want to reach your target?
            </Text>
            
            <View style={styles.goalsContainer}>
              {weeklyGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    selectedWeeklyGoal === goal.id && styles.selectedGoalCard
                  ]}
                  onPress={() => handleWeeklyGoalSelect(goal.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.goalContent}>
                    <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                    <View style={styles.goalText}>
                      <Text style={[
                        styles.goalTitle,
                        selectedWeeklyGoal === goal.id && styles.selectedGoalTitle
                      ]}>
                        {goal.title}
                      </Text>
                      <Text style={[
                        styles.goalSubtitle,
                        selectedWeeklyGoal === goal.id && styles.selectedGoalSubtitle
                      ]}>
                        {goal.subtitle}
                      </Text>
                    </View>
                    <View style={[
                      styles.radio,
                      selectedWeeklyGoal === goal.id && styles.selectedRadio
                    ]}>
                      {selectedWeeklyGoal === goal.id && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.tipContainer}>
              <Text style={styles.tipTitle}>💡 Tip</Text>
              <Text style={styles.tipText}>
                Slower weight loss is more sustainable and helps preserve muscle mass. 
                We recommend 0.5 kg/week for most people.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!isFormValid()}
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
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
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#333',
  },
  inputUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  goalsContainer: {
    marginBottom: 24,
  },
  goalCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
    fontSize: 20,
    marginRight: 12,
  },
  goalText: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
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
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadio: {
    borderColor: '#4CAF50',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  tipContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB74D',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
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
