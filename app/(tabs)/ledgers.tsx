import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '@/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getLedgerItems } from '@/lib/services/ledger';
import { LedgerItem } from '@/lib/types/ledger';

export default function LedgerScreen() {
    const insets = useSafeAreaInsets();

    const [ledger, setLedger] = useState<LedgerItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [totalBalance, setTotalBalance] = useState(0);

    useEffect(() => {
        loadLedger(1);
    }, []);

    const loadLedger = async (pageNumber: number) => {
        if (loadingMore || (!hasMore && pageNumber !== 1)) return;

        try {
            pageNumber === 1 ? setLoading(true) : setLoadingMore(true);

            const res = await getLedgerItems(pageNumber);

            setTotalBalance(res.total_balance);
            setHasMore(res.meta.current_page < res.meta.last_page);

            setLedger((prev) =>
                pageNumber === 1 ? res.data : [...prev, ...res.data]
            );

            setPage(pageNumber);
        } catch {
            Alert.alert('Error', 'Failed to load ledger items');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const formatDateTime = (date: string) => {
        const d = new Date(date);
        return d.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const renderItem = ({ item }: { item: LedgerItem }) => {
        const isDebit = item.nature === '1';

        const statusText =
            item.trans_status === '1'
                ? 'Success'
                : item.trans_status === '2'
                    ? 'Pending'
                    : 'Failed';

        return (
            <View style={styles.card}>
                {/* HEADER (UNCHANGED) */}
                <View style={styles.rowBetween}>
                    <Text style={styles.idText}>#{item.id}</Text>
                    <Text
                        style={[
                            styles.amount,
                            isDebit ? styles.debit : styles.credit,
                        ]}
                    >
                        {isDebit ? '-' : '+'} ₹{item.amount}
                    </Text>
                </View>

                {/* TRANSACTION DETAILS */}
                <View style={styles.section}>
                    {item.type === 'token' && (
                        <>
                            <Text style={styles.typeTitle}>Type: Token Money</Text>

                            <Text style={styles.serviceName}>{item.data?.name}</Text>

                            <DetailRow label="Booking ID" value={item.package_id} />
                            <DetailRow
                                label="Transaction Id"
                                value={item.tr_reference_no || '-'}
                            />
                            <DetailRow
                                label="Transaction Date & Time"
                                value={formatDateTime(item.l_date)}
                            />
                        </>
                    )}

                    {item.type === 'tax' && (
                        <>
                            <Text style={styles.typeTitle}>Type: Deduction</Text>

                            <Text style={styles.serviceName}>{item.data?.name}</Text>

                            <DetailRow label="Booking ID" value={item.package_id} />
                            <DetailRow
                                label="Transaction Id"
                                value={item.tr_reference_no || '-'}
                            />
                            <DetailRow
                                label="Transaction Date & Time"
                                value={formatDateTime(item.l_date)}
                            />
                        </>
                    )}

                    {item.type === 'service' && (
                        <>
                            <Text style={styles.typeTitle}>Type: Total Service Charge</Text>

                            <Text style={styles.serviceName}>{item.data?.name}</Text>

                            <DetailRow label="Booking ID" value={item.package_id} />
                            <DetailRow
                                label="Transaction Id"
                                value={item.tr_reference_no || '-'}
                            />
                            <DetailRow
                                label="Transaction Date & Time"
                                value={formatDateTime(item.l_date)}
                            />
                        </>
                    )}

                    {item.type === 'credit_balance' && (
                        <>
                            <Text style={styles.typeTitle}>
                                Type: Money added to Ledger Balance
                            </Text>

                            <DetailRow
                                label="Transaction Id"
                                value={item.transaction_id || '-'}
                            />
                            <DetailRow
                                label="Reference No"
                                value={item.tr_reference_no || '-'}
                            />
                            <DetailRow
                                label="Transaction Date & Time"
                                value={formatDateTime(item.l_date)}
                            />
                        </>
                    )}
                </View>

                {/* META INFO */}
                <View style={styles.metaSection}>
                    <MetaRow label="Mode" value={item.trans_mode} />
                    <MetaRow label="Status" value={statusText} />
                    <MetaRow
                        label="Nature"
                        value={
                            item.trans_mode === 'Cash'
                                ? '-'
                                : isDebit
                                    ? 'Debit'
                                    : 'Credit'
                        }
                    />
                </View>
            </View>
        );
    };

    const DetailRow = ({ label, value }: any) => (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );

    const MetaRow = ({ label, value }: any) => (
        <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{label}</Text>
            <Text style={styles.metaValue}>{value}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.center, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <Text style={styles.headerTitle}>Ledger</Text>

            <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Balance</Text>
                <Text
                    style={[
                        styles.totalValue,
                        { color: totalBalance >= 0 ? BrandColors.success : BrandColors.danger },
                    ]}
                >
                    ₹ {totalBalance.toFixed(2)}
                </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
                <ActionButton icon="add-circle-outline" title="Add" />
                <ActionButton icon="remove-circle-outline" title="Withdraw" />
                <ActionButton icon="download-outline" title="Statement" />
            </View>

            {/* Ledger List */}
            <FlatList
                data={ledger}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                onEndReached={() => loadLedger(page + 1)}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator
                            style={{ marginVertical: 20 }}
                            color={BrandColors.primary}
                        />
                    ) : null
                }
            />
        </View>
    );
}

const ActionButton = ({ icon, title }: any) => (
    <TouchableOpacity style={styles.actionBtn}>
        <Ionicons name={icon} size={18} color={BrandColors.primary} />
        <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
        paddingHorizontal: 16,
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 16,
    },

    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },

    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
        backgroundColor: BrandColors.card,
    },

    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.primary,
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
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        elevation: 2,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },

    idText: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.mutedText,
    },

    amount: {
        fontSize: 16,
        fontWeight: '700',
    },

    debit: {
        color: BrandColors.danger,
    },

    credit: {
        color: '#2E7D32',
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },

    label: {
        fontSize: 13,
        color: BrandColors.mutedText,
    },

    value: {
        fontSize: 13,
        fontWeight: '600',
        color: BrandColors.text,
    },

    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
    },

    dateText: {
        fontSize: 12,
        color: BrandColors.mutedText,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    section: {
        marginTop: 10,
    },

    typeTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 6,
    },

    serviceName: {
        fontSize: 15,
        fontWeight: '600',
        color: BrandColors.primary,
        marginBottom: 6,
    },

    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },

    detailLabel: {
        fontSize: 13,
        color: BrandColors.mutedText,
    },

    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: BrandColors.text,
        flexShrink: 1,
        textAlign: 'right',
    },

    metaSection: {
        marginTop: 12,
        borderTopWidth: 1,
        borderColor: BrandColors.border,
        paddingTop: 8,
    },

    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },

    metaLabel: {
        fontSize: 12,
        color: BrandColors.mutedText,
    },

    metaValue: {
        fontSize: 12,
        fontWeight: '600',
        color: BrandColors.text,
    },
});