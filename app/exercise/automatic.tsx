import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface WorkoutSession {
  id: string;
  exerciseType: string;
  duration: number;
  caloriesBurned: number;
  heartRate?: number;
  startTime: Date;
  isActive: boolean;
}

interface ExerciseType {
  id: string;
  name: string;
  icon: string;
  caloriesPerMinute: number;
  color: string;
}

export default function AutomaticTrackingScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const [heartRate, setHeartRate] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);

  const exerciseTypes: ExerciseType[] = [
    { id: '1', name: 'Running', icon: '🏃‍♂️', caloriesPerMinute: 12, color: '#FF5722' },
    { id: '2', name: 'Walking', icon: '🚶‍♂️', caloriesPerMinute: 5, color: '#4CAF50' },
    { id: '3', name: 'Cycling', icon: '🚴‍♂️', caloriesPerMinute: 10, color: '#2196F3' },
    { id: '4', name: 'Swimming', icon: '🏊‍♂️', caloriesPerMinute: 14, color: '#00BCD4' },
    { id: '5', name: 'Strength', icon: '💪', caloriesPerMinute: 6, color: '#9C27B0' },
    { id: '6', name: 'Yoga', icon: '🧘‍♀️', caloriesPerMinute: 4, color: '#FF9800' },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        if (selectedExercise) {
          setCaloriesBurned(prev => prev + (selectedExercise.caloriesPerMinute / 60));
        }
        // Simulate heart rate (in real app, this would come from device sensors)
        setHeartRate(Math.floor(Math.random() * (180 - 120) + 120));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused, selectedExercise]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedExercise) {
      Alert.alert('Select Exercise', 'Please select an exercise type before starting.');
      return;
    }
    setIsTracking(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Workout', 
          style: 'destructive',
          onPress: () => {
            setIsTracking(false);
            setIsPaused(false);
            // Show workout summary
            showWorkoutSummary();
          }
        }
      ]
    );
  };

  const showWorkoutSummary = () => {
    Alert.alert(
      'Workout Complete!',
      `Exercise: ${selectedExercise?.name}\nDuration: ${formatTime(duration)}\nCalories: ${Math.round(caloriesBurned)} cal`,
      [
        { text: 'Save Workout', onPress: saveWorkout },
        { text: 'Discard', style: 'cancel', onPress: resetWorkout }
      ]
    );
  };

  const saveWorkout = () => {
    // In a real app, this would save to database
    console.log('Workout saved');
    resetWorkout();
    router.back();
  };

  const resetWorkout = () => {
    setDuration(0);
    setCaloriesBurned(0);
    setHeartRate(0);
    setSelectedExercise(null);
  };

  const renderExerciseTypeCard = (exercise: ExerciseType) => (
    <TouchableOpacity
      key={exercise.id}
      style={[
        styles.exerciseTypeCard,
        selectedExercise?.id === exercise.id && styles.selectedExerciseTypeCard
      ]}
      onPress={() => !isTracking && setSelectedExercise(exercise)}
      disabled={isTracking}
    >
      <View style={[styles.exerciseTypeIcon, { backgroundColor: exercise.color }]}>
        <Text style={styles.exerciseTypeEmoji}>{exercise.icon}</Text>
      </View>
      <Text style={[
        styles.exerciseTypeName,
        selectedExercise?.id === exercise.id && styles.selectedExerciseTypeName
      ]}>
        {exercise.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AUTOMATIC TRACKING</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Type Selection */}
        {!isTracking && (
          <View style={styles.exerciseSelectionContainer}>
            <Text style={styles.sectionTitle}>SELECT EXERCISE TYPE</Text>
            <View style={styles.exerciseTypesGrid}>
              {exerciseTypes.map(renderExerciseTypeCard)}
            </View>
          </View>
        )}

        {/* Workout Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.mainMetricCard}>
            <Text style={styles.mainMetricLabel}>DURATION</Text>
            <Text style={styles.mainMetricValue}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.secondaryMetricsRow}>
            <View style={styles.secondaryMetricCard}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF5722" />
              <Text style={styles.secondaryMetricValue}>{Math.round(caloriesBurned)}</Text>
              <Text style={styles.secondaryMetricLabel}>Calories</Text>
            </View>
            
            <View style={styles.secondaryMetricCard}>
              <MaterialIcons name="favorite" size={24} color="#E91E63" />
              <Text style={styles.secondaryMetricValue}>{heartRate || '--'}</Text>
              <Text style={styles.secondaryMetricLabel}>BPM</Text>
            </View>
          </View>
        </View>

        {/* Current Exercise Display */}
        {selectedExercise && (
          <View style={styles.currentExerciseCard}>
            <View style={styles.currentExerciseHeader}>
              <Text style={styles.currentExerciseLabel}>CURRENT EXERCISE</Text>
              {isTracking && (
                <View style={[styles.statusIndicator, isPaused ? styles.pausedIndicator : styles.activeIndicator]}>
                  <Text style={styles.statusText}>{isPaused ? 'PAUSED' : 'ACTIVE'}</Text>
                </View>
              )}
            </View>
            <View style={styles.currentExerciseContent}>
              <View style={[styles.currentExerciseIcon, { backgroundColor: selectedExercise.color }]}>
                <Text style={styles.currentExerciseEmoji}>{selectedExercise.icon}</Text>
              </View>
              <Text style={styles.currentExerciseName}>{selectedExercise.name}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!isTracking ? (
          <TouchableOpacity 
            style={[styles.startButton, !selectedExercise && styles.disabledButton]} 
            onPress={handleStart}
            disabled={!selectedExercise}
          >
            <MaterialIcons name="play-arrow" size={32} color="white" />
            <Text style={styles.startButtonText}>START WORKOUT</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.trackingControls}>
            <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
              <MaterialIcons name={isPaused ? "play-arrow" : "pause"} size={28} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <MaterialIcons name="stop" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  exerciseSelectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  exerciseTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  exerciseTypeCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedExerciseTypeCard: {
    backgroundColor: '#F0F8F0',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  exerciseTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exerciseTypeEmoji: {
    fontSize: 24,
  },
  exerciseTypeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  selectedExerciseTypeName: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  metricsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  mainMetricCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mainMetricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainMetricValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'monospace',
  },
  secondaryMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryMetricCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryMetricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 4,
  },
  secondaryMetricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  currentExerciseCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  currentExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentExerciseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeIndicator: {
    backgroundColor: '#4CAF50',
  },
  pausedIndicator: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  currentExerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentExerciseIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  currentExerciseEmoji: {
    fontSize: 28,
  },
  currentExerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 1,
  },
  trackingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButton: {
    backgroundColor: '#F44336',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
