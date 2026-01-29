import { forgotPassword } from '@/lib';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LoginRole = 'CUSTOMER' | 'PARTNER';

export default function ForgotPassword() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ role?: string }>();
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const role = (params.role || 'CUSTOMER') as LoginRole;

    const handleContinue = async () => {
        if (!mobile.trim()) {
            Alert.alert('Missing Info', 'Please enter your phone or email');
            return;
        }

        try {
            setLoading(true);
            const response = await forgotPassword({
                mobile: mobile.trim(),
                role: role,
            });

            if (response.status) {
                Alert.alert('Success', response.message);
                router.push({
                    pathname: '/(auth)/forgot-password-otp',
                    params: { mobile: mobile.trim(), role: role },
                });
            } else {
                Alert.alert('Error', response.message || 'Failed to send OTP');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.primary} />
                </TouchableOpacity>
                <Text style={styles.heading}>Forgot Password</Text>
            </View>

            <View style={styles.content}>
                <Image source={require('@/assets/images/upworx-logo.png')} style={styles.logo} />

                <Text style={styles.title}>Reset Your Password</Text>
                <Text style={styles.subtitle}>
                    Enter your phone number or email address and we'll send you an OTP to reset your password.
                </Text>

                <TextInput
                    placeholder="Phone or Email"
                    style={styles.input}
                    value={mobile}
                    onChangeText={setMobile}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.disabledBtn]}
                    onPress={handleContinue}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text>Remember your password?</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.link}> Back to Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
        padding: 24,
    },
    backBtn: {
        padding: 6,
        marginRight: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: BrandColors.primary,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    logo: {
        width: 250,
        height: 120,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginTop: '20%',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
        color: BrandColors.text,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 22,
        color: BrandColors.text,
        opacity: 0.7,
        paddingHorizontal: 20,
    },
    input: {
        backgroundColor: BrandColors.card,
        height: 50,
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    primaryBtn: {
        backgroundColor: BrandColors.primary,
        padding: 14,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 10,
    },
    btnText: {
        color: '#fff',
        fontWeight: '700',
    },
    link: {
        color: BrandColors.primary,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    disabledBtn: {
        opacity: 0.6,
    },
});
