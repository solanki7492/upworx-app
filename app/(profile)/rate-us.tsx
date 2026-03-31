import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RateUsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Us / Feedback</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.comingSoonContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="star-outline"
              size={80}
              color={BrandColors.primary}
            />
          </View>
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            We're working on bringing you an amazing feedback experience. Stay
            tuned!
          </Text>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  comingSoonContainer: {
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: BrandColors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: BrandColors.text,
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 16,
    color: BrandColors.mutedText,
    textAlign: 'center',
    lineHeight: 24,
  },
});
