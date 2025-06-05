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

interface NotificationSettings {
  meals: {
    enabled: boolean;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  water: {
    enabled: boolean;
    interval: number; // hours
    startTime: string;
    endTime: string;
  };
  exercise: {
    enabled: boolean;
    reminderTime: string;
    restDayReminders: boolean;
  };
  progress: {
    enabled: boolean;
    weeklyReports: boolean;
    achievements: boolean;
    streakReminders: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  meals: {
    enabled: true,
    breakfast: '08:00',
    lunch: '12:30',
    dinner: '18:30',
    snacks: '15:00',
  },
  water: {
    enabled: true,
    interval: 2,
    startTime: '08:00',
    endTime: '22:00',
  },
  exercise: {
    enabled: true,
    reminderTime: '18:00',
    restDayReminders: false,
  },
  progress: {
    enabled: true,
    weeklyReports: true,
    achievements: true,
    streakReminders: true,
  },
};

export default function NotificationsScreen() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (user) {
        const stored = await AsyncStorage.getItem(`notification_settings_${user.id}`);
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await AsyncStorage.setItem(`notification_settings_${user.id}`, JSON.stringify(settings));
        Alert.alert('Success', 'Notification settings saved successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category: keyof NotificationSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading notification settings...</Text>
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          onPress={saveSettings} 
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
        {/* Meal Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="restaurant" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Meal Reminders</Text>
            <Switch
              value={settings.meals.enabled}
              onValueChange={(value) => updateSetting('meals', 'enabled', value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {settings.meals.enabled && (
            <View style={styles.settingsGroup}>
              <Text style={styles.groupDescription}>
                Get reminded to log your meals at these times
              </Text>
              
              {[
                { key: 'breakfast', label: 'Breakfast', icon: 'free-breakfast' },
                { key: 'lunch', label: 'Lunch', icon: 'lunch-dining' },
                { key: 'dinner', label: 'Dinner', icon: 'dinner-dining' },
                { key: 'snacks', label: 'Snacks', icon: 'cookie' },
              ].map((meal) => (
                <View key={meal.key} style={styles.timeItem}>
                  <MaterialIcons name={meal.icon as any} size={20} color="#666" />
                  <Text style={styles.timeLabel}>{meal.label}</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>
                      {settings.meals[meal.key as keyof typeof settings.meals] as string}
                    </Text>
                    <MaterialIcons name="access-time" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Water Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="water-drop" size={24} color="#2196F3" />
            <Text style={styles.sectionTitle}>Water Reminders</Text>
            <Switch
              value={settings.water.enabled}
              onValueChange={(value) => updateSetting('water', 'enabled', value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {settings.water.enabled && (
            <View style={styles.settingsGroup}>
              <Text style={styles.groupDescription}>
                Stay hydrated with regular water reminders
              </Text>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Reminder Interval</Text>
                <View style={styles.intervalButtons}>
                  {[1, 2, 3, 4].map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      style={[
                        styles.intervalButton,
                        settings.water.interval === hours && styles.intervalButtonActive
                      ]}
                      onPress={() => updateSetting('water', 'interval', hours)}
                    >
                      <Text style={[
                        styles.intervalButtonText,
                        settings.water.interval === hours && styles.intervalButtonTextActive
                      ]}>
                        {hours}h
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.timeRange}>
                <View style={styles.timeRangeItem}>
                  <Text style={styles.timeRangeLabel}>Start Time</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{settings.water.startTime}</Text>
                    <MaterialIcons name="access-time" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                <View style={styles.timeRangeItem}>
                  <Text style={styles.timeRangeLabel}>End Time</Text>
                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeText}>{settings.water.endTime}</Text>
                    <MaterialIcons name="access-time" size={16} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Exercise Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="fitness-center" size={24} color="#FF9800" />
            <Text style={styles.sectionTitle}>Exercise Reminders</Text>
            <Switch
              value={settings.exercise.enabled}
              onValueChange={(value) => updateSetting('exercise', 'enabled', value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {settings.exercise.enabled && (
            <View style={styles.settingsGroup}>
              <Text style={styles.groupDescription}>
                Get motivated to stay active with exercise reminders
              </Text>
              
              <View style={styles.timeItem}>
                <MaterialIcons name="schedule" size={20} color="#666" />
                <Text style={styles.timeLabel}>Daily Reminder</Text>
                <TouchableOpacity style={styles.timeButton}>
                  <Text style={styles.timeText}>{settings.exercise.reminderTime}</Text>
                  <MaterialIcons name="access-time" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Rest Day Reminders</Text>
                <Text style={styles.switchDescription}>
                  Get gentle reminders even on rest days
                </Text>
                <Switch
                  value={settings.exercise.restDayReminders}
                  onValueChange={(value) => updateSetting('exercise', 'restDayReminders', value)}
                  trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          )}
        </View>

        {/* Progress Updates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="trending-up" size={24} color="#9C27B0" />
            <Text style={styles.sectionTitle}>Progress Updates</Text>
            <Switch
              value={settings.progress.enabled}
              onValueChange={(value) => updateSetting('progress', 'enabled', value)}
              trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {settings.progress.enabled && (
            <View style={styles.settingsGroup}>
              <Text style={styles.groupDescription}>
                Stay motivated with progress updates and achievements
              </Text>
              
              {[
                { key: 'weeklyReports', label: 'Weekly Reports', description: 'Get weekly progress summaries' },
                { key: 'achievements', label: 'Achievements', description: 'Celebrate your milestones' },
                { key: 'streakReminders', label: 'Streak Reminders', description: 'Maintain your logging streaks' },
              ].map((item) => (
                <View key={item.key} style={styles.switchItem}>
                  <View style={styles.switchInfo}>
                    <Text style={styles.switchLabel}>{item.label}</Text>
                    <Text style={styles.switchDescription}>{item.description}</Text>
                  </View>
                  <Switch
                    value={settings.progress[item.key as keyof typeof settings.progress] as boolean}
                    onValueChange={(value) => updateSetting('progress', item.key, value)}
                    trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}
            </View>
          )}
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginLeft: 12,
  },
  settingsGroup: {
    marginTop: 8,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
    marginLeft: 12,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
    marginRight: 4,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  intervalButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  intervalButtonTextActive: {
    color: '#4CAF50',
  },
  timeRange: {
    flexDirection: 'row',
    gap: 16,
  },
  timeRangeItem: {
    flex: 1,
  },
  timeRangeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacing: {
    height: 40,
  },
});
