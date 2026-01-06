import { CitySelectionModal } from '@/components/city-selection-modal';
import { OfferStack } from '@/components/home/layered-carousel';
import { SearchBar } from '@/components/home/search-bar';
import { ServiceSection } from '@/components/home/service-section';
import { ThemedText } from '@/components/themed-text';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { StorageService } from '@/lib';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { Alert } = require('react-native');

const CITIES = ['Bareilly', 'Kanpur', 'Moradabad'];

const applianceServices = [
  { id: 1, name: 'AC Repair', icon_image: require('@/assets/images/services/ac-repair.png'), slug: 'ac' },
  { id: 2, name: 'Washing Machine', icon_image: require('@/assets/images/services/washing-machine.webp'), slug: 'washing-machine' },
  { id: 3, name: 'Refrigerator', icon_image: require('@/assets/images/services/refrigerator.webp'), slug: 'refrigerator' },
];

const homeCareServices = [
  { id: 1, name: 'Plumbing', icon_image: require('@/assets/images/services/plumbing.webp'), slug: 'plumber' },
  { id: 2, name: 'Electrician', icon_image: require('@/assets/images/services/electrical.webp'), slug: 'electrician' },
  { id: 3, name: 'Carpenter', icon_image: require('@/assets/images/services/carpentry.webp'), slug: 'carpenter' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState('Bareilly');
  const [open, setOpen] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const { setCity } = useApp();


  // Check if city is already selected on mount
  useEffect(() => {
    const checkStoredCity = async () => {
      try {
        const storedCity = await StorageService.getSelectedCity();
        if (storedCity) {
          // Convert stored lowercase value to display format
          const cityName = CITIES.find((c) => c.toLowerCase() === storedCity);
          if (cityName) {
            setSelectedCity(cityName);
          }
        } else {
          // Show modal if no city is stored
          setShowCityModal(true);
        }
      } catch (error) {
        console.error('Error checking stored city:', error);
        setShowCityModal(true);
      }
    };

    checkStoredCity();
  }, []);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShowCityModal(false);
  };

  const handleDropdownCityChange = async (city: string) => {
    setSelectedCity(city);
    setCity(city);
    setOpen(false);
    try {
      await StorageService.setSelectedCity(city.toLowerCase());
    } catch (error) {
      console.error('Error saving city from dropdown:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <CitySelectionModal
        visible={showCityModal}
        onCitySelect={handleCitySelect}
      />

      <View style={styles.headerRow}>
        <View>
          <TouchableOpacity
            style={styles.citySelector}
            onPress={() => setOpen(!open)}
            activeOpacity={0.7}
          >
            <Ionicons name="location-sharp" size={18} color={BrandColors.primary} />
            <ThemedText type="title" style={styles.cityText}>
              {selectedCity}
            </ThemedText>
            <Ionicons
              name={open ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={BrandColors.primary}
            />
          </TouchableOpacity>

          {open && (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdown}>
                {CITIES.map((city) => (
                  <TouchableOpacity
                    key={city}
                    style={styles.dropdownItem}
                    onPress={() => handleDropdownCityChange(city)}
                  >
                    <Text style={styles.dropdownText}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Avatar */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}>
          <Text style={styles.avatarText}>{user ? getInitials(user.name) : 'G'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        bounces={false}
        overScrollMode="never"
        scrollEnabled={scrollEnabled}
      >
        <SearchBar />
        <View style={{ marginTop: 30, overflow: 'hidden' }}>
          <OfferStack onChange={(isSwiping) => { setScrollEnabled(!isSwiping); }} />
        </View>

        <ServiceSection
          title="Appliance Repair Services"
          data={applianceServices}
          onViewMore={() => router.push('/services')}
        />
        <ServiceSection
          title="Home Care Services"
          data={homeCareServices}
          onViewMore={() => router.push('/services')}
        />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: BrandColors.background,
    fontWeight: 'bold',
    fontSize: 18,
  },

  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  cityText: {
    fontSize: 20,
    fontWeight: '600',
  },

  dropdownContainer: {
    position: 'absolute',
    top: 36,
    left: 0,
    zIndex: 1000,
  },

  dropdown: {
    backgroundColor: BrandColors.background,
    borderRadius: 10,
    paddingVertical: 6,
    width: 160,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },

  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  dropdownText: {
    fontSize: 16,
    color: BrandColors.text,
  },
});
