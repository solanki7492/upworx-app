import { useAuth } from '@/contexts/auth-context';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { updateUserProfile } from '@/lib/services/user';
import { StorageService } from '@/lib/utils/storage';

export default function EditProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, setUser } = useAuth();

    const [saving, setSaving] = useState(false);
    const [profileImage, setProfileImage] = useState<{
        uri: string;
        name: string;
        type: string;
    } | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const getInitials = (name: string) =>
        name
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');

    const imageUri =
        profileImage?.uri ??
        (typeof user?.image === 'string' ? user.image : undefined);

    const pickImage = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permission.status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photos'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setProfileImage({
                uri: asset.uri,
                name: asset.fileName || `profile_${Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            });
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Validation Error', 'Please enter your name');
            return;
        }

        const hasChanges =
            formData.name !== user?.name ||
            formData.email !== user?.email ||
            formData.phone !== user?.phone ||
            !!profileImage;

        if (!hasChanges) {
            Alert.alert('No Changes', 'Nothing to update');
            return;
        }

        try {
            setSaving(true);

            const res = await updateUserProfile({
                name: formData.name,
                email: formData.email,
                mobile: formData.phone,
                image: profileImage || undefined,
            });

            const updatedUser = res.data;

            await StorageService.setUserData(updatedUser);
            setUser(updatedUser);

            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={BrandColors.text}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        {imageUri ? (
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={styles.avatarText}>
                                {getInitials(formData.name)}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.changePhotoButton}
                        onPress={pickImage}
                    >
                        <Ionicons
                            name="camera"
                            size={20}
                            color={BrandColors.primary}
                        />
                        <Text style={styles.changePhotoText}>
                            Change Photo
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.name}
                            onChangeText={(t) =>
                                setFormData((p) => ({ ...p, name: t }))
                            }
                            placeholder="Enter your full name"
                            placeholderTextColor={BrandColors.mutedText}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(t) =>
                                setFormData((p) => ({ ...p, email: t }))
                            }
                            placeholder="Enter your email"
                            placeholderTextColor={BrandColors.mutedText}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <View style={styles.phoneInputContainer}>
                            <Text style={styles.phonePrefix}>+91</Text>
                            <TextInput
                                style={[styles.input, styles.phoneInput]}
                                value={formData.phone}
                                onChangeText={(t) =>
                                    setFormData((p) => ({
                                        ...p,
                                        phone: t.replace(/[^0-9]/g, ''),
                                    }))
                                }
                                placeholder="Enter phone number"
                                placeholderTextColor={BrandColors.mutedText}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>
                </View>

                {/* Save */}
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        saving && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color={BrandColors.card} />
                    ) : (
                        <Text style={styles.saveButtonText}>
                            Save Changes
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    backButton: { padding: 4 },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
        flex: 1,
        textAlign: 'center',
    },
    content: { padding: 16 },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: BrandColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarText: {
        color: BrandColors.card,
        fontSize: 40,
        fontWeight: 'bold',
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    changePhotoText: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.primary,
    },
    form: { marginBottom: 24 },
    inputContainer: { marginBottom: 20 },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: BrandColors.text,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    phonePrefix: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
        backgroundColor: BrandColors.card,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    phoneInput: { flex: 1 },
    saveButton: {
        backgroundColor: BrandColors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 30,
    },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: {
        color: BrandColors.card,
        fontSize: 16,
        fontWeight: '700',
    },
});