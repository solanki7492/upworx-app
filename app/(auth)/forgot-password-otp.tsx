import { forgotPasswordVerifyOtp, resendOtp } from '@/lib';
import { BrandColors } from '@/theme/colors';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LoginRole = 'CUSTOMER' | 'PARTNER';

export default function ForgotPasswordOtp() {
    const { mobile, role } = useLocalSearchParams<{ mobile: string; role: string }>();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = useRef<(TextInput | null)[]>([]);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) inputs.current[index + 1]?.focus();
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 4) {
            Alert.alert('Invalid OTP', 'Please enter a 4-digit OTP');
            return;
        }

        try {
            setLoading(true);
            const response = await forgotPasswordVerifyOtp({
                otp: otpCode,
                mobile: mobile,
                role: role as LoginRole,
            });

            if (response.status) {
                Alert.alert('Success', response.message);
                router.push({
                    pathname: '/(auth)/reset-password',
                    params: { token: response.token },
                });
            } else {
                Alert.alert('Error', response.message || 'OTP verification failed');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred during verification');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setResendLoading(true);
            const response = await resendOtp({
                mobile: mobile,
                role: role as LoginRole,
            });

            if (response.status) {
                Alert.alert('Success', response.message);
                setOtp(['', '', '', '']);
                inputs.current[0]?.focus();
            } else {
                Alert.alert('Error', response.message || 'Failed to resend OTP');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.heading}>Verify OTP</Text>
            </View>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>
                We have sent the OTP to {mobile}. Please enter it below to reset your password.
            </Text>

            <View style={styles.otpRow}>
                {otp.map((value, i) => (
                    <TextInput
                        key={i}
                        ref={(ref) => {
                            inputs.current[i] = ref;
                        }}
                        style={styles.otpBox}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={value}
                        onChangeText={(text) => handleChange(text, i)}
                        editable={!loading}
                    />
                ))}
            </View>

            <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.disabledBtn]}
                onPress={handleVerifyOtp}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.btnText}>Verify OTP</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendOtp}
                disabled={resendLoading || loading}
            >
                {resendLoading ? (
                    <ActivityIndicator color={BrandColors.primary} />
                ) : (
                    <Text style={styles.resendBtnText}>Resend OTP</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'flex-start',
        backgroundColor: BrandColors.background,
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
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'left',
        marginTop: '20%',
    },
    subtitle: {
        textAlign: 'left',
        marginVertical: 12,
        color: BrandColors.mutedText,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
        paddingHorizontal: 20,
    },
    otpBox: {
        width: 60,
        height: 60,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
        textAlign: 'center',
        fontSize: 20,
        backgroundColor: BrandColors.card,
    },
    primaryBtn: {
        backgroundColor: BrandColors.primary,
        padding: 14,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 20,
        height: 50,
        justifyContent: 'center',
    },
    disabledBtn: {
        opacity: 0.6,
    },
    resendBtn: {
        marginTop: 12,
        padding: 10,
        alignItems: 'center',
    },
    resendBtnText: {
        color: BrandColors.primary,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    cancelBtn: {
        backgroundColor: BrandColors.card,
        padding: 14,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 12,
        height: 50,
        justifyContent: 'center',
        borderColor: BrandColors.border,
        borderWidth: 1,
    },
    cancelBtnText: {
        color: BrandColors.text,
        fontWeight: '700',
    },
    btnText: {
        color: '#fff',
        fontWeight: '700',
    },
});
