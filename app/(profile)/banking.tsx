import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors } from '@/theme/colors';
import {
    getBankAccounts,
    addBankAccount,
    makeDefaultBankAccount
} from '@/lib/services/banking';
import { BankAccount } from '@/lib/types/banking';
import { useRouter } from 'expo-router';

export default function BankDetailsScreen() {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [addVisible, setAddVisible] = useState(false);
    const router = useRouter();

    const [form, setForm] = useState({
        bank_name: '',
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
    });

    useEffect(() => {
        loadBanks();
    }, []);

    const loadBanks = async () => {
        try {
            setLoading(true);
            const res = await getBankAccounts();
            setBanks(res.data || []);
        } catch {
            Alert.alert('Error', 'Failed to load bank details');
        } finally {
            setLoading(false);
        }
    };

    const submitBank = async () => {
        if (form.bank_name.trim() === '') {
            Alert.alert('Error', 'Bank name field is required');
            return;
        }

        if (form.account_holder_name.trim() === '') {
            Alert.alert('Error', 'Account holder name field is required');
            return;
        }

        if (form.account_number.trim() === '') {
            Alert.alert('Error', 'Account number field is required');
            return;
        }

        if (form.ifsc_code.trim() === '') {
            Alert.alert('Error', 'IFSC code field is required');
            return;
        }

        try {
            await addBankAccount(form);
            Alert.alert('Success', 'Bank request submitted');
            setAddVisible(false);
            setForm({
                bank_name: '',
                account_holder_name: '',
                account_number: '',
                ifsc_code: '',
            });
            loadBanks();
        } catch {
            Alert.alert('Error', 'Failed to add bank');
        }
    };

    const makeDefault = async (id: number) => {
        await makeDefaultBankAccount(id);
        loadBanks();
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
            {/* HEADER */}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Banks Details</Text>
                <TouchableOpacity onPress={() => setAddVisible(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={BrandColors.primary} />
                </TouchableOpacity>
            </View>

            {!banks.length ? (
                <View style={styles.center}>
                    <Ionicons name="card-outline" size={64} color={BrandColors.mutedText} />
                    <Text style={styles.emptyText}>No bank accounts added</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {banks.map((item, index) => (
                        <View key={item.id} style={styles.card}>
                            {/* Header */}
                            <View style={styles.cardHeader}>
                                <Text style={styles.sn}>#{index + 1}</Text>

                                <View
                                    style={[
                                        styles.statusBadge,
                                        item.status === 'approved'
                                            ? styles.approved
                                            : styles.pending,
                                    ]}
                                >
                                    <Text style={styles.statusText}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.bankName}>{item.bank_name}</Text>
                            <Text style={styles.subText}>
                                {item.account_holder_name}
                            </Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>A/C</Text>
                                <Text style={styles.detailValue}>
                                    ****{item.account_number.slice(-4)}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>IFSC</Text>
                                <Text style={styles.detailValue}>
                                    {item.ifsc_code}
                                </Text>
                            </View>

                            <View style={styles.footer}>
                                <Text style={styles.dateText}>
                                    Requested: {item.created_at}
                                </Text>

                                {item.is_default ? (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultText}>DEFAULT</Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                    onPress={() => makeDefault(item?.id)}
                                    >
                                        <Text style={styles.makeDefault}>
                                            Make Default
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* ADD BANK MODAL */}
            <Modal transparent animationType="slide" visible={addVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>

                        <Text style={styles.modalTitle}>Add Bank Account</Text>

                        {/* Bank Name */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Bank Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter bank name"
                                value={form.bank_name}
                                onChangeText={(t) =>
                                    setForm({ ...form, bank_name: t })
                                }
                            />
                        </View>

                        {/* Account Holder Name */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Account Holder Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter account holder name"
                                value={form.account_holder_name}
                                onChangeText={(t) =>
                                    setForm({ ...form, account_holder_name: t })
                                }
                            />
                        </View>

                        {/* Account Number */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Account Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter account number"
                                keyboardType="number-pad"
                                value={form.account_number}
                                onChangeText={(t) =>
                                    setForm({ ...form, account_number: t })
                                }
                            />
                        </View>

                        {/* IFSC Code */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>IFSC Code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter IFSC code"
                                autoCapitalize="characters"
                                value={form.ifsc_code}
                                onChangeText={(t) =>
                                    setForm({ ...form, ifsc_code: t })
                                }
                            />
                        </View>

                        {/* Actions */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.cancelBtn]}
                                onPress={() => setAddVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtn, styles.submitBtn]}
                                onPress={submitBank}
                            >
                                <Text style={styles.submitBtnText}>Submit</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
        paddingHorizontal: 16,
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
    addButton: {
        padding: 4,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },

    emptyText: {
        marginTop: 12,
        color: BrandColors.mutedText,
        fontSize: 16,
    },

    card: {
        backgroundColor: BrandColors.card,
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },

    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },

    sn: {
        fontSize: 14,
        color: BrandColors.mutedText,
        fontWeight: '600',
    },

    bankName: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
    },

    subText: {
        fontSize: 14,
        color: BrandColors.mutedText,
        marginBottom: 8,
    },

    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },

    detailLabel: {
        fontSize: 13,
        color: BrandColors.mutedText,
    },

    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: BrandColors.text,
    },

    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    approved: { backgroundColor: '#E8F5E9' },
    pending: { backgroundColor: '#FFF3E0' },

    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },

    footer: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    makeDefault: {
        color: BrandColors.primary,
        fontWeight: '600',
    },

    defaultBadge: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },

    defaultText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },

    dateText: {
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
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },

    input: {
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        backgroundColor: BrandColors.card,
    },

    saveBtn: {
        backgroundColor: BrandColors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },

    saveText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },

    cancelText: {
        textAlign: 'center',
        marginTop: 12,
        color: BrandColors.mutedText,
    },

    fieldGroup: {
        marginBottom: 14,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 6,
    },

    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },

    actionBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cancelBtn: {
        backgroundColor: BrandColors.card,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },

    submitBtn: {
        backgroundColor: BrandColors.primary,
    },

    cancelBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
    },

    submitBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },


});
