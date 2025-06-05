import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

export default function HelpSupportScreen() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supportCategories = [
    {
      key: 'technical',
      title: 'Technical Issues',
      description: 'App crashes, login problems, sync issues',
      icon: 'bug-report',
    },
    {
      key: 'account',
      title: 'Account & Billing',
      description: 'Profile settings, subscription, payments',
      icon: 'account-circle',
    },
    {
      key: 'features',
      title: 'Features & Usage',
      description: 'How to use app features, tutorials',
      icon: 'help',
    },
    {
      key: 'data',
      title: 'Data & Privacy',
      description: 'Data export, privacy concerns, GDPR',
      icon: 'privacy-tip',
    },
    {
      key: 'feedback',
      title: 'Feedback & Suggestions',
      description: 'Feature requests, improvements',
      icon: 'feedback',
    },
    {
      key: 'other',
      title: 'Other',
      description: 'General questions and other topics',
      icon: 'chat',
    },
  ];

  const quickActions = [
    {
      title: 'FAQ',
      description: 'Find answers to common questions',
      icon: 'quiz',
      action: () => handleLinkPress('https://calorai.com/faq', 'FAQ'),
    },
    {
      title: 'User Guide',
      description: 'Learn how to use CalorAi effectively',
      icon: 'menu-book',
      action: () => handleLinkPress('https://calorai.com/guide', 'User Guide'),
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step tutorials',
      icon: 'play-circle',
      action: () => handleLinkPress('https://calorai.com/tutorials', 'Video Tutorials'),
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: 'forum',
      action: () => handleLinkPress('https://community.calorai.com', 'Community Forum'),
    },
  ];

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

  const handleSubmitTicket = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a support category');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Error', 'Please describe your issue or question');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate ticket submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Support Ticket Submitted',
        'Thank you for contacting us! We\'ve received your support request and will respond within 24 hours.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallSupport = () => {
    const phoneNumber = '+1-555-CALORAI';
    Alert.alert(
      'Call Support',
      `Call our support team at ${phoneNumber}?\n\nSupport hours: Mon-Fri 9AM-6PM EST`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Linking.openURL(`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`)
        }
      ]
    );
  };

  const handleEmailSupport = () => {
    const email = 'support@calorai.com';
    const subject = 'CalorAi Support Request';
    const body = `User: ${user?.emailAddresses[0]?.emailAddress}\nCategory: ${selectedCategory || 'General'}\n\nMessage:\n${message}`;
    
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.action}
              >
                <MaterialIcons name={action.icon as any} size={32} color="#4CAF50" />
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <View style={styles.contactOptions}>
            <TouchableOpacity style={styles.contactOption} onPress={handleEmailSupport}>
              <MaterialIcons name="email" size={24} color="#4CAF50" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactDescription}>support@calorai.com</Text>
                <Text style={styles.contactTime}>Response within 24 hours</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactOption} onPress={handleCallSupport}>
              <MaterialIcons name="phone" size={24} color="#4CAF50" />
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Phone Support</Text>
                <Text style={styles.contactDescription}>+1-555-CALORAI</Text>
                <Text style={styles.contactTime}>Mon-Fri 9AM-6PM EST</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Ticket */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submit Support Ticket</Text>
          
          <View style={styles.ticketForm}>
            <Text style={styles.formLabel}>Category</Text>
            <View style={styles.categoriesGrid}>
              {supportCategories.map((category) => (
                <TouchableOpacity
                  key={category.key}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.key && styles.categoryCardSelected
                  ]}
                  onPress={() => setSelectedCategory(category.key)}
                >
                  <MaterialIcons 
                    name={category.icon as any} 
                    size={20} 
                    color={selectedCategory === category.key ? '#4CAF50' : '#666'} 
                  />
                  <Text style={[
                    styles.categoryTitle,
                    selectedCategory === category.key && styles.categoryTitleSelected
                  ]}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Describe your issue</Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Please provide as much detail as possible about your issue or question..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedCategory || !message.trim() || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmitTicket}
              disabled={!selectedCategory || !message.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="send" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Submit Ticket</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfoCard}>
          <Text style={styles.appInfoTitle}>App Information</Text>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Version:</Text>
            <Text style={styles.appInfoValue}>1.0.0 (Build 1)</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>User ID:</Text>
            <Text style={styles.appInfoValue}>{user?.id?.slice(-8) || 'N/A'}</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Email:</Text>
            <Text style={styles.appInfoValue}>
              {user?.emailAddresses[0]?.emailAddress || 'N/A'}
            </Text>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  contactOptions: {
    gap: 12,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 2,
  },
  contactTime: {
    fontSize: 12,
    color: '#666',
  },
  ticketForm: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryCardSelected: {
    backgroundColor: '#F1F8E9',
    borderColor: '#4CAF50',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  categoryTitleSelected: {
    color: '#4CAF50',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 20,
    minHeight: 120,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#A5A5A5',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  bottomSpacing: {
    height: 40,
  },
});
