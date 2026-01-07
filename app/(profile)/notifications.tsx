import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Notification {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    type: 'order' | 'offer' | 'reminder' | 'general';
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'Order Confirmed',
        description: 'Your order #12345 has been confirmed and will be delivered soon.',
        time: '2 hours ago',
        read: false,
        type: 'order',
    },
    {
        id: '2',
        title: 'Special Offer!',
        description: 'Get 20% off on all cleaning services this weekend.',
        time: '5 hours ago',
        read: false,
        type: 'offer',
    },
    {
        id: '3',
        title: 'Service Reminder',
        description: 'Your AC maintenance is due next week. Book now to get priority service.',
        time: '1 day ago',
        read: true,
        type: 'reminder',
    },
    {
        id: '4',
        title: 'Order Completed',
        description: 'Your plumbing service has been completed. Please rate your experience.',
        time: '2 days ago',
        read: true,
        type: 'order',
    },
    {
        id: '5',
        title: 'New Services Available',
        description: 'We have added new pest control services in your area.',
        time: '3 days ago',
        read: true,
        type: 'general',
    },
];

export default function NotificationsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [settings, setSettings] = useState({
        orderUpdates: true,
        offers: true,
        reminders: true,
        general: false,
    });

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'order':
                return 'receipt';
            case 'offer':
                return 'pricetag';
            case 'reminder':
                return 'alarm';
            default:
                return 'notifications';
        }
    };

    const getNotificationColor = (type: Notification['type']) => {
        switch (type) {
            case 'order':
                return BrandColors.primary;
            case 'offer':
                return BrandColors.success;
            case 'reminder':
                return '#FF9500';
            default:
                return BrandColors.mutedText;
        }
    };

    const handleNotificationPress = (notification: Notification) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                    <Text style={styles.markAllText}>Mark All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Notification Settings */}
                <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Notification Preferences</Text>

                    <View style={styles.settingsCard}>
                        <View style={styles.settingItem}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="receipt-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Order Updates</Text>
                            </View>
                            <Switch
                                value={settings.orderUpdates}
                                onValueChange={(value) => setSettings((prev) => ({ ...prev, orderUpdates: value }))}
                                trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="pricetag-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Offers & Promotions</Text>
                            </View>
                            <Switch
                                value={settings.offers}
                                onValueChange={(value) => setSettings((prev) => ({ ...prev, offers: value }))}
                                trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                            />
                        </View>

                        <View style={styles.settingItem}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="alarm-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>Service Reminders</Text>
                            </View>
                            <Switch
                                value={settings.reminders}
                                onValueChange={(value) => setSettings((prev) => ({ ...prev, reminders: value }))}
                                trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                            />
                        </View>

                        <View style={[styles.settingItem, styles.lastSettingItem]}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="notifications-outline" size={20} color={BrandColors.text} />
                                <Text style={styles.settingText}>General Notifications</Text>
                            </View>
                            <Switch
                                value={settings.general}
                                onValueChange={(value) => setSettings((prev) => ({ ...prev, general: value }))}
                                trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                            />
                        </View>
                    </View>
                </View>

                {/* Notifications List */}
                <View style={styles.notificationsSection}>
                    <Text style={styles.sectionTitle}>Recent Notifications</Text>

                    {notifications.map((notification) => (
                        <TouchableOpacity
                            key={notification.id}
                            style={[styles.notificationCard, !notification.read && styles.unreadNotification]}
                            onPress={() => handleNotificationPress(notification)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.notificationIcon,
                                    { backgroundColor: `${getNotificationColor(notification.type)}15` },
                                ]}
                            >
                                <Ionicons
                                    name={getNotificationIcon(notification.type) as any}
                                    size={24}
                                    color={getNotificationColor(notification.type)}
                                />
                            </View>

                            <View style={styles.notificationContent}>
                                <View style={styles.notificationHeader}>
                                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                                    {!notification.read && <View style={styles.unreadDot} />}
                                </View>
                                <Text style={styles.notificationDescription} numberOfLines={2}>
                                    {notification.description}
                                </Text>
                                <Text style={styles.notificationTime}>{notification.time}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
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
    markAllButton: {
        padding: 4,
    },
    markAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.primary,
    },
    settingsSection: {
        padding: 16,
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
    notificationsSection: {
        padding: 16,
        paddingTop: 0,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    unreadNotification: {
        borderLeftWidth: 3,
        borderLeftColor: BrandColors.primary,
    },
    notificationIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: BrandColors.primary,
    },
    notificationDescription: {
        fontSize: 14,
        color: BrandColors.mutedText,
        lineHeight: 20,
        marginBottom: 4,
    },
    notificationTime: {
        fontSize: 12,
        color: BrandColors.mutedText,
    },
});
