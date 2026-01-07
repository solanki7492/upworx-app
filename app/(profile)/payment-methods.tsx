import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PaymentMethod {
    id: string;
    type: 'card' | 'upi';
    name: string;
    details: string;
    isDefault: boolean;
}

const mockPaymentMethods: PaymentMethod[] = [
    {
        id: '1',
        type: 'card',
        name: 'HDFC Credit Card',
        details: '**** **** **** 1234',
        isDefault: true,
    },
    {
        id: '2',
        type: 'upi',
        name: 'Google Pay',
        details: 'user@oksbi',
        isDefault: false,
    },
    {
        id: '3',
        type: 'card',
        name: 'ICICI Debit Card',
        details: '**** **** **** 5678',
        isDefault: false,
    },
];

export default function PaymentMethodsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
    const [modalVisible, setModalVisible] = useState(false);

    const handleDelete = (method: PaymentMethod) => {
        Alert.alert('Delete Payment Method', 'Are you sure you want to delete this payment method?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    setPaymentMethods((prev) => prev.filter((m) => m.id !== method.id));
                    Alert.alert('Success', 'Payment method deleted successfully');
                },
            },
        ]);
    };

    const handleSetDefault = (method: PaymentMethod) => {
        setPaymentMethods((prev) =>
            prev.map((m) => ({
                ...m,
                isDefault: m.id === method.id,
            }))
        );
        Alert.alert('Success', 'Default payment method updated');
    };

    const getPaymentIcon = (type: 'card' | 'upi') => {
        return type === 'card' ? 'card' : 'wallet';
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Methods</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={BrandColors.primary} />
                </TouchableOpacity>
            </View>

            {paymentMethods.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="wallet-outline" size={64} color={BrandColors.mutedText} />
                    <Text style={styles.emptyText}>No payment methods yet</Text>
                    <Text style={styles.emptySubtext}>Add your first payment method to get started</Text>
                    <TouchableOpacity style={styles.addFirstButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.addFirstButtonText}>Add Payment Method</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
                    {paymentMethods.map((method) => (
                        <View key={method.id} style={styles.paymentCard}>
                            <View style={styles.paymentHeader}>
                                <View style={styles.paymentInfo}>
                                    <View style={styles.paymentIconContainer}>
                                        <Ionicons
                                            name={getPaymentIcon(method.type) as any}
                                            size={24}
                                            color={BrandColors.primary}
                                        />
                                    </View>
                                    <View style={styles.paymentDetails}>
                                        <Text style={styles.paymentName}>{method.name}</Text>
                                        <Text style={styles.paymentDetailsText}>{method.details}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(method)} style={styles.deleteButton}>
                                    <Ionicons name="trash-outline" size={20} color={BrandColors.danger} />
                                </TouchableOpacity>
                            </View>

                            {method.isDefault ? (
                                <View style={styles.defaultBadge}>
                                    <Ionicons name="checkmark-circle" size={16} color={BrandColors.success} />
                                    <Text style={styles.defaultText}>Default</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.setDefaultButton}
                                    onPress={() => handleSetDefault(method)}
                                >
                                    <Text style={styles.setDefaultText}>Set as Default</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Add Payment Method Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color={BrandColors.text} />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add Payment Method</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.comingSoonText}>
                            Payment method addition coming soon. This is a demo version.
                        </Text>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: BrandColors.text,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: BrandColors.mutedText,
        marginTop: 8,
        textAlign: 'center',
    },
    addFirstButton: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 30,
        marginTop: 24,
    },
    addFirstButtonText: {
        color: BrandColors.card,
        fontSize: 16,
        fontWeight: '700',
    },
    listContainer: {
        padding: 16,
    },
    paymentCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    paymentIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: `${BrandColors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    paymentDetails: {
        flex: 1,
    },
    paymentName: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 4,
    },
    paymentDetailsText: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
    deleteButton: {
        padding: 8,
    },
    defaultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        backgroundColor: `${BrandColors.success}15`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    defaultText: {
        fontSize: 12,
        fontWeight: '600',
        color: BrandColors.success,
    },
    setDefaultButton: {
        alignSelf: 'flex-start',
        backgroundColor: `${BrandColors.primary}15`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    setDefaultText: {
        fontSize: 12,
        fontWeight: '600',
        color: BrandColors.primary,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: BrandColors.background,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    comingSoonText: {
        fontSize: 16,
        color: BrandColors.mutedText,
        textAlign: 'center',
        marginTop: 40,
    },
});
