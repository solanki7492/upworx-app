import { ThemedText } from '@/components/themed-text';
import { useApp } from '@/contexts/app-context';
import { getServices } from '@/lib/services/services';
import { Service } from '@/lib/types/service';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { city } = useApp();

    const [searchQuery, setSearchQuery] = useState('');
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const services = await getServices();
            setAllServices(services);
            setFilteredServices(services);
        } catch (error) {
            console.error('Error loading services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback((text: string) => {
        setSearchQuery(text);
        setSearching(true);

        if (text.trim() === '') {
            setFilteredServices(allServices);
            setSearching(false);
            return;
        }

        const query = text.toLowerCase();
        const filtered = allServices.filter(service =>
            service.name.toLowerCase().includes(query) ||
            service.slug.toLowerCase().includes(query)
        );

        setFilteredServices(filtered);
        setSearching(false);
    }, [allServices]);

    const handleServicePress = (service: Service) => {
        router.push({
            pathname: '/(booking)',
            params: {
                id: service.id,
                slug: service.slug,
                serviceName: service.name,
                city: city || 'bareilly',
            },
        });
    };

    const renderServiceItem = ({ item }: { item: Service }) => (
        <TouchableOpacity
            style={styles.serviceItem}
            onPress={() => handleServicePress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.serviceIcon}>
                {item.icon_image ? (
                    <Image
                        source={{ uri: item.icon_image }}
                        style={styles.iconImage}
                        resizeMode="contain"
                    />
                ) : (
                    <Ionicons name="construct" size={24} color={BrandColors.primary} />
                )}
            </View>
            <View style={styles.serviceInfo}>
                <ThemedText type="defaultSemiBold" style={styles.serviceName}>
                    {item.name}
                </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BrandColors.mutedText} />
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={BrandColors.mutedText} />
            <ThemedText style={styles.emptyText}>
                {searchQuery ? 'No services found' : 'Search for services'}
            </ThemedText>
            {searchQuery && (
                <ThemedText style={styles.emptySubtext}>
                    Try searching with different keywords
                </ThemedText>
            )}
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header with Search Bar */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
                </TouchableOpacity>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={BrandColors.mutedText} />
                    <TextInput
                        placeholder="Search for services..."
                        placeholderTextColor={BrandColors.mutedText}
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoFocus
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={20} color={BrandColors.mutedText} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Results */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={BrandColors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredServices}
                    renderItem={renderServiceItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BrandColors.background,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        backgroundColor: BrandColors.background,
        borderBottomWidth: 1,
        borderBottomColor: BrandColors.border,
    },

    backButton: {
        padding: 4,
    },

    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BrandColors.card,
        paddingHorizontal: 14,
        height: 46,
        borderRadius: 14,
        gap: 10,
    },

    searchInput: {
        flex: 1,
        fontSize: 15,
        color: BrandColors.text,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    listContent: {
        flexGrow: 1,
        paddingVertical: 8,
    },

    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: BrandColors.background,
        gap: 12,
    },

    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: BrandColors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },

    iconImage: {
        width: 32,
        height: 32,
    },

    serviceInfo: {
        flex: 1,
    },

    serviceName: {
        fontSize: 16,
        color: BrandColors.text,
    },

    separator: {
        height: 1,
        backgroundColor: BrandColors.border,
        marginLeft: 76,
    },

    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingTop: 100,
    },

    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        color: BrandColors.text,
    },

    emptySubtext: {
        fontSize: 14,
        color: BrandColors.mutedText,
        marginTop: 8,
        textAlign: 'center',
    },
});
