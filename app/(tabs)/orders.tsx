import { BrandColors } from '@/app/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockOrders = [
    {
        id: '1',
        serviceName: 'AC Repair',
        providerName: 'Rajesh Kumar',
        date: '2024-12-28',
        time: '10:00 AM',
        status: 'completed',
        amount: 850,
        address: 'Plot 45, Sector 12, Bareilly',
    },
    {
        id: '2',
        serviceName: 'House Cleaning',
        providerName: 'Sunita Sharma',
        date: '2024-12-25',
        time: '2:00 PM',
        status: 'completed',
        amount: 1200,
        address: 'Flat 301, Green Heights, Bareilly',
    },
    {
        id: '3',
        serviceName: 'Plumbing',
        providerName: 'Amit Singh',
        date: '2024-12-30',
        time: '11:00 AM',
        status: 'ongoing',
        amount: 600,
        address: 'House 23, Civil Lines, Bareilly',
    },
    {
        id: '4',
        serviceName: 'Washing Machine Repair',
        providerName: 'Manoj Verma',
        date: '2024-12-31',
        time: '3:00 PM',
        status: 'scheduled',
        amount: 950,
        address: 'B-12, Premnagar, Bareilly',
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return BrandColors.success;
        case 'ongoing':
            return BrandColors.warning;
        case 'scheduled':
            return BrandColors.primary;
        case 'cancelled':
            return BrandColors.danger;
        default:
            return BrandColors.mutedText;
    }
};

const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function OrdersScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                bounces={false}
                overScrollMode="never"
            >
                {mockOrders.map((order) => (
                    <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.7}>
                        <View style={styles.orderHeader}>
                            <View style={styles.orderHeaderLeft}>
                                <Text style={styles.serviceName}>{order.serviceName}</Text>
                                <Text style={styles.orderId}>Order #{order.id}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                                    {getStatusText(order.status)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.orderDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="person-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.detailText}>{order.providerName}</Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="calendar-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.detailText}>
                                    {order.date} at {order.time}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.detailText} numberOfLines={1}>
                                    {order.address}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.orderFooter}>
                            <View>
                                <Text style={styles.amountLabel}>Total Amount</Text>
                                <Text style={styles.amount}>₹{order.amount}</Text>
                            </View>

                            {order.status === 'completed' && (
                                <TouchableOpacity style={styles.rebookButton}>
                                    <Text style={styles.rebookText}>Rebook</Text>
                                </TouchableOpacity>
                            )}

                            {order.status === 'scheduled' && (
                                <TouchableOpacity style={styles.viewDetailsButton}>
                                    <Text style={styles.viewDetailsText}>View Details</Text>
                                </TouchableOpacity>
                            )}

                            {order.status === 'ongoing' && (
                                <TouchableOpacity style={styles.trackButton}>
                                    <Text style={styles.trackText}>Track</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
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
    orderCard: {
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
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderHeaderLeft: {
        flex: 1,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 4,
    },
    orderId: {
        fontSize: 13,
        color: BrandColors.mutedText,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: BrandColors.border,
        marginVertical: 12,
    },
    orderDetails: {
        gap: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailText: {
        fontSize: 14,
        color: BrandColors.text,
        flex: 1,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    amountLabel: {
        fontSize: 13,
        color: BrandColors.mutedText,
        marginBottom: 2,
    },
    amount: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.primary,
    },
    rebookButton: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    rebookText: {
        color: BrandColors.card,
        fontSize: 14,
        fontWeight: '600',
    },
    viewDetailsButton: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    viewDetailsText: {
        color: BrandColors.card,
        fontSize: 14,
        fontWeight: '600',
    },
    trackButton: {
        backgroundColor: BrandColors.warning,
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 8,
    },
    trackText: {
        color: BrandColors.card,
        fontSize: 14,
        fontWeight: '600',
    },
});
