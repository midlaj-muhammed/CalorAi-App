import { OnboardingData, CalorieCalculationResult } from '../contexts/OnboardingContext';

// API configuration
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

// Error types for better error handling
export interface CalorieServiceError {
  message: string;
  code: 'INVALID_INPUT' | 'API_ERROR' | 'NETWORK_ERROR' | 'PARSING_ERROR';
}

// Validation function for onboarding data
function validateOnboardingData(data: Partial<OnboardingData>): string[] {
  const errors: string[] = [];

  if (!data.age || data.age < 13 || data.age > 120) {
    errors.push('Age must be between 13 and 120 years');
  }

  if (!data.height || data.height < 100 || data.height > 250) {
    errors.push('Height must be between 100 and 250 cm');
  }

  if (!data.currentWeight || data.currentWeight < 30 || data.currentWeight > 300) {
    errors.push('Current weight must be between 30 and 300 kg');
  }

  if (!data.targetWeight || data.targetWeight < 30 || data.targetWeight > 300) {
    errors.push('Target weight must be between 30 and 300 kg');
  }

  if (!data.gender || !['male', 'female', 'other'].includes(data.gender)) {
    errors.push('Gender must be specified');
  }

  if (!data.activityLevel || !Object.keys(ACTIVITY_MULTIPLIERS).includes(data.activityLevel)) {
    errors.push('Activity level must be specified');
  }

  return errors;
}

// Create structured prompt for Google Gemini
function createCaloriePrompt(data: Partial<OnboardingData>): string {
  const goalDescription = data.goals?.join(', ') || 'general health';
  const weightChange = (data.targetWeight || 0) - (data.currentWeight || 0);
  const weightGoal = weightChange > 0 ? 'gain weight' : weightChange < 0 ? 'lose weight' : 'maintain weight';

  return `You are a certified nutritionist and fitness expert. Calculate personalized daily calorie goals and provide comprehensive nutrition advice.

USER PROFILE:
- Age: ${data.age} years
- Gender: ${data.gender}
- Height: ${data.height} cm
- Current Weight: ${data.currentWeight} kg
- Target Weight: ${data.targetWeight} kg
- Activity Level: ${data.activityLevel}
- Goals: ${goalDescription}
- Weekly Goal: ${data.weeklyGoal} kg per week

TASK: Provide a comprehensive nutrition plan with accurate calculations.

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "bmr": 1650,
  "tdee": 2200,
  "dailyCalorieGoal": 1950,
  "macroBreakdown": {
    "protein": 25,
    "carbs": 45,
    "fats": 30
  },
  "personalizedAdvice": [
    "Focus on lean proteins like chicken, fish, and legumes",
    "Include complex carbohydrates for sustained energy",
    "Stay hydrated with at least 8 glasses of water daily"
  ],
  "timelineEstimate": "You can expect to reach your target weight in approximately 12-16 weeks with consistent effort"
}

CALCULATION REQUIREMENTS:
1. Use Mifflin-St Jeor equation for BMR calculation
2. Apply appropriate activity multiplier for TDEE
3. Adjust calories based on weight goal (deficit for loss, surplus for gain)
4. Provide realistic macro percentages based on goals
5. Include 3-5 specific, actionable nutrition tips
6. Give realistic timeline estimate based on safe weight change rates

IMPORTANT: Ensure all numbers are realistic and safe. Daily calorie goal should not be below 1200 for women or 1500 for men.`;
}

// Main function to calculate personalized calories using AI
export async function calculatePersonalizedCalories(
  data: Partial<OnboardingData>
): Promise<CalorieCalculationResult> {
  // Validate input data
  const validationErrors = validateOnboardingData(data);
  if (validationErrors.length > 0) {
    throw {
      message: `Invalid input data: ${validationErrors.join(', ')}`,
      code: 'INVALID_INPUT'
    } as CalorieServiceError;
  }

  // Check if API key is available
  if (!API_KEY) {
    console.warn('Gemini API key not found, using fallback calculation');
    return calculateCaloriesFallback(data);
  }

  try {
    const prompt = createCaloriePrompt(data);
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024,
      }
    };

    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw {
        message: `API request failed: ${response.status}`,
        code: 'API_ERROR'
      } as CalorieServiceError;
    }

    const responseData = await response.json();
    
    if (!responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content) {
      throw {
        message: 'Invalid response from Gemini API',
        code: 'API_ERROR'
      } as CalorieServiceError;
    }

    const textResponse = responseData.candidates[0].content.parts[0].text;
    
    try {
      // Extract JSON from response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate response structure
      if (!parsedResponse.bmr || !parsedResponse.tdee || !parsedResponse.dailyCalorieGoal) {
        throw new Error('Missing required fields in AI response');
      }

      return {
        ...parsedResponse,
        calculationMethod: 'ai' as const
      };

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response:', textResponse);
      
      // Fallback to manual calculation if parsing fails
      return calculateCaloriesFallback(data);
    }

  } catch (error) {
    console.error('Error in AI calorie calculation:', error);
    
    // Fallback to manual calculation
    return calculateCaloriesFallback(data);
  }
}

// Fallback manual calculation using established formulas
export function calculateCaloriesFallback(data: Partial<OnboardingData>): CalorieCalculationResult {
  const { age, gender, height, currentWeight, targetWeight, activityLevel, goals } = data;

  // Calculate BMR using Mifflin-St Jeor equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * (currentWeight || 70) + 6.25 * (height || 175) - 5 * (age || 30) + 5;
  } else {
    bmr = 10 * (currentWeight || 60) + 6.25 * (height || 165) - 5 * (age || 30) - 161;
  }

  // Calculate TDEE
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel || 'sedentary'];
  const tdee = bmr * activityMultiplier;

  // Determine calorie goal based on target
  const weightDifference = (targetWeight || currentWeight || 70) - (currentWeight || 70);
  let dailyCalorieGoal = tdee;

  if (weightDifference < 0) {
    // Weight loss: create deficit
    dailyCalorieGoal = tdee - 500; // ~0.5kg per week loss
  } else if (weightDifference > 0) {
    // Weight gain: create surplus
    dailyCalorieGoal = tdee + 300; // ~0.3kg per week gain
  }

  // Ensure minimum calorie intake
  const minCalories = gender === 'male' ? 1500 : 1200;
  dailyCalorieGoal = Math.max(dailyCalorieGoal, minCalories);

  // Default macro breakdown
  const macroBreakdown = {
    protein: goals?.includes('build_muscle') ? 30 : 25,
    carbs: goals?.includes('build_muscle') ? 40 : 45,
    fats: goals?.includes('build_muscle') ? 30 : 30,
  };

  // Generate basic advice
  const personalizedAdvice = [
    'Focus on whole, unprocessed foods for better nutrition',
    'Include lean proteins in every meal to support your goals',
    'Stay hydrated with at least 8 glasses of water daily',
    'Eat regular meals to maintain stable energy levels',
  ];

  // Calculate timeline estimate
  const weeksToGoal = Math.abs(weightDifference) / 0.5; // Assuming 0.5kg per week
  const timelineEstimate = `You can expect to reach your target weight in approximately ${Math.ceil(weeksToGoal)} weeks with consistent effort`;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalorieGoal: Math.round(dailyCalorieGoal),
    macroBreakdown,
    personalizedAdvice,
    timelineEstimate,
    calculationMethod: 'manual' as const,
  };
}
