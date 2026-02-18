import { Capsule } from '@/components/booking/capsule';
import { ServiceRow } from '@/components/booking/service-row';
import { SkeletonCapsule } from '@/components/booking/skeleton-capsule';
import { useCart } from '@/contexts/cart-context';
import { getCapacities, getServices, getType } from '@/lib/services/booking';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingScreen() {
    const { id, slug, serviceName, city } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { addOrder } = useCart();

    const [types, setTypes] = useState<any[]>([]);
    const [capacities, setCapacities] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);

    const [loadingTypes, setLoadingTypes] = useState(true);
    const [loadingCapacities, setLoadingCapacities] = useState(false);
    const [loadingServices, setLoadingServices] = useState(false);

    const [selectedType, setSelectedType] = useState<any>(null);
    const [selectedCapacity, setSelectedCapacity] = useState<any>(null);

    // Local state for temporary service selection (not in cart yet)
    const [selectedServices, setSelectedServices] = useState<any[]>([]);

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
        setSelectedServices([]); // Clear selections when type changes

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
        setSelectedServices([]); // Clear selections when capacity changes

        setLoadingServices(true);
        const data = await getServices(capacity.id, city as string);
        setServices(data.services);
        setLoadingServices(false);
    };

    const toggleService = (service: any) => {
        const exists = selectedServices.find(s => s.id === service.id);
        if (exists) {
            setSelectedServices(prev => prev.filter(s => s.id !== service.id));
        } else {
            setSelectedServices(prev => [...prev, { ...service, qty: 1 }]);
        }
    };

    const updateServiceQty = (serviceId: number, delta: number) => {
        setSelectedServices(prev =>
            prev
                .map(s => s.id === serviceId ? { ...s, qty: s.qty + delta } : s)
                .filter(s => s.qty > 0)
        );
    };

    const handleAddToCart = () => {
        if (selectedServices.length === 0) {
            Alert.alert('No Services Selected', 'Please select at least one service to add to cart.');
            return;
        }

        // Calculate totals
        const totalPrice = selectedServices.reduce((sum, s) => sum + (s.price * s.qty), 0);

        // Create order object
        const order = {
            orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            mainService: {
                id: id as string,
                name: serviceName as string,
                slug: slug as string,
            },
            services: selectedServices.map(s => ({
                id: String(s.id),
                service: s.name,
                qty: String(s.qty),
                price: String(s.price),
                note: null,
                l2: selectedType?.name || '',
                l3: selectedCapacity?.name || '',
            })),
            problems: [],
            message: '',
            serviceDate: null,
            serviceTime: null,
            l2: selectedType?.name || '',
            l3: selectedCapacity?.name || '',
            totalServiceCount: selectedServices.length,
            totalQuantity: selectedServices.reduce((sum, s) => sum + s.qty, 0),
            totalPrice: totalPrice,
            totals: {
                subtotal: totalPrice,
                discount: 0,
                tax: 0,
                grandTotal: totalPrice,
            },
        };

        addOrder(order);

        // Clear selections and navigate to cart
        setSelectedServices([]);
        router.push('/(cart)');
    };

    const totalSelectedQty = selectedServices.reduce((sum, s) => sum + s.qty, 0);
    const totalSelectedPrice = selectedServices.reduce((sum, s) => sum + (s.price * s.qty), 0);

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
                                        note: Number(s.price) > 0 ? null : s.note,
                                    };
                                    const selectedService = selectedServices.find(ss => ss.id === normalizedService.id);

                                    return (
                                        <ServiceRow
                                            key={normalizedService.id}
                                            service={normalizedService}
                                            selected={!!selectedService}
                                            onToggle={() => toggleService(normalizedService)}
                                        />
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>
                </>
            )}

            {/* Add to Cart Button */}
            {selectedServices.length > 0 && (
                <View style={styles.addToCartBar}>
                    <View style={styles.leftSection}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{totalSelectedQty}</Text>
                        </View>
                        <View>
                            <Text style={styles.itemsText}>
                                {totalSelectedQty} item{totalSelectedQty > 1 ? 's' : ''}
                            </Text>
                            <Text style={styles.totalText}>₹ {totalSelectedPrice.toLocaleString()}</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleAddToCart} style={styles.addButton}>
                        <Text style={styles.addButtonText}>Add to Cart</Text>
                        <Ionicons name="cart" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
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
    },
    addToCartBar: {
        position: 'absolute',
        bottom: 24,
        left: 16,
        right: 16,
        backgroundColor: BrandColors.primary,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 16,
    },
    itemsText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 13,
        fontWeight: '500',
    },
    totalText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 18,
    },
    addButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
});