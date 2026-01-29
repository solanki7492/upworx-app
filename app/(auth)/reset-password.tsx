import { resetPassword } from '@/lib';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResetPassword() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { token } = useLocalSearchParams<{ token: string }>();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!password.trim()) {
            Alert.alert('Missing Info', 'Please enter new password');
            return;
        }
        if (!confirmPassword.trim()) {
            Alert.alert('Missing Info', 'Please confirm your password');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Invalid Password', 'Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            const response = await resetPassword({
                token: token,
                password: password.trim(),
                password_confirmation: confirmPassword.trim(),
            });

            if (response.status) {
                Alert.alert('Success', response.message, [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(auth)/login'),
                    },
                ]);
            } else {
                Alert.alert('Error', response.message || 'Failed to reset password');
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
                <Text style={styles.heading}>Reset Password</Text>
            </View>

            <View style={styles.content}>
                <Image source={require('@/assets/images/upworx-logo.png')} style={styles.logo} />

                <Text style={styles.title}>Create New Password</Text>
                <Text style={styles.subtitle}>
                    Your new password must be different from previously used passwords.
                </Text>

                <View>
                    <TextInput
                        placeholder="New Password"
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

                <View>
                    <TextInput
                        placeholder="Confirm Password"
                        secureTextEntry={!showConfirmPassword}
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={{ position: 'absolute', right: 15, top: 15 }}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Ionicons
                            name={showConfirmPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={BrandColors.primary}
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.disabledBtn]}
                    onPress={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>Reset Password</Text>
                    )}
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
    disabledBtn: {
        opacity: 0.6,
    },
});
