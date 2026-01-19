import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

type PaymentMode = 'Cash' | 'Online';

interface Props {
    value: PaymentMode;
    onChange: (value: PaymentMode) => void;
}

export default function PaymentModeDropdown({ value, onChange }: Props) {
    const [open, setOpen] = useState(false);

    const options: PaymentMode[] = ['Cash', 'Online'];

    return (
        <View style={styles.wrapper}>
            {/* Select Box */}
            <Pressable
                style={[
                    styles.selectBox,
                    open && styles.selectBoxActive,
                ]}
                onPress={() => setOpen(prev => !prev)}
            >
                <Text style={styles.selectText}>{value}</Text>
                <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={BrandColors.mutedText}
                />
            </Pressable>

            {/* Dropdown */}
            {open && (
                <View style={styles.dropdown}>
                    {options.map(option => (
                        <Pressable
                            key={option}
                            style={[
                                styles.option,
                                value === option && styles.activeOption,
                            ]}
                            onPress={() => {
                                onChange(option);
                                setOpen(false);
                            }}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    value === option && styles.activeText,
                                ]}
                            >
                                {option}
                            </Text>

                            {value === option && (
                                <Ionicons
                                    name="checkmark"
                                    size={18}
                                    color={BrandColors.primary}
                                />
                            )}
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        zIndex: 10, // IMPORTANT
    },
    selectBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 50,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 8,
        backgroundColor: BrandColors.card,
    },
    selectBoxActive: {
        borderColor: BrandColors.primary,
    },
    selectText: {
        fontSize: 14,
        color: BrandColors.text,
        fontWeight: '500',
    },
    dropdown: {
        position: 'absolute',
        top: 54,
        left: 0,
        right: 0,
        backgroundColor: BrandColors.card,
        borderWidth: 1,
        borderColor: BrandColors.border,
        borderRadius: 8,
        elevation: 6, // Android shadow
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: BrandColors.border,
    },
    activeOption: {
        backgroundColor: `${BrandColors.primary}10`,
    },
    optionText: {
        fontSize: 14,
        color: BrandColors.text,
    },
    activeText: {
        fontWeight: '700',
        color: BrandColors.primary,
    },
});
