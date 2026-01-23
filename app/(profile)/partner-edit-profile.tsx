import { useAuth } from '@/contexts/auth-context';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
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
import { updatePartnerProfile } from '@/lib/services/user';
import { StorageService } from '@/lib/utils/storage';

export default function PartnerEditProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, setUser } = useAuth();

    const [saving, setSaving] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    const [profileImage, setProfileImage] = useState<any>(null);
    const [idProof, setIdProof] = useState<any>(null);

    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: user?.phone || '',
        dob: user?.dob || '',
        gender: user?.gender || '',
        alternate_mobile: user?.alternate_phone || '',
    });

    const pickImage = async (setter: any) => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });

        if (!res.canceled) {
            const asset = res.assets[0];
            setter({
                uri: asset.uri,
                name: asset.fileName || `file_${Date.now()}.jpg`,
                type: asset.mimeType || 'image/jpeg',
            });
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const formData = new FormData();

            formData.append('name', form.name);
            formData.append('email', form.email);
            formData.append('mobile', form.mobile);
            formData.append('dob', form.dob);
            formData.append('gender', form.gender);
            formData.append('alternate_mobile', form.alternate_mobile);

            if (profileImage) {
                formData.append('profile', profileImage);
            }

            if (idProof) {
                formData.append('file', idProof);
            }

            const res = await updatePartnerProfile(formData);

            await StorageService.setUserData(res.data);
            setUser(res.data);

            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (e) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Partner Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        {(profileImage?.uri || user?.image) ? (
                            <Image
                                source={{ uri: profileImage?.uri || user?.image! }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={styles.avatarText}>
                                {form.name?.charAt(0)}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={styles.changePhotoButton}
                        onPress={() => pickImage(setProfileImage)}
                    >
                        <Ionicons name="camera" size={20} color={BrandColors.primary} />
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* INPUTS */}
                {[
                    { label: 'Full Name', key: 'name' },
                    { label: 'Email', key: 'email' },
                    { label: 'Mobile', key: 'mobile' },
                    { label: 'Date of Birth (YYYY-MM-DD)', key: 'dob' },
                    { label: 'Gender (Male/Female/Other)', key: 'gender' },
                    { label: 'Alternate Mobile', key: 'alternate_mobile' },
                ].map((item) => (
                    <View key={item.key} style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>{item.label}</Text>
                        <TextInput
                            style={styles.input}
                            value={(form as any)[item.key]}
                            onChangeText={(t) =>
                                setForm({ ...form, [item.key]: t })
                            }
                        />
                    </View>
                ))}

                {/* ID PROOF */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Upload ID Proof *</Text>

                    <View style={styles.idRow}>
                        <TouchableOpacity
                            style={styles.uploadBtn}
                            onPress={() => pickImage(setIdProof)}
                        >
                            <Ionicons name="cloud-upload-outline" size={18} />
                            <Text>Upload</Text>
                        </TouchableOpacity>

                        {user?.at_least_one_id_proof_verified?.url && (
                            <TouchableOpacity onPress={() => setPreviewVisible(true)}>
                                <Ionicons
                                    name="eye-outline"
                                    size={22}
                                    color={BrandColors.primary}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* SAVE */}
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* ID PREVIEW */}
            <Modal visible={previewVisible} transparent>
                <TouchableOpacity
                    style={styles.previewOverlay}
                    onPress={() => setPreviewVisible(false)}
                >
                    <Image
                        source={{ uri: user?.at_least_one_id_proof_verified?.url }}
                        style={styles.previewImage}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BrandColors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
    },
    content: { padding: 16 },
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: BrandColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: { width: '100%', height: '100%', borderRadius: 50 },
    avatarText: { fontSize: 36, color: '#fff', fontWeight: '700' },
    changePhotoButton: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    changePhotoText: {
        color: BrandColors.primary,
        fontWeight: '600',
    },
    inputContainer: { marginBottom: 18 },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        color: BrandColors.text,
    },
    input: {
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 10,
        padding: 14,
        backgroundColor: BrandColors.card,
    },
    idRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    uploadBtn: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
        backgroundColor: BrandColors.card,
    },
    saveButton: {
        backgroundColor: BrandColors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '90%',
        height: '80%',
    },
});