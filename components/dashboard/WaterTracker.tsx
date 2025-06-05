import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNutrition } from '../../contexts/NutritionContext';

export const WaterTracker: React.FC = () => {
  const { state, updateWaterIntake } = useNutrition();
  const { dailyProgress } = state;
  const [animatedValues] = useState(() => 
    Array.from({ length: 8 }, () => new Animated.Value(1))
  );

  if (state.isLoading || !dailyProgress) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="local-drink" size={20} color="#2196F3" />
          <Text style={styles.title}>Water</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  const { water } = dailyProgress;
  const maxGlasses = 8; // Show up to 8 glasses
  const glassesConsumed = Math.min(water.glassesConsumed, maxGlasses);

  const handleGlassPress = (glassIndex: number) => {
    // Animate the glass
    Animated.sequence([
      Animated.timing(animatedValues[glassIndex], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValues[glassIndex], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Update water intake
    const newGlassCount = glassIndex + 1;
    updateWaterIntake(newGlassCount);
  };

  const getProgressColor = () => {
    if (water.percentage >= 100) return '#4CAF50';
    if (water.percentage >= 75) return '#8BC34A';
    if (water.percentage >= 50) return '#FFC107';
    return '#2196F3';
  };

  const getMotivationalMessage = () => {
    if (water.percentage >= 100) return 'Great job! 🎉';
    if (water.percentage >= 75) return 'Almost there! 💪';
    if (water.percentage >= 50) return 'Keep going! 👍';
    if (water.percentage >= 25) return 'Good start! 💧';
    return 'Stay hydrated! 🥤';
  };

  const renderGlass = (index: number) => {
    const isFilled = index < glassesConsumed;
    const isNextGlass = index === glassesConsumed;
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.glassContainer}
        onPress={() => handleGlassPress(index)}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.glass,
            {
              transform: [{ scale: animatedValues[index] }],
              backgroundColor: isFilled ? '#2196F3' : 'transparent',
              borderColor: isNextGlass ? '#4CAF50' : '#E5E5E5',
              borderWidth: isNextGlass ? 2 : 1,
            },
          ]}
        >
          {isFilled && (
            <MaterialIcons name="local-drink" size={16} color="white" />
          )}
          {!isFilled && isNextGlass && (
            <MaterialIcons name="add" size={16} color="#4CAF50" />
          )}
        </Animated.View>
        <Text style={styles.glassLabel}>250ml</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="local-drink" size={20} color="#2196F3" />
        <Text style={styles.title}>Water</Text>
        <View style={styles.progressBadge}>
          <Text style={[styles.progressText, { color: getProgressColor() }]}>
            {Math.round(water.percentage)}%
          </Text>
        </View>
      </View>

      {/* Progress Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{water.current}ml</Text>
          <Text style={styles.summaryLabel}>consumed</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{water.goal}ml</Text>
          <Text style={styles.summaryLabel}>goal</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{Math.max(0, water.goal - water.current)}ml</Text>
          <Text style={styles.summaryLabel}>remaining</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${Math.min(water.percentage, 100)}%`,
                backgroundColor: getProgressColor(),
              }
            ]} 
          />
        </View>
        <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
      </View>

      {/* Glass Grid */}
      <View style={styles.glassesContainer}>
        <Text style={styles.glassesTitle}>Tap to add water (250ml per glass)</Text>
        <View style={styles.glassesGrid}>
          {Array.from({ length: maxGlasses }, (_, index) => renderGlass(index))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => updateWaterIntake(Math.max(0, glassesConsumed - 1))}
          disabled={glassesConsumed === 0}
        >
          <MaterialIcons name="remove" size={16} color={glassesConsumed === 0 ? '#CCC' : '#666'} />
          <Text style={[styles.quickActionText, { color: glassesConsumed === 0 ? '#CCC' : '#666' }]}>
            Remove
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => updateWaterIntake(0)}
          disabled={glassesConsumed === 0}
        >
          <MaterialIcons name="refresh" size={16} color={glassesConsumed === 0 ? '#CCC' : '#666'} />
          <Text style={[styles.quickActionText, { color: glassesConsumed === 0 ? '#CCC' : '#666' }]}>
            Reset
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => updateWaterIntake(water.glassesGoal)}
        >
          <MaterialIcons name="check" size={16} color="#4CAF50" />
          <Text style={[styles.quickActionText, { color: '#4CAF50' }]}>
            Complete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  progressBadge: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 8,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  motivationalText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  glassesContainer: {
    marginBottom: 16,
  },
  glassesTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  glassesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  glassContainer: {
    alignItems: 'center',
    marginBottom: 8,
    width: '22%',
  },
  glass: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  glassLabel: {
    fontSize: 9,
    color: '#999',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});
