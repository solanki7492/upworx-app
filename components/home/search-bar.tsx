import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export function SearchBar() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/(search)')}
      activeOpacity={0.7}
    >
      <Ionicons name="search" size={20} color={BrandColors.mutedText} />
      <Text style={styles.placeholder}>Search for services...</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.card,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    gap: 10,
  },

  placeholder: {
    flex: 1,
    fontSize: 15,
    color: BrandColors.mutedText,
  },
});

