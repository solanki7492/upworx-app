import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { BrandColors } from '@/theme/colors';

type Props = {
    visible: boolean;
    title: string;
    value?: Date | null;
    onClose: () => void;
    onSelect: (date: Date) => void;
};

export default function CalendarDatePicker({
    visible,
    title,
    value,
    onClose,
    onSelect,
}: Props) {
    const selectedDate = value
        ? value.toISOString().split('T')[0]
        : undefined;

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <Text style={styles.title}>{title}</Text>

                    <Calendar
                        onDayPress={(day) => {
                            onSelect(new Date(day.dateString));
                            onClose();
                        }}
                        markedDates={
                            selectedDate
                                ? {
                                      [selectedDate]: {
                                          selected: true,
                                          selectedColor: BrandColors.primary,
                                      },
                                  }
                                : {}
                        }
                        theme={{
                            backgroundColor: BrandColors.card,
                            calendarBackground: BrandColors.card,
                            textSectionTitleColor: BrandColors.mutedText,
                            selectedDayBackgroundColor: BrandColors.primary,
                            selectedDayTextColor: '#fff',
                            todayTextColor: BrandColors.primary,
                            dayTextColor: BrandColors.text,
                            arrowColor: BrandColors.primary,
                            monthTextColor: BrandColors.text,
                            textDayFontWeight: '500',
                            textMonthFontWeight: '700',
                        }}
                    />

                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={onClose}
                    >
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: BrandColors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: BrandColors.text,
    },
    closeBtn: {
        marginTop: 10,
        alignSelf: 'center',
        paddingVertical: 10,
    },
    closeText: {
        color: BrandColors.primary,
        fontWeight: '600',
    },
});
