import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNutrition } from '../../contexts/NutritionContext';

interface CalorieTrackerProps {
  size?: number;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({ size = 200 }) => {
  const { state } = useNutrition();
  const { dailyProgress } = state;

  if (state.isLoading || !dailyProgress) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const { calories } = dailyProgress;
  const progressPercentage = Math.min((calories.consumed / calories.goal) * 100, 100);
  const circumference = 2 * Math.PI * (size / 2 - 20);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const getCalorieStatus = () => {
    if (calories.remaining > 0) {
      return {
        color: '#4CAF50',
        message: 'calories left',
        icon: 'trending-up' as const,
      };
    } else if (calories.remaining === 0) {
      return {
        color: '#FF9800',
        message: 'goal reached',
        icon: 'check-circle' as const,
      };
    } else {
      return {
        color: '#F44336',
        message: 'over goal',
        icon: 'warning' as const,
      };
    }
  };

  const status = getCalorieStatus();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background Circle */}
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        <View style={[styles.backgroundCircle, { width: size - 20, height: size - 20 }]} />
        
        {/* Progress Circle */}
        <View style={[styles.progressCircle, { width: size - 20, height: size - 20 }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: size - 20,
                height: size - 20,
                borderRadius: (size - 20) / 2,
                borderWidth: 8,
                borderColor: '#E5E5E5',
              },
            ]}
          />
          <View
            style={[
              styles.progressOverlay,
              {
                width: size - 20,
                height: size - 20,
                borderRadius: (size - 20) / 2,
                borderWidth: 8,
                borderColor: status.color,
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          />
        </View>

        {/* Center Content */}
        <View style={styles.centerContent}>
          <Text style={styles.caloriesConsumed}>{Math.round(calories.consumed)}</Text>
          <Text style={styles.caloriesLabel}>consumed</Text>
          
          <View style={styles.statusContainer}>
            <MaterialIcons name={status.icon} size={16} color={status.color} />
            <Text style={[styles.remainingText, { color: status.color }]}>
              {Math.abs(calories.remaining)} {status.message}
            </Text>
          </View>
          
          <Text style={styles.goalText}>Goal: {calories.goal}</Text>
        </View>
      </View>

      {/* Exercise Calories */}
      {calories.burned > 0 && (
        <View style={styles.exerciseContainer}>
          <MaterialIcons name="local-fire-department" size={16} color="#FF5722" />
          <Text style={styles.exerciseText}>+{Math.round(calories.burned)} from exercise</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: '#F8F9FA',
  },
  progressCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
  },
  progressOverlay: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  caloriesConsumed: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  goalText: {
    fontSize: 10,
    color: '#999',
  },
  exerciseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
  },
  exerciseText: {
    fontSize: 12,
    color: '#FF5722',
    fontWeight: '500',
    marginLeft: 4,
  },
});
