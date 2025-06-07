import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, handleSupabaseError, formatDateForDB, getTodayDate, offlineQueue } from '../lib/supabase';
import {
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  NutritionEntry,
  NutritionEntryInsert,
  NutritionEntryUpdate,
  WaterIntake,
  WaterIntakeInsert,
  ExerciseSession,
  ExerciseSessionInsert,
  Recipe,
  RecipeInsert,
  DailyProgress,
  DailyProgressInsert,
  FastingSession,
  FastingSessionInsert,
  UserPreferences,
  UserPreferencesInsert,
  MealType,
} from '../types/supabase';

// Local Storage Keys
const STORAGE_KEYS = {
  WATER_INTAKE: (userId: string, date: string) => `water_${userId}_${date}`,
  NUTRITION_ENTRIES: (userId: string, date: string) => `nutrition_${userId}_${date}`,
  DAILY_PROGRESS: (userId: string, date: string) => `progress_${userId}_${date}`,
  EXERCISE_SESSIONS: (userId: string, date: string) => `exercise_${userId}_${date}`,
  USER_PROFILE: (userId: string) => `profile_${userId}`,
  OFFLINE_QUEUE: 'offline_queue',
} as const;

// Local Storage Service for offline data persistence
export class LocalStorageService {
  // Save data to local storage
  static async saveData<T>(key: string, data: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      console.log(`✅ Saved data to local storage: ${key}`);
    } catch (error) {
      console.error(`❌ Error saving data to local storage (${key}):`, error);
    }
  }

  // Load data from local storage
  static async loadData<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch (error) {
      console.error(`❌ Error loading data from local storage (${key}):`, error);
      return null;
    }
  }

  // Remove data from local storage
  static async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Removed data from local storage: ${key}`);
    } catch (error) {
      console.error(`❌ Error removing data from local storage (${key}):`, error);
    }
  }

  // Clear all user data from local storage
  static async clearUserData(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.includes(userId));
      await AsyncStorage.multiRemove(userKeys);
      console.log(`🗑️ Cleared all user data for: ${userId}`);
    } catch (error) {
      console.error(`❌ Error clearing user data:`, error);
    }
  }

  // Get all keys for a specific user and date
  static async getUserDateKeys(userId: string, date: string): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.includes(userId) && key.includes(date));
    } catch (error) {
      console.error(`❌ Error getting user date keys:`, error);
      return [];
    }
  }
}

// User Profile Operations
export class UserProfileService {
  static async create(profileData: UserProfileInsert): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      // Add to offline queue if connection fails
      offlineQueue.add('insert', 'user_profiles', profileData);
      throw handleSupabaseError(error, 'create user profile');
    }
  }

  static async getByClerkId(clerkUserId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      handleSupabaseError(error, 'get user profile');
      return null;
    }
  }

  static async update(clerkUserId: string, updates: UserProfileUpdate): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('update', 'user_profiles', { clerkUserId, updates });
      throw handleSupabaseError(error, 'update user profile');
    }
  }

  static async delete(clerkUserId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('clerk_user_id', clerkUserId);

      if (error) throw error;
    } catch (error) {
      throw handleSupabaseError(error, 'delete user profile');
    }
  }
}

// Nutrition Entry Operations
export class NutritionService {
  static async addEntry(entryData: NutritionEntryInsert): Promise<NutritionEntry> {
    try {
      // Try to save to Supabase first
      const { data, error } = await supabase
        .from('nutrition_entries')
        .insert(entryData)
        .select()
        .single();

      if (error) throw error;

      // Save to local storage for persistence
      await this.saveToLocalStorage(entryData.user_id, entryData.date, data);

      // Update daily progress
      await this.updateDailyProgress(entryData.user_id, entryData.date);

      return data;
    } catch (error) {
      // If Supabase fails, create local entry and queue for sync
      const localEntry: NutritionEntry = {
        id: `local_${Date.now()}`,
        ...entryData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to local storage
      await this.saveToLocalStorage(entryData.user_id, entryData.date, localEntry);

      // Queue for sync when online
      offlineQueue.add('insert', 'nutrition_entries', entryData);

      return localEntry;
    }
  }

  // Save nutrition entry to local storage
  static async saveToLocalStorage(userId: string, date: string, entry: NutritionEntry): Promise<void> {
    const key = STORAGE_KEYS.NUTRITION_ENTRIES(userId, date);
    const existingData = await LocalStorageService.loadData<NutritionEntry[]>(key) || [];

    // Check if entry already exists (avoid duplicates)
    const existingIndex = existingData.findIndex(item => item.id === entry.id);
    if (existingIndex >= 0) {
      existingData[existingIndex] = entry;
    } else {
      existingData.push(entry);
    }

    await LocalStorageService.saveData(key, existingData);
  }

  static async getEntriesByDate(userId: string, date: string): Promise<NutritionEntry[]> {
    try {
      // Try to get from Supabase first
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Save to local storage for offline access
      if (data && data.length > 0) {
        const key = STORAGE_KEYS.NUTRITION_ENTRIES(userId, date);
        await LocalStorageService.saveData(key, data);
      }

      return data || [];
    } catch (error) {
      // If Supabase fails, try to load from local storage
      console.log('🔄 Loading nutrition entries from local storage...');
      const key = STORAGE_KEYS.NUTRITION_ENTRIES(userId, date);
      const localData = await LocalStorageService.loadData<NutritionEntry[]>(key);

      handleSupabaseError(error, 'get nutrition entries');
      return localData || [];
    }
  }

  static async getEntriesByMealType(userId: string, date: string, mealType: MealType): Promise<NutritionEntry[]> {
    try {
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .eq('meal_type', mealType)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get nutrition entries by meal type');
      return [];
    }
  }

  static async updateEntry(entryId: string, updates: NutritionEntryUpdate): Promise<NutritionEntry> {
    try {
      const { data, error } = await supabase
        .from('nutrition_entries')
        .update(updates)
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;
      
      // Update daily progress
      await this.updateDailyProgress(data.user_id, data.date);
      
      return data;
    } catch (error) {
      offlineQueue.add('update', 'nutrition_entries', { id: entryId, updates });
      throw handleSupabaseError(error, 'update nutrition entry');
    }
  }

  static async deleteEntry(entryId: string): Promise<void> {
    try {
      // Get entry data before deletion for progress update
      const { data: entry } = await supabase
        .from('nutrition_entries')
        .select('user_id, date')
        .eq('id', entryId)
        .single();

      const { error } = await supabase
        .from('nutrition_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      
      // Update daily progress
      if (entry) {
        await this.updateDailyProgress(entry.user_id, entry.date);
      }
    } catch (error) {
      offlineQueue.add('delete', 'nutrition_entries', { id: entryId });
      throw handleSupabaseError(error, 'delete nutrition entry');
    }
  }

  static async updateDailyProgress(userId: string, date: string): Promise<void> {
    try {
      // Calculate totals from nutrition entries
      const { data: entries } = await supabase
        .from('nutrition_entries')
        .select('calories, protein_g, carbs_g, fat_g')
        .eq('user_id', userId)
        .eq('date', date);

      const totals = entries?.reduce(
        (acc, entry) => ({
          calories: acc.calories + (entry.calories || 0),
          protein: acc.protein + (entry.protein_g || 0),
          carbs: acc.carbs + (entry.carbs_g || 0),
          fat: acc.fat + (entry.fat_g || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

      // Get water intake for the day
      const { data: waterEntries } = await supabase
        .from('water_intake')
        .select('amount_ml')
        .eq('user_id', userId)
        .eq('date', date);

      const totalWater = waterEntries?.reduce((acc, entry) => acc + entry.amount_ml, 0) || 0;

      // Upsert daily progress
      await supabase
        .from('daily_progress')
        .upsert({
          user_id: userId,
          date,
          total_calories: totals.calories,
          total_protein_g: totals.protein,
          total_carbs_g: totals.carbs,
          total_fat_g: totals.fat,
          total_water_ml: totalWater,
        }, {
          onConflict: 'user_id,date',
        });
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  }
}

// Water Intake Operations
export class WaterService {
  static async addIntake(intakeData: WaterIntakeInsert): Promise<WaterIntake> {
    try {
      // Try to save to Supabase first
      const { data, error } = await supabase
        .from('water_intake')
        .insert(intakeData)
        .select()
        .single();

      if (error) throw error;

      // Save to local storage for persistence
      await this.saveToLocalStorage(intakeData.user_id, intakeData.date, data);

      // Update daily progress
      await NutritionService.updateDailyProgress(intakeData.user_id, intakeData.date);

      return data;
    } catch (error) {
      // If Supabase fails, create local entry and queue for sync
      const localEntry: WaterIntake = {
        id: `local_${Date.now()}`,
        ...intakeData,
        created_at: new Date().toISOString(),
      };

      // Save to local storage
      await this.saveToLocalStorage(intakeData.user_id, intakeData.date, localEntry);

      // Queue for sync when online
      offlineQueue.add('insert', 'water_intake', intakeData);

      return localEntry;
    }
  }

  // Save water intake to local storage
  static async saveToLocalStorage(userId: string, date: string, intake: WaterIntake): Promise<void> {
    const key = STORAGE_KEYS.WATER_INTAKE(userId, date);
    const existingData = await LocalStorageService.loadData<WaterIntake[]>(key) || [];

    // Check if entry already exists (avoid duplicates)
    const existingIndex = existingData.findIndex(item => item.id === intake.id);
    if (existingIndex >= 0) {
      existingData[existingIndex] = intake;
    } else {
      existingData.push(intake);
    }

    await LocalStorageService.saveData(key, existingData);
  }

  static async getDailyIntake(userId: string, date: string): Promise<WaterIntake[]> {
    try {
      // Try to get from Supabase first
      const { data, error } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('logged_at', { ascending: true });

      if (error) throw error;

      // Save to local storage for offline access
      if (data && data.length > 0) {
        const key = STORAGE_KEYS.WATER_INTAKE(userId, date);
        await LocalStorageService.saveData(key, data);
      }

      return data || [];
    } catch (error) {
      // If Supabase fails, try to load from local storage
      console.log('🔄 Loading water intake from local storage...');
      const key = STORAGE_KEYS.WATER_INTAKE(userId, date);
      const localData = await LocalStorageService.loadData<WaterIntake[]>(key);

      handleSupabaseError(error, 'get daily water intake');
      return localData || [];
    }
  }

  static async getTotalDailyIntake(userId: string, date: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('water_intake')
        .select('amount_ml')
        .eq('user_id', userId)
        .eq('date', date);

      if (error) throw error;
      return data?.reduce((total, entry) => total + entry.amount_ml, 0) || 0;
    } catch (error) {
      handleSupabaseError(error, 'get total daily water intake');
      return 0;
    }
  }

  static async deleteIntake(intakeId: string): Promise<void> {
    try {
      // Get intake data before deletion for progress update
      const { data: intake } = await supabase
        .from('water_intake')
        .select('user_id, date')
        .eq('id', intakeId)
        .single();

      const { error } = await supabase
        .from('water_intake')
        .delete()
        .eq('id', intakeId);

      if (error) throw error;

      // Update daily progress
      if (intake) {
        await NutritionService.updateDailyProgress(intake.user_id, intake.date);
      }
    } catch (error) {
      offlineQueue.add('delete', 'water_intake', { id: intakeId });
      throw handleSupabaseError(error, 'delete water intake');
    }
  }
}

// Exercise Operations
export class ExerciseService {
  static async addSession(sessionData: ExerciseSessionInsert): Promise<ExerciseSession> {
    try {
      const { data, error } = await supabase
        .from('exercise_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('insert', 'exercise_sessions', sessionData);
      throw handleSupabaseError(error, 'add exercise session');
    }
  }

  static async getSessionsByDate(userId: string, date: string): Promise<ExerciseSession[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get exercise sessions');
      return [];
    }
  }

  static async getRecentSessions(userId: string, limit: number = 10): Promise<ExerciseSession[]> {
    try {
      const { data, error } = await supabase
        .from('exercise_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get recent exercise sessions');
      return [];
    }
  }

  static async updateSession(sessionId: string, updates: Partial<ExerciseSession>): Promise<ExerciseSession> {
    try {
      const { data, error } = await supabase
        .from('exercise_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('update', 'exercise_sessions', { id: sessionId, updates });
      throw handleSupabaseError(error, 'update exercise session');
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('exercise_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      offlineQueue.add('delete', 'exercise_sessions', { id: sessionId });
      throw handleSupabaseError(error, 'delete exercise session');
    }
  }
}

// Recipe Operations
export class RecipeService {
  static async create(recipeData: RecipeInsert): Promise<Recipe> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert(recipeData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('insert', 'recipes', recipeData);
      throw handleSupabaseError(error, 'create recipe');
    }
  }

  static async getUserRecipes(userId: string): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get user recipes');
      return [];
    }
  }

  static async getFavoriteRecipes(userId: string): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get favorite recipes');
      return [];
    }
  }

  static async getRecipesByMealType(userId: string, mealType: MealType): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('meal_type', mealType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get recipes by meal type');
      return [];
    }
  }

  static async toggleFavorite(recipeId: string, isFavorite: boolean): Promise<Recipe> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update({ is_favorite: isFavorite })
        .eq('id', recipeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('update', 'recipes', { id: recipeId, updates: { is_favorite: isFavorite } });
      throw handleSupabaseError(error, 'toggle recipe favorite');
    }
  }

  static async update(recipeId: string, updates: Partial<Recipe>): Promise<Recipe> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .update(updates)
        .eq('id', recipeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('update', 'recipes', { id: recipeId, updates });
      throw handleSupabaseError(error, 'update recipe');
    }
  }

  static async delete(recipeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;
    } catch (error) {
      offlineQueue.add('delete', 'recipes', { id: recipeId });
      throw handleSupabaseError(error, 'delete recipe');
    }
  }
}

// Daily Progress Operations
export class ProgressService {
  static async getDailyProgress(userId: string, date: string): Promise<DailyProgress | null> {
    try {
      // Try to get from Supabase first
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Save to local storage for offline access
      if (data) {
        const key = STORAGE_KEYS.DAILY_PROGRESS(userId, date);
        await LocalStorageService.saveData(key, data);
      }

      return data || null;
    } catch (error) {
      // If Supabase fails, try to load from local storage
      console.log('🔄 Loading daily progress from local storage...');
      const key = STORAGE_KEYS.DAILY_PROGRESS(userId, date);
      const localData = await LocalStorageService.loadData<DailyProgress>(key);

      handleSupabaseError(error, 'get daily progress');
      return localData || null;
    }
  }

  static async getProgressRange(userId: string, startDate: string, endDate: string): Promise<DailyProgress[]> {
    try {
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get progress range');
      return [];
    }
  }

  static async updateWeight(userId: string, date: string, weight: number): Promise<DailyProgress> {
    try {
      const { data, error } = await supabase
        .from('daily_progress')
        .upsert({
          user_id: userId,
          date,
          weight_kg: weight,
        }, {
          onConflict: 'user_id,date',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('update', 'daily_progress', { userId, date, weight_kg: weight });
      throw handleSupabaseError(error, 'update weight');
    }
  }

  static async getWeightHistory(userId: string, days: number = 30): Promise<DailyProgress[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('daily_progress')
        .select('date, weight_kg')
        .eq('user_id', userId)
        .gte('date', formatDateForDB(startDate))
        .not('weight_kg', 'is', null)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get weight history');
      return [];
    }
  }
}

// Fasting Session Operations
export class FastingService {
  static async startSession(sessionData: FastingSessionInsert): Promise<FastingSession> {
    try {
      const { data, error } = await supabase
        .from('fasting_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('insert', 'fasting_sessions', sessionData);
      throw handleSupabaseError(error, 'start fasting session');
    }
  }

  static async getActiveSessions(userId: string): Promise<FastingSession[]> {
    try {
      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get active fasting sessions');
      return [];
    }
  }

  static async getRecentSessions(userId: string, limit: number = 10): Promise<FastingSession[]> {
    try {
      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      handleSupabaseError(error, 'get recent fasting sessions');
      return [];
    }
  }

  static async endSession(sessionId: string, actualEndTime: string, status: 'completed' | 'broken'): Promise<FastingSession> {
    try {
      const { data, error } = await supabase
        .from('fasting_sessions')
        .update({
          actual_end_time: actualEndTime,
          status,
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('update', 'fasting_sessions', {
        id: sessionId,
        updates: { actual_end_time: actualEndTime, status }
      });
      throw handleSupabaseError(error, 'end fasting session');
    }
  }
}

// User Preferences Operations
export class PreferencesService {
  static async get(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      handleSupabaseError(error, 'get user preferences');
      return null;
    }
  }

  static async upsert(userId: string, preferences: UserPreferencesInsert): Promise<UserPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      offlineQueue.add('update', 'user_preferences', { userId, preferences });
      throw handleSupabaseError(error, 'upsert user preferences');
    }
  }
}
