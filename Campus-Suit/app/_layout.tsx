import { Stack } from "expo-router";
import { AppDataProvider } from "../src/contexts/AppDataContext";
import { AuthProvider } from "../src/contexts/AuthContext";
import { theme } from '../src/theme/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <Stack
  screenOptions={{
    headerShown: true,
    headerTitle: "Exotic Store",
    headerTitleAlign: "center",
    headerStyle: { 
      backgroundColor: theme.colors.primary,
    } as const,
    headerTitleStyle: { 
      fontWeight: "bold", 
      fontSize: 30, 
      color: "#fff",
    },
    contentStyle: {
      paddingBottom: 15, // This will add padding below the header
    }
  }}
>
          {/* This points to app/index.tsx which renders MainTabs */}
          <Stack.Screen name="index" />
        </Stack>
      </AppDataProvider>
    </AuthProvider>
  );
}
