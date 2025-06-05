import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useNutrition } from '../../contexts/NutritionContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useNotifications, createMealReminder, createWaterReminder, createAchievement } from '../../contexts/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalorieTracker } from '../../components/dashboard/CalorieTracker';
import { MacrosCard } from '../../components/dashboard/MacrosCard';
import { WaterTracker } from '../../components/dashboard/WaterTracker';
import { DateNavigator } from '../../components/dashboard/DateNavigator';
import { ExerciseCard } from '../../components/dashboard/ExerciseCard';
import { AnimatedCard } from '../../components/animated/AnimatedCard';
import { AnimatedScrollView } from '../../components/animated/AnimatedFlatList';


export default function HomeScreen() {
  const { user } = useUser();
  const { state, updateWaterIntake } = useNutrition();
  const { data: onboardingData } = useOnboarding();
  const { unreadCount, addNotification } = useNotifications();

  // Calculate meal calorie recommendations based on user's daily goal
  const getMealCalorieRecommendation = (mealType: string) => {
    const dailyCalories = onboardingData.dailyCalorieGoal ||
                         state.dashboardData?.userMetrics.nutritionGoals.dailyCalories ||
                         2000;

    // Standard meal distribution percentages
    const mealDistribution = {
      breakfast: 0.25, // 25%
      lunch: 0.35,     // 35%
      dinner: 0.35,    // 35%
      snacks: 0.05,    // 5%
    };

    const percentage = mealDistribution[mealType as keyof typeof mealDistribution] || 0.25;
    const calories = Math.round(dailyCalories * percentage);

    return `Recommended ${calories} kcal`;
  };

  useEffect(() => {
    generateDailyNotifications();
  }, [state.dashboardData]);

  // Back button handler for exit confirmation
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        showExitConfirmation();
        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [])
  );

  const showExitConfirmation = () => {
    // Haptic feedback for interaction
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Exit CalorAi?',
      'Are you sure you want to exit the app?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Haptic feedback for cancel
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            // Haptic feedback for exit
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            BackHandler.exitApp();
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          // Haptic feedback when dismissed by tapping outside
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }
    );
  };

  const generateDailyNotifications = async () => {
    const today = new Date().toDateString();
    const lastNotificationDate = await AsyncStorage.getItem(`last_notification_date_${user?.id}`);

    if (lastNotificationDate !== today) {
      // Add daily meal reminder
      await addNotification(createMealReminder('breakfast'));

      // Add water reminder
      await addNotification(createWaterReminder());

      // Add achievement notification if user has streaks
      if (state.dashboardData?.streaks?.logging && state.dashboardData.streaks.logging > 0) {
        await addNotification(createAchievement(
          'Great Progress!',
          `You're on a ${state.dashboardData.streaks.logging}-day logging streak! Keep it up!`
        ));
      }

      // Mark today as notification generated
      await AsyncStorage.setItem(`last_notification_date_${user?.id}`, today);
    }
  };

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    return user?.firstName || user?.username || 'there';
  };



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#4CAF50', '#8BC34A', '#CDDC39']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.appTitle}>CalorAi</Text>
              <Text style={styles.greetingText}>
                {getGreeting()}, {getUserName()}!
              </Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={handleProfilePress}>
                <MaterialIcons name="person" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleNotificationPress}>
                <MaterialIcons name="notifications" size={24} color="white" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Calorie Tracker */}
          <View style={styles.calorieTrackerContainer}>
            <CalorieTracker size={220} />
          </View>

          {/* Quick Stats */}
          {state.dailyProgress && (
            <View style={styles.quickStats}>
              <View style={styles.quickStat}>
                <MaterialIcons name="restaurant" size={16} color="white" />
                <Text style={styles.quickStatText}>
                  {Math.round(state.dailyProgress.calories.consumed)} eaten
                </Text>
              </View>
              <View style={styles.quickStat}>
                <MaterialIcons name="local-fire-department" size={16} color="white" />
                <Text style={styles.quickStatText}>
                  {Math.round(state.dailyProgress.calories.burned)} burned
                </Text>
              </View>
              <View style={styles.quickStat}>
                <MaterialIcons name="local-drink" size={16} color="white" />
                <Text style={styles.quickStatText}>
                  {state.dailyProgress.water.glassesConsumed}/{state.dailyProgress.water.glassesGoal} glasses
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Dynamic Macros Card */}
        <View style={styles.macrosCardContainer}>
          <MacrosCard />
        </View>

        {/* Date Navigation */}
        <DateNavigator />

        {/* Dynamic Water Tracking */}
        <View style={styles.waterCardContainer}>
          <WaterTracker />
        </View>

        {/* Meal Cards */}
        <AnimatedCard
          animationType="slide"
          slideDirection="up"
          delay={200}
          style={styles.mealCard}
        >
          <TouchableOpacity style={styles.mealContent} onPress={() => router.push('/meal/breakfast')}>
            <Text style={styles.mealEmoji}>🍳</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Breakfast</Text>
              <Text style={styles.mealCalories}>
                {state.dailyProgress ?
                  `${state.dailyProgress.nutrition?.meals?.filter(m => m.mealType === 'breakfast').length || 0} items logged` :
                  getMealCalorieRecommendation('breakfast')
                }
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push('/meal/breakfast');
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.mealActions}>
            <TouchableOpacity
              style={styles.recipeButton}
              onPress={() => router.push('/recipes?mealType=breakfast')}
            >
              <MaterialIcons name="restaurant-menu" size={16} color="#4CAF50" />
              <Text style={styles.recipeButtonText}>Get Recipe</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        <AnimatedCard
          animationType="slide"
          slideDirection="up"
          delay={300}
          style={styles.mealCard}
        >
          <TouchableOpacity style={styles.mealContent} onPress={() => router.push('/meal/lunch')}>
            <Text style={styles.mealEmoji}>🥗</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Lunch</Text>
              <Text style={styles.mealCalories}>
                {state.dailyProgress ?
                  `${state.dailyProgress.nutrition?.meals?.filter(m => m.mealType === 'lunch').length || 0} items logged` :
                  getMealCalorieRecommendation('lunch')
                }
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push('/meal/lunch');
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.mealActions}>
            <TouchableOpacity
              style={styles.recipeButton}
              onPress={() => router.push('/recipes?mealType=lunch')}
            >
              <MaterialIcons name="restaurant-menu" size={16} color="#4CAF50" />
              <Text style={styles.recipeButtonText}>Get Recipe</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        <AnimatedCard
          animationType="slide"
          slideDirection="up"
          delay={400}
          style={styles.mealCard}
        >
          <TouchableOpacity style={styles.mealContent} onPress={() => router.push('/meal/dinner')}>
            <Text style={styles.mealEmoji}>🍽️</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Dinner</Text>
              <Text style={styles.mealCalories}>
                {state.dailyProgress ?
                  `${state.dailyProgress.nutrition?.meals?.filter(m => m.mealType === 'dinner').length || 0} items logged` :
                  getMealCalorieRecommendation('dinner')
                }
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push('/meal/dinner');
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.mealActions}>
            <TouchableOpacity
              style={styles.recipeButton}
              onPress={() => router.push('/recipes?mealType=dinner')}
            >
              <MaterialIcons name="restaurant-menu" size={16} color="#4CAF50" />
              <Text style={styles.recipeButtonText}>Get Recipe</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        <AnimatedCard
          animationType="slide"
          slideDirection="up"
          delay={500}
          style={styles.mealCard}
        >
          <TouchableOpacity style={styles.mealContent} onPress={() => router.push('/meal/snacks')}>
            <Text style={styles.mealEmoji}>🍌</Text>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>Snacks</Text>
              <Text style={styles.mealCalories}>
                {state.dailyProgress ?
                  `${state.dailyProgress.nutrition?.meals?.filter(m => m.mealType === 'snacks').length || 0} items logged` :
                  getMealCalorieRecommendation('snacks')
                }
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push('/meal/snacks');
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </TouchableOpacity>
          <View style={styles.mealActions}>
            <TouchableOpacity
              style={styles.recipeButton}
              onPress={() => router.push('/recipes?mealType=snacks')}
            >
              <MaterialIcons name="restaurant-menu" size={16} color="#4CAF50" />
              <Text style={styles.recipeButtonText}>Get Recipe</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        {/* Intermittent Fasting Card */}
        <View style={styles.fastingCard}>
          <View style={styles.fastingIconCircle}>
            <View style={styles.fastingTimerCircle}>
              <MaterialIcons name="schedule" size={24} color="#E91E63" />
            </View>
          </View>
          <Text style={styles.fastingTitle}>Intermittent Fasting</Text>
          <Text style={styles.fastingDescription}>
            Choose a fasting interval that fits your lifestyle to manage your weight, feel more energized, and even put an end to late-night snacking.
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/intermittent-fasting')}
            activeOpacity={0.8}
          >
            <Text style={styles.exploreButtonText}>EXPLORE NOW</Text>
            <MaterialIcons name="arrow-forward" size={18} color="white" style={styles.exploreButtonIcon} />
          </TouchableOpacity>
        </View>

        {/* Dynamic Exercise Card */}
        <ExerciseCard />

        {/* Achievement/Streak Cards */}
        {state.dashboardData?.streaks && (
          <View style={styles.streaksContainer}>
            <Text style={styles.streaksTitle}>Your Streaks 🔥</Text>
            <View style={styles.streaksRow}>
              <View style={styles.streakCard}>
                <MaterialIcons name="restaurant" size={20} color="#4CAF50" />
                <Text style={styles.streakNumber}>{state.dashboardData.streaks.logging}</Text>
                <Text style={styles.streakLabel}>Logging</Text>
              </View>
              <View style={styles.streakCard}>
                <MaterialIcons name="fitness-center" size={20} color="#FF5722" />
                <Text style={styles.streakNumber}>{state.dashboardData.streaks.exercise}</Text>
                <Text style={styles.streakLabel}>Exercise</Text>
              </View>
              <View style={styles.streakCard}>
                <MaterialIcons name="local-drink" size={20} color="#2196F3" />
                <Text style={styles.streakNumber}>{state.dashboardData.streaks.waterGoal}</Text>
                <Text style={styles.streakLabel}>Hydration</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  gradientHeader: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  calorieTrackerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  quickStatText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  macrosCardContainer: {
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
  },
  waterCardContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  streaksContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  streaksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  streaksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakCard: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    minWidth: 80,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  mealCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mealContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  mealEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#F1F8E9',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  fastingCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  fastingIconCircle: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastingTimerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCE4EC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#E91E63',
  },
  fastingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  fastingDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 8,
  },
  exploreButtonIcon: {
    marginLeft: 4,
  },
  mealActions: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  recipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F8E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  recipeButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
});
