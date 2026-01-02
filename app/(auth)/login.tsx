import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandColors } from '@/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Login() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.heading}>
                    Login
                </Text>
            </View>
            <View style={styles.content}>
                <Image source={require('@/assets/images/upworx-logo.png')} style={styles.logo} />

                <Text style={styles.title}>Welcome Back!</Text>

                <TextInput
                    placeholder="Phone or Email"
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                />

                <View>
                    <TextInput
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        style={styles.input}
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
                    onPress={() => {
                        if (!username.trim()) {
                            Alert.alert('Missing Info', 'Please enter phone number or email first');
                            return;
                        } else if (username.trim().length < 10) {
                            Alert.alert('Invalid Info', 'Please enter a valid phone number');
                            return;
                        }

                        router.push({
                            pathname: '/(auth)/otp',
                            params: { user: username },
                        });
                    }}
                >
                    <Text style={styles.otpText}>Proceed with OTP</Text>
                </TouchableOpacity>


                <TouchableOpacity style={styles.primaryBtn}>
                    <Text style={styles.btnText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginTop: 12, alignSelf: 'flex-end' }}>
                    <Text style={styles.link}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footerWrapper}>
                <View style={styles.footer}>
                    <Text>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                        <Text style={styles.link}> Create Account</Text>
                    </TouchableOpacity>
                </View>
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
    footerWrapper: {
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
});
