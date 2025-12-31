import { BrandColors } from '@/app/theme/colors';
import { OfferStack } from '@/components/home/layered-carousel';
import { SearchBar } from '@/components/home/search-bar';
import { ServiceSection } from '@/components/home/service-section';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CITIES = ['Bareilly', 'Kanpur', 'Moradabad'];

const applianceServices = [
  { id: '1', title: 'AC Repair', image: require('@/assets/images/services/ac-repair.png') },
  { id: '2', title: 'Washing Machine', image: require('@/assets/images/services/washing-machine.webp') },
  { id: '3', title: 'Refrigerator', image: require('@/assets/images/services/refrigerator.webp') },
];

const homeCareServices = [
  { id: '1', title: 'Plumbing', image: require('@/assets/images/services/plumbing.webp') },
  { id: '2', title: 'Electrician', image: require('@/assets/images/services/electrical.webp') },
  { id: '3', title: 'Carpenter', image: require('@/assets/images/services/carpentry.webp') },
];


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCity, setSelectedCity] = useState('Bareilly');
  const [open, setOpen] = useState(false);

  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
                    onPress={() => {
                      setSelectedCity(city);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>G</Text>
        </View>
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
          <OfferStack onChange={(isSwiping) => {setScrollEnabled(!isSwiping);}}/>
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
