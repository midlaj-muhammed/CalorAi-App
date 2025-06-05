import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface WorkoutTimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onComplete: () => void;
  onPause?: () => void;
  onResume?: () => void;
  type?: 'workout' | 'rest';
  showControls?: boolean;
}

export const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
  duration,
  isActive,
  onComplete,
  onPause,
  onResume,
  type = 'workout',
  showControls = true,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeRemaining(duration);
    progressAnim.setValue(0);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          
          // Update progress animation
          const progress = ((duration - newTime) / duration) * 100;
          Animated.timing(progressAnim, {
            toValue: progress,
            duration: 100,
            useNativeDriver: false,
          }).start();

          if (newTime <= 0) {
            onComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeRemaining, duration, onComplete, progressAnim]);

  useEffect(() => {
    // Pulse animation for active timer
    if (isActive && !isPaused && type === 'workout') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive, isPaused, type, pulseAnim]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = () => {
    setIsPaused(true);
    onPause?.();
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume?.();
  };

  const getTimerColor = () => {
    if (type === 'rest') return '#FF9800';
    if (timeRemaining <= 10) return '#F44336';
    return '#4CAF50';
  };

  const getProgressColor = () => {
    if (type === 'rest') return '#FF9800';
    return '#4CAF50';
  };

  return (
    <View style={styles.container}>
      {/* Circular Progress */}
      <View style={styles.timerContainer}>
        <View style={styles.progressRing}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: getProgressColor(),
                transform: [
                  {
                    rotate: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
        
        <Animated.View
          style={[
            styles.timerContent,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={[styles.timerText, { color: getTimerColor() }]}>
            {formatTime(timeRemaining)}
          </Text>
          <Text style={styles.timerLabel}>
            {type === 'rest' ? 'REST' : 'WORKOUT'}
          </Text>
        </Animated.View>
      </View>

      {/* Controls */}
      {showControls && (
        <View style={styles.controls}>
          {isPaused ? (
            <TouchableOpacity style={styles.controlButton} onPress={handleResume}>
              <MaterialIcons name="play-arrow" size={32} color="#4CAF50" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
              <MaterialIcons name="pause" size={32} color="#FF9800" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Warning for last 10 seconds */}
      {timeRemaining <= 10 && timeRemaining > 0 && (
        <Text style={styles.warningText}>
          {timeRemaining === 1 ? 'GO!' : `${timeRemaining}`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#E5E5E5',
  },
  progressFill: {
    position: 'absolute',
    width: 8,
    height: 100,
    top: -4,
    left: 96,
    transformOrigin: '4px 104px',
    borderRadius: 4,
  },
  timerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
  },
  controls: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  warningText: {
    position: 'absolute',
    bottom: -60,
    fontSize: 24,
    fontWeight: '700',
    color: '#F44336',
    textAlign: 'center',
  },
});
