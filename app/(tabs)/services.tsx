import { BrandColors } from '@/app/theme/colors';
import { ServiceSection } from '@/components/home/service-section';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const allServices = [
  { id: '1', title: 'AC Repair', image: require('@/assets/images/react-logo.png') },
  { id: '2', title: 'Washing Machine', image: require('@/assets/images/react-logo.png') },
  { id: '3', title: 'Refrigerator', image: require('@/assets/images/react-logo.png') },
  { id: '4', title: 'Cleaning', image: require('@/assets/images/react-logo.png') },
  { id: '5', title: 'Plumbing', image: require('@/assets/images/react-logo.png') },
  { id: '6', title: 'Painting', image: require('@/assets/images/react-logo.png') },
  { id: '7', title: 'Electrical', image: require('@/assets/images/react-logo.png') },
  { id: '8', title: 'Carpentry', image: require('@/assets/images/react-logo.png') },
  { id: '9', title: 'Pest Control', image: require('@/assets/images/react-logo.png') },
];

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        bounces={false}
        overScrollMode="never"
      >
        <ServiceSection title="All Services" data={allServices} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
  },
  header: {
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: BrandColors.text,
  },
});
