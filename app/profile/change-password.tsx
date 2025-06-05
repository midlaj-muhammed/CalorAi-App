import React, { useState } from 'react';
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

export default function ChangePasswordScreen() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Note: This is a placeholder implementation
      // In a real app, you would use Clerk's password change functionality
      Alert.alert(
        'Password Change',
        'Password change functionality is not yet implemented. Please use the Clerk dashboard or contact support.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return false;
    }
    if (!formData.newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return false;
    }
    if (formData.newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }
    return true;
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Security Info */}
        <View style={styles.infoCard}>
          <MaterialIcons name="security" size={32} color="#4CAF50" />
          <Text style={styles.infoTitle}>Keep Your Account Secure</Text>
          <Text style={styles.infoText}>
            Choose a strong password that you haven't used elsewhere. 
            Use at least 8 characters with a mix of letters, numbers, and symbols.
          </Text>
        </View>

        {/* Password Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.textInput}
                value={formData.currentPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, currentPassword: text }))}
                placeholder="Enter your current password"
                placeholderTextColor="#999"
                secureTextEntry={!showPasswords.current}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('current')}
              >
                <MaterialIcons 
                  name={showPasswords.current ? 'visibility-off' : 'visibility'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.textInput}
                value={formData.newPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, newPassword: text }))}
                placeholder="Enter your new password"
                placeholderTextColor="#999"
                secureTextEntry={!showPasswords.new}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('new')}
              >
                <MaterialIcons 
                  name={showPasswords.new ? 'visibility-off' : 'visibility'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>
              Must be at least 8 characters long
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.textInput}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                placeholder="Confirm your new password"
                placeholderTextColor="#999"
                secureTextEntry={!showPasswords.confirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => togglePasswordVisibility('confirm')}
              >
                <MaterialIcons 
                  name={showPasswords.confirm ? 'visibility-off' : 'visibility'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons name="lock" size={20} color="white" />
                <Text style={styles.changeButtonText}>Change Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Password Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password Tips</Text>
          
          <View style={styles.tipsList}>
            {[
              'Use at least 8 characters',
              'Include uppercase and lowercase letters',
              'Add numbers and special characters',
              'Avoid common words or personal information',
              'Don\'t reuse passwords from other accounts',
              'Consider using a password manager',
            ].map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
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
  passwordInput: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
    fontSize: 16,
    color: '#1A1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  changeButtonDisabled: {
    backgroundColor: '#A5A5A5',
    shadowColor: '#A5A5A5',
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },
});
