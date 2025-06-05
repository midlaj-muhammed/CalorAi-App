import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function WorkoutSummaryScreen() {
  const { 
    exerciseName, 
    difficulty, 
    setsCompleted, 
    totalSets, 
    duration, 
    caloriesBurned 
  } = useLocalSearchParams();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Number(seconds) / 60);
    const secs = Number(seconds) % 60;
    return `${mins}m ${secs}s`;
  };

  const getCompletionPercentage = () => {
    return Math.round((Number(setsCompleted) / Number(totalSets)) * 100);
  };

  const getAchievementMessage = () => {
    const percentage = getCompletionPercentage();
    if (percentage === 100) return "Perfect workout! 🎉";
    if (percentage >= 75) return "Great effort! 💪";
    if (percentage >= 50) return "Good progress! 👍";
    return "Keep going! 🌟";
  };

  const handleSaveWorkout = () => {
    // In a real app, this would save to database/API
    console.log('Workout saved:', {
      exerciseName,
      difficulty,
      setsCompleted,
      totalSets,
      duration,
      caloriesBurned,
      date: new Date().toISOString()
    });
    
    router.push('/(tabs)');
  };

  const handleShareWorkout = () => {
    // In a real app, this would open share dialog
    console.log('Share workout');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WORKOUT COMPLETE</Text>
        <TouchableOpacity onPress={handleShareWorkout} style={styles.shareButton}>
          <MaterialIcons name="share" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Achievement Banner */}
        <View style={styles.achievementBanner}>
          <View style={styles.achievementIcon}>
            <MaterialIcons name="emoji-events" size={48} color="#FFD700" />
          </View>
          <Text style={styles.achievementTitle}>{getAchievementMessage()}</Text>
          <Text style={styles.achievementSubtitle}>
            You completed {setsCompleted} out of {totalSets} sets
          </Text>
        </View>

        {/* Exercise Summary */}
        <View style={styles.exerciseSummaryCard}>
          <Text style={styles.exerciseName}>{exerciseName}</Text>
          <Text style={styles.difficultyLevel}>{difficulty} Level</Text>
          
          <View style={styles.completionBar}>
            <View style={styles.completionBarBackground}>
              <View 
                style={[
                  styles.completionBarFill, 
                  { width: `${getCompletionPercentage()}%` }
                ]} 
              />
            </View>
            <Text style={styles.completionPercentage}>
              {getCompletionPercentage()}% Complete
            </Text>
          </View>
        </View>

        {/* Workout Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>WORKOUT STATS</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="schedule" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>{formatTime(Number(duration))}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="local-fire-department" size={32} color="#FF5722" />
              <Text style={styles.statValue}>{caloriesBurned}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="fitness-center" size={32} color="#2196F3" />
              <Text style={styles.statValue}>{setsCompleted}/{totalSets}</Text>
              <Text style={styles.statLabel}>Sets</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialIcons name="trending-up" size={32} color="#9C27B0" />
              <Text style={styles.statValue}>{difficulty}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* Personal Records */}
        <View style={styles.recordsCard}>
          <View style={styles.recordsHeader}>
            <MaterialIcons name="star" size={20} color="#FFD700" />
            <Text style={styles.recordsTitle}>PERSONAL RECORDS</Text>
          </View>
          
          <View style={styles.recordItem}>
            <Text style={styles.recordText}>🔥 Longest workout streak: 5 days</Text>
          </View>
          <View style={styles.recordItem}>
            <Text style={styles.recordText}>💪 Total workouts completed: 23</Text>
          </View>
          <View style={styles.recordItem}>
            <Text style={styles.recordText}>⚡ Calories burned this week: 1,240</Text>
          </View>
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.sectionTitle}>WHAT'S NEXT?</Text>
          
          <TouchableOpacity style={styles.recommendationItem}>
            <View style={styles.recommendationIcon}>
              <MaterialIcons name="refresh" size={20} color="#4CAF50" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Repeat this workout</Text>
              <Text style={styles.recommendationSubtitle}>Try to beat your previous performance</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.recommendationItem}>
            <View style={styles.recommendationIcon}>
              <MaterialIcons name="trending-up" size={20} color="#FF9800" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Try Intermediate level</Text>
              <Text style={styles.recommendationSubtitle}>Ready for the next challenge?</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.recommendationItem}>
            <View style={styles.recommendationIcon}>
              <MaterialIcons name="explore" size={20} color="#2196F3" />
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Explore new exercises</Text>
              <Text style={styles.recommendationSubtitle}>Discover more workout options</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/exercise')}>
          <Text style={styles.secondaryButtonText}>MORE EXERCISES</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveWorkout}>
          <MaterialIcons name="check" size={20} color="white" />
          <Text style={styles.primaryButtonText}>SAVE WORKOUT</Text>
        </TouchableOpacity>
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  achievementBanner: {
    backgroundColor: 'white',
    marginHorizontal: 16,
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
  achievementIcon: {
    marginBottom: 16,
  },
  achievementTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  exerciseSummaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  difficultyLevel: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  completionBar: {
    alignItems: 'center',
  },
  completionBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 12,
  },
  completionBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  completionPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  recordsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginLeft: 8,
  },
  recordItem: {
    marginBottom: 12,
  },
  recordText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacing: {
    height: 100,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    letterSpacing: 1,
  },
  primaryButton: {
    flex: 1,
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
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 1,
  },
});
