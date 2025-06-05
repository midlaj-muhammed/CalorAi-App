import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface FloatingActionButtonProps {
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'qr-code-scanner',
  size = 28,
  color = 'white',
  backgroundColor = '#4CAF50',
}) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(8)).current;

  const handlePress = async () => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 4,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 12,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Navigate to camera/scan screen
    if (onPress) {
      onPress();
    } else {
      router.push('/camera');
    }
  };

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: scaleAnim }],
            shadowRadius: shadowAnim,
            backgroundColor,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <MaterialIcons name={icon} size={size} color={color} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 25 : 20,
    alignSelf: 'center',
    zIndex: 1000,
  },
  fabContainer: {
    width: 64,
    height: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
});

// Alternative full-circle FAB design
export const CircularFloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'qr-code-scanner',
  size = 28,
  color = 'white',
  backgroundColor = '#4CAF50',
}) => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(8)).current;

  const handlePress = async () => {
    // Haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 4,
          duration: 100,
          useNativeDriver: false,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(shadowAnim, {
          toValue: 12,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // Navigate to camera/scan screen
    if (onPress) {
      onPress();
    } else {
      router.push('/camera');
    }
  };

  return (
    <View style={circularStyles.container}>
      <Animated.View
        style={[
          circularStyles.fabContainer,
          {
            transform: [{ scale: scaleAnim }],
            shadowRadius: shadowAnim,
            backgroundColor,
          },
        ]}
      >
        <TouchableOpacity
          style={circularStyles.fab}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <MaterialIcons name={icon} size={size} color={color} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const circularStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 85,
    right: 20,
    zIndex: 1000,
  },
  fabContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
});

// Speed Dial FAB Component
interface SpeedDialOption {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

interface SpeedDialFABProps {
  options: SpeedDialOption[];
  mainIcon?: keyof typeof MaterialIcons.glyphMap;
  backgroundColor?: string;
  iconColor?: string;
}

export const SpeedDialFAB: React.FC<SpeedDialFABProps> = ({
  options,
  mainIcon = 'add',
  backgroundColor = '#4CAF50',
  iconColor = 'white',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const optionAnims = useRef(options.map(() => new Animated.Value(0))).current;

  const toggleMenu = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(50,
        optionAnims.map(anim =>
          Animated.spring(anim, {
            toValue,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          })
        )
      ),
    ]).start();
  };

  const handleOptionPress = async (option: SpeedDialOption) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Close menu first
    setIsOpen(false);
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      ...optionAnims.map(anim =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Execute option action
    option.onPress();
  };

  const closeMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        ...optionAnims.map(anim =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {isOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={speedDialStyles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <View style={speedDialStyles.container}>
        {/* Speed Dial Options */}
        {options.map((option, index) => {
          const translateY = optionAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(60 + index * 60)],
          });

          const scale = optionAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          return (
            <Animated.View
              key={index}
              style={[
                speedDialStyles.optionContainer,
                {
                  transform: [
                    { translateY },
                    { scale },
                  ],
                },
              ]}
            >
              <View style={speedDialStyles.optionLabelContainer}>
                <Text style={speedDialStyles.optionLabel}>{option.label}</Text>
              </View>
              <TouchableOpacity
                style={[
                  speedDialStyles.optionButton,
                  { backgroundColor: option.color || backgroundColor }
                ]}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={option.icon}
                  size={24}
                  color={iconColor}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <Animated.View
          style={[
            speedDialStyles.mainFabContainer,
            {
              backgroundColor,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={speedDialStyles.mainFab}
            onPress={toggleMenu}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <MaterialIcons name={mainIcon} size={28} color={iconColor} />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
};

const speedDialStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 999,
  },
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 85,
    right: 20,
    zIndex: 1000,
    alignItems: 'center',
  },
  optionContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 0,
  },
  optionLabelContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },
  optionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  optionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mainFabContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainFab: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
});
