import { getAddresses } from '@/lib/services/address';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
    const { cart } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
    const [showAddressList, setShowAddressList] = useState(false);

    const [items, setItems] = useState(
        cart ? JSON.parse(decodeURIComponent(cart as string)) : []
    );

    const updateQty = (id: number, delta: number) => {
        setItems((prev: any[]) => {
            const newItems = prev.map(i =>
                i.id === id ? { ...i, qty: i.qty + delta } : i
            );
            // Remove items with qty <= 0
            return newItems.filter(i => i.qty > 0);
        });
    };

    const total = items.reduce((t: number, i: any) => t + i.price * i.qty, 0);

    useEffect(() => {
        const loadAddresses = async () => {
            const data = await getAddresses();
            setAddresses(data);

            const defaultAddr = data.find(a => a.default_address === 1);
            setSelectedAddress(defaultAddr || data[0]);
        };

        loadAddresses();
    }, []);

    const getAddressIcon = (type: string | null) => {
        switch (type) {
            case 'home':
                return 'home-outline';
            case 'office':
                return 'briefcase-outline';
            default:
                return 'location-outline';
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.heading}>Your Cart</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {items.length === 0 ? (
                    <View style={styles.emptyCart}>
                        <Ionicons name="cart-outline" size={80} color={BrandColors.mutedText} />
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                    </View>
                ) : (
                    <>
                        {/* Cart Items */}
                        <View style={styles.itemsContainer}>
                            {items.map((item: any) => (
                                <View key={item.id} style={styles.itemCard}>
                                    <View style={styles.itemInfo}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemPrice}>₹ {item.price.toLocaleString()}</Text>
                                    </View>

                                    <View style={styles.qtyControl}>
                                        <TouchableOpacity
                                            onPress={() => updateQty(item.id, -1)}
                                            style={styles.qtyBtn}
                                        >
                                            <Ionicons name="remove" size={18} color={BrandColors.primary} />
                                        </TouchableOpacity>

                                        <Text style={styles.qtyText}>{item.qty}</Text>

                                        <TouchableOpacity
                                            onPress={() => updateQty(item.id, 1)}
                                            style={styles.qtyBtn}
                                        >
                                            <Ionicons name="add" size={18} color={BrandColors.primary} />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.itemTotal}>₹ {(item.price * item.qty).toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Bill Summary */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Bill Summary</Text>

                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Subtotal ({items.length} items)</Text>
                                <Text style={styles.summaryValue}>₹ {total.toLocaleString()}</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalValue}>₹ {total.toLocaleString()}</Text>
                            </View>
                        </View>

                        {/* Notice */}
                        <View style={styles.noticeCard}>
                            <Ionicons name="information-circle-outline" size={20} color={BrandColors.mutedText} />
                            <Text style={styles.notice}>
                                <Text style={{ fontWeight: '700' }}>Visit & Diagnosis charge ₹100.</Text>
                                {' '}That is applicable only if the service is denied by the customer after the serviceman's visit to the service location.
                            </Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.8} style={styles.helpCard} onPress={() => Linking.openURL('tel:+918273737872')}>
                            <Text style={{ fontWeight: '700', color: BrandColors.primary }}>Need help?</Text>
                            <Text style={{ color: BrandColors.text }}>Call us +91 8273737872</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {items.length > 0 && (
                <View style={styles.bottomBar}>

                    {/* Compact Address Row */}
                    <TouchableOpacity
                        style={styles.compactAddress}
                        activeOpacity={0.8}
                        onPress={() => setShowAddressList(true)}
                    >
                        <Ionicons name="location-outline" size={18} color={BrandColors.primary} />
                        <Text style={styles.compactAddressText} numberOfLines={1}>
                            {addresses.length === 0
                                ? 'Add Address'
                                : selectedAddress
                                    ? `${selectedAddress.address_line_1}, ${selectedAddress.address_line_2}, ${selectedAddress.pincode}`
                                    : 'Loading...'}
                        </Text>

                        <Ionicons name="chevron-up" size={18} color={BrandColors.mutedText} />
                    </TouchableOpacity>

                    {/* Confirm Button */}
                    <TouchableOpacity style={styles.bookBtn}>
                        <Text style={styles.bookText}>Confirm Booking</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    </TouchableOpacity>

                </View>
            )}

            {showAddressList && (
                <View style={styles.addressOverlay}>
                    <View style={styles.addressModal}>

                        <Text style={styles.modalTitle}>Select Address</Text>

                        {addresses.length === 0 ? (
                            <TouchableOpacity
                                style={styles.addAddressCard}
                                activeOpacity={0.85}
                                onPress={() => {
                                    setShowAddressList(false);
                                    router.push('/(profile)/addresses');
                                }}
                            >
                                <Ionicons name="add-circle-outline" size={28} color={BrandColors.primary} />
                                <Text style={styles.addAddressText}>Add New Address</Text>
                                <Text style={styles.addAddressSubText}>
                                    Save your location for faster booking
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <ScrollView>
                                {addresses.map(addr => (
                                    <TouchableOpacity
                                        key={addr.id}
                                        style={[
                                            styles.addressItem,
                                            selectedAddress?.id === addr.id && styles.addressItemActive
                                        ]}
                                        onPress={() => {
                                            setSelectedAddress(addr);
                                            setShowAddressList(false);
                                        }}
                                    >
                                        <View style={styles.addressRow}>
                                            <Ionicons
                                                name={getAddressIcon(addr.address_type)}
                                                size={20}
                                                color={BrandColors.primary}
                                                style={{ marginRight: 10 }}
                                            />

                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.addressName}>{addr.name}</Text>
                                                <Text style={styles.addressText}>
                                                    {addr.address_line_1}, {addr.address_line_2}, {addr.pincode}
                                                </Text>
                                            </View>

                                            {selectedAddress?.id === addr.id && (
                                                <Ionicons name="checkmark-circle" size={18} color={BrandColors.primary} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}


                        <TouchableOpacity onPress={() => setShowAddressList(false)} style={styles.closeBtn}>
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        padding: 6,
        marginRight: 12,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: BrandColors.text,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    emptyCart: {
        marginTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: BrandColors.mutedText,
        fontWeight: '500',
    },
    itemsContainer: {
        marginTop: 16,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontWeight: '600',
        fontSize: 15,
        color: BrandColors.text,
        marginBottom: 4,
    },
    itemPrice: {
        color: BrandColors.mutedText,
        fontSize: 14,
    },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 4,
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    qtyBtn: {
        padding: 6,
    },
    qtyText: {
        fontSize: 15,
        fontWeight: '600',
        marginHorizontal: 12,
        minWidth: 20,
        textAlign: 'center',
    },
    itemTotal: {
        fontWeight: '700',
        fontSize: 16,
        color: BrandColors.text,
        minWidth: 80,
        textAlign: 'right',
    },
    summaryCard: {
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryLabel: {
        color: BrandColors.mutedText,
        fontSize: 14,
    },
    summaryValue: {
        color: BrandColors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.text,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.primary,
    },
    noticeCard: {
        flexDirection: 'row',
        backgroundColor: '#FEF3C7',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    notice: {
        flex: 1,
        color: '#92400E',
        fontSize: 13,
        lineHeight: 18,
    },
    helpCard: {
        backgroundColor: '#EFF6FF',
        padding: 12,
        borderRadius: 12,
        marginBottom: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        elevation: 12,
    },
    compactAddress: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    compactAddressText: {
        flex: 1,
        marginHorizontal: 8,
        fontSize: 13,
        color: BrandColors.text,
    },
    addressOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    addressModal: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    closeBtn: {
        backgroundColor: BrandColors.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
    },
    addressItem: {
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 10,
    },
    addressItemActive: {
        borderColor: BrandColors.primary,
        backgroundColor: '#EFF6FF',
    },
    addressName: {
        fontWeight: '600',
        fontSize: 15,
        color: BrandColors.text,
        marginBottom: 4,
    },
    addressText: {
        color: BrandColors.mutedText,
        fontSize: 14,
    },
    bookBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BrandColors.primary,
        padding: 14,
        borderRadius: 12,
        gap: 8,
        marginBottom: 12,
    },
    bookText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addAddressCard: {
        backgroundColor: '#F1F5F9',
        borderRadius: 14,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addAddressText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.text,
    },
    addAddressSubText: {
        marginTop: 4,
        fontSize: 13,
        color: BrandColors.mutedText,
        textAlign: 'center',
    },
});