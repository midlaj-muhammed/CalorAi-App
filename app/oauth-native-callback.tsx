import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useOnboarding } from '../contexts/OnboardingContext';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STATE_KEY = '@calorAi_auth_state';
const ONBOARDING_COMPLETED_KEY = '@calorAi_onboarding_completed';

export default function OAuthCallbackScreen() {
  const { isSignedIn, isLoaded, user } = useAuth();
  const { data: onboardingData, completeOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!isLoaded || onboardingLoading) return;

      try {
        console.log('🔄 Processing OAuth callback...', {
          isSignedIn,
          userId: user?.id,
          onboardingCompleted: onboardingData.completed
        });

        if (isSignedIn && user?.id) {
          // Persist authentication state
          const authState = {
            isSignedIn,
            userId: user.id,
            timestamp: Date.now(),
          };
          await AsyncStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authState));
          console.log('💾 OAuth auth state persisted:', authState);

          // For new OAuth users, complete onboarding automatically
          if (!onboardingData.completed) {
            console.log('🔄 New OAuth user, completing onboarding...');
            await completeOnboarding();
            await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, JSON.stringify(true));
            console.log('✅ Onboarding completed for OAuth user');
          }

          // Redirect to dashboard
          console.log('🔄 Redirecting to dashboard...');
          router.replace('/(tabs)');
        } else {
          // Authentication failed, redirect to sign-in
          console.log('❌ OAuth authentication failed, redirecting to sign-in');
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('❌ Error processing OAuth callback:', error);
        // Fallback to sign-in on error
        router.replace('/(auth)/sign-in');
      } finally {
        setIsProcessing(false);
      }
    };

    // Add a small delay to ensure smooth transition
    const timer = setTimeout(handleOAuthCallback, 1000);
    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, user?.id, onboardingData.completed, onboardingLoading]);

  return (
    <LinearGradient
      colors={['#4CAF50', '#8BC34A', '#CDDC39']}
      style={styles.container}
    >
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.text}>
          {isProcessing ? 'Completing sign in...' : 'Redirecting...'}
        </Text>
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
  text: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

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
