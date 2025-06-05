import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function IntermittentFastingScreen() {
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
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Grid */}
        <View style={styles.imageGrid}>
          <View style={styles.imageRow}>
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="restaurant" size={40} color="#4CAF50" />
              </View>
            </View>
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="local-dining" size={40} color="#4CAF50" />
              </View>
            </View>
          </View>
          <View style={styles.imageRow}>
            <View style={styles.centerImageContainer}>
              <View style={styles.centerCircle}>
                <MaterialIcons name="schedule" size={60} color="#E91E63" />
              </View>
            </View>
          </View>
          <View style={styles.imageRow}>
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="local-drink" size={40} color="#2196F3" />
              </View>
            </View>
            <View style={styles.imageContainer}>
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="fitness-center" size={40} color="#FF9800" />
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Intermittent fasting</Text>
          <Text style={styles.description}>
            Intermittent fasting is an eating plan that switches between fasting and eating on a 
            regular schedule. Research shows fasting for a certain number of hours each day may have 
            health benefits.
          </Text>
          
          <Text style={styles.subtitle}>Fasting is made up of two distinct phases</Text>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => router.push('/intermittent-fasting/phases')}
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
  imageGrid: {
    marginTop: 40,
    marginBottom: 40,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  imageContainer: {
    width: 120,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  centerImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
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
