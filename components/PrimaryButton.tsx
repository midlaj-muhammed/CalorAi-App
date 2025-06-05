import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  hapticFeedback?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  hapticFeedback = true
}: PrimaryButtonProps) {
  const scale = useSharedValue(1);

  const triggerHaptic = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressIn = () => {
    if (disabled) return;
    runOnJS(triggerHaptic)();
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.secondaryButton, disabled && styles.disabledButton, style];
      case 'outline':
        return [styles.button, styles.outlineButton, disabled && styles.disabledButton, style];
      default:
        return [styles.button, styles.primaryButton, disabled && styles.disabledButton, style];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.text, styles.secondaryText, textStyle];
      case 'outline':
        return [styles.text, styles.outlineText, textStyle];
      default:
        return [styles.text, styles.primaryText, textStyle];
    }
  };

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#E8F5E8',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#4CAF50',
  },
  outlineText: {
    color: '#4CAF50',
  },
});
