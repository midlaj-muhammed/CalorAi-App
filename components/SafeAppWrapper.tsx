import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface SafeAppWrapperProps {
  children: React.ReactNode;
}

interface InitializationState {
  isReady: boolean;
  error: string | null;
  isLoading: boolean;
}

export const SafeAppWrapper: React.FC<SafeAppWrapperProps> = ({ children }) => {
  const [state, setState] = useState<InitializationState>({
    isReady: false,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Prevent auto-hiding splash screen
      await SplashScreen.preventAutoHideAsync();

      // Platform-specific initialization
      if (Platform.OS === 'android') {
        // Android-specific initialization
        console.log('🤖 Initializing Android app...');
      } else if (Platform.OS === 'ios') {
        // iOS-specific initialization
        console.log('🍎 Initializing iOS app...');
      } else if (Platform.OS === 'web') {
        // Web-specific initialization
        console.log('🌐 Initializing Web app...');
      }

      // Validate environment
      const envValidation = validateEnvironment();
      if (!envValidation.isValid) {
        console.warn('Environment validation warnings:', envValidation.warnings);
      }

      // Small delay to ensure everything is loaded
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState({
        isReady: true,
        error: null,
        isLoading: false,
      });

      // Hide splash screen
      await SplashScreen.hideAsync();
    } catch (error) {
      console.error('App initialization error:', error);
      setState({
        isReady: false,
        error: error instanceof Error ? error.message : 'Unknown initialization error',
        isLoading: false,
      });

      // Still hide splash screen even on error
      try {
        await SplashScreen.hideAsync();
      } catch (splashError) {
        console.error('Failed to hide splash screen:', splashError);
      }
    }
  };

  const validateEnvironment = () => {
    const warnings: string[] = [];
    let isValid = true;

    // Check Clerk key
    const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!clerkKey) {
      warnings.push('Clerk publishable key not found in environment');
    }

    // Check Supabase config
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      warnings.push('Supabase configuration not found in environment');
    }

    // Check Gemini API key
    const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!geminiKey) {
      warnings.push('Gemini API key not found in environment');
    }

    return { isValid, warnings };
  };

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Initializing CalorAi...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorMessage}>{state.error}</Text>
        <Text style={styles.errorHint}>
          Please check your app configuration and try restarting the app.
        </Text>
      </View>
    );
  }

  if (!state.isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E74C3C',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  errorHint: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SafeAppWrapper;
