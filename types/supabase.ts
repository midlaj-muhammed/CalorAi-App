// Supabase Database Types for CalorAi

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: UserProfileInsert;
        Update: UserProfileUpdate;
      };
      nutrition_entries: {
        Row: NutritionEntry;
        Insert: NutritionEntryInsert;
        Update: NutritionEntryUpdate;
      };
      water_intake: {
        Row: WaterIntake;
        Insert: WaterIntakeInsert;
        Update: WaterIntakeUpdate;
      };
      exercise_sessions: {
        Row: ExerciseSession;
        Insert: ExerciseSessionInsert;
        Update: ExerciseSessionUpdate;
      };
      exercise_details: {
        Row: ExerciseDetail;
        Insert: ExerciseDetailInsert;
        Update: ExerciseDetailUpdate;
      };
      recipes: {
        Row: Recipe;
        Insert: RecipeInsert;
        Update: RecipeUpdate;
      };
      daily_progress: {
        Row: DailyProgress;
        Insert: DailyProgressInsert;
        Update: DailyProgressUpdate;
      };
      fasting_sessions: {
        Row: FastingSession;
        Insert: FastingSessionInsert;
        Update: FastingSessionUpdate;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: UserPreferencesInsert;
        Update: UserPreferencesUpdate;
      };
    };
  };
}

// User Profile Types
export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height_cm?: number;
  current_weight_kg?: number;
  target_weight_kg?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  goals?: string[];
  weekly_weight_goal_kg?: number;
  daily_calorie_goal?: number;
  daily_protein_goal_g?: number;
  daily_carbs_goal_g?: number;
  daily_fat_goal_g?: number;
  daily_water_goal_ml?: number;
  timezone?: string;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInsert {
  clerk_user_id: string;
  email: string;
  full_name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height_cm?: number;
  current_weight_kg?: number;
  target_weight_kg?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  goals?: string[];
  weekly_weight_goal_kg?: number;
  daily_calorie_goal?: number;
  daily_protein_goal_g?: number;
  daily_carbs_goal_g?: number;
  daily_fat_goal_g?: number;
  daily_water_goal_ml?: number;
  timezone?: string;
  onboarding_completed?: boolean;
}

export interface UserProfileUpdate {
  full_name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height_cm?: number;
  current_weight_kg?: number;
  target_weight_kg?: number;
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  goals?: string[];
  weekly_weight_goal_kg?: number;
  daily_calorie_goal?: number;
  daily_protein_goal_g?: number;
  daily_carbs_goal_g?: number;
  daily_fat_goal_g?: number;
  daily_water_goal_ml?: number;
  timezone?: string;
  onboarding_completed?: boolean;
}

// Nutrition Entry Types
export interface NutritionEntry {
  id: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  food_name: string;
  brand?: string;
  serving_size?: string;
  quantity?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NutritionEntryInsert {
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  food_name: string;
  brand?: string;
  serving_size?: string;
  quantity?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  notes?: string;
}

export interface NutritionEntryUpdate {
  date?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  food_name?: string;
  brand?: string;
  serving_size?: string;
  quantity?: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  notes?: string;
}

// Water Intake Types
export interface WaterIntake {
  id: string;
  user_id: string;
  date: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

export interface WaterIntakeInsert {
  user_id: string;
  date: string;
  amount_ml: number;
  logged_at?: string;
}

export interface WaterIntakeUpdate {
  date?: string;
  amount_ml?: number;
  logged_at?: string;
}

// Exercise Session Types
export interface ExerciseSession {
  id: string;
  user_id: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration_minutes?: number;
  calories_burned?: number;
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSessionInsert {
  user_id: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration_minutes?: number;
  calories_burned?: number;
  date: string;
  notes?: string;
}

export interface ExerciseSessionUpdate {
  name?: string;
  type?: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  duration_minutes?: number;
  calories_burned?: number;
  date?: string;
  notes?: string;
}

// Exercise Detail Types
export interface ExerciseDetail {
  id: string;
  session_id: string;
  exercise_name: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  distance_km?: number;
  rest_seconds?: number;
  notes?: string;
  created_at: string;
}

export interface ExerciseDetailInsert {
  session_id: string;
  exercise_name: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  distance_km?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface ExerciseDetailUpdate {
  exercise_name?: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  distance_km?: number;
  rest_seconds?: number;
  notes?: string;
}

// Recipe Types
export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  calories_per_serving?: number;
  protein_per_serving_g?: number;
  carbs_per_serving_g?: number;
  fat_per_serving_g?: number;
  ingredients?: any; // JSONB
  instructions?: string[];
  image_url?: string;
  is_favorite?: boolean;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeInsert {
  user_id: string;
  name: string;
  description?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  calories_per_serving?: number;
  protein_per_serving_g?: number;
  carbs_per_serving_g?: number;
  fat_per_serving_g?: number;
  ingredients?: any;
  instructions?: string[];
  image_url?: string;
  is_favorite?: boolean;
  is_public?: boolean;
}

export interface RecipeUpdate {
  name?: string;
  description?: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  calories_per_serving?: number;
  protein_per_serving_g?: number;
  carbs_per_serving_g?: number;
  fat_per_serving_g?: number;
  ingredients?: any;
  instructions?: string[];
  image_url?: string;
  is_favorite?: boolean;
  is_public?: boolean;
}

// Daily Progress Types
export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  total_calories?: number;
  total_protein_g?: number;
  total_carbs_g?: number;
  total_fat_g?: number;
  total_water_ml?: number;
  exercise_calories_burned?: number;
  weight_kg?: number;
  created_at: string;
  updated_at: string;
}

export interface DailyProgressInsert {
  user_id: string;
  date: string;
  total_calories?: number;
  total_protein_g?: number;
  total_carbs_g?: number;
  total_fat_g?: number;
  total_water_ml?: number;
  exercise_calories_burned?: number;
  weight_kg?: number;
}

export interface DailyProgressUpdate {
  total_calories?: number;
  total_protein_g?: number;
  total_carbs_g?: number;
  total_fat_g?: number;
  total_water_ml?: number;
  exercise_calories_burned?: number;
  weight_kg?: number;
}

// Fasting Session Types
export interface FastingSession {
  id: string;
  user_id: string;
  start_time: string;
  planned_end_time: string;
  actual_end_time?: string;
  fasting_type?: string;
  status?: 'active' | 'completed' | 'broken';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FastingSessionInsert {
  user_id: string;
  start_time: string;
  planned_end_time: string;
  actual_end_time?: string;
  fasting_type?: string;
  status?: 'active' | 'completed' | 'broken';
  notes?: string;
}

export interface FastingSessionUpdate {
  start_time?: string;
  planned_end_time?: string;
  actual_end_time?: string;
  fasting_type?: string;
  status?: 'active' | 'completed' | 'broken';
  notes?: string;
}

// User Preferences Types
export interface UserPreferences {
  id: string;
  user_id: string;
  notifications_enabled?: boolean;
  water_reminders?: boolean;
  meal_reminders?: boolean;
  exercise_reminders?: boolean;
  theme?: string;
  units?: 'metric' | 'imperial';
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesInsert {
  user_id: string;
  notifications_enabled?: boolean;
  water_reminders?: boolean;
  meal_reminders?: boolean;
  exercise_reminders?: boolean;
  theme?: string;
  units?: 'metric' | 'imperial';
}

export interface UserPreferencesUpdate {
  notifications_enabled?: boolean;
  water_reminders?: boolean;
  meal_reminders?: boolean;
  exercise_reminders?: boolean;
  theme?: string;
  units?: 'metric' | 'imperial';
}

// Utility Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type Gender = 'male' | 'female' | 'other';
export type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
export type FastingStatus = 'active' | 'completed' | 'broken';
export type Units = 'metric' | 'imperial';
