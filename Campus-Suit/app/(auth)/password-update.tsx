import { Stack } from 'expo-router';
import { PasswordUpdateScreen } from '../../src/screens/Auth/PasswordUpdate';

export default function PasswordUpdatePage() {
  return (
    <>
      <Stack.Screen options={{ title: 'Reset Password' }} />
      <PasswordUpdateScreen />
    </>
  );
}
