import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useNutrition } from '../../contexts/NutritionContext';

export default function EditProfileScreen() {
  const { user } = useUser();
  const { state, updateUserMetrics } = useNutrition();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    age: '',
    gender: 'female' as 'male' | 'female' | 'other',
    activityLevel: 'moderately_active' as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    setIsLoading(true);
    
    const userMetrics = state.dashboardData?.userMetrics;
    
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      currentWeight: userMetrics?.currentWeight?.toString() || '',
      targetWeight: userMetrics?.targetWeight?.toString() || '',
      height: userMetrics?.height?.toString() || '',
      age: userMetrics?.age?.toString() || '',
      gender: userMetrics?.gender || 'female',
      activityLevel: userMetrics?.activityLevel || 'moderately_active',
    });
    
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      // Update Clerk user profile
      if (user) {
        await user.update({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
      }

      // Update user metrics
      await updateUserMetrics({
        currentWeight: parseFloat(formData.currentWeight),
        targetWeight: parseFloat(formData.targetWeight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.currentWeight || parseFloat(formData.currentWeight) <= 0) {
      Alert.alert('Error', 'Please enter a valid current weight');
      return false;
    }
    if (!formData.targetWeight || parseFloat(formData.targetWeight) <= 0) {
      Alert.alert('Error', 'Please enter a valid target weight');
      return false;
    }
    if (!formData.height || parseFloat(formData.height) <= 0) {
      Alert.alert('Error', 'Please enter a valid height');
      return false;
    }
    if (!formData.age || parseInt(formData.age) <= 0) {
      Alert.alert('Error', 'Please enter a valid age');
      return false;
    }
    return true;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.firstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
              placeholder="Enter your first name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.lastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
              placeholder="Enter your last name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              value={formData.age}
              onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
              placeholder="Enter your age"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.segmentedControl}>
              {(['female', 'male', 'other'] as const).map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.segmentButton,
                    formData.gender === gender && styles.segmentButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, gender }))}
                >
                  <Text style={[
                    styles.segmentButtonText,
                    formData.gender === gender && styles.segmentButtonTextActive
                  ]}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Physical Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Metrics</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Weight (kg)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.currentWeight}
              onChangeText={(text) => setFormData(prev => ({ ...prev, currentWeight: text }))}
              placeholder="Enter your current weight"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Target Weight (kg)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.targetWeight}
              onChangeText={(text) => setFormData(prev => ({ ...prev, targetWeight: text }))}
              placeholder="Enter your target weight"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.height}
              onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
              placeholder="Enter your height"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Activity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Level</Text>
          
          {[
            { key: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
            { key: 'lightly_active', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
            { key: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
            { key: 'very_active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
            { key: 'extremely_active', label: 'Extremely Active', description: 'Very hard exercise, physical job' },
          ].map((activity) => (
            <TouchableOpacity
              key={activity.key}
              style={[
                styles.activityOption,
                formData.activityLevel === activity.key && styles.activityOptionActive
              ]}
              onPress={() => setFormData(prev => ({ ...prev, activityLevel: activity.key as any }))}
            >
              <View style={styles.activityInfo}>
                <Text style={[
                  styles.activityLabel,
                  formData.activityLevel === activity.key && styles.activityLabelActive
                ]}>
                  {activity.label}
                </Text>
                <Text style={[
                  styles.activityDescription,
                  formData.activityLevel === activity.key && styles.activityDescriptionActive
                ]}>
                  {activity.description}
                </Text>
              </View>
              {formData.activityLevel === activity.key && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#A5A5A5',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#4CAF50',
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  segmentButtonTextActive: {
    color: 'white',
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityOptionActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  activityLabelActive: {
    color: '#4CAF50',
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
  },
  activityDescriptionActive: {
    color: '#4CAF50',
  },
  bottomSpacing: {
    height: 40,
  },
});
