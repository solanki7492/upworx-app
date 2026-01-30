import { useAuth } from '@/contexts/auth-context';
import { getLedgerItems, initAddMoney, requestWithdrawal } from '@/lib/services/ledger';
import { LedgerItem } from '@/lib/types/ledger';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function LedgerScreen() {
    const insets = useSafeAreaInsets();

    const { user } = useAuth();

    const [ledger, setLedger] = useState<LedgerItem[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [totalBalance, setTotalBalance] = useState(0);

    const [withdrawVisible, setWithdrawVisible] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);

    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [showPaymentWebView, setShowPaymentWebView] = useState(false);
    const [actionType, setActionType] = useState<'add' | 'withdraw'>('withdraw');

    const [showFullTxn, setShowFullTxn] = useState(false);

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

    const handleSubmit = async () => {
        if (!withdrawAmount || Number(withdrawAmount) <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        try {
            setWithdrawing(true);

            if (actionType === 'withdraw') {
                await requestWithdrawal(Number(withdrawAmount));
                Alert.alert('Success', 'Withdrawal request submitted');
                setWithdrawVisible(false);
                loadLedger(1);
            } else {
                const res = await initAddMoney(Number(withdrawAmount));

                setWithdrawVisible(false);
                setPaymentUrl(res.payment_url);
                setShowPaymentWebView(true);
            }

            setWithdrawAmount('');
        } catch (e) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setWithdrawing(false);
        }
    };

    const truncateTxnId = (id: string, start = 6, end = 4) => {
        if (!id) return '-';
        if (id.length <= start + end) return id;
        return `${id.slice(0, start)}…${id.slice(-end)}`;
    };

    const handleTxnPress = () => {
        setShowFullTxn(true);
        setTimeout(() => setShowFullTxn(false), 3000);
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
                            <TouchableOpacity onPress={handleTxnPress} activeOpacity={0.7}>
                                <DetailRow
                                    label="Transaction Id"
                                    value={
                                        item.transaction_id
                                            ? showFullTxn
                                                ? item.transaction_id
                                                : truncateTxnId(item.transaction_id)
                                            : '-'
                                    }
                                />
                            </TouchableOpacity>
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

                    {
                        item.type === 'withdraw_balance' && (
                            <>
                                <Text style={styles.typeTitle}>
                                    Type: Withdrawal from Ledger Balance
                                </Text>

                                <DetailRow
                                    label="Reference No"
                                    value={item.receipt || '-'}
                                />
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
                <ActionButton icon="add-circle-outline" title="Add" onPress={() => {
                    setActionType('add');
                    setWithdrawAmount('');
                    setWithdrawVisible(true);
                }} />

                <View style={{ opacity: (user?.balance ?? 0) > 0 ? 1 : 0.5 }}>
                    <ActionButton
                        icon="remove-circle-outline"
                        title="Withdraw"
                        onPress={(user?.balance ?? 0) > 0 ? () => {
                            setActionType('withdraw');
                            setWithdrawAmount('');
                            setWithdrawVisible(true);
                        } : undefined}
                    />
                </View>

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

            <Modal
                transparent
                animationType="slide"
                visible={withdrawVisible}
                onRequestClose={() => setWithdrawVisible(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalSheet}>
                            <Text style={styles.modalTitle}>
                                {actionType === 'withdraw' ? 'Withdraw Amount' : 'Add Money'}
                            </Text>

                            {/* Amount Field */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Enter Amount</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter amount"
                                    keyboardType="numeric"
                                    value={withdrawAmount}
                                    onChangeText={(text) =>
                                        setWithdrawAmount(text.replace(/[^0-9]/g, ''))
                                    }
                                />
                            </View>

                            {/* Buttons */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setWithdrawVisible(false)}
                                    disabled={withdrawing}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.withdrawBtn,
                                        withdrawing && { opacity: 0.6 },
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={withdrawing}
                                >
                                    {withdrawing ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.withdrawText}>
                                            {actionType === 'withdraw' ? 'Withdraw' : 'Add'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal
                visible={showPaymentWebView}
                animationType="slide"
                statusBarTranslucent={true}
                onRequestClose={() => setShowPaymentWebView(false)}
            >
                <View style={{ flex: 1, paddingTop: insets.top, }}>
                    {/* Header */}
                    <View
                        style={{
                            height: 56,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            borderBottomWidth: 1,
                            borderColor: BrandColors.border,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    'Cancel Payment',
                                    'Are you sure you want to cancel?',
                                    [
                                        { text: 'No' },
                                        {
                                            text: 'Yes',
                                            onPress: () => setShowPaymentWebView(false),
                                        },
                                    ]
                                );
                            }}
                        >
                            <Ionicons name="close" size={24} />
                        </TouchableOpacity>

                        <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: '600' }}>
                            Complete Payment
                        </Text>
                    </View>

                    {/* WebView */}
                    <WebView
                        source={{ uri: paymentUrl! }}
                        startInLoadingState
                        renderLoading={() => (
                            <View style={styles.center}>
                                <ActivityIndicator size="large" color={BrandColors.primary} />
                            </View>
                        )}
                        onShouldStartLoadWithRequest={(req) => {
                            if (req.url.includes('/payment-result')) {
                                setShowPaymentWebView(false);
                                loadLedger(1);
                                return false;
                            }
                            return true;
                        }}
                    />
                </View>
            </Modal>
        </View>
    );
}

const ActionButton = ({ icon, title, onPress }: any) => (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
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
        marginTop: 3,
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
        fontWeight: '600',
        color: BrandColors.text,
    },

    detailValue: {
        fontSize: 13,
        color: BrandColors.mutedText,
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
        fontWeight: '600',
        color: BrandColors.text,
    },

    metaValue: {
        fontSize: 12,
        color: BrandColors.mutedText,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },

    modalSheet: {
        backgroundColor: BrandColors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 20,
    },

    inputContainer: {
        marginBottom: 20,
    },

    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 8,
    },

    input: {
        backgroundColor: BrandColors.card,
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: BrandColors.border,
        fontSize: 16,
        color: BrandColors.text,
    },

    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },

    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
        alignItems: 'center',
    },

    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
    },

    withdrawBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
    },

    withdrawText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});