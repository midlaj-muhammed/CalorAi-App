-- CalorAi Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm DECIMAL(5,2),
  current_weight_kg DECIMAL(5,2),
  target_weight_kg DECIMAL(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  goals TEXT[], -- Array of goal strings
  weekly_weight_goal_kg DECIMAL(4,2),
  daily_calorie_goal INTEGER,
  daily_protein_goal_g DECIMAL(6,2),
  daily_carbs_goal_g DECIMAL(6,2),
  daily_fat_goal_g DECIMAL(6,2),
  daily_water_goal_ml INTEGER DEFAULT 2000,
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition Tracking Table
CREATE TABLE IF NOT EXISTS nutrition_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  food_name TEXT NOT NULL,
  brand TEXT,
  serving_size TEXT,
  quantity DECIMAL(8,2) DEFAULT 1,
  calories DECIMAL(8,2),
  protein_g DECIMAL(8,2),
  carbs_g DECIMAL(8,2),
  fat_g DECIMAL(8,2),
  fiber_g DECIMAL(8,2),
  sugar_g DECIMAL(8,2),
  sodium_mg DECIMAL(8,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water Intake Tracking
CREATE TABLE IF NOT EXISTS water_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise Sessions
CREATE TABLE IF NOT EXISTS exercise_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cardio', 'strength', 'flexibility', 'sports', 'other')),
  duration_minutes INTEGER,
  calories_burned INTEGER,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise Details (for strength training)
CREATE TABLE IF NOT EXISTS exercise_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES exercise_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight_kg DECIMAL(6,2),
  distance_km DECIMAL(8,2),
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER DEFAULT 1,
  calories_per_serving DECIMAL(8,2),
  protein_per_serving_g DECIMAL(8,2),
  carbs_per_serving_g DECIMAL(8,2),
  fat_per_serving_g DECIMAL(8,2),
  ingredients JSONB,
  instructions TEXT[],
  image_url TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Progress Summary
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calories DECIMAL(8,2) DEFAULT 0,
  total_protein_g DECIMAL(8,2) DEFAULT 0,
  total_carbs_g DECIMAL(8,2) DEFAULT 0,
  total_fat_g DECIMAL(8,2) DEFAULT 0,
  total_water_ml INTEGER DEFAULT 0,
  exercise_calories_burned INTEGER DEFAULT 0,
  weight_kg DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Intermittent Fasting Sessions
CREATE TABLE IF NOT EXISTS fasting_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  planned_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  fasting_type TEXT, -- '16:8', '18:6', '20:4', etc.
  status TEXT CHECK (status IN ('active', 'completed', 'broken')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  water_reminders BOOLEAN DEFAULT TRUE,
  meal_reminders BOOLEAN DEFAULT TRUE,
  exercise_reminders BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light',
  units TEXT CHECK (units IN ('metric', 'imperial')) DEFAULT 'metric',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user_date ON nutrition_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON water_intake(user_id, date);
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user_date ON exercise_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_fasting_sessions_user_id ON fasting_sessions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nutrition_entries_updated_at BEFORE UPDATE ON nutrition_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exercise_sessions_updated_at BEFORE UPDATE ON exercise_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_progress_updated_at BEFORE UPDATE ON daily_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fasting_sessions_updated_at BEFORE UPDATE ON fasting_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
