import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ServiceRowProps = {
    service: {
        name: string;
        price: number;
    };
    selected: boolean;
    onToggle: () => void;
};

export function ServiceRow({ service, selected, onToggle }: ServiceRowProps) {
    return (
        <TouchableOpacity onPress={onToggle} style={styles.row}>
            <View style={styles.content}>
                <Text style={styles.name}>{service.name}</Text>
                <Text style={styles.price}>
                ₹ {(service.price ?? 0).toLocaleString()}
                </Text>
            </View>

            <View style={[
                styles.checkbox,
                { backgroundColor: selected ? BrandColors.primary : '#fff', borderColor: selected ? BrandColors.primary : '#D1D5DB' }
            ]}>
                {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    content: {
        flex: 1,
    },
    name: {
        fontWeight: '600',
        fontSize: 15,
        color: BrandColors.text,
        marginBottom: 4,
    },
    price: {
        color: BrandColors.mutedText,
        fontSize: 14,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
