import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useFoodScan } from '../../contexts/FoodScanContext';
import { useNutrition } from '../../contexts/NutritionContext';

const { height: screenHeight } = Dimensions.get('window');

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const [showResultModal, setShowResultModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showMoreAboutModal, setShowMoreAboutModal] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const {
    flashMode,
    setFlashMode,
    cameraType,
    setCameraType,
    isScanning,
    scanResult,
    scanError,
    scanFood,
    clearScanResult,
  } = useFoodScan();

  const { addMealEntry } = useNutrition();
  const { addToRecentFoods } = useFoodScan();

  // Handle camera activation when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      // Camera becomes active when tab is focused
      setIsCameraActive(true);
      setCameraReady(false);

      // Small delay to ensure proper camera initialization
      const timer = setTimeout(() => {
        setCameraReady(true);
      }, 300);

      return () => {
        // Camera becomes inactive when tab loses focus
        setIsCameraActive(false);
        setCameraReady(false);
        clearTimeout(timer);

        // Clear any ongoing scans
        setIsProcessingImage(false);
        setScanProgress(0);
      };
    }, [])
  );

  useEffect(() => {
    if (scanResult) {
      setShowResultModal(true);
      setPortionMultiplier(1);
    }
  }, [scanResult]);

  // Helper functions for nutrition calculations
  const getAdjustedNutrition = () => {
    if (!scanResult) return null;
    const nutrition = scanResult.foodItem.nutrition;
    return {
      calories: Math.round(nutrition.calories * portionMultiplier),
      protein: Math.round(nutrition.protein * portionMultiplier * 10) / 10,
      carbohydrates: Math.round(nutrition.carbohydrates * portionMultiplier * 10) / 10,
      fat: Math.round(nutrition.fat * portionMultiplier * 10) / 10,
      fiber: nutrition.fiber ? Math.round(nutrition.fiber * portionMultiplier * 10) / 10 : undefined,
      sugar: nutrition.sugar ? Math.round(nutrition.sugar * portionMultiplier * 10) / 10 : undefined,
      sodium: nutrition.sodium ? Math.round(nutrition.sodium * portionMultiplier) : undefined,
    };
  };

  const getActivityEquivalents = () => {
    const adjustedNutrition = getAdjustedNutrition();
    if (!adjustedNutrition) return null;

    const calories = adjustedNutrition.calories;
    return {
      walking: Math.round(calories / 4), // ~4 calories per minute walking
      running: Math.round(calories / 10), // ~10 calories per minute running
      stairs: Math.round(calories / 8), // ~8 calories per minute climbing stairs
      cycling: Math.round(calories / 12), // ~12 calories per minute cycling
    };
  };

  const getConfidenceColor = () => {
    if (!scanResult) return '#666';
    const confidence = scanResult.confidence;
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    return '#FF6B6B';
  };

  const getConfidenceEmoji = () => {
    if (!scanResult) return '😐';
    const confidence = scanResult.confidence;
    if (confidence >= 0.8) return '😊';
    if (confidence >= 0.6) return '😐';
    return '😕';
  };

  const getMacroPercentages = () => {
    const adjustedNutrition = getAdjustedNutrition();
    if (!adjustedNutrition) return { protein: 0, fat: 0, carbs: 0 };

    const { protein, fat, carbohydrates } = adjustedNutrition;

    // Calculate calories from each macro
    const proteinCalories = protein * 4; // 4 calories per gram of protein
    const fatCalories = fat * 9; // 9 calories per gram of fat
    const carbCalories = carbohydrates * 4; // 4 calories per gram of carbs

    const totalMacroCalories = proteinCalories + fatCalories + carbCalories;

    if (totalMacroCalories === 0) return { protein: 0, fat: 0, carbs: 0 };

    return {
      protein: Math.round((proteinCalories / totalMacroCalories) * 100),
      fat: Math.round((fatCalories / totalMacroCalories) * 100),
      carbs: Math.round((carbCalories / totalMacroCalories) * 100),
    };
  };

  useEffect(() => {
    // Animate scanning line
    if (isScanning) {
      const animate = () => {
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isScanning) animate();
        });
      };
      animate();
    }
  }, [isScanning, scanLineAnim]);

  const takePicture = async () => {
    if (!cameraRef.current || isScanning || isProcessingImage || !cameraReady || !isCameraActive) return;

    try {
      setIsProcessingImage(true);
      setScanProgress(10);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      setScanProgress(50);

      // Start food recognition with timeout
      await scanFoodWithTimeout(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    } finally {
      setIsProcessingImage(false);
      setScanProgress(0);
    }
  };

  const scanFoodWithTimeout = async (imageUri: string) => {
    return new Promise<void>((resolve, reject) => {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        Alert.alert(
          'Scan Timeout',
          'Food recognition is taking longer than expected. Would you like to try again?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Timeout')) },
            { text: 'Try Again', onPress: () => scanFoodWithTimeout(imageUri).then(resolve).catch(reject) }
          ]
        );
      }, 30000); // 30 second timeout

      // Progress simulation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      // Start actual scan
      scanFood(imageUri)
        .then(() => {
          clearTimeout(timeoutId);
          clearInterval(progressInterval);
          setScanProgress(100);
          setTimeout(() => setScanProgress(0), 500);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          clearInterval(progressInterval);
          setScanProgress(0);
          reject(error);
        });
    });
  };

  const toggleFlash = () => {
    const modes: ('on' | 'off' | 'auto')[] = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flashMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlashMode(modes[nextIndex]);
  };

  const switchCamera = () => {
    setCameraType(cameraType === 'back' ? 'front' : 'back');
  };

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant access to your photo library to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessingImage(true);
        setScanProgress(20);

        // Start food recognition with timeout
        await scanFoodWithTimeout(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsProcessingImage(false);
      setScanProgress(0);
    }
  };

  const scanAgain = () => {
    setShowResultModal(false);
    clearScanResult();
    setIsProcessingImage(false);
    setScanProgress(0);
    // Reset camera ready state to ensure proper re-initialization
    setCameraReady(false);

    // Only reinitialize if camera is active
    if (isCameraActive) {
      setTimeout(() => setCameraReady(true), 200);
    }
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handlePermissionRequest = async () => {
    try {
      const result = await requestPermission();
      if (result.granted) {
        setCameraReady(false);
        // Small delay to ensure camera initializes properly
        setTimeout(() => setCameraReady(true), 500);
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission. Please try again.');
    }
  };

  const handleAddToMeal = async () => {
    if (!scanResult) return;

    try {
      const mealType = getCurrentMealType();
      const adjustedNutrition = getAdjustedNutrition();

      if (!adjustedNutrition) return;

      addMealEntry({
        id: Date.now().toString(),
        userId: 'current-user', // This should be from auth context
        foodItem: {
          id: scanResult.foodItem.id,
          name: scanResult.foodItem.name,
          brand: scanResult.foodItem.brand,
          servingSize: scanResult.foodItem.nutrition.servingSize,
          servingUnit: 'g',
          macros: {
            calories: adjustedNutrition.calories,
            carbs: adjustedNutrition.carbohydrates,
            protein: adjustedNutrition.protein,
            fat: adjustedNutrition.fat,
            fiber: adjustedNutrition.fiber,
            sugar: adjustedNutrition.sugar,
            sodium: adjustedNutrition.sodium,
          },
          category: scanResult.foodItem.category,
        },
        quantity: portionMultiplier,
        mealType,
        loggedAt: new Date(),
      });

      // Add to recent foods
      await addToRecentFoods(scanResult.foodItem);

      Alert.alert(
        'Success!',
        `${scanResult.foodItem.name} has been added to your ${mealType}.`,
        [{ text: 'OK', onPress: () => {
          setShowResultModal(false);
          clearScanResult();
        }}]
      );
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to add meal. Please try again.');
    }
  };

  const getCurrentMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snacks' => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snacks';
  };

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="camera-alt" size={80} color="#4CAF50" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            CalorAi needs camera access to scan and recognize food items for nutrition tracking.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={handlePermissionRequest}>
            <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        {isCameraActive && permission?.granted ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType as CameraType}
            flash={flashMode}
            onCameraReady={handleCameraReady}
          />
        ) : (
          <View style={[styles.camera, styles.cameraPlaceholder]}>
            <MaterialIcons name="camera-alt" size={80} color="#E0E0E0" />
            <Text style={styles.cameraPlaceholderText}>
              {!permission?.granted ? 'Camera permission required' : 'Initializing camera...'}
            </Text>
          </View>
        )}

        {/* Scanning Overlay */}
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame}>
            <Text style={styles.scanInstructions}>
              Position food item within the frame
            </Text>

            {/* Animated Scanning Line */}
            {isScanning && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 180],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
          </View>
        </View>

        {/* Camera Controls */}
        <View style={styles.cameraControls}>
          {/* Gallery Picker */}
          <TouchableOpacity style={styles.controlButton} onPress={pickImageFromGallery}>
            <MaterialIcons name="photo-library" size={24} color="white" />
          </TouchableOpacity>

          {/* Flash Toggle */}
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <MaterialIcons
              name={flashMode === 'on' ? 'flash-on' : flashMode === 'off' ? 'flash-off' : 'flash-auto'}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={[
              styles.captureButton,
              (isScanning || isProcessingImage || !cameraReady || !isCameraActive) && styles.captureButtonDisabled
            ]}
            onPress={takePicture}
            disabled={isScanning || isProcessingImage || !cameraReady || !isCameraActive}
          >
            {(isScanning || isProcessingImage) ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <MaterialIcons name="camera" size={32} color="white" />
            )}
          </TouchableOpacity>

          {/* Camera Switch */}
          <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
            <MaterialIcons name="flip-camera-ios" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Enhanced Loading Overlay */}
        {(isScanning || isProcessingImage) && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>
                {isProcessingImage ? 'Processing image...' : 'Analyzing food...'}
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      { width: `${scanProgress}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{scanProgress}%</Text>
              </View>

              <Text style={styles.loadingSubtext}>
                This may take up to 30 seconds
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Enhanced Scan Result Modal */}
      <Modal
        visible={showResultModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowResultModal(false);
          clearScanResult();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.enhancedModalContent}>
            {scanResult && (
              <>
                {/* Hero Section with Food Image and Name */}
                <View style={styles.heroSection}>
                  {scanResult.imageUri && (
                    <Image source={{ uri: scanResult.imageUri }} style={styles.foodImage} />
                  )}
                  <View style={styles.heroOverlay}>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => {
                        setShowResultModal(false);
                        clearScanResult();
                      }}
                    >
                      <MaterialIcons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.heroContent}>
                      <Text style={styles.heroSubtitle}>The food in the picture is</Text>
                      <Text style={styles.heroTitle}>{scanResult.foodItem.name}</Text>
                    </View>
                  </View>
                </View>

                {/* Content Section */}
                <ScrollView style={styles.contentSection} showsVerticalScrollIndicator={false}>
                  {/* Confidence and Moderation Card */}
                  <View style={styles.confidenceCard}>
                    <View style={styles.confidenceRow}>
                      <View style={styles.confidenceEmoji}>
                        <Text style={styles.emojiText}>{getConfidenceEmoji()}</Text>
                      </View>
                      <View style={styles.confidenceInfo}>
                        <Text style={styles.moderationText}>Eat in moderation</Text>
                        <Text style={styles.caloriesText}>
                          Calories: {getAdjustedNutrition()?.calories || 0} kcal/100g
                        </Text>
                      </View>
                      <View style={styles.confidenceScore}>
                        <Text style={[styles.confidencePercent, { color: getConfidenceColor() }]}>
                          {Math.round(scanResult.confidence * 100)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Macro Nutrition Cards */}
                  <View style={styles.macroGrid}>
                    <View style={[styles.macroCard, styles.proteinCard]}>
                      <Text style={styles.macroPercentage}>{getMacroPercentages().protein}%</Text>
                      <Text style={styles.macroLabel}>Proteins</Text>
                      <Text style={styles.macroValue}>{getAdjustedNutrition()?.protein || 0}g</Text>
                    </View>
                    <View style={[styles.macroCard, styles.fatCard]}>
                      <Text style={styles.macroPercentage}>{getMacroPercentages().fat}%</Text>
                      <Text style={styles.macroLabel}>Fats</Text>
                      <Text style={styles.macroValue}>{getAdjustedNutrition()?.fat || 0}g</Text>
                    </View>
                    <View style={[styles.macroCard, styles.carbCard]}>
                      <Text style={styles.macroPercentage}>{getMacroPercentages().carbs}%</Text>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <Text style={styles.macroValue}>{getAdjustedNutrition()?.carbohydrates || 0}g</Text>
                    </View>
                  </View>

                  <Text style={styles.disclaimerText}>
                    The above is the ratio of macronutrients, not the weight ratio.
                  </Text>

                  {/* Multiple Foods Section */}
                  {scanResult.isMultipleFood && scanResult.multipleFoods && scanResult.multipleFoods.length > 1 && (
                    <View style={styles.multipleFoodsSection}>
                      <Text style={styles.multipleFoodsTitle}>
                        🍽️ Multiple Foods Detected ({scanResult.multipleFoods.length} items)
                      </Text>
                      <Text style={styles.multipleFoodsSubtitle}>
                        Showing nutrition for: {scanResult.foodItem.name} (main item)
                      </Text>

                      <View style={styles.multipleFoodsList}>
                        {scanResult.multipleFoods.map((food, index) => (
                          <View key={index} style={[
                            styles.multipleFoodItem,
                            food.name === scanResult.foodItem.name && styles.multipleFoodItemMain
                          ]}>
                            <View style={styles.multipleFoodInfo}>
                              <Text style={[
                                styles.multipleFoodName,
                                food.name === scanResult.foodItem.name && styles.multipleFoodNameMain
                              ]}>
                                {food.name}
                                {food.name === scanResult.foodItem.name && ' (Main)'}
                              </Text>
                              <Text style={styles.multipleFoodCalories}>
                                {food.nutrition.calories} cal
                              </Text>
                            </View>
                            {food.name === scanResult.foodItem.name && (
                              <MaterialIcons name="star" size={16} color="#4CAF50" />
                            )}
                          </View>
                        ))}
                      </View>

                      <Text style={styles.multipleFoodsNote}>
                        💡 Tap "More About" to see detailed nutrition for all items
                      </Text>
                    </View>
                  )}

                  {/* Portion Size Section */}
                  <View style={styles.portionSection}>
                    <Text style={styles.portionTitle}>Per 100g</Text>
                    <Text style={styles.portionSubtitle}>
                      The Calories of {scanResult.foodItem.name} are Equivalent to
                    </Text>
                  </View>

                  {/* Activity Equivalents */}
                  <View style={styles.activityGrid}>
                    <View style={styles.activityCard}>
                      <MaterialIcons name="directions-walk" size={24} color="#4CAF50" />
                      <Text style={styles.activityLabel}>Walk</Text>
                      <Text style={styles.activityValue}>{getActivityEquivalents()?.walking || 0}min</Text>
                    </View>
                    <View style={styles.activityCard}>
                      <MaterialIcons name="directions-run" size={24} color="#4CAF50" />
                      <Text style={styles.activityLabel}>Run</Text>
                      <Text style={styles.activityValue}>{getActivityEquivalents()?.running || 0}min</Text>
                    </View>
                    <View style={styles.activityCard}>
                      <MaterialIcons name="stairs" size={24} color="#4CAF50" />
                      <Text style={styles.activityLabel}>Stairs</Text>
                      <Text style={styles.activityValue}>{getActivityEquivalents()?.stairs || 0}min</Text>
                    </View>
                    <View style={styles.activityCard}>
                      <MaterialIcons name="directions-bike" size={24} color="#4CAF50" />
                      <Text style={styles.activityLabel}>Cycling</Text>
                      <Text style={styles.activityValue}>{getActivityEquivalents()?.cycling || 0}min</Text>
                    </View>
                  </View>

                  {/* Action Buttons Row */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity style={styles.scanAgainButton} onPress={scanAgain}>
                      <MaterialIcons name="camera-alt" size={20} color="#4CAF50" />
                      <Text style={styles.scanAgainText}>Scan Again</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.moreAboutButton} onPress={() => setShowMoreAboutModal(true)}>
                      <Text style={styles.moreAboutText}>More About</Text>
                      <MaterialIcons name="arrow-forward" size={16} color="white" />
                    </TouchableOpacity>
                  </View>

                  {/* Add to Meal Button */}
                  <TouchableOpacity style={styles.addToMealButton} onPress={handleAddToMeal}>
                    <MaterialIcons name="add" size={20} color="white" />
                    <Text style={styles.addToMealText}>Add to Meals</Text>
                  </TouchableOpacity>

                  {scanError && (
                    <View style={styles.errorContainer}>
                      <MaterialIcons name="warning" size={16} color="#FF6B6B" />
                      <Text style={styles.errorText}>{scanError}</Text>
                    </View>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* More About Modal */}
      <Modal
        visible={showMoreAboutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMoreAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.enhancedModalContent}>
            {scanResult && (
              <>
                {/* Header */}
                <View style={styles.moreAboutHeader}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowMoreAboutModal(false)}
                  >
                    <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
                  </TouchableOpacity>
                  <Text style={styles.moreAboutTitle}>Detailed Information</Text>
                  <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.moreAboutContent} showsVerticalScrollIndicator={false}>
                  {/* Food Image and Name */}
                  <View style={styles.moreAboutFoodSection}>
                    {scanResult.imageUri && (
                      <Image source={{ uri: scanResult.imageUri }} style={styles.moreAboutFoodImage} />
                    )}
                    <Text style={styles.moreAboutFoodName}>{scanResult.foodItem.name}</Text>
                    <Text style={styles.moreAboutCategory}>{scanResult.foodItem.category || 'Food'}</Text>
                  </View>

                  {/* Nutritional Density Score */}
                  <View style={styles.densityCard}>
                    <Text style={styles.densityTitle}>Nutritional Density Score</Text>
                    <View style={styles.densityScore}>
                      <Text style={styles.densityNumber}>7.2</Text>
                      <Text style={styles.densityOutOf}>/10</Text>
                    </View>
                    <Text style={styles.densityDescription}>
                      This food provides good nutritional value relative to its calorie content.
                    </Text>
                  </View>

                  {/* Health Rating */}
                  <View style={styles.healthCard}>
                    <Text style={styles.healthTitle}>Health Rating</Text>
                    <View style={styles.healthRating}>
                      <MaterialIcons name="favorite" size={20} color="#4CAF50" />
                      <MaterialIcons name="favorite" size={20} color="#4CAF50" />
                      <MaterialIcons name="favorite" size={20} color="#4CAF50" />
                      <MaterialIcons name="favorite-border" size={20} color="#E0E0E0" />
                      <MaterialIcons name="favorite-border" size={20} color="#E0E0E0" />
                    </View>
                    <Text style={styles.healthDescription}>
                      Moderately healthy choice. Rich in essential nutrients.
                    </Text>
                  </View>

                  {/* Micronutrients */}
                  <View style={styles.micronutrientsCard}>
                    <Text style={styles.micronutrientsTitle}>Key Micronutrients</Text>
                    <View style={styles.micronutrientsList}>
                      <View style={styles.micronutrientItem}>
                        <Text style={styles.micronutrientName}>Vitamin C</Text>
                        <Text style={styles.micronutrientValue}>15% DV</Text>
                      </View>
                      <View style={styles.micronutrientItem}>
                        <Text style={styles.micronutrientName}>Iron</Text>
                        <Text style={styles.micronutrientValue}>8% DV</Text>
                      </View>
                      <View style={styles.micronutrientItem}>
                        <Text style={styles.micronutrientName}>Calcium</Text>
                        <Text style={styles.micronutrientValue}>12% DV</Text>
                      </View>
                      <View style={styles.micronutrientItem}>
                        <Text style={styles.micronutrientName}>Potassium</Text>
                        <Text style={styles.micronutrientValue}>6% DV</Text>
                      </View>
                    </View>
                  </View>

                  {/* Dietary Classifications */}
                  <View style={styles.dietaryCard}>
                    <Text style={styles.dietaryTitle}>Dietary Information</Text>
                    <View style={styles.dietaryTags}>
                      <View style={[styles.dietaryTag, styles.veganTag]}>
                        <MaterialIcons name="eco" size={16} color="#4CAF50" />
                        <Text style={styles.dietaryTagText}>Vegan</Text>
                      </View>
                      <View style={[styles.dietaryTag, styles.glutenFreeTag]}>
                        <MaterialIcons name="no-meals" size={16} color="#FF9800" />
                        <Text style={styles.dietaryTagText}>Gluten-Free</Text>
                      </View>
                      <View style={[styles.dietaryTag, styles.lowSodiumTag]}>
                        <MaterialIcons name="water-drop" size={16} color="#2196F3" />
                        <Text style={styles.dietaryTagText}>Low Sodium</Text>
                      </View>
                    </View>
                  </View>

                  {/* Health Benefits */}
                  <View style={styles.benefitsCard}>
                    <Text style={styles.benefitsTitle}>Health Benefits</Text>
                    <View style={styles.benefitsList}>
                      <View style={styles.benefitItem}>
                        <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.benefitText}>Rich in antioxidants</Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.benefitText}>Supports immune system</Text>
                      </View>
                      <View style={styles.benefitItem}>
                        <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.benefitText}>Good source of fiber</Text>
                      </View>
                    </View>
                  </View>

                  {/* Alternative Suggestions */}
                  <View style={styles.alternativesCard}>
                    <Text style={styles.alternativesTitle}>Healthier Alternatives</Text>
                    <View style={styles.alternativesList}>
                      <TouchableOpacity style={styles.alternativeItem}>
                        <Text style={styles.alternativeName}>Quinoa Bowl</Text>
                        <Text style={styles.alternativeCalories}>280 cal</Text>
                        <MaterialIcons name="arrow-forward" size={16} color="#666" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.alternativeItem}>
                        <Text style={styles.alternativeName}>Greek Yogurt</Text>
                        <Text style={styles.alternativeCalories}>150 cal</Text>
                        <MaterialIcons name="arrow-forward" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Permission Modal */}
      <Modal
        visible={showPermissionModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.permissionModalContent}>
            <MaterialIcons name="camera-alt" size={60} color="#4CAF50" />
            <Text style={styles.permissionModalTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionModalText}>
              To scan and recognize food items, CalorAi needs access to your camera.
            </Text>
            <View style={styles.permissionModalButtons}>
              <TouchableOpacity
                style={styles.permissionModalButton}
                onPress={() => setShowPermissionModal(false)}
              >
                <Text style={styles.permissionModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.permissionModalButton, styles.permissionModalButtonPrimary]}
                onPress={async () => {
                  setShowPermissionModal(false);
                  await handlePermissionRequest();
                }}
              >
                <Text style={[styles.permissionModalButtonText, styles.permissionModalButtonTextPrimary]}>
                  Grant Access
                </Text>
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
    backgroundColor: '#000',
  },
  // Camera Styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 200,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanInstructions: {
    position: 'absolute',
    bottom: -40,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#4CAF50',
    opacity: 0.8,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  captureButtonDisabled: {
    backgroundColor: '#A5A5A5',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingSubtext: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 8,
  },
  progressContainer: {
    width: 200,
    marginTop: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  // Permission Styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F8F9FA',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: screenHeight * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  resultContent: {
    flex: 1,
  },
  foodInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  foodName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  confidence: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  nutritionInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  servingInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  servingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Permission Modal Styles
  permissionModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  permissionModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  permissionModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  permissionModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  permissionModalButtonPrimary: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  permissionModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  permissionModalButtonTextPrimary: {
    color: 'white',
  },

  // Enhanced Modal Styles
  enhancedModalContent: {
    flex: 1,
    backgroundColor: 'white',
  },

  // Hero Section Styles
  heroSection: {
    height: 280,
    position: 'relative',
    backgroundColor: '#F8F9FA',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Content Section Styles
  contentSection: {
    flex: 1,
    padding: 20,
  },

  // Confidence Card Styles
  confidenceCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confidenceEmoji: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emojiText: {
    fontSize: 24,
  },
  confidenceInfo: {
    flex: 1,
  },
  moderationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  caloriesText: {
    fontSize: 14,
    color: '#666',
  },
  confidenceScore: {
    alignItems: 'flex-end',
  },
  confidencePercent: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Macro Grid Styles
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  proteinCard: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  fatCard: {
    borderColor: '#FFB347',
    backgroundColor: '#FFF8F0',
  },
  carbCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0F8F0',
  },
  macroPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Disclaimer and Portion Styles
  disclaimerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  portionSection: {
    marginBottom: 20,
  },
  portionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  portionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  // Activity Grid Styles
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  activityCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  activityLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  activityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Action Buttons Styles
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  scanAgainButton: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    gap: 8,
  },
  scanAgainText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  moreAboutButton: {
    flex: 1,
    backgroundColor: '#666',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  moreAboutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addToMealButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  addToMealText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Error Container Styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },

  // More About Modal Styles
  moreAboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  moreAboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  moreAboutContent: {
    flex: 1,
    padding: 20,
  },
  moreAboutFoodSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  moreAboutFoodImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  moreAboutFoodName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  moreAboutCategory: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },

  // Density Card Styles
  densityCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  densityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  densityScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  densityNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4CAF50',
  },
  densityOutOf: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  densityDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Health Card Styles
  healthCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  healthRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 4,
  },
  healthDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Micronutrients Styles
  micronutrientsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  micronutrientsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  micronutrientsList: {
    gap: 12,
  },
  micronutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  micronutrientName: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  micronutrientValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },

  // Dietary Classifications Styles
  dietaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dietaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  veganTag: {
    backgroundColor: '#E8F5E8',
  },
  glutenFreeTag: {
    backgroundColor: '#FFF3E0',
  },
  lowSodiumTag: {
    backgroundColor: '#E3F2FD',
  },
  dietaryTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1A1A1A',
  },

  // Benefits Styles
  benefitsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#1A1A1A',
    flex: 1,
  },

  // Alternatives Styles
  alternativesCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  alternativesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  alternativesList: {
    gap: 12,
  },
  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  alternativeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    flex: 1,
  },
  alternativeCalories: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },

  // Multiple Foods Styles
  multipleFoodsSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  multipleFoodsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  multipleFoodsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  multipleFoodsList: {
    gap: 8,
    marginBottom: 16,
  },
  multipleFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  multipleFoodItemMain: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  multipleFoodInfo: {
    flex: 1,
  },
  multipleFoodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  multipleFoodNameMain: {
    color: '#4CAF50',
  },
  multipleFoodCalories: {
    fontSize: 12,
    color: '#666',
  },
  multipleFoodsNote: {
    fontSize: 12,
    color: '#4CAF50',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Camera Placeholder Styles
  cameraPlaceholder: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholderText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});
