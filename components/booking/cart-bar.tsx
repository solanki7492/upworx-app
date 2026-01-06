import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CartBarProps = {
    count: number;
    total: number;
    onView: () => void;
};

export function CartBar({ count, total, onView }: CartBarProps) {
    return (
        <View style={styles.bar}>
            <View style={styles.leftSection}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{count}</Text>
                </View>
                <View>
                    <Text style={styles.itemsText}>
                        {count} item{count > 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.totalText}>₹ {total.toLocaleString()}</Text>
                </View>
            </View>

            <TouchableOpacity onPress={onView} style={styles.viewButton}>
                <Text style={styles.viewText}>View Items</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: BrandColors.primary,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
    itemsText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 13,
        fontWeight: '500',
    },
    totalText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },
    viewButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    viewText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    }
});