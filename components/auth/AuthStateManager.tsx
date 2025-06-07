import React, { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useOnboarding } from '../../contexts/OnboardingContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AuthStateManagerProps {
  children: React.ReactNode;
}

const AUTH_STATE_KEY = '@calorAi_auth_state';
const ONBOARDING_COMPLETED_KEY = '@calorAi_onboarding_completed';

export function AuthStateManager({ children }: AuthStateManagerProps) {
  const { isLoaded, isSignedIn, user } = useAuth();
  const { data: onboardingData, isLoading: onboardingLoading, getCurrentStep, loadOnboardingData } = useOnboarding();
  const router = useRouter();
  const segments = useSegments();

  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authStateLoaded, setAuthStateLoaded] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  // Initialize auth state and load persisted data
  useEffect(() => {
    const initializeAuthState = async () => {
      try {
        console.log('🔄 Initializing auth state...');

        // Load persisted auth state and onboarding completion status
        const [persistedAuthState, persistedOnboardingCompleted] = await AsyncStorage.multiGet([
          AUTH_STATE_KEY,
          ONBOARDING_COMPLETED_KEY
        ]);

        let hasPersistedAuth = false;
        let hasPersistedOnboarding = false;

        if (persistedAuthState[1]) {
          try {
            const authState = JSON.parse(persistedAuthState[1]);
            console.log('📱 Restored persisted auth state:', authState);
            hasPersistedAuth = true;
          } catch (parseError) {
            console.warn('⚠️ Failed to parse persisted auth state, clearing it');
            await AsyncStorage.removeItem(AUTH_STATE_KEY);
          }
        }

        if (persistedOnboardingCompleted[1]) {
          try {
            const onboardingCompleted = JSON.parse(persistedOnboardingCompleted[1]);
            console.log('📱 Restored persisted onboarding status:', onboardingCompleted);
            hasPersistedOnboarding = onboardingCompleted === true;

            // Load onboarding data to sync with persisted state
            await loadOnboardingData();
          } catch (parseError) {
            console.warn('⚠️ Failed to parse persisted onboarding state, clearing it');
            await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
          }
        }

        // If user has completed onboarding and has auth state, they should go to dashboard
        if (hasPersistedAuth && hasPersistedOnboarding) {
          console.log('🎯 User has completed onboarding and has auth state - ready for dashboard');
        }

        setAuthStateLoaded(true);
        setIsInitializing(false);
        console.log('✅ Auth state initialization complete');
      } catch (error) {
        console.error('❌ Error initializing auth state:', error);
        setIsInitializing(false);
        setAuthStateLoaded(true);
      }
    };

    initializeAuthState();
  }, [loadOnboardingData]);

  // Persist auth state when it changes
  useEffect(() => {
    const persistAuthState = async () => {
      if (!isLoaded || !authStateLoaded) return;

      try {
        if (isSignedIn && user?.id) {
          // User is signed in, persist auth state
          const authState = {
            isSignedIn,
            userId: user.id,
            timestamp: Date.now(),
          };

          await AsyncStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authState));
          console.log('💾 Auth state persisted:', authState);
        } else {
          // User is signed out, clear auth state
          await AsyncStorage.removeItem(AUTH_STATE_KEY);
          console.log('🗑️ Auth state cleared from storage');
        }
      } catch (error) {
        console.error('❌ Error persisting auth state:', error);
      }
    };

    persistAuthState();
  }, [isLoaded, isSignedIn, user?.id, authStateLoaded]);

  // Persist onboarding completion status
  useEffect(() => {
    const persistOnboardingState = async () => {
      if (!authStateLoaded || onboardingLoading) return;

      try {
        await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, JSON.stringify(onboardingData.completed));
        console.log('💾 Onboarding completion persisted:', onboardingData.completed);
      } catch (error) {
        console.error('❌ Error persisting onboarding state:', error);
      }
    };

    persistOnboardingState();
  }, [onboardingData.completed, authStateLoaded, onboardingLoading]);

  // Main navigation logic - simplified approach
  useEffect(() => {
    if (!isLoaded || onboardingLoading || isNavigating || isInitializing || !authStateLoaded) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inIndexRoute = segments.length === 0;

    // Only navigate once per state change
    const navigationKey = `${isSignedIn}-${onboardingData.completed}-${segments.join('/')}`;

    // Prevent navigation loops
    setIsNavigating(true);

    const handleNavigation = async () => {
      try {
        console.log('🔄 Handling navigation...', {
          isSignedIn,
          onboardingCompleted: onboardingData.completed,
          currentSegments: segments,
          inAuthGroup,
          inOnboardingGroup,
          inTabsGroup,
          inIndexRoute,
          navigationKey
        });

        // Check persisted onboarding completion status
        const persistedOnboardingCompleted = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        const isOnboardingCompleted = persistedOnboardingCompleted ? JSON.parse(persistedOnboardingCompleted) : onboardingData.completed;

        console.log('🔍 Navigation decision factors:', {
          isSignedIn,
          onboardingDataCompleted: onboardingData.completed,
          persistedOnboardingCompleted: isOnboardingCompleted,
          inAuthGroup,
          inOnboardingGroup,
          inTabsGroup,
          inIndexRoute
        });

        // Priority 1: If user signed in and onboarding completed (either from context or persisted), go to dashboard
        if (isSignedIn && (onboardingData.completed || isOnboardingCompleted) && !inTabsGroup && !inIndexRoute) {
          console.log('🔄 Redirecting to dashboard - user authenticated and onboarded');
          router.replace('/(tabs)');
          return;
        }

        // Priority 2: If user completed onboarding but not signed in, go to sign-in
        if (!isSignedIn && (onboardingData.completed || isOnboardingCompleted) && !inAuthGroup) {
          console.log('🔄 Redirecting to sign-in - onboarding completed but user not authenticated');
          router.replace('/(auth)/sign-in');
          return;
        }

        // Priority 3: If user not signed in and onboarding not completed, go to onboarding
        if (!isSignedIn && !onboardingData.completed && !isOnboardingCompleted && !inOnboardingGroup && !inIndexRoute) {
          console.log('🔄 Redirecting to onboarding - user not signed in and onboarding incomplete');
          router.replace('/(onboarding)/welcome');
          return;
        }

        // If user signed in but onboarding not completed, continue onboarding
        if (isSignedIn && !onboardingData.completed && !inOnboardingGroup && !inIndexRoute) {
          const currentStep = getCurrentStep();
          console.log(`🔄 User authenticated but onboarding incomplete, current step: ${currentStep}`);

          if (currentStep === 'completed') {
            router.replace('/(tabs)');
          } else {
            const stepRoutes = {
              welcome: '/(onboarding)/welcome',
              'activity-level': '/(onboarding)/activity-level',
              'personal-info': '/(onboarding)/personal-info',
              'target-weight': '/(onboarding)/target-weight',
              'personalized-plan': '/(onboarding)/personalized-plan',
            };
            const targetRoute = stepRoutes[currentStep as keyof typeof stepRoutes] || '/(onboarding)/welcome';
            console.log(`🔄 Redirecting to ${targetRoute} - resuming onboarding at step: ${currentStep}`);
            router.replace(targetRoute);
          }
          return;
        }

      } catch (error) {
        console.error('❌ Navigation error:', error);
        // Fallback to safe route
        if (!isSignedIn) {
          if (onboardingData.completed) {
            router.replace('/(auth)/sign-in');
          } else {
            router.replace('/(onboarding)/welcome');
          }
        } else {
          router.replace('/(tabs)');
        }
      } finally {
        // Add a small delay to prevent rapid navigation
        setTimeout(() => {
          setIsNavigating(false);
        }, 500);
      }
    };

    // Add a small delay before navigation to prevent rapid calls
    const timer = setTimeout(handleNavigation, 100);
    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, onboardingData.completed, onboardingLoading, segments, isNavigating, isInitializing, authStateLoaded]);

  // Show loading state while determining auth state
  if (!isLoaded || onboardingLoading || isInitializing || !authStateLoaded) {
    return (
      <LinearGradient
        colors={['#4CAF50', '#8BC34A', '#CDDC39']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  return <>{children}</>;
}
