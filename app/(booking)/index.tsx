import { Capsule } from '@/components/booking/capsule';
import { ServiceRow } from '@/components/booking/service-row';
import { SkeletonCapsule } from '@/components/booking/skeleton-capsule';
import CartBar from '@/components/cart-bar';
import { useCart } from '@/contexts/cart-context';
import { getCapacities, getServices, getType } from '@/lib/services/booking';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingScreen() {
    const { slug, serviceName, city } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { addItem, removeItem, items: cartItems } = useCart();

    const [types, setTypes] = useState<any[]>([]);
    const [capacities, setCapacities] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);

    const [loadingTypes, setLoadingTypes] = useState(true);
    const [loadingCapacities, setLoadingCapacities] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);

    const [selectedType, setSelectedType] = useState<any>(null);
    const [selectedCapacity, setSelectedCapacity] = useState<any>(null);

    useEffect(() => {
        loadBooking(city as string, slug as string);
    }, []);

    const loadBooking = async (city: string, slug: string) => {
        setLoadingTypes(true);
        const res = await getType(city, slug);
        setTypes(res.types);
        setLoadingTypes(false);
    };

    const handleTypeSelect = async (type: any) => {
        setSelectedType(type);
        setSelectedCapacity(null);
        setServices([]);

        if (type.has_capacity) {
            setLoadingCapacities(true);
            const data = await getCapacities(type.id);
            setCapacities(data.capacities);
            setLoadingCapacities(false);
        } else {
            setLoadingServices(true);
            const data = await getServices(type.id, city as string);
            setServices(data.services);
            setLoadingServices(false);
        }
    }

    const handleCapacitySelect = async (capacity: any) => {
        setSelectedCapacity(capacity);

        setLoadingServices(true);
        const data = await getServices(capacity.id, city as string);
        setServices(data.services);
        setLoadingServices(false);
    };

    const toggleService = (service: any) => {
        const exists = cartItems.find(i => i.id === service.id);
        if (exists) {
            removeItem(service.id);
        } else {
            addItem({ ...service, categorySlug: slug as string });
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>

                <Text style={styles.heading}>
                    {serviceName} in {city ? city[0].toLocaleUpperCase() + city.slice(1) : ''}
                </Text>
            </View>

            {/* TYPES */}
            <Text style={styles.title}>Select Type</Text>
            <View style={styles.horizontalScrollContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {loadingTypes ? (
                        <>
                            <SkeletonCapsule />
                            <SkeletonCapsule />
                            <SkeletonCapsule />
                        </>
                    ) : (
                        types.map(t => (
                            <Capsule
                                key={t.id}
                                text={t.name}
                                active={selectedType?.id === t.id}
                                onPress={() => handleTypeSelect(t)}
                            />
                        ))
                    )}
                </ScrollView>
            </View>

            {/* CAPACITY */}
            {selectedType?.has_capacity && (
                <>
                    <Text style={styles.title}>Select Capacity</Text>
                    <View style={styles.horizontalScrollContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {loadingCapacities ? (
                                <>
                                    <SkeletonCapsule />
                                    <SkeletonCapsule />
                                    <SkeletonCapsule />
                                </>
                            ) : (
                                capacities.map(c => (
                                    <Capsule
                                        key={c.id}
                                        text={c.name}
                                        active={selectedCapacity?.id === c.id}
                                        onPress={() => handleCapacitySelect(c)}
                                    />
                                ))
                            )}
                        </ScrollView>
                    </View>
                </>
            )}

            {/* SERVICES */}
            {(services.length > 0 || loadingServices) && (
                <>
                    <Text style={styles.title}>Select Services</Text>
                    <View style={styles.servicesBox}>
                        {loadingServices ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Loading services...</Text>
                            </View>
                        ) : (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {services.map(s => {
                                const normalizedService = {
                                    ...s,
                                    price: Number(s.price) || 0,
                                };

                                return (
                                    <ServiceRow
                                    key={normalizedService.id}
                                    service={normalizedService}
                                    selected={cartItems.some(i => i.id === normalizedService.id)}
                                    onToggle={() => toggleService(normalizedService)}
                                    />
                                );
                                })}
                            </ScrollView>
                        )}
                    </View>
                </>
            )}

            {/* Empty state handled by CartBar component */}
            <CartBar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: {
        padding: 6,
        marginRight: 10,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: BrandColors.text,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: BrandColors.text,
        marginTop: 20,
        marginBottom: 12,
    },
    horizontalScrollContainer: {
        maxHeight: 50,
        marginBottom: 10,
    },
    servicesBox: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 16,
        marginBottom: 80,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        color: BrandColors.mutedText,
        fontSize: 14,
    }
});