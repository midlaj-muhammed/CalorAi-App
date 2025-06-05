import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ANIMATION_CONFIGS } from '../../hooks/useAnimations';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  hapticFeedback?: boolean;
  animationType?: 'scale' | 'bounce' | 'press';
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  hapticFeedback = true,
  animationType = 'scale',
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const triggerHaptic = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handlePressIn = () => {
    if (disabled) return;

    runOnJS(triggerHaptic)();

    switch (animationType) {
      case 'scale':
        scale.value = withSpring(0.95, ANIMATION_CONFIGS.fast);
        break;
      case 'bounce':
        scale.value = withSpring(0.9, ANIMATION_CONFIGS.bouncy);
        break;
      case 'press':
        scale.value = withTiming(0.98, ANIMATION_CONFIGS.fast);
        opacity.value = withTiming(0.8, ANIMATION_CONFIGS.fast);
        break;
    }
  };

  const handlePressOut = () => {
    if (disabled) return;

    switch (animationType) {
      case 'scale':
        scale.value = withSpring(1, ANIMATION_CONFIGS.gentle);
        break;
      case 'bounce':
        scale.value = withSpring(1, ANIMATION_CONFIGS.bouncy);
        break;
      case 'press':
        scale.value = withTiming(1, ANIMATION_CONFIGS.fast);
        opacity.value = withTiming(1, ANIMATION_CONFIGS.fast);
        break;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
