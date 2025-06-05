import * as FileSystem from 'expo-file-system';

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
  servingWeight?: number;
}

export interface FoodRecognitionResult {
  foodName: string;
  confidence: number;
  nutrition: NutritionInfo;
  alternativeNames?: string[];
  category?: string;
  brand?: string;
}

export interface MultipleFoodResult {
  foods: FoodRecognitionResult[];
  mainFood: FoodRecognitionResult;
  totalConfidence: number;
}

export interface GeminiResponse {
  success: boolean;
  result?: FoodRecognitionResult;
  multipleResult?: MultipleFoodResult;
  error?: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    // Get API key from environment or fallback
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyC4jDUKVWZsoR9NdN3qIXqPqAfLHbYX7G8';
    if (!this.apiKey || this.apiKey === 'AIzaSyC4jDUKVWZsoR9NdN3qIXqPqAfLHbYX7G8') {
      console.warn('Gemini API key not properly configured. Food recognition may have limited functionality.');
    }
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  private createPrompt(): string {
    return `Analyze this food image and provide detailed nutritional information.

IMPORTANT: Respond ONLY with valid JSON.

If you detect MULTIPLE distinct food items, use this format:
{
  "multipleFood": true,
  "foods": [
    {
      "foodName": "first food name",
      "confidence": 0.85,
      "nutrition": {
        "calories": 150,
        "protein": 5.2,
        "carbohydrates": 30.1,
        "fat": 2.8,
        "fiber": 4.5,
        "sugar": 12.3,
        "sodium": 45,
        "servingSize": "1 portion",
        "servingWeight": 100
      },
      "category": "fruit/vegetable/protein/grain/dairy/snack",
      "brand": null
    }
  ],
  "mainFood": "name of most prominent food"
}

If you detect a SINGLE food item, use this format:
{
  "multipleFood": false,
  "foodName": "specific food name",
  "confidence": 0.95,
  "nutrition": {
    "calories": 150,
    "protein": 5.2,
    "carbohydrates": 30.1,
    "fat": 2.8,
    "fiber": 4.5,
    "sugar": 12.3,
    "sodium": 45,
    "servingSize": "1 medium apple (182g)",
    "servingWeight": 182
  },
  "alternativeNames": ["alternative name 1", "alternative name 2"],
  "category": "fruit/vegetable/protein/grain/dairy/snack",
  "brand": "brand name if visible or null"
}

Rules:
- Detect ALL distinct food items visible in the image
- For multiple foods, provide nutrition for each item's visible portion
- Use realistic nutritional values based on USDA data
- Confidence should be 0.7-0.95 for clear foods, 0.3-0.6 for unclear
- Include fiber, sugar, sodium when relevant
- Estimate serving size based on visual portion for each food
- If unclear/no food visible, set confidence below 0.3
- Consider items like fruits, vegetables, proteins, grains as separate foods`;
  }

  async recognizeFood(imageUri: string): Promise<GeminiResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Gemini API key not configured'
      };
    }

    try {
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: this.createPrompt()
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
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

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        return {
          success: false,
          error: `API request failed: ${response.status}`
        };
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        return {
          success: false,
          error: 'Invalid response from Gemini API'
        };
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      
      try {
        // Clean the response to extract JSON
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);

        // Check if it's a multiple food response
        if (parsedResponse.multipleFood === true && parsedResponse.foods && Array.isArray(parsedResponse.foods)) {
          // Handle multiple foods - return the main food as primary result
          const mainFoodName = parsedResponse.mainFood || parsedResponse.foods[0]?.foodName;
          const mainFood = parsedResponse.foods.find((food: any) => food.foodName === mainFoodName) || parsedResponse.foods[0];

          if (!mainFood || !mainFood.foodName || typeof mainFood.confidence !== 'number' || !mainFood.nutrition) {
            throw new Error('Invalid multiple food response structure');
          }

          const multipleResult: MultipleFoodResult = {
            foods: parsedResponse.foods,
            mainFood: mainFood,
            totalConfidence: Math.min(0.95, parsedResponse.foods.reduce((avg: number, food: any) => avg + food.confidence, 0) / parsedResponse.foods.length)
          };

          return {
            success: true,
            result: mainFood, // Primary result for backward compatibility
            multipleResult: multipleResult
          };
        } else {
          // Handle single food response
          const result: FoodRecognitionResult = parsedResponse;

          // Validate the response structure
          if (!result.foodName || typeof result.confidence !== 'number' || !result.nutrition) {
            throw new Error('Invalid single food response structure');
          }

          return {
            success: true,
            result
          };
        }
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.error('Raw response:', textResponse);
        return {
          success: false,
          error: 'Failed to parse food recognition result'
        };
      }
    } catch (error) {
      console.error('Error in food recognition:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Fallback method for offline or API failure scenarios
  getFallbackNutrition(estimatedFood: string): FoodRecognitionResult {
    const fallbackData: { [key: string]: FoodRecognitionResult } = {
      'apple': {
        foodName: 'Apple',
        confidence: 0.5,
        nutrition: {
          calories: 95,
          protein: 0.5,
          carbohydrates: 25,
          fat: 0.3,
          fiber: 4,
          sugar: 19,
          sodium: 2,
          servingSize: '1 medium apple (182g)',
          servingWeight: 182
        },
        category: 'fruit'
      },
      'banana': {
        foodName: 'Banana',
        confidence: 0.5,
        nutrition: {
          calories: 105,
          protein: 1.3,
          carbohydrates: 27,
          fat: 0.4,
          fiber: 3,
          sugar: 14,
          sodium: 1,
          servingSize: '1 medium banana (118g)',
          servingWeight: 118
        },
        category: 'fruit'
      },
      'default': {
        foodName: 'Unknown Food',
        confidence: 0.2,
        nutrition: {
          calories: 100,
          protein: 2,
          carbohydrates: 15,
          fat: 3,
          servingSize: '1 serving (100g)',
          servingWeight: 100
        },
        category: 'unknown'
      }
    };

    return fallbackData[estimatedFood.toLowerCase()] || fallbackData['default'];
  }
}

export const geminiService = new GeminiService();
