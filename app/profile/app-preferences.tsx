import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
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

export default function AppPreferencesScreen() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);

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

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await AsyncStorage.setItem(`preferences_${user.id}`, JSON.stringify(preferences));
        Alert.alert('Success', 'Preferences saved successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof AppPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNotificationPreference = (key: keyof AppPreferences['notifications'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading preferences...</Text>
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
        <Text style={styles.headerTitle}>App Preferences</Text>
        <TouchableOpacity 
          onPress={savePreferences} 
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
        {/* Units */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Units</Text>
          
          <View style={styles.optionGroup}>
            <TouchableOpacity
              style={[
                styles.optionItem,
                preferences.units === 'metric' && styles.optionItemActive
              ]}
              onPress={() => updatePreference('units', 'metric')}
            >
              <View style={styles.optionInfo}>
                <Text style={[
                  styles.optionLabel,
                  preferences.units === 'metric' && styles.optionLabelActive
                ]}>
                  Metric
                </Text>
                <Text style={[
                  styles.optionDescription,
                  preferences.units === 'metric' && styles.optionDescriptionActive
                ]}>
                  Kilograms, centimeters, Celsius
                </Text>
              </View>
              {preferences.units === 'metric' && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionItem,
                preferences.units === 'imperial' && styles.optionItemActive
              ]}
              onPress={() => updatePreference('units', 'imperial')}
            >
              <View style={styles.optionInfo}>
                <Text style={[
                  styles.optionLabel,
                  preferences.units === 'imperial' && styles.optionLabelActive
                ]}>
                  Imperial
                </Text>
                <Text style={[
                  styles.optionDescription,
                  preferences.units === 'imperial' && styles.optionDescriptionActive
                ]}>
                  Pounds, feet/inches, Fahrenheit
                </Text>
              </View>
              {preferences.units === 'imperial' && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          
          <View style={styles.optionGroup}>
            <TouchableOpacity
              style={[
                styles.optionItem,
                preferences.theme === 'light' && styles.optionItemActive
              ]}
              onPress={() => updatePreference('theme', 'light')}
            >
              <MaterialIcons name="light-mode" size={24} color="#4CAF50" />
              <View style={styles.optionInfo}>
                <Text style={[
                  styles.optionLabel,
                  preferences.theme === 'light' && styles.optionLabelActive
                ]}>
                  Light Mode
                </Text>
                <Text style={[
                  styles.optionDescription,
                  preferences.theme === 'light' && styles.optionDescriptionActive
                ]}>
                  Bright and clean interface
                </Text>
              </View>
              {preferences.theme === 'light' && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionItem,
                preferences.theme === 'dark' && styles.optionItemActive
              ]}
              onPress={() => updatePreference('theme', 'dark')}
            >
              <MaterialIcons name="dark-mode" size={24} color="#4CAF50" />
              <View style={styles.optionInfo}>
                <Text style={[
                  styles.optionLabel,
                  preferences.theme === 'dark' && styles.optionLabelActive
                ]}>
                  Dark Mode
                </Text>
                <Text style={[
                  styles.optionDescription,
                  preferences.theme === 'dark' && styles.optionDescriptionActive
                ]}>
                  Easy on the eyes (Coming Soon)
                </Text>
              </View>
              {preferences.theme === 'dark' && (
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          
          <View style={styles.optionGroup}>
            {[
              { key: 'en', label: 'English', flag: '🇺🇸' },
              { key: 'es', label: 'Español', flag: '🇪🇸' },
              { key: 'fr', label: 'Français', flag: '🇫🇷' },
            ].map((language) => (
              <TouchableOpacity
                key={language.key}
                style={[
                  styles.optionItem,
                  preferences.language === language.key && styles.optionItemActive
                ]}
                onPress={() => updatePreference('language', language.key)}
              >
                <Text style={styles.flagEmoji}>{language.flag}</Text>
                <View style={styles.optionInfo}>
                  <Text style={[
                    styles.optionLabel,
                    preferences.language === language.key && styles.optionLabelActive
                  ]}>
                    {language.label}
                  </Text>
                </View>
                {preferences.language === language.key && (
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.optionGroup}>
            {[
              { key: 'meals', label: 'Meal Reminders', description: 'Get reminded to log your meals', icon: 'restaurant' },
              { key: 'water', label: 'Water Reminders', description: 'Stay hydrated throughout the day', icon: 'water-drop' },
              { key: 'exercise', label: 'Exercise Reminders', description: 'Get motivated to stay active', icon: 'fitness-center' },
              { key: 'progress', label: 'Progress Updates', description: 'Weekly progress summaries', icon: 'trending-up' },
            ].map((notification) => (
              <View key={notification.key} style={styles.notificationItem}>
                <MaterialIcons name={notification.icon as any} size={24} color="#4CAF50" />
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>{notification.label}</Text>
                  <Text style={styles.notificationDescription}>{notification.description}</Text>
                </View>
                <Switch
                  value={preferences.notifications[notification.key as keyof AppPreferences['notifications']]}
                  onValueChange={(value) => updateNotificationPreference(notification.key as keyof AppPreferences['notifications'], value)}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor={preferences.notifications[notification.key as keyof AppPreferences['notifications']] ? '#FFFFFF' : '#FFFFFF'}
                />
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
  optionGroup: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionItemActive: {
    backgroundColor: '#F1F8E9',
  },
  optionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  optionLabelActive: {
    color: '#4CAF50',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionDescriptionActive: {
    color: '#4CAF50',
  },
  flagEmoji: {
    fontSize: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  notificationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacing: {
    height: 40,
  },
});
