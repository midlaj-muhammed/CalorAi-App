import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFadeAnimation, useScaleAnimation, useSlideAnimation } from '../../hooks/useAnimations';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  animationType?: 'fade' | 'scale' | 'slide';
  slideDirection?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  onPress?: () => void;
  disabled?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  animationType = 'fade',
  slideDirection = 'up',
  delay = 0,
  onPress,
  disabled = false,
}) => {
  const { fadeIn, animatedStyle: fadeStyle } = useFadeAnimation();
  const { scaleIn, animatedStyle: scaleStyle } = useScaleAnimation();
  const { slideIn, animatedStyle: slideStyle } = useSlideAnimation(slideDirection);

  useEffect(() => {
    switch (animationType) {
      case 'fade':
        fadeIn(delay);
        break;
      case 'scale':
        scaleIn(delay);
        break;
      case 'slide':
        slideIn(delay);
        break;
    }
  }, [animationType, delay]);

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'fade':
        return fadeStyle;
      case 'scale':
        return scaleStyle;
      case 'slide':
        return slideStyle;
      default:
        return fadeStyle;
    }
  };

  const Component = onPress ? Animated.createAnimatedComponent(Animated.View) : Animated.View;

  return (
    <Component
      style={[getAnimatedStyle(), style]}
      onTouchEnd={onPress && !disabled ? onPress : undefined}
    >
      {children}
    </Component>
  );
};
