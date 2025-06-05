import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { geminiService, FoodRecognitionResult, GeminiResponse } from '../services/geminiService';

// Types
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: string;
  servingWeight?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  nutrition: NutritionInfo;
  category?: string;
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  isCustom?: boolean;
  lastUsed?: Date;
  frequency?: number;
}

export interface ScanResult {
  id: string;
  foodItem: FoodItem;
  confidence: number;
  timestamp: Date;
  imageUri?: string;
  multipleFoods?: FoodItem[];
  isMultipleFood?: boolean;
}

export interface ScanMode {
  type: 'camera' | 'barcode' | 'search';
  isActive: boolean;
}

// Context interface
interface FoodScanContextType {
  scanMode: ScanMode;
  setScanMode: (mode: ScanMode) => void;
  flashMode: 'on' | 'off' | 'auto';
  setFlashMode: (mode: 'on' | 'off' | 'auto') => void;
  cameraType: 'front' | 'back';
  setCameraType: (type: 'front' | 'back') => void;
  isScanning: boolean;
  scanResult: ScanResult | null;
  scanError: string | null;
  scanFood: (imageUri: string) => Promise<void>;
  scanBarcode: (barcode: string) => Promise<void>;
  searchFood: (query: string) => Promise<FoodItem[]>;
  recentFoods: FoodItem[];
  customFoods: FoodItem[];
  addCustomFood: (food: Omit<FoodItem, 'id' | 'isCustom'>) => Promise<void>;
  scanHistory: ScanResult[];
  clearScanHistory: () => Promise<void>;
  clearScanResult: () => void;
  addToRecentFoods: (food: FoodItem) => Promise<void>;
  updateScanResult: (updates: Partial<FoodItem>) => void;
}

const FoodScanContext = createContext<FoodScanContextType | undefined>(undefined);

export function useFoodScan() {
  const context = useContext(FoodScanContext);
  if (context === undefined) {
    throw new Error('useFoodScan must be used within a FoodScanProvider');
  }
  return context;
}

interface FoodScanProviderProps {
  children: ReactNode;
}

export function FoodScanProvider({ children }: FoodScanProviderProps) {
  const [scanMode, setScanMode] = useState<ScanMode>({ type: 'camera', isActive: false });
  const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('off');
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [recentFoods, setRecentFoods] = useState<FoodItem[]>([]);
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [recentData, customData, historyData] = await Promise.all([
        AsyncStorage.getItem('recentFoods'),
        AsyncStorage.getItem('customFoods'),
        AsyncStorage.getItem('scanHistory'),
      ]);

      if (recentData) {
        const parsed = JSON.parse(recentData);
        const withDates = parsed.map((food: any) => ({
          ...food,
          lastUsed: food.lastUsed ? new Date(food.lastUsed) : undefined,
        }));
        setRecentFoods(withDates);
      }

      if (customData) setCustomFoods(JSON.parse(customData));

      if (historyData) {
        const parsed = JSON.parse(historyData);
        const withDates = parsed.map((scan: any) => ({
          ...scan,
          timestamp: new Date(scan.timestamp),
        }));
        setScanHistory(withDates);
      }
    } catch (error) {
      console.error('Error loading stored food data:', error);
    }
  };



  const convertGeminiResultToFoodItem = (result: FoodRecognitionResult): FoodItem => {
    return {
      id: Date.now().toString(),
      name: result.foodName,
      nutrition: result.nutrition,
      category: result.category,
      brand: result.brand || undefined,
    };
  };

  const scanFood = async (imageUri: string): Promise<void> => {
    setIsScanning(true);
    setScanError(null);

    try {
      console.log('Starting food recognition for image:', imageUri);

      const response: GeminiResponse = await geminiService.recognizeFood(imageUri);

      if (response.success && response.result) {
        const foodItem = convertGeminiResultToFoodItem(response.result);
        let multipleFoods: FoodItem[] | undefined;
        let isMultipleFood = false;

        // Check if multiple foods were detected
        if (response.multipleResult && response.multipleResult.foods.length > 1) {
          multipleFoods = response.multipleResult.foods.map(convertGeminiResultToFoodItem);
          isMultipleFood = true;
          console.log(`Multiple foods detected: ${response.multipleResult.foods.map(f => f.foodName).join(', ')}`);
        }

        const scanResult: ScanResult = {
          id: Date.now().toString(),
          foodItem,
          confidence: response.result.confidence,
          timestamp: new Date(),
          imageUri,
          multipleFoods,
          isMultipleFood,
        };

        setScanResult(scanResult);

        const newHistory = [scanResult, ...scanHistory.slice(0, 49)];
        setScanHistory(newHistory);
        await AsyncStorage.setItem('scanHistory', JSON.stringify(newHistory));

        if (isMultipleFood) {
          console.log('Multiple food recognition successful:', multipleFoods?.map(f => f.name).join(', '));
        } else {
          console.log('Food recognition successful:', response.result.foodName);
        }
      } else {
        console.log('Food recognition failed, using fallback');
        const fallbackResult = geminiService.getFallbackNutrition('unknown');
        const foodItem = convertGeminiResultToFoodItem(fallbackResult);

        const scanResult: ScanResult = {
          id: Date.now().toString(),
          foodItem,
          confidence: fallbackResult.confidence,
          timestamp: new Date(),
          imageUri,
        };

        setScanResult(scanResult);
        setScanError(response.error || 'Could not recognize food clearly. Please try again with better lighting.');
      }

    } catch (error) {
      console.error('Error in food scanning:', error);
      setScanError(error instanceof Error ? error.message : 'Scan failed');

      const fallbackResult = geminiService.getFallbackNutrition('unknown');
      const foodItem = convertGeminiResultToFoodItem(fallbackResult);

      const scanResult: ScanResult = {
        id: Date.now().toString(),
        foodItem,
        confidence: 0.1,
        timestamp: new Date(),
        imageUri,
      };

      setScanResult(scanResult);
    } finally {
      setIsScanning(false);
    }
  };

  const scanBarcode = async (barcode: string): Promise<void> => {
    setIsScanning(true);
    setScanError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResult: ScanResult = {
        id: Date.now().toString(),
        foodItem: {
          id: Date.now().toString(),
          name: 'Organic Granola Bar',
          nutrition: {
            calories: 140,
            protein: 3,
            carbohydrates: 18,
            fat: 6,
            fiber: 3,
            sugar: 8,
            sodium: 95,
            servingSize: '1 bar (35g)',
            servingWeight: 35,
          },
          category: 'snack',
          brand: 'Nature Valley',
          barcode,
        },
        confidence: 0.98,
        timestamp: new Date(),
      };

      setScanResult(mockResult);
    } catch (error) {
      setScanError(error instanceof Error ? error.message : 'Barcode scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const searchFood = async (query: string): Promise<FoodItem[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      return [
        {
          id: '1',
          name: 'Chicken Breast',
          nutrition: {
            calories: 165,
            protein: 31,
            carbohydrates: 0,
            fat: 3.6,
            sodium: 74,
            servingSize: '100g',
            servingWeight: 100,
          },
          category: 'protein',
        },
        {
          id: '2',
          name: 'Brown Rice',
          nutrition: {
            calories: 112,
            protein: 2.6,
            carbohydrates: 23,
            fat: 0.9,
            fiber: 1.8,
            sodium: 5,
            servingSize: '100g cooked',
            servingWeight: 100,
          },
          category: 'grain',
        },
      ];
    } catch (error) {
      console.error('Error searching foods:', error);
      return [];
    }
  };

  const addCustomFood = async (food: Omit<FoodItem, 'id' | 'isCustom'>): Promise<void> => {
    try {
      const newFood: FoodItem = {
        ...food,
        id: Date.now().toString(),
        isCustom: true,
      };

      const updatedCustomFoods = [newFood, ...customFoods];
      setCustomFoods(updatedCustomFoods);
      await AsyncStorage.setItem('customFoods', JSON.stringify(updatedCustomFoods));
    } catch (error) {
      console.error('Error adding custom food:', error);
    }
  };

  const addToRecentFoods = async (food: FoodItem): Promise<void> => {
    try {
      const existingIndex = recentFoods.findIndex(f => f.id === food.id);
      let updatedRecentFoods: FoodItem[];

      if (existingIndex >= 0) {
        const updatedFood = {
          ...food,
          frequency: (food.frequency || 0) + 1,
          lastUsed: new Date(),
        };
        updatedRecentFoods = [updatedFood, ...recentFoods.filter(f => f.id !== food.id)];
      } else {
        const newFood = {
          ...food,
          frequency: 1,
          lastUsed: new Date(),
        };
        updatedRecentFoods = [newFood, ...recentFoods.slice(0, 19)];
      }

      setRecentFoods(updatedRecentFoods);
      await AsyncStorage.setItem('recentFoods', JSON.stringify(updatedRecentFoods));
    } catch (error) {
      console.error('Error adding to recent foods:', error);
    }
  };

  const clearScanHistory = async (): Promise<void> => {
    try {
      setScanHistory([]);
      await AsyncStorage.removeItem('scanHistory');
    } catch (error) {
      console.error('Error clearing scan history:', error);
    }
  };

  const clearScanResult = (): void => {
    setScanResult(null);
    setScanError(null);
  };

  const updateScanResult = (updates: Partial<FoodItem>): void => {
    if (scanResult) {
      const updatedFoodItem = { ...scanResult.foodItem, ...updates };
      setScanResult({ ...scanResult, foodItem: updatedFoodItem });
    }
  };

  const value: FoodScanContextType = {
    scanMode,
    setScanMode,
    flashMode,
    setFlashMode,
    cameraType,
    setCameraType,
    isScanning,
    scanResult,
    scanError,
    scanFood,
    scanBarcode,
    searchFood,
    recentFoods,
    customFoods,
    addCustomFood,
    scanHistory,
    clearScanHistory,
    clearScanResult,
    addToRecentFoods,
    updateScanResult,
  };

  return (
    <FoodScanContext.Provider value={value}>
      {children}
    </FoodScanContext.Provider>
  );
}