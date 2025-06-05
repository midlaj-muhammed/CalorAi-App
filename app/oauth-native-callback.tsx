import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useOnboarding } from '../contexts/OnboardingContext';

export default function OAuthCallbackScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: onboardingData, completeOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || onboardingLoading) return;

    // Add a small delay to ensure the OAuth flow is complete
    const timer = setTimeout(async () => {
      if (isSignedIn) {
        // User is authenticated via OAuth
        // If they came from onboarding flow, complete it
        if (!onboardingData.completed && onboardingData.dailyCalorieGoal) {
          await completeOnboarding();
        }

        // Redirect to dashboard
        router.replace('/(tabs)');
      } else {
        // If not signed in, redirect back to auth
        router.replace('/(auth)/sign-in');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isSignedIn, isLoaded, onboardingData.completed, onboardingData.dailyCalorieGoal, onboardingLoading, router]);

  // Show loading screen while processing OAuth callback
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#ffffff'
    }}>
      <ActivityIndicator size="large" color="#4CAF50" />
    </View>
  );
}
