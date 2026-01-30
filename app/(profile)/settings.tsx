import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [settings, setSettings] = useState({
        darkMode: false,
        pushNotifications: true,
        emailNotifications: false,
        smsNotifications: true,
        locationServices: true,
        autoPlayVideos: false,
    });

    const handleClearCache = () => {
        Alert.alert('Clear Cache', 'Are you sure you want to clear the app cache?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear',
                style: 'destructive',
                onPress: () => {
                    Alert.alert('Success', 'Cache cleared successfully');
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Account Deletion', 'Please contact support to delete your account.');
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* App Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Settings</Text>
                    <View style={styles.settingsCard}>
                        <View style={styles.settingItem}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="moon-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Dark Mode</Text>
                            </View>
                            <Switch
                                value={settings.darkMode}
                                onValueChange={(value) => {
                                    setSettings((prev) => ({ ...prev, darkMode: value }));
                                    Alert.alert('Coming Soon', 'Dark mode will be available in the next update');
                                }}
                                trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="location-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Location Services</Text>
                            </View>
                            <Switch
                                value={settings.locationServices}
                                onValueChange={(value) => setSettings((prev) => ({ ...prev, locationServices: value }))}
                                trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                            />
                        </View>
                    </View>
                </View>

                {/* Notification Settings */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.settingsCard}>
                        <View style={styles.settingItem}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="notifications-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Push Notifications</Text>
                            </View>
                            <Switch
                                value={settings.pushNotifications}
                                onValueChange={(value) =>
                                    setSettings((prev) => ({ ...prev, pushNotifications: value }))
                                }
                                trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="mail-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Email Notifications</Text>
                            </View>
                            <Switch
                                value={settings.emailNotifications}
                                onValueChange={(value) =>
                                    setSettings((prev) => ({ ...prev, emailNotifications: value }))
                                }
                                trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                            />
                        </View>

                        <View style={[styles.settingItem, styles.lastSettingItem]}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="chatbox-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>SMS Notifications</Text>
                            </View>
                            <Switch
                                value={settings.smsNotifications}
                                onValueChange={(value) => setSettings((prev) => ({ ...prev, smsNotifications: value }))}
                                trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                            />
                        </View>
                    </View>
                </View>

                {/* Privacy & Security */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy & Security</Text>
                    <View style={styles.settingsCard}>
                        <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Privacy Policy</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="document-text-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Terms of Service</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.settingItem, styles.lastSettingItem]} activeOpacity={0.7} onPress={() => router.push('/(profile)/change-password')}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="key-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Change Password</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Data Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Management</Text>
                    <View style={styles.settingsCard}>
                        <TouchableOpacity style={styles.settingItem} activeOpacity={0.7} onPress={handleClearCache}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="trash-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Clear Cache</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="download-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Download My Data</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.settingItem, styles.lastSettingItem]}
                            activeOpacity={0.7}
                            onPress={handleDeleteAccount}
                        >
                            <View style={styles.settingInfo}>
                                <Ionicons name="warning-outline" size={20} color={BrandColors.danger} />
                                <Text style={[styles.settingText, { color: BrandColors.danger }]}>Delete Account</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* App Version */}
                <View style={[styles.section, styles.lastSection]}>
                    <View style={styles.versionCard}>
                        <Text style={styles.versionLabel}>App Version</Text>
                        <Text style={styles.versionText}>1.0.1</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

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
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
        flex: 1,
        textAlign: 'center',
    },
    section: {
        padding: 16,
    },
    lastSection: {
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 12,
    },
    settingsCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    lastSettingItem: {
        borderBottomWidth: 0,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    settingText: {
        fontSize: 16,
        fontWeight: '500',
        color: BrandColors.text,
    },
    versionCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    versionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
    },
    versionText: {
        fontSize: 16,
        color: BrandColors.mutedText,
    },
});
