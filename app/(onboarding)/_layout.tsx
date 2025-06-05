import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="activity-level" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="target-weight" />
      <Stack.Screen name="personalized-plan" />
    </Stack>
  );
}
