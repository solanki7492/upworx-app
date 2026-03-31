import { getServiceDetails } from '@/lib/services/booking';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ServiceDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, slug, serviceName, city } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [serviceData, setServiceData] = useState<any>(null);

  useEffect(() => {
    loadServiceDetails();
  }, []);

  const loadServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await getServiceDetails(city as string, slug as string);
      if (response.success) {
        setServiceData(response.data);
      }
    } catch (error) {
      console.error('Error loading service details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    router.push({
      pathname: '/(booking)',
      params: {
        id,
        slug,
        serviceName,
        city,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{serviceName}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
        </View>
      </View>
    );
  }

  if (!serviceData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{serviceName}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load service details</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{serviceName}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Banner Section */}
        {serviceData.banner && (
          <View style={styles.bannerSection}>
            <Text style={styles.bannerHeading}>
              {serviceData.banner.heading}
            </Text>
            {serviceData.banner.features &&
              serviceData.banner.features.length > 0 && (
                <View style={styles.featuresContainer}>
                  {serviceData.banner.features.map(
                    (feature: string, index: number) => (
                      <View key={index} style={styles.featureItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={BrandColors.success}
                        />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    )
                  )}
                </View>
              )}
          </View>
        )}

        {/* Offers Section */}
        {serviceData.offers && (
          <View style={styles.offersSection}>
            <Text style={styles.sectionTitle}>Why Choose Us</Text>
            {serviceData.offers.picture && (
              <Image
                source={{ uri: serviceData.offers.picture }}
                style={styles.offerImage}
                resizeMode="contain"
              />
            )}
            {serviceData.offers.list && serviceData.offers.list.length > 0 && (
              <View style={styles.offersList}>
                {serviceData.offers.list.map((offer: string, index: number) => (
                  <View key={index} style={styles.offerItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.offerText}>{offer}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Types Section */}
        {serviceData.types &&
          serviceData.types.items &&
          serviceData.types.items.length > 0 && (
            <View style={styles.typesSection}>
              <Text style={styles.sectionTitle}>
                {serviceData.types.heading || 'Types'}
              </Text>
              <View style={styles.typesGrid}>
                {serviceData.types.items.map((type: string, index: number) => (
                  <View key={index} style={styles.typeChip}>
                    <Text style={styles.typeChipText}>{type}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Services Provided Section */}
        {serviceData.services_provided &&
          serviceData.services_provided.items &&
          serviceData.services_provided.items.length > 0 && (
            <View style={styles.servicesProvidedSection}>
              <Text style={styles.sectionTitle}>
                {serviceData.services_provided.heading || 'Services Provided'}
              </Text>
              <View style={styles.servicesGrid}>
                {serviceData.services_provided.items.map(
                  (service: string, index: number) => (
                    <View key={index} style={styles.serviceCard}>
                      <Ionicons
                        name="build-outline"
                        size={24}
                        color={BrandColors.primary}
                      />
                      <Text style={styles.serviceCardText}>{service}</Text>
                    </View>
                  )
                )}
              </View>
            </View>
          )}

        {/* Bottom spacing for sticky button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Book Button */}
      <View
        style={[
          styles.stickyButtonContainer,
          { paddingBottom: insets.bottom || 16 },
        ]}
      >
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: BrandColors.text,
    flex: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: BrandColors.mutedText,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  bannerSection: {
    backgroundColor: BrandColors.card,
    padding: 20,
    marginBottom: 12,
  },
  bannerHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: BrandColors.text,
    marginBottom: 16,
    lineHeight: 30,
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    color: BrandColors.text,
    flex: 1,
  },
  offersSection: {
    backgroundColor: BrandColors.card,
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.text,
    marginBottom: 16,
  },
  offerImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  offersList: {
    gap: 12,
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.primary,
    marginTop: 7,
  },
  offerText: {
    fontSize: 15,
    color: BrandColors.text,
    flex: 1,
    lineHeight: 22,
  },
  typesSection: {
    backgroundColor: BrandColors.card,
    padding: 20,
    marginBottom: 12,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    backgroundColor: BrandColors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.primary + '30',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.primary,
  },
  servicesProvidedSection: {
    backgroundColor: BrandColors.card,
    padding: 20,
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    backgroundColor: BrandColors.background,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  serviceCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.text,
    textAlign: 'center',
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BrandColors.card,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bookButton: {
    backgroundColor: BrandColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
