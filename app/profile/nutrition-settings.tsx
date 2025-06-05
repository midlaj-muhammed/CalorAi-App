import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useNutrition } from '../../contexts/NutritionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NutritionSettings {
  dietaryRestrictions: string[];
  allergies: string[];
  preferences: {
    showMicronutrients: boolean;
    trackFiber: boolean;
    trackSugar: boolean;
    trackSodium: boolean;
    showNetCarbs: boolean;
  };
  goals: {
    prioritizeProtein: boolean;
    lowCarb: boolean;
    highFiber: boolean;
    lowSodium: boolean;
  };
}

const defaultSettings: NutritionSettings = {
  dietaryRestrictions: [],
  allergies: [],
  preferences: {
    showMicronutrients: false,
    trackFiber: true,
    trackSugar: true,
    trackSodium: false,
    showNetCarbs: false,
  },
  goals: {
    prioritizeProtein: false,
    lowCarb: false,
    highFiber: false,
    lowSodium: false,
  },
};

export default function NutritionSettingsScreen() {
  const { user } = useUser();
  const { updateUserMetrics } = useNutrition();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NutritionSettings>(defaultSettings);

  const dietaryOptions = [
    { key: 'vegetarian', label: 'Vegetarian', icon: 'eco' },
    { key: 'vegan', label: 'Vegan', icon: 'nature' },
    { key: 'pescatarian', label: 'Pescatarian', icon: 'set-meal' },
    { key: 'keto', label: 'Ketogenic', icon: 'local-fire-department' },
    { key: 'paleo', label: 'Paleo', icon: 'outdoor-grill' },
    { key: 'mediterranean', label: 'Mediterranean', icon: 'restaurant' },
    { key: 'gluten_free', label: 'Gluten-Free', icon: 'no-meals' },
    { key: 'dairy_free', label: 'Dairy-Free', icon: 'no-drinks' },
  ];

  const allergyOptions = [
    { key: 'nuts', label: 'Tree Nuts', icon: 'warning' },
    { key: 'peanuts', label: 'Peanuts', icon: 'warning' },
    { key: 'shellfish', label: 'Shellfish', icon: 'warning' },
    { key: 'fish', label: 'Fish', icon: 'warning' },
    { key: 'eggs', label: 'Eggs', icon: 'warning' },
    { key: 'milk', label: 'Milk/Dairy', icon: 'warning' },
    { key: 'soy', label: 'Soy', icon: 'warning' },
    { key: 'wheat', label: 'Wheat/Gluten', icon: 'warning' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (user) {
        const stored = await AsyncStorage.getItem(`nutrition_settings_${user.id}`);
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Error loading nutrition settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await AsyncStorage.setItem(`nutrition_settings_${user.id}`, JSON.stringify(settings));
        
        // Update user metrics with dietary preferences
        await updateUserMetrics({
          dietaryRestrictions: settings.dietaryRestrictions,
          allergies: settings.allergies,
          updatedAt: new Date(),
        });

        Alert.alert('Success', 'Nutrition settings saved successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error saving nutrition settings:', error);
      Alert.alert('Error', 'Failed to save nutrition settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    setSettings(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction]
    }));
  };

  const toggleAllergy = (allergy: string) => {
    setSettings(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const updatePreference = (key: keyof NutritionSettings['preferences'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const updateGoal = (key: keyof NutritionSettings['goals'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading nutrition settings...</Text>
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
        <Text style={styles.headerTitle}>Nutrition Settings</Text>
        <TouchableOpacity 
          onPress={saveSettings} 
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
        {/* Dietary Restrictions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <Text style={styles.sectionDescription}>
            Select your dietary preferences to get personalized recommendations
          </Text>
          
          <View style={styles.optionsGrid}>
            {dietaryOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionCard,
                  settings.dietaryRestrictions.includes(option.key) && styles.optionCardActive
                ]}
                onPress={() => toggleDietaryRestriction(option.key)}
              >
                <MaterialIcons 
                  name={option.icon as any} 
                  size={24} 
                  color={settings.dietaryRestrictions.includes(option.key) ? '#4CAF50' : '#666'} 
                />
                <Text style={[
                  styles.optionLabel,
                  settings.dietaryRestrictions.includes(option.key) && styles.optionLabelActive
                ]}>
                  {option.label}
                </Text>
                {settings.dietaryRestrictions.includes(option.key) && (
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies & Intolerances</Text>
          <Text style={styles.sectionDescription}>
            Help us keep you safe by marking your allergies and food intolerances
          </Text>
          
          <View style={styles.optionsGrid}>
            {allergyOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionCard,
                  styles.allergyCard,
                  settings.allergies.includes(option.key) && styles.allergyCardActive
                ]}
                onPress={() => toggleAllergy(option.key)}
              >
                <MaterialIcons 
                  name={option.icon as any} 
                  size={24} 
                  color={settings.allergies.includes(option.key) ? '#FF3B30' : '#FF9800'} 
                />
                <Text style={[
                  styles.optionLabel,
                  settings.allergies.includes(option.key) && styles.allergyLabelActive
                ]}>
                  {option.label}
                </Text>
                {settings.allergies.includes(option.key) && (
                  <MaterialIcons name="check-circle" size={20} color="#FF3B30" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tracking Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking Preferences</Text>
          
          {[
            { key: 'showMicronutrients', label: 'Show Micronutrients', description: 'Display vitamins and minerals' },
            { key: 'trackFiber', label: 'Track Fiber', description: 'Monitor daily fiber intake' },
            { key: 'trackSugar', label: 'Track Sugar', description: 'Monitor sugar consumption' },
            { key: 'trackSodium', label: 'Track Sodium', description: 'Monitor sodium intake' },
            { key: 'showNetCarbs', label: 'Show Net Carbs', description: 'Display carbs minus fiber' },
          ].map((pref) => (
            <View key={pref.key} style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>{pref.label}</Text>
                <Text style={styles.preferenceDescription}>{pref.description}</Text>
              </View>
              <Switch
                value={settings.preferences[pref.key as keyof NutritionSettings['preferences']]}
                onValueChange={(value) => updatePreference(pref.key as keyof NutritionSettings['preferences'], value)}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        {/* Nutrition Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Goals</Text>
          
          {[
            { key: 'prioritizeProtein', label: 'Prioritize Protein', description: 'Focus on meeting protein targets' },
            { key: 'lowCarb', label: 'Low Carb Focus', description: 'Emphasize low-carb options' },
            { key: 'highFiber', label: 'High Fiber Goal', description: 'Aim for high fiber intake' },
            { key: 'lowSodium', label: 'Low Sodium Goal', description: 'Monitor and limit sodium' },
          ].map((goal) => (
            <View key={goal.key} style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>{goal.label}</Text>
                <Text style={styles.preferenceDescription}>{goal.description}</Text>
              </View>
              <Switch
                value={settings.goals[goal.key as keyof NutritionSettings['goals']]}
                onValueChange={(value) => updateGoal(goal.key as keyof NutritionSettings['goals'], value)}
                trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
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
  optionCardActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  allergyCard: {
    borderColor: '#FFE5CC',
    backgroundColor: '#FFFAF5',
  },
  allergyCardActive: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  optionLabelActive: {
    color: '#4CAF50',
  },
  allergyLabelActive: {
    color: '#FF3B30',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacing: {
    height: 40,
  },
});
