import { useCart } from '@/contexts/cart-context';
import { getAddresses } from '@/lib/services/address';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function CartScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { items, updateQty: updateCartQty, totalPrice, categorySlug, bookingDetails, setBookingDetails } = useCart();
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
    const [showAddressList, setShowAddressList] = useState(false);

    // Modal states
    const [showProblemModal, setShowProblemModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    // Problem / Message state
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const [message, setMessage] = useState('');

    // Schedule state
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const availableDays = getNext4Days();

    const updateQty = (id: number, delta: number) => {
        updateCartQty(id, delta);
    };

    const total = totalPrice;

    const toggleProblem = (problem: string) => {
        setSelectedProblems(prev =>
            prev.includes(problem)
                ? prev.filter(p => p !== problem)
                : [...prev, problem]
        );
    };

    const isTimeSlotDisabled = (timeSlot: string): boolean => {
        // Only disable if selected date is today
        const today = new Date();
        const isToday =
            selectedDate.getDate() === today.getDate() &&
            selectedDate.getMonth() === today.getMonth() &&
            selectedDate.getFullYear() === today.getFullYear();

        if (!isToday) return false;

        // Parse time slot
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

    const formatDate = (date: Date): string => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        ) {
            return 'Today';
        } else if (
            date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear()
        ) {
            return 'Tomorrow';
        } else {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days[date.getDay()];
        }
    };

    const formatDateShort = (date: Date): string => {
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    };

    const handleConfirmBooking = async () => {
        if (!selectedAddress) {
            alert('Please select a delivery address');
            return;
        }

        if (selectedProblems.length === 0) {
            alert('Please select at least one problem');
            return;
        }

        if (!selectedDate || !selectedTime) {
            alert('Please select service date and time');
            return;
        }

        // Save booking details to AsyncStorage
        await setBookingDetails({
            problems: selectedProblems,
            message: message,
            serviceDate: selectedDate.toISOString().split('T')[0],
            serviceTime: selectedTime,
            address: selectedAddress.address,
        });

        const payload = {
            cart_items: items,
            address_id: selectedAddress.id,
            problems: selectedProblems,
            message: message,
            service_date: selectedDate.toISOString().split('T')[0],
            service_time: selectedTime,
        };

        console.log('Booking Payload:', payload);
        // TODO: Call booking API here
        alert('Booking confirmed! Check console for payload.');
    };

    // Get problems for current category
    const currentProblems = categorySlug
        ? problemOptions[categorySlug as string] || []
        : [];

    useEffect(() => {
        const loadAddresses = async () => {
            const data = await getAddresses();
            setAddresses(data);

            const defaultAddr = data.find(a => a.default_address === 1);
            setSelectedAddress(defaultAddr || data[0]);
        };

        loadAddresses();
    }, []);

    // Load saved booking details
    useEffect(() => {
        if (bookingDetails) {
            setSelectedProblems(bookingDetails.problems);
            setMessage(bookingDetails.message);
            setSelectedDate(new Date(bookingDetails.serviceDate));
            setSelectedTime(bookingDetails.serviceTime);
        }
    }, [bookingDetails]);

    const handleSaveProblems = () => {
        setShowProblemModal(false);
    };

    const handleSaveSchedule = () => {
        if (!selectedDate || !selectedTime) {
            alert('Please select both date and time');
            return;
        }
        setShowScheduleModal(false);
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

                        {/* Problem / Message Section - Clickable Card */}
                        {currentProblems.length > 0 && (
                            <TouchableOpacity
                                style={styles.selectionCard}
                                activeOpacity={0.7}
                                onPress={() => setShowProblemModal(true)}
                            >
                                <View style={styles.selectionCardLeft}>
                                    <Ionicons name="alert-circle-outline" size={24} color={BrandColors.primary} />
                                    <View style={styles.selectionCardText}>
                                        <Text style={styles.selectionCardTitle}>What's the Problem?</Text>
                                        <Text style={styles.selectionCardSubtitle}>
                                            {selectedProblems.length > 0
                                                ? `${selectedProblems.length} problem${selectedProblems.length > 1 ? 's' : ''} selected`
                                                : 'Tap to select problems'}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                            </TouchableOpacity>
                        )}

                        {/* Schedule Service Section - Clickable Card */}
                        <TouchableOpacity
                            style={styles.selectionCard}
                            activeOpacity={0.7}
                            onPress={() => setShowScheduleModal(true)}
                        >
                            <View style={styles.selectionCardLeft}>
                                <Ionicons name="calendar-outline" size={24} color={BrandColors.primary} />
                                <View style={styles.selectionCardText}>
                                    <Text style={styles.selectionCardTitle}>Schedule Service</Text>
                                    <Text style={styles.selectionCardSubtitle}>
                                        {selectedDate && selectedTime
                                            ? `${formatDate(selectedDate)}, ${selectedTime}`
                                            : 'Tap to select date & time'}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
                        </TouchableOpacity>

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
            {showProblemModal && currentProblems.length > 0 && (
                <View style={styles.addressOverlay}>
                    <View style={styles.addressModal}>
                        <Text style={styles.modalTitle}>What's the Problem?</Text>
                        <Text style={styles.sectionSubtitle}>Select all that apply</Text>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.chipsContainer}>
                                {currentProblems.map((problem, index) => {
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
            )}

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
