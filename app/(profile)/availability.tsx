import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '@/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DayKey, AvailabilityState } from '@/lib/types/service';
import { getPartnerAvailability, updatePartnerAvailability } from '@/lib/services/services';

export default function AvailabilityScreen() {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState<AvailabilityState | null>(null);

    const [pickerDay, setPickerDay] = useState<DayKey | null>(null);
    const [pickerType, setPickerType] = useState<'start' | 'end' | null>(null);

    const generateTimeSlots = () => {
        const slots: string[] = [];
        let hour = 0;
        let minute = 0;

        while (hour < 24) {
            const h12 = hour % 12 === 0 ? 12 : hour % 12;
            const ampm = hour < 12 ? 'AM' : 'PM';
            const m = minute === 0 ? '00' : minute;

            slots.push(`${h12}:${m} ${ampm}`);

            minute += 30;
            if (minute === 60) {
                minute = 0;
                hour++;
            }
        }

        return slots;
    };

    const TIME_SLOTS = generateTimeSlots();

    const DAYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        loadAvailability();
    }, []);

    const loadAvailability = async () => {
        try {
            setLoading(true);
            const res = await getPartnerAvailability();
            setAvailability(res.data);
        } catch {
            Alert.alert('Error', 'Failed to load availability');
        } finally {
            setLoading(false);
        }
    };

    const updateTime = (day: DayKey, type: 'start' | 'end', value: string) => {
        setAvailability((prev) => ({
            ...prev!,
            [day]: {
                ...prev![day],
                [type]: value,
            },
        }));
    };

    const saveAvailability = async () => {
        if (!availability) return;

        try {
            await updatePartnerAvailability(availability);
            Alert.alert('Success', 'Availability updated');
        } catch {
            Alert.alert('Error', 'Failed to save availability');
        }
    };

    if (loading || !availability) {
        return (
            <View style={[styles.center, { paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Text style={styles.headerTitle}>Availability</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
                {DAYS.map((day) => (
                    <View key={day} style={styles.card}>
                        <Text style={styles.dayTitle}>{day}</Text>

                        <View style={styles.timeRow}>
                            {/* FROM */}
                            <TouchableOpacity
                                style={styles.timeField}
                                onPress={() => {
                                    setPickerDay(day);
                                    setPickerType('start');
                                }}
                            >
                                <Text style={styles.timeText}>
                                    {availability[day].start}
                                </Text>
                                <Ionicons name="time-outline" size={18} />
                            </TouchableOpacity>

                            <Text style={styles.toText}>to</Text>

                            {/* TO */}
                            <TouchableOpacity
                                style={styles.timeField}
                                onPress={() => {
                                    setPickerDay(day);
                                    setPickerType('end');
                                }}
                            >
                                <Text style={styles.timeText}>
                                    {availability[day].end}
                                </Text>
                                <Ionicons name="time-outline" size={18} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={styles.saveBtn} onPress={saveAvailability}>
                    <Text style={styles.saveText}>Save Availability</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* TIME PICKER POPOVER */}
            {(pickerDay && pickerType) && (
                <Modal transparent animationType="fade">
                    <TouchableOpacity
                        style={styles.pickerOverlay}
                        activeOpacity={1}
                        onPress={() => {
                            setPickerDay(null);
                            setPickerType(null);
                        }}
                    />

                    <View style={styles.pickerBox}>
                        <ScrollView>
                            {TIME_SLOTS.map((slot) => (
                                <TouchableOpacity
                                    key={slot}
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        updateTime(pickerDay, pickerType, slot);
                                        setPickerDay(null);
                                        setPickerType(null);
                                    }}
                                >
                                    <Text style={styles.pickerText}>{slot}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
        paddingHorizontal: 16,
    },

    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 16,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    card: {
        backgroundColor: BrandColors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },

    dayTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: BrandColors.text,
        marginBottom: 12,
    },

    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    timeField: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: BrandColors.border,
        backgroundColor: BrandColors.background,
    },

    timeText: {
        fontSize: 14,
        color: BrandColors.text,
        fontWeight: '500',
    },

    toText: {
        marginHorizontal: 10,
        color: BrandColors.mutedText,
        fontWeight: '600',
    },

    saveBtn: {
        marginTop: 20,
        marginBottom: 30,
        backgroundColor: BrandColors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },

    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    /* TIME PICKER */

    pickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },

    pickerBox: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '50%',
        backgroundColor: BrandColors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 8,
    },

    pickerItem: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: BrandColors.border,
    },

    pickerText: {
        fontSize: 16,
        color: BrandColors.text,
    },
});
