import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

export default function DataExportScreen() {
  const { user } = useUser();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedData, setSelectedData] = useState<string[]>([
    'profile',
    'nutrition',
    'exercise',
    'progress'
  ]);

  const dataTypes = [
    {
      key: 'profile',
      title: 'Profile Information',
      description: 'Personal details, goals, and preferences',
      icon: 'person',
      size: '< 1 MB'
    },
    {
      key: 'nutrition',
      title: 'Nutrition Data',
      description: 'Food logs, meals, and calorie tracking',
      icon: 'restaurant',
      size: '2-5 MB'
    },
    {
      key: 'exercise',
      title: 'Exercise Data',
      description: 'Workout logs and activity tracking',
      icon: 'fitness-center',
      size: '1-3 MB'
    },
    {
      key: 'progress',
      title: 'Progress Data',
      description: 'Weight tracking, measurements, and analytics',
      icon: 'trending-up',
      size: '< 1 MB'
    },
    {
      key: 'photos',
      title: 'Food Photos',
      description: 'Images of meals and food items',
      icon: 'photo-library',
      size: '10-50 MB'
    },
    {
      key: 'recipes',
      title: 'Recipes & Favorites',
      description: 'Saved recipes and meal plans',
      icon: 'book',
      size: '< 1 MB'
    }
  ];

  const toggleDataType = (key: string) => {
    setSelectedData(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    );
  };

  const handleExportData = async () => {
    if (selectedData.length === 0) {
      Alert.alert('Error', 'Please select at least one data type to export');
      return;
    }

    Alert.alert(
      'Export Data',
      `Export ${selectedData.length} data type(s) to your email address?\n\nYou will receive a download link within 24 hours.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: async () => {
            setIsExporting(true);
            try {
              // Simulate export process
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              Alert.alert(
                'Export Requested',
                `Your data export has been requested. You will receive an email at ${user?.emailAddresses[0]?.emailAddress} when it's ready for download.`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to request data export. Please try again.');
            } finally {
              setIsExporting(false);
            }
          }
        }
      ]
    );
  };

  const estimatedSize = selectedData.reduce((total, key) => {
    const dataType = dataTypes.find(dt => dt.key === key);
    if (dataType?.size.includes('MB')) {
      const size = parseInt(dataType.size.split('-')[0] || dataType.size.split('<')[1] || '1');
      return total + size;
    }
    return total + 0.5; // For < 1 MB items
  }, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Data</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialIcons name="download" size={32} color="#4CAF50" />
          <Text style={styles.infoTitle}>Export Your Data</Text>
          <Text style={styles.infoText}>
            Download a copy of your personal data in a portable format. 
            You'll receive a secure download link via email within 24 hours.
          </Text>
        </View>

        {/* Data Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Data to Export</Text>
          <Text style={styles.sectionDescription}>
            Choose which types of data you want to include in your export
          </Text>
          
          <View style={styles.dataTypesList}>
            {dataTypes.map((dataType) => (
              <TouchableOpacity
                key={dataType.key}
                style={[
                  styles.dataTypeItem,
                  selectedData.includes(dataType.key) && styles.dataTypeItemSelected
                ]}
                onPress={() => toggleDataType(dataType.key)}
              >
                <MaterialIcons 
                  name={dataType.icon as any} 
                  size={24} 
                  color={selectedData.includes(dataType.key) ? '#4CAF50' : '#666'} 
                />
                <View style={styles.dataTypeInfo}>
                  <Text style={[
                    styles.dataTypeTitle,
                    selectedData.includes(dataType.key) && styles.dataTypeTitleSelected
                  ]}>
                    {dataType.title}
                  </Text>
                  <Text style={styles.dataTypeDescription}>
                    {dataType.description}
                  </Text>
                  <Text style={styles.dataTypeSize}>
                    Estimated size: {dataType.size}
                  </Text>
                </View>
                <MaterialIcons 
                  name={selectedData.includes(dataType.key) ? 'check-box' : 'check-box-outline-blank'} 
                  size={24} 
                  color={selectedData.includes(dataType.key) ? '#4CAF50' : '#E0E0E0'} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Export Summary */}
        {selectedData.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Export Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Selected items:</Text>
              <Text style={styles.summaryValue}>{selectedData.length} data types</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated size:</Text>
              <Text style={styles.summaryValue}>~{estimatedSize.toFixed(1)} MB</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery method:</Text>
              <Text style={styles.summaryValue}>Email download link</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Email address:</Text>
              <Text style={styles.summaryValue}>
                {user?.emailAddresses[0]?.emailAddress}
              </Text>
            </View>
          </View>
        )}

        {/* Export Button */}
        <TouchableOpacity
          style={[
            styles.exportButton,
            (selectedData.length === 0 || isExporting) && styles.exportButtonDisabled
          ]}
          onPress={handleExportData}
          disabled={selectedData.length === 0 || isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="file-download" size={20} color="white" />
              <Text style={styles.exportButtonText}>Request Export</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Important Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Important Notes</Text>
          
          <View style={styles.notesList}>
            {[
              'Export links are valid for 7 days after generation',
              'Data is provided in JSON and CSV formats when applicable',
              'Photos are included as a separate ZIP file',
              'Personal information is encrypted during transfer',
              'You can request exports once per week',
              'Contact support if you need assistance with your export',
            ].map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <MaterialIcons name="info" size={16} color="#4CAF50" />
                <Text style={styles.noteText}>{note}</Text>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  dataTypesList: {
    gap: 12,
  },
  dataTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dataTypeItemSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  dataTypeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  dataTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dataTypeTitleSelected: {
    color: '#4CAF50',
  },
  dataTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  dataTypeSize: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exportButtonDisabled: {
    backgroundColor: '#A5A5A5',
    shadowColor: '#A5A5A5',
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  notesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
