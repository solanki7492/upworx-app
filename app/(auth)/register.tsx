import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { BrandColors } from '@/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [agreed, setAgreed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.heading}>
                    Register
                </Text>
            </View>
            <View style={styles.content}>
                <Image source={require('@/assets/images/upworx-logo.png')} style={styles.logo} />

                <Text style={styles.title}>Create Account</Text>

                <TextInput placeholder="Full Name" style={styles.input} />
                <TextInput placeholder="Phone" style={styles.input} keyboardType="phone-pad" />
                <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" />
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
                <View>
                    <TextInput
                        placeholder="Confirm Password"
                        secureTextEntry={!showConfirmPassword}
                        style={styles.input}
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

                <View style={styles.checkboxRow}>
                    <Pressable
                        onPress={() => setAgreed(!agreed)}
                        style={[
                        styles.checkbox,
                        agreed && {
                            backgroundColor: BrandColors.primary,
                            borderColor: BrandColors.primary,
                        },
                        ]}
                    >
                        {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </Pressable>

                    <Text>I agree to the </Text>
                    <TouchableOpacity>
                        <Text style={styles.link}>Terms of Service</Text>
                    </TouchableOpacity>
                </View>


                <TouchableOpacity style={styles.primaryBtn}>
                    <Text style={styles.btnText}>Register</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footerWrapper}>
                <View style={styles.footer}>
                    <Text>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.link}> Login</Text>
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
        marginTop: '5%',
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
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: BrandColors.border,
        backgroundColor: BrandColors.background,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
