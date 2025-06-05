import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNutrition } from '../../contexts/NutritionContext';

export const DateNavigator: React.FC = () => {
  const { state, setCurrentDate } = useNutrition();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const currentDate = new Date(state.currentDate);

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateString = date.toDateString();
    const todayString = today.toDateString();
    const yesterdayString = yesterday.toDateString();
    const tomorrowString = tomorrow.toDateString();

    if (dateString === todayString) return 'Today';
    if (dateString === yesterdayString) return 'Yesterday';
    if (dateString === tomorrowString) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate.toISOString().split('T')[0]);
  };

  const selectDate = (date: Date) => {
    setCurrentDate(date.toISOString().split('T')[0]);
    setShowDatePicker(false);
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    // Generate dates from 30 days ago to 7 days in the future
    for (let i = -30; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  const isFutureDate = () => {
    const today = new Date();
    return currentDate > today;
  };

  const canNavigateNext = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 7); // Allow up to 7 days in the future
    return currentDate < maxDate;
  };

  const canNavigatePrev = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 365); // Allow up to 1 year back
    return currentDate > minDate;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.navButton, !canNavigatePrev() && styles.disabledButton]}
        onPress={() => navigateDate('prev')}
        disabled={!canNavigatePrev()}
      >
        <MaterialIcons 
          name="chevron-left" 
          size={24} 
          color={canNavigatePrev() ? '#333' : '#CCC'} 
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.dateContainer} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
        <Text style={styles.fullDateText}>{formatFullDate(currentDate)}</Text>
        {isToday() && <View style={styles.todayIndicator} />}
        {isFutureDate() && (
          <View style={styles.futureIndicator}>
            <MaterialIcons name="schedule" size={12} color="#FF9800" />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, !canNavigateNext() && styles.disabledButton]}
        onPress={() => navigateDate('next')}
        disabled={!canNavigateNext()}
      >
        <MaterialIcons 
          name="chevron-right" 
          size={24} 
          color={canNavigateNext() ? '#333' : '#CCC'} 
        />
      </TouchableOpacity>

      {/* Quick Actions */}
      {!isToday() && (
        <TouchableOpacity
          style={styles.todayButton}
          onPress={() => setCurrentDate(new Date().toISOString().split('T')[0])}
        >
          <MaterialIcons name="today" size={16} color="#4CAF50" />
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      )}

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.dateList} showsVerticalScrollIndicator={false}>
              {generateDateOptions().map((date, index) => {
                const isSelected = date.toDateString() === currentDate.toDateString();
                const isDateToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateOption,
                      isSelected && styles.selectedDateOption,
                    ]}
                    onPress={() => selectDate(date)}
                  >
                    <View style={styles.dateOptionContent}>
                      <Text style={[
                        styles.dateOptionText,
                        isSelected && styles.selectedDateOptionText,
                      ]}>
                        {formatDate(date)}
                      </Text>
                      <Text style={[
                        styles.dateOptionSubtext,
                        isSelected && styles.selectedDateOptionSubtext,
                      ]}>
                        {date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    {isDateToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>Today</Text>
                      </View>
                    )}
                    {isSelected && (
                      <MaterialIcons name="check" size={20} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  disabledButton: {
    backgroundColor: '#F0F0F0',
  },
  dateContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  fullDateText: {
    fontSize: 12,
    color: '#666',
  },
  todayIndicator: {
    position: 'absolute',
    top: -4,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  futureIndicator: {
    position: 'absolute',
    top: -4,
    right: 8,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    marginLeft: 8,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  dateList: {
    maxHeight: 400,
  },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  selectedDateOption: {
    backgroundColor: '#F0F8F0',
  },
  dateOptionContent: {
    flex: 1,
  },
  dateOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  selectedDateOptionText: {
    color: '#4CAF50',
  },
  dateOptionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  selectedDateOptionSubtext: {
    color: '#4CAF50',
  },
  todayBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
});
