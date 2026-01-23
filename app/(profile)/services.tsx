import { addPartnerService, deletePartnerService, getPartnerAddresses, getPartnerServices, getServices } from '@/lib/services/services';
import { PartnerAddress, Service, ServiceItem } from '@/lib/types/service';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ServicesScreen() {
    const insets = useSafeAreaInsets();
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuServiceId, setMenuServiceId] = useState<number | null>(null);
    const router = useRouter();

    const [addModalVisible, setAddModalVisible] = useState(false);

    const [categories, setCategories] = useState<Service[]>([]);
    const [addresses, setAddresses] = useState<PartnerAddress[]>([]);

    const [selectedServices, setSelectedServices] = useState<number[]>([]);
    const [selectedAddresses, setSelectedAddresses] = useState<number[]>([]);

    const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
    const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const res = await getPartnerServices();
            setServices(res.data || []);
        } catch {
            Alert.alert('Error', 'Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (addModalVisible) {
            loadAddServiceData();
        }
    }, [addModalVisible]);

    const loadAddServiceData = async () => {
        try {
            const [catRes, addrRes] = await Promise.all([
                getServices(),
                getPartnerAddresses(),
            ]);

            setCategories(catRes || []);
            setAddresses(addrRes.data || []);
        } catch {
            Alert.alert('Error', 'Failed to load data');
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Service',
            'Are you sure you want to delete this service?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deletePartnerService(id);
                        loadServices();
                    },
                },
            ]
        );
    };

    const toggleService = (id: number) => {
        setSelectedServices((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const toggleAddress = (id: number) => {
        setSelectedAddresses((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const getSelectedLabel = (
        selectedIds: number[],
        items: { id: number; name?: string; address_line_1?: string }[],
        placeholder: string
    ) => {
        if (!selectedIds.length) return placeholder;

        const selectedItems = items.filter((i) => selectedIds.includes(i.id));
        const isAddress = items.some((i) => typeof i.address_line_1 !== 'undefined');

        const getLabel = (i: { name?: string; address_line_1?: string }) =>
            isAddress ? (i.address_line_1 ?? i.name ?? '') : (i.name ?? i.address_line_1 ?? '');

        if (selectedItems.length === 1) {
            return getLabel(selectedItems[0]) || placeholder;
        }

        if (selectedItems.length === 2) {
            return selectedItems.map(getLabel).filter(Boolean).join(', ');
        }

        return `${selectedItems.length} selected`;
    };

    const handleAddService = async () => {
        if (!selectedServices.length || !selectedAddresses.length) {
            Alert.alert('Required', 'Select at least one service and location');
            return;
        }

        try {
            await addPartnerService({
                services: selectedServices,
                addresses: selectedAddresses,
            });
            Alert.alert('Success', 'Service added successfully');

            setAddModalVisible(false);
            setSelectedServices([]);
            setSelectedAddresses([]);
            loadServices();
        } catch {
            Alert.alert('Error', 'Failed to add service');
        }
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

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Services</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={BrandColors.primary} />
                </TouchableOpacity>
            </View>

            {!services.length ? (
                <View style={styles.center}>
                    <Ionicons
                        name="construct-outline"
                        size={64}
                        color={BrandColors.mutedText}
                    />
                    <Text style={styles.emptyText}>No services found</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {services.map((item) => {
                        const isApproved = item.status === 1;

                        return (
                            <View key={item.id} style={styles.card}>

                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <Text style={styles.serial}>#{item.id}</Text>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                isApproved ? styles.approved : styles.pending,
                                            ]}
                                        >
                                            <Text style={styles.statusText}>
                                                {isApproved ? 'Approved' : 'Pending'}
                                            </Text>
                                        </View>
                                    </View>


                                    <TouchableOpacity
                                        style={styles.moreBtn}
                                        onPress={() => setMenuServiceId(item.id)}
                                    >
                                        <Ionicons
                                            name="ellipsis-vertical"
                                            size={20}
                                            color={BrandColors.mutedText}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Status */}


                                {/* Category */}
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="briefcase-outline"
                                        size={18}
                                        color={BrandColors.primary}
                                    />
                                    <Text style={styles.label}>
                                        {item.category?.name}
                                    </Text>
                                </View>

                                {/* Location */}
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="location-outline"
                                        size={18}
                                        color={BrandColors.primary}
                                    />
                                    <Text style={styles.value}>
                                        {item.address?.address_line_1}
                                    </Text>
                                </View>

                                {/* Range */}
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="navigate-outline"
                                        size={18}
                                        color={BrandColors.primary}
                                    />
                                    <Text style={styles.value}>
                                        {item.address?.range_area} KM Range
                                    </Text>
                                </View>

                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* MORE MENU BOTTOM SHEET */}
            <Modal
                visible={menuServiceId !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuServiceId(null)}
            >
                {/* Overlay */}
                <TouchableOpacity
                    style={styles.menuOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuServiceId(null)}
                />

                {/* Sheet */}
                <View style={styles.menuSheet}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            handleDelete(menuServiceId!);
                            setMenuServiceId(null);
                        }}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={20}
                            color={BrandColors.danger}
                        />
                        <Text style={styles.menuTextDanger}>
                            Delete Service
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => setMenuServiceId(null)}
                    >
                        <Ionicons
                            name="close-outline"
                            size={20}
                            color={BrandColors.mutedText}
                        />
                        <Text style={styles.menuText}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal
                visible={addModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>

                        <Text style={styles.modalTitle}>Add Service</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>

                            {/* SERVICE CATEGORY */}
                            <Text style={styles.sectionLabel}>Service Category</Text>

                            <View>
                                <TouchableOpacity
                                    style={styles.selectField}
                                    onPress={() => setServiceDropdownOpen((prev) => !prev)}
                                >
                                    <Text style={styles.selectText}>
                                        {getSelectedLabel(
                                            selectedServices,
                                            categories,
                                            'Select service category'
                                        )}
                                    </Text>
                                    <Ionicons name="chevron-down" size={18} />
                                </TouchableOpacity>

                                {serviceDropdownOpen && (
                                    <View style={styles.dropdownContainer}>
                                        <ScrollView>
                                            {categories.map((item) => {
                                                const active = selectedServices.includes(item.id);
                                                return (
                                                    <TouchableOpacity
                                                        key={item.id}
                                                        style={[
                                                            styles.dropdownItem,
                                                            active && styles.dropdownItemActive,
                                                        ]}
                                                        onPress={() => toggleService(item.id)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.dropdownText,
                                                                active && styles.dropdownTextActive,
                                                            ]}
                                                        >
                                                            {item.name}
                                                        </Text>
                                                        {active && (
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={18}
                                                                color={BrandColors.primary}
                                                            />
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            {/* SERVICE LOCATION */}
                            <Text style={styles.sectionLabel}>Service Location</Text>

                            <View>
                                <TouchableOpacity
                                    style={styles.selectField}
                                    onPress={() => setAddressDropdownOpen((prev) => !prev)}
                                >
                                    <Text style={styles.selectText}>
                                        {getSelectedLabel(
                                            selectedAddresses,
                                            addresses,
                                            'Select service location'
                                        )}
                                    </Text>
                                    <Ionicons name="chevron-down" size={18} />
                                </TouchableOpacity>

                                {addressDropdownOpen && (
                                    <View style={styles.dropdownContainer}>
                                        <ScrollView>
                                            {addresses.map((item) => {
                                                const active = selectedAddresses.includes(item.id);
                                                return (
                                                    <TouchableOpacity
                                                        key={item.id}
                                                        style={[
                                                            styles.dropdownItem,
                                                            active && styles.dropdownItemActive,
                                                        ]}
                                                        onPress={() => toggleAddress(item.id)}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.dropdownText,
                                                                active && styles.dropdownTextActive,
                                                            ]}
                                                        >
                                                            {item.address_line_1}
                                                        </Text>
                                                        {active && (
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={18}
                                                                color={BrandColors.primary}
                                                            />
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                        </ScrollView>

                        {/* ACTIONS */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setAddModalVisible(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.saveBtn}
                                onPress={handleAddService}
                            >
                                <Text style={styles.saveText}>Add</Text>
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
        fontSize: 16,
        color: BrandColors.mutedText,
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
        alignItems: 'center',
    },

    serial: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.mutedText,
    },

    moreBtn: {
        padding: 6,
    },

    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },

    approved: {
        backgroundColor: '#E8F5E9',
    },

    pending: {
        backgroundColor: '#FFF3E0',
    },

    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: BrandColors.text,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },

    label: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
    },

    value: {
        fontSize: 14,
        color: BrandColors.mutedText,
        flex: 1,
    },

    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },

    menuSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: BrandColors.card,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        paddingBottom: 20,
        paddingTop: 8,
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },

    menuText: {
        fontSize: 16,
        color: BrandColors.text,
        fontWeight: '500',
    },

    menuTextDanger: {
        fontSize: 16,
        color: BrandColors.danger,
        fontWeight: '600',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },

    modalSheet: {
        backgroundColor: BrandColors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '85%',
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
        color: BrandColors.text,
    },

    sectionLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
        color: BrandColors.text,
    },

    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: BrandColors.border,
    },

    optionActive: {
        backgroundColor: `${BrandColors.primary}10`,
    },

    optionText: {
        fontSize: 14,
        color: BrandColors.text,
    },

    optionTextActive: {
        fontWeight: '600',
    },

    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },

    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
        alignItems: 'center',
    },

    saveBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
    },

    cancelText: {
        fontWeight: '600',
        color: BrandColors.text,
    },

    saveText: {
        fontWeight: '600',
        color: '#fff',
    },

    selectField: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 10,
        backgroundColor: BrandColors.card,
        marginBottom: 12,
    },

    selectText: {
        fontSize: 14,
        color: BrandColors.text,
        flex: 1,
        marginRight: 8,
    },

    popoverOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },

    popover: {
        position: 'absolute',
        top: '30%',
        left: 20,
        right: 20,
        maxHeight: '50%',
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        paddingVertical: 8,
        elevation: 8,
    },

    popoverItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    popoverItemActive: {
        backgroundColor: `${BrandColors.primary}15`,
    },

    popoverText: {
        fontSize: 14,
        color: BrandColors.text,
    },

    popoverTextActive: {
        fontWeight: '600',
        color: BrandColors.primary,
    },

    dropdownContainer: {
        marginTop: 8,
        maxHeight: 240,
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: BrandColors.border,
        zIndex: 100,
        elevation: 6,
        paddingVertical: 6,
    },

    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    dropdownItemActive: {
        backgroundColor: `${BrandColors.primary}15`,
    },

    dropdownText: {
        fontSize: 14,
        color: BrandColors.text,
    },

    dropdownTextActive: {
        color: BrandColors.primary,
        fontWeight: '600',
    },
});
