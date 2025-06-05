import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useOAuth, useAuth } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '../hooks/useWarmUpBrowser';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { GoogleIconFallback } from './GoogleIconFallback';

// Google Logo SVG Component with fallback
const GoogleIcon = ({ size = 20 }: { size?: number }) => {
  try {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <Path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <Path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <Path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </Svg>
    );
  } catch (error) {
    // Fallback to simple icon if SVG fails
    return <GoogleIconFallback size={size} />;
  }
};

// Animated Spinner Component
const AnimatedSpinner = () => {
  const spinValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => spin());
    };
    spin();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
  );
};

interface GoogleOAuthButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  variant?: 'primary' | 'secondary';
}

export function GoogleOAuthButton({
  onPress,
  disabled = false,
  style,
  variant = 'secondary'
}: GoogleOAuthButtonProps) {
  useWarmUpBrowser();

  const [isLoading, setIsLoading] = React.useState(false);
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = React.useCallback(async () => {
    try {
      setIsLoading(true);

      // Check if user is already signed in
      if (isLoaded && isSignedIn) {
        // User is already signed in, redirect to dashboard
        router.replace('/(tabs)');
        setIsLoading(false);
        return;
      }

      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        // Set the session as active
        await setActive!({ session: createdSessionId });

        // The OAuth flow will automatically redirect to the callback route
        // No need to manually navigate here
      }

      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      console.error('OAuth error', err);

      // More specific error handling
      const errorMessage = err?.errors?.[0]?.message ||
                          err?.message ||
                          'Failed to sign in with Google. Please try again.';

      Alert.alert(
        'Authentication Error',
        errorMessage
      );
    }
  }, [startOAuthFlow, isLoaded, isSignedIn, router]);

  const buttonStyle = variant === 'primary'
    ? [styles.button, styles.primaryButton, style]
    : [styles.button, styles.secondaryButton, style];

  const textStyle = variant === 'primary'
    ? [styles.text, styles.primaryText]
    : [styles.text, styles.secondaryText];

  // Don't render the button if user is already signed in
  if (isLoaded && isSignedIn) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[buttonStyle, (disabled || isLoading) && styles.disabled]}
      onPress={handleGoogleSignIn}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <AnimatedSpinner />
            <Text style={textStyle}>
              Signing in...
            </Text>
          </View>
        ) : (
          <>
            <GoogleIcon size={20} />
            <Text style={textStyle}>
              Continue with Google
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#4285F4',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderTopColor: '#4285F4',
    transform: [{ rotate: '0deg' }],
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#333333',
  },
  disabled: {
    opacity: 0.6,
  },
});
