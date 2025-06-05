import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNutrition } from '../../contexts/NutritionContext';

export default function GoalsTargetsScreen() {
  const { state, updateUserMetrics } = useNutrition();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    goals: [] as string[],
    weeklyWeightGoal: '',
    dailyCalories: '',
    carbs: '',
    protein: '',
    fat: '',
    waterIntake: '',
  });

  const goalOptions = [
    { key: 'lose_weight', label: 'Lose Weight', icon: 'trending-down' },
    { key: 'gain_weight', label: 'Gain Weight', icon: 'trending-up' },
    { key: 'maintain_weight', label: 'Maintain Weight', icon: 'trending-flat' },
    { key: 'build_muscle', label: 'Build Muscle', icon: 'fitness-center' },
    { key: 'improve_health', label: 'Improve Health', icon: 'favorite' },
    { key: 'increase_energy', label: 'Increase Energy', icon: 'bolt' },
  ];

  useEffect(() => {
    loadGoalsData();
  }, []);

  const loadGoalsData = () => {
    setIsLoading(true);
    
    const userMetrics = state.dashboardData?.userMetrics;
    
    if (userMetrics) {
      setFormData({
        goals: userMetrics.goals || [],
        weeklyWeightGoal: userMetrics.weeklyWeightGoal?.toString() || '',
        dailyCalories: userMetrics.nutritionGoals?.dailyCalories?.toString() || '',
        carbs: userMetrics.nutritionGoals?.carbs?.toString() || '',
        protein: userMetrics.nutritionGoals?.protein?.toString() || '',
        fat: userMetrics.nutritionGoals?.fat?.toString() || '',
        waterIntake: userMetrics.nutritionGoals?.waterIntake?.toString() || '',
      });
    }
    
    setIsLoading(false);
  };

  const toggleGoal = (goalKey: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalKey)
        ? prev.goals.filter(g => g !== goalKey)
        : [...prev.goals, goalKey]
    }));
  };

  const calculateMacros = () => {
    const calories = parseFloat(formData.dailyCalories);
    if (!calories || calories <= 0) return;

    // Standard macro distribution: 45-65% carbs, 10-35% protein, 20-35% fat
    const carbsCalories = calories * 0.5; // 50% carbs
    const proteinCalories = calories * 0.25; // 25% protein
    const fatCalories = calories * 0.25; // 25% fat

    const carbsGrams = Math.round(carbsCalories / 4); // 4 calories per gram
    const proteinGrams = Math.round(proteinCalories / 4); // 4 calories per gram
    const fatGrams = Math.round(fatCalories / 9); // 9 calories per gram

    setFormData(prev => ({
      ...prev,
      carbs: carbsGrams.toString(),
      protein: proteinGrams.toString(),
      fat: fatGrams.toString(),
    }));

    Alert.alert(
      'Macros Calculated',
      `Based on ${calories} calories:\n• Carbs: ${carbsGrams}g\n• Protein: ${proteinGrams}g\n• Fat: ${fatGrams}g`,
      [{ text: 'OK' }]
    );
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await updateUserMetrics({
        goals: formData.goals,
        weeklyWeightGoal: parseFloat(formData.weeklyWeightGoal),
        nutritionGoals: {
          dailyCalories: parseFloat(formData.dailyCalories),
          carbs: parseFloat(formData.carbs),
          protein: parseFloat(formData.protein),
          fat: parseFloat(formData.fat),
          waterIntake: parseFloat(formData.waterIntake),
        },
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Goals and targets updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating goals:', error);
      Alert.alert('Error', 'Failed to update goals. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = () => {
    if (formData.goals.length === 0) {
      Alert.alert('Error', 'Please select at least one goal');
      return false;
    }
    if (!formData.weeklyWeightGoal || parseFloat(formData.weeklyWeightGoal) <= 0) {
      Alert.alert('Error', 'Please enter a valid weekly weight goal');
      return false;
    }
    if (!formData.dailyCalories || parseFloat(formData.dailyCalories) <= 0) {
      Alert.alert('Error', 'Please enter a valid daily calorie target');
      return false;
    }
    if (!formData.carbs || parseFloat(formData.carbs) <= 0) {
      Alert.alert('Error', 'Please enter a valid carbs target');
      return false;
    }
    if (!formData.protein || parseFloat(formData.protein) <= 0) {
      Alert.alert('Error', 'Please enter a valid protein target');
      return false;
    }
    if (!formData.fat || parseFloat(formData.fat) <= 0) {
      Alert.alert('Error', 'Please enter a valid fat target');
      return false;
    }
    if (!formData.waterIntake || parseFloat(formData.waterIntake) <= 0) {
      Alert.alert('Error', 'Please enter a valid water intake target');
      return false;
    }
    return true;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading goals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals & Targets</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Health Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Goals</Text>
          <Text style={styles.sectionDescription}>
            Select your primary health and fitness goals
          </Text>
          
          <View style={styles.goalsGrid}>
            {goalOptions.map((goal) => (
              <TouchableOpacity
                key={goal.key}
                style={[
                  styles.goalOption,
                  formData.goals.includes(goal.key) && styles.goalOptionActive
                ]}
                onPress={() => toggleGoal(goal.key)}
              >
                <MaterialIcons 
                  name={goal.icon as any} 
                  size={24} 
                  color={formData.goals.includes(goal.key) ? '#4CAF50' : '#666'} 
                />
                <Text style={[
                  styles.goalLabel,
                  formData.goals.includes(goal.key) && styles.goalLabelActive
                ]}>
                  {goal.label}
                </Text>
                {formData.goals.includes(goal.key) && (
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weight Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Goal</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weekly Weight Goal (kg)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.weeklyWeightGoal}
              onChangeText={(text) => setFormData(prev => ({ ...prev, weeklyWeightGoal: text }))}
              placeholder="e.g., 0.5 for 0.5kg per week"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
            <Text style={styles.inputHint}>
              Recommended: 0.25-0.75 kg per week for healthy weight loss
            </Text>
          </View>
        </View>

        {/* Nutrition Targets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Targets</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Daily Calories</Text>
              <TouchableOpacity onPress={calculateMacros} style={styles.calculateButton}>
                <MaterialIcons name="calculate" size={16} color="#4CAF50" />
                <Text style={styles.calculateButtonText}>Calculate Macros</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.dailyCalories}
              onChangeText={(text) => setFormData(prev => ({ ...prev, dailyCalories: text }))}
              placeholder="Enter daily calorie target"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroInput}>
              <Text style={styles.inputLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.carbs}
                onChangeText={(text) => setFormData(prev => ({ ...prev, carbs: text }))}
                placeholder="Carbs"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.macroInput}>
              <Text style={styles.inputLabel}>Protein (g)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.protein}
                onChangeText={(text) => setFormData(prev => ({ ...prev, protein: text }))}
                placeholder="Protein"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.macroInput}>
              <Text style={styles.inputLabel}>Fat (g)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.fat}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fat: text }))}
                placeholder="Fat"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Daily Water Intake (ml)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.waterIntake}
              onChangeText={(text) => setFormData(prev => ({ ...prev, waterIntake: text }))}
              placeholder="e.g., 2000 for 2 liters"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <Text style={styles.inputHint}>
              Recommended: 2000-3000ml per day
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A5A5A5',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  goalOptionActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  goalLabelActive: {
    color: '#4CAF50',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  calculateButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  macroInput: {
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },
});
