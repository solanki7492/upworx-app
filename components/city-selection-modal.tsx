import { StorageService } from '@/lib';
import { BrandColors } from '@/theme/colors';
import React from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2;

interface City {
    id: string;
    name: string;
    value: string;
    image?: any;
}

const CITIES: City[] = [
    { id: '1', name: 'Bareilly', value: 'bareilly', image: require('@/assets/images/cities/bareilly-city.webp') },
    { id: '2', name: 'Kanpur', value: 'kanpur', image: require('@/assets/images/cities/kanpur-city.webp') },
    { id: '3', name: 'Moradabad', value: 'moradabad', image: require('@/assets/images/cities/moradabad-city.webp') },
];

interface CitySelectionModalProps {
    visible: boolean;
    onCitySelect: (city: string) => void;
}

export function CitySelectionModal({ visible, onCitySelect }: CitySelectionModalProps) {
    const handleCitySelect = async (city: City) => {
        try {
            await StorageService.setSelectedCity(city.value);
            onCitySelect(city.name);
        } catch (error) {
            console.error('Error saving city:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Select Your City</Text>
                    <Text style={styles.subtitle}>
                        Choose your city to get started
                    </Text>

                    <View style={styles.citiesContainer}>
                        {CITIES.map((city) => (
                            <TouchableOpacity
                                key={city.id}
                                style={[styles.cityCard, { width: CARD_WIDTH }]}
                                onPress={() => handleCitySelect(city)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.imageWrapper}>
                                    <Image
                                        source={city.image}
                                        style={styles.cityImage}
                                    />
                                </View>
                                <Text style={styles.cityText}>{city.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: BrandColors.background,
        borderRadius: 20,
        padding: 24,
        width: width - 40,
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: BrandColors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
    },
    citiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    cityCard: {
        alignItems: 'center',
        padding: 14,
        backgroundColor: '#DDF6FA',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: BrandColors.border,
    },
    imageWrapper: {
        width: 84,
        height: 84,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cityImage: {
        width: 120,
        height: 90,
        resizeMode: 'contain',
    },
    cityText: {
        fontSize: 14,
        fontWeight: '600',
        color: BrandColors.text,
        textAlign: 'center',
    },
});
