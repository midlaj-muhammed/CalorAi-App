import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface FastingPlan {
  id: string;
  title: string;
  subtitle: string;
  fastingHours: number;
  eatingHours: number;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  popular?: boolean;
}

const fastingPlans: FastingPlan[] = [
  {
    id: '16:8',
    title: '16:8',
    subtitle: 'Most Popular',
    fastingHours: 16,
    eatingHours: 8,
    description: 'Fast for 16 hours, eat within 8 hours',
    difficulty: 'Beginner',
    popular: true,
  },
  {
    id: '14:10',
    title: '14:10',
    subtitle: 'Gentle Start',
    fastingHours: 14,
    eatingHours: 10,
    description: 'Fast for 14 hours, eat within 10 hours',
    difficulty: 'Beginner',
  },
  {
    id: '18:6',
    title: '18:6',
    subtitle: 'Advanced',
    fastingHours: 18,
    eatingHours: 6,
    description: 'Fast for 18 hours, eat within 6 hours',
    difficulty: 'Advanced',
  },
  {
    id: '20:4',
    title: '20:4',
    subtitle: 'Warrior Diet',
    fastingHours: 20,
    eatingHours: 4,
    description: 'Fast for 20 hours, eat within 4 hours',
    difficulty: 'Advanced',
  },
];

export default function SetupScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string>('16:8');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CHOOSE YOUR PLAN</Text>
        <TouchableOpacity style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Choose your fasting schedule</Text>
        <Text style={styles.subtitle}>
          Select a fasting plan that fits your lifestyle. You can always change it later.
        </Text>

        <View style={styles.plansContainer}>
          {fastingPlans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
              </View>

              <View style={styles.planTiming}>
                <View style={styles.timingItem}>
                  <View style={[styles.timingDot, { backgroundColor: '#E91E63' }]} />
                  <Text style={styles.timingText}>{plan.fastingHours}h fasting</Text>
                </View>
                <View style={styles.timingItem}>
                  <View style={[styles.timingDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.timingText}>{plan.eatingHours}h eating</Text>
                </View>
              </View>

              <Text style={styles.planDescription}>{plan.description}</Text>

              <View style={styles.planFooter}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(plan.difficulty) + '20' }]}>
                  <Text style={[styles.difficultyText, { color: getDifficultyColor(plan.difficulty) }]}>
                    {plan.difficulty}
                  </Text>
                </View>
                
                {selectedPlan === plan.id && (
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            Start with a beginner-friendly plan and gradually increase fasting duration as you get comfortable.
          </Text>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.startButtonText}>START FASTING</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 32,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  plansContainer: {
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planCardSelected: {
    borderColor: '#4CAF50',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: 16,
  },
  planTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  planTiming: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  timingText: {
    fontSize: 14,
    color: '#666',
  },
  planDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F8F0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
