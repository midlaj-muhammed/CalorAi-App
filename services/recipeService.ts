import { Recipe, RecipeNutrition, Ingredient } from '../contexts/RecipeContext';

interface RecipeGenerationParams {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  dietaryPreferences?: string[];
  calorieTarget?: number;
  availableIngredients?: string[];
  cuisine?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  prepTimeLimit?: number;
  customPrompt?: string;
}

interface GeminiRecipeResponse {
  success: boolean;
  recipe?: Recipe;
  error?: string;
}

class RecipeService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    // Get API key from environment or fallback
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyC4jDUKVWZsoR9NdN3qIXqPqAfLHbYX7G8';
  }

  private createRecipePrompt(params: RecipeGenerationParams): string {
    const {
      mealType,
      dietaryPreferences = [],
      calorieTarget,
      availableIngredients = [],
      cuisine,
      difficulty = 'Easy',
      prepTimeLimit = 30,
      customPrompt
    } = params;

    // If custom prompt is provided, use it as the base
    const basePrompt = customPrompt
      ? `Generate a detailed recipe for: ${customPrompt}. Make it suitable for ${mealType}.`
      : `Generate a detailed ${mealType} recipe with the following requirements:`;

    return `${basePrompt}

REQUIREMENTS:
- Meal Type: ${mealType}
- Difficulty: ${difficulty}
- Maximum prep time: ${prepTimeLimit} minutes
${calorieTarget ? `- Target calories: ${calorieTarget}` : ''}
${cuisine ? `- Cuisine: ${cuisine}` : ''}
${dietaryPreferences.length > 0 ? `- Dietary preferences: ${dietaryPreferences.join(', ')}` : ''}
${availableIngredients.length > 0 ? `- Try to use these ingredients: ${availableIngredients.join(', ')}` : ''}

IMPORTANT: Respond ONLY with valid JSON in this exact format. Use decimal numbers (0.5, 0.25, 0.33) instead of fractions:
{
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4,
  "difficulty": "Easy",
  "mealType": "${mealType}",
  "cuisine": "Italian",
  "dietaryTags": ["vegetarian", "gluten-free"],
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": 2.5,
      "unit": "cups",
      "notes": "optional notes"
    }
  ],
  "instructions": [
    "Step 1: Detailed instruction",
    "Step 2: Another detailed instruction"
  ],
  "nutrition": {
    "calories": 350,
    "protein": 15.5,
    "carbohydrates": 45.2,
    "fat": 12.8,
    "fiber": 6.2,
    "sugar": 8.5,
    "sodium": 420
  }
}

GUIDELINES:
- Create realistic, achievable recipes
- Include accurate nutritional information
- Provide clear, step-by-step instructions
- Use common, accessible ingredients
- Ensure proper portion sizes
- Include helpful cooking tips in instructions
- Make sure nutrition values are realistic for the ingredients used
- Consider the meal type when designing the recipe (light for breakfast, hearty for dinner, etc.)`;
  }

  async generateRecipe(params: RecipeGenerationParams): Promise<GeminiRecipeResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Gemini API key not configured'
      };
    }

    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: this.createRecipePrompt(params)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
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
        // Clean the response to extract JSON - handle markdown code blocks
        let cleanedResponse = textResponse;

        // Remove markdown code block markers
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
        cleanedResponse = cleanedResponse.replace(/```\s*/g, '');
        cleanedResponse = cleanedResponse.trim();

        // Fix common JSON issues - replace ALL fractions with decimals using comprehensive regex
        const fractionMap: { [key: string]: string } = {
          '1/2': '0.5',
          '1/3': '0.33',
          '1/4': '0.25',
          '3/4': '0.75',
          '2/3': '0.67',
          '1/8': '0.125',
          '3/8': '0.375',
          '5/8': '0.625',
          '7/8': '0.875',
          '1/6': '0.17',
          '5/6': '0.83',
          '1/5': '0.2',
          '2/5': '0.4',
          '3/5': '0.6',
          '4/5': '0.8'
        };

        // Replace fractions in all contexts (after colons, in amount fields, etc.)
        Object.entries(fractionMap).forEach(([fraction, decimal]) => {
          const escapedFraction = fraction.replace('/', '\\/');
          // Replace in all contexts where fractions might appear
          cleanedResponse = cleanedResponse.replace(new RegExp(`:\\s*${escapedFraction}`, 'g'), `: ${decimal}`);
          cleanedResponse = cleanedResponse.replace(new RegExp(`"amount":\\s*${escapedFraction}`, 'g'), `"amount": ${decimal}`);
          cleanedResponse = cleanedResponse.replace(new RegExp(`${escapedFraction}\\s*,`, 'g'), `${decimal},`);
          cleanedResponse = cleanedResponse.replace(new RegExp(`${escapedFraction}\\s*}`, 'g'), `${decimal}}`);
        });

        // Extract JSON object
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const parsedRecipe = JSON.parse(jsonMatch[0]);
        
        // Validate the response structure
        if (!parsedRecipe.title || !parsedRecipe.ingredients || !parsedRecipe.instructions) {
          throw new Error('Invalid recipe structure');
        }

        // Transform to our Recipe interface
        const recipe: Recipe = {
          id: Date.now().toString(),
          title: parsedRecipe.title,
          description: parsedRecipe.description || '',
          prepTime: parsedRecipe.prepTime || 15,
          cookTime: parsedRecipe.cookTime || 20,
          servings: parsedRecipe.servings || 4,
          difficulty: parsedRecipe.difficulty || 'Easy',
          mealType: params.mealType,
          cuisine: parsedRecipe.cuisine || 'International',
          dietaryTags: parsedRecipe.dietaryTags || [],
          ingredients: parsedRecipe.ingredients.map((ing: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            notes: ing.notes
          })),
          instructions: parsedRecipe.instructions,
          nutrition: {
            calories: parsedRecipe.nutrition?.calories || 300,
            protein: parsedRecipe.nutrition?.protein || 15,
            carbohydrates: parsedRecipe.nutrition?.carbohydrates || 30,
            fat: parsedRecipe.nutrition?.fat || 10,
            fiber: parsedRecipe.nutrition?.fiber || 5,
            sugar: parsedRecipe.nutrition?.sugar || 8,
            sodium: parsedRecipe.nutrition?.sodium || 400,
          },
          isFavorite: false,
          createdAt: new Date(),
          source: 'generated'
        };

        return {
          success: true,
          recipe
        };
      } catch (parseError) {
        console.error('Error parsing recipe response:', parseError);
        console.error('Raw response:', textResponse);
        return {
          success: false,
          error: 'Failed to parse recipe data'
        };
      }
    } catch (error) {
      console.error('Error in recipe generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get recipe suggestions based on meal type and preferences
  async getRecipeSuggestions(mealType: string, count: number = 3): Promise<Recipe[]> {
    const suggestions: Recipe[] = [];
    
    for (let i = 0; i < count; i++) {
      const response = await this.generateRecipe({
        mealType: mealType as any,
        difficulty: ['Easy', 'Medium'][Math.floor(Math.random() * 2)] as any,
        prepTimeLimit: 30
      });
      
      if (response.success && response.recipe) {
        suggestions.push(response.recipe);
      }
    }
    
    return suggestions;
  }

  // Generate recipe based on available ingredients
  async generateRecipeFromIngredients(
    ingredients: string[], 
    mealType: string
  ): Promise<GeminiRecipeResponse> {
    return this.generateRecipe({
      mealType: mealType as any,
      availableIngredients: ingredients,
      difficulty: 'Easy'
    });
  }
}

export const recipeService = new RecipeService();
