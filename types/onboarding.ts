export interface UserProfile {
  goals: string[];
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  weeklyGoal: number; // kg per week
}

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle?: string;
  completed: boolean;
}
