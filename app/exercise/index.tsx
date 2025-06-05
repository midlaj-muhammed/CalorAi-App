import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Exercise {
  id: string;
  name: string;
  category: string;
  duration: number;
  caloriesPerMinute: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: string;
}

interface ExerciseCategory {
  id: string;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

export default function ExerciseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: ExerciseCategory[] = [
    { id: 'all', name: 'All', icon: 'fitness-center', color: '#4CAF50' },
    { id: 'cardio', name: 'Cardio', icon: 'directions-run', color: '#FF5722' },
    { id: 'strength', name: 'Strength', icon: 'fitness-center', color: '#3F51B5' },
    { id: 'flexibility', name: 'Flexibility', icon: 'self-improvement', color: '#9C27B0' },
    { id: 'sports', name: 'Sports', icon: 'sports-soccer', color: '#FF9800' },
  ];

  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Push-ups',
      category: 'strength',
      duration: 15,
      caloriesPerMinute: 8,
      difficulty: 'Medium',
      icon: '💪',
    },
    {
      id: '2',
      name: 'Squats',
      category: 'strength',
      duration: 12,
      caloriesPerMinute: 7,
      difficulty: 'Easy',
      icon: '🦵',
    },
    {
      id: '3',
      name: 'Plank',
      category: 'strength',
      duration: 10,
      caloriesPerMinute: 5,
      difficulty: 'Medium',
      icon: '🏋️‍♀️',
    },
    {
      id: '4',
      name: 'Jumping Jacks',
      category: 'cardio',
      duration: 8,
      caloriesPerMinute: 10,
      difficulty: 'Easy',
      icon: '🤸‍♂️',
    },
    {
      id: '5',
      name: 'Burpees',
      category: 'cardio',
      duration: 10,
      caloriesPerMinute: 12,
      difficulty: 'Hard',
      icon: '🔥',
    },
    {
      id: '6',
      name: 'Mountain Climbers',
      category: 'cardio',
      duration: 8,
      caloriesPerMinute: 11,
      difficulty: 'Medium',
      icon: '⛰️',
    },
    {
      id: '7',
      name: 'Lunges',
      category: 'strength',
      duration: 12,
      caloriesPerMinute: 6,
      difficulty: 'Medium',
      icon: '🚶‍♀️',
    },
    {
      id: '8',
      name: 'Yoga Flow',
      category: 'flexibility',
      duration: 20,
      caloriesPerMinute: 4,
      difficulty: 'Easy',
      icon: '🧘‍♀️',
    },
    {
      id: '9',
      name: 'High Knees',
      category: 'cardio',
      duration: 5,
      caloriesPerMinute: 9,
      difficulty: 'Easy',
      icon: '🏃‍♀️',
    },
    {
      id: '10',
      name: 'Tricep Dips',
      category: 'strength',
      duration: 8,
      caloriesPerMinute: 6,
      difficulty: 'Medium',
      icon: '💺',
    },
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#666';
    }
  };

  const renderExerciseCard = (exercise: Exercise) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.exerciseCard}
      onPress={() => router.push(`/exercise/${exercise.id}`)}
    >
      <View style={styles.exerciseContent}>
        <View style={styles.exerciseImageContainer}>
          <View style={styles.exerciseImageCircle}>
            <Text style={styles.exerciseEmoji}>{exercise.icon}</Text>
          </View>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.exerciseMetrics}>
            <View style={styles.metricItem}>
              <MaterialIcons name="schedule" size={14} color="#666" />
              <Text style={styles.metricText}>{exercise.duration} min</Text>
            </View>
            <View style={styles.metricItem}>
              <MaterialIcons name="local-fire-department" size={14} color="#666" />
              <Text style={styles.metricText}>{exercise.caloriesPerMinute * exercise.duration} cal</Text>
            </View>
          </View>
          <View style={styles.difficultyContainer}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty) }]}>
              <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
            </View>
          </View>
          <Text style={styles.exercisePreview}>
            Tap to view detailed instructions and start guided workout
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push({
              pathname: '/exercise/workout/[id]',
              params: { id: exercise.id, difficulty: 'Beginner' }
            });
          }}
        >
          <MaterialIcons name="play-arrow" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EXERCISE</Text>
        <TouchableOpacity 
          style={styles.automaticButton}
          onPress={() => router.push('/exercise/automatic')}
        >
          <MaterialIcons name="play-circle-filled" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>CATEGORIES</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.selectedCategoryCard
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <MaterialIcons name={category.icon} size={24} color="white" />
                </View>
                <Text style={[
                  styles.categoryName,
                  selectedCategory === category.id && styles.selectedCategoryName
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'ALL EXERCISES' : categories.find(c => c.id === selectedCategory)?.name.toUpperCase()}
          </Text>
          {filteredExercises.map(renderExerciseCard)}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
  automaticButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minWidth: 80,
  },
  selectedCategoryCard: {
    backgroundColor: '#F0F8F0',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedCategoryName: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  exercisesContainer: {
    marginBottom: 100,
  },
  exerciseCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  exerciseImageContainer: {
    marginRight: 16,
  },
  exerciseImageCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exerciseEmoji: {
    fontSize: 28,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  exerciseMetrics: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metricText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  difficultyContainer: {
    flexDirection: 'row',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  exercisePreview: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
  },
  addButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
