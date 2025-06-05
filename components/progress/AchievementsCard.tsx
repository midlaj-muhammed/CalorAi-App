import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useProgress, Achievement } from '../../contexts/ProgressContext';

const { width: screenWidth } = Dimensions.get('window');

interface AchievementItemProps {
  achievement: Achievement;
  onPress: () => void;
}

const AchievementItem: React.FC<AchievementItemProps> = ({ achievement, onPress }) => {
  const isUnlocked = achievement.unlockedAt !== undefined;
  const progressPercentage = Math.min((achievement.current / achievement.target) * 100, 100);

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'nutrition': return '#4CAF50';
      case 'exercise': return '#FF5722';
      case 'consistency': return '#FF9800';
      case 'milestone': return '#9C27B0';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'nutrition': return 'restaurant';
      case 'exercise': return 'fitness-center';
      case 'consistency': return 'local-fire-department';
      case 'milestone': return 'emoji-events';
      default: return 'star';
    }
  };

  return (
    <TouchableOpacity style={styles.achievementItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.achievementContent}>
        <View style={[
          styles.achievementIcon,
          { backgroundColor: isUnlocked ? getCategoryColor(achievement.category) : '#F0F0F0' }
        ]}>
          <MaterialIcons
            name={isUnlocked ? achievement.icon as any : getCategoryIcon(achievement.category) as any}
            size={24}
            color={isUnlocked ? 'white' : '#999'}
          />
        </View>
        
        <View style={styles.achievementInfo}>
          <Text style={[
            styles.achievementTitle,
            { color: isUnlocked ? '#1A1A1A' : '#999' }
          ]}>
            {achievement.title}
          </Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>
          
          {!isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${progressPercentage}%`,
                      backgroundColor: getCategoryColor(achievement.category),
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {achievement.current}/{achievement.target}
              </Text>
            </View>
          )}
          
          {isUnlocked && (
            <View style={styles.unlockedContainer}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.unlockedText}>
                Unlocked {new Date(achievement.unlockedAt!).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const AchievementsCard: React.FC = () => {
  const { state } = useProgress();
  const { achievements } = state;

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const handleAchievementPress = (achievement: Achievement) => {
    // Could show achievement details modal
    console.log('Achievement pressed:', achievement.title);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="emoji-events" size={24} color="#FF9800" />
          <Text style={styles.title}>Achievements</Text>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {unlockedAchievements.length}/{achievements.length}
          </Text>
        </View>
      </View>

      {achievements.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="emoji-events" size={48} color="#E0E0E0" />
          <Text style={styles.emptyText}>No achievements yet</Text>
          <Text style={styles.emptySubtext}>Start logging your progress to unlock achievements</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.achievementsList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Unlocked ({unlockedAchievements.length})</Text>
              {unlockedAchievements.map((achievement) => (
                <AchievementItem
                  key={achievement.id}
                  achievement={achievement}
                  onPress={() => handleAchievementPress(achievement)}
                />
              ))}
            </>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>In Progress ({lockedAchievements.length})</Text>
              {lockedAchievements.map((achievement) => (
                <AchievementItem
                  key={achievement.id}
                  achievement={achievement}
                  onPress={() => handleAchievementPress(achievement)}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* Achievement Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.categoriesTitle}>Categories</Text>
        <View style={styles.categoriesRow}>
          <View style={styles.categoryItem}>
            <View style={[styles.categoryIcon, { backgroundColor: '#4CAF5020' }]}>
              <MaterialIcons name="restaurant" size={16} color="#4CAF50" />
            </View>
            <Text style={styles.categoryText}>Nutrition</Text>
          </View>
          <View style={styles.categoryItem}>
            <View style={[styles.categoryIcon, { backgroundColor: '#FF572220' }]}>
              <MaterialIcons name="fitness-center" size={16} color="#FF5722" />
            </View>
            <Text style={styles.categoryText}>Exercise</Text>
          </View>
          <View style={styles.categoryItem}>
            <View style={[styles.categoryIcon, { backgroundColor: '#FF980020' }]}>
              <MaterialIcons name="local-fire-department" size={16} color="#FF9800" />
            </View>
            <Text style={styles.categoryText}>Consistency</Text>
          </View>
          <View style={styles.categoryItem}>
            <View style={[styles.categoryIcon, { backgroundColor: '#9C27B020' }]}>
              <MaterialIcons name="emoji-events" size={16} color="#9C27B0" />
            </View>
            <Text style={styles.categoryText}>Milestones</Text>
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
  statsContainer: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: screenWidth < 375 ? 8 : 12,
    paddingVertical: screenWidth < 375 ? 4 : 6,
    borderRadius: 10,
  },
  statsText: {
    fontSize: screenWidth < 375 ? 12 : 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenWidth < 375 ? 30 : 40,
  },
  emptyText: {
    fontSize: screenWidth < 375 ? 14 : 16,
    fontWeight: '600',
    color: '#999',
    marginTop: screenWidth < 375 ? 12 : 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: screenWidth < 375 ? 11 : 12,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: screenWidth < 375 ? 16 : 18,
  },
  achievementsList: {
    maxHeight: screenWidth < 375 ? 250 : 300,
  },
  sectionTitle: {
    fontSize: screenWidth < 375 ? 14 : 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: screenWidth < 375 ? 8 : 12,
    marginTop: screenWidth < 375 ? 6 : 8,
  },
  achievementItem: {
    marginBottom: screenWidth < 375 ? 12 : 16,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  achievementIcon: {
    width: screenWidth < 375 ? 40 : 48,
    height: screenWidth < 375 ? 40 : 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: screenWidth < 375 ? 8 : 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    minWidth: 40,
  },
  unlockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  categoriesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
    marginTop: 16,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});
