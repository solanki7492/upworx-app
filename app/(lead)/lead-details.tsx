import { useAuth } from '@/contexts/auth-context';
import { acceptLead, cancelLead, completeLead, CompleteLeadRequest, getLeadDetails } from '@/lib/services/leads';
import { Lead } from '@/lib/types/lead';
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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PaymentModeSelect from '@/components/ui/payment-mode-select';

export default function LeadDetailsScreen() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const { user } = useAuth();

    // Modal states
    const [acceptModalVisible, setAcceptModalVisible] = useState(false);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [completeModalVisible, setCompleteModalVisible] = useState(false);

    // Complete form states
    const [serviceType, setServiceType] = useState<'complete' | 'customer'>('complete');
    const [paymentMode, setPaymentMode] = useState<'Cash' | 'Online'>('Cash');
    const [visitingCost, setVisitingCost] = useState('100');
    const [repairCost, setRepairCost] = useState('');
    const [convenienceCost, setConvenienceCost] = useState('');
    const [completeLoading, setCompleteLoading] = useState(false);

    useEffect(() => {
        loadLeadDetails();
    }, [id]);

    const loadLeadDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getLeadDetails(parseInt(id));

            if (response.status && response.data) {
                setLead(response.data);
            } else {
                setError('Lead not found');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load lead details');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptLead = async () => {
        if (!lead) return;

        try {
            setAcceptLoading(true);
            const response = await acceptLead(lead.id);

            if (response.status) {
                console.log('Lead accepted successfully');
                setAcceptModalVisible(false);
                loadLeadDetails();
            } else {
                Alert.alert('Error', response.message || 'Failed to accept lead');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'An error occurred while accepting lead');
        } finally {
            setAcceptLoading(false);
        }
    };

    const handleCancelLead = async () => {
        if (!lead) return;

        try {
            setAcceptLoading(true);
            const response = await cancelLead(lead.id);

            if (response.status) {
                console.log('Lead cancellled Successfully');
                setCancelModalVisible(false);
                loadLeadDetails();
            } else {
                Alert.alert('Error', response.message || 'Failed to cancel lead');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'An error occurred while cancelling lead');
        } finally {
            setAcceptLoading(false);
        }
    };

    const calculateReceivableAmount = () => {
        const servicePrice = lead?.data.total_service_price || 0;
        const visiting = parseFloat(visitingCost) || 0;
        const repair = parseFloat(repairCost) || 0;
        const convenience = parseFloat(convenienceCost) || 0;

        if (serviceType === 'customer') {
            return visiting;
        }

        return servicePrice + visiting + repair + convenience;
    };

    const handleCompleteLead = async () => {
        if (!lead) return;

        // Validation
        if (!visitingCost || parseFloat(visitingCost) < 0) {
            Alert.alert('Error', 'Please enter a valid visiting & inspection cost');
            return;
        }

        if (serviceType === 'complete') {
            if (!repairCost || parseFloat(repairCost) < 0) {
                Alert.alert('Error', 'Please enter a valid repair cost');
                return;
            }
            if (!convenienceCost || parseFloat(convenienceCost) < 0) {
                Alert.alert('Error', 'Please enter a valid convenience cost');
                return;
            }
        }

        try {
            setCompleteLoading(true);

            const requestData: CompleteLeadRequest = {
                service: serviceType,
                payment_status: paymentMode,
                visiting_cost: parseFloat(visitingCost),
            };

            if (serviceType === 'complete') {
                requestData.repair_cost = parseFloat(repairCost);
                requestData.convenience_cost = parseFloat(convenienceCost);
            }

            const response = await completeLead(lead.id, requestData);

            if (response.success) {
                console.log('Lead completed successfully');
                setCompleteModalVisible(false);
                loadLeadDetails();
            } else {
                Alert.alert('Error', response.message || 'Failed to complete lead');
            }
        } catch (err: any) {
            Alert.alert('Error', err.message || 'An error occurred while completing lead');
        } finally {
            setCompleteLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        // If date is already formatted like "13 Jan 2026"
        if (dateString.includes(' ')) {
            return dateString;
        }

        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        // If time is already formatted like "07:30 PM"
        if (timeString.includes('AM') || timeString.includes('PM')) {
            return timeString;
        }

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

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lead Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                </View>
            </View>
        );
    }

    if (error || !lead) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lead Details</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={BrandColors.danger} />
                    <Text style={styles.errorText}>{error || 'Lead not found'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadLeadDetails}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const cancelledByCustomer = !!lead.cancel_by_id;
    const partnerJob = lead.partner_job;
    const orderStatus = lead.order_status;
    const canAccept = user?.is_able_to_accept_lead === true;
    const pcidMismatch = lead.pcid !== user?.id;

    // Accept button
    const showAccept =
        !cancelledByCustomer &&
        (
            (
                partnerJob &&
                orderStatus &&
                orderStatus.slug !== 'cancelled' &&
                canAccept &&
                (
                    (
                        partnerJob.status === 'new-booking' &&
                        partnerJob.partner_id === user?.id
                    ) ||
                    (
                        pcidMismatch &&
                        partnerJob.status === 'cancelled' &&
                        partnerJob.partner_id !== user?.id
                    )
                )
            ) ||
            (
                !partnerJob &&
                orderStatus &&
                orderStatus.slug !== 'cancelled' &&
                canAccept
            )
        );

    // Cancel button
    const showCancel =
        partnerJob &&
        partnerJob.status === 'accepted' &&
        partnerJob.partner_id === user?.id;

    // Cancel enabled/disabled
    const cancelEnabled =
        orderStatus &&
        (orderStatus.slug === 'accepted' || orderStatus.slug === 'rescheduled');

    // Footer visibility
    const showFooter =
        cancelledByCustomer || showAccept || showCancel;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lead Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Section 1 - Header */}
                <View style={styles.card}>
                    <Text style={styles.serviceTitle}>{lead.data.name}</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Order ID:</Text>
                        <Text style={styles.value}>{lead.order.order_id}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Booking Date:</Text>
                        <Text style={styles.value}>{formatDateTime(lead.created_at)}</Text>
                    </View>
                    {lead.order_status && (
                        <View style={styles.statusContainer}>
                            <View
                                style={[
                                    styles.statusBadgeLarge,
                                    { backgroundColor: `${BrandColors.primary}20` },
                                ]}
                            >
                                <Text style={[styles.statusTextLarge, { color: BrandColors.primary }]}>
                                    {lead.order_status.partner_msg}
                                </Text>
                            </View>
                        </View>
                    )}
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
                        {lead.data.services.map((service, index) => (
                            <View key={`${lead.id}-${service.id}-${index}`} style={styles.tableRow}>
                                <View style={{ flex: 2 }}>
                                    <Text style={styles.tableCell}>{service.service}</Text>
                                    {service.l2 && (
                                        <Text style={styles.tableCellSmall}>{service.l2}</Text>
                                    )}
                                    {service.l3 && (
                                        <Text style={styles.tableCellSmall}>{service.l3}</Text>
                                    )}
                                </View>
                                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{service.qty}</Text>
                                <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>₹{service.price}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Services:</Text>
                        <Text style={styles.summaryValue}>{lead.data.total_service}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Sub Total:</Text>
                        <Text style={styles.summaryValue}>₹{lead.data.total_service_price}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Service Date & Time:</Text>
                        <Text style={styles.value}>
                            {formatDate(lead.service_date)} at {formatTime(lead.service_time)}
                        </Text>
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
                {lead.message && (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Customer Message</Text>
                        <Text style={styles.messageText}>{lead.message}</Text>
                    </View>
                )}

                {/* Section 5 - Address */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Service Address</Text>

                    {(() => {
                        const status = lead.order_status.slug;
                        const address = lead.order.address_data;
                        const isAssignedToMe = lead.assign_partner_id === user?.id;

                        return (
                            <View style={styles.addressContainer}>

                                {/* Name */}
                                {(status === 'new-booking' || (!isAssignedToMe && status !== 'completed')) ? null : (
                                    <View style={styles.addressRow}>
                                        <Ionicons name="person-outline" size={20} color={BrandColors.primary} />
                                        <Text style={styles.addressText}>{address.name}</Text>
                                    </View>
                                )}

                                {/* Phone */}
                                {(status === 'new-booking' || (!isAssignedToMe && status !== 'completed')) ? null : (
                                    <View style={styles.addressRow}>
                                        <Ionicons name="call-outline" size={20} color={BrandColors.primary} />
                                        <Text style={styles.addressText}>
                                            {'+91 ' + address.mobile_number}
                                        </Text>
                                    </View>
                                )}

                                {/* Address */}
                                <View style={styles.addressRow}>
                                    <Ionicons name="location-outline" size={20} color={BrandColors.primary} />
                                    <View style={{ flex: 1 }}>
                                        {status === 'new-booking' || (!isAssignedToMe && status !== 'completed') ? (
                                            <Text style={styles.addressText}>{address.city}</Text>
                                        ) : (
                                            <>
                                                <Text style={styles.addressText}>
                                                    {address.address_line_1}
                                                    {address.address_line_2 && ', ' + address.address_line_2}
                                                </Text>
                                                <Text style={styles.addressText}>{address.city}</Text>
                                                <Text style={styles.addressText}>
                                                    {address.state} - {address.pincode}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </View>

                                {/* Address Type */}
                                <View style={styles.addressTypeBadge}>
                                    <Text style={styles.addressTypeText}>{address.address_type}</Text>
                                </View>

                            </View>
                        );
                    })()}
                </View>

                {/* Section 6 - Payment Summary */}
                <View style={styles.paymentCard}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Visiting and Inspection Cost:</Text>
                        <Text style={styles.paymentValue}>
                            {lead.visiting_inspection_cost ? `₹${lead.visiting_inspection_cost}` : 'Nill'}
                        </Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Repair Cost:</Text>
                        <Text style={styles.paymentValue}>
                            {lead.repair_cost ? `₹${lead.repair_cost}` : 'Nill'}
                        </Text>
                    </View>
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Convenience Cost:</Text>
                        <Text style={styles.paymentValue}>
                            {lead.convenience_cost ? `₹${lead.convenience_cost}` : 'Nill'}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabelBold}>Payable Amount:</Text>
                        <Text style={styles.paymentValueBold}>
                            {lead.total_price ? `₹${lead.total_price}` : `₹${lead.price}`}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Accept Button */}
            {showFooter && (
                <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 16 }]}>

                    {cancelledByCustomer && (
                        <TouchableOpacity
                            style={[styles.acceptButton, { backgroundColor: BrandColors.danger }]}
                            disabled
                        >
                            <Text style={styles.acceptButtonText}>Lead cancelled by customer</Text>
                        </TouchableOpacity>
                    )}

                    {showAccept && (
                        <TouchableOpacity
                            style={[styles.acceptButton, acceptLoading && styles.disabledButton]}
                            onPress={() => setAcceptModalVisible(true)}
                            disabled={acceptLoading}
                        >
                            <Ionicons name="checkmark-circle-outline" size={24} color={BrandColors.card} />
                            <Text style={styles.acceptButtonText}>Accept</Text>
                        </TouchableOpacity>
                    )}

                    {showCancel && (
                        <View style={{ gap: 12 }}>
                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={() => setCompleteModalVisible(true)}
                            >
                                <Ionicons name="checkmark-done-outline" size={24} color={BrandColors.card} />
                                <Text style={styles.acceptButtonText}>Complete</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.acceptButton,
                                    { backgroundColor: BrandColors.danger },
                                    !cancelEnabled && styles.disabledButton,
                                ]}
                                onPress={() => setCancelModalVisible(true)}
                                disabled={!cancelEnabled}
                            >
                                <Ionicons name="close-circle-outline" size={24} color={BrandColors.card} />
                                <Text style={styles.acceptButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Accept Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={acceptModalVisible}
                onRequestClose={() => setAcceptModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Are you sure?</Text>
                        <Text style={styles.modalMessage}>
                            You want to accept this order for ₹{lead?.token || 40} (Token money amount)
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setAcceptModalVisible(false)}
                                disabled={acceptLoading}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalConfirmButton]}
                                onPress={handleAcceptLead}
                                disabled={acceptLoading}
                            >
                                {acceptLoading ? (
                                    <ActivityIndicator size="small" color={BrandColors.card} />
                                ) : (
                                    <Text style={styles.modalConfirmButtonText}>OK</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Cancel Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={cancelModalVisible}
                onRequestClose={() => setCancelModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Are you sure?</Text>
                        <Text style={styles.modalMessage}>
                            You want to cancel this lead?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setCancelModalVisible(false)}
                                disabled={acceptLoading}
                            >
                                <Text style={styles.modalCancelButtonText}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalConfirmButton]}
                                onPress={handleCancelLead}
                                disabled={acceptLoading}
                            >
                                {acceptLoading ? (
                                    <ActivityIndicator size="small" color={BrandColors.card} />
                                ) : (
                                    <Text style={styles.modalConfirmButtonText}>Yes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Complete Lead Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={completeModalVisible}
                onRequestClose={() => setCompleteModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.completeModalContent, { paddingBottom: insets.bottom + 16 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Complete Lead</Text>
                            <TouchableOpacity onPress={() => setCompleteModalVisible(false)}>
                                <Ionicons name="close" size={24} color={BrandColors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Service Type Selection */}
                            <Text style={styles.inputLabel}>Service Status</Text>

                            <TouchableOpacity
                                style={[
                                    styles.radioOption,
                                    serviceType === 'customer' && styles.radioOptionSelected,
                                ]}
                                onPress={() => setServiceType('customer')}
                            >
                                <View style={styles.radioCircle}>
                                    {serviceType === 'customer' && <View style={styles.radioCircleSelected} />}
                                </View>
                                <Text style={styles.radioText}>Customer Denied the service</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.radioOption,
                                    serviceType === 'complete' && styles.radioOptionSelected,
                                ]}
                                onPress={() => setServiceType('complete')}
                            >
                                <View style={styles.radioCircle}>
                                    {serviceType === 'complete' && <View style={styles.radioCircleSelected} />}
                                </View>
                                <Text style={styles.radioText}>Service completed successfully</Text>
                            </TouchableOpacity>

                            {/* Visiting & Inspection Cost */}
                            <Text style={styles.inputLabel}>Visiting & Inspection Cost</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter visiting cost"
                                keyboardType="numeric"
                                value={visitingCost}
                                onChangeText={setVisitingCost}
                            />

                            {/* Show repair and convenience fields only for completed service */}
                            {serviceType === 'complete' && (
                                <>
                                    <Text style={styles.inputLabel}>Repair Cost</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter repair cost"
                                        keyboardType="numeric"
                                        value={repairCost}
                                        onChangeText={setRepairCost}
                                    />

                                    <Text style={styles.inputLabel}>Convenience Cost</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter convenience cost"
                                        keyboardType="numeric"
                                        value={convenienceCost}
                                        onChangeText={setConvenienceCost}
                                    />
                                </>
                            )}

                            {/* Payment Mode */}
                            <Text style={styles.inputLabel}>Payment Mode</Text>
                            <PaymentModeSelect
                                value={paymentMode}
                                onChange={setPaymentMode}
                            />

                                {/* Receivable Amount */}
                                <View style={styles.receivableContainer}>
                                    <Text style={styles.receivableLabel}>Receivable Amount</Text>
                                    <Text style={styles.receivableAmount}>₹{calculateReceivableAmount()}</Text>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.formActions}>
                                    <TouchableOpacity
                                        style={[styles.formButton, styles.formCancelButton]}
                                        onPress={() => setCompleteModalVisible(false)}
                                        disabled={completeLoading}
                                    >
                                        <Text style={styles.formCancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.formButton, styles.formSubmitButton]}
                                        onPress={handleCompleteLead}
                                        disabled={completeLoading}
                                    >
                                        {completeLoading ? (
                                            <ActivityIndicator size="small" color={BrandColors.card} />
                                        ) : (
                                            <Text style={styles.formSubmitButtonText}>Submit</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                        </ScrollView>
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
    backButton: {
        padding: 8,
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
        gap: 16,
    },
    errorText: {
        fontSize: 16,
        color: BrandColors.danger,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
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
        marginTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    serviceTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 16,
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
        fontWeight: '600',
        color: BrandColors.text,
    },
    statusContainer: {
        marginTop: 12,
        alignItems: 'flex-start',
    },
    statusBadgeLarge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusTextLarge: {
        fontSize: 14,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 12,
    },
    table: {
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: BrandColors.background,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    tableHeaderText: {
        fontSize: 14,
        fontWeight: '700',
        color: BrandColors.text,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    tableCell: {
        fontSize: 14,
        color: BrandColors.text,
    },
    tableCellSmall: {
        fontSize: 12,
        color: BrandColors.mutedText,
        marginTop: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    summaryLabel: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
    },
    divider: {
        height: 1,
        backgroundColor: BrandColors.border,
        marginVertical: 12,
    },
    noticeBox: {
        flexDirection: 'row',
        gap: 12,
        padding: 12,
        backgroundColor: `${BrandColors.warning}10`,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: BrandColors.warning,
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
        flex: 1,
    },
    addressTypeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: BrandColors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 8,
    },
    addressTypeText: {
        fontSize: 12,
        fontWeight: '600',
        color: BrandColors.primary,
        textTransform: 'capitalize',
    },
    paymentCard: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        marginBottom: 30,
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
    paymentValue: {
        fontSize: 14,
        color: BrandColors.text,
    },
    paymentLabelBold: {
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.text,
    },
    paymentValueBold: {
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.primary,
    },
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: BrandColors.card,
        paddingHorizontal: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: BrandColors.border,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
        elevation: 8,
    },
    acceptButton: {
        backgroundColor: BrandColors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    acceptButtonText: {
        color: BrandColors.card,
        fontSize: 18,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    modalContent: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
    },
    modalMessage: {
        fontSize: 16,
        color: BrandColors.text,
        marginBottom: 24,
        lineHeight: 24,
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
    },
    modalCancelButton: {
        backgroundColor: BrandColors.background,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    modalCancelButtonText: {
        color: BrandColors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    modalConfirmButton: {
        backgroundColor: BrandColors.primary,
    },
    modalConfirmButtonText: {
        color: BrandColors.card,
        fontSize: 16,
        fontWeight: '600',
    },
    completeModalContent: {
        backgroundColor: BrandColors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        width: '100%',
        maxHeight: '90%',
        position: 'absolute',
        bottom: 0,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: BrandColors.background,
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: BrandColors.text,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: BrandColors.background,
        borderRadius: 8,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    radioOptionSelected: {
        borderColor: BrandColors.primary,
        backgroundColor: `${BrandColors.primary}10`,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: BrandColors.border,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: BrandColors.primary,
    },
    radioText: {
        fontSize: 16,
        color: BrandColors.text,
        flex: 1,
    },
    pickerContainer: {
        backgroundColor: BrandColors.background,
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: BrandColors.text,
    },
    receivableContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: `${BrandColors.primary}10`,
        borderRadius: 8,
        marginTop: 16,
    },
    receivableLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.text,
    },
    receivableAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: BrandColors.primary,
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    formButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    formCancelButton: {
        backgroundColor: BrandColors.background,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    formCancelButtonText: {
        color: BrandColors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    formSubmitButton: {
        backgroundColor: BrandColors.primary,
    },
    formSubmitButtonText: {
        color: BrandColors.card,
        fontSize: 16,
        fontWeight: '600',
    },
});
