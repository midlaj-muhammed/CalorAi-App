import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useOnboarding } from '../../contexts/OnboardingContext';

const activityLevels = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    subtitle: 'Little to no exercise',
    description: 'Desk job, minimal physical activity',
    emoji: '🪑',
  },
  {
    id: 'lightly_active',
    title: 'Lightly Active',
    subtitle: 'Light exercise 1-3 days/week',
    description: 'Light workouts or sports occasionally',
    emoji: '🚶',
  },
  {
    id: 'moderately_active',
    title: 'Moderately Active',
    subtitle: 'Moderate exercise 3-5 days/week',
    description: 'Regular workouts or active lifestyle',
    emoji: '🏃',
  },
  {
    id: 'very_active',
    title: 'Very Active',
    subtitle: 'Hard exercise 6-7 days/week',
    description: 'Daily intense workouts or physical job',
    emoji: '💪',
  },
  {
    id: 'extremely_active',
    title: 'Extremely Active',
    subtitle: 'Very hard exercise, physical job',
    description: 'Professional athlete or very physical job',
    emoji: '🏋️',
  },
];

export default function ActivityLevelScreen() {
  const router = useRouter();
  const { data, updateActivityLevel } = useOnboarding();
  const [selectedLevel, setSelectedLevel] = useState<string>(data.activityLevel || '');

  // Load existing activity level from context on mount
  useEffect(() => {
    if (data.activityLevel) {
      setSelectedLevel(data.activityLevel);
    }
  }, [data.activityLevel]);

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevel(levelId);
  };

  const handleContinue = () => {
    if (selectedLevel) {
      // Save activity level to context
      updateActivityLevel(selectedLevel as any);
      router.push('/(onboarding)/personal-info');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>What's your activity level?</Text>
          <Text style={styles.subtitle}>
            This helps us calculate your daily calorie needs more accurately.
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33.3%' }]} />
          </View>
          <Text style={styles.progressText}>2 of 6</Text>
        </View>

        <View style={styles.levelsContainer}>
          {activityLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                selectedLevel === level.id && styles.selectedLevelCard
              ]}
              onPress={() => handleLevelSelect(level.id)}
              activeOpacity={0.7}
            >
              <View style={styles.levelContent}>
                <Text style={styles.levelEmoji}>{level.emoji}</Text>
                <View style={styles.levelText}>
                  <Text style={[
                    styles.levelTitle,
                    selectedLevel === level.id && styles.selectedLevelTitle
                  ]}>
                    {level.title}
                  </Text>
                  <Text style={[
                    styles.levelSubtitle,
                    selectedLevel === level.id && styles.selectedLevelSubtitle
                  ]}>
                    {level.subtitle}
                  </Text>
                  <Text style={[
                    styles.levelDescription,
                    selectedLevel === level.id && styles.selectedLevelDescription
                  ]}>
                    {level.description}
                  </Text>
                </View>
                <View style={[
                  styles.radio,
                  selectedLevel === level.id && styles.selectedRadio
                ]}>
                  {selectedLevel === level.id && (
                    <View style={styles.radioDot} />
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
          disabled={!selectedLevel}
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
  levelsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  levelCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLevelCard: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  levelText: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedLevelTitle: {
    color: '#2E7D32',
  },
  levelSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  selectedLevelSubtitle: {
    color: '#4CAF50',
  },
  levelDescription: {
    fontSize: 12,
    color: '#999',
  },
  selectedLevelDescription: {
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
