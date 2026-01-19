import { useAuth } from '@/contexts/auth-context';
import { getLeads } from '@/lib/services/leads';
import { Lead } from '@/lib/types/lead';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LeadsScreen() {
    const insets = useSafeAreaInsets();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadLeads(1);
    }, []);

    const loadLeads = async (pageNumber = 1) => {
        if (loadingMore || !hasMore) return;

        try {
            pageNumber === 1 ? setLoading(true) : setLoadingMore(true);
            setError(null);

            const res = await getLeads(pageNumber);

            const newLeads = res.data;
            setHasMore(res.meta.current_page < res.meta.last_page);
            setLeads(pageNumber === 1 ? newLeads : [...leads, ...newLeads]);
        } catch (err: any) {
            setError(err.message || 'Failed to load leads');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await loadLeads(1);
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text style={styles.headerTitle}>Leads</Text>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                </View>
            </View>
        );
    }

    if (!leads.length) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text style={styles.headerTitle}>Leads</Text>
                <View style={styles.center}>
                    <Ionicons name="briefcase-outline" size={64} color={BrandColors.mutedText} />
                    <Text style={styles.empty}>No leads available</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text style={styles.headerTitle}>Leads</Text>
                <View style={styles.center}>
                    <Text style={{ color: BrandColors.danger, fontSize: 16 }}>{error}</Text>
                    <TouchableOpacity
                        onPress={() => loadLeads(1)}
                        style={{
                            marginTop: 16,
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            backgroundColor: BrandColors.primary,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text style={styles.headerTitle}>Leads</Text>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[BrandColors.primary]}
                        tintColor={BrandColors.primary}
                    />
                }
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const paddingToBottom = 100;

                    if (
                        layoutMeasurement.height + contentOffset.y >=
                        contentSize.height - paddingToBottom
                    ) {
                        if (hasMore && !loadingMore) {
                            loadLeads(page + 1);
                        }
                    }
                }}
                scrollEventThrottle={16}
            >
                {leads.map((lead) => {
                    const status = lead.order_status.slug;
                    const address = lead.order.address_data;
                    const isAssignedToMe = lead.assign_partner_id === user?.id;

                    return (
                        <View key={lead.id} style={styles.card}>

                            {/* Header */}
                            <View style={styles.headerRow}>
                                <Text style={styles.serviceName}>{lead.data.name}</Text>

                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {lead.order_status.partner_msg}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Date & Time */}
                            <View style={styles.row}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={18}
                                    color={BrandColors.mutedText}
                                />
                                <Text style={styles.text}>
                                    {lead.service_date} at {lead.service_time}
                                </Text>
                            </View>

                            {/* Address Block */}
                            <View style={styles.detailBlock}>
                                {/* Service Date & Time */}
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="time-outline"
                                        size={18}
                                        color={BrandColors.primary}
                                    />
                                    <Text style={styles.label}>Service Date & Time</Text>
                                </View>

                                <Text style={styles.value}>
                                    {lead.service_date}, {lead.service_time}
                                </Text>

                                {/* Service Address */}
                                <View style={[styles.infoRow, { marginTop: 10 }]}>
                                    <Ionicons
                                        name="location-outline"
                                        size={18}
                                        color={BrandColors.primary}
                                    />
                                    <Text style={styles.label}>Service Address</Text>
                                </View>

                                {status === 'new-booking' || (!isAssignedToMe && status !== 'completed') ? (
                                    <Text style={styles.value}>{address.city}</Text>
                                ) : (
                                    <>
                                        <Text style={styles.value}>
                                            {address.address_line_1 ? address.address_line_1 + ', ' : ''}
                                            {address.address_line_2 ? address.address_line_2 + ', ' : ''}
                                            {address.city} {address.state}, Pincode-{address.pincode}
                                        </Text>

                                        <View style={styles.contactBox}>
                                            <View style={styles.contactRow}>
                                                <Ionicons name="person-outline" size={18} color={BrandColors.primary} />
                                                <Text style={styles.contactText}>{address.name}</Text>
                                            </View>

                                            <View style={styles.contactRow}>
                                                <Ionicons name="call-outline" size={18} color={BrandColors.primary} />
                                                <Text style={styles.contactText}>{address.mobile_number}</Text>
                                            </View>
                                        </View>
                                    </>
                                )}

                            </View>

                            {/* Services Count */}
                            <View style={styles.row}>
                                <Ionicons
                                    name="layers-outline"
                                    size={18}
                                    color={BrandColors.mutedText}
                                />
                                <Text style={styles.text}>
                                    {lead.data.total_service} Service(s)
                                </Text>
                            </View>

                            {/* Footer */}
                            <View style={styles.footer}>
                                <Text style={styles.amount}>₹{lead.price}</Text>

                                <TouchableOpacity
                                    style={styles.acceptBtn}
                                    onPress={() => router.push({
                                        pathname: '/(lead)/lead-details',
                                        params: { id: lead.id }
                                    })}
                                >
                                    <Text style={styles.acceptText}>View Lead</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>

                        </View>
                    );
                })}
                {loadingMore && (
                    <View style={{ paddingVertical: 20 }}>
                        <ActivityIndicator size="small" color={BrandColors.primary} />
                    </View>
                )}
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
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 16,
        color: BrandColors.text,
    },
    card: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
    },
    badge: {
        backgroundColor: `${BrandColors.primary}20`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        color: BrandColors.primary,
        fontWeight: '600',
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: BrandColors.border,
        marginVertical: 12,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginBottom: 8,
    },
    detailBlock: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        color: BrandColors.mutedText,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
    },
    contactBox: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderColor: BrandColors.border,
        gap: 6,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contactText: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
    },
    text: {
        fontSize: 14,
        color: BrandColors.text,
        flex: 1,
    },
    footer: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.primary,
    },
    acceptBtn: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    acceptText: {
        color: '#fff',
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        marginTop: 16,
        fontSize: 16,
        color: BrandColors.mutedText,
    },
});

