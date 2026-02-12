import { Stack } from "expo-router";
import { AppDataProvider } from "../src/contexts/AppDataContext";
import { AuthProvider } from "../src/contexts/AuthContext";
import { CartProvider } from "../src/contexts/CartContext";
import { NotificationProvider } from "../src/contexts/NotificationContext";
import { theme } from '../src/theme/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <CartProvider>
          <NotificationProvider>
          <Stack
            screenOptions={{
              headerShown: true,
              headerTitle: "-Lelean International-",
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: theme.colors.primary, },
              headerTitleStyle: { fontWeight: "800", fontSize: 23, color: "#fff" },
            }}
          >
            {/* This points to app/index.tsx which renders MainTabs */}
            <Stack.Screen name="index" />
          </Stack>
          </NotificationProvider>
        </CartProvider>
      </AppDataProvider>
    </AuthProvider>
  );
}
