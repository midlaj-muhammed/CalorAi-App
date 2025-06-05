import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNutrition } from '../../contexts/NutritionContext';

export const ExerciseCard: React.FC = () => {
  const { state } = useNutrition();
  const { dashboardData } = state;

  if (state.isLoading || !dashboardData) {
    return (
      <TouchableOpacity style={styles.container} onPress={() => router.push('/exercise')}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🏃‍♀️</Text>
          <View style={styles.info}>
            <Text style={styles.name}>Exercise</Text>
            <Text style={styles.subtitle}>Loading...</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <MaterialIcons name="add" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  const { exercises } = dashboardData;
  const totalCaloriesBurned = exercises.reduce((sum, exercise) => sum + exercise.caloriesBurned, 0);
  const totalWorkouts = exercises.length;
  const totalDuration = exercises.reduce((sum, exercise) => sum + exercise.duration, 0);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getRecommendation = () => {
    if (totalWorkouts === 0) {
      return 'Start your fitness journey today!';
    }
    if (totalWorkouts === 1) {
      return 'Great start! Keep the momentum going.';
    }
    if (totalCaloriesBurned >= 300) {
      return 'Amazing workout day! 🔥';
    }
    if (totalCaloriesBurned >= 150) {
      return 'Good progress today! 💪';
    }
    return 'Every step counts! Keep moving.';
  };

  const getLatestExercise = () => {
    if (exercises.length === 0) return null;
    return exercises[exercises.length - 1];
  };

  const latestExercise = getLatestExercise();

  return (
    <TouchableOpacity style={styles.container} onPress={() => router.push('/exercise')}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🏃‍♀️</Text>
        <View style={styles.info}>
          <Text style={styles.name}>Exercise</Text>
          <Text style={styles.subtitle}>{getRecommendation()}</Text>
          
          {totalWorkouts > 0 ? (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="local-fire-department" size={14} color="#FF5722" />
                <Text style={styles.statText}>{Math.round(totalCaloriesBurned)} cal</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="fitness-center" size={14} color="#4CAF50" />
                <Text style={styles.statText}>{totalWorkouts} workout{totalWorkouts > 1 ? 's' : ''}</Text>
              </View>
              {totalDuration > 0 && (
                <View style={styles.statItem}>
                  <MaterialIcons name="schedule" size={14} color="#2196F3" />
                  <Text style={styles.statText}>{formatDuration(totalDuration)}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No workouts today</Text>
              <Text style={styles.emptySubtext}>Tap to start exercising</Text>
            </View>
          )}

          {latestExercise && (
            <View style={styles.latestExercise}>
              <Text style={styles.latestExerciseText}>
                Latest: {latestExercise.exerciseName} • {Math.round(latestExercise.caloriesBurned)} cal
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push('/exercise');
          }}
        >
          <MaterialIcons name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Progress Indicators */}
      {totalWorkouts > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((totalCaloriesBurned / 300) * 100, 100)}%`,
                    backgroundColor: '#FF5722',
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressLabel}>Calories (300 goal)</Text>
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((totalDuration / 1800) * 100, 100)}%`, // 30 minutes goal
                    backgroundColor: '#2196F3',
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressLabel}>Duration (30m goal)</Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push('/exercise/automatic');
          }}
        >
          <MaterialIcons name="play-circle-filled" size={16} color="#4CAF50" />
          <Text style={styles.quickActionText}>Quick Start</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push('/exercise');
          }}
        >
          <MaterialIcons name="list" size={16} color="#666" />
          <Text style={styles.quickActionText}>Browse</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  emoji: {
    fontSize: 32,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#CCC',
  },
  latestExercise: {
    backgroundColor: '#F0F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  latestExerciseText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 10,
    color: '#999',
    minWidth: 80,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});
