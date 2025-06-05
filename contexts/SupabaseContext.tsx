import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { supabase, subscribeToUserData } from '../lib/supabase';
import { UserProfileService, NutritionService, WaterService, ProgressService } from '../services/database';
import { UserProfile, DailyProgress, NutritionEntry, WaterIntake } from '../types/supabase';

interface SupabaseContextType {
  userProfile: UserProfile | null;
  dailyProgress: DailyProgress | null;
  todayNutrition: NutritionEntry[];
  todayWater: WaterIntake[];
  isLoading: boolean;
  isConnected: boolean;
  refreshData: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addNutritionEntry: (entry: any) => Promise<void>;
  addWaterIntake: (amount: number) => Promise<void>;
  syncOfflineData: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

interface SupabaseProviderProps {
  children: ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const { user, isLoaded } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [todayNutrition, setTodayNutrition] = useState<NutritionEntry[]>([]);
  const [todayWater, setTodayWater] = useState<WaterIntake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  // Get today's date
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Load initial data
  const loadUserData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load user profile
      const profile = await UserProfileService.getByClerkId(user.id);
      setUserProfile(profile);

      if (profile) {
        const today = getTodayDate();
        
        // Load today's data
        const [progress, nutrition, water] = await Promise.all([
          ProgressService.getDailyProgress(profile.id, today),
          NutritionService.getEntriesByDate(profile.id, today),
          WaterService.getDailyIntake(profile.id, today),
        ]);

        setDailyProgress(progress);
        setTodayNutrition(nutrition);
        setTodayWater(water);
      }

      setIsConnected(true);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    await loadUserData();
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id || !userProfile) return;

    try {
      const updatedProfile = await UserProfileService.update(user.id, updates);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Add nutrition entry
  const addNutritionEntry = async (entryData: any) => {
    if (!userProfile) return;

    try {
      const entry = await NutritionService.addEntry({
        user_id: userProfile.id,
        date: getTodayDate(),
        ...entryData,
      });

      setTodayNutrition(prev => [...prev, entry]);
      
      // Refresh daily progress
      const progress = await ProgressService.getDailyProgress(userProfile.id, getTodayDate());
      setDailyProgress(progress);
    } catch (error) {
      console.error('Error adding nutrition entry:', error);
      throw error;
    }
  };

  // Add water intake
  const addWaterIntake = async (amount: number) => {
    if (!userProfile) return;

    try {
      const intake = await WaterService.addIntake({
        user_id: userProfile.id,
        date: getTodayDate(),
        amount_ml: amount,
      });

      setTodayWater(prev => [...prev, intake]);
      
      // Refresh daily progress
      const progress = await ProgressService.getDailyProgress(userProfile.id, getTodayDate());
      setDailyProgress(progress);
    } catch (error) {
      console.error('Error adding water intake:', error);
      throw error;
    }
  };

  // Sync offline data
  const syncOfflineData = async () => {
    try {
      // This will be handled by the offline queue in the supabase client
      await refreshData();
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!userProfile?.id) return;

    const subscriptions: any[] = [];

    // Subscribe to nutrition entries
    const nutritionSub = subscribeToUserData(
      userProfile.id,
      'nutrition_entries',
      (payload) => {
        console.log('Nutrition entry change:', payload);
        if (payload.eventType === 'INSERT') {
          setTodayNutrition(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setTodayNutrition(prev => 
            prev.map(entry => entry.id === payload.new.id ? payload.new : entry)
          );
        } else if (payload.eventType === 'DELETE') {
          setTodayNutrition(prev => 
            prev.filter(entry => entry.id !== payload.old.id)
          );
        }
      }
    );

    // Subscribe to water intake
    const waterSub = subscribeToUserData(
      userProfile.id,
      'water_intake',
      (payload) => {
        console.log('Water intake change:', payload);
        if (payload.eventType === 'INSERT') {
          setTodayWater(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setTodayWater(prev => 
            prev.filter(intake => intake.id !== payload.old.id)
          );
        }
      }
    );

    // Subscribe to daily progress
    const progressSub = subscribeToUserData(
      userProfile.id,
      'daily_progress',
      (payload) => {
        console.log('Daily progress change:', payload);
        if (payload.new.date === getTodayDate()) {
          setDailyProgress(payload.new);
        }
      }
    );

    subscriptions.push(nutritionSub, waterSub, progressSub);

    return () => {
      subscriptions.forEach(sub => {
        if (sub && typeof sub.unsubscribe === 'function') {
          sub.unsubscribe();
        }
      });
    };
  }, [userProfile?.id]);

  // Load data when user changes
  useEffect(() => {
    if (isLoaded && user) {
      loadUserData();
    } else if (isLoaded && !user) {
      // Clear data when user logs out
      setUserProfile(null);
      setDailyProgress(null);
      setTodayNutrition([]);
      setTodayWater([]);
      setIsLoading(false);
    }
  }, [isLoaded, user?.id]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.from('user_profiles').select('id').limit(1);
        setIsConnected(!error);
      } catch {
        setIsConnected(false);
      }
    };

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const value: SupabaseContextType = {
    userProfile,
    dailyProgress,
    todayNutrition,
    todayWater,
    isLoading,
    isConnected,
    refreshData,
    updateUserProfile,
    addNutritionEntry,
    addWaterIntake,
    syncOfflineData,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}
