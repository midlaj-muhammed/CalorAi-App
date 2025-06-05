-- Row Level Security (RLS) Policies for CalorAi
-- Run this in Supabase SQL Editor after creating the schema

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
-- Users can only access their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Nutrition Entries Policies
-- Users can only access their own nutrition entries
CREATE POLICY "Users can view own nutrition entries" ON nutrition_entries
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own nutrition entries" ON nutrition_entries
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own nutrition entries" ON nutrition_entries
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own nutrition entries" ON nutrition_entries
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Water Intake Policies
CREATE POLICY "Users can view own water intake" ON water_intake
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own water intake" ON water_intake
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own water intake" ON water_intake
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Exercise Sessions Policies
CREATE POLICY "Users can view own exercise sessions" ON exercise_sessions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own exercise sessions" ON exercise_sessions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own exercise sessions" ON exercise_sessions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own exercise sessions" ON exercise_sessions
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Exercise Details Policies
CREATE POLICY "Users can view own exercise details" ON exercise_details
  FOR SELECT USING (
    session_id IN (
      SELECT es.id FROM exercise_sessions es
      JOIN user_profiles up ON es.user_id = up.id
      WHERE up.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own exercise details" ON exercise_details
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT es.id FROM exercise_sessions es
      JOIN user_profiles up ON es.user_id = up.id
      WHERE up.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own exercise details" ON exercise_details
  FOR UPDATE USING (
    session_id IN (
      SELECT es.id FROM exercise_sessions es
      JOIN user_profiles up ON es.user_id = up.id
      WHERE up.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own exercise details" ON exercise_details
  FOR DELETE USING (
    session_id IN (
      SELECT es.id FROM exercise_sessions es
      JOIN user_profiles up ON es.user_id = up.id
      WHERE up.clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Recipes Policies
-- Users can view their own recipes and public recipes
CREATE POLICY "Users can view own and public recipes" ON recipes
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    ) OR is_public = true
  );

CREATE POLICY "Users can insert own recipes" ON recipes
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own recipes" ON recipes
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own recipes" ON recipes
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Daily Progress Policies
CREATE POLICY "Users can view own daily progress" ON daily_progress
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own daily progress" ON daily_progress
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own daily progress" ON daily_progress
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Fasting Sessions Policies
CREATE POLICY "Users can view own fasting sessions" ON fasting_sessions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own fasting sessions" ON fasting_sessions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own fasting sessions" ON fasting_sessions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete own fasting sessions" ON fasting_sessions
  FOR DELETE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- User Preferences Policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM user_profiles 
      WHERE clerk_user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create a function to get current user's profile ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM user_profiles 
    WHERE clerk_user_id = auth.jwt() ->> 'sub'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
