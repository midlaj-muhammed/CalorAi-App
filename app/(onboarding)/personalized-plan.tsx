import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, PixelRatio } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { AnimatedButton } from '../../components/animated/AnimatedButton';
import { AnimatedCard } from '../../components/animated/AnimatedCard';
import { AnimatedProgressBar } from '../../components/animated/AnimatedProgressBar';
import { useFadeAnimation, useScaleAnimation } from '../../hooks/useAnimations';
import { useOnboarding, CalorieCalculationResult } from '../../contexts/OnboardingContext';
import { calculatePersonalizedCalories } from '../../services/aiCalorieService';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive utility functions
const getResponsiveSize = (baseSize: number) => {
  const scale = screenWidth / 375;
  return Math.round(baseSize * Math.min(Math.max(scale, 0.85), 1.2));
};

const getResponsiveFontSize = (baseSize: number) => {
  const scale = screenWidth / 375;
  const pixelRatio = PixelRatio.get();
  return Math.round(baseSize * Math.min(Math.max(scale, 0.9), 1.15) * Math.min(pixelRatio / 2, 1.1));
};

// Loading skeleton component
const SkeletonLoader = () => (
  <View style={styles.skeletonContainer}>
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonCircle} />
      <View style={styles.skeletonLine} />
      <View style={styles.skeletonLineShort} />
    </View>
  </View>
);

// Simple circular progress indicator
const CircularProgress = ({
  percentage,
  size = 120,
  color = '#4CAF50'
}: {
  percentage: number;
  size?: number;
  color?: string;
}) => {
  return (
    <View style={[styles.circularProgress, { width: size, height: size }]}>
      <View style={[styles.progressBackground, {
        width: size,
        height: size,
        borderRadius: size / 2
      }]}>
        <View style={[styles.progressFill, {
          width: size * 0.8,
          height: size * 0.8,
          borderRadius: (size * 0.8) / 2,
          backgroundColor: color
        }]}>
          <Text style={[styles.progressText, { fontSize: getResponsiveFontSize(14) }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function PersonalizedPlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, updateCalorieResults, completeOnboarding } = useOnboarding();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [calorieData, setCalorieData] = useState<CalorieCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Animation hooks
  const { fadeIn: fadeInHeader, animatedStyle: headerFadeStyle } = useFadeAnimation(0);
  const { fadeIn: fadeInContent, animatedStyle: contentFadeStyle } = useFadeAnimation(0);
  const { fadeIn: fadeInButtons, animatedStyle: buttonsFadeStyle } = useFadeAnimation(0);
  const { scaleIn: scaleInCards, animatedStyle: cardsScaleStyle } = useScaleAnimation(0.8);

  // Calculate personalized calories on component mount
  useEffect(() => {
    calculateCalories();
  }, []);

  const calculateCalories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await calculatePersonalizedCalories(data);
      setCalorieData(result);
      await updateCalorieResults(result);

      // Start animations after data is loaded - fast appearance
      setTimeout(() => {
        fadeInHeader(50);
        fadeInContent(100);
        scaleInCards(150);
        fadeInButtons(200);
      }, 100);

    } catch (err) {
      console.error('Error calculating calories:', err);
      setError('Unable to calculate your personalized plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      await completeOnboarding();
      console.log('✅ Onboarding completed successfully');
      // Navigate to sign-up for authentication
      router.replace('/(auth)/sign-up');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      // Still navigate to sign-up even if there's an error
      router.replace('/(auth)/sign-up');
    }
  };

  const handleRecalculate = () => {
    calculateCalories();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#E8F5E8', '#F0F9F0', '#FFFFFF']}
          style={styles.gradient}
        >
          <View style={[styles.content, { 
            paddingTop: Math.max(getResponsiveSize(60), insets.top + 20),
            paddingBottom: Math.max(getResponsiveSize(40), insets.bottom + 20),
          }]}>
            <View style={styles.loadingContainer}>
              <View style={styles.loadingIcon}>
                <MaterialIcons name="calculate" size={48} color="#4CAF50" />
              </View>
              <Text style={styles.loadingTitle}>Creating Your Personalized Plan</Text>
              <Text style={styles.loadingSubtitle}>
                Our AI is analyzing your profile to create the perfect nutrition plan for you...
              </Text>
              <SkeletonLoader />
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error || !calorieData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#E8F5E8', '#F0F9F0', '#FFFFFF']}
          style={styles.gradient}
        >
          <View style={[styles.content, { 
            paddingTop: Math.max(getResponsiveSize(60), insets.top + 20),
            paddingBottom: Math.max(getResponsiveSize(40), insets.bottom + 20),
          }]}>
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={64} color="#FF5722" />
              <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <AnimatedButton
                title="Try Again"
                onPress={handleRecalculate}
                style={styles.retryButton}
                animationType="scale"
                hapticFeedback={true}
              />
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#E8F5E8', '#F0F9F0', '#FFFFFF']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: Math.max(getResponsiveSize(20), insets.top + 10),
            paddingBottom: Math.max(getResponsiveSize(100), insets.bottom + 80),
          }}
        >
          {/* Header Section */}
          <Animated.View style={[styles.header, headerFadeStyle]}>
            <View style={styles.celebrationIcon}>
              <MaterialIcons name="celebration" size={32} color="#4CAF50" />
            </View>
            <Text style={[styles.title, { fontSize: getResponsiveFontSize(28) }]}>
              Your Personalized Plan is Ready! 🎉
            </Text>
            <Text style={[styles.subtitle, { fontSize: getResponsiveFontSize(16) }]}>
              Based on your profile, here's your custom nutrition plan
            </Text>
          </Animated.View>

          {/* Progress Bar */}
          <Animated.View style={[styles.progressContainer, headerFadeStyle]}>
            <AnimatedProgressBar 
              progress={1} 
              animated={true}
              color="#4CAF50"
              backgroundColor="#E0E0E0"
              height={6}
            />
            <Text style={[styles.progressText, { fontSize: getResponsiveFontSize(14) }]}>
              5 of 6 - Almost Done!
            </Text>
          </Animated.View>

          {/* Main Calorie Goal Card */}
          <View style={styles.mainCalorieCard}>
            <View style={styles.calorieHeader}>
              <View style={styles.calorieIcon}>
                <MaterialIcons name="local-fire-department" size={32} color="#4CAF50" />
              </View>
              <View style={styles.calorieInfo}>
                <Text style={[styles.calorieLabel, { fontSize: getResponsiveFontSize(16) }]}>
                  Daily Calorie Goal
                </Text>
                <Text style={[styles.calorieValue, { fontSize: getResponsiveFontSize(36) }]}>
                  {calorieData.dailyCalorieGoal}
                </Text>
                <Text style={[styles.calorieUnit, { fontSize: getResponsiveFontSize(14) }]}>
                  calories
                </Text>
              </View>
              <CircularProgress
                percentage={85}
                size={getResponsiveSize(80)}
                strokeWidth={6}
              />
            </View>

            <View style={styles.methodBadge}>
              <MaterialIcons
                name={calorieData.calculationMethod === 'ai' ? 'psychology' : 'calculate'}
                size={16}
                color="#4CAF50"
              />
              <Text style={styles.methodText}>
                {calorieData.calculationMethod === 'ai' ? 'AI-Powered' : 'Science-Based'}
              </Text>
            </View>
          </View>

          {/* Metrics Cards */}
          <Animated.View style={[styles.metricsContainer, contentFadeStyle]}>
            <AnimatedCard
              animationType="slide"
              slideDirection="left"
              delay={600}
              style={styles.metricCard}
            >
              <MaterialIcons name="speed" size={24} color="#4CAF50" />
              <Text style={[styles.metricLabel, { fontSize: getResponsiveFontSize(14) }]}>BMR</Text>
              <Text style={[styles.metricValue, { fontSize: getResponsiveFontSize(20) }]}>
                {calorieData.bmr}
              </Text>
              <Text style={[styles.metricUnit, { fontSize: getResponsiveFontSize(12) }]}>cal/day</Text>
            </AnimatedCard>

            <AnimatedCard
              animationType="slide"
              slideDirection="right"
              delay={700}
              style={styles.metricCard}
            >
              <MaterialIcons name="fitness-center" size={24} color="#4CAF50" />
              <Text style={[styles.metricLabel, { fontSize: getResponsiveFontSize(14) }]}>TDEE</Text>
              <Text style={[styles.metricValue, { fontSize: getResponsiveFontSize(20) }]}>
                {calorieData.tdee}
              </Text>
              <Text style={[styles.metricUnit, { fontSize: getResponsiveFontSize(12) }]}>cal/day</Text>
            </AnimatedCard>
          </Animated.View>

          {/* Macro Breakdown */}
          <Animated.View style={[contentFadeStyle]}>
            <AnimatedCard
              animationType="slide"
              slideDirection="up"
              delay={800}
              style={styles.macroCard}
            >
              <View style={styles.macroHeader}>
                <MaterialIcons name="pie-chart" size={24} color="#4CAF50" />
                <Text style={[styles.macroTitle, { fontSize: getResponsiveFontSize(18) }]}>
                  Macro Breakdown
                </Text>
              </View>

              <View style={styles.macroContainer}>
                <View style={styles.macroItem}>
                  <View style={[styles.macroIndicator, { backgroundColor: '#4CAF50' }]} />
                  <Text style={[styles.macroLabel, { fontSize: getResponsiveFontSize(14) }]}>
                    Protein
                  </Text>
                  <Text style={[styles.macroValue, { fontSize: getResponsiveFontSize(16) }]}>
                    {calorieData.macroBreakdown.protein}%
                  </Text>
                </View>

                <View style={styles.macroItem}>
                  <View style={[styles.macroIndicator, { backgroundColor: '#81C784' }]} />
                  <Text style={[styles.macroLabel, { fontSize: getResponsiveFontSize(14) }]}>
                    Carbs
                  </Text>
                  <Text style={[styles.macroValue, { fontSize: getResponsiveFontSize(16) }]}>
                    {calorieData.macroBreakdown.carbs}%
                  </Text>
                </View>

                <View style={styles.macroItem}>
                  <View style={[styles.macroIndicator, { backgroundColor: '#A5D6A7' }]} />
                  <Text style={[styles.macroLabel, { fontSize: getResponsiveFontSize(14) }]}>
                    Fats
                  </Text>
                  <Text style={[styles.macroValue, { fontSize: getResponsiveFontSize(16) }]}>
                    {calorieData.macroBreakdown.fats}%
                  </Text>
                </View>
              </View>
            </AnimatedCard>
          </Animated.View>

          {/* Timeline Estimate */}
          <Animated.View style={[contentFadeStyle]}>
            <AnimatedCard
              animationType="slide"
              slideDirection="up"
              delay={900}
              style={styles.timelineCard}
            >
              <View style={styles.timelineHeader}>
                <MaterialIcons name="schedule" size={24} color="#4CAF50" />
                <Text style={[styles.timelineTitle, { fontSize: getResponsiveFontSize(18) }]}>
                  Your Journey Timeline
                </Text>
              </View>
              <Text style={[styles.timelineText, { fontSize: getResponsiveFontSize(16) }]}>
                {calorieData.timelineEstimate}
              </Text>
            </AnimatedCard>
          </Animated.View>

          {/* User Summary */}
          <Animated.View style={[contentFadeStyle]}>
            <AnimatedCard
              animationType="slide"
              slideDirection="up"
              delay={1000}
              style={styles.summaryCard}
            >
              <View style={styles.summaryHeader}>
                <MaterialIcons name="person" size={24} color="#4CAF50" />
                <Text style={[styles.summaryTitle, { fontSize: getResponsiveFontSize(18) }]}>
                  Your Profile Summary
                </Text>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { fontSize: getResponsiveFontSize(12) }]}>Goals</Text>
                  <Text style={[styles.summaryValue, { fontSize: getResponsiveFontSize(14) }]}>
                    {data.goals.map(goal => goal.replace('_', ' ')).join(', ')}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { fontSize: getResponsiveFontSize(12) }]}>Activity Level</Text>
                  <Text style={[styles.summaryValue, { fontSize: getResponsiveFontSize(14) }]}>
                    {data.activityLevel.replace('_', ' ')}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { fontSize: getResponsiveFontSize(12) }]}>Current Stats</Text>
                  <Text style={[styles.summaryValue, { fontSize: getResponsiveFontSize(14) }]}>
                    {data.currentWeight} kg, {data.height} cm
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { fontSize: getResponsiveFontSize(12) }]}>Target Weight</Text>
                  <Text style={[styles.summaryValue, { fontSize: getResponsiveFontSize(14) }]}>
                    {data.targetWeight} kg ({data.weeklyGoal} kg/week)
                  </Text>
                </View>
              </View>
            </AnimatedCard>
          </Animated.View>

          {/* Personalized Advice */}
          <Animated.View style={[contentFadeStyle]}>
            <AnimatedCard
              animationType="slide"
              slideDirection="up"
              delay={1100}
              style={styles.adviceCard}
            >
              <View style={styles.adviceHeader}>
                <MaterialIcons name="lightbulb" size={24} color="#4CAF50" />
                <Text style={[styles.adviceTitle, { fontSize: getResponsiveFontSize(18) }]}>
                  Personalized Tips
                </Text>
              </View>

              {calorieData.personalizedAdvice.map((advice, index) => (
                <View key={index} style={styles.adviceItem}>
                  <View style={styles.adviceBullet} />
                  <Text style={[styles.adviceText, { fontSize: getResponsiveFontSize(14) }]}>
                    {advice}
                  </Text>
                </View>
              ))}
            </AnimatedCard>
          </Animated.View>
        </ScrollView>

        {/* Action Buttons */}
        <Animated.View style={[styles.buttonContainer, buttonsFadeStyle, {
          paddingBottom: Math.max(getResponsiveSize(20), insets.bottom + 10),
        }]}>
          <AnimatedButton
            title="Create Account & Start Journey"
            onPress={handleContinue}
            style={[styles.primaryButton, {
              minHeight: Math.max(getResponsiveSize(56), 44),
              borderRadius: getResponsiveSize(28),
            }]}
            animationType="scale"
            hapticFeedback={true}
            accessibilityLabel="Complete onboarding and create your CalorAi account"
          />
          
          <AnimatedButton
            title="Recalculate Plan"
            onPress={handleRecalculate}
            variant="outline"
            style={[styles.secondaryButton, {
              minHeight: Math.max(getResponsiveSize(48), 44),
              borderRadius: getResponsiveSize(24),
            }]}
            animationType="scale"
            hapticFeedback={true}
            accessibilityLabel="Recalculate your personalized plan"
          />
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: getResponsiveSize(24),
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(40),
  },
  loadingIcon: {
    width: getResponsiveSize(80),
    height: getResponsiveSize(80),
    borderRadius: getResponsiveSize(40),
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(24),
  },
  loadingTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: getResponsiveSize(12),
  },
  loadingSubtitle: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(24),
    marginBottom: getResponsiveSize(40),
  },

  // Skeleton loader
  skeletonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  skeletonCard: {
    width: '90%',
    backgroundColor: '#F5F5F5',
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(24),
    alignItems: 'center',
  },
  skeletonCircle: {
    width: getResponsiveSize(80),
    height: getResponsiveSize(80),
    borderRadius: getResponsiveSize(40),
    backgroundColor: '#E0E0E0',
    marginBottom: getResponsiveSize(16),
  },
  skeletonLine: {
    width: '80%',
    height: getResponsiveSize(16),
    backgroundColor: '#E0E0E0',
    borderRadius: getResponsiveSize(8),
    marginBottom: getResponsiveSize(8),
  },
  skeletonLineShort: {
    width: '60%',
    height: getResponsiveSize(12),
    backgroundColor: '#E0E0E0',
    borderRadius: getResponsiveSize(6),
  },

  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(40),
  },
  errorTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: getResponsiveSize(24),
    marginBottom: getResponsiveSize(12),
  },
  errorMessage: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(24),
    marginBottom: getResponsiveSize(32),
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: getResponsiveSize(32),
    paddingVertical: getResponsiveSize(12),
    borderRadius: getResponsiveSize(24),
  },

  // Header
  header: {
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20),
    marginBottom: getResponsiveSize(32),
  },
  celebrationIcon: {
    width: getResponsiveSize(64),
    height: getResponsiveSize(64),
    borderRadius: getResponsiveSize(32),
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(20),
  },
  title: {
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: getResponsiveSize(12),
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    lineHeight: getResponsiveFontSize(24),
  },

  // Progress
  progressContainer: {
    paddingHorizontal: getResponsiveSize(24),
    marginBottom: getResponsiveSize(32),
  },
  progressText: {
    color: '#666',
    textAlign: 'center',
    marginTop: getResponsiveSize(8),
  },

  // Main calorie card
  mainCalorieCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveSize(20),
    padding: getResponsiveSize(24),
    marginBottom: getResponsiveSize(24),
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getResponsiveSize(16),
  },
  calorieIcon: {
    width: getResponsiveSize(48),
    height: getResponsiveSize(48),
    borderRadius: getResponsiveSize(24),
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieInfo: {
    flex: 1,
    marginLeft: getResponsiveSize(16),
  },
  calorieLabel: {
    color: '#666',
    fontWeight: '500',
    marginBottom: getResponsiveSize(4),
  },
  calorieValue: {
    fontWeight: '800',
    color: '#4CAF50',
    marginBottom: getResponsiveSize(2),
  },
  calorieUnit: {
    color: '#999',
    fontWeight: '400',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: getResponsiveSize(12),
    paddingVertical: getResponsiveSize(6),
    borderRadius: getResponsiveSize(16),
    alignSelf: 'flex-start',
  },
  methodText: {
    fontSize: getResponsiveFontSize(12),
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: getResponsiveSize(4),
  },

  // Circular progress
  circularProgress: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.9,
  },
  progressText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Metrics
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getResponsiveSize(32),
    gap: getResponsiveSize(16),
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  metricLabel: {
    color: '#666',
    fontWeight: '500',
    marginTop: getResponsiveSize(8),
    marginBottom: getResponsiveSize(4),
  },
  metricValue: {
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: getResponsiveSize(2),
  },
  metricUnit: {
    color: '#999',
    fontWeight: '400',
  },

  // Buttons
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: getResponsiveSize(24),
    paddingTop: getResponsiveSize(16),
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    gap: getResponsiveSize(12),
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },

  // Macro breakdown
  macroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(20),
    marginBottom: getResponsiveSize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSize(16),
  },
  macroTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: getResponsiveSize(8),
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroIndicator: {
    width: getResponsiveSize(12),
    height: getResponsiveSize(12),
    borderRadius: getResponsiveSize(6),
    marginBottom: getResponsiveSize(8),
  },
  macroLabel: {
    color: '#666',
    fontWeight: '500',
    marginBottom: getResponsiveSize(4),
  },
  macroValue: {
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Timeline
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(20),
    marginBottom: getResponsiveSize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSize(12),
  },
  timelineTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: getResponsiveSize(8),
  },
  timelineText: {
    color: '#666',
    lineHeight: getResponsiveFontSize(24),
  },

  // Advice
  adviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(20),
    marginBottom: getResponsiveSize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSize(16),
  },
  adviceTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: getResponsiveSize(8),
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: getResponsiveSize(12),
  },
  adviceBullet: {
    width: getResponsiveSize(6),
    height: getResponsiveSize(6),
    borderRadius: getResponsiveSize(3),
    backgroundColor: '#4CAF50',
    marginTop: getResponsiveSize(6),
    marginRight: getResponsiveSize(12),
  },
  adviceText: {
    flex: 1,
    color: '#666',
    lineHeight: getResponsiveFontSize(20),
  },

  // Summary
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(20),
    marginBottom: getResponsiveSize(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSize(16),
  },
  summaryTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: getResponsiveSize(8),
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: getResponsiveSize(16),
  },
  summaryLabel: {
    color: '#666',
    fontWeight: '500',
    marginBottom: getResponsiveSize(4),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: '#1A1A1A',
    fontWeight: '600',
    lineHeight: getResponsiveFontSize(20),
    textTransform: 'capitalize',
  },
});
