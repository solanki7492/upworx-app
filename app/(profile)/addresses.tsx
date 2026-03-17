import AddressFormModal from '@/components/address-form-modal';
import { useAuth } from '@/contexts/auth-context';
import { deleteAddress, getAddresses } from '@/lib';
import { Address } from '@/lib/types/address';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddressesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const data = await getAddresses();
            setAddresses(data);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to fetch addresses');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAddresses();
        setRefreshing(false);
    }, []);

    const openAddModal = () => {
        setEditingAddress(null);
        setModalVisible(true);
    };

    const openEditModal = (address: Address) => {
        setEditingAddress(address);
        setModalVisible(true);
    };

    const handleAddressSuccess = async () => {
        await fetchAddresses();
    };

    const handleDelete = (address: Address) => {
        Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteAddress(address.id);
                        Alert.alert('Success', 'Address deleted successfully');
                        fetchAddresses();
                    } catch (error: any) {
                        Alert.alert('Error', error.message || 'Failed to delete address');
                    }
                },
            },
        ]);
    };

    const getAddressTypeIcon = (type: 'home' | 'work' | 'other') => {
        switch (type) {
            case 'home':
                return 'home';
            case 'work':
                return 'briefcase';
            default:
                return 'location';
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Addresses</Text>
                <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={BrandColors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                </View>
            ) : addresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="location-outline" size={64} color={BrandColors.mutedText} />
                    <Text style={styles.emptyText}>No addresses yet</Text>
                    <Text style={styles.emptySubtext}>Add your first address to get started</Text>
                    <TouchableOpacity style={styles.addFirstButton} onPress={openAddModal}>
                        <Text style={styles.addFirstButtonText}>Add Address</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={styles.listContainer}
                >
                    {addresses.map((address) => (
                        <View key={address.id} style={styles.addressCard}>
                            <View style={styles.addressHeader}>

                                <View style={styles.addressTypeContainer}>
                                    <Ionicons
                                        name={getAddressTypeIcon(address.address_type) as any}
                                        size={20}
                                        color={BrandColors.primary}
                                    />
                                    <Text style={styles.addressType}>
                                        {address.address_for === "partner" ? address?.range_area + " km" : address.address_type.charAt(0).toUpperCase() + address.address_type.slice(1)}
                                    </Text>
                                </View>

                                <View style={styles.addressActions}>
                                    <TouchableOpacity
                                        onPress={() => openEditModal(address)}
                                        style={styles.actionButton}
                                    >
                                        <Ionicons name="create-outline" size={20} color={BrandColors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(address)}
                                        style={styles.actionButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color={BrandColors.danger} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.addressName}>{address.name}</Text>
                            <Text style={styles.addressText}>
                                {address.address_line_1}
                                {address.address_line_2 ? `, ${address.address_line_2}` : ''}
                            </Text>
                            <Text style={styles.addressText}>
                                {address.city}, {address.state} - {address.pincode}
                            </Text>
                            <Text style={styles.addressPhone}>+91 {address.mobile_number}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Add/Edit Address Modal */}
            <AddressFormModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={handleAddressSuccess}
                editingAddress={editingAddress}
                userRole={user?.role as 'CUSTOMER' | 'PARTNER'}
            />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    addressCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    addressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: `${BrandColors.primary}15`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    addressType: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.primary,
    },
    addressActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
    addressName: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 8,
    },
    addressText: {
        fontSize: 14,
        color: BrandColors.text,
        marginBottom: 4,
        lineHeight: 20,
    },
    addressPhone: {
        fontSize: 14,
        color: BrandColors.mutedText,
        marginTop: 4,
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
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: BrandColors.text,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    disabledInput: {
        backgroundColor: BrandColors.border,
        color: BrandColors.mutedText,
    },
    pincodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addressTypeButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 14,
        borderWidth: 2,
        borderColor: BrandColors.primary,
    },
    typeButtonActive: {
        backgroundColor: BrandColors.primary,
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.primary,
    },
    typeButtonTextActive: {
        color: BrandColors.card,
    },
    submitButton: {
        backgroundColor: BrandColors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: BrandColors.card,
        fontSize: 16,
        fontWeight: '700',
    },
    switchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    suggestionsBox: {
        position: 'absolute',
        top: 72,
        left: 0,
        right: 0,
        backgroundColor: BrandColors.card,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 10,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    suggestionText: {
        color: BrandColors.text,
        fontSize: 14,
    },
});
