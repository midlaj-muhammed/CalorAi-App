export interface MacroNutrients {
  calories: number;
  carbs: number; // in grams
  protein: number; // in grams
  fat: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in mg
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  servingUnit: string;
  macros: MacroNutrients;
  barcode?: string;
  imageUrl?: string;
  category?: string;
  verified?: boolean;
}

export interface MealEntry {
  id: string;
  userId: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  loggedAt: Date;
  notes?: string;
}

export interface DailyNutrition {
  date: string; // YYYY-MM-DD format
  userId: string;
  meals: MealEntry[];
  totalMacros: MacroNutrients;
  waterIntake: number; // in ml
  exerciseCaloriesBurned: number;
  goals: MacroNutrients;
}

export interface NutritionGoals {
  dailyCalories: number;
  carbs: number; // in grams
  protein: number; // in grams
  fat: number; // in grams
  waterIntake: number; // in ml (daily goal)
}

export interface WeeklyProgress {
  weekStartDate: string;
  dailyData: DailyNutrition[];
  averageMacros: MacroNutrients;
  totalExerciseCalories: number;
  averageWaterIntake: number;
  goalAdherence: {
    calories: number; // percentage
    macros: number; // percentage
    water: number; // percentage
  };
}

export interface UserMetrics {
  userId: string;
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  height: number; // in cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  goals: string[]; // e.g., ['lose_weight', 'build_muscle']
  weeklyWeightGoal: number; // kg per week
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  nutritionGoals: NutritionGoals;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseSession {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  duration: number; // in seconds
  caloriesBurned: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  setsCompleted: number;
  totalSets: number;
  completedAt: Date;
  notes?: string;
}

export interface DashboardData {
  date: string;
  nutrition: DailyNutrition;
  exercises: ExerciseSession[];
  userMetrics: UserMetrics;
  streaks: {
    logging: number; // consecutive days of logging meals
    exercise: number; // consecutive days of exercise
    waterGoal: number; // consecutive days meeting water goal
  };
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'nutrition' | 'exercise' | 'consistency' | 'milestone';
}

// Utility types for calculations
export interface CalorieBalance {
  consumed: number;
  burned: number;
  remaining: number;
  goal: number;
  netCalories: number;
}

export interface MacroProgress {
  current: number;
  goal: number;
  percentage: number;
  remaining: number;
  status: 'under' | 'on_track' | 'over';
}

export interface DailyProgress {
  calories: CalorieBalance;
  macros: {
    carbs: MacroProgress;
    protein: MacroProgress;
    fat: MacroProgress;
  };
  water: {
    current: number; // in ml
    goal: number; // in ml
    percentage: number;
    glassesConsumed: number; // assuming 250ml per glass
    glassesGoal: number;
  };
}
