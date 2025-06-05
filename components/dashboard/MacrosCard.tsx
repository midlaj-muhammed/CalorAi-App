import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNutrition } from '../../contexts/NutritionContext';
import { MacroProgress } from '../../types/nutrition';

interface MacroItemProps {
  name: string;
  progress: MacroProgress;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  unit: string;
}

const MacroItem: React.FC<MacroItemProps> = ({ name, progress, color, icon, unit }) => {
  const progressPercentage = Math.min(progress.percentage, 100);
  
  const getStatusColor = () => {
    switch (progress.status) {
      case 'under': return '#FF9800';
      case 'on_track': return '#4CAF50';
      case 'over': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <View style={styles.macroItem}>
      <View style={styles.macroHeader}>
        <View style={styles.macroIconContainer}>
          <MaterialIcons name={icon} size={16} color={color} />
          <Text style={[styles.macroName, { color }]}>{name}</Text>
        </View>
        <Text style={styles.macroValues}>
          {Math.round(progress.current)}/{progress.goal}{unit}
        </Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: getStatusColor(),
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressPercentage, { color: getStatusColor() }]}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>
      
      {progress.remaining > 0 && (
        <Text style={styles.remainingText}>
          {Math.round(progress.remaining)}{unit} remaining
        </Text>
      )}
    </View>
  );
};

export const MacrosCard: React.FC = () => {
  const { state } = useNutrition();
  const { dailyProgress } = state;

  if (state.isLoading || !dailyProgress) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="pie-chart" size={20} color="#4CAF50" />
          <Text style={styles.title}>Macros</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading macros...</Text>
        </View>
      </View>
    );
  }

  const { macros } = dailyProgress;

  const macroData = [
    {
      name: 'Carbs',
      progress: macros.carbs,
      color: '#FF9800',
      icon: 'grain' as const,
      unit: 'g',
    },
    {
      name: 'Protein',
      progress: macros.protein,
      color: '#F44336',
      icon: 'fitness-center' as const,
      unit: 'g',
    },
    {
      name: 'Fat',
      progress: macros.fat,
      color: '#9C27B0',
      icon: 'opacity' as const,
      unit: 'g',
    },
  ];

  const getTotalCaloriesFromMacros = () => {
    const carbCalories = macros.carbs.current * 4;
    const proteinCalories = macros.protein.current * 4;
    const fatCalories = macros.fat.current * 9;
    return Math.round(carbCalories + proteinCalories + fatCalories);
  };

  const getMacroDistribution = () => {
    const totalCalories = getTotalCaloriesFromMacros();
    if (totalCalories === 0) return { carbs: 0, protein: 0, fat: 0 };
    
    return {
      carbs: Math.round((macros.carbs.current * 4 / totalCalories) * 100),
      protein: Math.round((macros.protein.current * 4 / totalCalories) * 100),
      fat: Math.round((macros.fat.current * 9 / totalCalories) * 100),
    };
  };

  const distribution = getMacroDistribution();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="pie-chart" size={20} color="#4CAF50" />
        <Text style={styles.title}>Macros</Text>
        <Text style={styles.subtitle}>{getTotalCaloriesFromMacros()} cal from macros</Text>
      </View>

      {/* Macro Distribution Visualization */}
      <View style={styles.distributionContainer}>
        <Text style={styles.distributionTitle}>Distribution</Text>
        <View style={styles.distributionBar}>
          <View style={[styles.distributionSegment, { 
            flex: distribution.carbs, 
            backgroundColor: '#FF9800' 
          }]} />
          <View style={[styles.distributionSegment, { 
            flex: distribution.protein, 
            backgroundColor: '#F44336' 
          }]} />
          <View style={[styles.distributionSegment, { 
            flex: distribution.fat, 
            backgroundColor: '#9C27B0' 
          }]} />
        </View>
        <View style={styles.distributionLabels}>
          <Text style={styles.distributionLabel}>
            <Text style={{ color: '#FF9800' }}>●</Text> {distribution.carbs}% Carbs
          </Text>
          <Text style={styles.distributionLabel}>
            <Text style={{ color: '#F44336' }}>●</Text> {distribution.protein}% Protein
          </Text>
          <Text style={styles.distributionLabel}>
            <Text style={{ color: '#9C27B0' }}>●</Text> {distribution.fat}% Fat
          </Text>
        </View>
      </View>

      {/* Individual Macro Progress */}
      <View style={styles.macrosContainer}>
        {macroData.map((macro) => (
          <MacroItem
            key={macro.name}
            name={macro.name}
            progress={macro.progress}
            color={macro.color}
            icon={macro.icon}
            unit={macro.unit}
          />
        ))}
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
  subtitle: {
    fontSize: 12,
    color: '#666',
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
  distributionContainer: {
    marginBottom: 20,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  distributionSegment: {
    height: '100%',
  },
  distributionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distributionLabel: {
    fontSize: 10,
    color: '#666',
  },
  macrosContainer: {
    gap: 16,
  },
  macroItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  macroValues: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  remainingText: {
    fontSize: 11,
    color: '#999',
  },
});
