import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '@/theme/colors';
import { changePassword } from '@/lib/services/auth';

export default function ChangePassword() {
    const insets = useSafeAreaInsets();

    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !password || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await changePassword(
                currentPassword,
                password,
                confirmPassword
            );

            if (response?.status) {
                Alert.alert('Success', response.message);
                setCurrentPassword('');
                setPassword('');
                setConfirmPassword('');
            } else {
                Alert.alert('Error', response.message || 'Something went wrong');
            }
        } catch (error: any) {
            Alert.alert(
                'Error',
                error?.response?.data?.message || 'Failed to change password'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>
                Update your password to keep your account secure
            </Text>

            {/* Current Password */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter current password"
                        placeholderTextColor={BrandColors.mutedText}
                        secureTextEntry={!showPassword}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                </View>
            </View>

            {/* New Password */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter new password"
                        placeholderTextColor={BrandColors.mutedText}
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={BrandColors.mutedText}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={BrandColors.mutedText}
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>

            {/* Submit */}
            <TouchableOpacity
                style={styles.button}
                onPress={handleChangePassword}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Update Password</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: BrandColors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: BrandColors.mutedText,
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        color: BrandColors.text,
        marginBottom: 6,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        color: BrandColors.text,
        backgroundColor: BrandColors.card,
    },
    passwordWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    eyeIcon: {
        position: 'absolute',
        right: 14,
    },
    button: {
        height: 48,
        borderRadius: 12,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
