import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
    const { cart } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

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

            {/* Book Button */}
            {items.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.bookBtn}>
                        <Text style={styles.bookText}>Confirm Booking</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    </TouchableOpacity>
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    bookBtn: {
        backgroundColor: BrandColors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    bookText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    }
});