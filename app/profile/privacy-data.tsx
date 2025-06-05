import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function PrivacyDataScreen() {
  const { signOut } = useAuth();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion',
              'Account deletion is not yet implemented. Please contact support to delete your account.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Your data export will be prepared and sent to your email address within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          Alert.alert('Export Requested', 'Your data export has been requested. You will receive an email when it\'s ready.');
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleDataExport}>
            <MaterialIcons name="download" size={24} color="#4CAF50" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Export My Data</Text>
              <Text style={styles.actionDescription}>
                Download all your personal data in a portable format
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="visibility" size={24} color="#4CAF50" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>View Data Usage</Text>
              <Text style={styles.actionDescription}>
                See what data we collect and how it's used
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="edit" size={24} color="#4CAF50" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Manage Data Sharing</Text>
              <Text style={styles.actionDescription}>
                Control how your data is shared with third parties
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="analytics" size={24} color="#4CAF50" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Analytics & Tracking</Text>
              <Text style={styles.actionDescription}>
                Manage analytics and usage tracking preferences
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="location-on" size={24} color="#4CAF50" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Location Data</Text>
              <Text style={styles.actionDescription}>
                Control location-based features and data collection
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="camera-alt" size={24} color="#4CAF50" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Photo Storage</Text>
              <Text style={styles.actionDescription}>
                Manage how food photos are stored and processed
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="privacy-tip" size={24} color="#4CAF50" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Privacy Policy</Text>
              <Text style={styles.actionDescription}>
                Read our complete privacy policy
              </Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="description" size={24} color="#4CAF50" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Terms of Service</Text>
              <Text style={styles.actionDescription}>
                Review our terms and conditions
              </Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="cookie" size={24} color="#4CAF50" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Cookie Policy</Text>
              <Text style={styles.actionDescription}>
                Learn about our cookie usage
              </Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <MaterialIcons name="pause" size={24} color="#FF9800" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Deactivate Account</Text>
              <Text style={styles.actionDescription}>
                Temporarily disable your account
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.dangerItem]} onPress={handleDeleteAccount}>
            <MaterialIcons name="delete-forever" size={24} color="#FF3B30" />
            <View style={styles.actionInfo}>
              <Text style={[styles.actionLabel, styles.dangerLabel]}>Delete Account</Text>
              <Text style={styles.actionDescription}>
                Permanently delete your account and all data
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Data Protection Info */}
        <View style={styles.infoCard}>
          <MaterialIcons name="security" size={32} color="#4CAF50" />
          <Text style={styles.infoTitle}>Your Data is Protected</Text>
          <Text style={styles.infoText}>
            We use industry-standard encryption and security measures to protect your personal information. 
            Your data is never sold to third parties, and you have full control over your privacy settings.
          </Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  actionItem: {
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
  dangerItem: {
    borderWidth: 1,
    borderColor: '#FFE5E5',
    backgroundColor: '#FFFAFA',
  },
  actionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dangerLabel: {
    color: '#FF3B30',
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
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
  bottomSpacing: {
    height: 40,
  },
});
