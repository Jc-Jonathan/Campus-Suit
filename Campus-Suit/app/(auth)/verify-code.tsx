import { Stack, useLocalSearchParams } from 'expo-router';
import { VerifyCodeScreen } from '../../src/screens/Auth/VerifyCodeScreen';

export default function VerifyCodePage() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return (
    <>
      <Stack.Screen options={{ title: 'Verify Code' }} />
      <VerifyCodeScreen route={{ params: { email } }} />
    </>
  );
}
