import { BrandColors } from '@/theme/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LedgersScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ledgers</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.placeholderText}>Ledgers screen coming soon...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: 16,
        backgroundColor: BrandColors.background,
    },
    header: {
        borderBottomColor: BrandColors.border,
        marginBottom: 18,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: BrandColors.text,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        fontSize: 18,
        color: BrandColors.mutedText,
    },
});