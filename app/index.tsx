import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useOnboarding } from '../contexts/OnboardingContext';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay
} from 'react-native-reanimated';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: onboardingData, isLoading: onboardingLoading, getCurrentStep } = useOnboarding();
  const router = useRouter();

  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const spinnerRotation = useSharedValue(0);

  useEffect(() => {
    // Start animations
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 600 }),
      withTiming(1, { duration: 400 })
    );
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    // Spinner animation
    spinnerRotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (!isLoaded || onboardingLoading) return;

    // Add a small delay for smooth transition
    const timer = setTimeout(() => {
      if (!isSignedIn) {
        // User is not signed in, redirect to onboarding
        console.log('🔄 User not signed in, redirecting to onboarding');
        router.replace('/(onboarding)/welcome');
      } else {
        // User is signed in, check onboarding status
        if (onboardingData.completed) {
          // User is signed in and has completed onboarding
          console.log('🔄 User authenticated and onboarded, redirecting to dashboard');
          router.replace('/(tabs)');
        } else {
          // User is signed in but hasn't completed onboarding
          const currentStep = getCurrentStep();
          console.log(`🔄 User authenticated but onboarding incomplete, current step: ${currentStep}`);

          if (currentStep === 'completed') {
            // Edge case: data says completed but flag is false
            router.replace('/(tabs)');
          } else if (currentStep === 'auth') {
            // User needs to complete authentication (shouldn't happen but handle it)
            router.replace('/(auth)/sign-up');
          } else {
            // User needs to continue onboarding from where they left off
            const stepRoutes = {
              welcome: '/(onboarding)/welcome',
              'activity-level': '/(onboarding)/activity-level',
              'personal-info': '/(onboarding)/personal-info',
              'target-weight': '/(onboarding)/target-weight',
              'personalized-plan': '/(onboarding)/personalized-plan',
            };

            const targetRoute = stepRoutes[currentStep as keyof typeof stepRoutes] || '/(onboarding)/welcome';
            router.replace(targetRoute);
          }
        }
      }
    }, 1500); // Slightly longer delay for better UX

    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, onboardingData.completed, onboardingLoading]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
  }));

  // Show animated loading screen while checking auth status
  return (
    <LinearGradient
      colors={['#4CAF50', '#8BC34A', '#CDDC39']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🥗</Text>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.appName, textAnimatedStyle]}>
          CalorAi
        </Animated.Text>

        <Animated.Text style={[styles.tagline, textAnimatedStyle]}>
          {!isLoaded || onboardingLoading
            ? 'Loading your personalized experience...'
            : 'AI-Powered Calorie Tracking'
          }
        </Animated.Text>

        <Animated.View style={[styles.spinner, spinnerAnimatedStyle]}>
          <View style={styles.spinnerDot} />
          <View style={[styles.spinnerDot, styles.spinnerDot2]} />
          <View style={[styles.spinnerDot, styles.spinnerDot3]} />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 48,
    textAlign: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  spinnerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    top: 0,
    left: 16,
  },
  spinnerDot2: {
    transform: [{ rotate: '120deg' }],
    transformOrigin: '4px 20px',
  },
  spinnerDot3: {
    transform: [{ rotate: '240deg' }],
    transformOrigin: '4px 20px',
  },
});
