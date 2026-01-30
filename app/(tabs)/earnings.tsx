import { BrandColors } from '@/theme/colors';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getEarnings } from '../../lib/services/earning';
import { EarningData } from '../../lib/types/earning';
import { useDebounce } from '@/lib/hooks/useDebounce';

export default function EarningsScreen() {
    const insets = useSafeAreaInsets();

    const [earnings, setEarnings] = useState<EarningData[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 500);
    const [searchLoading, setSearchLoading] = useState(false);
    const [totalEarnings, setTotalEarnings] = useState(0);

    useEffect(() => {
        setHasMore(true);
        setSearchLoading(true);
        loadEarnings(1, true);
    }, [debouncedSearch]);

    const loadEarnings = async (pageNo = 1, isRefresh = false) => {
        if (loadingMore || (!hasMore && !isRefresh)) return;

        try {
            if (pageNo === 1) {
                isRefresh ? setSearchLoading(true) : setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const res = await getEarnings(pageNo, debouncedSearch);
            const newData = res.data;
            setTotalEarnings(res.total_earning);

            setHasMore(res.meta.current_page < res.meta.last_page);
            setPage(res.meta.current_page);

            setEarnings(prev =>
                pageNo === 1 ? newData : [...prev, ...newData]
            );
        } finally {
            setLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
            setSearchLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setHasMore(true);
        loadEarnings(1, true);
    };

    if (loading) {
        return (
            <View style={[styles.center, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text style={styles.headerTitle}>Earnings</Text>

            {/* TOTAL */}
            <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Earnings</Text>
                <Text
                    style={[
                        styles.totalValue,
                        { color: totalEarnings >= 0 ? BrandColors.success : BrandColors.danger },
                    ]}
                >
                    ₹ {totalEarnings.toFixed(2)}
                </Text>
            </View>

            <View style={styles.searchBox}>
                <TextInput
                    placeholder="Search by Booking ID"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchInput}
                    placeholderTextColor={BrandColors.mutedText}
                />

                {searchLoading && (
                    <ActivityIndicator size="small" color={BrandColors.primary} />
                )}
            </View>

            {/* LIST */}
            <FlatList
                data={earnings}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
                onEndReached={() => {
                    if (hasMore && !loadingMore) {
                        loadEarnings(page + 1);
                    }
                }}
                onEndReachedThreshold={0.3}
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator
                            style={{ marginVertical: 16 }}
                            color={BrandColors.primary}
                        />
                    ) : null
                }
                renderItem={({ item, index }) => (
                    <EarningCard
                        item={item}
                        index={index}
                        earnings={earnings}
                    />
                )}
            />
        </View>
    );
}

function EarningCard({
    item,
    index,
    earnings,
}: {
    item: EarningData;
    index: number;
    earnings: EarningData[];
}) {
    let runningTotal = 0;

    for (let i = 0; i <= index; i++) {
        const lead = earnings[i];

        const row =
            (lead.total_price_after ?? 0)
            - (lead.deduction ?? 0)
            - Number(lead.token ?? 0);

        runningTotal += row;

        if (lead.refund_id) {
            const refund =
                (lead.refund_deduction ?? 0)
                + (lead.refund_token ?? 0)
                - (lead.refund_amount ?? 0);

            runningTotal += refund;
        }
    }

    const rowEarning =
        (item.total_price_after ?? 0)
        - (item.deduction ?? 0)
        - Number(item.token ?? 0);

    return (
        <View style={styles.card}>
            <Text style={styles.serviceName}>{item.data.name}</Text>
            <Text style={styles.subText}>
                Booking ID: {item.package_id} • {item.service_date}
            </Text>

            <Row label="Token Money" value={-Number(item.token)} />
            <Row label="Total Service Charge" value={item.total_price_after ?? 0} />
            <Row label="Deduction" value={-item.deduction} />

            <Divider />

            <Row label="Earning" value={rowEarning} bold />
            {/* <Divider />
            <Row label="Total" value={runningTotal} bold /> */}

            {/* REFUND */}
            {item.refund_id && (
                <>
                    <Divider />
                    <Text style={styles.refundLabel}>Refund</Text>

                    <Row label="Refund Token" value={item.refund_token ?? 0} />
                    <Row label="Refund Amount" value={-item.refund_amount!} />
                    <Row label="Refund Deduction" value={item.refund_deduction ?? 0} />

                    <Row
                        label="Refund Earning"
                        value={
                            (item.refund_deduction ?? 0)
                            + (item.refund_token ?? 0)
                            - (item.refund_amount ?? 0)
                        }
                        bold
                    />
                </>
            )}
        </View>
    );
}

function Row({
    label,
    value,
    bold = false,
}: {
    label: string;
    value?: number;
    bold?: boolean;
}) {
    const v = value ?? 0;
    const isPositive = v >= 0;

    return (
        <View style={styles.row}>
            <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
            <Text
                style={[
                    styles.rowValue,
                    bold && styles.bold,
                    { color: isPositive ? BrandColors.success : BrandColors.danger },
                ]}
            >
                {isPositive ? '+' : '-'} ₹{Math.abs(v).toFixed(2)}
            </Text>
        </View>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
        paddingHorizontal: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 16,
        color: BrandColors.text,
    },
    totalBox: {
        backgroundColor: BrandColors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
    totalValue: {
        fontSize: 26,
        fontWeight: '700',
        marginTop: 6,
    },
    card: {
        backgroundColor: BrandColors.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.text,
    },
    subText: {
        fontSize: 13,
        color: BrandColors.mutedText,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2,
    },
    rowLabel: {
        fontSize: 14,
        color: BrandColors.text,
    },
    rowValue: {
        fontSize: 14,
    },
    bold: {
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: BrandColors.border,
        marginVertical: 10,
    },
    refundLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 6,
        color: BrandColors.text,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BrandColors.card,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: BrandColors.text,
    },
});