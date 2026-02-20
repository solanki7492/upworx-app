import { useAuth } from '@/contexts/auth-context';
import { login as loginApi, resendOtp, StorageService } from '@/lib';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Login() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { login: authLogin } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!mobile.trim()) {
            Alert.alert('Missing Info', 'Please enter mobile number');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Missing Info', 'Please enter password');
            return;
        }

        try {
            setLoading(true);
            const response = await loginApi({
                mobile: mobile.trim(),
                password: password.trim(),
                role: 'CUSTOMER'
            });

            if (response.status) {
                await authLogin(response.token, response.user, response.role);

                // Check if there's a pending redirect, if not, use default navigation
                const pendingRedirect = await StorageService.getPendingRedirect();
                if (!pendingRedirect) {
                    router.replace('/(tabs)');
                }
                // If there's a pending redirect, authLogin will handle it
            } else {
                Alert.alert('Error', response.message || 'Login failed');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    const handleLoginWithOtp = async () => {
        if (!mobile.trim()) {
            Alert.alert('Missing Info', 'Please enter mobile number');
            return;
        }

        try {
            setLoading(true);
            await resendOtp({ mobile: mobile.trim(), role: 'CUSTOMER' });
            router.replace({
                pathname: '/(auth)/otp',
                params: { mobile: mobile.trim(), from: 'login' },
            });
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send OTP');
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
                <Text style={styles.heading}>
                    Customer Login
                </Text>
            </View>
            <View style={styles.content}>
                <Image source={require('@/assets/images/upworx-logo.png')} style={styles.logo} />

                <Text style={styles.title}>
                    Welcome Back!
                </Text>

                <TextInput
                    placeholder="Phone or Email"
                    style={styles.input}
                    value={mobile}
                    onChangeText={setMobile}
                    editable={!loading}
                />

                <View>
                    <TextInput
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={{ position: 'absolute', right: 15, top: 15 }}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={BrandColors.primary}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleLoginWithOtp}
                    disabled={loading}
                >
                    <Text style={styles.otpText}>Proceed with OTP</Text>
                </TouchableOpacity>


                <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.disabledBtn]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ marginTop: 12, alignSelf: 'flex-end' }}
                    onPress={() => router.push('/(auth)/forgot-password')}
                    disabled={loading}
                >
                    <Text style={styles.link}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                    <Text style={styles.link}> Create Account</Text>
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
        marginBottom: 22,
        color: BrandColors.text,
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
    otpText: {
        textAlign: 'right',
        color: BrandColors.primary,
        marginBottom: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    disabledBtn: {
        opacity: 0.6,
    },
});
