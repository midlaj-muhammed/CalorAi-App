import React, { useCallback, useRef } from 'react';
import { FlatList, FlatListProps, ViewToken } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { ANIMATION_CONFIGS } from '../../hooks/useAnimations';

interface AnimatedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: ({ item, index, animatedStyle }: {
    item: T;
    index: number;
    animatedStyle: any;
  }) => React.ReactElement;
  animationType?: 'fade' | 'scale' | 'slide';
  staggerDelay?: number;
  itemAnimationDuration?: number;
}

const AnimatedFlatListComponent = Animated.createAnimatedComponent(FlatList);

export function AnimatedFlatList<T>({
  renderItem,
  animationType = 'fade',
  staggerDelay = 100,
  itemAnimationDuration = 300,
  onViewableItemsChanged,
  viewabilityConfig,
  ...props
}: AnimatedFlatListProps<T>) {
  const viewableItems = useSharedValue<ViewToken[]>([]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems: vItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.value = vItems;
      onViewableItemsChanged?.({ viewableItems: vItems, changed: [] });
    },
    [onViewableItemsChanged]
  );

  const animatedRenderItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const opacity = useSharedValue(0);
      const scale = useSharedValue(0.8);
      const translateY = useSharedValue(50);

      const animatedStyle = useAnimatedStyle(() => {
        const isVisible = viewableItems.value.some(
          (viewableItem) => viewableItem.index === index
        );

        if (isVisible) {
          const delay = index * staggerDelay;
          
          switch (animationType) {
            case 'fade':
              opacity.value = withTiming(1, {
                duration: itemAnimationDuration,
                delay,
              });
              break;
            case 'scale':
              opacity.value = withTiming(1, {
                duration: itemAnimationDuration,
                delay,
              });
              scale.value = withSpring(1, {
                ...ANIMATION_CONFIGS.gentle,
                delay,
              });
              break;
            case 'slide':
              opacity.value = withTiming(1, {
                duration: itemAnimationDuration,
                delay,
              });
              translateY.value = withTiming(0, {
                duration: itemAnimationDuration,
                delay,
              });
              break;
          }
        }

        return {
          opacity: opacity.value,
          transform: [
            { scale: scale.value },
            { translateY: translateY.value },
          ],
        };
      });

      return renderItem({ item, index, animatedStyle });
    },
    [renderItem, animationType, staggerDelay, itemAnimationDuration, viewableItems]
  );

  return (
    <AnimatedFlatListComponent
      {...props}
      renderItem={animatedRenderItem}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={
        viewabilityConfig || {
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 100,
        }
      }
    />
  );
}

// Animated ScrollView wrapper
interface AnimatedScrollViewProps {
  children: React.ReactNode;
  animationType?: 'fade' | 'scale' | 'slide';
  staggerDelay?: number;
  style?: any;
}

export const AnimatedScrollView: React.FC<AnimatedScrollViewProps> = ({
  children,
  animationType = 'fade',
  staggerDelay = 100,
  style,
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <Animated.ScrollView style={style} showsVerticalScrollIndicator={false}>
      {childrenArray.map((child, index) => {
        const opacity = useSharedValue(0);
        const scale = useSharedValue(0.8);
        const translateY = useSharedValue(30);

        React.useEffect(() => {
          const delay = index * staggerDelay;
          
          switch (animationType) {
            case 'fade':
              opacity.value = withTiming(1, {
                duration: 300,
                delay,
              });
              break;
            case 'scale':
              opacity.value = withTiming(1, {
                duration: 300,
                delay,
              });
              scale.value = withSpring(1, {
                ...ANIMATION_CONFIGS.gentle,
                delay,
              });
              break;
            case 'slide':
              opacity.value = withTiming(1, {
                duration: 300,
                delay,
              });
              translateY.value = withTiming(0, {
                duration: 300,
                delay,
              });
              break;
          }
        }, []);

        const animatedStyle = useAnimatedStyle(() => ({
          opacity: opacity.value,
          transform: [
            { scale: scale.value },
            { translateY: translateY.value },
          ],
        }));

        return (
          <Animated.View key={index} style={animatedStyle}>
            {child}
          </Animated.View>
        );
      })}
    </Animated.ScrollView>
  );
};
