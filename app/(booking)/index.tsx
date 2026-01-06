import { Capsule } from '@/components/booking/capsule';
import { CartBar } from '@/components/booking/cart-bar';
import { ServiceRow } from '@/components/booking/service-row';
import { SkeletonCapsule } from '@/components/booking/skeleton-capsule';
import { useAuth } from '@/contexts/auth-context';
import { getCapacities, getServices, getType } from '@/lib/services/booking';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingScreen() {
    const { slug, serviceName, city } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [types, setTypes] = useState<any[]>([]);
    const [capacities, setCapacities] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);

    const [loadingTypes, setLoadingTypes] = useState(true);
    const [loadingCapacities, setLoadingCapacities] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);

    const [selectedType, setSelectedType] = useState<any>(null);
    const [selectedCapacity, setSelectedCapacity] = useState<any>(null);

    const [cart, setCart] = useState<any[]>([]);

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
        setCart([]);
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
        setCart([]);

        setLoadingServices(true);
        const data = await getServices(capacity.id, city as string);
        setServices(data.services);
        setLoadingServices(false);
    };

    const toggleService = (service: any) => {
        const exists = cart.find(i => i.id === service.id);
        if (exists) {
            setCart(cart.filter(i => i.id !== service.id));
        } else {
            setCart([...cart, { ...service, qty: 1 }]);
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
                                {services.map(s => (
                                    <ServiceRow
                                        key={s.id}
                                        service={s}
                                        selected={cart.some(i => i.id === s.id)}
                                        onToggle={() => toggleService(s)}
                                    />
                                ))}
                            </ScrollView>
                        )}
                    </View>
                </>
            )}

            {/* CART BAR */}
            {cart.length > 0 && (
                <CartBar
                    count={cart.length}
                    total={cart.reduce((t, i) => t + i.price * i.qty, 0)}
                    onView={() =>
                        router.push({
                            pathname: '/(cart)',
                            params: { cart: encodeURIComponent(JSON.stringify(cart)) }
                        })
                    }
                />
            )}
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

// const styles = StyleSheet.create({
//     container: {
//         padding: 20,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     backBtn: {
//         padding: 6,
//         marginRight: 10,
//     },
//     heading: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: BrandColors.text,
//     },
//     notice: {
//         marginTop: 20,
//         textAlign: 'left',
//         color: BrandColors.mutedText
//     },
//     help: {
//         marginTop: 10,
//         textAlign: 'left',
//         fontWeight: '600'
//     },
//     bookBtn: {
//         marginTop: 20,
//         backgroundColor: BrandColors.primary,
//         padding: 14,
//         borderRadius: 30,
//         alignItems: 'center',
//     },
//     bookText: {
//         color: '#fff',
//         fontWeight: '700'
//     },
//     grid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//     },
//     sectionTitle: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: BrandColors.text,
//         marginBottom: 10,
//     },
//     option: {
//         width: '48%',
//         backgroundColor: BrandColors.primary,
//         paddingVertical: 12,
//         paddingHorizontal: 10,
//         borderRadius: 12,
//         marginBottom: 10,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     optionText: {
//         color: '#fff',
//         fontWeight: '600',
//         fontSize: 13,
//         textAlign: 'center',
//     },
// });
