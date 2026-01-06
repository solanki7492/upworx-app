import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BrandColors } from '@/theme/colors';

type CapsuleProps = {
    text: string;
    active: boolean;
    onPress: () => void;
};

export function Capsule({ text, active, onPress }: CapsuleProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.capsule,
                { backgroundColor: active ? BrandColors.primary : '#E5E7EB' }
            ]}
        >
            <Text style={{ color: active ? '#fff' : BrandColors.text, fontWeight: '600' }}>
                {text}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    capsule: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 30,
        marginRight: 10,
    }
});