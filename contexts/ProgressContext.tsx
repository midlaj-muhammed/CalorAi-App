import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';
import { useNutrition } from './NutritionContext';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ProgressFilter = 'all' | 'nutrition' | 'exercise' | 'weight' | 'habits';

export interface WeightEntry {
  date: string;
  weight: number;
  note?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'nutrition' | 'exercise' | 'consistency' | 'milestone';
  unlockedAt?: Date;
  progress: number; // 0-100
  target: number;
  current: number;
}

export interface ProgressMetrics {
  period: TimePeriod;
  startDate: string;
  endDate: string;
  nutrition: {
    avgCalories: number;
    avgCarbs: number;
    avgProtein: number;
    avgFat: number;
    goalAdherence: number; // percentage
    bestDay: string;
    worstDay: string;
  };
  exercise: {
    totalWorkouts: number;
    totalCaloriesBurned: number;
    avgWorkoutDuration: number;
    mostActiveDay: string;
    consistency: number; // percentage
  };
  weight: {
    startWeight?: number;
    endWeight?: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    entries: WeightEntry[];
  };
  habits: {
    loggingStreak: number;
    exerciseStreak: number;
    waterGoalStreak: number;
    longestLoggingStreak: number;
    longestExerciseStreak: number;
    longestWaterStreak: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
}

interface ProgressState {
  currentPeriod: TimePeriod;
  currentFilter: ProgressFilter;
  metrics: ProgressMetrics | null;
  achievements: Achievement[];
  weightEntries: WeightEntry[];
  isLoading: boolean;
  error: string | null;
}

interface ProgressContextType {
  state: ProgressState;
  setPeriod: (period: TimePeriod) => void;
  setFilter: (filter: ProgressFilter) => void;
  addWeightEntry: (entry: Omit<WeightEntry, 'date'>) => Promise<void>;
  getCalorieChartData: () => ChartData;
  getWeightChartData: () => ChartData;
  getMacroChartData: () => ChartData;
  getExerciseChartData: () => ChartData;
  refreshMetrics: () => Promise<void>;
  shareProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const initialState: ProgressState = {
  currentPeriod: 'weekly',
  currentFilter: 'all',
  metrics: null,
  achievements: [],
  weightEntries: [],
  isLoading: false,
  error: null,
};

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(initialState);
  const { user } = useUser();
  const { state: nutritionState } = useNutrition();

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user, state.currentPeriod]);

  const setPeriod = (period: TimePeriod) => {
    setState(prev => ({ ...prev, currentPeriod: period }));
  };

  const setFilter = (filter: ProgressFilter) => {
    setState(prev => ({ ...prev, currentFilter: filter }));
  };

  const loadProgressData = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Load weight entries
      const weightKey = `weight_entries_${user.id}`;
      const weightData = await AsyncStorage.getItem(weightKey);
      const weightEntries: WeightEntry[] = weightData ? JSON.parse(weightData) : [];

      // Load achievements
      const achievementsKey = `achievements_${user.id}`;
      const achievementsData = await AsyncStorage.getItem(achievementsKey);
      const achievements: Achievement[] = achievementsData ? JSON.parse(achievementsData) : getDefaultAchievements();

      // Calculate metrics based on current period
      const metrics = await calculateMetrics(state.currentPeriod, user.id);

      setState(prev => ({
        ...prev,
        metrics,
        achievements,
        weightEntries,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load progress data',
        isLoading: false,
      }));
    }
  };

  const addWeightEntry = async (entry: Omit<WeightEntry, 'date'>) => {
    if (!user) return;

    const newEntry: WeightEntry = {
      ...entry,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedEntries = [...state.weightEntries, newEntry].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setState(prev => ({ ...prev, weightEntries: updatedEntries }));

    // Save to storage
    const weightKey = `weight_entries_${user.id}`;
    await AsyncStorage.setItem(weightKey, JSON.stringify(updatedEntries));

    // Refresh metrics
    await refreshMetrics();
  };

  const calculateMetrics = async (period: TimePeriod, userId: string): Promise<ProgressMetrics> => {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'daily':
        // Today only
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Load historical data for the period
    const historicalData = await loadHistoricalData(userId, startDate, endDate);

    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      nutrition: calculateNutritionMetrics(historicalData),
      exercise: calculateExerciseMetrics(historicalData),
      weight: calculateWeightMetrics(state.weightEntries, startDate, endDate),
      habits: calculateHabitsMetrics(historicalData),
    };
  };

  const loadHistoricalData = async (userId: string, startDate: Date, endDate: Date) => {
    const data = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const storageKey = `dashboard_${userId}_${dateStr}`;
      
      try {
        const dayData = await AsyncStorage.getItem(storageKey);
        if (dayData) {
          data.push(JSON.parse(dayData));
        }
      } catch (error) {
        console.warn(`Failed to load data for ${dateStr}`);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  };

  const calculateNutritionMetrics = (data: any[]) => {
    if (data.length === 0) {
      return {
        avgCalories: 0,
        avgCarbs: 0,
        avgProtein: 0,
        avgFat: 0,
        goalAdherence: 0,
        bestDay: '',
        worstDay: '',
      };
    }

    const totalCalories = data.reduce((sum, day) => sum + (day.nutrition?.totalMacros?.calories || 0), 0);
    const totalCarbs = data.reduce((sum, day) => sum + (day.nutrition?.totalMacros?.carbs || 0), 0);
    const totalProtein = data.reduce((sum, day) => sum + (day.nutrition?.totalMacros?.protein || 0), 0);
    const totalFat = data.reduce((sum, day) => sum + (day.nutrition?.totalMacros?.fat || 0), 0);

    const avgCalories = totalCalories / data.length;
    const avgCarbs = totalCarbs / data.length;
    const avgProtein = totalProtein / data.length;
    const avgFat = totalFat / data.length;

    // Calculate goal adherence
    const goalAdherence = data.reduce((sum, day) => {
      const goal = day.nutrition?.goals?.dailyCalories || 2000;
      const actual = day.nutrition?.totalMacros?.calories || 0;
      const adherence = Math.min(100, (actual / goal) * 100);
      return sum + adherence;
    }, 0) / data.length;

    // Find best and worst days
    let bestDay = '';
    let worstDay = '';
    let bestScore = 0;
    let worstScore = 100;

    data.forEach(day => {
      const goal = day.nutrition?.goals?.dailyCalories || 2000;
      const actual = day.nutrition?.totalMacros?.calories || 0;
      const score = Math.abs(100 - (actual / goal) * 100);
      
      if (score < worstScore) {
        worstScore = score;
        bestDay = day.date;
      }
      if (score > bestScore) {
        bestScore = score;
        worstDay = day.date;
      }
    });

    return {
      avgCalories: Math.round(avgCalories),
      avgCarbs: Math.round(avgCarbs),
      avgProtein: Math.round(avgProtein),
      avgFat: Math.round(avgFat),
      goalAdherence: Math.round(goalAdherence),
      bestDay,
      worstDay,
    };
  };

  const calculateExerciseMetrics = (data: any[]) => {
    const totalWorkouts = data.reduce((sum, day) => sum + (day.exercises?.length || 0), 0);
    const totalCaloriesBurned = data.reduce((sum, day) => 
      sum + (day.exercises?.reduce((daySum: number, ex: any) => daySum + (ex.caloriesBurned || 0), 0) || 0), 0
    );
    const totalDuration = data.reduce((sum, day) => 
      sum + (day.exercises?.reduce((daySum: number, ex: any) => daySum + (ex.duration || 0), 0) || 0), 0
    );

    const avgWorkoutDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
    const daysWithWorkouts = data.filter(day => day.exercises?.length > 0).length;
    const consistency = data.length > 0 ? (daysWithWorkouts / data.length) * 100 : 0;

    // Find most active day
    let mostActiveDay = '';
    let maxCalories = 0;
    data.forEach(day => {
      const dayCalories = day.exercises?.reduce((sum: number, ex: any) => sum + (ex.caloriesBurned || 0), 0) || 0;
      if (dayCalories > maxCalories) {
        maxCalories = dayCalories;
        mostActiveDay = day.date;
      }
    });

    return {
      totalWorkouts,
      totalCaloriesBurned: Math.round(totalCaloriesBurned),
      avgWorkoutDuration: Math.round(avgWorkoutDuration),
      mostActiveDay,
      consistency: Math.round(consistency),
    };
  };

  const calculateWeightMetrics = (weightEntries: WeightEntry[], startDate: Date, endDate: Date) => {
    const periodEntries = weightEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    if (periodEntries.length === 0) {
      return {
        change: 0,
        trend: 'stable' as const,
        entries: [],
      };
    }

    const startWeight = periodEntries[0]?.weight;
    const endWeight = periodEntries[periodEntries.length - 1]?.weight;
    const change = endWeight - startWeight;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 0.5) {
      trend = change > 0 ? 'up' : 'down';
    }

    return {
      startWeight,
      endWeight,
      change: Math.round(change * 10) / 10,
      trend,
      entries: periodEntries,
    };
  };

  const calculateHabitsMetrics = (data: any[]) => {
    // Calculate current streaks and longest streaks
    let loggingStreak = 0;
    let exerciseStreak = 0;
    let waterGoalStreak = 0;
    let longestLoggingStreak = 0;
    let longestExerciseStreak = 0;
    let longestWaterStreak = 0;

    // Calculate current streaks from most recent data
    for (let i = data.length - 1; i >= 0; i--) {
      const day = data[i];
      
      if (day.nutrition?.meals?.length > 0) {
        loggingStreak++;
      } else {
        break;
      }
    }

    for (let i = data.length - 1; i >= 0; i--) {
      const day = data[i];
      
      if (day.exercises?.length > 0) {
        exerciseStreak++;
      } else {
        break;
      }
    }

    for (let i = data.length - 1; i >= 0; i--) {
      const day = data[i];
      const waterGoal = day.nutrition?.goals?.waterIntake || 2000;
      const waterConsumed = day.nutrition?.waterIntake || 0;
      
      if (waterConsumed >= waterGoal) {
        waterGoalStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streaks
    let currentLoggingStreak = 0;
    let currentExerciseStreak = 0;
    let currentWaterStreak = 0;

    data.forEach(day => {
      if (day.nutrition?.meals?.length > 0) {
        currentLoggingStreak++;
        longestLoggingStreak = Math.max(longestLoggingStreak, currentLoggingStreak);
      } else {
        currentLoggingStreak = 0;
      }

      if (day.exercises?.length > 0) {
        currentExerciseStreak++;
        longestExerciseStreak = Math.max(longestExerciseStreak, currentExerciseStreak);
      } else {
        currentExerciseStreak = 0;
      }

      const waterGoal = day.nutrition?.goals?.waterIntake || 2000;
      const waterConsumed = day.nutrition?.waterIntake || 0;
      if (waterConsumed >= waterGoal) {
        currentWaterStreak++;
        longestWaterStreak = Math.max(longestWaterStreak, currentWaterStreak);
      } else {
        currentWaterStreak = 0;
      }
    });

    return {
      loggingStreak,
      exerciseStreak,
      waterGoalStreak,
      longestLoggingStreak,
      longestExerciseStreak,
      longestWaterStreak,
    };
  };

  const getDefaultAchievements = (): Achievement[] => [
    {
      id: 'first_log',
      title: 'First Steps',
      description: 'Log your first meal',
      icon: 'restaurant',
      category: 'nutrition',
      progress: 0,
      target: 1,
      current: 0,
    },
    {
      id: 'week_streak',
      title: 'Week Warrior',
      description: 'Log meals for 7 consecutive days',
      icon: 'local-fire-department',
      category: 'consistency',
      progress: 0,
      target: 7,
      current: 0,
    },
    {
      id: 'first_workout',
      title: 'Fitness Starter',
      description: 'Complete your first workout',
      icon: 'fitness-center',
      category: 'exercise',
      progress: 0,
      target: 1,
      current: 0,
    },
    {
      id: 'hydration_hero',
      title: 'Hydration Hero',
      description: 'Meet your water goal for 5 days',
      icon: 'local-drink',
      category: 'nutrition',
      progress: 0,
      target: 5,
      current: 0,
    },
  ];

  const getCalorieChartData = (): ChartData => {
    if (!state.metrics) return { labels: [], datasets: [] };

    // Generate sample data based on period
    const labels = generateLabelsForPeriod(state.currentPeriod);
    const data = generateSampleCalorieData(labels.length);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const getWeightChartData = (): ChartData => {
    if (state.weightEntries.length === 0) return { labels: [], datasets: [] };

    const entries = state.weightEntries.slice(-10); // Last 10 entries
    const labels = entries.map(entry => {
      const date = new Date(entry.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const data = entries.map(entry => entry.weight);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const getMacroChartData = (): ChartData => {
    if (!state.metrics) return { labels: [], datasets: [] };

    const labels = ['Carbs', 'Protein', 'Fat'];
    const data = [
      state.metrics.nutrition.avgCarbs,
      state.metrics.nutrition.avgProtein,
      state.metrics.nutrition.avgFat,
    ];

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      }],
    };
  };

  const getExerciseChartData = (): ChartData => {
    if (!state.metrics) return { labels: [], datasets: [] };

    const labels = generateLabelsForPeriod(state.currentPeriod);
    const data = generateSampleExerciseData(labels.length);

    return {
      labels,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const generateLabelsForPeriod = (period: TimePeriod): string[] => {
    const labels = [];
    const today = new Date();

    switch (period) {
      case 'daily':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
        break;
      case 'weekly':
        for (let i = 3; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - (i * 7));
          labels.push(`Week ${4 - i}`);
        }
        break;
      case 'monthly':
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(today.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;
      case 'yearly':
        for (let i = 2; i >= 0; i--) {
          const date = new Date(today);
          date.setFullYear(today.getFullYear() - i);
          labels.push(date.getFullYear().toString());
        }
        break;
    }

    return labels;
  };

  const generateSampleCalorieData = (length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 500) + 1500);
  };

  const generateSampleExerciseData = (length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 400) + 100);
  };

  const refreshMetrics = async () => {
    await loadProgressData();
  };

  const shareProgress = async () => {
    // Implementation for sharing progress
    console.log('Sharing progress...');
  };

  return (
    <ProgressContext.Provider
      value={{
        state,
        setPeriod,
        setFilter,
        addWeightEntry,
        getCalorieChartData,
        getWeightChartData,
        getMacroChartData,
        getExerciseChartData,
        refreshMetrics,
        shareProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
