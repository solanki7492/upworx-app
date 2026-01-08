import { AppProvider } from '@/contexts/app-provider';
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
      <AppProvider>
        <CartProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(booking)" options={{ headerShown: false }} />
            <Stack.Screen name="(cart)" options={{ headerShown: false }} />
            <Stack.Screen name="(profile)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </CartProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
