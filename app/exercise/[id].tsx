import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

interface ExerciseInstruction {
  step: number;
  instruction: string;
  tip?: string;
}

interface ExerciseLevel {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  sets: number;
  reps: string;
  duration?: number;
  restBetweenSets: number;
}

interface DetailedExercise {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  targetMuscles: string[];
  equipment: string[];
  instructions: ExerciseInstruction[];
  levels: ExerciseLevel[];
  warmUp: string[];
  coolDown: string[];
  safetyTips: string[];
  commonMistakes: string[];
  caloriesPerMinute: number;
  benefits: string[];
}

// Exercise database - in real app, this would come from API/database
const getExerciseData = (exerciseId: string): DetailedExercise => {
  const exerciseDatabase: { [key: string]: DetailedExercise } = {
    '1': {
      id: '1',
      name: 'Push-ups',
      category: 'strength',
      icon: '💪',
      description: 'A classic bodyweight exercise that targets the chest, shoulders, and triceps while engaging the core.',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps', 'Core'],
      equipment: ['None - Bodyweight only'],
      instructions: [
        {
          step: 1,
          instruction: 'Start in a plank position with hands placed slightly wider than shoulder-width apart.',
          tip: 'Keep your hands flat on the ground and fingers spread for better stability.'
        },
        {
          step: 2,
          instruction: 'Lower your body until your chest nearly touches the floor.',
          tip: 'Maintain a straight line from head to heels throughout the movement.'
        },
        {
          step: 3,
          instruction: 'Push through your palms to return to the starting position.',
          tip: 'Exhale as you push up and engage your core muscles.'
        },
        {
          step: 4,
          instruction: 'Repeat for the desired number of repetitions.',
          tip: 'Focus on controlled movements rather than speed.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 2, reps: '5-8', restBetweenSets: 60 },
        { difficulty: 'Intermediate', sets: 3, reps: '10-15', restBetweenSets: 45 },
        { difficulty: 'Advanced', sets: 4, reps: '15-25', restBetweenSets: 30 }
      ],
      warmUp: [
        'Arm circles (10 forward, 10 backward)',
        'Shoulder rolls (10 times)',
        'Light stretching of chest and shoulders',
        'Wall push-ups (5-10 reps)'
      ],
      coolDown: [
        'Chest stretch against wall (30 seconds)',
        'Shoulder blade squeezes (10 times)',
        'Child\'s pose (30 seconds)',
        'Deep breathing exercises'
      ],
      safetyTips: [
        'Keep your core engaged throughout the movement',
        'Don\'t let your hips sag or pike up',
        'Stop if you feel pain in your wrists or shoulders',
        'Modify on knees if full push-ups are too difficult'
      ],
      commonMistakes: [
        'Flaring elbows too wide',
        'Not going through full range of motion',
        'Holding breath during the exercise',
        'Rushing through repetitions'
      ],
      caloriesPerMinute: 8,
      benefits: [
        'Builds upper body strength',
        'Improves core stability',
        'Enhances functional movement',
        'Requires no equipment'
      ]
    },
    '2': {
      id: '2',
      name: 'Squats',
      category: 'strength',
      icon: '🦵',
      description: 'A fundamental lower body exercise that targets the quadriceps, glutes, and hamstrings while improving functional movement.',
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
      equipment: ['None - Bodyweight only'],
      instructions: [
        {
          step: 1,
          instruction: 'Stand with feet shoulder-width apart, toes slightly pointed outward.',
          tip: 'Keep your chest up and core engaged throughout the movement.'
        },
        {
          step: 2,
          instruction: 'Lower your body by bending at the hips and knees, as if sitting back into a chair.',
          tip: 'Keep your knees in line with your toes and don\'t let them cave inward.'
        },
        {
          step: 3,
          instruction: 'Descend until your thighs are parallel to the floor or as low as comfortable.',
          tip: 'Maintain a neutral spine and keep your weight on your heels.'
        },
        {
          step: 4,
          instruction: 'Push through your heels to return to the starting position.',
          tip: 'Squeeze your glutes at the top and exhale as you stand up.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 2, reps: '8-12', restBetweenSets: 60 },
        { difficulty: 'Intermediate', sets: 3, reps: '12-18', restBetweenSets: 45 },
        { difficulty: 'Advanced', sets: 4, reps: '18-25', restBetweenSets: 30 }
      ],
      warmUp: [
        'Leg swings (10 each direction)',
        'Hip circles (10 each direction)',
        'Bodyweight squats (5-8 reps)',
        'Ankle rolls (10 each direction)'
      ],
      coolDown: [
        'Standing quad stretch (30 seconds each leg)',
        'Standing calf stretch (30 seconds each leg)',
        'Hip flexor stretch (30 seconds each leg)',
        'Deep breathing exercises'
      ],
      safetyTips: [
        'Keep your knees aligned with your toes',
        'Don\'t let your knees cave inward',
        'Maintain a neutral spine throughout',
        'Start with bodyweight before adding resistance'
      ],
      commonMistakes: [
        'Knees caving inward',
        'Leaning too far forward',
        'Not going deep enough',
        'Rising up on toes'
      ],
      caloriesPerMinute: 7,
      benefits: [
        'Strengthens lower body muscles',
        'Improves functional movement',
        'Enhances core stability',
        'Builds bone density'
      ]
    }
  };

  // Add more exercises for IDs 3-10
  const additionalExercises: { [key: string]: DetailedExercise } = {
    '3': {
      id: '3',
      name: 'Plank',
      category: 'strength',
      icon: '🏋️‍♀️',
      description: 'An isometric core exercise that builds strength and stability throughout the entire core and shoulders.',
      targetMuscles: ['Core', 'Shoulders', 'Back', 'Glutes'],
      equipment: ['None - Bodyweight only'],
      instructions: [
        {
          step: 1,
          instruction: 'Start in a push-up position with forearms on the ground.',
          tip: 'Keep your elbows directly under your shoulders.'
        },
        {
          step: 2,
          instruction: 'Hold your body in a straight line from head to heels.',
          tip: 'Engage your core and don\'t let your hips sag or pike up.'
        },
        {
          step: 3,
          instruction: 'Breathe normally while maintaining the position.',
          tip: 'Focus on keeping your entire body tight and stable.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 3, reps: '20-30 seconds', restBetweenSets: 60 },
        { difficulty: 'Intermediate', sets: 3, reps: '45-60 seconds', restBetweenSets: 45 },
        { difficulty: 'Advanced', sets: 4, reps: '60-90 seconds', restBetweenSets: 30 }
      ],
      warmUp: [
        'Cat-cow stretches (10 reps)',
        'Shoulder rolls (10 times)',
        'Modified planks on knees (3 x 15 seconds)',
        'Arm circles (10 each direction)'
      ],
      coolDown: [
        'Child\'s pose (30 seconds)',
        'Cat-cow stretches (10 reps)',
        'Shoulder stretches (30 seconds each)',
        'Deep breathing exercises'
      ],
      safetyTips: [
        'Keep your body in a straight line',
        'Don\'t hold your breath',
        'Stop if you feel pain in your lower back',
        'Start with shorter holds and build up'
      ],
      commonMistakes: [
        'Letting hips sag',
        'Piking hips too high',
        'Holding breath',
        'Placing hands too far forward'
      ],
      caloriesPerMinute: 5,
      benefits: [
        'Builds core strength',
        'Improves posture',
        'Enhances stability',
        'Strengthens shoulders'
      ]
    },
    '4': {
      id: '4',
      name: 'Jumping Jacks',
      category: 'cardio',
      icon: '🤸‍♂️',
      description: 'A high-energy cardio exercise that improves cardiovascular fitness and coordination.',
      targetMuscles: ['Full Body', 'Cardiovascular System', 'Calves', 'Shoulders'],
      equipment: ['None - Bodyweight only'],
      instructions: [
        {
          step: 1,
          instruction: 'Stand upright with feet together and arms at your sides.',
          tip: 'Keep your core engaged and maintain good posture.'
        },
        {
          step: 2,
          instruction: 'Jump up while spreading your legs shoulder-width apart.',
          tip: 'Land softly on the balls of your feet.'
        },
        {
          step: 3,
          instruction: 'Simultaneously raise your arms overhead.',
          tip: 'Keep your movements controlled and rhythmic.'
        },
        {
          step: 4,
          instruction: 'Jump back to starting position and repeat.',
          tip: 'Maintain a steady pace and breathe regularly.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 3, reps: '15-20', restBetweenSets: 60 },
        { difficulty: 'Intermediate', sets: 3, reps: '25-35', restBetweenSets: 45 },
        { difficulty: 'Advanced', sets: 4, reps: '40-50', restBetweenSets: 30 }
      ],
      warmUp: [
        'Marching in place (30 seconds)',
        'Arm circles (10 each direction)',
        'Leg swings (10 each leg)',
        'Light jumping (10 small jumps)'
      ],
      coolDown: [
        'Walking in place (30 seconds)',
        'Calf stretches (30 seconds each)',
        'Shoulder stretches (30 seconds each)',
        'Deep breathing exercises'
      ],
      safetyTips: [
        'Land softly to protect your joints',
        'Start slowly and build up intensity',
        'Stop if you feel dizzy or short of breath',
        'Wear supportive shoes'
      ],
      commonMistakes: [
        'Landing too hard',
        'Moving too fast without control',
        'Holding breath',
        'Poor posture'
      ],
      caloriesPerMinute: 10,
      benefits: [
        'Improves cardiovascular fitness',
        'Burns calories effectively',
        'Enhances coordination',
        'Full body workout'
      ]
    },
    '5': {
      id: '5',
      name: 'Burpees',
      category: 'cardio',
      icon: '🔥',
      description: 'A high-intensity full-body exercise that combines strength and cardio for maximum calorie burn.',
      targetMuscles: ['Full Body', 'Core', 'Chest', 'Legs', 'Shoulders'],
      equipment: ['None - Bodyweight only'],
      instructions: [
        {
          step: 1,
          instruction: 'Start in a standing position with feet shoulder-width apart.',
          tip: 'Keep your core engaged throughout the entire movement.'
        },
        {
          step: 2,
          instruction: 'Squat down and place your hands on the floor.',
          tip: 'Keep your hands shoulder-width apart for stability.'
        },
        {
          step: 3,
          instruction: 'Jump your feet back into a plank position.',
          tip: 'Maintain a straight line from head to heels.'
        },
        {
          step: 4,
          instruction: 'Perform a push-up, then jump feet back to squat position.',
          tip: 'The push-up is optional for beginners.'
        },
        {
          step: 5,
          instruction: 'Explode up with a jump, reaching arms overhead.',
          tip: 'Land softly and immediately go into the next rep.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 2, reps: '3-5', restBetweenSets: 90 },
        { difficulty: 'Intermediate', sets: 3, reps: '6-10', restBetweenSets: 60 },
        { difficulty: 'Advanced', sets: 4, reps: '10-15', restBetweenSets: 45 }
      ],
      warmUp: [
        'Light jogging in place (1 minute)',
        'Arm swings (10 each direction)',
        'Bodyweight squats (10 reps)',
        'Push-up prep stretches'
      ],
      coolDown: [
        'Walking in place (1 minute)',
        'Full body stretches (2 minutes)',
        'Deep breathing exercises',
        'Gentle spinal twists'
      ],
      safetyTips: [
        'Start with modified versions',
        'Focus on form over speed',
        'Take breaks when needed',
        'Stop if you feel dizzy'
      ],
      commonMistakes: [
        'Rushing through movements',
        'Poor plank form',
        'Landing too hard on jumps',
        'Skipping the push-up portion'
      ],
      caloriesPerMinute: 12,
      benefits: [
        'Maximum calorie burn',
        'Full body strength',
        'Cardiovascular fitness',
        'Functional movement'
      ]
    },
    '6': {
      id: '6',
      name: 'Mountain Climbers',
      category: 'cardio',
      icon: '⛰️',
      description: 'A dynamic cardio exercise that targets the core while providing an intense cardiovascular workout.',
      targetMuscles: ['Core', 'Shoulders', 'Legs', 'Cardiovascular System'],
      equipment: ['None - Bodyweight only'],
      instructions: [
        {
          step: 1,
          instruction: 'Start in a plank position with hands under shoulders.',
          tip: 'Keep your body in a straight line from head to heels.'
        },
        {
          step: 2,
          instruction: 'Bring your right knee toward your chest.',
          tip: 'Keep your hips level and core engaged.'
        },
        {
          step: 3,
          instruction: 'Quickly switch legs, bringing left knee to chest.',
          tip: 'Maintain the plank position throughout the movement.'
        },
        {
          step: 4,
          instruction: 'Continue alternating legs in a running motion.',
          tip: 'Keep the movement controlled and rhythmic.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 3, reps: '20 seconds', restBetweenSets: 60 },
        { difficulty: 'Intermediate', sets: 3, reps: '30 seconds', restBetweenSets: 45 },
        { difficulty: 'Advanced', sets: 4, reps: '45 seconds', restBetweenSets: 30 }
      ],
      warmUp: [
        'Plank hold (20 seconds)',
        'Knee to chest stretches (10 each leg)',
        'Hip circles (10 each direction)',
        'Light jogging in place (30 seconds)'
      ],
      coolDown: [
        'Child\'s pose (30 seconds)',
        'Hip flexor stretches (30 seconds each)',
        'Shoulder stretches (30 seconds each)',
        'Deep breathing exercises'
      ],
      safetyTips: [
        'Keep your core engaged',
        'Don\'t let your hips pike up',
        'Start slowly and build speed',
        'Stop if you feel lower back pain'
      ],
      commonMistakes: [
        'Letting hips rise too high',
        'Moving too fast without control',
        'Not engaging the core',
        'Placing hands too far forward'
      ],
      caloriesPerMinute: 11,
      benefits: [
        'Builds core strength',
        'Improves cardiovascular fitness',
        'Enhances agility',
        'Burns calories effectively'
      ]
    },
    '7': {
      id: '7',
      name: 'Lunges',
      category: 'strength',
      icon: '🚶‍♀️',
      description: 'A unilateral lower body exercise that builds leg strength and improves balance and stability.',
      targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves', 'Core'],
      equipment: ['None - Bodyweight only'],
      instructions: [
        {
          step: 1,
          instruction: 'Stand upright with feet hip-width apart.',
          tip: 'Keep your core engaged and shoulders back.'
        },
        {
          step: 2,
          instruction: 'Step forward with your right leg into a lunge position.',
          tip: 'Take a large enough step to allow proper form.'
        },
        {
          step: 3,
          instruction: 'Lower your body until both knees are at 90-degree angles.',
          tip: 'Keep your front knee over your ankle, not past your toes.'
        },
        {
          step: 4,
          instruction: 'Push through your front heel to return to starting position.',
          tip: 'Engage your glutes as you return to standing.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 2, reps: '8-10 each leg', restBetweenSets: 60 },
        { difficulty: 'Intermediate', sets: 3, reps: '12-15 each leg', restBetweenSets: 45 },
        { difficulty: 'Advanced', sets: 4, reps: '15-20 each leg', restBetweenSets: 30 }
      ],
      warmUp: [
        'Leg swings (10 each direction)',
        'Hip circles (10 each direction)',
        'Bodyweight squats (10 reps)',
        'Ankle rolls (10 each direction)'
      ],
      coolDown: [
        'Standing quad stretch (30 seconds each)',
        'Standing calf stretch (30 seconds each)',
        'Hip flexor stretch (30 seconds each)',
        'Gentle spinal twists'
      ],
      safetyTips: [
        'Keep your front knee aligned over your ankle',
        'Don\'t let your knee cave inward',
        'Maintain an upright torso',
        'Start with bodyweight before adding resistance'
      ],
      commonMistakes: [
        'Knee extending past toes',
        'Leaning too far forward',
        'Not stepping out far enough',
        'Pushing off the back foot'
      ],
      caloriesPerMinute: 6,
      benefits: [
        'Builds unilateral leg strength',
        'Improves balance and stability',
        'Enhances functional movement',
        'Targets multiple muscle groups'
      ]
    },
    '8': {
      id: '8',
      name: 'Yoga Flow',
      category: 'flexibility',
      icon: '🧘‍♀️',
      description: 'A gentle flowing sequence that improves flexibility, balance, and mindfulness.',
      targetMuscles: ['Full Body', 'Core', 'Back', 'Shoulders', 'Legs'],
      equipment: ['Yoga mat (optional)'],
      instructions: [
        {
          step: 1,
          instruction: 'Start in mountain pose with feet hip-width apart.',
          tip: 'Focus on your breathing and center yourself.'
        },
        {
          step: 2,
          instruction: 'Flow through sun salutation sequence.',
          tip: 'Move slowly and mindfully with your breath.'
        },
        {
          step: 3,
          instruction: 'Hold each pose for 3-5 breaths.',
          tip: 'Listen to your body and don\'t force any positions.'
        },
        {
          step: 4,
          instruction: 'End in child\'s pose for relaxation.',
          tip: 'Focus on deep, calming breaths.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 1, reps: '10-15 minutes', restBetweenSets: 0 },
        { difficulty: 'Intermediate', sets: 1, reps: '20-30 minutes', restBetweenSets: 0 },
        { difficulty: 'Advanced', sets: 1, reps: '30-45 minutes', restBetweenSets: 0 }
      ],
      warmUp: [
        'Gentle neck rolls (5 each direction)',
        'Shoulder rolls (10 times)',
        'Cat-cow stretches (10 reps)',
        'Deep breathing (1 minute)'
      ],
      coolDown: [
        'Savasana (5 minutes)',
        'Gentle spinal twists',
        'Knee to chest stretches',
        'Meditation (5 minutes)'
      ],
      safetyTips: [
        'Never force a stretch',
        'Listen to your body',
        'Breathe deeply throughout',
        'Use props if needed'
      ],
      commonMistakes: [
        'Holding breath during poses',
        'Forcing difficult positions',
        'Comparing to others',
        'Rushing through movements'
      ],
      caloriesPerMinute: 4,
      benefits: [
        'Improves flexibility',
        'Reduces stress',
        'Enhances balance',
        'Promotes mindfulness'
      ]
    },
    '9': {
      id: '9',
      name: 'High Knees',
      category: 'cardio',
      icon: '🏃‍♀️',
      description: 'A high-intensity cardio exercise that improves leg strength and cardiovascular endurance.',
      targetMuscles: ['Hip Flexors', 'Quadriceps', 'Calves', 'Core', 'Cardiovascular System'],
      equipment: ['None - Bodyweight only'],
      instructions: [
        {
          step: 1,
          instruction: 'Stand upright with feet hip-width apart.',
          tip: 'Keep your core engaged and maintain good posture.'
        },
        {
          step: 2,
          instruction: 'Lift your right knee up toward your chest.',
          tip: 'Aim to bring your knee to hip level or higher.'
        },
        {
          step: 3,
          instruction: 'Quickly lower and repeat with your left knee.',
          tip: 'Pump your arms naturally as you would when running.'
        },
        {
          step: 4,
          instruction: 'Continue alternating knees at a rapid pace.',
          tip: 'Stay on the balls of your feet for better agility.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 3, reps: '20 seconds', restBetweenSets: 60 },
        { difficulty: 'Intermediate', sets: 3, reps: '30 seconds', restBetweenSets: 45 },
        { difficulty: 'Advanced', sets: 4, reps: '45 seconds', restBetweenSets: 30 }
      ],
      warmUp: [
        'Marching in place (30 seconds)',
        'Leg swings (10 each leg)',
        'Ankle rolls (10 each direction)',
        'Light jogging in place (30 seconds)'
      ],
      coolDown: [
        'Walking in place (30 seconds)',
        'Standing quad stretch (30 seconds each)',
        'Calf stretches (30 seconds each)',
        'Deep breathing exercises'
      ],
      safetyTips: [
        'Land softly on the balls of your feet',
        'Keep your core engaged',
        'Start at a moderate pace',
        'Stop if you feel dizzy'
      ],
      commonMistakes: [
        'Not lifting knees high enough',
        'Landing too hard',
        'Leaning too far forward',
        'Holding breath'
      ],
      caloriesPerMinute: 9,
      benefits: [
        'Improves cardiovascular fitness',
        'Strengthens hip flexors',
        'Enhances running form',
        'Burns calories effectively'
      ]
    },
    '10': {
      id: '10',
      name: 'Tricep Dips',
      category: 'strength',
      icon: '💺',
      description: 'An upper body exercise that targets the triceps while also engaging the shoulders and chest.',
      targetMuscles: ['Triceps', 'Shoulders', 'Chest', 'Core'],
      equipment: ['Chair or bench'],
      instructions: [
        {
          step: 1,
          instruction: 'Sit on the edge of a chair with hands gripping the edge.',
          tip: 'Keep your hands shoulder-width apart for stability.'
        },
        {
          step: 2,
          instruction: 'Slide your body off the chair, supporting your weight with your arms.',
          tip: 'Keep your legs extended or bent based on your fitness level.'
        },
        {
          step: 3,
          instruction: 'Lower your body by bending your elbows to 90 degrees.',
          tip: 'Keep your elbows close to your body, not flared out.'
        },
        {
          step: 4,
          instruction: 'Push through your palms to return to starting position.',
          tip: 'Focus on using your triceps to lift your body weight.'
        }
      ],
      levels: [
        { difficulty: 'Beginner', sets: 2, reps: '5-8', restBetweenSets: 60 },
        { difficulty: 'Intermediate', sets: 3, reps: '8-12', restBetweenSets: 45 },
        { difficulty: 'Advanced', sets: 4, reps: '12-20', restBetweenSets: 30 }
      ],
      warmUp: [
        'Arm circles (10 each direction)',
        'Shoulder rolls (10 times)',
        'Tricep stretches (30 seconds each)',
        'Wall push-ups (5-10 reps)'
      ],
      coolDown: [
        'Tricep stretches (30 seconds each)',
        'Shoulder stretches (30 seconds each)',
        'Chest stretches (30 seconds)',
        'Deep breathing exercises'
      ],
      safetyTips: [
        'Keep your elbows close to your body',
        'Don\'t go too low if you feel shoulder pain',
        'Use a stable chair or bench',
        'Start with bent knees for easier variation'
      ],
      commonMistakes: [
        'Flaring elbows out too wide',
        'Going too low too quickly',
        'Using momentum instead of muscle',
        'Not engaging the core'
      ],
      caloriesPerMinute: 6,
      benefits: [
        'Builds tricep strength',
        'Improves upper body stability',
        'Enhances functional movement',
        'Can be done anywhere with a chair'
      ]
    }
  };

  // Merge all exercises
  const allExercises = { ...exerciseDatabase, ...additionalExercises };

  // Return the specific exercise or a default one
  return allExercises[exerciseId] || allExercises['1'];
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [selectedLevel, setSelectedLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');

  // Get exercise data based on ID
  const exerciseData = getExerciseData(id as string);

  const currentLevel = exerciseData.levels.find(level => level.difficulty === selectedLevel);

  const handleStartWorkout = () => {
    router.push({
      pathname: '/exercise/workout/[id]',
      params: { 
        id: exerciseData.id,
        difficulty: selectedLevel
      }
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#666';
    }
  };

  const renderInstruction = (instruction: ExerciseInstruction) => (
    <View key={instruction.step} style={styles.instructionCard}>
      <View style={styles.instructionHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{instruction.step}</Text>
        </View>
        <Text style={styles.instructionText}>{instruction.instruction}</Text>
      </View>
      {instruction.tip && (
        <View style={styles.tipContainer}>
          <MaterialIcons name="lightbulb" size={16} color="#FF9800" />
          <Text style={styles.tipText}>{instruction.tip}</Text>
        </View>
      )}
    </View>
  );

  const renderListItem = (item: string, index: number) => (
    <View key={index} style={styles.listItem}>
      <View style={styles.bulletPoint} />
      <Text style={styles.listItemText}>{item}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exerciseData.name.toUpperCase()}</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <MaterialIcons name="favorite-border" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exercise Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseIconContainer}>
              <Text style={styles.exerciseIcon}>{exerciseData.icon}</Text>
            </View>
            <View style={styles.exerciseBasicInfo}>
              <Text style={styles.exerciseName}>{exerciseData.name}</Text>
              <Text style={styles.exerciseDescription}>{exerciseData.description}</Text>
            </View>
          </View>

          {/* Target Muscles */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>TARGET MUSCLES</Text>
            <View style={styles.muscleTagsContainer}>
              {exerciseData.targetMuscles.map((muscle, index) => (
                <View key={index} style={styles.muscleTag}>
                  <Text style={styles.muscleTagText}>{muscle}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Equipment */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>EQUIPMENT</Text>
            {exerciseData.equipment.map((item, index) => renderListItem(item, index))}
          </View>
        </View>

        {/* Difficulty Level Selection */}
        <View style={styles.levelCard}>
          <Text style={styles.sectionTitle}>DIFFICULTY LEVEL</Text>
          <View style={styles.levelButtons}>
            {exerciseData.levels.map((level) => (
              <TouchableOpacity
                key={level.difficulty}
                style={[
                  styles.levelButton,
                  selectedLevel === level.difficulty && styles.selectedLevelButton,
                  { borderColor: getDifficultyColor(level.difficulty) }
                ]}
                onPress={() => setSelectedLevel(level.difficulty)}
              >
                <Text style={[
                  styles.levelButtonText,
                  selectedLevel === level.difficulty && { color: getDifficultyColor(level.difficulty) }
                ]}>
                  {level.difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Current Level Info */}
          {currentLevel && (
            <View style={styles.levelInfo}>
              <View style={styles.levelInfoItem}>
                <MaterialIcons name="fitness-center" size={20} color="#666" />
                <Text style={styles.levelInfoText}>{currentLevel.sets} Sets</Text>
              </View>
              <View style={styles.levelInfoItem}>
                <MaterialIcons name="repeat" size={20} color="#666" />
                <Text style={styles.levelInfoText}>{currentLevel.reps} Reps</Text>
              </View>
              <View style={styles.levelInfoItem}>
                <MaterialIcons name="schedule" size={20} color="#666" />
                <Text style={styles.levelInfoText}>{currentLevel.restBetweenSets}s Rest</Text>
              </View>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>INSTRUCTIONS</Text>
          {exerciseData.instructions.map(renderInstruction)}
        </View>

        {/* Warm-up */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>WARM-UP</Text>
          {exerciseData.warmUp.map((item, index) => renderListItem(item, index))}
        </View>

        {/* Cool-down */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>COOL-DOWN</Text>
          {exerciseData.coolDown.map((item, index) => renderListItem(item, index))}
        </View>

        {/* Safety Tips */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="security" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>SAFETY TIPS</Text>
          </View>
          {exerciseData.safetyTips.map((tip, index) => renderListItem(tip, index))}
        </View>

        {/* Common Mistakes */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="warning" size={20} color="#FF9800" />
            <Text style={styles.sectionTitle}>COMMON MISTAKES</Text>
          </View>
          {exerciseData.commonMistakes.map((mistake, index) => renderListItem(mistake, index))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Start Workout Button */}
      <View style={styles.startButtonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <MaterialIcons name="play-arrow" size={24} color="white" />
          <Text style={styles.startButtonText}>START WORKOUT</Text>
        </TouchableOpacity>
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
  favoriteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  overviewCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  exerciseIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  exerciseIcon: {
    fontSize: 32,
  },
  exerciseBasicInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  muscleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  muscleTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginTop: 8,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  levelCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedLevelButton: {
    backgroundColor: '#F8F9FA',
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  levelInfoItem: {
    alignItems: 'center',
  },
  levelInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingLeft: 44,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginLeft: 8,
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomSpacing: {
    height: 100,
  },
  startButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 1,
  },
});
