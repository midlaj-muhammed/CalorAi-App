import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfileService, NutritionService, WaterService, ProgressService } from './database';
import { UserProfileInsert } from '../types/supabase';

interface LegacyOnboardingData {
  goals: string[];
  activityLevel: string;
  age: number;
  gender: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  weeklyGoal: number;
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyCarbsGoal?: number;
  dailyFatGoal?: number;
  completed: boolean;
}

interface LegacyNutritionData {
  dailyProgress?: {
    date: string;
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      meals?: Array<{
        mealType: string;
        foods: Array<{
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
          quantity?: number;
        }>;
      }>;
    };
    water?: {
      total: number;
      glasses: number;
    };
  };
}

export class MigrationService {
  private static readonly MIGRATION_KEY = 'calorAi_migration_completed';
  private static readonly ONBOARDING_KEY = 'calorAi_onboarding_data';
  private static readonly NUTRITION_KEY = 'calorAi_nutrition_data';

  // Check if migration has been completed
  static async isMigrationCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(this.MIGRATION_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  // Mark migration as completed
  static async markMigrationCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.MIGRATION_KEY, 'true');
    } catch (error) {
      console.error('Error marking migration completed:', error);
    }
  }

  // Migrate user profile data from onboarding
  static async migrateUserProfile(clerkUserId: string, email: string): Promise<void> {
    try {
      // Check if user already exists in Supabase
      const existingProfile = await UserProfileService.getByClerkId(clerkUserId);
      if (existingProfile) {
        console.log('User profile already exists in Supabase');
        return;
      }

      // Get legacy onboarding data
      const onboardingDataStr = await AsyncStorage.getItem(this.ONBOARDING_KEY);
      if (!onboardingDataStr) {
        console.log('No legacy onboarding data found');
        return;
      }

      const onboardingData: LegacyOnboardingData = JSON.parse(onboardingDataStr);

      // Map legacy data to Supabase format
      const profileData: UserProfileInsert = {
        clerk_user_id: clerkUserId,
        email: email,
        age: onboardingData.age,
        gender: this.mapGender(onboardingData.gender),
        height_cm: onboardingData.height,
        current_weight_kg: onboardingData.currentWeight,
        target_weight_kg: onboardingData.targetWeight,
        activity_level: this.mapActivityLevel(onboardingData.activityLevel),
        goals: onboardingData.goals,
        weekly_weight_goal_kg: onboardingData.weeklyGoal,
        daily_calorie_goal: onboardingData.dailyCalorieGoal,
        daily_protein_goal_g: onboardingData.dailyProteinGoal,
        daily_carbs_goal_g: onboardingData.dailyCarbsGoal,
        daily_fat_goal_g: onboardingData.dailyFatGoal,
        onboarding_completed: onboardingData.completed,
      };

      // Create user profile in Supabase
      await UserProfileService.create(profileData);
      console.log('Successfully migrated user profile to Supabase');

    } catch (error) {
      console.error('Error migrating user profile:', error);
      throw error;
    }
  }

  // Migrate nutrition data
  static async migrateNutritionData(userId: string): Promise<void> {
    try {
      // Get legacy nutrition data
      const nutritionDataStr = await AsyncStorage.getItem(this.NUTRITION_KEY);
      if (!nutritionDataStr) {
        console.log('No legacy nutrition data found');
        return;
      }

      const nutritionData: LegacyNutritionData = JSON.parse(nutritionDataStr);
      
      if (nutritionData.dailyProgress) {
        const { dailyProgress } = nutritionData;
        const date = dailyProgress.date || new Date().toISOString().split('T')[0];

        // Migrate nutrition entries
        if (dailyProgress.nutrition?.meals) {
          for (const meal of dailyProgress.nutrition.meals) {
            for (const food of meal.foods) {
              await NutritionService.addEntry({
                user_id: userId,
                date: date,
                meal_type: this.mapMealType(meal.mealType),
                food_name: food.name,
                quantity: food.quantity || 1,
                calories: food.calories,
                protein_g: food.protein,
                carbs_g: food.carbs,
                fat_g: food.fat,
              });
            }
          }
        }

        // Migrate water intake
        if (dailyProgress.water && dailyProgress.water.total > 0) {
          // Convert total water to individual glasses (250ml each)
          const glassSize = 250;
          const totalGlasses = Math.floor(dailyProgress.water.total / glassSize);
          
          for (let i = 0; i < totalGlasses; i++) {
            await WaterService.addIntake({
              user_id: userId,
              date: date,
              amount_ml: glassSize,
            });
          }

          // Add remaining water if any
          const remainingWater = dailyProgress.water.total % glassSize;
          if (remainingWater > 0) {
            await WaterService.addIntake({
              user_id: userId,
              date: date,
              amount_ml: remainingWater,
            });
          }
        }

        console.log('Successfully migrated nutrition data to Supabase');
      }

    } catch (error) {
      console.error('Error migrating nutrition data:', error);
      throw error;
    }
  }

  // Complete migration process
  static async performMigration(clerkUserId: string, email: string): Promise<void> {
    try {
      console.log('Starting migration process...');

      // Migrate user profile first
      await this.migrateUserProfile(clerkUserId, email);

      // Get the created user profile to get the Supabase user ID
      const userProfile = await UserProfileService.getByClerkId(clerkUserId);
      if (!userProfile) {
        throw new Error('Failed to create or retrieve user profile');
      }

      // Migrate nutrition data
      await this.migrateNutritionData(userProfile.id);

      // Mark migration as completed
      await this.markMigrationCompleted();

      console.log('Migration completed successfully');

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  // Clean up legacy data (optional - call after successful migration)
  static async cleanupLegacyData(): Promise<void> {
    try {
      const keysToRemove = [
        this.ONBOARDING_KEY,
        this.NUTRITION_KEY,
        // Add other legacy keys as needed
      ];

      await AsyncStorage.multiRemove(keysToRemove);
      console.log('Legacy data cleaned up');

    } catch (error) {
      console.error('Error cleaning up legacy data:', error);
    }
  }

  // Helper methods for data mapping
  private static mapGender(gender: string): 'male' | 'female' | 'other' {
    const lowerGender = gender.toLowerCase();
    if (lowerGender === 'male' || lowerGender === 'female') {
      return lowerGender as 'male' | 'female';
    }
    return 'other';
  }

  private static mapActivityLevel(level: string): 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' {
    const levelMap: { [key: string]: any } = {
      'sedentary': 'sedentary',
      'lightly_active': 'lightly_active',
      'light': 'lightly_active',
      'moderately_active': 'moderately_active',
      'moderate': 'moderately_active',
      'very_active': 'very_active',
      'very': 'very_active',
      'extremely_active': 'extremely_active',
      'extreme': 'extremely_active',
    };

    return levelMap[level.toLowerCase()] || 'sedentary';
  }

  private static mapMealType(mealType: string): 'breakfast' | 'lunch' | 'dinner' | 'snacks' {
    const typeMap: { [key: string]: any } = {
      'breakfast': 'breakfast',
      'lunch': 'lunch',
      'dinner': 'dinner',
      'snack': 'snacks',
      'snacks': 'snacks',
    };

    return typeMap[mealType.toLowerCase()] || 'snacks';
  }

  // Check if user needs migration
  static async needsMigration(clerkUserId: string): Promise<boolean> {
    try {
      // Check if migration is already completed
      const migrationCompleted = await this.isMigrationCompleted();
      if (migrationCompleted) {
        return false;
      }

      // Check if user exists in Supabase
      const existingProfile = await UserProfileService.getByClerkId(clerkUserId);
      if (existingProfile) {
        // User exists in Supabase, mark migration as completed
        await this.markMigrationCompleted();
        return false;
      }

      // Check if there's legacy data to migrate
      const onboardingData = await AsyncStorage.getItem(this.ONBOARDING_KEY);
      return !!onboardingData;

    } catch (error) {
      console.error('Error checking migration needs:', error);
      return false;
    }
  }
}
