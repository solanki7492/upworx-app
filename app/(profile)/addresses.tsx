import { createAddress, deleteAddress, getAddresses, updateAddress } from '@/lib';
import { Address, CreateAddressRequest } from '@/lib/types/address';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AddressType = 'home' | 'work' | 'other';

export default function AddressesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobile_number: '',
        pincode: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        address_type: 'home' as AddressType,
        latitude: '',
        longitude: '',
    });
    const [pincodeLoading, setPincodeLoading] = useState(false);

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

    const validatePincode = async (pincode: string) => {
        if (pincode.length !== 6) return;

        try {
            setPincodeLoading(true);
            // Using Google Geocoding API
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?components=country:IN|postal_code:${pincode}&key=AIzaSyAt2K0xeZNSSH7zRdJ4YmkrOJcXMPV2Hlk`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const location = result.geometry.location;
                let city = '';
                let state = '';

                // Extract city and state from address components
                result.address_components.forEach((component: any) => {
                    if (component.types.includes('locality')) {
                        city = component.long_name;
                    }
                    if (component.types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    }
                });

                setFormData((prev) => ({
                    ...prev,
                    city,
                    state,
                    latitude: location.lat.toString(),
                    longitude: location.lng.toString(),
                }));
            } else {
                Alert.alert('Invalid Pincode', 'Please enter a valid Indian pincode');
                setFormData((prev) => ({
                    ...prev,
                    city: '',
                    state: '',
                    latitude: '',
                    longitude: '',
                }));
            }
        } catch (error) {
            // For now, use mock data for demonstration
            // In production, replace with actual Google API key
            const mockGeoData: { [key: string]: any } = {
                '243122': {
                    city: 'Bareilly Division',
                    state: 'Uttar Pradesh',
                    lat: 28.3670355,
                    lng: 79.4304381,
                },
                '110001': {
                    city: 'New Delhi',
                    state: 'Delhi',
                    lat: 28.6139,
                    lng: 77.209,
                },
            };

            if (mockGeoData[pincode]) {
                setFormData((prev) => ({
                    ...prev,
                    city: mockGeoData[pincode].city,
                    state: mockGeoData[pincode].state,
                    latitude: mockGeoData[pincode].lat.toString(),
                    longitude: mockGeoData[pincode].lng.toString(),
                }));
            } else {
                Alert.alert('Invalid Pincode', 'Please enter a valid Indian pincode');
            }
        } finally {
            setPincodeLoading(false);
        }
    };

    const handlePincodeChange = (text: string) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setFormData((prev) => ({ ...prev, pincode: numericText }));

        if (numericText.length === 6) {
            validatePincode(numericText);
        } else {
            setFormData((prev) => ({
                ...prev,
                city: '',
                state: '',
                latitude: '',
                longitude: '',
            }));
        }
    };

    const openAddModal = () => {
        setEditingAddress(null);
        setFormData({
            name: '',
            mobile_number: '',
            pincode: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            address_type: 'home',
            latitude: '',
            longitude: '',
        });
        setModalVisible(true);
    };

    const openEditModal = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            name: address.name,
            mobile_number: address.mobile_number,
            pincode: address.pincode,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2,
            city: address.city,
            state: address.state,
            address_type: address.address_type,
            latitude: address.latitude.toString(),
            longitude: address.longitude.toString(),
        });
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.name.trim()) {
            Alert.alert('Validation Error', 'Please enter your name');
            return;
        }
        if (!formData.mobile_number.trim() || formData.mobile_number.length !== 10) {
            Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number');
            return;
        }
        if (!formData.pincode.trim() || formData.pincode.length !== 6) {
            Alert.alert('Validation Error', 'Please enter a valid 6-digit pincode');
            return;
        }
        if (!formData.address_line_1.trim()) {
            Alert.alert('Validation Error', 'Please enter address line 1');
            return;
        }
        if (!formData.city || !formData.state) {
            Alert.alert('Validation Error', 'Invalid pincode. City and State could not be determined');
            return;
        }

        try {
            setSubmitting(true);
            const requestData: CreateAddressRequest = {
                name: formData.name,
                mobile_number: formData.mobile_number,
                pincode: formData.pincode,
                address_line_1: formData.address_line_1,
                address_line_2: formData.address_line_2,
                city: formData.city,
                state: formData.state,
                latitude: formData.latitude,
                longitude: formData.longitude,
                address_type: formData.address_type,
            };

            if (editingAddress) {
                await updateAddress(editingAddress.id, requestData);
                Alert.alert('Success', 'Address updated successfully');
            } else {
                await createAddress(requestData);
                Alert.alert('Success', 'Address added successfully');
            }

            setModalVisible(false);
            fetchAddresses();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save address');
        } finally {
            setSubmitting(false);
        }
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

    const getAddressTypeIcon = (type: AddressType) => {
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
                                        {address.address_type.charAt(0).toUpperCase() + address.address_type.slice(1)}
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
                        <Text style={styles.modalTitle}>{editingAddress ? 'Edit Address' : 'Add Address'}</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.modalContent}>
                        {/* Name */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                                placeholder="Enter your full name"
                                placeholderTextColor={BrandColors.mutedText}
                            />
                        </View>

                        {/* Mobile Number */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Mobile Number *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.mobile_number}
                                onChangeText={(text) =>
                                    setFormData((prev) => ({ ...prev, mobile_number: text.replace(/[^0-9]/g, '') }))
                                }
                                placeholder="Enter 10-digit mobile number"
                                placeholderTextColor={BrandColors.mutedText}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>

                        {/* Pincode */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Pincode *</Text>
                            <View style={styles.pincodeContainer}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={formData.pincode}
                                    onChangeText={handlePincodeChange}
                                    placeholder="Enter 6-digit pincode"
                                    placeholderTextColor={BrandColors.mutedText}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                {pincodeLoading && <ActivityIndicator size="small" color={BrandColors.primary} />}
                            </View>
                        </View>

                        {/* Address Line 1 */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Flat, House no. *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.address_line_1}
                                onChangeText={(text) => setFormData((prev) => ({ ...prev, address_line_1: text }))}
                                placeholder="House No., Building Name"
                                placeholderTextColor={BrandColors.mutedText}
                            />
                        </View>

                        {/* Address Line 2 */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Road name, Area, Colony</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.address_line_2}
                                onChangeText={(text) => setFormData((prev) => ({ ...prev, address_line_2: text }))}
                                placeholder="Road Name, Area, Colony"
                                placeholderTextColor={BrandColors.mutedText}
                            />
                        </View>

                        {/* City (auto-filled) */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>City/District/Town</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={formData.city}
                                editable={false}
                                placeholder="Auto-filled from pincode"
                                placeholderTextColor={BrandColors.mutedText}
                            />
                        </View>

                        {/* State (auto-filled) */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>State</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={formData.state}
                                editable={false}
                                placeholder="Auto-filled from pincode"
                                placeholderTextColor={BrandColors.mutedText}
                            />
                        </View>

                        {/* Address Type */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Address Type</Text>
                            <View style={styles.addressTypeButtons}>
                                {(['home', 'work', 'other'] as AddressType[]).map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeButton,
                                            formData.address_type === type && styles.typeButtonActive,
                                        ]}
                                        onPress={() => setFormData((prev) => ({ ...prev, address_type: type }))}
                                    >
                                        <Ionicons
                                            name={getAddressTypeIcon(type) as any}
                                            size={18}
                                            color={
                                                formData.address_type === type ? BrandColors.card : BrandColors.primary
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.typeButtonText,
                                                formData.address_type === type && styles.typeButtonTextActive,
                                            ]}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color={BrandColors.card} />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {editingAddress ? 'Update Address' : 'Add Address'}
                                </Text>
                            )}
                        </TouchableOpacity>
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
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
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
});
