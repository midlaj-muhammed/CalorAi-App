import { Stack } from 'expo-router';

export default function ExerciseLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="automatic" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="workout" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
