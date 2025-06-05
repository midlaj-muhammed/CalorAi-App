import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function DinnerScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: Favorites, 1: Recent, 2: Tracked

  const macroData = {
    calories: { current: 0, target: 2086 },
    carbs: { current: 0, target: 261 },
    protein: { current: 0, target: 104 },
    fat: { current: 0, target: 70 },
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Favorites
        return (
          <>
            {/* Food Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FOOD</Text>
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <MaterialIcons name="favorite-border" size={40} color="#DDD" />
                </View>
                <Text style={styles.emptyTitle}>No favorite foods yet</Text>
                <Text style={styles.emptyDescription}>
                  As you track, save your favorite items like steak, pasta or vegetables
                </Text>
              </View>
            </View>

            {/* Meals Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MEALS</Text>
              <View style={styles.mealItem}>
                <View style={styles.mealIcon}>
                  <Text style={styles.mealEmoji}>🍽️</Text>
                </View>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>Create meals</Text>
                  <Text style={styles.mealDescription}>
                    Create and save your usual meals as favorites
                  </Text>
                </View>
                <TouchableOpacity style={styles.lockIcon}>
                  <MaterialIcons name="lock" size={20} color="#DDD" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Recipes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>RECIPES</Text>
              <View style={styles.recipeItem}>
                <View style={styles.recipeImage}>
                  <MaterialIcons name="restaurant" size={24} color="#999" />
                </View>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>Create recipes</Text>
                </View>
              </View>
            </View>
          </>
        );
      case 1: // Recent Foods
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECENT FOODS</Text>
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="history" size={40} color="#DDD" />
              </View>
              <Text style={styles.emptyTitle}>No recent foods</Text>
              <Text style={styles.emptyDescription}>
                Foods you've recently searched or consumed will appear here
              </Text>
            </View>
          </View>
        );
      case 2: // Tracked Foods
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRACKED FOODS</Text>
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="assignment" size={40} color="#DDD" />
              </View>
              <Text style={styles.emptyTitle}>No tracked foods</Text>
              <Text style={styles.emptyDescription}>
                Foods you've logged and tracked will be listed here
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DINNER</Text>
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Food, meal or brand"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.barcodeButton}>
            <MaterialIcons name="qr-code-scanner" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Daily Intake Card */}
        <View style={styles.intakeCard}>
          <View style={styles.intakeHeader}>
            <Text style={styles.intakeTitle}>Daily intake</Text>
            <Text style={styles.intakeCalories}>
              {macroData.calories.current} / {macroData.calories.target} kcal
            </Text>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>
                {macroData.carbs.current} g / {macroData.carbs.target} g
              </Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>
                {macroData.protein.current} g / {macroData.protein.target} g
              </Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>
                {macroData.fat.current} g / {macroData.fat.target} g
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.adjustButton}>
            <MaterialIcons name="lock" size={16} color="#4CAF50" />
            <Text style={styles.adjustButtonText}>ADJUST MACRONUTRIENTS</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 0 && styles.activeTab]}
            onPress={() => setActiveTab(0)}
          >
            <MaterialIcons
              name="favorite"
              size={20}
              color={activeTab === 0 ? "#4CAF50" : "#999"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 1 && styles.activeTab]}
            onPress={() => setActiveTab(1)}
          >
            <MaterialIcons
              name="history"
              size={20}
              color={activeTab === 1 ? "#4CAF50" : "#999"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 2 && styles.activeTab]}
            onPress={() => setActiveTab(2)}
          >
            <MaterialIcons
              name="assignment"
              size={20}
              color={activeTab === 2 ? "#4CAF50" : "#999"}
            />
          </TouchableOpacity>
        </View>

        {/* Dynamic Tab Content */}
        {renderTabContent()}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
  menuButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  barcodeButton: {
    padding: 8,
  },
  intakeCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  intakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  intakeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  intakeCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adjustButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    letterSpacing: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F0F8F0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  emptyState: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  mealItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  mealEmoji: {
    fontSize: 24,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  lockIcon: {
    padding: 8,
  },
  recipeItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
