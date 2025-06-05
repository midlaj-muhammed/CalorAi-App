import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useNutrition } from '../../contexts/NutritionContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppPreferences {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr';
  notifications: {
    meals: boolean;
    water: boolean;
    exercise: boolean;
    progress: boolean;
  };
}

const defaultPreferences: AppPreferences = {
  units: 'metric',
  theme: 'light',
  language: 'en',
  notifications: {
    meals: true,
    water: true,
    exercise: true,
    progress: true,
  },
};

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { state, resetNutritionData } = useNutrition();
  const { resetOnboarding } = useOnboarding();
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      if (user) {
        const stored = await AsyncStorage.getItem(`preferences_${user.id}`);
        if (stored) {
          setPreferences(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: AppPreferences) => {
    try {
      if (user) {
        await AsyncStorage.setItem(`preferences_${user.id}`, JSON.stringify(newPreferences));
        setPreferences(newPreferences);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    }
  };

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    setShowSignOutModal(false);

    try {
      console.log('🚪 Starting comprehensive sign out process...');

      // Step 1: Clear all cached user data from AsyncStorage
      console.log('🗑️ Clearing cached user data...');
      await resetNutritionData();

      // Step 2: Reset OnboardingContext to initial state
      console.log('🔄 Resetting onboarding data...');
      await resetOnboarding();

      // Step 3: Clear any additional user-specific data
      console.log('🗑️ Clearing additional user data...');
      if (user?.id) {
        const keys = await AsyncStorage.getAllKeys();
        const userSpecificKeys = keys.filter(key =>
          key.includes(user.id) ||
          key.startsWith('preferences_') ||
          key.startsWith('user_metrics_') ||
          key.startsWith('@calorAi_')
        );

        if (userSpecificKeys.length > 0) {
          await AsyncStorage.multiRemove(userSpecificKeys);
          console.log('✅ Cleared user-specific keys:', userSpecificKeys);
        }
      }

      // Step 4: Sign out from Clerk
      console.log('🚪 Signing out from Clerk...');
      await signOut();

      console.log('✅ Sign out completed successfully');

      // Navigation will be handled automatically by Clerk's auth state change
    } catch (error) {
      console.error('❌ Error during sign out:', error);
      setIsSigningOut(false);

      Alert.alert(
        'Sign Out Error',
        'There was an error signing out. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const cancelSignOut = () => {
    setShowSignOutModal(false);
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

  const userMetrics = state.dashboardData?.userMetrics;
  const streaks = state.dashboardData?.streaks;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={40} color="#4CAF50" />
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => router.push('/profile/edit-avatar')}
            >
              <MaterialIcons name="camera-alt" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.emailAddresses[0]?.emailAddress || 'User'
              }
            </Text>
            <Text style={styles.userEmail}>
              {user?.emailAddresses[0]?.emailAddress}
            </Text>
          </View>
        </View>

        {/* Progress Summary */}
        {userMetrics && (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <View style={styles.progressGrid}>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>
                  {userMetrics.currentWeight.toFixed(1)}
                </Text>
                <Text style={styles.progressLabel}>Current Weight</Text>
                <Text style={styles.progressUnit}>
                  {preferences.units === 'metric' ? 'kg' : 'lbs'}
                </Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>
                  {userMetrics.targetWeight.toFixed(1)}
                </Text>
                <Text style={styles.progressLabel}>Target Weight</Text>
                <Text style={styles.progressUnit}>
                  {preferences.units === 'metric' ? 'kg' : 'lbs'}
                </Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>
                  {Math.abs(userMetrics.currentWeight - userMetrics.targetWeight).toFixed(1)}
                </Text>
                <Text style={styles.progressLabel}>
                  {userMetrics.currentWeight > userMetrics.targetWeight ? 'To Lose' : 'To Gain'}
                </Text>
                <Text style={styles.progressUnit}>
                  {preferences.units === 'metric' ? 'kg' : 'lbs'}
                </Text>
              </View>
            </View>

            {streaks && (
              <View style={styles.streaksContainer}>
                <View style={styles.streakItem}>
                  <MaterialIcons name="local-fire-department" size={20} color="#FF6B35" />
                  <Text style={styles.streakValue}>{streaks.logging}</Text>
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </View>
                <View style={styles.streakItem}>
                  <MaterialIcons name="fitness-center" size={20} color="#4CAF50" />
                  <Text style={styles.streakValue}>{streaks.exercise}</Text>
                  <Text style={styles.streakLabel}>Exercise</Text>
                </View>
                <View style={styles.streakItem}>
                  <MaterialIcons name="water-drop" size={20} color="#2196F3" />
                  <Text style={styles.streakValue}>{streaks.waterGoal}</Text>
                  <Text style={styles.streakLabel}>Water Goal</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/edit-profile')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="edit" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Edit Profile</Text>
              <Text style={styles.settingDescription}>
                Update your personal information
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/goals-targets')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="flag" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Goals & Targets</Text>
              <Text style={styles.settingDescription}>
                Set your nutrition and fitness goals
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/change-password')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="lock" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Change Password</Text>
              <Text style={styles.settingDescription}>
                Update your account password
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/app-preferences')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="settings" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>App Preferences</Text>
              <Text style={styles.settingDescription}>
                Units, theme, and language settings
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/notifications')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="notifications" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Manage your notification preferences
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/nutrition-settings')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="restaurant" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Nutrition Settings</Text>
              <Text style={styles.settingDescription}>
                Dietary preferences and macro targets
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/privacy-data')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="privacy-tip" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Privacy Settings</Text>
              <Text style={styles.settingDescription}>
                Control your data and privacy
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/data-export')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="download" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Download your personal data
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/about')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="info" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>About CalorAi</Text>
              <Text style={styles.settingDescription}>
                App version, terms, and support
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/profile/help-support')}
          >
            <View style={styles.settingIcon}>
              <MaterialIcons name="help" size={24} color="#4CAF50" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Help & Support</Text>
              <Text style={styles.settingDescription}>
                Get help and contact support
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.signOutButton, isSigningOut && styles.signOutButtonDisabled]}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <>
                <ActivityIndicator size="small" color="#FF3B30" />
                <Text style={styles.signOutText}>Signing Out...</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="logout" size={24} color="#FF3B30" />
                <Text style={styles.signOutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal
        visible={showSignOutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelSignOut}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="logout" size={32} color="#FF3B30" />
              <Text style={styles.modalTitle}>Sign Out</Text>
            </View>

            <Text style={styles.modalMessage}>
              Are you sure you want to sign out? This will clear all your local data and return you to the welcome screen.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={cancelSignOut}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmSignOut}
              >
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
    padding: 20,
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
  profileHeader: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  progressUnit: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  streaksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 56,
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
