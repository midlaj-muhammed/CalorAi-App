import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image?: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  cuisine: string;
  dietaryTags: string[]; // e.g., ['vegetarian', 'gluten-free', 'low-carb']
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: RecipeNutrition;
  rating?: number;
  isFavorite: boolean;
  createdAt: Date;
  source: 'generated' | 'user' | 'imported';
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface RecipeFilters {
  mealType?: string;
  cuisine?: string;
  dietaryTags?: string[];
  maxPrepTime?: number;
  difficulty?: string;
  favorites?: boolean;
}

interface RecipeContextType {
  recipes: Recipe[];
  favoriteRecipes: Recipe[];
  isLoading: boolean;
  searchQuery: string;
  filters: RecipeFilters;
  
  // Actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  searchRecipes: (query: string) => void;
  setFilters: (filters: RecipeFilters) => void;
  getFilteredRecipes: () => Recipe[];
  generateRecipe: (mealType: string, preferences?: any) => Promise<Recipe | null>;
  clearSearch: () => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({});

  // Load recipes from storage on mount
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      const storedRecipes = await AsyncStorage.getItem('recipes');
      if (storedRecipes) {
        const parsedRecipes = JSON.parse(storedRecipes).map((recipe: any) => ({
          ...recipe,
          createdAt: new Date(recipe.createdAt),
        }));
        setRecipes(parsedRecipes);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipes = async (updatedRecipes: Recipe[]) => {
    try {
      await AsyncStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error('Error saving recipes:', error);
    }
  };

  const addRecipe = async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    const newRecipe: Recipe = {
      ...recipeData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    const updatedRecipes = [newRecipe, ...recipes];
    setRecipes(updatedRecipes);
    await saveRecipes(updatedRecipes);
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    const updatedRecipes = recipes.map(recipe =>
      recipe.id === id ? { ...recipe, ...updates } : recipe
    );
    setRecipes(updatedRecipes);
    await saveRecipes(updatedRecipes);
  };

  const deleteRecipe = async (id: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(updatedRecipes);
    await saveRecipes(updatedRecipes);
  };

  const toggleFavorite = async (id: string) => {
    const updatedRecipes = recipes.map(recipe =>
      recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
    );
    setRecipes(updatedRecipes);
    await saveRecipes(updatedRecipes);
  };

  const searchRecipes = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilters({});
  };

  const getFilteredRecipes = (): Recipe[] => {
    let filteredRecipes = [...recipes];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        recipe.cuisine.toLowerCase().includes(query) ||
        recipe.ingredients.some(ingredient => 
          ingredient.name.toLowerCase().includes(query)
        ) ||
        recipe.dietaryTags.some(tag => 
          tag.toLowerCase().includes(query)
        )
      );
    }

    // Apply filters
    if (filters.mealType) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.mealType === filters.mealType
      );
    }

    if (filters.cuisine) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.cuisine === filters.cuisine
      );
    }

    if (filters.dietaryTags && filters.dietaryTags.length > 0) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.dietaryTags!.some(tag => recipe.dietaryTags.includes(tag))
      );
    }

    if (filters.maxPrepTime) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.prepTime <= filters.maxPrepTime!
      );
    }

    if (filters.difficulty) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.difficulty === filters.difficulty
      );
    }

    if (filters.favorites) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.isFavorite);
    }

    return filteredRecipes;
  };

  const favoriteRecipes = recipes.filter(recipe => recipe.isFavorite);

  const generateRecipe = async (mealType: string, preferences?: any): Promise<Recipe | null> => {
    try {
      const { recipeService } = await import('../services/recipeService');

      const response = await recipeService.generateRecipe({
        mealType: mealType as any,
        dietaryPreferences: preferences?.dietaryPreferences,
        calorieTarget: preferences?.calorieTarget,
        availableIngredients: preferences?.availableIngredients,
        cuisine: preferences?.cuisine,
        difficulty: preferences?.difficulty || 'Easy',
        prepTimeLimit: preferences?.prepTimeLimit || 30,
      });

      if (response.success && response.recipe) {
        return response.recipe;
      }

      return null;
    } catch (error) {
      console.error('Error generating recipe:', error);
      return null;
    }
  };

  const value: RecipeContextType = {
    recipes,
    favoriteRecipes,
    isLoading,
    searchQuery,
    filters,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    searchRecipes,
    setFilters,
    getFilteredRecipes,
    generateRecipe,
    clearSearch,
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
}
