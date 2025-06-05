import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { ProgressProvider, useProgress, ProgressFilter } from '../../contexts/ProgressContext';
import { TimePeriodSelector } from '../../components/progress/TimePeriodSelector';
import { ProgressOverview } from '../../components/progress/ProgressOverview';
import { ProgressCharts } from '../../components/progress/ProgressCharts';
import { AchievementsCard } from '../../components/progress/AchievementsCard';
import { StreaksCard } from '../../components/progress/StreaksCard';

const filters: Array<{ key: ProgressFilter; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { key: 'all', label: 'All', icon: 'dashboard' },
  { key: 'nutrition', label: 'Nutrition', icon: 'restaurant' },
  { key: 'exercise', label: 'Exercise', icon: 'fitness-center' },
  { key: 'weight', label: 'Weight', icon: 'monitor-weight' },
  { key: 'habits', label: 'Habits', icon: 'local-fire-department' },
];

function ProgressContent() {
  const { user } = useUser();
  const { state, setFilter, refreshMetrics, shareProgress } = useProgress();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMetrics();
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleShare = async () => {
    try {
      await shareProgress();
      Alert.alert('Success', 'Progress shared successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to share progress');
    }
  };

  const getUserName = () => {
    return user?.firstName || user?.username || 'there';
  };

  const getMotivationalMessage = () => {
    if (!state.metrics) return 'Track your progress and achieve your goals!';
    
    const { nutrition, exercise, habits } = state.metrics;
    const totalStreaks = habits.loggingStreak + habits.exerciseStreak + habits.waterGoalStreak;
    
    if (totalStreaks >= 21) return 'Incredible consistency! You\'re a habit master! 🏆';
    if (totalStreaks >= 14) return 'Amazing dedication! Keep up the great work! 🔥';
    if (totalStreaks >= 7) return 'Great momentum! You\'re building lasting habits! 💪';
    if (exercise.totalWorkouts > 0 || nutrition.avgCalories > 0) return 'Good progress! Keep moving forward! 👍';
    return 'Start your journey today! Every step counts! 🌟';
  };

  const shouldShowComponent = (component: string) => {
    if (state.currentFilter === 'all') return true;
    
    switch (component) {
      case 'overview': return true; // Always show overview
      case 'charts': return true; // Always show charts (they filter internally)
      case 'achievements': return state.currentFilter === 'habits';
      case 'streaks': return state.currentFilter === 'habits';
      default: return true;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#4CAF50', '#8BC34A', '#CDDC39']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.appTitle}>Progress</Text>
              <Text style={styles.greetingText}>
                Hey {getUserName()}! 👋
              </Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <MaterialIcons name="share" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleRefresh}>
                <MaterialIcons name="refresh" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Motivational Message */}
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
          </View>

          {/* Quick Stats */}
          {state.metrics && (
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <MaterialIcons name="restaurant" size={16} color="white" />
                <Text style={styles.quickStatText}>
                  {state.metrics.nutrition.goalAdherence}% nutrition goal
                </Text>
              </View>
              <View style={styles.quickStat}>
                <MaterialIcons name="fitness-center" size={16} color="white" />
                <Text style={styles.quickStatText}>
                  {state.metrics.exercise.totalWorkouts} workouts
                </Text>
              </View>
              <View style={styles.quickStat}>
                <MaterialIcons name="local-fire-department" size={16} color="white" />
                <Text style={styles.quickStatText}>
                  {Math.max(
                    state.metrics.habits.loggingStreak,
                    state.metrics.habits.exerciseStreak,
                    state.metrics.habits.waterGoalStreak
                  )} day streak
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Filter Selector */}
        <View style={styles.filterContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  state.currentFilter === filter.key && styles.activeFilterButton,
                ]}
                onPress={() => setFilter(filter.key)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={filter.icon}
                  size={18}
                  color={state.currentFilter === filter.key ? 'white' : '#666'}
                />
                <Text
                  style={[
                    styles.filterText,
                    state.currentFilter === filter.key && styles.activeFilterText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Period Selector */}
        <TimePeriodSelector />

        {/* Progress Components */}
        {shouldShowComponent('overview') && <ProgressOverview />}
        {shouldShowComponent('charts') && <ProgressCharts />}
        {shouldShowComponent('streaks') && <StreaksCard />}
        {shouldShowComponent('achievements') && <AchievementsCard />}

        {/* Loading State */}
        {state.isLoading && (
          <View style={styles.loadingContainer}>
            <MaterialIcons name="hourglass-empty" size={32} color="#4CAF50" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        )}

        {/* Error State */}
        {state.error && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={32} color="#F44336" />
            <Text style={styles.errorText}>{state.error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ProgressScreen() {
  return (
    <ProgressProvider>
      <ProgressContent />
    </ProgressProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: screenWidth < 375 ? 80 : 100,
  },
  gradientHeader: {
    paddingTop: screenWidth < 375 ? 16 : 20,
    paddingBottom: screenWidth < 375 ? 24 : 30,
    paddingHorizontal: screenWidth < 375 ? 16 : 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: screenWidth < 375 ? 16 : 20,
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    color: 'white',
    fontSize: screenWidth < 375 ? 24 : 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: screenWidth < 375 ? 14 : 16,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: screenWidth < 375 ? 8 : 12,
  },
  iconButton: {
    padding: screenWidth < 375 ? 6 : 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: screenWidth < 375 ? 12 : 16,
    marginBottom: screenWidth < 375 ? 16 : 20,
  },
  motivationText: {
    color: 'white',
    fontSize: screenWidth < 375 ? 14 : 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: screenWidth < 375 ? 20 : 22,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: screenWidth < 375 ? 6 : 8,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: screenWidth < 375 ? 8 : 12,
    paddingVertical: screenWidth < 375 ? 6 : 8,
    borderRadius: 10,
    minHeight: 32,
  },
  quickStatText: {
    color: 'white',
    fontSize: screenWidth < 375 ? 10 : 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  filterContainer: {
    marginTop: screenWidth < 375 ? -12 : -15,
    marginBottom: screenWidth < 375 ? 12 : 16,
  },
  filterScrollContent: {
    paddingHorizontal: screenWidth < 375 ? 12 : 16,
    gap: screenWidth < 375 ? 6 : 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: screenWidth < 375 ? 12 : 16,
    paddingVertical: screenWidth < 375 ? 8 : 10,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 44,
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: screenWidth < 375 ? 12 : 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  activeFilterText: {
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenWidth < 375 ? 30 : 40,
    marginHorizontal: screenWidth < 375 ? 12 : 16,
  },
  loadingText: {
    fontSize: screenWidth < 375 ? 14 : 16,
    color: '#4CAF50',
    marginTop: 12,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenWidth < 375 ? 30 : 40,
    marginHorizontal: screenWidth < 375 ? 12 : 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: {
    fontSize: screenWidth < 375 ? 14 : 16,
    color: '#F44336',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: screenWidth < 375 ? 20 : 22,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: screenWidth < 375 ? 16 : 20,
    paddingVertical: screenWidth < 375 ? 8 : 10,
    borderRadius: 10,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: screenWidth < 375 ? 12 : 14,
    fontWeight: '600',
  },
});
