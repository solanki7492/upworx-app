import { AppProvider } from '@/contexts/app-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { CartProvider } from '@/contexts/cart-context';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppTheme } from '../theme/navigation';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {

  return (
    <ThemeProvider value={AppTheme}>
      <AuthProvider>
        <AppProvider>
          <CartProvider>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(booking)" options={{ headerShown: false }} />
              <Stack.Screen name="(order)" options={{ headerShown: false }} />
              <Stack.Screen name="(cart)" options={{ headerShown: false }} />
              <Stack.Screen name="(profile)" options={{ headerShown: false }} />
              <Stack.Screen name="(lead)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </CartProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
