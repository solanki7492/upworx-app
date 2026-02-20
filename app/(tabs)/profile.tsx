import { useAuth } from '@/contexts/auth-context';
import { logout as logoutApi } from '@/lib';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const profileMenuItems = [
    {
        id: '1',
        title: 'Edit Profile',
        icon: 'person-outline',
        route: '/(profile)/edit-profile',
    },
    {
        id: '2',
        title: 'My Addresses',
        icon: 'location-outline',
        route: '/(profile)/addresses',
    },
    {
        id: '3',
        title: 'Notifications',
        icon: 'notifications-outline',
        route: '/(profile)/notifications',
    },
    {
        id: '4',
        title: 'Help & Support',
        icon: 'help-circle-outline',
        route: '/(profile)/help-support',
    },
    {
        id: '5',
        title: 'Settings',
        icon: 'settings-outline',
        route: '/(profile)/settings',
    },
    {
        id: '6',
        title: 'About',
        icon: 'information-circle-outline',
        route: '/(profile)/about',
    },
];

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const { user, isAuthenticated, logout: authLogout } = useAuth();
    const router = useRouter();
    const [logoutLoading, setLogoutLoading] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLogoutLoading(true);
                            await logoutApi();
                            await authLogout();
                            router.replace('/(auth)/login');
                        } catch (error: any) {
                            // Even if API fails, logout locally
                            await authLogout();
                            router.replace('/(auth)/login');
                        } finally {
                            setLogoutLoading(false);
                        }
                    },
                },
            ]
        );
    };

    if (!isAuthenticated || !user) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>
                <View style={styles.notLoggedInContainer}>
                    <Ionicons name="person-outline" size={64} color={BrandColors.mutedText} />
                    <Text style={styles.notLoggedInText}>You are not logged in</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => router.push('/(auth)/login')}
                    >
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                bounces={false}
                overScrollMode="never"
            >
                {/* User Info Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            {user?.image ? (
                                <Image source={{ uri: user.image }} style={styles.avatarImage} resizeMode="cover" />
                            ) : (
                                <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
                            )}
                        </View>
                        <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.7}>
                            <Ionicons name="camera" size={16} color={BrandColors.card} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name}</Text>

                        <View style={styles.userDetails}>
                            <View style={styles.userDetailRow}>
                                <Ionicons name="mail-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.userDetailText}>{user.email ? user.email : 'N/A'}</Text>
                            </View>

                            <View style={styles.userDetailRow}>
                                <Ionicons name="call-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.userDetailText}>{user.phone ? "+91 " + user.phone : 'N/A'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                {/* <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Total Orders</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>8</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>2</Text>
                        <Text style={styles.statLabel}>Ongoing</Text>
                    </View>
                </View> */}

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {profileMenuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                index === profileMenuItems.length - 1 && styles.lastMenuItem,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => router.push(item.route as any)}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={styles.menuIconContainer}>
                                    <Ionicons name={item.icon as any} size={22} color={BrandColors.primary} />
                                </View>
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    activeOpacity={0.7}
                    onPress={handleLogout}
                    disabled={logoutLoading}
                >
                    {logoutLoading ? (
                        <ActivityIndicator color={BrandColors.danger} />
                    ) : (
                        <>
                            <Ionicons name="log-out-outline" size={22} color={BrandColors.danger} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.versionText}>Version 1.0.1</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
        marginHorizontal: 16,
    },
    header: {
        marginBottom: 18,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: BrandColors.text,
    },
    userCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: BrandColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        color: BrandColors.card,
        fontWeight: 'bold',
        fontSize: 32,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: BrandColors.secondary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: BrandColors.card,
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 10,
    },
    userMeta: {
        fontSize: 13,
        color: BrandColors.mutedText,
        marginBottom: 16,
    },
    userDetails: {
        width: '100%',
        gap: 10,
    },
    userDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    userDetailText: {
        fontSize: 14,
        color: BrandColors.text,
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: BrandColors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: BrandColors.mutedText,
        textAlign: 'center',
    },
    menuSection: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    lastMenuItem: {
        borderBottomWidth: 0,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${BrandColors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: BrandColors.text,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.danger,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: BrandColors.mutedText,
        marginBottom: 10,
    },
    notLoggedInContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    notLoggedInText: {
        fontSize: 18,
        color: BrandColors.mutedText,
        marginTop: 16,
        marginBottom: 24,
    },
    loginButton: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 30,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
