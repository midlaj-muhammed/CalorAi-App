import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

// Circular Progress Component for Fasting Phases
const PhaseCircle = ({ color, size = 80 }: { color: string; size?: number }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference * 0.75} ${circumference * 0.25}`;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#E0E0E0"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={8}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={8}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[styles.phaseIcon, { top: size / 2 - 12, left: size / 2 - 12 }]}>
        <MaterialIcons name="schedule" size={24} color={color} />
      </View>
    </View>
  );
};

export default function PhasesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>INTERMITTENT FASTING</Text>
        <TouchableOpacity style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Fasting is made up of two distinct phases</Text>

        {/* Fasting Window */}
        <View style={styles.phaseCard}>
          <View style={styles.phaseHeader}>
            <PhaseCircle color="#E91E63" size={80} />
            <View style={styles.phaseInfo}>
              <Text style={styles.phaseTitle}>Fasting window</Text>
              <Text style={styles.phaseDescription}>
                Abstain from all food and drink besides non-caloric beverages
              </Text>
            </View>
          </View>
        </View>

        {/* Eating Window */}
        <View style={styles.phaseCard}>
          <View style={styles.phaseHeader}>
            <PhaseCircle color="#4CAF50" size={80} />
            <View style={styles.phaseInfo}>
              <Text style={styles.phaseTitle}>Eating window</Text>
              <Text style={styles.phaseDescription}>
                Eat and drink during this period. Aim for balance.
              </Text>
            </View>
          </View>
        </View>

        {/* Information Text */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Use the fasting timer to tell you when to switch phases and see when your body is 
            in the fat-burning and ketosis stages. Get notifications to stay on track with your fasting 
            schedule.
          </Text>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips for success</Text>
          
          <View style={styles.tipItem}>
            <View style={styles.tipIcon}>
              <MaterialIcons name="local-drink" size={32} color="#2196F3" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay hydrated</Text>
              <Text style={styles.tipDescription}>
                Drink plenty of water, herbal tea, or other non-caloric beverages 
                during your fasting to stay hydrated and help suppress hunger.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => router.push('/intermittent-fasting/setup')}
        >
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 32,
    marginBottom: 32,
    textAlign: 'left',
  },
  phaseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseInfo: {
    flex: 1,
    marginLeft: 20,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  phaseDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  infoSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'left',
  },
  tipsSection: {
    marginBottom: 40,
  },
  tipsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipIcon: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
