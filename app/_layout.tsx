import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { NutritionProvider } from '../contexts/NutritionContext';
import { ProgressProvider } from '../contexts/ProgressContext';
import { FoodScanProvider } from '../contexts/FoodScanContext';
import { RecipeProvider } from '../contexts/RecipeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { OnboardingProvider } from '../contexts/OnboardingContext';
import { SupabaseProvider } from '../contexts/SupabaseContext';
import { debugPlatform, forceMobile } from '../utils/platformUtils';
import ErrorBoundary from '../components/ErrorBoundary';
import SafeAppWrapper from '../components/SafeAppWrapper';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Get Clerk publishable key from environment or app.json extra config
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  require('../app.json').expo.extra.clerkPublishableKey;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env or app.json extra config'
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Debug platform information
    debugPlatform();

    // Force mobile behaviors if on web
    if (Platform.OS === 'web') {
      forceMobile.disableWebBehaviors();
      forceMobile.setMobileViewport();
    }

    // Hide splash screen after a short delay to ensure smooth transition
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAppWrapper>
      <ErrorBoundary>
        <ClerkProvider publishableKey={publishableKey}>
          <SupabaseProvider>
            <OnboardingProvider>
              <NotificationProvider>
                <NutritionProvider>
                <ProgressProvider>
                  <FoodScanProvider>
                    <RecipeProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <SafeAreaProvider>
                        <PaperProvider>
                          <Stack
                            screenOptions={{
                              headerShown: false,
                              animation: 'slide_from_right',
                              animationDuration: 300,
                            }}
                          >
                            <Stack.Screen
                              name="(onboarding)"
                              options={{
                                headerShown: false,
                                animation: 'fade',
                              }}
                            />
                            <Stack.Screen
                              name="(auth)"
                              options={{
                                headerShown: false,
                                animation: 'slide_from_bottom',
                              }}
                            />
                            <Stack.Screen
                              name="(tabs)"
                              options={{
                                headerShown: false,
                                animation: 'fade',
                              }}
                            />
                            <Stack.Screen
                              name="oauth-native-callback"
                              options={{
                                headerShown: false,
                                animation: 'fade',
                              }}
                            />
                          </Stack>
                          <StatusBar style="auto" />
                        </PaperProvider>
                      </SafeAreaProvider>
                    </GestureHandlerRootView>
                    </RecipeProvider>
                  </FoodScanProvider>
                </ProgressProvider>
                </NutritionProvider>
              </NotificationProvider>
            </OnboardingProvider>
          </SupabaseProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </SafeAppWrapper>
  );
}
