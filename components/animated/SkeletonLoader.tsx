import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  variant = 'rectangular',
}) => {
  const shimmerTranslate = useSharedValue(-1);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerTranslate.value,
      [-1, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const getSkeletonStyle = () => {
    switch (variant) {
      case 'text':
        return {
          width,
          height: height || 16,
          borderRadius: borderRadius || 4,
        };
      case 'circular':
        const size = typeof width === 'number' ? width : height;
        return {
          width: size,
          height: size,
          borderRadius: size / 2,
        };
      case 'card':
        return {
          width,
          height: height || 120,
          borderRadius: borderRadius || 12,
        };
      default:
        return {
          width,
          height,
          borderRadius,
        };
    }
  };

  return (
    <View style={[styles.container, getSkeletonStyle(), style]}>
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, animatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.4)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>
    </View>
  );
};

// Skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; style?: ViewStyle }> = ({ 
  lines = 1, 
  style 
}) => (
  <View style={style}>
    {Array.from({ length: lines }, (_, index) => (
      <SkeletonLoader
        key={index}
        variant="text"
        width={index === lines - 1 ? '70%' : '100%'}
        style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
      />
    ))}
  </View>
);

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.cardContainer, style]}>
    <View style={styles.cardHeader}>
      <SkeletonLoader variant="circular" width={40} />
      <View style={styles.cardHeaderText}>
        <SkeletonLoader variant="text" width="60%" height={16} />
        <SkeletonLoader variant="text" width="40%" height={12} style={{ marginTop: 4 }} />
      </View>
    </View>
    <SkeletonLoader variant="text" width="100%" height={14} style={{ marginTop: 16 }} />
    <SkeletonLoader variant="text" width="80%" height={14} style={{ marginTop: 8 }} />
  </View>
);

export const SkeletonList: React.FC<{ 
  itemCount?: number; 
  itemHeight?: number;
  style?: ViewStyle;
}> = ({ 
  itemCount = 5, 
  itemHeight = 80,
  style 
}) => (
  <View style={style}>
    {Array.from({ length: itemCount }, (_, index) => (
      <View key={index} style={[styles.listItem, { height: itemHeight }]}>
        <SkeletonLoader variant="circular" width={50} />
        <View style={styles.listItemContent}>
          <SkeletonLoader variant="text" width="70%" height={16} />
          <SkeletonLoader variant="text" width="50%" height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  shimmerContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  shimmer: {
    width: 200,
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    flex: 1,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 8,
  },
  listItemContent: {
    marginLeft: 12,
    flex: 1,
  },
});
