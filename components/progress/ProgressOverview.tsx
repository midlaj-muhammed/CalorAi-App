import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProgress } from '../../contexts/ProgressContext';

const { width: screenWidth } = Dimensions.get('window');

interface OverviewItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down' | 'stable';
}

const OverviewItem: React.FC<OverviewItemProps> = ({
  icon,
  iconColor,
  title,
  value,
  subtitle,
  trend,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      case 'stable': return 'trending-flat';
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#F44336';
      case 'stable': return '#FF9800';
      default: return '#666';
    }
  };

  return (
    <View style={styles.overviewItem}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.overviewContent}>
        <Text style={styles.overviewTitle}>{title}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.overviewValue}>{value}</Text>
          {trend && (
            <View style={styles.trendContainer}>
              <MaterialIcons
                name={getTrendIcon()!}
                size={16}
                color={getTrendColor()}
              />
            </View>
          )}
        </View>
        <Text style={styles.overviewSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

export const ProgressOverview: React.FC = () => {
  const { state } = useProgress();
  const { metrics } = state;

  if (!metrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Progress Overview</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading overview...</Text>
        </View>
      </View>
    );
  }

  const formatPeriod = (period: string) => {
    switch (period) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
      default: return period;
    }
  };

  const overviewData = [
    {
      icon: 'restaurant' as const,
      iconColor: '#4CAF50',
      title: 'Avg Calories',
      value: `${metrics.nutrition.avgCalories}`,
      subtitle: `${metrics.nutrition.goalAdherence}% goal adherence`,
      trend: metrics.nutrition.goalAdherence >= 90 ? 'up' : 
             metrics.nutrition.goalAdherence >= 70 ? 'stable' : 'down',
    },
    {
      icon: 'fitness-center' as const,
      iconColor: '#FF5722',
      title: 'Workouts',
      value: `${metrics.exercise.totalWorkouts}`,
      subtitle: `${metrics.exercise.totalCaloriesBurned} cal burned`,
      trend: metrics.exercise.consistency >= 80 ? 'up' : 
             metrics.exercise.consistency >= 50 ? 'stable' : 'down',
    },
    {
      icon: 'monitor-weight' as const,
      iconColor: '#2196F3',
      title: 'Weight Change',
      value: `${metrics.weight.change >= 0 ? '+' : ''}${metrics.weight.change} kg`,
      subtitle: `${metrics.weight.entries.length} entries`,
      trend: metrics.weight.trend,
    },
    {
      icon: 'local-fire-department' as const,
      iconColor: '#FF9800',
      title: 'Longest Streak',
      value: `${Math.max(
        metrics.habits.longestLoggingStreak,
        metrics.habits.longestExerciseStreak,
        metrics.habits.longestWaterStreak
      )}`,
      subtitle: 'days',
      trend: 'up',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Overview</Text>
        <Text style={styles.period}>{formatPeriod(state.currentPeriod)}</Text>
      </View>
      
      <View style={styles.overviewGrid}>
        {overviewData.map((item, index) => (
          <OverviewItem
            key={index}
            icon={item.icon}
            iconColor={item.iconColor}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            trend={item.trend as 'up' | 'down' | 'stable'}
          />
        ))}
      </View>

      {/* Quick Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>Quick Insights</Text>
        <View style={styles.insightsList}>
          {metrics.nutrition.bestDay && (
            <View style={styles.insightItem}>
              <MaterialIcons name="star" size={16} color="#4CAF50" />
              <Text style={styles.insightText}>
                Best nutrition day: {new Date(metrics.nutrition.bestDay).toLocaleDateString()}
              </Text>
            </View>
          )}
          {metrics.exercise.mostActiveDay && (
            <View style={styles.insightItem}>
              <MaterialIcons name="local-fire-department" size={16} color="#FF5722" />
              <Text style={styles.insightText}>
                Most active day: {new Date(metrics.exercise.mostActiveDay).toLocaleDateString()}
              </Text>
            </View>
          )}
          <View style={styles.insightItem}>
            <MaterialIcons name="trending-up" size={16} color="#2196F3" />
            <Text style={styles.insightText}>
              Exercise consistency: {metrics.exercise.consistency}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: screenWidth < 375 ? 12 : 16,
    marginHorizontal: screenWidth < 375 ? 12 : 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: screenWidth < 375 ? 16 : 20,
  },
  title: {
    fontSize: screenWidth < 375 ? 18 : 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  period: {
    fontSize: screenWidth < 375 ? 12 : 14,
    fontWeight: '500',
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: screenWidth < 375 ? 8 : 12,
    paddingVertical: screenWidth < 375 ? 4 : 6,
    borderRadius: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenWidth < 375 ? 30 : 40,
  },
  loadingText: {
    fontSize: screenWidth < 375 ? 14 : 16,
    color: '#666',
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: screenWidth < 375 ? -4 : -6,
    marginBottom: screenWidth < 375 ? 16 : 20,
  },
  overviewItem: {
    width: '50%',
    paddingHorizontal: screenWidth < 375 ? 4 : 6,
    marginBottom: screenWidth < 375 ? 12 : 16,
  },
  iconContainer: {
    width: screenWidth < 375 ? 40 : 48,
    height: screenWidth < 375 ? 40 : 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: screenWidth < 375 ? 8 : 12,
  },
  overviewContent: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: screenWidth < 375 ? 11 : 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: screenWidth < 375 ? 16 : 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 6,
    flexShrink: 1,
  },
  trendContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    padding: 3,
  },
  overviewSubtitle: {
    fontSize: screenWidth < 375 ? 10 : 11,
    color: '#999',
    lineHeight: screenWidth < 375 ? 14 : 16,
  },
  insightsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: screenWidth < 375 ? 12 : 16,
  },
  insightsTitle: {
    fontSize: screenWidth < 375 ? 14 : 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: screenWidth < 375 ? 8 : 12,
  },
  insightsList: {
    gap: screenWidth < 375 ? 6 : 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 24,
  },
  insightText: {
    fontSize: screenWidth < 375 ? 12 : 13,
    color: '#666',
    marginLeft: 6,
    flex: 1,
    lineHeight: screenWidth < 375 ? 16 : 18,
  },
});
