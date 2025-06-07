import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';
import { UserProfileService } from '../services/database';
import { useOnboarding } from './OnboardingContext';
import {
  DashboardData,
  DailyNutrition,
  MealEntry,
  ExerciseSession,
  UserMetrics,
  DailyProgress,
  CalorieBalance,
  MacroProgress,
  NutritionGoals,
} from '../types/nutrition';

interface NutritionState {
  currentDate: string;
  dashboardData: DashboardData | null;
  dailyProgress: DailyProgress | null;
  isLoading: boolean;
  error: string | null;
}

type NutritionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_DATE'; payload: string }
  | { type: 'SET_DASHBOARD_DATA'; payload: DashboardData }
  | { type: 'ADD_MEAL_ENTRY'; payload: MealEntry }
  | { type: 'REMOVE_MEAL_ENTRY'; payload: string }
  | { type: 'UPDATE_WATER_INTAKE'; payload: number }
  | { type: 'ADD_EXERCISE_SESSION'; payload: ExerciseSession }
  | { type: 'UPDATE_USER_METRICS'; payload: Partial<UserMetrics> }
  | { type: 'CALCULATE_DAILY_PROGRESS' }
  | { type: 'RESET_STATE' };

const initialState: NutritionState = {
  currentDate: new Date().toISOString().split('T')[0],
  dashboardData: null,
  dailyProgress: null,
  isLoading: true,
  error: null,
};

function nutritionReducer(state: NutritionState, action: NutritionAction): NutritionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload };
    
    case 'SET_DASHBOARD_DATA':
      console.log('Setting dashboard data:', action.payload);
      // Calculate daily progress immediately when dashboard data is set
      let dailyProgress = null;
      try {
        if (action.payload) {
          dailyProgress = calculateDailyProgress(action.payload);
          console.log('Calculated daily progress immediately:', dailyProgress);
        }
      } catch (error) {
        console.error('Error calculating daily progress in SET_DASHBOARD_DATA:', error);
      }
      return {
        ...state,
        dashboardData: action.payload,
        dailyProgress,
        isLoading: false,
        error: null
      };
    
    case 'ADD_MEAL_ENTRY':
      if (!state.dashboardData) return state;
      
      const updatedMeals = [...state.dashboardData.nutrition.meals, action.payload];
      const updatedTotalMacros = calculateTotalMacros(updatedMeals);
      
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          nutrition: {
            ...state.dashboardData.nutrition,
            meals: updatedMeals,
            totalMacros: updatedTotalMacros,
          },
        },
      };
    
    case 'REMOVE_MEAL_ENTRY':
      if (!state.dashboardData) return state;
      
      const filteredMeals = state.dashboardData.nutrition.meals.filter(
        meal => meal.id !== action.payload
      );
      const recalculatedMacros = calculateTotalMacros(filteredMeals);
      
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          nutrition: {
            ...state.dashboardData.nutrition,
            meals: filteredMeals,
            totalMacros: recalculatedMacros,
          },
        },
      };
    
    case 'UPDATE_WATER_INTAKE':
      if (!state.dashboardData) return state;
      
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          nutrition: {
            ...state.dashboardData.nutrition,
            waterIntake: action.payload,
          },
        },
      };
    
    case 'ADD_EXERCISE_SESSION':
      if (!state.dashboardData) return state;
      
      const updatedExercises = [...state.dashboardData.exercises, action.payload];
      const totalExerciseCalories = updatedExercises.reduce(
        (sum, exercise) => sum + exercise.caloriesBurned, 0
      );
      
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          exercises: updatedExercises,
          nutrition: {
            ...state.dashboardData.nutrition,
            exerciseCaloriesBurned: totalExerciseCalories,
          },
        },
      };
    
    case 'UPDATE_USER_METRICS':
      if (!state.dashboardData) return state;
      
      return {
        ...state,
        dashboardData: {
          ...state.dashboardData,
          userMetrics: {
            ...state.dashboardData.userMetrics,
            ...action.payload,
          },
        },
      };
    
    case 'CALCULATE_DAILY_PROGRESS':
      if (!state.dashboardData) return state;

      try {
        const dailyProgress = calculateDailyProgress(state.dashboardData);
        console.log('Successfully calculated daily progress:', dailyProgress);
        return { ...state, dailyProgress };
      } catch (error) {
        console.error('Error calculating daily progress:', error);
        return state;
      }

    case 'RESET_STATE':
      console.log('🔄 Resetting nutrition state to initial values');
      return {
        ...initialState,
        currentDate: new Date().toISOString().split('T')[0], // Reset to current date
      };

    default:
      return state;
  }
}

// Helper functions
function calculateTotalMacros(meals: MealEntry[]) {
  return meals.reduce(
    (total, meal) => {
      // Safety check to ensure macros exist
      if (!meal.foodItem || !meal.foodItem.macros) {
        console.warn('Meal entry missing macros data:', meal);
        return total;
      }

      const macros = meal.foodItem.macros;
      return {
        calories: total.calories + (macros.calories * meal.quantity),
        carbs: total.carbs + (macros.carbs * meal.quantity),
        protein: total.protein + (macros.protein * meal.quantity),
        fat: total.fat + (macros.fat * meal.quantity),
        fiber: (total.fiber || 0) + ((macros.fiber || 0) * meal.quantity),
        sugar: (total.sugar || 0) + ((macros.sugar || 0) * meal.quantity),
        sodium: (total.sodium || 0) + ((macros.sodium || 0) * meal.quantity),
      };
    },
    { calories: 0, carbs: 0, protein: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
  );
}

function calculateDailyProgress(dashboardData: DashboardData): DailyProgress {
  try {
    console.log('Calculating daily progress with data:', dashboardData);

    const { nutrition, userMetrics } = dashboardData;
    const goals = userMetrics.nutritionGoals;

    console.log('Nutrition goals:', goals);
    console.log('Total macros:', nutrition.totalMacros);

    // Ensure all values are numbers and not null/undefined
    const safeNumber = (value: any, fallback: number = 0): number => {
      return typeof value === 'number' && !isNaN(value) ? value : fallback;
    };

    // Calculate calorie balance
    const calorieBalance: CalorieBalance = {
      consumed: safeNumber(nutrition.totalMacros.calories),
      burned: safeNumber(nutrition.exerciseCaloriesBurned),
      goal: safeNumber(goals.dailyCalories, 2000),
      remaining: safeNumber(goals.dailyCalories, 2000) - safeNumber(nutrition.totalMacros.calories) + safeNumber(nutrition.exerciseCaloriesBurned),
      netCalories: safeNumber(nutrition.totalMacros.calories) - safeNumber(nutrition.exerciseCaloriesBurned),
    };

    // Calculate macro progress
    const createMacroProgress = (current: number, goal: number): MacroProgress => {
      const safeCurrent = safeNumber(current);
      const safeGoal = safeNumber(goal, 1); // Avoid division by zero

      return {
        current: safeCurrent,
        goal: safeGoal,
        percentage: Math.min((safeCurrent / safeGoal) * 100, 100),
        remaining: Math.max(safeGoal - safeCurrent, 0),
        status: safeCurrent < safeGoal * 0.9 ? 'under' : safeCurrent > safeGoal * 1.1 ? 'over' : 'on_track',
      };
    };

    // Calculate water progress
    const waterProgress = {
      current: safeNumber(nutrition.waterIntake),
      goal: safeNumber(goals.waterIntake, 2000),
      percentage: Math.min((safeNumber(nutrition.waterIntake) / safeNumber(goals.waterIntake, 2000)) * 100, 100),
      glassesConsumed: Math.floor(safeNumber(nutrition.waterIntake) / 250), // 250ml per glass
      glassesGoal: Math.ceil(safeNumber(goals.waterIntake, 2000) / 250),
    };

    const result = {
      calories: calorieBalance,
      macros: {
        carbs: createMacroProgress(nutrition.totalMacros.carbs, goals.carbs),
        protein: createMacroProgress(nutrition.totalMacros.protein, goals.protein),
        fat: createMacroProgress(nutrition.totalMacros.fat, goals.fat),
      },
      water: waterProgress,
    };

    console.log('Calculated daily progress result:', result);
    return result;
  } catch (error) {
    console.error('Error in calculateDailyProgress:', error);
    throw error;
  }
}

// Context
interface NutritionContextType {
  state: NutritionState;
  setCurrentDate: (date: string) => void;
  addMealEntry: (meal: MealEntry) => void;
  removeMealEntry: (mealId: string) => void;
  updateWaterIntake: (glasses: number) => void;
  addExerciseSession: (exercise: ExerciseSession) => void;
  updateUserMetrics: (metrics: Partial<UserMetrics>) => void;
  loadDashboardData: (date: string) => Promise<void>;
  saveDashboardData: () => Promise<void>;
  refreshDashboardData: () => Promise<void>;
  clearDashboardCache: () => Promise<void>;
  resetNutritionData: () => Promise<void>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export function NutritionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(nutritionReducer, initialState);
  const { user } = useAuth();
  const { data: onboardingData } = useOnboarding();

  // Clear cached dashboard data to force fresh load with new goals
  const clearDashboardCache = async () => {
    if (user) {
      console.log('🗑️ Clearing dashboard cache to force fresh load...');
      const storageKey = `dashboard_${user.id}_${state.currentDate}`;
      try {
        await AsyncStorage.removeItem(storageKey);
        console.log('✅ Dashboard cache cleared');
      } catch (error) {
        console.error('Error clearing dashboard cache:', error);
      }
    }
  };

  // Force refresh dashboard data with latest goals
  const refreshDashboardData = async () => {
    if (user) {
      console.log('🔄 Force refreshing dashboard data with latest goals...');
      await clearDashboardCache();
      await loadDashboardData(state.currentDate);
    }
  };

  // Reset all nutrition data (for sign out)
  const resetNutritionData = async () => {
    console.log('🔄 Resetting all nutrition data...');

    try {
      // Clear all cached dashboard data from AsyncStorage
      if (user?.id) {
        const keys = await AsyncStorage.getAllKeys();
        const dashboardKeys = keys.filter(key => key.startsWith(`dashboard_${user.id}_`));
        const userKeys = keys.filter(key => key.includes(user.id));

        console.log('🗑️ Clearing cached data keys:', [...dashboardKeys, ...userKeys]);
        await AsyncStorage.multiRemove([...dashboardKeys, ...userKeys]);
      } else {
        // For guest users, clear all dashboard-related data
        const keys = await AsyncStorage.getAllKeys();
        const dashboardKeys = keys.filter(key => key.startsWith('dashboard_'));
        console.log('🗑️ Clearing guest dashboard data:', dashboardKeys);
        await AsyncStorage.multiRemove(dashboardKeys);
      }

      // Reset state to initial values
      dispatch({ type: 'RESET_STATE' });

      console.log('✅ Nutrition data reset completed');
    } catch (error) {
      console.error('❌ Error resetting nutrition data:', error);
      throw error;
    }
  };

  // Automatic onboarding data detection and dashboard update
  useEffect(() => {
    console.log('🔍 NutritionProvider - Onboarding data changed:', {
      dailyCalorieGoal: onboardingData.dailyCalorieGoal,
      dailyProteinGoal: onboardingData.dailyProteinGoal,
      dailyCarbsGoal: onboardingData.dailyCarbsGoal,
      dailyFatGoal: onboardingData.dailyFatGoal,
      completed: onboardingData.completed,
    });
    console.log('🔍 Current user:', user?.id);
    console.log('🔍 Dashboard data exists:', !!state.dashboardData);

    // If we have complete onboarding data, immediately refresh dashboard (even for guest users)
    if (onboardingData.dailyCalorieGoal && onboardingData.dailyProteinGoal &&
        onboardingData.dailyCarbsGoal && onboardingData.dailyFatGoal) {
      console.log('🚀 Complete onboarding data detected, immediately refreshing dashboard...');
      console.log('🚀 User ID:', user?.id || 'guest');
      console.log('🚀 Goals to apply:', {
        calories: onboardingData.dailyCalorieGoal,
        protein: onboardingData.dailyProteinGoal,
        carbs: onboardingData.dailyCarbsGoal,
        fat: onboardingData.dailyFatGoal,
      });

      // Force refresh for both authenticated and guest users
      if (user?.id) {
        console.log('🚀 Refreshing for authenticated user');
        refreshDashboardData();
      } else {
        console.log('🚀 Refreshing for guest user - forcing dashboard reload');
        // For guest users, force a complete reload by recreating guest data
        createGuestDashboardData();
      }
    } else {
      console.log('❌ Onboarding data incomplete, not refreshing dashboard');
      console.log('❌ Missing values:', {
        dailyCalorieGoal: !onboardingData.dailyCalorieGoal,
        dailyProteinGoal: !onboardingData.dailyProteinGoal,
        dailyCarbsGoal: !onboardingData.dailyCarbsGoal,
        dailyFatGoal: !onboardingData.dailyFatGoal,
      });
    }
  }, [
    onboardingData.dailyCalorieGoal,
    onboardingData.dailyProteinGoal,
    onboardingData.dailyCarbsGoal,
    onboardingData.dailyFatGoal,
    user?.id
  ]);

  // Load dashboard data when date changes or user changes
  useEffect(() => {
    if (user) {
      loadDashboardData(state.currentDate);
    } else {
      // Create default data for non-authenticated users
      createGuestDashboardData();
    }
  }, [state.currentDate, user]);

  // Real-time nutrition goals synchronization
  useEffect(() => {
    // Only proceed if we have complete onboarding data and dashboard data
    if (!user || !state.dashboardData || !onboardingData.dailyCalorieGoal ||
        !onboardingData.dailyProteinGoal || !onboardingData.dailyCarbsGoal ||
        !onboardingData.dailyFatGoal) {
      return;
    }

    console.log('🔄 Synchronizing nutrition goals with onboarding data...');

    const newGoals: NutritionGoals = {
      dailyCalories: onboardingData.dailyCalorieGoal,
      protein: onboardingData.dailyProteinGoal,
      carbs: onboardingData.dailyCarbsGoal,
      fat: onboardingData.dailyFatGoal,
      waterIntake: 2000,
    };

    const currentGoals = state.dashboardData.userMetrics.nutritionGoals;

    // Check if goals have actually changed to avoid unnecessary updates
    const goalsChanged = (
      currentGoals.dailyCalories !== newGoals.dailyCalories ||
      currentGoals.protein !== newGoals.protein ||
      currentGoals.carbs !== newGoals.carbs ||
      currentGoals.fat !== newGoals.fat
    );

    if (goalsChanged) {
      console.log('📊 Goals changed, updating dashboard data...');
      console.log('Old goals:', currentGoals);
      console.log('New goals:', newGoals);

      // Update dashboard data with new goals
      const updatedDashboardData = {
        ...state.dashboardData,
        nutrition: {
          ...state.dashboardData.nutrition,
          goals: newGoals,
        },
        userMetrics: {
          ...state.dashboardData.userMetrics,
          nutritionGoals: newGoals,
        },
      };

      dispatch({ type: 'SET_DASHBOARD_DATA', payload: updatedDashboardData });

      // Save updated data to storage
      const saveUpdatedData = async () => {
        try {
          const storageKey = `dashboard_${user.id}_${state.currentDate}`;
          await AsyncStorage.setItem(storageKey, JSON.stringify(updatedDashboardData));
          console.log('✅ Updated goals saved to storage');
        } catch (error) {
          console.error('❌ Error saving updated goals:', error);
        }
      };

      saveUpdatedData();
    } else {
      console.log('✅ Goals already up to date');
    }
  }, [
    onboardingData.dailyCalorieGoal,
    onboardingData.dailyProteinGoal,
    onboardingData.dailyCarbsGoal,
    onboardingData.dailyFatGoal,
    state.dashboardData?.date,
    user?.id
  ]);

  // Recalculate daily progress when dashboard data changes
  useEffect(() => {
    if (state.dashboardData) {
      dispatch({ type: 'CALCULATE_DAILY_PROGRESS' });
    }
  }, [state.dashboardData]);

  const setCurrentDate = (date: string) => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: date });
  };

  const addMealEntry = (meal: MealEntry) => {
    dispatch({ type: 'ADD_MEAL_ENTRY', payload: meal });

    // Save to storage immediately for persistence
    try {
      await saveDashboardData();

      // Also save meal entry separately for better persistence
      if (user) {
        const mealKey = `nutrition_${user.id}_${state.currentDate}`;
        const existingMeals = await AsyncStorage.getItem(mealKey);
        const mealData = existingMeals ? JSON.parse(existingMeals) : [];

        // Add new meal entry
        const nutritionEntry = {
          id: `local_${Date.now()}`,
          user_id: user.id,
          date: state.currentDate,
          meal_type: meal.type,
          food_name: meal.name,
          calories: meal.macros.calories,
          carbs_g: meal.macros.carbs,
          protein_g: meal.macros.protein,
          fat_g: meal.macros.fat,
          quantity: meal.quantity || 1,
          unit: meal.unit || 'serving',
          logged_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mealData.push(nutritionEntry);
        await AsyncStorage.setItem(mealKey, JSON.stringify(mealData));

        console.log('✅ Meal entry saved to local storage');
      }
    } catch (error) {
      console.error('❌ Error saving meal entry:', error);
    }
  };

  const removeMealEntry = (mealId: string) => {
    dispatch({ type: 'REMOVE_MEAL_ENTRY', payload: mealId });
    saveDashboardData();
  };

  const updateWaterIntake = (glasses: number) => {
    const waterInMl = glasses * 250; // 250ml per glass
    dispatch({ type: 'UPDATE_WATER_INTAKE', payload: waterInMl });

    // Save to storage immediately for persistence
    try {
      await saveDashboardData();

      // Also save water intake separately for better persistence
      if (user) {
        const waterKey = `water_${user.id}_${state.currentDate}`;
        const existingWater = await AsyncStorage.getItem(waterKey);
        const waterData = existingWater ? JSON.parse(existingWater) : [];

        // Add new water entry for the last glass added
        const waterEntry = {
          id: `local_${Date.now()}`,
          user_id: user.id,
          date: state.currentDate,
          amount_ml: 250, // Last glass added
          logged_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };

        waterData.push(waterEntry);
        await AsyncStorage.setItem(waterKey, JSON.stringify(waterData));

        console.log('✅ Water intake saved to local storage');
      }
    } catch (error) {
      console.error('❌ Error saving water intake:', error);
    }
  };

  const addExerciseSession = (exercise: ExerciseSession) => {
    dispatch({ type: 'ADD_EXERCISE_SESSION', payload: exercise });
    saveDashboardData();
  };

  const updateUserMetrics = (metrics: Partial<UserMetrics>) => {
    dispatch({ type: 'UPDATE_USER_METRICS', payload: metrics });
    saveDashboardData();
  };

  // Create dashboard data for guest users (not authenticated)
  const createGuestDashboardData = async () => {
    console.log('Creating guest dashboard data');
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Check if we have onboarding data to use for personalized goals
      const nutritionGoals = await getUserNutritionGoals();
      console.log('🎯 Guest dashboard using nutrition goals:', nutritionGoals);

      // Create guest data with personalized goals if available
      const guestData = await createGuestDashboardDataWithGoals('guest', state.currentDate, nutritionGoals);
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: guestData });
    } catch (error) {
      console.error('Error creating guest dashboard data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });
    }
  };

  const loadDashboardData = async (date: string) => {
    if (!user) {
      console.log('No user found, skipping dashboard data load');
      return;
    }

    console.log('Loading dashboard data for user:', user.id, 'date:', date);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const storageKey = `dashboard_${user.id}_${date}`;
      const storedData = await AsyncStorage.getItem(storageKey);

      // Get current nutrition goals to check if they've changed
      const currentGoals = await getUserNutritionGoals();
      console.log('Current nutrition goals for comparison:', currentGoals);

      if (storedData) {
        console.log('Found stored dashboard data');
        const dashboardData: DashboardData = JSON.parse(storedData);

        // Check if stored goals are different from current goals
        const storedGoals = dashboardData.userMetrics.nutritionGoals;
        const goalsChanged = (
          storedGoals.dailyCalories !== currentGoals.dailyCalories ||
          storedGoals.protein !== currentGoals.protein ||
          storedGoals.carbs !== currentGoals.carbs ||
          storedGoals.fat !== currentGoals.fat
        );

        if (goalsChanged) {
          console.log('🔄 Goals have changed! Updating stored dashboard data...');
          console.log('Old goals:', storedGoals);
          console.log('New goals:', currentGoals);

          // Update the dashboard data with new goals
          const updatedDashboardData = {
            ...dashboardData,
            nutrition: {
              ...dashboardData.nutrition,
              goals: currentGoals,
            },
            userMetrics: {
              ...dashboardData.userMetrics,
              nutritionGoals: currentGoals,
            },
          };

          // Save updated data back to storage
          await AsyncStorage.setItem(storageKey, JSON.stringify(updatedDashboardData));
          dispatch({ type: 'SET_DASHBOARD_DATA', payload: updatedDashboardData });
        } else {
          console.log('✅ Goals unchanged, using stored data');

          // Load individual data entries for more accurate data
          try {
            const [waterData, mealData] = await Promise.all([
              AsyncStorage.getItem(`water_${user.id}_${date}`),
              AsyncStorage.getItem(`nutrition_${user.id}_${date}`)
            ]);

            // Merge water data
            if (waterData) {
              const waterEntries = JSON.parse(waterData);
              const totalWater = waterEntries.reduce((sum: number, entry: any) => sum + entry.amount_ml, 0);
              dashboardData.nutrition.waterIntake = totalWater;
            }

            // Merge meal data
            if (mealData) {
              const mealEntries = JSON.parse(mealData);
              const totalMacros = mealEntries.reduce((sum: any, entry: any) => ({
                calories: sum.calories + (entry.calories || 0),
                carbs: sum.carbs + (entry.carbs_g || 0),
                protein: sum.protein + (entry.protein_g || 0),
                fat: sum.fat + (entry.fat_g || 0),
              }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

              dashboardData.nutrition.totalMacros = totalMacros;

              // Convert to meal entries format
              dashboardData.nutrition.meals = mealEntries.map((entry: any) => ({
                id: entry.id,
                name: entry.food_name,
                type: entry.meal_type,
                macros: {
                  calories: entry.calories || 0,
                  carbs: entry.carbs_g || 0,
                  protein: entry.protein_g || 0,
                  fat: entry.fat_g || 0,
                },
                quantity: entry.quantity || 1,
                unit: entry.unit || 'serving',
                timestamp: new Date(entry.logged_at || entry.created_at),
              }));
            }
          } catch (mergeError) {
            console.warn('Error merging individual data entries:', mergeError);
          }

          dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardData });
        }
      } else {
        console.log('No stored data found, creating default dashboard data');
        // Create default dashboard data for new date
        const defaultData = await createDefaultDashboardData(user.id, date);
        console.log('Created default dashboard data:', defaultData);
        dispatch({ type: 'SET_DASHBOARD_DATA', payload: defaultData });

        // Save the default data immediately
        await AsyncStorage.setItem(storageKey, JSON.stringify(defaultData));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load dashboard data' });

      // Try to create minimal fallback data
      try {
        const fallbackData = await createFallbackDashboardData(user.id, date);
        dispatch({ type: 'SET_DASHBOARD_DATA', payload: fallbackData });
      } catch (fallbackError) {
        console.error('Error creating fallback data:', fallbackError);
      }
    }
  };

  const saveDashboardData = async () => {
    if (!user || !state.dashboardData) return;
    
    try {
      const storageKey = `dashboard_${user.id}_${state.currentDate}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(state.dashboardData));
    } catch (error) {
      console.error('Error saving dashboard data:', error);
    }
  };

  // Get real user nutrition goals from onboarding data or Supabase
  const getUserNutritionGoals = async (): Promise<NutritionGoals> => {
    try {
      console.log('🎯 Getting user nutrition goals...');
      console.log('🔍 Current onboarding data:', {
        dailyCalorieGoal: onboardingData.dailyCalorieGoal,
        dailyProteinGoal: onboardingData.dailyProteinGoal,
        dailyCarbsGoal: onboardingData.dailyCarbsGoal,
        dailyFatGoal: onboardingData.dailyFatGoal,
      });

      // First try to get from onboarding data (most recent)
      if (onboardingData.dailyCalorieGoal && onboardingData.dailyProteinGoal &&
          onboardingData.dailyCarbsGoal && onboardingData.dailyFatGoal) {
        console.log('✅ Using onboarding data for nutrition goals');
        const goals = {
          dailyCalories: onboardingData.dailyCalorieGoal,
          protein: onboardingData.dailyProteinGoal,
          carbs: onboardingData.dailyCarbsGoal,
          fat: onboardingData.dailyFatGoal,
          waterIntake: 2000, // Default water goal
        };
        console.log('🎯 Onboarding goals being returned:', goals);
        return goals;
      } else {
        console.log('❌ Onboarding data incomplete, checking individual values:');
        console.log('  dailyCalorieGoal:', onboardingData.dailyCalorieGoal);
        console.log('  dailyProteinGoal:', onboardingData.dailyProteinGoal);
        console.log('  dailyCarbsGoal:', onboardingData.dailyCarbsGoal);
        console.log('  dailyFatGoal:', onboardingData.dailyFatGoal);
      }

      // Try to get from Supabase if user is authenticated
      if (user?.id) {
        try {
          console.log('🔍 Trying to get goals from Supabase for user:', user.id);
          const userProfile = await UserProfileService.getByClerkId(user.id);
          console.log('Supabase user profile:', userProfile);

          if (userProfile && userProfile.daily_calorie_goal) {
            console.log('✅ Using Supabase data for nutrition goals');
            const goals = {
              dailyCalories: userProfile.daily_calorie_goal,
              protein: userProfile.daily_protein_goal_g || 100,
              carbs: userProfile.daily_carbs_goal_g || 200,
              fat: userProfile.daily_fat_goal_g || 65,
              waterIntake: userProfile.daily_water_goal_ml || 2000,
            };
            console.log('Supabase goals:', goals);
            return goals;
          } else {
            console.log('❌ No valid Supabase profile found or missing calorie goal');
          }
        } catch (error) {
          console.error('❌ Error loading user profile goals:', error);
        }
      } else {
        console.log('❌ No authenticated user for Supabase lookup');
      }

      // Fallback to default goals
      console.log('⚠️ Using fallback default nutrition goals');
      const fallbackGoals = {
        dailyCalories: 2000,
        protein: 100,
        carbs: 250,
        fat: 65,
        waterIntake: 2000,
      };
      console.log('⚠️ Fallback goals being returned:', fallbackGoals);
      return fallbackGoals;
    } catch (error) {
      console.error('Error in getUserNutritionGoals:', error);
      // Return safe defaults
      return {
        dailyCalories: 2000,
        protein: 100,
        carbs: 250,
        fat: 65,
        waterIntake: 2000,
      };
    }
  };

  const createDefaultDashboardData = async (userId: string, date: string): Promise<DashboardData> => {
    try {
      console.log('Creating default dashboard data for user:', userId);

      // Get real user nutrition goals
      const nutritionGoals = await getUserNutritionGoals();
      console.log('🎯 Got nutrition goals for dashboard creation:', nutritionGoals);

      // Load user metrics from storage or create defaults
      const userMetricsKey = `user_metrics_${userId}`;
      const storedMetrics = await AsyncStorage.getItem(userMetricsKey);

      const defaultMetrics: UserMetrics = storedMetrics
        ? { ...JSON.parse(storedMetrics), nutritionGoals } // Update with real goals
        : {
            userId,
            currentWeight: onboardingData.currentWeight || 70,
            targetWeight: onboardingData.targetWeight || 65,
            height: onboardingData.height || 170,
            age: onboardingData.age || 30,
            gender: (onboardingData.gender as any) || 'female',
            activityLevel: (onboardingData.activityLevel as any) || 'moderately_active',
            goals: onboardingData.goals || ['lose_weight'],
            weeklyWeightGoal: onboardingData.weeklyGoal || 0.5,
            bmr: onboardingData.bmr || 1400,
            tdee: onboardingData.tdee || 1800,
            nutritionGoals,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

      const dashboardData: DashboardData = {
        date,
        nutrition: {
          date,
          userId,
          meals: [],
          totalMacros: { calories: 0, carbs: 0, protein: 0, fat: 0 },
          waterIntake: 0,
          exerciseCaloriesBurned: 0,
          goals: defaultMetrics.nutritionGoals,
        },
        exercises: [],
        userMetrics: defaultMetrics,
        streaks: {
          logging: 0,
          exercise: 0,
          waterGoal: 0,
        },
        achievements: [],
      };

      console.log('Successfully created default dashboard data');
      return dashboardData;
    } catch (error) {
      console.error('Error in createDefaultDashboardData:', error);
      throw error;
    }
  };

  // Create guest dashboard data with specific nutrition goals
  const createGuestDashboardDataWithGoals = async (userId: string, date: string, nutritionGoals: NutritionGoals): Promise<DashboardData> => {
    console.log('Creating guest dashboard data with goals:', nutritionGoals);

    const guestMetrics: UserMetrics = {
      userId,
      currentWeight: onboardingData.currentWeight || 70,
      targetWeight: onboardingData.targetWeight || 65,
      height: onboardingData.height || 170,
      age: onboardingData.age || 30,
      gender: (onboardingData.gender as any) || 'female',
      activityLevel: (onboardingData.activityLevel as any) || 'moderately_active',
      goals: onboardingData.goals || ['lose_weight'],
      weeklyWeightGoal: onboardingData.weeklyGoal || 0.5,
      bmr: onboardingData.bmr || 1400,
      tdee: onboardingData.tdee || 1800,
      nutritionGoals,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      date,
      nutrition: {
        date,
        userId,
        meals: [],
        totalMacros: { calories: 0, carbs: 0, protein: 0, fat: 0 },
        waterIntake: 0,
        exerciseCaloriesBurned: 0,
        goals: nutritionGoals,
      },
      exercises: [],
      userMetrics: guestMetrics,
      streaks: {
        logging: 0,
        exercise: 0,
        waterGoal: 0,
      },
      achievements: [],
    };
  };

  // Fallback function for when everything else fails
  const createFallbackDashboardData = async (userId: string, date: string): Promise<DashboardData> => {
    console.log('Creating fallback dashboard data');

    const fallbackGoals: NutritionGoals = {
      dailyCalories: 2000,
      protein: 100,
      carbs: 250,
      fat: 65,
      waterIntake: 2000,
    };

    const fallbackMetrics: UserMetrics = {
      userId,
      currentWeight: 70,
      targetWeight: 65,
      height: 170,
      age: 30,
      gender: 'female',
      activityLevel: 'moderately_active',
      goals: ['lose_weight'],
      weeklyWeightGoal: 0.5,
      bmr: 1400,
      tdee: 1800,
      nutritionGoals: fallbackGoals,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      date,
      nutrition: {
        date,
        userId,
        meals: [],
        totalMacros: { calories: 0, carbs: 0, protein: 0, fat: 0 },
        waterIntake: 0,
        exerciseCaloriesBurned: 0,
        goals: fallbackGoals,
      },
      exercises: [],
      userMetrics: fallbackMetrics,
      streaks: {
        logging: 0,
        exercise: 0,
        waterGoal: 0,
      },
      achievements: [],
    };
  };

  return (
    <NutritionContext.Provider
      value={{
        state,
        setCurrentDate,
        addMealEntry,
        removeMealEntry,
        updateWaterIntake,
        addExerciseSession,
        updateUserMetrics,
        loadDashboardData,
        saveDashboardData,
        refreshDashboardData,
        clearDashboardCache,
        resetNutritionData,
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition() {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
}
