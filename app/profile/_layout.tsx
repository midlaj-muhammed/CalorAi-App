import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="edit-avatar" />
      <Stack.Screen name="goals-targets" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="app-preferences" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="nutrition-settings" />
      <Stack.Screen name="privacy-data" />
      <Stack.Screen name="data-export" />
      <Stack.Screen name="about" />
      <Stack.Screen name="help-support" />
    </Stack>
  );
}
