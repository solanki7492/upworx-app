import OrderStatusOverlay from '@/components/ui/order-status-overlay';
import { useCart } from '@/contexts/cart-context';
import { getAddresses } from '@/lib/services/address';
import { payLater } from '@/lib/services/booking';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const problemOptions: Record<string, string[]> = {
    'ac': ['Over Heating', 'Water Leakage', 'Slow cooling', 'Abnormal Sound', 'Dirty air filters'],
    'refrigerator': ['Not Cooling', 'Water Leakage', 'Door-related issues', 'Temperature issues', 'Loud noise'],
    'washing-machine': ['Smells Bad', 'Leaves Marks', 'Water Leaking', "Won't spin", 'Electrical issues'],
    'tv': ['Screen Issues', 'HDMI Port', 'Installation', 'Audio Problems', 'Software Updates'],
    'geyser': ['Water leakage', 'No Hot Water', 'Strange Noises', 'Low Water Pressure', 'Foul odor'],
    'air-cooler': ['Water Leak', 'Slow performance', 'Motor Winding', 'Grass change', 'Noise/Cleaning'],
    'electric-fan': ['Slow performance', 'Motor Winding', 'Burnt Capacitor', 'Noise', 'Blade Issues'],
    'plumber': ['Damaged fixtures', 'Drain cleaning', 'Pipe Line repair', 'Renovating', 'Sewer cleaning'],
    'electrician': ['Motor Winding', 'Lighting/Wiring Setup', 'Appliance Hookups', 'Home Automation'],
    'carpenter': ['Counters', 'Custom furniture', 'Doors and windows', 'Cutting wood', 'Roofing sheet'],
    'water-purifier': ['Noise Issues', 'RO Membrane issues', 'Bad Taste of Water', 'Auto Shut-Off Failure'],
    'cctv-camera': ['Burglar alarms', 'Motion Sensor', 'Poor video quality', 'Connectivity Issues'],
    'mobile-phone': ['Battery replacement', 'Microphone/speaker', 'Touchscreen issues', 'Overheating'],
    'computer': ['Battery Issues', 'Display Issues', 'Overheating', 'Fan noise', 'Keyboard issues'],
};

// Generate time slots from 08:00 AM to 09:00 PM (30 min intervals)
const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 8; hour <= 21; hour++) {
        for (let min = 0; min < 60; min += 30) {
            if (hour === 21 && min > 0) break; // Stop at 09:00 PM
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            const formattedMin = min.toString().padStart(2, '0');
            slots.push(`${displayHour.toString().padStart(2, '0')}:${formattedMin} ${period}`);
        }
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Generate next 4 days
const getNext4Days = () => {
    const days = [];
    for (let i = 0; i < 4; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        days.push(date);
    }
    return days;
};

const PROBLEMS_KEY = '@cart_problems';
const MESSAGES_KEY = '@cart_messages';
const SCHEDULES_KEY = '@cart_schedules';

export default function CartScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { orders, updateOrder, removeOrder, clearCart } = useCart();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
    const [showAddressList, setShowAddressList] = useState(false);

    // Order expansion state
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

    // Modal states
    const [showProblemModal, setShowProblemModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

    // Per-order problems and schedules
    const [orderProblems, setOrderProblems] = useState<Record<string, string[]>>({});
    const [orderSchedules, setOrderSchedules] = useState<Record<string, { date: Date; time: string }>>({});
    const [orderMessages, setOrderMessages] = useState<Record<string, string>>({});

    // Temporary editing state
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<null | 'loading' | 'success'>(null);
    const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

    const availableDays = getNext4Days();

    const toggleOrderExpansion = (orderId: string) => {
        setExpandedOrders((prev) => ({
            ...prev,
            [orderId]: !prev[orderId],
        }));
    };

    useEffect(() => {
        if (orders.length && Object.keys(expandedOrders).length === 0) {
            setExpandedOrders({ [orders[0].orderId]: true });
        }
    }, [orders]);

    const handleRemoveOrder = (orderId: string) => {
        Alert.alert('Remove Order', 'Are you sure you want to remove this order from cart?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    removeOrder(orderId);
                    // Clean up associated data
                    setOrderProblems((prev) => {
                        const updated = { ...prev };
                        delete updated[orderId];
                        return updated;
                    });
                    setOrderSchedules((prev) => {
                        const updated = { ...prev };
                        delete updated[orderId];
                        return updated;
                    });
                    setExpandedOrders((prev) => {
                        const updated = { ...prev };
                        delete updated[orderId];
                        return updated;
                    });
                },
            },
        ]);
    };

    const toggleProblem = (problem: string) => {
        setSelectedProblems(prev =>
            prev.includes(problem)
                ? prev.filter(p => p !== problem)
                : [...prev, problem]
        );
    };

    const isTimeSlotDisabled = (timeSlot: string): boolean => {
        const today = new Date();
        const isToday =
            selectedDate.getDate() === today.getDate() &&
            selectedDate.getMonth() === today.getMonth() &&
            selectedDate.getFullYear() === today.getFullYear();

        if (!isToday) return false;

        const match = timeSlot.match(/(\d{2}):(\d{2}) (AM|PM)/);
        if (!match) return false;

        let hour = parseInt(match[1]);
        const min = parseInt(match[2]);
        const period = match[3];

        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        const slotTime = new Date(today);
        slotTime.setHours(hour, min, 0, 0);

        return slotTime <= today;
    };

    const normalizeDate = (input: any): Date | null => {
        if (!input) return null;
        if (input instanceof Date) return input;

        const d = new Date(input);
        return isNaN(d.getTime()) ? null : d;
    };

    const formatDate = (input: any): string => {
        const date = normalizeDate(input);
        if (!date) return '';

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        ) {
            return 'Today';
        }

        if (
            date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear()
        ) {
            return 'Tomorrow';
        }

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    };

    const formatDateShort = (date: Date): string => {
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    };

    const formatDateForAPI = (input: any): string => {
        const date = normalizeDate(input);
        if (!date) return '';

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');

        return `${dd}/${mm}/${yyyy}`;
    };

    const loadOrderMetaIntoModal = (orderId: string) => {
        setActiveOrderId(orderId);

        // Load problems & message
        setSelectedProblems(orderProblems[orderId] || []);
        setMessage(orderMessages[orderId] || '');

        // Load schedule
        const schedule = orderSchedules[orderId];
        if (schedule) {
            setSelectedDate(new Date(schedule.date));
            setSelectedTime(schedule.time);
        } else {
            setSelectedDate(availableDays[0]);
            setSelectedTime(null);
        }
    };

    const handleSaveProblems = () => {
        if (activeOrderId) {
            setOrderProblems((prev) => ({
                ...prev,
                [activeOrderId]: selectedProblems,
            }));
            setOrderMessages((prev) => ({
                ...prev,
                [activeOrderId]: message,
            }));
        }
        setShowProblemModal(false);
        setActiveOrderId(null);
        setSelectedProblems([]);
        setMessage('');
    };

    const handleSaveSchedule = () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert('Error', 'Please select both date and time');
            return;
        }
        if (activeOrderId) {
            setOrderSchedules((prev) => ({
                ...prev,
                [activeOrderId]: { date: selectedDate, time: selectedTime },
            }));
        }
        setShowScheduleModal(false);
        setActiveOrderId(null);
    };

    useEffect(() => {
        (async () => {
            const [p, m, s] = await Promise.all([
                AsyncStorage.getItem(PROBLEMS_KEY),
                AsyncStorage.getItem(MESSAGES_KEY),
                AsyncStorage.getItem(SCHEDULES_KEY),
            ]);

            if (p) setOrderProblems(JSON.parse(p));
            if (m) setOrderMessages(JSON.parse(m));
            if (s) setOrderSchedules(JSON.parse(s));
        })();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(PROBLEMS_KEY, JSON.stringify(orderProblems));
    }, [orderProblems]);

    useEffect(() => {
        AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(orderMessages));
    }, [orderMessages]);

    useEffect(() => {
        AsyncStorage.setItem(SCHEDULES_KEY, JSON.stringify(orderSchedules));
    }, [orderSchedules]);

    const clearAllCartMeta = async () => {
        setOrderProblems({});
        setOrderMessages({});
        setOrderSchedules({});
        setExpandedOrders({});

        await Promise.all([
            AsyncStorage.removeItem('@cart_problems'),
            AsyncStorage.removeItem('@cart_messages'),
            AsyncStorage.removeItem('@cart_schedules'),
        ]);
    };

    const handleConfirmBooking = async () => {
        if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        // Validate all orders have problems and schedules
        for (const order of orders) {
            if (problemOptions[order.mainService.slug]?.length > 0 && !orderProblems[order.orderId]?.length) {
                Alert.alert('Error', `Please select problems for ${order.mainService.name}`);
                return;
            }
            if (!orderSchedules[order.orderId]) {
                Alert.alert('Error', `Please select schedule for ${order.mainService.name}`);
                return;
            }
        }

        setOrderStatus('loading');

        try {
            const payload = {
                service: orders.map((order) => {
                    const schedule = orderSchedules[order.orderId];
                    const problems = orderProblems[order.orderId] || [];
                    const customMessage = orderMessages[order.orderId] || '';

                    // Format message as: (problem1, problem2) custom message
                    let formattedMessage = '';
                    if (problems.length > 0) {
                        formattedMessage = `(${problems.join(', ')})`;
                    }
                    if (customMessage) {
                        formattedMessage = formattedMessage ? `${formattedMessage} ${customMessage}` : customMessage;
                    }

                    return {
                        id: order.mainService.id,
                        name: order.mainService.name,
                        slug: order.mainService.slug,
                        service_date: formatDateForAPI(schedule.date),
                        service_time: schedule.time,
                        repair_text: null,
                        message: formattedMessage,
                        services: order.services.map((s: any) => ({
                            id: s.id,
                            service: s.service,
                            qty: s.qty,
                            price: s.price,
                            note: s.note || null,
                            l2: s.l2,
                            l3: s.l3,
                        })),
                        total_service: order.totalServiceCount,
                        total_quantity: order.totalQuantity,
                        total_service_price: order.totalPrice,
                    };
                }),
                address_id: selectedAddress.id,
            };

            const response = await payLater(payload);

            if (response && response.status) {
                clearCart();
                await clearAllCartMeta();

                setOrderStatus('success');
                setConfirmedOrderId(response.order_id);

                setTimeout(() => {
                    setOrderStatus(null);
                    router.push('/(tabs)');
                }, 3000);
            }

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to confirm booking');
        }
    };

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

    useEffect(() => {
        const loadAddresses = async () => {
            const data = await getAddresses();
            setAddresses(data);

            const defaultAddr = data.find(a => a.default_address === 1);
            setSelectedAddress(defaultAddr || data[0]);
        };

        loadAddresses();
    }, []);


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
                {orders.length === 0 ? (
                    <View style={styles.emptyCart}>
                        <Ionicons name="cart-outline" size={80} color={BrandColors.mutedText} />
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                    </View>
                ) : (
                    <>
                        {/* Order Cards */}
                        {orders.map((order: any) => {
                            const isExpanded = expandedOrders[order.orderId] || false;
                            const hasProblems = orderProblems[order.orderId]?.length > 0;
                            const hasSchedule = orderSchedules[order.orderId]?.date && orderSchedules[order.orderId]?.time;

                            return (
                                <View key={order.orderId} style={styles.orderCard}>
                                    {/* Order Header */}
                                    <TouchableOpacity
                                        style={styles.orderHeader}
                                        onPress={() => toggleOrderExpansion(order.orderId)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.orderHeaderLeft}>
                                            <Ionicons name="cube-outline" size={24} color={BrandColors.primary} />
                                            <View>
                                                <Text style={styles.orderTitle}>{order.mainService.name}</Text>
                                                <Text style={styles.orderSubtitle}>
                                                    {order.totalQuantity} item(s) • ₹{order.totals.grandTotal.toLocaleString()}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.orderHeaderRight}>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveOrder(order.orderId);
                                                }}
                                                style={styles.removeBtn}
                                            >
                                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                            <Ionicons
                                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                size={20}
                                                color={BrandColors.mutedText}
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    {/* Order Details - Expandable */}
                                    {isExpanded && (
                                        <View style={styles.orderDetails}>
                                            {/* Services List */}
                                            {order.services.map((service: any, idx: number) => (
                                                <View key={idx} style={styles.serviceItemRow}>
                                                    <View style={styles.serviceInfo}>
                                                        <Text style={styles.serviceName}>{service.service}</Text>
                                                        <Text style={styles.servicePrice}>₹{service.price}/unit</Text>
                                                    </View>
                                                    <View style={styles.qtyControl}>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const currentQty = parseInt(service.qty);

                                                                if (currentQty === 1) {
                                                                    // Remove this service from the order
                                                                    const updatedServices = order.services.filter((_: any, i: number) => i !== idx);

                                                                    // If no services left, remove the entire order
                                                                    if (updatedServices.length === 0) {
                                                                        handleRemoveOrder(order.orderId);
                                                                    } else {
                                                                        // Update order with remaining services
                                                                        const newTotalQty = updatedServices.reduce((sum: number, s: any) => sum + parseInt(s.qty), 0);
                                                                        const newTotalPrice = updatedServices.reduce((sum: number, s: any) => sum + (parseInt(s.price) * parseInt(s.qty)), 0);
                                                                        updateOrder(order.orderId, {
                                                                            services: updatedServices,
                                                                            totalQuantity: newTotalQty,
                                                                            totalPrice: newTotalPrice,
                                                                            totals: {
                                                                                subtotal: newTotalPrice,
                                                                                discount: 0,
                                                                                tax: 0,
                                                                                grandTotal: newTotalPrice,
                                                                            },
                                                                        });
                                                                    }
                                                                } else if (currentQty > 1) {
                                                                    // Decrement quantity
                                                                    const updatedServices = [...order.services];
                                                                    updatedServices[idx] = { ...service, qty: String(currentQty - 1) };
                                                                    const newTotalQty = updatedServices.reduce((sum, s) => sum + parseInt(s.qty), 0);
                                                                    const newTotalPrice = updatedServices.reduce((sum, s) => sum + (parseInt(s.price) * parseInt(s.qty)), 0);
                                                                    updateOrder(order.orderId, {
                                                                        services: updatedServices,
                                                                        totalQuantity: newTotalQty,
                                                                        totalPrice: newTotalPrice,
                                                                        totals: {
                                                                            subtotal: newTotalPrice,
                                                                            discount: 0,
                                                                            tax: 0,
                                                                            grandTotal: newTotalPrice,
                                                                        },
                                                                    });
                                                                }
                                                            }}
                                                            style={styles.qtyBtn}
                                                        >
                                                            <Ionicons name="remove" size={18} color={BrandColors.primary} />
                                                        </TouchableOpacity>
                                                        <Text style={styles.qtyText}>{service.qty}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const updatedServices = [...order.services];
                                                                const currentQty = parseInt(service.qty);
                                                                updatedServices[idx] = { ...service, qty: String(currentQty + 1) };
                                                                const newTotalQty = updatedServices.reduce((sum, s) => sum + parseInt(s.qty), 0);
                                                                const newTotalPrice = updatedServices.reduce((sum, s) => sum + (parseInt(s.price) * parseInt(s.qty)), 0);
                                                                updateOrder(order.orderId, {
                                                                    services: updatedServices,
                                                                    totalQuantity: newTotalQty,
                                                                    totalPrice: newTotalPrice,
                                                                    totals: {
                                                                        subtotal: newTotalPrice,
                                                                        discount: 0,
                                                                        tax: 0,
                                                                        grandTotal: newTotalPrice,
                                                                    },
                                                                });
                                                            }}
                                                            style={styles.qtyBtn}
                                                        >
                                                            <Ionicons name="add" size={18} color={BrandColors.primary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <Text style={styles.serviceTotal}>₹{(parseInt(service.price) * parseInt(service.qty)).toLocaleString()}</Text>
                                                </View>
                                            ))}

                                            {/* Problem Selection for this Order */}
                                            {problemOptions[order.mainService.slug]?.length > 0 && (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.selectionCard,
                                                        hasProblems && styles.selectionCardActive,
                                                    ]}
                                                    activeOpacity={0.7}
                                                    onPress={() => {
                                                        setActiveOrderId(order.orderId);
                                                        setShowProblemModal(true);
                                                        loadOrderMetaIntoModal(order.orderId);
                                                    }}
                                                >
                                                    <View style={styles.selectionCardLeft}>
                                                        <Ionicons
                                                            name="alert-circle-outline"
                                                            size={24}
                                                            color={hasProblems ? BrandColors.primary : BrandColors.mutedText}
                                                        />
                                                        <View style={styles.selectionCardText}>
                                                            <Text style={styles.selectionCardTitle}>What's the Problem?</Text>
                                                            <Text style={styles.selectionCardSubtitle}>
                                                                {hasProblems
                                                                    ? `${orderProblems[order.orderId].length} problem(s) selected`
                                                                    : 'Tap to select problems'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                                                </TouchableOpacity>
                                            )}

                                            {/* Schedule Selection for this Order */}
                                            <TouchableOpacity
                                                style={[
                                                    styles.selectionCard,
                                                    hasSchedule && styles.selectionCardActive,
                                                ]}
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                    setActiveOrderId(order.orderId);
                                                    setShowScheduleModal(true);
                                                    loadOrderMetaIntoModal(order.orderId);
                                                }}
                                            >
                                                <View style={styles.selectionCardLeft}>
                                                    <Ionicons
                                                        name="calendar-outline"
                                                        size={24}
                                                        color={hasSchedule ? BrandColors.primary : BrandColors.mutedText}
                                                    />
                                                    <View style={styles.selectionCardText}>
                                                        <Text style={styles.selectionCardTitle}>Schedule Service</Text>
                                                        <Text style={styles.selectionCardSubtitle}>
                                                            {hasSchedule
                                                                ? `${formatDate(orderSchedules[order.orderId].date)}, ${orderSchedules[order.orderId].time}`
                                                                : 'Tap to select date & time'}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        {/* Grand Total Summary */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Total Summary</Text>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Orders</Text>
                                <Text style={styles.summaryValue}>{orders.length}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Items</Text>
                                <Text style={styles.summaryValue}>
                                    {orders.reduce((sum, o) => sum + o.totalQuantity, 0)}
                                </Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>Grand Total</Text>
                                <Text style={styles.totalValue}>
                                    ₹{orders.reduce((sum, o) => sum + o.totals.grandTotal, 0).toLocaleString()}
                                </Text>
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
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={styles.helpCard}
                            onPress={() => Linking.openURL('tel:+918273737872')}
                        >
                            <Text style={{ fontWeight: '700', color: BrandColors.primary }}>Need help?</Text>
                            <Text style={{ color: BrandColors.text }}>Call us +91 8273737872</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {orders.length > 0 && (
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
                    <TouchableOpacity style={styles.bookBtn} onPress={handleConfirmBooking}>
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

            {/* Problem / Message Modal */}
            {showProblemModal && activeOrderId && (() => {
                const order = orders.find((o) => o.orderId === activeOrderId);
                const currentProblems = order ? problemOptions[order.mainService.slug] || [] : [];
                return currentProblems.length > 0 ? (
                    <View style={styles.addressOverlay}>
                        <View style={styles.addressModal}>
                            <Text style={styles.modalTitle}>What's the Problem?</Text>
                            <Text style={styles.sectionSubtitle}>Select all that apply</Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.chipsContainer}>
                                    {currentProblems.map((problem: string, index: number) => {
                                        const isSelected = selectedProblems.includes(problem);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.chip, isSelected && styles.chipSelected]}
                                                onPress={() => toggleProblem(problem)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                                    {problem}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <Text style={styles.inputLabel}>Additional Message (Optional)</Text>
                                <TextInput
                                    style={styles.messageInput}
                                    placeholder="Please enter your message here"
                                    placeholderTextColor={BrandColors.mutedText}
                                    value={message}
                                    onChangeText={setMessage}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </ScrollView>

                            <TouchableOpacity onPress={handleSaveProblems} style={styles.closeBtn}>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null;
            })()}

            {/* Schedule Service Modal */}
            {showScheduleModal && (
                <View style={styles.addressOverlay}>
                    <View style={styles.addressModal}>
                        <Text style={styles.modalTitle}>Schedule Service</Text>
                        <Text style={styles.sectionSubtitle}>Choose your preferred date and time</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Date Selector */}
                            <Text style={styles.inputLabel}>Select Date</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.dateScroll}
                                contentContainerStyle={styles.dateScrollContent}
                            >
                                {availableDays.map((day, index) => {
                                    const isSelected =
                                        day.getDate() === selectedDate.getDate() &&
                                        day.getMonth() === selectedDate.getMonth() &&
                                        day.getFullYear() === selectedDate.getFullYear();

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                                            onPress={() => {
                                                setSelectedDate(day);
                                                setSelectedTime(null);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                                                {formatDate(day)}
                                            </Text>
                                            <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>
                                                {formatDateShort(day)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {/* Time Slot Grid */}
                            <Text style={styles.inputLabel}>Select Time Slot</Text>
                            <View style={styles.timeGrid}>
                                {TIME_SLOTS.map((slot, index) => {
                                    const isSelected = selectedTime === slot;
                                    const isDisabled = isTimeSlotDisabled(slot);

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.timeSlot,
                                                isSelected && styles.timeSlotSelected,
                                                isDisabled && styles.timeSlotDisabled,
                                            ]}
                                            onPress={() => !isDisabled && setSelectedTime(slot)}
                                            activeOpacity={0.7}
                                            disabled={isDisabled}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeText,
                                                    isSelected && styles.timeTextSelected,
                                                    isDisabled && styles.timeTextDisabled,
                                                ]}
                                            >
                                                {slot}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        <TouchableOpacity onPress={handleSaveSchedule} style={styles.closeBtn}>
                            <Text style={{ color: '#fff', fontWeight: '600' }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <OrderStatusOverlay status={orderStatus} orderId={confirmedOrderId ?? undefined} />

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
    orderCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    orderHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
    },
    orderHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    orderHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    removeBtn: {
        padding: 4,
    },
    orderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.text,
    },
    orderSubtitle: {
        fontSize: 13,
        color: BrandColors.mutedText,
        marginTop: 2,
    },
    orderDetails: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    serviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    serviceItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 4,
    },
    serviceQty: {
        fontSize: 14,
        color: BrandColors.mutedText,
        marginHorizontal: 12,
    },
    servicePrice: {
        fontSize: 13,
        color: BrandColors.mutedText,
    },
    serviceTotal: {
        fontSize: 15,
        fontWeight: '700',
        color: BrandColors.text,
        minWidth: 70,
        textAlign: 'right',
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
        marginTop: 8,
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
        marginBottom: 150,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
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
    sectionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: BrandColors.mutedText,
        marginBottom: 16,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    chipSelected: {
        borderColor: BrandColors.primary,
        backgroundColor: '#EFF6FF',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: BrandColors.text,
    },
    chipTextSelected: {
        color: BrandColors.primary,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 10,
        marginTop: 8,
    },
    messageInput: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 14,
        fontSize: 14,
        color: BrandColors.text,
        minHeight: 100,
    },
    dateScroll: {
        marginBottom: 20,
    },
    dateScrollContent: {
        gap: 10,
    },
    dateCard: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        minWidth: 90,
    },
    dateCardSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: BrandColors.primary,
    },
    dateDay: {
        fontSize: 13,
        fontWeight: '600',
        color: BrandColors.mutedText,
        marginBottom: 4,
    },
    dateDaySelected: {
        color: BrandColors.primary,
    },
    dateNum: {
        fontSize: 15,
        fontWeight: '700',
        color: BrandColors.text,
    },
    dateNumSelected: {
        color: BrandColors.primary,
    },
    timeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    timeSlot: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    timeSlotSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: BrandColors.primary,
    },
    timeSlotDisabled: {
        backgroundColor: '#F3F4F6',
        borderColor: '#E5E7EB',
        opacity: 0.5,
    },
    timeText: {
        fontSize: 13,
        fontWeight: '600',
        color: BrandColors.text,
    },
    timeTextSelected: {
        color: BrandColors.primary,
    },
    timeTextDisabled: {
        color: BrandColors.mutedText,
    },
    selectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    selectionCardActive: {
        borderColor: BrandColors.primary,
        backgroundColor: '#F0F9FF',
    },
    selectionCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    selectionCardText: {
        flex: 1,
    },
    selectionCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 4,
    },
    selectionCardSubtitle: {
        fontSize: 13,
        color: BrandColors.mutedText,
    },
});
