import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BrandColors } from '@/theme/colors';
import { useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OtpScreen() {
    const { user } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [otp, setOtp] = useState(['', '', '', '']);
    const inputs = useRef<(TextInput | null)[]>([]);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) inputs.current[index + 1]?.focus();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.heading}>
                    Verify OTP
                </Text>
            </View>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>We have sent the OTP to your phone number {user}</Text>

            <View style={styles.otpRow}>
                {otp.map((value, i) => (
                    <TextInput
                        key={i}
                        ref={(ref) => { inputs.current[i] = ref; }}
                        style={styles.otpBox}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={value}
                        onChangeText={(text) => handleChange(text, i)}
                    />
                ))}
            </View>

            <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.btnText}>Verify OTP</Text>
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