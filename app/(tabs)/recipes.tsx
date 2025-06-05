import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useRecipes } from '../../contexts/RecipeContext';
import { recipeService } from '../../services/recipeService';

const { width } = Dimensions.get('window');

// Predefined recipes with placeholder images matching the UI design
const predefinedRecipes = {
  breakfast: [
    {
      id: 'wildberry-crepes',
      title: 'Wildberry Crepes',
      calories: 270,
      imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop',
      description: 'Light and fluffy crepes with fresh wildberries',
      mealType: 'breakfast',
      cuisine: 'French',
      prepTime: 20,
      cookTime: 15,
      servings: 3,
      difficulty: 'Medium',
      isFavorite: false,
      nutrition: { calories: 270, protein: 8, carbohydrates: 35, fat: 12 },
      ingredients: [
        { id: '1', name: 'All-purpose flour', amount: 1, unit: 'cup', notes: '' },
        { id: '2', name: 'Milk', amount: 1.25, unit: 'cups', notes: '' },
        { id: '3', name: 'Eggs', amount: 2, unit: 'large', notes: '' },
        { id: '4', name: 'Sugar', amount: 2, unit: 'tablespoons', notes: '' },
        { id: '5', name: 'Mixed berries', amount: 1, unit: 'cup', notes: 'fresh or frozen' },
        { id: '6', name: 'Butter', amount: 2, unit: 'tablespoons', notes: 'melted' }
      ],
      instructions: [
        'Whisk together flour, milk, eggs, and sugar until smooth.',
        'Heat a non-stick pan over medium heat and add a little butter.',
        'Pour 1/4 cup of batter into the pan and swirl to coat.',
        'Cook for 2-3 minutes until edges are golden, then flip.',
        'Cook for another 1-2 minutes until golden brown.',
        'Serve with fresh wildberries and a dusting of powdered sugar.'
      ],
      dietaryTags: ['vegetarian']
    },
  ],
  lunch: [
    {
      id: 'quinoa-bowl',
      title: 'Mediterranean Quinoa Bowl',
      calories: 320,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      description: 'Healthy quinoa bowl with Mediterranean flavors',
      mealType: 'lunch',
      cuisine: 'Mediterranean',
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      difficulty: 'Easy',
      isFavorite: false,
      nutrition: { calories: 320, protein: 14, carbohydrates: 45, fat: 10 },
      ingredients: [
        { id: '1', name: 'Quinoa', amount: 1, unit: 'cup', notes: 'rinsed' },
        { id: '2', name: 'Cherry tomatoes', amount: 1, unit: 'cup', notes: 'halved' },
        { id: '3', name: 'Cucumber', amount: 1, unit: 'medium', notes: 'diced' },
        { id: '4', name: 'Red onion', amount: 0.25, unit: 'cup', notes: 'finely chopped' },
        { id: '5', name: 'Feta cheese', amount: 0.5, unit: 'cup', notes: 'crumbled' },
        { id: '6', name: 'Olive oil', amount: 3, unit: 'tablespoons', notes: 'extra virgin' },
        { id: '7', name: 'Lemon juice', amount: 2, unit: 'tablespoons', notes: 'fresh' }
      ],
      instructions: [
        'Cook quinoa according to package directions and let cool.',
        'Combine cherry tomatoes, cucumber, and red onion in a large bowl.',
        'Add cooled quinoa and mix gently.',
        'Whisk together olive oil and lemon juice.',
        'Pour dressing over quinoa mixture and toss.',
        'Top with crumbled feta cheese and serve.'
      ],
      dietaryTags: ['vegetarian', 'gluten-free']
    },
    {
      id: 'grilled-chicken-salad',
      title: 'Grilled Chicken Salad',
      calories: 285,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
      description: 'Fresh grilled chicken salad with mixed greens',
      mealType: 'lunch',
      cuisine: 'American',
      prepTime: 10,
      cookTime: 15,
      servings: 1,
      difficulty: 'Easy',
      isFavorite: false,
      nutrition: { calories: 285, protein: 28, carbohydrates: 12, fat: 15 },
      ingredients: [
        { id: '1', name: 'Chicken breast', amount: 6, unit: 'oz', notes: 'boneless, skinless' },
        { id: '2', name: 'Mixed greens', amount: 4, unit: 'cups', notes: 'fresh' },
        { id: '3', name: 'Cherry tomatoes', amount: 0.5, unit: 'cup', notes: 'halved' },
        { id: '4', name: 'Avocado', amount: 0.5, unit: 'medium', notes: 'sliced' },
        { id: '5', name: 'Olive oil', amount: 2, unit: 'tablespoons', notes: 'for dressing' },
        { id: '6', name: 'Balsamic vinegar', amount: 1, unit: 'tablespoon', notes: '' }
      ],
      instructions: [
        'Season chicken breast with salt and pepper.',
        'Grill chicken for 6-7 minutes per side until cooked through.',
        'Let chicken rest for 5 minutes, then slice.',
        'Arrange mixed greens on a plate.',
        'Top with cherry tomatoes and avocado slices.',
        'Add sliced chicken and drizzle with olive oil and balsamic vinegar.'
      ],
      dietaryTags: ['high-protein', 'low-carb']
    },
  ]
};

export default function RecipesScreen() {
  const {
    recipes,
    favoriteRecipes,
    isLoading,
    addRecipe,
    toggleFavorite,
  } = useRecipes();

  const params = useLocalSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get recipes from context (includes predefined and generated)
  const getRecipesByMealType = (mealType: string) => {
    return recipes.filter(recipe => recipe.mealType === mealType);
  };

  // Add predefined recipes to context on mount
  useEffect(() => {
    const addPredefinedRecipes = async () => {
      // Check if predefined recipes are already in context
      const existingIds = recipes.map(r => r.id);

      // Add predefined recipes if they don't exist
      for (const mealType of ['breakfast', 'lunch'] as const) {
        for (const recipe of predefinedRecipes[mealType]) {
          if (!existingIds.includes(recipe.id)) {
            await addRecipe({
              ...recipe,
              ingredients: recipe.ingredients || [],
              instructions: recipe.instructions || [],
              dietaryTags: recipe.dietaryTags || [],
              createdAt: new Date(),
              source: 'imported' as const,
            });
          }
        }
      }
    };

    addPredefinedRecipes();
  }, []);

  // Handle navigation from dashboard with meal type
  useEffect(() => {
    if (params.mealType) {
      // Auto-generate recipe for the requested meal type
      handleGenerateRecipe(params.mealType as string);
    }
  }, [params.mealType]);

  // Featured recipe categories for "What's Hot" section
  const featuredCategories = [
    {
      id: 'runners-diet',
      title: "Runner's diet",
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      gradient: ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)'],
    },
    {
      id: 'bbq-recipes',
      title: 'BBQ Recipes',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
      gradient: ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)'],
    },
  ];

  // Function to fetch recipe image from Unsplash
  const fetchRecipeImage = async (recipeName: string, cuisine?: string): Promise<string> => {
    try {
      const searchTerm = `${recipeName} ${cuisine || 'food'}`.replace(/\s+/g, '+');
      const unsplashUrl = `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&q=${searchTerm}`;

      // For demo purposes, return a food-related image
      const foodImages = [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
      ];

      return foodImages[Math.floor(Math.random() * foodImages.length)];
    } catch (error) {
      console.error('Error fetching recipe image:', error);
      return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';
    }
  };

  const handleGenerateRecipe = async (mealType?: string, customPrompt?: string) => {
    const targetMealType = mealType || 'lunch';

    setIsGenerating(true);
    try {
      // Generate recipe with custom prompt if provided
      const prompt = customPrompt || `Generate a healthy ${targetMealType} recipe`;

      const response = await recipeService.generateRecipe({
        mealType: targetMealType as any,
        difficulty: 'Easy',
        prepTimeLimit: 30,
        customPrompt: prompt,
      });

      if (response.success && response.recipe) {
        // Fetch a real image for the recipe
        const imageUrl = await fetchRecipeImage(response.recipe.title, response.recipe.cuisine);

        const recipeWithImage = {
          ...response.recipe,
          id: `generated-${Date.now()}`,
          imageUrl,
          isFavorite: false,
        };

        // Add to context for persistence and immediate display
        await addRecipe(recipeWithImage);

        Alert.alert(
          'Recipe Generated!',
          `"${response.recipe.title}" has been created with a fresh image!`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to generate recipe');
      }
    } catch (error) {
      console.error('Recipe generation error:', error);
      Alert.alert('Error', 'Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRecipeCard = (recipe: any, isLarge = false) => (
    <TouchableOpacity
      key={recipe.id}
      style={[styles.recipeCard, isLarge && styles.largeRecipeCard]}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    >
      <View style={[styles.recipeImageContainer, isLarge && styles.largeImageContainer]}>
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={styles.recipeImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.recipeImagePlaceholder}>
            <Text style={[styles.recipeEmoji, isLarge && styles.largeRecipeEmoji]}>
              🍽️
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(recipe.id)}
        >
          <MaterialIcons
            name={recipe.isFavorite ? 'favorite' : 'favorite-border'}
            size={16}
            color={recipe.isFavorite ? '#FF6B6B' : 'white'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.recipeInfo}>
        <Text style={[styles.recipeTitle, isLarge && styles.largeRecipeTitle]} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text style={styles.recipeCalories}>
          {recipe.calories || recipe.nutrition?.calories || 0} kcal
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Recipe Generation Input */}
        <View style={styles.generateSection}>
          <Text style={styles.generateTitle}>Generate Custom Recipe</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.recipeInput}
              placeholder="Describe the recipe you want (e.g., 'healthy pasta with vegetables', 'low-carb breakfast')"
              value={searchQuery}
              onChangeText={setSearchQuery}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.generateButton, !searchQuery.trim() && styles.generateButtonDisabled]}
              onPress={() => {
                if (searchQuery.trim()) {
                  handleGenerateRecipe('lunch', searchQuery);
                  setSearchQuery('');
                }
              }}
              disabled={!searchQuery.trim() || isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="auto-awesome" size={20} color="white" />
                  <Text style={styles.generateButtonText}>Generate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* What's Hot Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHAT'S HOT</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {featuredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.featuredCard}
                onPress={() => handleGenerateRecipe('lunch', category.title)}
              >
                <Image
                  source={{ uri: category.imageUrl }}
                  style={styles.featuredCardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={category.gradient}
                  style={styles.featuredCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <Text style={styles.featuredCardTitle}>{category.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Breakfast Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BREAKFAST</Text>
            <TouchableOpacity onPress={() => handleGenerateRecipe('breakfast')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {getRecipesByMealType('breakfast').map(recipe => renderRecipeCard(recipe))}
            <TouchableOpacity
              style={styles.generateRecipeCard}
              onPress={() => handleGenerateRecipe('breakfast')}
              disabled={isGenerating}
            >
              <View style={styles.generateRecipeContent}>
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : (
                  <MaterialIcons name="add" size={32} color="#4CAF50" />
                )}
                <Text style={styles.generateRecipeText}>
                  {isGenerating ? 'Generating...' : 'Generate Recipe'}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Lunch Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LUNCH</Text>
            <TouchableOpacity onPress={() => handleGenerateRecipe('lunch')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {getRecipesByMealType('lunch').map(recipe => renderRecipeCard(recipe))}
            <TouchableOpacity
              style={styles.generateRecipeCard}
              onPress={() => handleGenerateRecipe('lunch')}
              disabled={isGenerating}
            >
              <View style={styles.generateRecipeContent}>
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#4CAF50" />
                ) : (
                  <MaterialIcons name="add" size={32} color="#4CAF50" />
                )}
                <Text style={styles.generateRecipeText}>
                  {isGenerating ? 'Generating...' : 'Generate Recipe'}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  generateSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  generateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  recipeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: 'white',
    minHeight: 80,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    backgroundColor: '#A5A5A5',
    shadowColor: '#A5A5A5',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  horizontalScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  featuredCard: {
    width: 350,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  featuredCardTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recipeCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  largeRecipeCard: {
    width: 200,
  },
  recipeImageContainer: {
    height: 120,
    position: 'relative',
  },
  largeImageContainer: {
    height: 140,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeEmoji: {
    fontSize: 40,
  },
  largeRecipeEmoji: {
    fontSize: 48,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 18,
  },
  largeRecipeTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  recipeCalories: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  generateRecipeCard: {
    width: 160,
    height: 160,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  generateRecipeContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateRecipeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 100,
  },
});
