import { register as registerApi } from '@/lib';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RegisterRole = 'CUSTOMER' | 'PARTNER';

export default function Register() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [agreed, setAgreed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<RegisterRole>('CUSTOMER');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleRegister = async () => {
        // Validation
        if (!formData.name.trim()) {
            Alert.alert('Missing Info', 'Please enter your full name');
            return;
        }
        if (!formData.phone.trim() || formData.phone.length < 10) {
            Alert.alert('Invalid Info', 'Please enter a valid mobile number');
            return;
        }
        if (!formData.email.trim()) {
            Alert.alert('Missing Info', 'Please enter your email');
            return;
        }
        if (!formData.password.trim()) {
            Alert.alert('Missing Info', 'Please enter a password');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (!agreed) {
            Alert.alert('Terms Required', 'Please agree to the Terms of Service');
            return;
        }

        try {
            setLoading(true);
            const response = await registerApi({
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                password: formData.password.trim(),
                terms: 1,
            });

            if (response.status) {
                Alert.alert('Success', response.message);
                router.replace({
                    pathname: '/(auth)/otp',
                    params: {
                        mobile: formData.phone.trim(),
                        from: 'register',
                        userId: response.data.user_id.toString(),
                        role: role,
                    },
                });
            } else {
                Alert.alert('Error', response.message || 'Registration failed');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred during registration');
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
                    {role === 'CUSTOMER' ? 'Customer Registration' : 'Partner Registration'}
                </Text>
            </View>
            <View style={styles.content}>
                <Image source={require('@/assets/images/upworx-logo.png')} style={styles.logo} />

                <Text style={styles.title}>
                    {role === 'CUSTOMER' ? 'Create Customer Account' : 'Create Partner Account'}
                </Text>

                <TextInput
                    placeholder="Full Name"
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                    editable={!loading}
                />
                <TextInput
                    placeholder="Mobile Number"
                    style={styles.input}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    editable={!loading}
                />
                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    editable={!loading}
                />
                <View>
                    <TextInput
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        value={formData.password}
                        onChangeText={(text) => setFormData({ ...formData, password: text })}
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
                        value={formData.confirmPassword}
                        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                        editable={!loading}
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


                <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.disabledBtn]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>Register</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.footerWrapper}>
                <View style={styles.footer}>
                    <Text>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.link}> Login</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setRole(prev => (prev === 'CUSTOMER' ? 'PARTNER' : 'CUSTOMER'));
                        setFormData({
                            name: '',
                            phone: '',
                            email: '',
                            password: '',
                            confirmPassword: '',
                        });
                    }}
                    disabled={loading}
                    style={[
                        styles.roleSwitchBtn,
                        role === 'PARTNER' && styles.roleSwitchActive,
                        loading && styles.disabledBtn,
                    ]}
                >
                    <Ionicons
                        name={role === 'CUSTOMER' ? 'briefcase-outline' : 'person-outline'}
                        size={18}
                        color={role === 'CUSTOMER' ? BrandColors.primary : '#fff'}
                        style={{ marginRight: 8 }}
                    />
                    <Text
                        style={[
                            styles.roleSwitchText,
                            role === 'PARTNER' && styles.roleSwitchTextActive,
                        ]}
                    >
                        {role === 'CUSTOMER' ? 'Switch to Partner Registration' : 'Switch to Customer Registration'}
                    </Text>
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
    disabledBtn: {
        opacity: 0.6,
    },
    roleSwitchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: BrandColors.primary,
        backgroundColor: 'transparent',
        marginVertical: 14,
    },
    roleSwitchActive: {
        backgroundColor: BrandColors.primary,
    },
    roleSwitchText: {
        fontWeight: '700',
        color: BrandColors.primary,
        fontSize: 15,
    },
    roleSwitchTextActive: {
        color: '#fff',
    },
});
