import { Stack } from "expo-router";
import { AppDataProvider } from "../src/contexts/AppDataContext";
import { AuthProvider } from "../src/contexts/AuthContext";
import { CartProvider } from "../src/contexts/CartContext";
import { theme } from '../src/theme/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <CartProvider>
          <Stack
            screenOptions={{
              headerShown: true,
              headerTitle: "Exotic Store",
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTitleStyle: { fontWeight: "bold", fontSize: 30, color: "#fff" },
            }}
          >
            {/* This points to app/index.tsx which renders MainTabs */}
            <Stack.Screen name="index" />
          </Stack>
        </CartProvider>
      </AppDataProvider>
    </AuthProvider>
  );
}
