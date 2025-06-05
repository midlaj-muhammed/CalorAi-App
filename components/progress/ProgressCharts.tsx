import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useProgress } from '../../contexts/ProgressContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type ChartType = 'calories' | 'weight' | 'exercise' | 'macros';

const chartTypes: Array<{ key: ChartType; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { key: 'calories', label: 'Calories', icon: 'restaurant' },
  { key: 'weight', label: 'Weight', icon: 'monitor-weight' },
  { key: 'exercise', label: 'Exercise', icon: 'fitness-center' },
  { key: 'macros', label: 'Macros', icon: 'pie-chart' },
];

export const ProgressCharts: React.FC = () => {
  const [activeChart, setActiveChart] = useState<ChartType>('calories');
  const { 
    getCalorieChartData, 
    getWeightChartData, 
    getExerciseChartData, 
    getMacroChartData 
  } = useProgress();

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#F0F0F0',
      strokeWidth: 1,
    },
  };

  const pieChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
  };

  const renderChart = () => {
    const chartWidth = screenWidth - (screenWidth < 375 ? 48 : 64); // Account for padding
    const chartHeight = screenWidth < 375 ? 180 : 220;

    switch (activeChart) {
      case 'calories':
        const calorieData = getCalorieChartData();
        if (calorieData.labels.length === 0) {
          return <EmptyChart message="No calorie data available" />;
        }
        return (
          <LineChart
            data={calorieData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={{
              ...chartConfig,
              labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
              style: {
                borderRadius: 12,
              },
              propsForLabels: {
                fontSize: screenWidth < 375 ? 10 : 12,
              },
            }}
            bezier
            style={styles.chart}
          />
        );

      case 'weight':
        const weightData = getWeightChartData();
        if (weightData.labels.length === 0) {
          return <EmptyChart message="No weight data available" />;
        }
        return (
          <LineChart
            data={weightData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
              propsForDots: {
                r: screenWidth < 375 ? '3' : '4',
                strokeWidth: '2',
                stroke: '#2196F3',
              },
              propsForLabels: {
                fontSize: screenWidth < 375 ? 10 : 12,
              },
            }}
            bezier
            style={styles.chart}
          />
        );

      case 'exercise':
        const exerciseData = getExerciseChartData();
        if (exerciseData.labels.length === 0) {
          return <EmptyChart message="No exercise data available" />;
        }
        return (
          <BarChart
            data={exerciseData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 87, 34, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
              propsForLabels: {
                fontSize: screenWidth < 375 ? 10 : 12,
              },
            }}
            style={styles.chart}
          />
        );

      case 'macros':
        const macroData = getMacroChartData();
        if (macroData.labels.length === 0) {
          return <EmptyChart message="No macro data available" />;
        }
        
        const pieData = macroData.labels.map((label, index) => ({
          name: label,
          population: macroData.datasets[0].data[index],
          color: index === 0 ? '#FF9800' : index === 1 ? '#F44336' : '#9C27B0',
          legendFontColor: '#666',
          legendFontSize: screenWidth < 375 ? 10 : 12,
        }));

        return (
          <PieChart
            data={pieData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={pieChartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft={screenWidth < 375 ? "10" : "15"}
            style={styles.chart}
          />
        );

      default:
        return <EmptyChart message="Chart not available" />;
    }
  };

  const getChartTitle = () => {
    switch (activeChart) {
      case 'calories': return 'Daily Calorie Intake';
      case 'weight': return 'Weight Progress';
      case 'exercise': return 'Exercise Activity';
      case 'macros': return 'Macro Distribution';
      default: return 'Progress Chart';
    }
  };

  const getChartDescription = () => {
    switch (activeChart) {
      case 'calories': return 'Track your daily calorie consumption over time';
      case 'weight': return 'Monitor your weight changes and trends';
      case 'exercise': return 'View your workout frequency and intensity';
      case 'macros': return 'See your average macro nutrient breakdown';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Charts</Text>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialIcons name="share" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Chart Type Selector */}
      <View style={styles.chartSelector}>
        {chartTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.chartTypeButton,
              activeChart === type.key && styles.activeChartTypeButton,
            ]}
            onPress={() => setActiveChart(type.key)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={type.icon}
              size={18}
              color={activeChart === type.key ? 'white' : '#666'}
            />
            <Text
              style={[
                styles.chartTypeText,
                activeChart === type.key && styles.activeChartTypeText,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Content */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{getChartTitle()}</Text>
          <Text style={styles.chartDescription}>{getChartDescription()}</Text>
        </View>
        
        <View style={styles.chartWrapper}>
          {renderChart()}
        </View>
      </View>
    </View>
  );
};

const EmptyChart: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.emptyChart}>
    <MaterialIcons name="insert-chart" size={screenWidth < 375 ? 40 : 48} color="#E0E0E0" />
    <Text style={styles.emptyChartText}>{message}</Text>
    <Text style={styles.emptyChartSubtext}>Start logging data to see your progress</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: screenWidth < 375 ? 12 : 16,
    marginHorizontal: screenWidth < 375 ? 12 : 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: screenWidth < 375 ? 16 : 20,
  },
  title: {
    fontSize: screenWidth < 375 ? 18 : 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  shareButton: {
    padding: screenWidth < 375 ? 6 : 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartSelector: {
    flexDirection: 'row',
    marginBottom: screenWidth < 375 ? 16 : 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 3,
  },
  chartTypeButton: {
    flex: 1,
    flexDirection: screenWidth < 350 ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenWidth < 375 ? 8 : 10,
    paddingHorizontal: screenWidth < 375 ? 4 : 8,
    borderRadius: 8,
    minHeight: 44,
  },
  activeChartTypeButton: {
    backgroundColor: '#4CAF50',
  },
  chartTypeText: {
    fontSize: screenWidth < 375 ? 10 : 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: screenWidth < 350 ? 0 : 4,
    marginTop: screenWidth < 350 ? 2 : 0,
    textAlign: 'center',
  },
  activeChartTypeText: {
    color: 'white',
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartHeader: {
    alignItems: 'center',
    marginBottom: screenWidth < 375 ? 12 : 16,
    paddingHorizontal: screenWidth < 375 ? 8 : 0,
  },
  chartTitle: {
    fontSize: screenWidth < 375 ? 14 : 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  chartDescription: {
    fontSize: screenWidth < 375 ? 11 : 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: screenWidth < 375 ? 16 : 18,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 12,
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: screenWidth < 375 ? 30 : 40,
    width: screenWidth - (screenWidth < 375 ? 48 : 64),
  },
  emptyChartText: {
    fontSize: screenWidth < 375 ? 14 : 16,
    fontWeight: '600',
    color: '#999',
    marginTop: screenWidth < 375 ? 12 : 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyChartSubtext: {
    fontSize: screenWidth < 375 ? 11 : 12,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: screenWidth < 375 ? 16 : 18,
  },
});
