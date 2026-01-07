import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="addresses" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="payment-methods" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="help-support" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="about" />
        </Stack>
    );
}
