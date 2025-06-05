import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useRecipes } from '../../contexts/RecipeContext';
import { useNutrition } from '../../contexts/NutritionContext';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { recipes, toggleFavorite } = useRecipes();
  const { addMealEntry } = useNutrition();
  const [servings, setServings] = useState(1);

  const recipe = recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color="#E0E0E0" />
          <Text style={styles.errorTitle}>Recipe not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const adjustedNutrition = {
    calories: Math.round(recipe.nutrition.calories * servings),
    protein: Math.round(recipe.nutrition.protein * servings * 10) / 10,
    carbohydrates: Math.round(recipe.nutrition.carbohydrates * servings * 10) / 10,
    fat: Math.round(recipe.nutrition.fat * servings * 10) / 10,
    fiber: Math.round((recipe.nutrition.fiber || 0) * servings * 10) / 10,
    sugar: Math.round((recipe.nutrition.sugar || 0) * servings * 10) / 10,
    sodium: Math.round((recipe.nutrition.sodium || 0) * servings),
  };

  const handleAddToMeal = () => {
    Alert.alert(
      'Add to Meal Log',
      'Which meal would you like to add this recipe to?',
      [
        { text: 'Breakfast', onPress: () => addRecipeToMeal('breakfast') },
        { text: 'Lunch', onPress: () => addRecipeToMeal('lunch') },
        { text: 'Dinner', onPress: () => addRecipeToMeal('dinner') },
        { text: 'Snacks', onPress: () => addRecipeToMeal('snacks') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const addRecipeToMeal = async (mealType: string) => {
    try {
      await addMealEntry({
        id: `recipe-${recipe.id}-${Date.now()}`,
        userId: 'current-user', // This should be from auth context
        foodItem: {
          id: recipe.id,
          name: recipe.title,
          brand: 'Recipe',
          servingSize: `${servings} serving${servings > 1 ? 's' : ''}`,
          servingUnit: 'serving',
          macros: {
            calories: adjustedNutrition.calories,
            carbs: adjustedNutrition.carbohydrates,
            protein: adjustedNutrition.protein,
            fat: adjustedNutrition.fat,
            fiber: adjustedNutrition.fiber,
            sugar: adjustedNutrition.sugar,
            sodium: adjustedNutrition.sodium,
          },
          category: 'Recipe',
          verified: true,
        },
        quantity: 1, // Since we already adjusted nutrition for servings
        mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snacks',
        loggedAt: new Date(),
        notes: `Recipe: ${recipe.title}`,
      });

      Alert.alert(
        'Added to Meal Log',
        `"${recipe.title}" has been added to your ${mealType} log.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error adding recipe to meal log:', error);
      Alert.alert('Error', 'Failed to add recipe to meal log.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#8BC34A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backIcon}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.favoriteIcon}
              onPress={() => toggleFavorite(recipe.id)}
            >
              <MaterialIcons
                name={recipe.isFavorite ? 'favorite' : 'favorite-border'}
                size={24}
                color={recipe.isFavorite ? '#FF6B6B' : 'white'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recipe Image */}
        <View style={styles.imageContainer}>
          {(recipe as any).imageUrl ? (
            <Image
              source={{ uri: (recipe as any).imageUrl }}
              style={styles.recipeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.recipeEmoji}>
                {recipe.mealType === 'breakfast' ? '🍳' :
                 recipe.mealType === 'lunch' ? '🥗' :
                 recipe.mealType === 'dinner' ? '🍽️' : '🍌'}
              </Text>
            </View>
          )}
        </View>

        {/* Recipe Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description}>{recipe.description}</Text>
          
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={20} color="#4CAF50" />
              <Text style={styles.metaText}>
                {recipe.prepTime + recipe.cookTime} min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="restaurant" size={20} color="#4CAF50" />
              <Text style={styles.metaText}>
                {recipe.servings} servings
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="star" size={20} color="#4CAF50" />
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
            </View>
          </View>

          <View style={styles.tags}>
            <View style={styles.cuisineTag}>
              <Text style={styles.cuisineText}>{recipe.cuisine}</Text>
            </View>
            {recipe.dietaryTags.map((tag, index) => (
              <View key={index} style={styles.dietaryTag}>
                <Text style={styles.dietaryText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Servings Adjuster */}
        <View style={styles.servingsSection}>
          <Text style={styles.sectionTitle}>Servings</Text>
          <View style={styles.servingsControls}>
            <TouchableOpacity
              style={styles.servingButton}
              onPress={() => setServings(Math.max(1, servings - 1))}
            >
              <MaterialIcons name="remove" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={styles.servingsText}>{servings}</Text>
            <TouchableOpacity
              style={styles.servingButton}
              onPress={() => setServings(servings + 1)}
            >
              <MaterialIcons name="add" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nutrition Info */}
        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{adjustedNutrition.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{adjustedNutrition.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{adjustedNutrition.carbohydrates}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{adjustedNutrition.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={ingredient.id} style={styles.ingredientItem}>
              <View style={styles.ingredientBullet} />
              <Text style={styles.ingredientText}>
                {ingredient.amount * servings} {ingredient.unit} {ingredient.name}
                {ingredient.notes && (
                  <Text style={styles.ingredientNotes}> ({ingredient.notes})</Text>
                )}
              </Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add to Meal Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addToMealButton}
          onPress={handleAddToMeal}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.addToMealText}>Add to Meal Log</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backIcon: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  favoriteIcon: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  recipeImage: {
    height: 200,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeEmoji: {
    fontSize: 64,
  },
  infoSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cuisineTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cuisineText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  dietaryTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dietaryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  servingsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  servingsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  servingButton: {
    backgroundColor: '#F1F8E9',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  servingsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    minWidth: 40,
    textAlign: 'center',
  },
  nutritionSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  ingredientsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginTop: 8,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  ingredientNotes: {
    color: '#666',
    fontStyle: 'italic',
  },
  instructionsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  addToMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addToMealText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
