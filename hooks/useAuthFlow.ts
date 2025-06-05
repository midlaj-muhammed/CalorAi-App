import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';

export const useAuthFlow = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      // User is authenticated, redirect to dashboard
      // Use replace to prevent going back to auth screens
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded, router]);

  return {
    isSignedIn,
    isLoaded,
    redirectToDashboard: () => {
      router.replace('/(tabs)');
    }
  };
};
