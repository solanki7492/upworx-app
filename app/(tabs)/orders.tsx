import CartBar from '@/components/cart-bar';
import { fetchOrders } from '@/lib/services/orders';
import { OrderItem } from '@/lib/types/order';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return BrandColors.success;
        case 'ongoing':
        case 'in-progress':
        case 'assigned':
            return BrandColors.warning;
        case 'pending':
        case 'scheduled':
            return BrandColors.primary;
        case 'cancelled':
        case 'customer-denied-service':
            return BrandColors.danger;
        default:
            return BrandColors.mutedText;
    }
};

const getStatusText = (statusName: string) => {
    return statusName;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatTime = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

const formatDateTime = (dateString: string, timeString: string) => {
    return `${formatDate(dateString)} at ${formatTime(timeString)}`;
};

export default function OrdersScreen() {
    const insets = useSafeAreaInsets();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        loadOrders(1);
    }, []);

    const loadOrders = async (pageNumber = 1) => {
        if (loadingMore || !hasMore) return;

        try {
            pageNumber === 1 ? setLoading(true) : setLoadingMore(true);
            setError(null);

            const response = await fetchOrders(undefined, pageNumber);

            const newOrders = response.data.data;

            setOrders(prev =>
                pageNumber === 1 ? newOrders : [...prev, ...newOrders]
            );

            setPage(response.data.current_page);
            setHasMore(response.data.current_page < response.data.last_page);
        } catch (err: any) {
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleOrderPress = (orderId: number) => {
        router.push({
            pathname: '/(order)/order-details',
            params: { id: orderId },
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Orders</Text>
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Orders</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={BrandColors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadOrders(1)}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Orders</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Ionicons name="receipt-outline" size={64} color={BrandColors.mutedText} />
                    <Text style={styles.emptyText}>No orders yet</Text>
                    <Text style={styles.emptySubText}>Your booked services will appear here</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Orders</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const paddingToBottom = 100;

                    if (
                        layoutMeasurement.height + contentOffset.y >=
                        contentSize.height - paddingToBottom
                    ) {
                        if (hasMore && !loadingMore) {
                            loadOrders(page + 1);
                        }
                    }
                }}
                scrollEventThrottle={16}
            >
                {orders.map((order) => (
                    <View
                        key={order.id}
                        style={styles.orderCard}
                    >
                        <View style={styles.orderHeader}>
                            <View style={styles.orderHeaderLeft}>
                                <Text style={styles.serviceName}>{order.cart.name}</Text>
                                <Text style={styles.orderId}>Order #{order.order.order_id}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.order_status.slug)}20` }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(order.order_status.slug) }]}>
                                    {getStatusText(order.order_status.name)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.orderDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons name="calendar-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.detailText}>
                                    {formatDateTime(order.service_date, order.service_time)}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="location-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.detailText} numberOfLines={2}>
                                    {order.order.address.address_line_1}, {order.order.address.address_line_2}, {order.order.address.city} - {order.order.address.pincode}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons name="cube-outline" size={18} color={BrandColors.mutedText} />
                                <Text style={styles.detailText}>
                                    {order.cart.total_service} {order.cart.total_service === 1 ? 'Service' : 'Services'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.orderFooter}>
                            <View>
                                <Text style={styles.amountLabel}>Total Amount</Text>
                                <Text style={styles.amount}>₹{order.total_price || order.price}</Text>
                            </View>

                            <TouchableOpacity style={styles.viewDetailsButton} onPress={() => handleOrderPress(order.id)}>
                                <Text style={styles.viewDetailsText}>View Details</Text>
                                <Ionicons name="chevron-forward" size={16} color={BrandColors.card} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {loadingMore && (
                    <View style={{ paddingVertical: 20 }}>
                        <ActivityIndicator size="small" color={BrandColors.primary} />
                    </View>
                )}
            </ScrollView>
            <CartBar />
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewDetailsText: {
        color: BrandColors.card,
        fontSize: 14,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: BrandColors.mutedText,
    },
    errorText: {
        fontSize: 16,
        color: BrandColors.danger,
        textAlign: 'center',
        marginTop: 8,
    },
    retryButton: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    retryText: {
        color: BrandColors.card,
        fontSize: 16,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: BrandColors.text,
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: BrandColors.mutedText,
        textAlign: 'center',
    },
});
