import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useOnboarding } from '../../contexts/OnboardingContext';

const genders = [
  { id: 'male', title: 'Male', emoji: '👨' },
  { id: 'female', title: 'Female', emoji: '👩' },
  { id: 'other', title: 'Other', emoji: '👤' },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { data, updatePersonalInfo } = useOnboarding();
  const [selectedGender, setSelectedGender] = useState<string>(data.gender || '');
  const [age, setAge] = useState<string>(data.age ? data.age.toString() : '');
  const [height, setHeight] = useState<string>(data.height ? data.height.toString() : '');
  const [weight, setWeight] = useState<string>(data.currentWeight ? data.currentWeight.toString() : '');

  // Load existing data from context on mount
  useEffect(() => {
    if (data.gender) setSelectedGender(data.gender);
    if (data.age) setAge(data.age.toString());
    if (data.height) setHeight(data.height.toString());
    if (data.currentWeight) setWeight(data.currentWeight.toString());
  }, [data]);

  const handleGenderSelect = (genderId: string) => {
    setSelectedGender(genderId);
  };

  const handleContinue = () => {
    if (selectedGender && age && height && weight) {
      // Save personal info to context
      updatePersonalInfo({
        age: parseInt(age),
        gender: selectedGender as any,
        height: parseInt(height),
        currentWeight: parseInt(weight),
      });
      router.push('/(onboarding)/target-weight');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isFormValid = () => {
    return selectedGender && 
           age && parseInt(age) > 0 && parseInt(age) < 120 &&
           height && parseInt(height) > 0 && parseInt(height) < 300 &&
           weight && parseInt(weight) > 0 && parseInt(weight) < 500;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            This information helps us provide accurate calorie recommendations.
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>3 of 6</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Gender Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gender</Text>
            <View style={styles.genderContainer}>
              {genders.map((gender) => (
                <TouchableOpacity
                  key={gender.id}
                  style={[
                    styles.genderCard,
                    selectedGender === gender.id && styles.selectedGenderCard
                  ]}
                  onPress={() => handleGenderSelect(gender.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.genderEmoji}>{gender.emoji}</Text>
                  <Text style={[
                    styles.genderTitle,
                    selectedGender === gender.id && styles.selectedGenderTitle
                  ]}>
                    {gender.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Age Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Age</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputUnit}>years</Text>
            </View>
          </View>

          {/* Height Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Height</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="Enter your height"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputUnit}>cm</Text>
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Weight</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter your weight"
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!isFormValid()}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGenderCard: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  genderEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  genderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedGenderTitle: {
    color: '#2E7D32',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#333',
  },
  inputUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 34,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  continueButton: {
    marginBottom: 0,
  },
});
