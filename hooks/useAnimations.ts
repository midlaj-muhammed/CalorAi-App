import { useEffect, useRef } from 'react';
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { AccessibilityInfo } from 'react-native';

// Animation configuration constants
export const ANIMATION_CONFIGS = {
  // Timing configurations
  fast: { duration: 200 },
  medium: { duration: 300 },
  slow: { duration: 500 },
  
  // Spring configurations
  gentle: { damping: 20, stiffness: 90 },
  bouncy: { damping: 15, stiffness: 150 },
  snappy: { damping: 25, stiffness: 200 },
  
  // Easing curves
  easeInOut: { duration: 300 },
  easeOut: { duration: 250 },
  easeIn: { duration: 250 },
};

// Hook for fade in/out animations
export const useFadeAnimation = (
  initialValue = 0,
  config = ANIMATION_CONFIGS.medium
) => {
  const opacity = useSharedValue(initialValue);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotionEnabled);
  }, []);

  const fadeIn = (delay = 0) => {
    if (isReducedMotionEnabled) {
      opacity.value = 1;
      return;
    }
    opacity.value = withDelay(delay, withTiming(1, config));
  };

  const fadeOut = (delay = 0) => {
    if (isReducedMotionEnabled) {
      opacity.value = 0;
      return;
    }
    opacity.value = withDelay(delay, withTiming(0, config));
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { fadeIn, fadeOut, animatedStyle, opacity };
};

// Hook for scale animations
export const useScaleAnimation = (
  initialValue = 1,
  config = ANIMATION_CONFIGS.gentle
) => {
  const scale = useSharedValue(initialValue);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotionEnabled);
  }, []);

  const scaleIn = (delay = 0) => {
    if (isReducedMotionEnabled) {
      scale.value = 1;
      return;
    }
    scale.value = withDelay(delay, withSpring(1, config));
  };

  const scaleOut = (delay = 0) => {
    if (isReducedMotionEnabled) {
      scale.value = 0;
      return;
    }
    scale.value = withDelay(delay, withSpring(0, config));
  };

  const pulse = () => {
    if (isReducedMotionEnabled) return;
    scale.value = withSequence(
      withSpring(1.05, ANIMATION_CONFIGS.fast),
      withSpring(1, ANIMATION_CONFIGS.fast)
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { scaleIn, scaleOut, pulse, animatedStyle, scale };
};

// Hook for slide animations
export const useSlideAnimation = (
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance = 50,
  config = ANIMATION_CONFIGS.medium
) => {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'up' ? distance : direction === 'down' ? -distance : 0);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotionEnabled);
  }, []);

  const slideIn = (delay = 0) => {
    if (isReducedMotionEnabled) {
      translateX.value = 0;
      translateY.value = 0;
      return;
    }
    translateX.value = withDelay(delay, withTiming(0, config));
    translateY.value = withDelay(delay, withTiming(0, config));
  };

  const slideOut = (delay = 0) => {
    if (isReducedMotionEnabled) {
      translateX.value = direction === 'left' ? -distance : direction === 'right' ? distance : 0;
      translateY.value = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
      return;
    }
    translateX.value = withDelay(delay, withTiming(
      direction === 'left' ? -distance : direction === 'right' ? distance : 0, 
      config
    ));
    translateY.value = withDelay(delay, withTiming(
      direction === 'up' ? distance : direction === 'down' ? -distance : 0, 
      config
    ));
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return { slideIn, slideOut, animatedStyle, translateX, translateY };
};

// Hook for rotation animations
export const useRotationAnimation = (
  config = ANIMATION_CONFIGS.medium
) => {
  const rotation = useSharedValue(0);
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotionEnabled);
  }, []);

  const rotate = (degrees: number, delay = 0) => {
    if (isReducedMotionEnabled) {
      rotation.value = degrees;
      return;
    }
    rotation.value = withDelay(delay, withTiming(degrees, config));
  };

  const spin = () => {
    if (isReducedMotionEnabled) return;
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return { rotate, spin, animatedStyle, rotation };
};

// Hook for staggered list animations
export const useStaggeredAnimation = (
  itemCount: number,
  staggerDelay = 100,
  config = ANIMATION_CONFIGS.medium
) => {
  const animations = useRef(
    Array.from({ length: itemCount }, () => ({
      opacity: useSharedValue(0),
      translateY: useSharedValue(30),
    }))
  ).current;

  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReducedMotionEnabled);
  }, []);

  const animateIn = () => {
    animations.forEach((anim, index) => {
      if (isReducedMotionEnabled) {
        anim.opacity.value = 1;
        anim.translateY.value = 0;
        return;
      }
      
      const delay = index * staggerDelay;
      anim.opacity.value = withDelay(delay, withTiming(1, config));
      anim.translateY.value = withDelay(delay, withTiming(0, config));
    });
  };

  const getAnimatedStyle = (index: number) => {
    if (index >= animations.length) return {};
    
    return useAnimatedStyle(() => ({
      opacity: animations[index].opacity.value,
      transform: [{ translateY: animations[index].translateY.value }],
    }));
  };

  return { animateIn, getAnimatedStyle };
};

// Import useState
import { useState } from 'react';
