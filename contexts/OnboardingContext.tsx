import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';
import { UserProfileService } from '../services/database';
import { MigrationService } from '../services/migration';

// TypeScript interfaces for onboarding data
export interface OnboardingData {
  // Goals and preferences
  goals: string[];
  
  // Activity level
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  
  // Personal information
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  currentWeight: number; // in kg
  
  // Target and goals
  targetWeight: number; // in kg
  weeklyGoal: number; // kg per week (positive for gain, negative for loss)
  
  // AI-generated results
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number; // in grams
  dailyCarbsGoal?: number; // in grams
  dailyFatGoal?: number; // in grams
  bmr?: number; // Basal Metabolic Rate
  tdee?: number; // Total Daily Energy Expenditure
  macroBreakdown?: {
    protein: number; // percentage
    carbs: number; // percentage
    fats: number; // percentage
  };
  personalizedAdvice?: string[];
  timelineEstimate?: string;
  
  // Completion status
  completed: boolean;
}

export interface CalorieCalculationResult {
  dailyCalorieGoal: number;
  bmr: number;
  tdee: number;
  macroBreakdown: {
    protein: number;
    carbs: number;
    fats: number;
  };
  personalizedAdvice: string[];
  timelineEstimate: string;
  calculationMethod: 'ai' | 'manual';
}

interface OnboardingContextType {
  data: OnboardingData;
  isLoading: boolean;
  updateData: (updates: Partial<OnboardingData>) => void;
  updateGoals: (goals: string[]) => void;
  updateActivityLevel: (level: OnboardingData['activityLevel']) => void;
  updatePersonalInfo: (info: {
    age: number;
    gender: OnboardingData['gender'];
    height: number;
    currentWeight: number;
  }) => void;
  updateTargetWeight: (targetWeight: number, weeklyGoal: number) => void;
  updateCalorieResults: (results: CalorieCalculationResult) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  loadOnboardingData: () => Promise<void>;
  isDataComplete: () => boolean;
  getProgressPercentage: () => number;
  getCurrentStep: () => string;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = '@calorAi_onboarding_data';

// Clean initial state for new users
const cleanInitialData: OnboardingData = {
  goals: [],
  activityLevel: 'sedentary',
  age: 0,
  gender: '',
  height: 0,
  currentWeight: 0,
  targetWeight: 0,
  weeklyGoal: 0,
  dailyCalorieGoal: undefined,
  dailyProteinGoal: undefined,
  dailyCarbsGoal: undefined,
  dailyFatGoal: undefined,
  completed: false,
};

// Fallback data structure (only used for validation)
const fallbackData: OnboardingData = {
  goals: [],
  activityLevel: 'sedentary',
  age: 0,
  gender: '',
  height: 0,
  currentWeight: 0,
  targetWeight: 0,
  weeklyGoal: 0,
  dailyCalorieGoal: undefined,
  dailyProteinGoal: undefined,
  dailyCarbsGoal: undefined,
  dailyFatGoal: undefined,
  completed: false,
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(cleanInitialData);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoaded } = useAuth();

  // Load onboarding data from storage on mount
  useEffect(() => {
    if (isLoaded) {
      loadOnboardingData();
    }
  }, [isLoaded, user?.id]);

  // Load onboarding data from Supabase or AsyncStorage
  const loadOnboardingData = async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        // User is authenticated, try to load from Supabase
        const userProfile = await UserProfileService.getByClerkId(user.id);

        if (userProfile) {
          // User exists in Supabase, map data to onboarding format
          const supabaseData: OnboardingData = {
            goals: userProfile.goals || [],
            activityLevel: userProfile.activity_level || 'sedentary',
            age: userProfile.age || 0,
            gender: userProfile.gender || '',
            height: userProfile.height_cm || 0,
            currentWeight: userProfile.current_weight_kg || 0,
            targetWeight: userProfile.target_weight_kg || 0,
            weeklyGoal: userProfile.weekly_weight_goal_kg || 0,
            dailyCalorieGoal: userProfile.daily_calorie_goal,
            dailyProteinGoal: userProfile.daily_protein_goal_g,
            dailyCarbsGoal: userProfile.daily_carbs_goal_g,
            dailyFatGoal: userProfile.daily_fat_goal_g,
            completed: userProfile.onboarding_completed || false,
          };

          setData(supabaseData);
        } else {
          // User doesn't exist in Supabase, check for migration
          const needsMigration = await MigrationService.needsMigration(user.id);
          if (needsMigration) {
            console.log('Migration needed, performing migration...');
            await MigrationService.performMigration(user.id, user.emailAddresses[0]?.emailAddress || '');
            // Reload data after migration
            await loadOnboardingData();
            return;
          } else {
            // New user - start with clean data
            console.log('New user detected, starting with clean onboarding data');
            setData(cleanInitialData);
          }
        }
      } else {
        // User not authenticated, check AsyncStorage for any existing data
        await loadFromAsyncStorage();
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
      // For new users or errors, start with clean data
      setData(cleanInitialData);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback function to load from AsyncStorage
  const loadFromAsyncStorage = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Validate the data structure
        if (parsedData && typeof parsedData === 'object') {
          setData({ ...fallbackData, ...parsedData });
        } else {
          // Invalid data, start with clean state
          setData(cleanInitialData);
        }
      } else {
        // No stored data, start with clean state
        setData(cleanInitialData);
      }
    } catch (error) {
      console.error('Error loading from AsyncStorage:', error);
      setData(cleanInitialData);
    }
  };

  // Update any part of the onboarding data
  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Specific update functions for better type safety
  const updateGoals = (goals: string[]) => {
    setData(prev => ({ ...prev, goals }));
  };

  const updateActivityLevel = (activityLevel: OnboardingData['activityLevel']) => {
    setData(prev => ({ ...prev, activityLevel }));
  };

  const updatePersonalInfo = (info: {
    age: number;
    gender: OnboardingData['gender'];
    height: number;
    currentWeight: number;
  }) => {
    setData(prev => ({ ...prev, ...info }));
  };

  const updateTargetWeight = (targetWeight: number, weeklyGoal: number) => {
    setData(prev => ({ ...prev, targetWeight, weeklyGoal }));
  };

  const updateCalorieResults = async (results: CalorieCalculationResult) => {
    // Calculate macro grams from percentages and calories
    const calories = results.dailyCalorieGoal;
    const proteinGrams = Math.round((calories * (results.macroBreakdown.protein / 100)) / 4); // 4 cal/g
    const carbsGrams = Math.round((calories * (results.macroBreakdown.carbs / 100)) / 4); // 4 cal/g
    const fatGrams = Math.round((calories * (results.macroBreakdown.fats / 100)) / 9); // 9 cal/g

    const updatedData = {
      ...data,
      dailyCalorieGoal: results.dailyCalorieGoal,
      dailyProteinGoal: proteinGrams,
      dailyCarbsGoal: carbsGrams,
      dailyFatGoal: fatGrams,
      bmr: results.bmr,
      tdee: results.tdee,
      macroBreakdown: results.macroBreakdown,
      personalizedAdvice: results.personalizedAdvice,
      timelineEstimate: results.timelineEstimate,
    };

    setData(updatedData);

    // Save to AsyncStorage immediately
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving calorie results to AsyncStorage:', error);
    }

    // Save to Supabase if user is authenticated
    if (user?.id) {
      try {
        const userProfile = await UserProfileService.getByClerkId(user.id);

        if (userProfile) {
          // Update existing profile with new goals
          await UserProfileService.update(user.id, {
            daily_calorie_goal: results.dailyCalorieGoal,
            daily_protein_goal_g: proteinGrams,
            daily_carbs_goal_g: carbsGrams,
            daily_fat_goal_g: fatGrams,
          });
        } else {
          // Create new profile with current data
          await UserProfileService.create({
            clerk_user_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            goals: updatedData.goals,
            activity_level: updatedData.activityLevel as any,
            age: updatedData.age,
            gender: updatedData.gender as any,
            height_cm: updatedData.height,
            current_weight_kg: updatedData.currentWeight,
            target_weight_kg: updatedData.targetWeight,
            weekly_weight_goal_kg: updatedData.weeklyGoal,
            daily_calorie_goal: results.dailyCalorieGoal,
            daily_protein_goal_g: proteinGrams,
            daily_carbs_goal_g: carbsGrams,
            daily_fat_goal_g: fatGrams,
            onboarding_completed: false,
          });
        }
      } catch (error) {
        console.error('Error saving calorie results to Supabase:', error);
      }
    }
  };

  // Complete onboarding and save to Supabase and storage
  const completeOnboarding = async () => {
    const completedData = { ...data, completed: true };
    setData(completedData);

    try {
      // Save to AsyncStorage first (for offline support)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(completedData));

      // Save to Supabase if user is authenticated
      if (user?.id) {
        const userProfile = await UserProfileService.getByClerkId(user.id);

        if (userProfile) {
          // Update existing profile
          await UserProfileService.update(user.id, {
            onboarding_completed: true,
            goals: completedData.goals,
            activity_level: completedData.activityLevel as any,
            age: completedData.age,
            gender: completedData.gender as any,
            height_cm: completedData.height,
            current_weight_kg: completedData.currentWeight,
            target_weight_kg: completedData.targetWeight,
            weekly_weight_goal_kg: completedData.weeklyGoal,
            daily_calorie_goal: completedData.dailyCalorieGoal,
            daily_protein_goal_g: completedData.dailyProteinGoal,
            daily_carbs_goal_g: completedData.dailyCarbsGoal,
            daily_fat_goal_g: completedData.dailyFatGoal,
          });
        } else {
          // Create new profile
          await UserProfileService.create({
            clerk_user_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            onboarding_completed: true,
            goals: completedData.goals,
            activity_level: completedData.activityLevel as any,
            age: completedData.age,
            gender: completedData.gender as any,
            height_cm: completedData.height,
            current_weight_kg: completedData.currentWeight,
            target_weight_kg: completedData.targetWeight,
            weekly_weight_goal_kg: completedData.weeklyGoal,
            daily_calorie_goal: completedData.dailyCalorieGoal,
            daily_protein_goal_g: completedData.dailyProteinGoal,
            daily_carbs_goal_g: completedData.dailyCarbsGoal,
            daily_fat_goal_g: completedData.dailyFatGoal,
          });
        }
      }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // Don't throw error to prevent blocking the completion flow
    }
  };

  // Reset onboarding data (for sign out)
  const resetOnboarding = async () => {
    console.log('🔄 Resetting onboarding data...');

    try {
      // Clear onboarding data from AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('✅ Onboarding data cleared from AsyncStorage');

      // Reset state to clean initial data
      setData(cleanInitialData);
      console.log('✅ Onboarding state reset to initial values');
    } catch (error) {
      console.error('❌ Error resetting onboarding data:', error);
      // Still reset the state even if AsyncStorage fails
      setData(cleanInitialData);
    }
  };

  // Check if all required data is complete
  const isDataComplete = () => {
    return (
      data.goals.length > 0 &&
      data.activityLevel &&
      data.activityLevel !== 'sedentary' &&
      data.age > 0 &&
      data.gender &&
      data.gender !== '' &&
      data.height > 0 &&
      data.currentWeight > 0 &&
      data.targetWeight > 0
    );
  };

  // Calculate progress percentage based on completed steps
  const getProgressPercentage = () => {
    let completedSteps = 0;
    const totalSteps = 6; // Including auth step

    if (data.goals.length > 0) completedSteps++;
    if (data.activityLevel && data.activityLevel !== 'sedentary') completedSteps++;
    if (data.age > 0 && data.gender && data.gender !== '' && data.height > 0 && data.currentWeight > 0) completedSteps++;
    if (data.targetWeight > 0) completedSteps++;
    if (data.dailyCalorieGoal) completedSteps++; // Personalized plan completed
    if (data.completed) completedSteps++; // Auth completed

    return (completedSteps / totalSteps) * 100;
  };

  // Get current step for resuming onboarding
  const getCurrentStep = () => {
    if (data.completed) return 'completed';
    if (data.dailyCalorieGoal) return 'auth';
    if (data.targetWeight > 0) return 'personalized-plan';
    if (data.age > 0 && data.gender && data.gender !== '' && data.height > 0 && data.currentWeight > 0) return 'target-weight';
    if (data.activityLevel && data.activityLevel !== 'sedentary') return 'personal-info';
    if (data.goals.length > 0) return 'activity-level';
    return 'welcome';
  };

  const value: OnboardingContextType = {
    data,
    isLoading,
    updateData,
    updateGoals,
    updateActivityLevel,
    updatePersonalInfo,
    updateTargetWeight,
    updateCalorieResults,
    completeOnboarding,
    resetOnboarding,
    loadOnboardingData,
    isDataComplete,
    getProgressPercentage,
    getCurrentStep,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
