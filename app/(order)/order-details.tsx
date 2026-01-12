import { cancelBooking, fetchOrderById, rescheduleBooking } from '@/lib/services/orders';
import { OrderItem } from '@/lib/types/order';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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


export default function OrderDetailsScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [order, setOrder] = useState<OrderItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Reschedule state
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const availableDays = getNext4Days();

    useEffect(() => {
        loadOrderDetails();
    }, [id]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetchOrderById(parseInt(id));
            const foundOrder = response.data;

            if (foundOrder) {
                setOrder(foundOrder);
                // Set default date and time for reschedule
                if (foundOrder.service_date && foundOrder.service_time) {
                    const [year, month, day] = foundOrder.service_date.split('-').map(Number);
                    const serviceDate = new Date(year, month - 1, day);
                    setSelectedDate(serviceDate);

                    // Set the time directly as string (e.g., "05:30 PM")
                    setSelectedTime(foundOrder.service_time);
                }
            } else {
                setError('Order not found');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!order) return;

        try {
            setActionLoading(true);
            await cancelBooking(order.id);
            Alert.alert('Success', 'Booking cancelled successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        setCancelModalVisible(false);
                        loadOrderDetails();
                    },
                },
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to cancel booking');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRescheduleBooking = async () => {
        if (!order || !selectedTime) return;

        const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;

        try {
            setActionLoading(true);
            await rescheduleBooking(order.id, {
                date: formattedDate,
                time: selectedTime,
            });
            Alert.alert('Success', 'Booking rescheduled successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        setRescheduleModalVisible(false);
                        loadOrderDetails();
                    },
                },
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to reschedule booking');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isCancelDisabled = () => {
        if (!order) return true;
        return (
            order.cancel_by_id !== null ||
            order.order_status.slug === 'customer-denied-service' ||
            order.order_status.slug === 'completed'
        );
    };

    const canReschedule = () => {
        if (!order) return false;
        return order.assign_partner_id === null && order.cancel_by_id === null;
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

    const formatDateDisplay = (input: Date): string => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        if (
            input.getDate() === today.getDate() &&
            input.getMonth() === today.getMonth() &&
            input.getFullYear() === today.getFullYear()
        ) {
            return 'Today';
        }

        if (
            input.getDate() === tomorrow.getDate() &&
            input.getMonth() === tomorrow.getMonth() &&
            input.getFullYear() === tomorrow.getFullYear()
        ) {
            return 'Tomorrow';
        }

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[input.getDay()];
    };

    const formatDateShort = (date: Date): string => {
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    };

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                </View>
            </View>
        );
    }

    if (error || !order) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={BrandColors.danger} />
                    <Text style={styles.errorText}>{error || 'Order not found'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadOrderDetails}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
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
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Section 1 - Header */}
                <View style={styles.card}>
                    <Text style={styles.serviceTitle}>{order.cart.name}</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Booking ID:</Text>
                        <Text style={styles.value}>{order.order.order_id}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Booking Date:</Text>
                        <Text style={styles.value}>{formatDateTime(order.created_at)}</Text>
                    </View>
                </View>

                {/* Section 2 - Services Table */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Services</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Service Type</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Price/Unit</Text>
                        </View>
                        {order.cart.services.map((service, index) => (
                            <View key={service.id} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 2 }]}>{service.service}</Text>
                                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{service.qty}</Text>
                                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>₹{service.price}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Services:</Text>
                        <Text style={styles.summaryValue}>{order.cart.total_service}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Sub Total:</Text>
                        <Text style={styles.summaryValue}>₹{order.cart.total_service_price}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Service Date & Time:</Text>
                        <Text style={styles.value}>{formatDate(order.service_date)} at {formatTime(order.service_time)}</Text>
                    </View>
                </View>

                {/* Section 3 - Visiting & Inspection Notice */}
                <View style={styles.card}>
                    <View style={styles.noticeBox}>
                        <Ionicons name="information-circle" size={20} color={BrandColors.warning} />
                        <Text style={styles.noticeText}>
                            Visiting & inspection cost is 100.00 (Applicable only if the service & repair are denied by the customer after servicemen visited at the service location).
                        </Text>
                    </View>
                </View>

                {/* Section 4 - Customer Message */}
                {order.message && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Your Message</Text>
                        <Text style={styles.messageText}>{order.message}</Text>
                    </View>
                )}

                {/* Section 5 - Service Status */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Service Status</Text>
                    <View style={styles.statusContainer}>
                        <View
                            style={[
                                styles.statusBadgeLarge,
                                {
                                    backgroundColor:
                                        order.order_status.slug === 'completed'
                                            ? `${BrandColors.success}20`
                                            : order.order_status.slug === 'cancelled' ||
                                                order.order_status.slug === 'customer-denied-service'
                                                ? `${BrandColors.danger}20`
                                                : `${BrandColors.warning}20`,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusTextLarge,
                                    {
                                        color:
                                            order.order_status.slug === 'completed'
                                                ? BrandColors.success
                                                : order.order_status.slug === 'cancelled' ||
                                                    order.order_status.slug === 'customer-denied-service'
                                                    ? BrandColors.danger
                                                    : BrandColors.warning,
                                    },
                                ]}
                            >
                                {order.order_status.name}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section 6 - Address */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Service Address</Text>
                    <View style={styles.addressContainer}>
                        <View style={styles.addressRow}>
                            <Ionicons name="person-outline" size={20} color={BrandColors.primary} />
                            <Text style={styles.addressText}>{order.order.address.name}</Text>
                        </View>
                        <View style={styles.addressRow}>
                            <Ionicons name="call-outline" size={20} color={BrandColors.primary} />
                            <Text style={styles.addressText}>{'+91 ' + order.order.address.mobile_number || '-'}</Text>
                        </View>
                        {order.order.address.email && (
                            <View style={styles.addressRow}>
                                <Ionicons name="mail-outline" size={20} color={BrandColors.primary} />
                                <Text style={styles.addressText}>{order.order.address.email}</Text>
                            </View>
                        )}
                        <View style={styles.addressRow}>
                            <Ionicons name="location-outline" size={20} color={BrandColors.primary} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.addressText}>{order.order.address.address_line_1 + ", " + order.order.address.address_line_2}</Text>
                                <Text style={styles.addressText}>
                                    {order.order.address.city}
                                </Text>
                                <Text style={styles.addressText}>
                                    {order.order.address.state} - {order.order.address.pincode}
                                </Text>
                                {order.order.address.landmark && (
                                    <Text style={styles.addressText}>Landmark: {order.order.address.landmark}</Text>
                                )}
                            </View>
                        </View>
                        {order.order.address.alternative_mobile && (
                            <View style={styles.addressRow}>
                                <Ionicons name="call-outline" size={20} color={BrandColors.primary} />
                                <Text style={styles.addressText}>
                                    Alt: {order.order.address.alternative_mobile}
                                </Text>
                            </View>
                        )}
                        <View style={styles.addressTypeBadge}>
                            <Text style={styles.addressTypeText}>{order.order.address.address_type}</Text>
                        </View>
                    </View>
                </View>

                {/* Section 7 - Payment Summary */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Visiting and Inspection Cost:</Text>
                        <Text style={styles.paymentValue}>
                            {order.visiting_inspection_cost ? `₹${order.visiting_inspection_cost}` : 'Nill'}
                        </Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Repair Cost:</Text>
                        <Text style={styles.paymentValue}>
                            {order.repair_cost ? `₹${order.repair_cost}` : 'Nill'}
                        </Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Convenience Cost:</Text>
                        <Text style={styles.paymentValue}>
                            {order.convenience_cost ? `₹${order.convenience_cost}` : 'Nill'}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabelBold}>Payable Amount:</Text>
                        <Text style={styles.paymentValueBold}>
                            {order.total_price ? `₹${order.total_price}` : 'Nill'}
                        </Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Payment Mode:</Text>
                        <Text style={styles.paymentValue}>N/A</Text>
                    </View>
                </View>

                {/* Section 8 - Action Buttons */}
                <View style={styles.actionContainer}>
                    {order.cancel_by_id !== null ? (
                        <View style={styles.cancelledButton}>
                            <Text style={styles.cancelledButtonText}>Order Cancelled</Text>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton, isCancelDisabled() && styles.disabledButton]}
                                onPress={() => setCancelModalVisible(true)}
                                disabled={isCancelDisabled()}
                            >
                                <Ionicons
                                    name="close-circle-outline"
                                    size={20}
                                    color={isCancelDisabled() ? BrandColors.mutedText : BrandColors.card}
                                />
                                <Text style={[styles.actionButtonText, isCancelDisabled() && styles.disabledButtonText]}>
                                    Cancel Booking
                                </Text>
                            </TouchableOpacity>
                            {canReschedule() && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.rescheduleButton]}
                                    onPress={() => setRescheduleModalVisible(true)}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={BrandColors.card} />
                                    <Text style={styles.actionButtonText}>Reschedule</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Cancel Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={cancelModalVisible}
                onRequestClose={() => setCancelModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cancel Booking</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setCancelModalVisible(false)}
                                disabled={actionLoading}
                            >
                                <Text style={styles.modalCancelButtonText}>No, Keep It</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalConfirmButton]}
                                onPress={handleCancelBooking}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color={BrandColors.card} />
                                ) : (
                                    <Text style={styles.modalConfirmButtonText}>Yes, Cancel</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Reschedule Modal */}
            {rescheduleModalVisible && (
                <View style={styles.addressOverlay}>
                    <View style={styles.addressModal}>
                        <Text style={styles.modalTitle}>Reschedule Booking</Text>
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
                                                // Reset time selection when date changes
                                                setSelectedTime(null);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={[styles.dateDay, isSelected && styles.dateDaySelected]}>
                                                {formatDateDisplay(day)}
                                            </Text>

                                            <Text style={[styles.dateNum, isSelected && styles.dateNumSelected]}>
                                                {formatDateShort(day)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            {/* Time Slots */}
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

                        {/* Action Button */}
                        <TouchableOpacity
                            onPress={handleRescheduleBooking}
                            style={styles.closeBtn}
                            disabled={!selectedDate || !selectedTime || actionLoading}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Confirm</Text>
                            )}
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
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: BrandColors.danger,
        textAlign: 'center',
        marginTop: 16,
    },
    retryButton: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    retryText: {
        color: BrandColors.card,
        fontSize: 16,
        fontWeight: '600',
    },
    card: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    serviceTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
    value: {
        fontSize: 14,
        color: BrandColors.text,
        fontWeight: '600',
    },
    table: {
        marginTop: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: BrandColors.background,
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    tableHeaderText: {
        fontSize: 13,
        fontWeight: '700',
        color: BrandColors.text,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    tableCell: {
        fontSize: 14,
        color: BrandColors.text,
    },
    divider: {
        height: 1,
        backgroundColor: BrandColors.border,
        marginVertical: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        marginTop: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: BrandColors.mutedText,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 14,
        color: BrandColors.text,
        fontWeight: '700',
    },
    noticeBox: {
        flexDirection: 'row',
        backgroundColor: `${BrandColors.warning}10`,
        padding: 12,
        borderRadius: 8,
        gap: 12,
    },
    noticeText: {
        flex: 1,
        fontSize: 13,
        color: BrandColors.text,
        lineHeight: 20,
    },
    messageText: {
        fontSize: 14,
        color: BrandColors.text,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    statusContainer: {
        alignItems: 'flex-start',
    },
    statusBadgeLarge: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    statusTextLarge: {
        fontSize: 16,
        fontWeight: '700',
    },
    addressContainer: {
        gap: 12,
    },
    addressRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    addressText: {
        fontSize: 14,
        color: BrandColors.text,
        lineHeight: 20,
    },
    addressTypeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginTop: 4,
    },
    addressTypeText: {
        fontSize: 12,
        color: BrandColors.card,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    paymentLabel: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
    paymentValue: {
        fontSize: 14,
        color: BrandColors.text,
        fontWeight: '600',
    },
    paymentLabelBold: {
        fontSize: 16,
        color: BrandColors.text,
        fontWeight: '700',
    },
    paymentValueBold: {
        fontSize: 18,
        color: BrandColors.primary,
        fontWeight: '700',
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 10,
    },
    cancelButton: {
        backgroundColor: BrandColors.danger,
    },
    rescheduleButton: {
        backgroundColor: BrandColors.primary,
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: BrandColors.card,
    },
    disabledButton: {
        backgroundColor: BrandColors.border,
    },
    disabledButtonText: {
        color: BrandColors.mutedText,
    },
    cancelledButton: {
        flex: 1,
        backgroundColor: BrandColors.border,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelledButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: BrandColors.mutedText,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: BrandColors.card,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 12,
    },
    modalMessage: {
        fontSize: 15,
        color: BrandColors.mutedText,
        lineHeight: 22,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    modalCancelButton: {
        backgroundColor: BrandColors.background,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    modalCancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: BrandColors.text,
    },
    modalConfirmButton: {
        backgroundColor: BrandColors.danger,
    },
    modalConfirmButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: BrandColors.card,
    },
    dateTimeContainer: {
        marginBottom: 24,
        gap: 12,
    },
    dateTimeLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
        marginTop: 8,
    },
    dateTimeInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: BrandColors.background,
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    dateTimeText: {
        fontSize: 15,
        color: BrandColors.text,
        fontWeight: '600',
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
