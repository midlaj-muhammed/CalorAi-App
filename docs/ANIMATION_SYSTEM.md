# CalorAi Animation System

This document outlines the comprehensive animation system implemented in CalorAi to provide smooth, performant, and accessible animations throughout the mobile app.

## 🎯 Overview

The animation system is built on top of `react-native-reanimated` v3 for 60fps animations running on the UI thread, with accessibility support for reduced motion preferences.

## 📦 Core Components

### Animation Hooks (`hooks/useAnimations.ts`)

#### `useFadeAnimation(initialValue, config)`
- **Purpose**: Fade in/out animations
- **Usage**: Loading states, modal overlays, content transitions
- **Methods**: `fadeIn(delay)`, `fadeOut(delay)`, `animatedStyle`

#### `useScaleAnimation(initialValue, config)`
- **Purpose**: Scale animations for interactive feedback
- **Usage**: Button presses, card interactions, emphasis
- **Methods**: `scaleIn(delay)`, `scaleOut(delay)`, `pulse()`, `animatedStyle`

#### `useSlideAnimation(direction, distance, config)`
- **Purpose**: Slide transitions
- **Usage**: Page transitions, drawer animations, list items
- **Methods**: `slideIn(delay)`, `slideOut(delay)`, `animatedStyle`

#### `useRotationAnimation(config)`
- **Purpose**: Rotation animations
- **Usage**: Loading spinners, icon interactions, transitions
- **Methods**: `rotate(degrees, delay)`, `spin()`, `animatedStyle`

#### `useStaggeredAnimation(itemCount, staggerDelay, config)`
- **Purpose**: Staggered list animations
- **Usage**: List items appearing in sequence
- **Methods**: `animateIn()`, `getAnimatedStyle(index)`

### Animated Components

#### `AnimatedCard`
```tsx
<AnimatedCard 
  animationType="slide" 
  slideDirection="up" 
  delay={200}
  style={styles.card}
>
  {children}
</AnimatedCard>
```

#### `AnimatedButton`
```tsx
<AnimatedButton
  title="Get Started"
  onPress={handlePress}
  animationType="scale"
  hapticFeedback={true}
  variant="primary"
/>
```

#### `AnimatedModal`
```tsx
<AnimatedModal
  visible={isVisible}
  onClose={handleClose}
  animationType="slide"
  position="bottom"
  closeOnBackdropPress={true}
>
  {modalContent}
</AnimatedModal>
```

#### `AnimatedProgressBar`
```tsx
<AnimatedProgressBar
  progress={0.75}
  height={8}
  showGradient={true}
  gradientColors={['#4CAF50', '#8BC34A']}
  animated={true}
/>
```

#### `SkeletonLoader`
```tsx
<SkeletonLoader
  variant="card"
  width="100%"
  height={120}
  borderRadius={12}
/>

<SkeletonText lines={3} />
<SkeletonCard />
<SkeletonList itemCount={5} />
```

#### `AnimatedFlatList`
```tsx
<AnimatedFlatList
  data={items}
  renderItem={({ item, index, animatedStyle }) => (
    <Animated.View style={animatedStyle}>
      <ItemComponent item={item} />
    </Animated.View>
  )}
  animationType="slide"
  staggerDelay={100}
/>
```

## 🎨 Animation Types

### Navigation Transitions
- **Stack Navigation**: Slide from right, fade, slide from bottom
- **Tab Navigation**: Animated tab icons with scale effects
- **Modal Presentations**: Slide up, fade, scale

### Interactive Feedback
- **Button Press**: Scale down with haptic feedback
- **Card Tap**: Subtle scale with shadow animation
- **Icon Interactions**: Rotation, scale, color transitions

### Loading States
- **Skeleton Loading**: Shimmer effect with gradient overlay
- **Progress Indicators**: Animated progress bars and circular progress
- **Spinner Animations**: Custom rotating spinners

### List Animations
- **Staggered Entrance**: Items appear in sequence
- **Scroll-based**: Items animate as they enter viewport
- **Pull-to-refresh**: Custom refresh animations

## 🔧 Configuration

### Animation Configs
```typescript
export const ANIMATION_CONFIGS = {
  // Timing configurations
  fast: { duration: 200 },
  medium: { duration: 300 },
  slow: { duration: 500 },
  
  // Spring configurations
  gentle: { damping: 20, stiffness: 90 },
  bouncy: { damping: 15, stiffness: 150 },
  snappy: { damping: 25, stiffness: 200 },
};
```

### Accessibility Support
- Automatic detection of reduced motion preferences
- Graceful fallbacks for users with motion sensitivity
- Maintains functionality while reducing animation intensity

## 📱 Implementation Examples

### Dashboard Cards
```tsx
// Meal cards with staggered slide-up animation
<AnimatedCard 
  animationType="slide" 
  slideDirection="up" 
  delay={200}
  style={styles.mealCard}
>
  <MealContent />
</AnimatedCard>
```

### Enhanced Buttons
```tsx
// Primary button with scale animation and haptics
<AnimatedButton
  title="Get Started"
  onPress={handleGetStarted}
  animationType="scale"
  hapticFeedback={true}
  variant="primary"
/>
```

### Loading Screens
```tsx
// Animated loading with logo and spinner
<LinearGradient colors={['#4CAF50', '#8BC34A']}>
  <Animated.View style={logoAnimatedStyle}>
    <LogoComponent />
  </Animated.View>
  <Animated.View style={spinnerAnimatedStyle}>
    <CustomSpinner />
  </Animated.View>
</LinearGradient>
```

## 🚀 Performance Optimizations

### UI Thread Animations
- All animations run on the UI thread using `react-native-reanimated`
- No bridge communication during animations
- Consistent 60fps performance

### Memory Management
- Proper cleanup of animation values
- Automatic cancellation of running animations
- Efficient shared value usage

### Reduced Motion Support
- Respects system accessibility settings
- Provides instant state changes when motion is reduced
- Maintains app functionality for all users

## 🎯 Best Practices

### Do's
- ✅ Use appropriate animation duration (200-500ms)
- ✅ Provide haptic feedback for interactive elements
- ✅ Implement proper cleanup in useEffect
- ✅ Test on both iOS and Android
- ✅ Respect accessibility preferences

### Don'ts
- ❌ Overuse animations (can be distracting)
- ❌ Use long animation durations (>500ms)
- ❌ Forget to handle reduced motion
- ❌ Block user interactions during animations
- ❌ Use animations for critical functionality

## 🔍 Testing

### Animation Testing
- Test on physical devices for accurate performance
- Verify animations work with reduced motion enabled
- Check memory usage during extended animation sequences
- Ensure animations don't interfere with user interactions

### Accessibility Testing
- Enable "Reduce Motion" in device settings
- Verify app remains fully functional
- Test with screen readers
- Ensure animations don't cause motion sickness

## 📚 Resources

- [React Native Reanimated Documentation](https://docs.swmansion.com/react-native-reanimated/)
- [Expo Haptics Documentation](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [iOS Human Interface Guidelines - Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Material Design Motion Guidelines](https://material.io/design/motion/understanding-motion.html)
