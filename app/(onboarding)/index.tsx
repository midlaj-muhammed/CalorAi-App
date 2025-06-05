import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/(onboarding)/welcome');
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      <View style={styles.container}>
        <LinearGradient
          colors={['#4CAF50', '#66BB6A', '#81C784']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Background Pattern */}
          <View style={styles.backgroundPattern}>
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />
            <View style={[styles.circle, styles.circle3]} />
          </View>

          <SafeAreaView style={styles.safeArea}>
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Logo Section */}
              <Animated.View
                style={[
                  styles.logoSection,
                  {
                    transform: [{ scale: logoScaleAnim }]
                  }
                ]}
              >
                <View style={styles.logoContainer}>
                  <Text style={styles.logoText}>CalorAi</Text>
                  <Text style={styles.logoSubtext}>®</Text>
                </View>
              </Animated.View>

              {/* Main Content */}
              <View style={styles.mainContent}>
                <Text style={styles.welcomeText}>Welcome to</Text>
                <Text style={styles.title}>Smart Nutrition{'\n'}Tracking</Text>
                <Text style={styles.subtitle}>
                  AI-powered calorie tracking that learns{'\n'}
                  from your habits and helps you reach{'\n'}
                  your health goals effortlessly.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonSection}>
                <PrimaryButton
                  title="Get Started"
                  onPress={handleGetStarted}
                  style={styles.primaryButton}
                  textStyle={styles.primaryButtonText}
                />
                <PrimaryButton
                  title="I Already Have an Account"
                  onPress={handleSignIn}
                  variant="outline"
                  style={styles.secondaryButton}
                  textStyle={styles.secondaryButtonText}
                />
              </View>

              {/* Bottom Indicator */}
              <View style={styles.bottomIndicator}>
                <View style={styles.indicator} />
              </View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.3,
    right: -30,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -1,
    fontFamily: 'System',
  },
  logoSubtext: {
    fontSize: 16,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 2,
  },
  mainContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  buttonSection: {
    paddingHorizontal: 8,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    height: 56,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#4CAF50',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    borderRadius: 28,
    height: 56,
    marginBottom: 0,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  bottomIndicator: {
    alignItems: 'center',
    marginTop: 20,
  },
  indicator: {
    width: 134,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
  },
});
