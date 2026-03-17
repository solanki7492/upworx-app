import { createAddress, updateAddress } from '@/lib/services/address';
import type { Address, CreateAddressRequest } from '@/lib/types/address';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AddressType = 'home' | 'work' | 'other';

interface AddressFormModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (address?: any) => void;
    editingAddress?: Address | null;
    userRole?: 'CUSTOMER' | 'PARTNER';
}

export default function AddressFormModal({
    visible,
    onClose,
    onSuccess,
    editingAddress = null,
    userRole = 'CUSTOMER',
}: AddressFormModalProps) {
    const insets = useSafeAreaInsets();
    const [submitting, setSubmitting] = useState(false);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [addressQuery, setAddressQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        name: editingAddress?.name || '',
        mobile_number: editingAddress?.mobile_number || '',
        pincode: editingAddress?.pincode || '',
        address_line_1: editingAddress?.address_line_1 || '',
        address_line_2: editingAddress?.address_line_2 || '',
        city: editingAddress?.city || '',
        state: editingAddress?.state || '',
        default_address: editingAddress?.default_address ?? 0,
        address_type: (editingAddress?.address_type || 'home') as AddressType,
        range_area: editingAddress?.range_area?.toString() || '',
        latitude: editingAddress?.latitude?.toString() || '',
        longitude: editingAddress?.longitude?.toString() || '',
    });

    // Initialize addressQuery with existing address
    useState(() => {
        if (editingAddress?.address_line_2) {
            setAddressQuery(editingAddress.address_line_2);
        }
    });

    // Validate Pincode
    const validatePincode = async (pincode: string) => {
        if (pincode.length !== 6) return;

        try {
            setPincodeLoading(true);
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?components=country:IN|postal_code:${pincode}&key=AIzaSyAt2K0xeZNSSH7zRdJ4YmkrOJcXMPV2Hlk`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const result = data.results[0];
                const location = result.geometry.location;
                let city = '';
                let state = '';

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
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to validate pincode');
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

    // Address Autocomplete
    const handleAddressChange = async (text: string) => {
        setAddressQuery(text);
        setFormData((prev) => ({ ...prev, address_line_2: text }));

        if (text.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&components=country:in&key=AIzaSyAt2K0xeZNSSH7zRdJ4YmkrOJcXMPV2Hlk`
            );
            const json = await res.json();

            if (json.predictions) {
                setSuggestions(json.predictions);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
        }
    };

    const selectAddressSuggestion = async (item: any) => {
        setAddressQuery(item.description);
        setShowSuggestions(false);

        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=AIzaSyAt2K0xeZNSSH7zRdJ4YmkrOJcXMPV2Hlk`
            );
            const json = await res.json();
            const result = json.result;

            let city = '';
            let state = '';

            const excludedTypes = ['administrative_area_level_1', 'country', 'postal_code'];
            const addressLine2 = result.address_components
                .filter((component: any) =>
                    !component.types.some((type: string) => excludedTypes.includes(type))
                )
                .map((component: any) => component.long_name)
                .join(', ');

            result.address_components.forEach((component: any) => {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                }
            });

            setAddressQuery(addressLine2);
            setFormData((prev) => ({
                ...prev,
                address_line_2: addressLine2,
                city,
                state,
                latitude: result.geometry.location.lat.toString(),
                longitude: result.geometry.location.lng.toString(),
            }));
        } catch (error) {
            console.error('Error fetching place details:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            mobile_number: '',
            pincode: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            default_address: 0,
            address_type: 'home',
            range_area: '',
            latitude: '',
            longitude: '',
        });
        setAddressQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const buildPayload = () => {
        const basePayload = {
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

        if (userRole === 'CUSTOMER') {
            return {
                ...basePayload,
                default_address: formData.default_address,
            };
        }

        if (userRole === 'PARTNER') {
            return {
                ...basePayload,
                range_area: formData.range_area,
            };
        }

        return basePayload;
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
        if (!formData.address_line_2.trim()) {
            Alert.alert('Validation Error', 'Please enter Road name/Area/Colony');
            return;
        }
        if (!formData.city || !formData.state) {
            Alert.alert('Validation Error', 'Invalid pincode. City and State could not be determined');
            return;
        }
        if (userRole === 'PARTNER' && !formData.range_area.trim()) {
            Alert.alert('Validation Error', 'Please enter service range area');
            return;
        }

        try {
            setSubmitting(true);
            const payload = buildPayload();
            const requestData: CreateAddressRequest = { ...payload };

            let savedAddress;
            if (editingAddress) {
                savedAddress = await updateAddress(editingAddress.id, requestData);
                Alert.alert('Success', 'Address updated successfully');
            } else {
                savedAddress = await createAddress(requestData);
                Alert.alert('Success', 'Address added successfully!');
            }

            resetForm();
            onSuccess(savedAddress);
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to save address');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name="close" size={24} color={BrandColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Full Name *</Text>
                        <TextInput
                            style={styles.formInput}
                            value={formData.name}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                            placeholder="Enter your full name"
                            placeholderTextColor={BrandColors.mutedText}
                        />
                    </View>

                    {/* Mobile Number */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Mobile Number *</Text>
                        <TextInput
                            style={styles.formInput}
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
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Pincode *</Text>
                        <View style={styles.pincodeInputContainer}>
                            <TextInput
                                style={[styles.formInput, { flex: 1 }]}
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
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Flat, House no.</Text>
                        <TextInput
                            style={styles.formInput}
                            value={formData.address_line_1}
                            onChangeText={(text) => setFormData((prev) => ({ ...prev, address_line_1: text }))}
                            placeholder="House No., Building Name"
                            placeholderTextColor={BrandColors.mutedText}
                        />
                    </View>

                    {/* Address Line 2 with Autocomplete */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Road name, Area, Colony *</Text>
                        <TextInput
                            style={styles.formInput}
                            value={addressQuery}
                            onChangeText={handleAddressChange}
                            placeholder="Road Name, Area, Colony"
                            placeholderTextColor={BrandColors.mutedText}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <View style={styles.suggestionsContainer}>
                                <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                                    {suggestions.map((item) => (
                                        <TouchableOpacity
                                            key={item.place_id}
                                            style={styles.suggestionItem}
                                            onPress={() => selectAddressSuggestion(item)}
                                        >
                                            <Ionicons name="location-outline" size={16} color={BrandColors.mutedText} />
                                            <Text style={styles.suggestionText}>{item.description}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>

                    {/* City (auto-filled) */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>City/District/Town</Text>
                        <TextInput
                            style={[styles.formInput, styles.disabledInput]}
                            value={formData.city}
                            editable={false}
                            placeholder="Auto-filled from pincode"
                            placeholderTextColor={BrandColors.mutedText}
                        />
                    </View>

                    {/* State (auto-filled) */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>State</Text>
                        <TextInput
                            style={[styles.formInput, styles.disabledInput]}
                            value={formData.state}
                            editable={false}
                            placeholder="Auto-filled from pincode"
                            placeholderTextColor={BrandColors.mutedText}
                        />
                    </View>

                    {/* Conditional Fields based on user role */}
                    {userRole === 'CUSTOMER' ? (
                        <>
                            {/* Set Default Address */}
                            <View style={styles.formSwitchGroup}>
                                <Text style={styles.formLabel}>Set as Default Address</Text>
                                <Switch
                                    value={formData.default_address === 1}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({ ...prev, default_address: value ? 1 : 0 }))
                                    }
                                    trackColor={{ false: BrandColors.border, true: BrandColors.primary }}
                                />
                            </View>

                            {/* Address Type */}
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Address Type</Text>
                                <View style={styles.addressTypeContainer}>
                                    {(['home', 'work', 'other'] as const).map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.addressTypeButton,
                                                formData.address_type === type && styles.addressTypeButtonActive,
                                            ]}
                                            onPress={() => setFormData((prev) => ({ ...prev, address_type: type }))}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons
                                                name={
                                                    type === 'home' ? 'home' : type === 'work' ? 'briefcase' : 'location'
                                                }
                                                size={18}
                                                color={
                                                    formData.address_type === type
                                                        ? BrandColors.card
                                                        : BrandColors.primary
                                                }
                                            />
                                            <Text
                                                style={[
                                                    styles.addressTypeText,
                                                    formData.address_type === type && styles.addressTypeTextActive,
                                                ]}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </>
                    ) : (
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Service Range Area (in km) *</Text>
                            <TextInput
                                style={styles.formInput}
                                value={formData.range_area}
                                onChangeText={(text) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        range_area: text.replace(/[^0-9]/g, ''),
                                    }))
                                }
                                placeholder="Enter service range area"
                                placeholderTextColor={BrandColors.mutedText}
                                keyboardType="number-pad"
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color={BrandColors.card} />
                        ) : (
                            <>
                                <Text style={styles.submitButtonText}>
                                    {editingAddress ? 'Update Address' : 'Save Address'}
                                </Text>
                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
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
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: BrandColors.text,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    pincodeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    disabledInput: {
        backgroundColor: '#F3F4F6',
        color: BrandColors.mutedText,
    },
    formSwitchGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingVertical: 8,
    },
    addressTypeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    addressTypeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F0F9FF',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1.5,
        borderColor: BrandColors.primary,
    },
    addressTypeButtonActive: {
        backgroundColor: BrandColors.primary,
    },
    addressTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.primary,
    },
    addressTypeTextActive: {
        color: BrandColors.card,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: BrandColors.primary,
        borderRadius: 12,
        padding: 16,
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
    suggestionsContainer: {
        marginTop: 8,
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BrandColors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    suggestionText: {
        flex: 1,
        fontSize: 14,
        color: BrandColors.text,
    },
});
