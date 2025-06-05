import React, { useEffect } from 'react';
import { Modal, View, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ANIMATION_CONFIGS } from '../../hooks/useAnimations';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnimatedModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'scale';
  position?: 'bottom' | 'center' | 'top';
  closeOnBackdropPress?: boolean;
  backdropOpacity?: number;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  visible,
  onClose,
  children,
  animationType = 'slide',
  position = 'bottom',
  closeOnBackdropPress = true,
  backdropOpacity = 0.5,
}) => {
  const insets = useSafeAreaInsets();
  
  const backdropOpacityValue = useSharedValue(0);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const animateIn = () => {
    backdropOpacityValue.value = withTiming(backdropOpacity, ANIMATION_CONFIGS.medium);
    
    switch (animationType) {
      case 'slide':
        translateY.value = withSpring(0, ANIMATION_CONFIGS.gentle);
        break;
      case 'scale':
        scale.value = withSpring(1, ANIMATION_CONFIGS.bouncy);
        opacity.value = withTiming(1, ANIMATION_CONFIGS.medium);
        break;
      case 'fade':
        opacity.value = withTiming(1, ANIMATION_CONFIGS.medium);
        break;
    }
  };

  const animateOut = (callback?: () => void) => {
    backdropOpacityValue.value = withTiming(0, ANIMATION_CONFIGS.fast);
    
    switch (animationType) {
      case 'slide':
        translateY.value = withTiming(SCREEN_HEIGHT, ANIMATION_CONFIGS.medium, () => {
          if (callback) runOnJS(callback)();
        });
        break;
      case 'scale':
        scale.value = withTiming(0.8, ANIMATION_CONFIGS.fast);
        opacity.value = withTiming(0, ANIMATION_CONFIGS.fast, () => {
          if (callback) runOnJS(callback)();
        });
        break;
      case 'fade':
        opacity.value = withTiming(0, ANIMATION_CONFIGS.fast, () => {
          if (callback) runOnJS(callback)();
        });
        break;
    }
  };

  useEffect(() => {
    if (visible) {
      // Reset values for slide animation
      if (animationType === 'slide') {
        translateY.value = SCREEN_HEIGHT;
      }
      if (animationType === 'scale') {
        scale.value = 0.8;
        opacity.value = 0;
      }
      if (animationType === 'fade') {
        opacity.value = 0;
      }
      
      animateIn();
    } else {
      animateOut();
    }
  }, [visible, animationType]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacityValue.value,
  }));

  const contentStyle = useAnimatedStyle(() => {
    const baseStyle: any = {};
    
    switch (animationType) {
      case 'slide':
        baseStyle.transform = [{ translateY: translateY.value }];
        break;
      case 'scale':
        baseStyle.transform = [{ scale: scale.value }];
        baseStyle.opacity = opacity.value;
        break;
      case 'fade':
        baseStyle.opacity = opacity.value;
        break;
    }
    
    return baseStyle;
  });

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const getContentContainerStyle = () => {
    switch (position) {
      case 'top':
        return [styles.contentContainer, styles.topPosition, { paddingTop: insets.top }];
      case 'center':
        return [styles.contentContainer, styles.centerPosition];
      case 'bottom':
      default:
        return [styles.contentContainer, styles.bottomPosition, { paddingBottom: insets.bottom }];
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </TouchableWithoutFeedback>
        
        <Animated.View style={[getContentContainerStyle(), contentStyle]}>
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  contentContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  topPosition: {
    top: 0,
    justifyContent: 'flex-start',
  },
  centerPosition: {
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bottomPosition: {
    bottom: 0,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 100,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
});
