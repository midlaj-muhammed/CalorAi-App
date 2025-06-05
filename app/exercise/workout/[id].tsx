import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Vibration,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

interface WorkoutSet {
  setNumber: number;
  reps: string;
  completed: boolean;
  restTime: number;
}

interface WorkoutSession {
  exerciseId: string;
  exerciseName: string;
  difficulty: string;
  sets: WorkoutSet[];
  currentSet: number;
  isResting: boolean;
  restTimeRemaining: number;
  totalCaloriesBurned: number;
  startTime: Date;
  workoutDuration: number;
}

// Exercise database for workout screen
const getWorkoutExerciseData = (exerciseId: string) => {
  const exerciseDatabase: { [key: string]: any } = {
    '1': {
      id: '1',
      name: 'Push-ups',
      icon: '💪',
      caloriesPerMinute: 8,
      instructions: [
        'Start in a plank position with hands placed slightly wider than shoulder-width apart.',
        'Lower your body until your chest nearly touches the floor.',
        'Push through your palms to return to the starting position.',
        'Repeat for the desired number of repetitions.'
      ]
    },
    '2': {
      id: '2',
      name: 'Squats',
      icon: '🦵',
      caloriesPerMinute: 7,
      instructions: [
        'Stand with feet shoulder-width apart, toes slightly pointed outward.',
        'Lower your body by bending at the hips and knees, as if sitting back into a chair.',
        'Descend until your thighs are parallel to the floor or as low as comfortable.',
        'Push through your heels to return to the starting position.'
      ]
    },
    '3': {
      id: '3',
      name: 'Plank',
      icon: '🏋️‍♀️',
      caloriesPerMinute: 5,
      instructions: [
        'Start in a push-up position with forearms on the ground.',
        'Hold your body in a straight line from head to heels.',
        'Breathe normally while maintaining the position.',
        'Focus on keeping your entire body tight and stable.'
      ]
    },
    '4': {
      id: '4',
      name: 'Jumping Jacks',
      icon: '🤸‍♂️',
      caloriesPerMinute: 10,
      instructions: [
        'Stand upright with feet together and arms at your sides.',
        'Jump up while spreading your legs shoulder-width apart.',
        'Simultaneously raise your arms overhead.',
        'Jump back to starting position and repeat.'
      ]
    },
    '5': {
      id: '5',
      name: 'Burpees',
      icon: '🔥',
      caloriesPerMinute: 12,
      instructions: [
        'Start in a standing position with feet shoulder-width apart.',
        'Squat down and place your hands on the floor.',
        'Jump your feet back into a plank position.',
        'Perform a push-up, then jump feet back to squat position and explode up with a jump.'
      ]
    },
    '6': {
      id: '6',
      name: 'Mountain Climbers',
      icon: '⛰️',
      caloriesPerMinute: 11,
      instructions: [
        'Start in a plank position with hands under shoulders.',
        'Bring your right knee toward your chest.',
        'Quickly switch legs, bringing left knee to chest.',
        'Continue alternating legs in a running motion.'
      ]
    },
    '7': {
      id: '7',
      name: 'Lunges',
      icon: '🚶‍♀️',
      caloriesPerMinute: 6,
      instructions: [
        'Stand upright with feet hip-width apart.',
        'Step forward with your right leg into a lunge position.',
        'Lower your body until both knees are at 90-degree angles.',
        'Push through your front heel to return to starting position.'
      ]
    },
    '8': {
      id: '8',
      name: 'Yoga Flow',
      icon: '🧘‍♀️',
      caloriesPerMinute: 4,
      instructions: [
        'Start in mountain pose with feet hip-width apart.',
        'Flow through sun salutation sequence.',
        'Hold each pose for 3-5 breaths.',
        'End in child\'s pose for relaxation.'
      ]
    },
    '9': {
      id: '9',
      name: 'High Knees',
      icon: '🏃‍♀️',
      caloriesPerMinute: 9,
      instructions: [
        'Stand upright with feet hip-width apart.',
        'Lift your right knee up toward your chest.',
        'Quickly lower and repeat with your left knee.',
        'Continue alternating knees at a rapid pace.'
      ]
    },
    '10': {
      id: '10',
      name: 'Tricep Dips',
      icon: '💺',
      caloriesPerMinute: 6,
      instructions: [
        'Sit on the edge of a chair with hands gripping the edge.',
        'Slide your body off the chair, supporting your weight with your arms.',
        'Lower your body by bending your elbows to 90 degrees.',
        'Push through your palms to return to starting position.'
      ]
    }
  };

  return exerciseDatabase[exerciseId] || exerciseDatabase['1'];
};

export default function GuidedWorkoutScreen() {
  const { id, difficulty } = useLocalSearchParams();
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get exercise data based on ID
  const exerciseData = getWorkoutExerciseData(id as string);

  const difficultySettings = {
    'Beginner': { sets: 2, reps: '5-8', restTime: 60 },
    'Intermediate': { sets: 3, reps: '10-15', restTime: 45 },
    'Advanced': { sets: 4, reps: '15-25', restTime: 30 }
  };

  useEffect(() => {
    initializeWorkout();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused && workoutSession) {
      interval = setInterval(() => {
        setWorkoutSession(prev => {
          if (!prev) return null;
          
          if (prev.isResting && prev.restTimeRemaining > 0) {
            // Rest timer countdown
            const newRestTime = prev.restTimeRemaining - 1;
            
            if (newRestTime === 0) {
              // Rest period finished
              Vibration.vibrate([0, 500, 200, 500]);
              return {
                ...prev,
                isResting: false,
                restTimeRemaining: 0
              };
            }
            
            return {
              ...prev,
              restTimeRemaining: newRestTime
            };
          } else {
            // Workout timer
            return {
              ...prev,
              workoutDuration: prev.workoutDuration + 1,
              totalCaloriesBurned: prev.totalCaloriesBurned + (exerciseData.caloriesPerMinute / 60)
            };
          }
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, workoutSession]);

  useEffect(() => {
    // Pulse animation for active state
    if (isActive && !isPaused && workoutSession && !workoutSession.isResting) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive, isPaused, workoutSession?.isResting]);

  const initializeWorkout = () => {
    const settings = difficultySettings[difficulty as keyof typeof difficultySettings];
    if (!settings) return;

    const sets: WorkoutSet[] = Array.from({ length: settings.sets }, (_, index) => ({
      setNumber: index + 1,
      reps: settings.reps,
      completed: false,
      restTime: settings.restTime
    }));

    setWorkoutSession({
      exerciseId: id as string,
      exerciseName: exerciseData.name,
      difficulty: difficulty as string,
      sets,
      currentSet: 0,
      isResting: false,
      restTimeRemaining: 0,
      totalCaloriesBurned: 0,
      startTime: new Date(),
      workoutDuration: 0
    });
  };

  const startWorkout = () => {
    setIsActive(true);
    setIsPaused(false);
    setShowInstructions(false);
  };

  const pauseWorkout = () => {
    setIsPaused(!isPaused);
  };

  const completeSet = () => {
    if (!workoutSession) return;

    const updatedSets = [...workoutSession.sets];
    updatedSets[workoutSession.currentSet].completed = true;

    const isLastSet = workoutSession.currentSet === workoutSession.sets.length - 1;

    if (isLastSet) {
      // Workout completed
      completeWorkout();
    } else {
      // Start rest period
      const restTime = updatedSets[workoutSession.currentSet].restTime;
      setWorkoutSession({
        ...workoutSession,
        sets: updatedSets,
        isResting: true,
        restTimeRemaining: restTime
      });
      
      Vibration.vibrate(200);
    }
  };

  const skipRest = () => {
    if (!workoutSession) return;

    setWorkoutSession({
      ...workoutSession,
      currentSet: workoutSession.currentSet + 1,
      isResting: false,
      restTimeRemaining: 0
    });
  };

  const completeWorkout = () => {
    setIsActive(false);
    router.push({
      pathname: '/exercise/summary',
      params: {
        exerciseName: workoutSession?.exerciseName,
        difficulty: workoutSession?.difficulty,
        setsCompleted: workoutSession?.sets.filter(set => set.completed).length,
        totalSets: workoutSession?.sets.length,
        duration: workoutSession?.workoutDuration,
        caloriesBurned: Math.round(workoutSession?.totalCaloriesBurned || 0)
      }
    });
  };

  const exitWorkout = () => {
    Alert.alert(
      'Exit Workout',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!workoutSession) return 0;
    const completedSets = workoutSession.sets.filter(set => set.completed).length;
    return (completedSets / workoutSession.sets.length) * 100;
  };

  if (!workoutSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparing workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showInstructions) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>WORKOUT READY</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Instructions Preview */}
        <View style={styles.instructionsContainer}>
          <View style={styles.exercisePreview}>
            <Text style={styles.exerciseIcon}>{exerciseData.icon}</Text>
            <Text style={styles.exerciseName}>{exerciseData.name}</Text>
            <Text style={styles.difficultyText}>{difficulty} Level</Text>
          </View>

          <View style={styles.workoutSummary}>
            <Text style={styles.summaryTitle}>WORKOUT PLAN</Text>
            <View style={styles.summaryRow}>
              <MaterialIcons name="fitness-center" size={20} color="#666" />
              <Text style={styles.summaryText}>{workoutSession.sets.length} Sets</Text>
            </View>
            <View style={styles.summaryRow}>
              <MaterialIcons name="repeat" size={20} color="#666" />
              <Text style={styles.summaryText}>{workoutSession.sets[0].reps} Reps per set</Text>
            </View>
            <View style={styles.summaryRow}>
              <MaterialIcons name="schedule" size={20} color="#666" />
              <Text style={styles.summaryText}>{workoutSession.sets[0].restTime}s Rest between sets</Text>
            </View>
          </View>

          <View style={styles.quickInstructions}>
            <Text style={styles.instructionsTitle}>QUICK INSTRUCTIONS</Text>
            {exerciseData.instructions.slice(0, 2).map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionBullet} />
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Start Button */}
        <View style={styles.startButtonContainer}>
          <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
            <MaterialIcons name="play-arrow" size={28} color="white" />
            <Text style={styles.startButtonText}>START WORKOUT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentSetData = workoutSession.sets[workoutSession.currentSet];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={exitWorkout} style={styles.backButton}>
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WORKOUT</Text>
        <TouchableOpacity onPress={pauseWorkout} style={styles.pauseButton}>
          <MaterialIcons name={isPaused ? "play-arrow" : "pause"} size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {workoutSession.sets.filter(set => set.completed).length} / {workoutSession.sets.length} Sets
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.workoutContent}>
        {workoutSession.isResting ? (
          // Rest Screen
          <View style={styles.restContainer}>
            <Text style={styles.restTitle}>REST TIME</Text>
            <Text style={styles.restTimer}>{formatTime(workoutSession.restTimeRemaining)}</Text>
            <Text style={styles.nextSetText}>
              Next: Set {workoutSession.currentSet + 2} of {workoutSession.sets.length}
            </Text>
            <TouchableOpacity style={styles.skipRestButton} onPress={skipRest}>
              <Text style={styles.skipRestText}>SKIP REST</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Exercise Screen
          <View style={styles.exerciseContainer}>
            <Animated.View style={[styles.exerciseIconContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.workoutExerciseIcon}>{exerciseData.icon}</Text>
            </Animated.View>
            
            <Text style={styles.currentSetTitle}>
              SET {currentSetData?.setNumber} OF {workoutSession.sets.length}
            </Text>
            
            <Text style={styles.repsText}>{currentSetData?.reps} REPS</Text>
            
            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatTime(workoutSession.workoutDuration)}</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(workoutSession.totalCaloriesBurned)}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Action Button */}
      <View style={styles.actionButtonContainer}>
        {!workoutSession.isResting && (
          <TouchableOpacity 
            style={[styles.completeSetButton, isPaused && styles.disabledButton]} 
            onPress={completeSet}
            disabled={isPaused}
          >
            <MaterialIcons name="check" size={24} color="white" />
            <Text style={styles.completeSetText}>COMPLETE SET</Text>
          </TouchableOpacity>
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
  pauseButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  instructionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  exercisePreview: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  exerciseIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  workoutSummary: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  quickInstructions: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginTop: 8,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  startButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 1,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  workoutContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  restContainer: {
    alignItems: 'center',
  },
  restTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 20,
    letterSpacing: 1,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: '700',
    color: '#FF9800',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  nextSetText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  skipRestButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  skipRestText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1,
  },
  exerciseContainer: {
    alignItems: 'center',
  },
  exerciseIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  workoutExerciseIcon: {
    fontSize: 48,
  },
  currentSetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
    letterSpacing: 1,
  },
  repsText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 32,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  actionButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  completeSetButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
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
  completeSetText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 1,
  },
});
