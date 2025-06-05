import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';

export default function EditAvatarScreen() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to change your profile picture.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera permissions to take a photo.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setIsLoading(true);
    try {
      // Note: This is a placeholder implementation
      // In a real app, you would upload the image to a storage service
      // and update the user's profile with the new image URL
      Alert.alert(
        'Avatar Update',
        'Avatar upload functionality is not yet implemented. This would typically upload the image to cloud storage and update your profile.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeAvatar = () => {
    Alert.alert(
      'Remove Avatar',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSelectedImage(null);
            // In a real app, you would also remove the avatar from the user's profile
            Alert.alert('Avatar Removed', 'Your profile picture has been removed.');
          }
        }
      ]
    );
  };

  const currentImage = selectedImage || user?.imageUrl;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Avatar</Text>
        <TouchableOpacity 
          onPress={handleSaveAvatar} 
          style={[styles.saveButton, (!selectedImage || isLoading) && styles.saveButtonDisabled]}
          disabled={!selectedImage || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Current Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {currentImage ? (
              <Image source={{ uri: currentImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={60} color="#4CAF50" />
              </View>
            )}
          </View>
          
          <Text style={styles.avatarTitle}>Profile Picture</Text>
          <Text style={styles.avatarDescription}>
            Choose a photo that represents you. It will be visible to other users.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImageFromGallery}>
            <MaterialIcons name="photo-library" size={24} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Choose from Gallery</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <MaterialIcons name="camera-alt" size={24} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Take Photo</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {(currentImage || user?.imageUrl) && (
            <TouchableOpacity style={[styles.actionButton, styles.removeButton]} onPress={removeAvatar}>
              <MaterialIcons name="delete" size={24} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.removeButtonText]}>Remove Avatar</Text>
              <MaterialIcons name="chevron-right" size={24} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesSection}>
          <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>
          
          <View style={styles.guidelinesList}>
            {[
              'Use a clear, recent photo of yourself',
              'Make sure your face is visible and well-lit',
              'Avoid group photos or images with text',
              'Keep it appropriate and professional',
              'Square images work best (1:1 aspect ratio)',
            ].map((guideline, index) => (
              <View key={index} style={styles.guidelineItem}>
                <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.guidelineText}>{guideline}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  avatarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  avatarDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  actionsSection: {
    marginBottom: 40,
  },
  actionButton: {
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
  removeButton: {
    borderWidth: 1,
    borderColor: '#FFE5E5',
    backgroundColor: '#FFFAFA',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
    marginLeft: 16,
  },
  removeButtonText: {
    color: '#FF3B30',
  },
  guidelinesSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  guidelinesList: {
    gap: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  guidelineText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
