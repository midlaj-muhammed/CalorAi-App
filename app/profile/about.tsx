import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Constants from 'expo-constants';

export default function AboutScreen() {
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  const handleLinkPress = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', `Cannot open ${title}`);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to open ${title}`);
    }
  };

  const handleContactSupport = () => {
    const email = 'support@calorai.com';
    const subject = 'CalorAi Support Request';
    const body = `App Version: ${appVersion}\nBuild: ${buildNumber}\n\nDescribe your issue or question:\n`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    handleLinkPress(mailtoUrl, 'Email');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About CalorAi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appInfoCard}>
          <View style={styles.appIcon}>
            <MaterialIcons name="restaurant" size={48} color="#4CAF50" />
          </View>
          <Text style={styles.appName}>CalorAi</Text>
          <Text style={styles.appTagline}>AI-Powered Nutrition Tracking</Text>
          <Text style={styles.appVersion}>Version {appVersion} (Build {buildNumber})</Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            CalorAi is an intelligent nutrition tracking app that uses AI-powered image recognition 
            to simplify food logging. Simply take a photo of your meal, and our advanced AI will 
            automatically identify the food items and calculate nutritional information.
          </Text>
          <Text style={styles.aboutText}>
            Our mission is to make healthy eating accessible and effortless for everyone by 
            leveraging cutting-edge technology to remove the barriers to nutrition tracking.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          {[
            { icon: 'camera-alt', title: 'AI Food Recognition', description: 'Snap photos to instantly log meals' },
            { icon: 'analytics', title: 'Smart Analytics', description: 'Track progress with detailed insights' },
            { icon: 'fitness-center', title: 'Exercise Integration', description: 'Log workouts and track calories burned' },
            { icon: 'water-drop', title: 'Hydration Tracking', description: 'Monitor daily water intake' },
            { icon: 'restaurant', title: 'Recipe Generation', description: 'AI-powered custom recipe creation' },
            { icon: 'trending-up', title: 'Progress Tracking', description: 'Monitor your health journey' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialIcons name={feature.icon as any} size={24} color="#4CAF50" />
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Legal & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Support</Text>
          
          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://calorai.com/privacy', 'Privacy Policy')}
          >
            <MaterialIcons name="privacy-tip" size={24} color="#4CAF50" />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <MaterialIcons name="open-in-new" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://calorai.com/terms', 'Terms of Service')}
          >
            <MaterialIcons name="description" size={24} color="#4CAF50" />
            <Text style={styles.linkText}>Terms of Service</Text>
            <MaterialIcons name="open-in-new" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={handleContactSupport}
          >
            <MaterialIcons name="support" size={24} color="#4CAF50" />
            <Text style={styles.linkText}>Contact Support</Text>
            <MaterialIcons name="email" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkItem}
            onPress={() => handleLinkPress('https://calorai.com', 'CalorAi Website')}
          >
            <MaterialIcons name="language" size={24} color="#4CAF50" />
            <Text style={styles.linkText}>Visit Our Website</Text>
            <MaterialIcons name="open-in-new" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Technology */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Powered By</Text>
          
          <View style={styles.techGrid}>
            <View style={styles.techItem}>
              <Text style={styles.techName}>Google Gemini</Text>
              <Text style={styles.techDescription}>AI Food Recognition</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>Expo</Text>
              <Text style={styles.techDescription}>Mobile Framework</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>Supabase</Text>
              <Text style={styles.techDescription}>Backend & Database</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>Clerk</Text>
              <Text style={styles.techDescription}>Authentication</Text>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 CalorAi. All rights reserved.
          </Text>
          <Text style={styles.copyrightText}>
            Made with ❤️ for healthier living
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
  appInfoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
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
  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  featureItem: {
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
  featureInfo: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
  },
  linkItem: {
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
  linkText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginLeft: 16,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  techItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    minWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  techName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  techDescription: {
    fontSize: 14,
    color: '#666',
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  copyrightText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});
