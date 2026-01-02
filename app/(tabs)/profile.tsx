import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockUser = {
    name: 'Gaurav Kumar',
    email: 'gaurav.kumar@example.com',
    phone: '+91 9876543210',
    address: 'Plot 45, Sector 12, Bareilly, UP',
    joinedDate: 'January 2024',
};

const profileMenuItems = [
    {
        id: '1',
        title: 'Edit Profile',
        icon: 'person-outline',
        action: 'edit-profile',
    },
    {
        id: '2',
        title: 'My Addresses',
        icon: 'location-outline',
        action: 'addresses',
    },
    {
        id: '3',
        title: 'Payment Methods',
        icon: 'card-outline',
        action: 'payments',
    },
    {
        id: '4',
        title: 'Notifications',
        icon: 'notifications-outline',
        action: 'notifications',
    },
    {
        id: '5',
        title: 'Help & Support',
        icon: 'help-circle-outline',
        action: 'support',
    },
    {
        id: '6',
        title: 'Settings',
        icon: 'settings-outline',
        action: 'settings',
    },
    {
        id: '7',
        title: 'About',
        icon: 'information-circle-outline',
        action: 'about',
    },
];

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();

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
                            <Text style={styles.avatarText}>{mockUser.name.charAt(0)}</Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.7}>
                            <Ionicons name="camera" size={16} color={BrandColors.card} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{mockUser.name}</Text>
                        <Text style={styles.userMeta}>Member since {mockUser.joinedDate}</Text>

                        <View style={styles.userDetails}>
                            <View style={styles.userDetailRow}>
                                <Ionicons name="mail-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.userDetailText}>{mockUser.email}</Text>
                            </View>

                            <View style={styles.userDetailRow}>
                                <Ionicons name="call-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.userDetailText}>{mockUser.phone}</Text>
                            </View>

                            <View style={styles.userDetailRow}>
                                <Ionicons name="location-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.userDetailText} numberOfLines={2}>
                                    {mockUser.address}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
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
                </View>

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
                <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
                    <Ionicons name="log-out-outline" size={22} color={BrandColors.danger} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <Text style={styles.versionText}>Version 1.0.0</Text>
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
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
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
        marginBottom: 4,
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
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
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
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
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
});
