import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TimePeriod, useProgress } from '../../contexts/ProgressContext';

const { width: screenWidth } = Dimensions.get('window');

const periods: Array<{ key: TimePeriod; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { key: 'daily', label: 'Daily', icon: 'today' },
  { key: 'weekly', label: 'Weekly', icon: 'date-range' },
  { key: 'monthly', label: 'Monthly', icon: 'calendar-month' },
  { key: 'yearly', label: 'Yearly', icon: 'calendar-today' },
];

export const TimePeriodSelector: React.FC = () => {
  const { state, setPeriod } = useProgress();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Period</Text>
      <View style={styles.periodContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              state.currentPeriod === period.key && styles.activePeriodButton,
            ]}
            onPress={() => setPeriod(period.key)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={period.icon}
              size={20}
              color={state.currentPeriod === period.key ? 'white' : '#666'}
            />
            <Text
              style={[
                styles.periodText,
                state.currentPeriod === period.key && styles.activePeriodText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: screenWidth < 375 ? 12 : 16,
    marginHorizontal: screenWidth < 375 ? 12 : 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: screenWidth < 375 ? 16 : 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: screenWidth < 375 ? 12 : 16,
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: screenWidth < 375 ? 6 : 8,
  },
  periodButton: {
    flex: 1,
    flexDirection: screenWidth < 350 ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenWidth < 375 ? 10 : 12,
    paddingHorizontal: screenWidth < 375 ? 4 : 8,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minHeight: 44, // Minimum touch target
  },
  activePeriodButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  periodText: {
    fontSize: screenWidth < 375 ? 10 : 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: screenWidth < 350 ? 0 : 4,
    marginTop: screenWidth < 350 ? 2 : 0,
    textAlign: 'center',
  },
  activePeriodText: {
    color: 'white',
  },
});
