import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ANIMATION_CONFIGS } from '../../hooks/useAnimations';

interface AnimatedProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
  showGradient?: boolean;
  gradientColors?: string[];
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = '#E0E0E0',
  progressColor = '#4CAF50',
  borderRadius = 4,
  style,
  animated = true,
  showGradient = true,
  gradientColors = ['#4CAF50', '#8BC34A'],
}) => {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      progressValue.value = withSpring(progress, ANIMATION_CONFIGS.gentle);
    } else {
      progressValue.value = progress;
    }
  }, [progress, animated]);

  const progressStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressValue.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    );

    return {
      width: `${width}%`,
    };
  });

  return (
    <View style={[styles.container, { height, backgroundColor, borderRadius }, style]}>
      <Animated.View style={[styles.progress, { borderRadius }, progressStyle]}>
        {showGradient ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradient, { borderRadius }]}
          />
        ) : (
          <View style={[styles.solidProgress, { backgroundColor: progressColor, borderRadius }]} />
        )}
      </Animated.View>
    </View>
  );
};

// Circular progress component
interface AnimatedCircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  children?: React.ReactNode;
}

export const AnimatedCircularProgress: React.FC<AnimatedCircularProgressProps> = ({
  progress,
  size = 100,
  strokeWidth = 8,
  backgroundColor = '#E0E0E0',
  progressColor = '#4CAF50',
  animated = true,
  children,
}) => {
  const progressValue = useSharedValue(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (animated) {
      progressValue.value = withTiming(progress, { duration: 1000 });
    } else {
      progressValue.value = progress;
    }
  }, [progress, animated]);

  const animatedStyle = useAnimatedStyle(() => {
    const strokeDashoffset = circumference * (1 - progressValue.value);
    
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      <Animated.View style={styles.svgContainer}>
        {/* Background circle */}
        <View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: backgroundColor,
            },
          ]}
        />
        
        {/* Progress circle */}
        <Animated.View
          style={[
            styles.progressCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: progressColor,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
            },
            animatedStyle,
          ]}
        />
      </Animated.View>
      
      {children && (
        <View style={styles.circularContent}>
          {children}
        </View>
      )}
    </View>
  );
};

// Multi-segment progress bar
interface AnimatedMultiProgressProps {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export const AnimatedMultiProgress: React.FC<AnimatedMultiProgressProps> = ({
  segments,
  height = 8,
  borderRadius = 4,
  style,
  animated = true,
}) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  
  return (
    <View style={[styles.multiContainer, { height, borderRadius }, style]}>
      {segments.map((segment, index) => {
        const progressValue = useSharedValue(0);
        const percentage = total > 0 ? (segment.value / total) * 100 : 0;

        useEffect(() => {
          if (animated) {
            progressValue.value = withSpring(percentage, ANIMATION_CONFIGS.gentle);
          } else {
            progressValue.value = percentage;
          }
        }, [percentage, animated]);

        const segmentStyle = useAnimatedStyle(() => ({
          width: `${progressValue.value}%`,
        }));

        return (
          <Animated.View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor: segment.color,
                borderTopLeftRadius: index === 0 ? borderRadius : 0,
                borderBottomLeftRadius: index === 0 ? borderRadius : 0,
                borderTopRightRadius: index === segments.length - 1 ? borderRadius : 0,
                borderBottomRightRadius: index === segments.length - 1 ? borderRadius : 0,
              },
              segmentStyle,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  solidProgress: {
    flex: 1,
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  circularContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  segment: {
    height: '100%',
  },
});
