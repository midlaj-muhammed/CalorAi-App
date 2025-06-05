import { Stack } from 'expo-router';

export default function IntermittentFastingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="phases" />
      <Stack.Screen name="setup" />
    </Stack>
  );
}
