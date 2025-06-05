import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProgress } from '../../contexts/ProgressContext';

const { width: screenWidth } = Dimensions.get('window');

interface StreakItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  title: string;
  currentStreak: number;
  longestStreak: number;
  unit: string;
  onPress: () => void;
}

const StreakItem: React.FC<StreakItemProps> = ({
  icon,
  iconColor,
  title,
  currentStreak,
  longestStreak,
  unit,
  onPress,
}) => {
  const getStreakStatus = () => {
    if (currentStreak === 0) return 'Start your streak!';
    if (currentStreak === longestStreak && currentStreak > 1) return 'Personal best! 🎉';
    if (currentStreak >= 7) return 'Amazing streak! 🔥';
    if (currentStreak >= 3) return 'Keep it up! 💪';
    return 'Good start! 👍';
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return '#CCC';
    if (currentStreak >= 7) return '#4CAF50';
    if (currentStreak >= 3) return '#FF9800';
    return '#2196F3';
  };

  return (
    <TouchableOpacity style={styles.streakItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.streakIcon, { backgroundColor: `${iconColor}20` }]}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      
      <View style={styles.streakContent}>
        <Text style={styles.streakTitle}>{title}</Text>
        <Text style={styles.streakStatus}>{getStreakStatus()}</Text>
        
        <View style={styles.streakNumbers}>
          <View style={styles.streakNumber}>
            <Text style={[styles.streakValue, { color: getStreakColor() }]}>
              {currentStreak}
            </Text>
            <Text style={styles.streakLabel}>Current {unit}</Text>
          </View>
          
          <View style={styles.streakDivider} />
          
          <View style={styles.streakNumber}>
            <Text style={styles.streakValue}>{longestStreak}</Text>
            <Text style={styles.streakLabel}>Best {unit}</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: longestStreak > 0 ? `${Math.min((currentStreak / longestStreak) * 100, 100)}%` : '0%',
                  backgroundColor: getStreakColor(),
                }
              ]} 
            />
          </View>
          {longestStreak > 0 && (
            <Text style={styles.progressText}>
              {Math.round((currentStreak / longestStreak) * 100)}% of best
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const StreaksCard: React.FC = () => {
  const { state } = useProgress();
  const { metrics } = state;

  if (!metrics) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="local-fire-department" size={24} color="#FF9800" />
          <Text style={styles.title}>Streaks</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading streaks...</Text>
        </View>
      </View>
    );
  }

  const { habits } = metrics;

  const streakData = [
    {
      icon: 'restaurant' as const,
      iconColor: '#4CAF50',
      title: 'Food Logging',
      currentStreak: habits.loggingStreak,
      longestStreak: habits.longestLoggingStreak,
      unit: 'days',
    },
    {
      icon: 'fitness-center' as const,
      iconColor: '#FF5722',
      title: 'Exercise',
      currentStreak: habits.exerciseStreak,
      longestStreak: habits.longestExerciseStreak,
      unit: 'days',
    },
    {
      icon: 'local-drink' as const,
      iconColor: '#2196F3',
      title: 'Hydration Goal',
      currentStreak: habits.waterGoalStreak,
      longestStreak: habits.longestWaterStreak,
      unit: 'days',
    },
  ];

  const totalCurrentStreak = habits.loggingStreak + habits.exerciseStreak + habits.waterGoalStreak;
  const totalLongestStreak = habits.longestLoggingStreak + habits.longestExerciseStreak + habits.longestWaterStreak;

  const handleStreakPress = (title: string) => {
    console.log(`${title} streak pressed`);
    // Could navigate to detailed streak view or show tips
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="local-fire-department" size={24} color="#FF9800" />
          <Text style={styles.title}>Streaks</Text>
        </View>
        <View style={styles.totalStreakContainer}>
          <Text style={styles.totalStreakNumber}>{totalCurrentStreak}</Text>
          <Text style={styles.totalStreakLabel}>Total Days</Text>
        </View>
      </View>

      {/* Overall Streak Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{Math.max(...streakData.map(s => s.currentStreak))}</Text>
          <Text style={styles.summaryLabel}>Longest Active</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{Math.max(...streakData.map(s => s.longestStreak))}</Text>
          <Text style={styles.summaryLabel}>Personal Best</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{streakData.filter(s => s.currentStreak > 0).length}</Text>
          <Text style={styles.summaryLabel}>Active Streaks</Text>
        </View>
      </View>

      {/* Individual Streaks */}
      <View style={styles.streaksList}>
        {streakData.map((streak, index) => (
          <StreakItem
            key={index}
            icon={streak.icon}
            iconColor={streak.iconColor}
            title={streak.title}
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
            unit={streak.unit}
            onPress={() => handleStreakPress(streak.title)}
          />
        ))}
      </View>

      {/* Motivation Section */}
      <View style={styles.motivationContainer}>
        <Text style={styles.motivationTitle}>Keep Going! 💪</Text>
        <Text style={styles.motivationText}>
          {totalCurrentStreak === 0 
            ? "Start building healthy habits today!"
            : totalCurrentStreak < 7
            ? "You're building momentum! Keep it up."
            : totalCurrentStreak < 30
            ? "Great consistency! You're forming lasting habits."
            : "Incredible dedication! You're a habit master!"
          }
        </Text>
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: screenWidth < 375 ? 18 : 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
    flexShrink: 1,
  },
  totalStreakContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: screenWidth < 375 ? 8 : 12,
    paddingVertical: screenWidth < 375 ? 6 : 8,
    borderRadius: 10,
  },
  totalStreakNumber: {
    fontSize: screenWidth < 375 ? 16 : 18,
    fontWeight: '700',
    color: '#FF9800',
  },
  totalStreakLabel: {
    fontSize: screenWidth < 375 ? 9 : 10,
    color: '#FF9800',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: screenWidth < 375 ? 12 : 16,
    marginBottom: screenWidth < 375 ? 16 : 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: screenWidth < 375 ? 18 : 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: screenWidth < 375 ? 10 : 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: screenWidth < 375 ? 14 : 16,
  },
  summaryDivider: {
    width: 1,
    height: screenWidth < 375 ? 25 : 30,
    backgroundColor: '#E5E5E5',
    marginHorizontal: screenWidth < 375 ? 8 : 12,
  },
  streaksList: {
    gap: screenWidth < 375 ? 12 : 16,
    marginBottom: screenWidth < 375 ? 16 : 20,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: screenWidth < 375 ? 12 : 16,
    minHeight: 44,
  },
  streakIcon: {
    width: screenWidth < 375 ? 40 : 48,
    height: screenWidth < 375 ? 40 : 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: screenWidth < 375 ? 8 : 12,
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  streakStatus: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  streakNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakNumber: {
    flex: 1,
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 11,
    color: '#666',
  },
  streakDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    minWidth: 60,
    textAlign: 'right',
  },
  motivationContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 13,
    color: '#4CAF50',
    textAlign: 'center',
    lineHeight: 18,
  },
});
