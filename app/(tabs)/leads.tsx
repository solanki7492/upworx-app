import CalendarDatePicker from '@/components/ui/calendar-date-picker';
import { useAuth } from '@/contexts/auth-context';
import { getLeads, getLeadStatuses } from '@/lib/services/leads';
import { Lead, Statuses } from '@/lib/types/lead';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LeadsScreen() {
    const insets = useSafeAreaInsets();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const [filterVisible, setFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState<{
        s?: number | 'all';
        sd?: string | null;
        ed?: string | null;
    }>({});
    const [statuses, setStatuses] = useState<Statuses[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<Statuses | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'start' | 'end' | null>(null);
    const [dropdownLayout, setDropdownLayout] = useState<{
        x: number;
        y: number;
        width: number;
    }>({ x: 0, y: 0, width: 0 });

    const dropdownRef = useRef<View>(null);

    useEffect(() => {
        loadLeads(1);
        loadStatuses();
    }, []);

    const loadLeads = async (pageNumber = 1, filters = activeFilters) => {
        if (pageNumber !== 1 && (loadingMore || !hasMore)) return;

        try {
            pageNumber === 1 ? setLoading(true) : setLoadingMore(true);
            setError(null);

            const res = await getLeads(pageNumber, filters);
            const newLeads = res.data;

            setHasMore(res.meta.current_page < res.meta.last_page);

            setLeads((prev) =>
                pageNumber === 1 ? newLeads : [...prev, ...newLeads]
            );

            setPage(pageNumber);
        } catch (err: any) {
            setError(err.message || 'Failed to load leads');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadStatuses = async () => {
        const res = await getLeadStatuses();
        setStatuses(res.data.statuses);
    };

    const applyFilters = async () => {
        const filters = {
            s: selectedStatus?.id || 'all',
            sd: startDate ? formatDate(startDate) : null,
            ed: endDate ? formatDate(endDate) : null,
        };

        setFilterVisible(false);
        setHasMore(true);
        setPage(1);
        setActiveFilters(filters as any);

        await loadLeads(1, filters as any);
    };

    const resetFilters = async () => {

        setSelectedStatus(null);
        setStartDate(null);
        setEndDate(null);

        setHasMore(true);
        setPage(1);
        setActiveFilters({} as any);

        await loadLeads(1, {});
    };


    const handleStartDatePicker = () => {
        setFilterVisible(false);
        setPickerMode('start');
        setShowStartPicker(true);
    };

    const handleEndDatePicker = () => {
        setFilterVisible(false);
        setPickerMode('end');
        setShowEndPicker(true);
    };

    const handleDatePickerClose = () => {
        setShowStartPicker(false);
        setShowEndPicker(false);
        setPickerMode(null);
        setFilterVisible(true);
    };

    const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
    };

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await loadLeads(1);
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text style={styles.headerTitle}>Leads</Text>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                </View>
            </View>
        );
    }

    if (!leads.length) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text style={styles.headerTitle}>Leads</Text>
                <View style={styles.center}>
                    <Ionicons name="briefcase-outline" size={64} color={BrandColors.mutedText} />
                    <Text style={styles.empty}>No leads available</Text>
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text style={styles.headerTitle}>Leads</Text>
                <View style={styles.center}>
                    <Text style={{ color: BrandColors.danger, fontSize: 16 }}>{error}</Text>
                    <TouchableOpacity
                        onPress={() => loadLeads(1)}
                        style={{
                            marginTop: 16,
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            backgroundColor: BrandColors.primary,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Leads</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => setFilterVisible(true)}
                    >
                        <Ionicons
                            name="filter-outline"
                            size={18}
                            color={BrandColors.primary}
                        />
                    </TouchableOpacity>

                    {(selectedStatus || startDate || endDate) && (
                        <TouchableOpacity onPress={resetFilters}>
                            <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[BrandColors.primary]}
                        tintColor={BrandColors.primary}
                    />
                }
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const paddingToBottom = 100;

                    if (
                        layoutMeasurement.height + contentOffset.y >=
                        contentSize.height - paddingToBottom
                    ) {
                        if (hasMore && !loadingMore) {
                            loadLeads(page + 1);
                        }
                    }
                }}
                scrollEventThrottle={16}
            >
                {leads.map((lead) => {
                    const status = lead.order_status.slug;
                    const address = lead.order.address_data;
                    const isAssignedToMe = lead.assign_partner_id === user?.id;

                    return (
                        <View key={lead.id} style={styles.card}>

                            {/* Header */}
                            <View style={styles.headerRow}>
                                <View>
                                    <Text style={styles.serviceName}>{lead.data.name}</Text>
                                    <Text style={styles.bookId}>#{lead.package_id}</Text>
                                </View>

                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {lead.order_status.partner_msg}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Address Block */}
                            <View style={styles.detailBlock}>
                                {/* Service Date & Time */}
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="time-outline"
                                        size={18}
                                        color={BrandColors.primary}
                                    />
                                    <Text style={styles.label}>Service Date & Time</Text>
                                </View>

                                <View style={styles.valueContainer}>
                                    <Text style={styles.value}>
                                        {lead.service_date}, {lead.service_time}
                                    </Text>
                                </View>

                                {/* Service Address */}
                                <View style={[styles.infoRow, { marginTop: 10 }]}>
                                    <Ionicons
                                        name="location-outline"
                                        size={18}
                                        color={BrandColors.primary}
                                    />
                                    <Text style={styles.label}>Service Address</Text>
                                </View>

                                {status === 'new-booking' || (!isAssignedToMe && status !== 'completed') ? (
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.value}>{address.city}</Text>
                                    </View>
                                ) : (
                                    <>
                                        <View style={styles.valueContainer}>
                                            <Text style={styles.value}>
                                                {address.address_line_1 ? address.address_line_1 + ', ' : ''}
                                                {address.address_line_2 ? address.address_line_2 + ', ' : ''}
                                                {address.city} {address.state}, Pincode-{address.pincode}
                                            </Text>
                                        </View>

                                        <View style={styles.divider} />

                                        <View style={styles.contactBox}>
                                            <View style={styles.contactRow}>
                                                <Ionicons name="person-outline" size={18} color={BrandColors.primary} />
                                                <Text style={styles.contactText}>{address.name}</Text>
                                            </View>

                                            <View style={styles.contactRow}>
                                                <Ionicons name="call-outline" size={18} color={BrandColors.primary} />
                                                <Text style={styles.contactText}>{address.mobile_number}</Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>

                            {/* Services Count */}
                            <View style={styles.row}>
                                <Ionicons
                                    name="layers-outline"
                                    size={18}
                                    color={BrandColors.mutedText}
                                />
                                <Text style={styles.text}>
                                    {lead.data.total_service} Service(s)
                                </Text>
                            </View>

                            {/* Footer */}
                            <View style={styles.footer}>
                                <Text style={styles.amount}>₹{lead.price}</Text>

                                <TouchableOpacity
                                    style={styles.acceptBtn}
                                    onPress={() => router.push({
                                        pathname: '/(lead)/lead-details',
                                        params: { id: lead.id }
                                    })}
                                >
                                    <Text style={styles.acceptText}>View Lead</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>

                        </View>
                    );
                })}
                {loadingMore && (
                    <View style={{ paddingVertical: 20 }}>
                        <ActivityIndicator size="small" color={BrandColors.primary} />
                    </View>
                )}
            </ScrollView>

            {/* Filter Modal */}
            <Modal
                visible={filterVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setFilterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filter Leads</Text>
                            <TouchableOpacity onPress={() => setFilterVisible(false)}>
                                <Ionicons name="close" size={24} color={BrandColors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Status Filter with Custom Dropdown */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Status</Text>

                                {/* Dropdown Button */}
                                <TouchableOpacity
                                    ref={dropdownRef}
                                    style={styles.dropdownButton}
                                    onPress={() => {
                                        dropdownRef.current?.measureInWindow((x, y, width, height) => {
                                            setDropdownLayout({
                                                x,
                                                y: y + height,
                                                width,
                                            });
                                            setStatusDropdownOpen(true);
                                        });
                                    }}
                                >
                                    <Text style={styles.dropdownButtonText}>
                                        {selectedStatus ? selectedStatus.name : 'All Status'}
                                    </Text>
                                    <Ionicons
                                        name={statusDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color={BrandColors.text}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Date Range Filter */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Service Date Range</Text>

                                {/* Start Date */}
                                <Text style={styles.label}>Start Date</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={handleStartDatePicker}
                                >
                                    <Text style={[
                                        styles.dateInputText,
                                        !startDate && styles.dateInputPlaceholder,
                                    ]}>
                                        {startDate ? formatDate(startDate) : 'Select start date'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={18} color={BrandColors.mutedText} />
                                </TouchableOpacity>

                                {/* End Date */}
                                <Text style={styles.label}>End Date</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={handleEndDatePicker}
                                >
                                    <Text style={[
                                        styles.dateInputText,
                                        !endDate && styles.dateInputPlaceholder,
                                    ]}>
                                        {endDate ? formatDate(endDate) : 'Select end date'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={18} color={BrandColors.mutedText} />
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <Modal
                            visible={statusDropdownOpen}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setStatusDropdownOpen(false)}
                        >
                            {/* Outside click */}
                            <TouchableOpacity
                                style={StyleSheet.absoluteFill}
                                activeOpacity={1}
                                onPress={() => setStatusDropdownOpen(false)}
                            />

                            {/* Dropdown */}
                            <View
                                style={[
                                    styles.selectDropdown,
                                    {
                                        top: dropdownLayout.y,
                                        left: dropdownLayout.x,
                                        width: dropdownLayout.width,
                                    },
                                ]}
                            >
                                <ScrollView
                                    style={{ maxHeight: 250 }}
                                    showsVerticalScrollIndicator
                                >
                                    {/* All */}
                                    <TouchableOpacity
                                        style={[
                                            styles.dropdownItem,
                                            !selectedStatus && styles.dropdownItemActive,
                                        ]}
                                        onPress={() => {
                                            setSelectedStatus(null);
                                            setStatusDropdownOpen(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.dropdownItemText,
                                                !selectedStatus && styles.dropdownItemTextActive,
                                            ]}
                                        >
                                            All Status
                                        </Text>
                                    </TouchableOpacity>

                                    {statuses.map((status) => (
                                        <TouchableOpacity
                                            key={status.id}
                                            style={[
                                                styles.dropdownItem,
                                                selectedStatus?.id === status.id &&
                                                styles.dropdownItemActive,
                                            ]}
                                            onPress={() => {
                                                setSelectedStatus(status);
                                                setStatusDropdownOpen(false);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownItemText,
                                                    selectedStatus?.id === status.id &&
                                                    styles.dropdownItemTextActive,
                                                ]}
                                            >
                                                {status.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </Modal>
                        {/* Footer Actions */}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.resetBtn}
                                onPress={resetFilters}
                            >
                                <Text style={styles.resetBtnText}>Reset</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.applyBtn}
                                onPress={applyFilters}
                            >
                                <Text style={styles.applyBtnText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Date Pickers - Closes filter modal, opens calendar, then reopens filter */}
            <CalendarDatePicker
                visible={showStartPicker && pickerMode === 'start'}
                title="Select Start Date"
                value={startDate}
                onClose={handleDatePickerClose}
                onSelect={(date) => {
                    setStartDate(date);
                    handleDatePickerClose();
                }}
            />

            <CalendarDatePicker
                visible={showEndPicker && pickerMode === 'end'}
                title="Select End Date"
                value={endDate}
                onClose={handleDatePickerClose}
                onSelect={(date) => {
                    setEndDate(date);
                    handleDatePickerClose();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 16,
        color: BrandColors.text,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    filterBtn: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
        backgroundColor: `${BrandColors.primary}15`,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterText: {
        color: BrandColors.primary,
        fontWeight: '600',
    },
    clearText: {
        color: BrandColors.danger,
        fontWeight: '600',
    },
    card: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: '700',
        color: BrandColors.text,
    },
    badge: {
        backgroundColor: `${BrandColors.primary}20`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 25,
        justifyContent: 'center',
    },
    badgeText: {
        color: BrandColors.primary,
        fontWeight: '600',
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: BrandColors.border,
        marginVertical: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginBottom: 8,
    },
    bookId: {
        fontSize: 14,
        color: BrandColors.mutedText,
    },
    detailBlock: {
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
    },
    valueContainer: {
        paddingLeft: 24,
    },
    value: {
        fontSize: 13,
        color: BrandColors.mutedText,
    },
    contactBox: {
        gap: 6,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    contactText: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
    },
    text: {
        fontSize: 14,
        color: BrandColors.text,
        flex: 1,
    },
    footer: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amount: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.primary,
    },
    acceptBtn: {
        backgroundColor: BrandColors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    acceptText: {
        color: '#fff',
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    empty: {
        marginTop: 16,
        fontSize: 16,
        color: BrandColors.mutedText,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: BrandColors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 30,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
        marginBottom: 12,
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: BrandColors.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    dropdownButtonText: {
        fontSize: 14,
        color: BrandColors.text,
        fontWeight: '500',
    },
    dropdownList: {
        marginTop: 8,
        backgroundColor: BrandColors.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
        overflow: 'hidden',
        maxHeight: 240,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },
    dropdownItemLast: {
        borderBottomWidth: 0,
    },
    dropdownItemActive: {
        backgroundColor: `${BrandColors.primary}10`,
    },
    dropdownItemText: {
        fontSize: 14,
        color: BrandColors.text,
        fontWeight: '500',
    },
    dropdownItemTextActive: {
        color: BrandColors.primary,
        fontWeight: '600',
    },
    dateInputWrapper: {
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 14,
        color: BrandColors.mutedText,
        marginBottom: 8,
    },
    dateInputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: BrandColors.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    dateText: {
        flex: 1,
        fontSize: 14,
        color: BrandColors.text,
    },
    datePlaceholder: {
        color: BrandColors.mutedText,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    resetBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: BrandColors.card,
        borderWidth: 1,
        borderColor: BrandColors.border,
        alignItems: 'center',
    },
    resetBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: BrandColors.text,
    },
    applyBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: BrandColors.primary,
        alignItems: 'center',
    },
    applyBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: BrandColors.card,
        marginBottom: 12,
    },
    dateInputText: {
        fontSize: 14,
        color: BrandColors.text,
    },
    dateInputPlaceholder: {
        color: BrandColors.mutedText,
    },
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    dropdownPopup: {
        width: '85%',
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        paddingVertical: 8,
        elevation: 10, // Android
        shadowColor: '#000', // iOS
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    selectDropdown: {
        position: 'absolute',
        backgroundColor: BrandColors.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
        zIndex: 9999,

        // Shadow
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },

});