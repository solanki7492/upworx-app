import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors } from '@/app/theme/colors';

export function SearchBar() {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search for services..."
        placeholderTextColor={BrandColors.mutedText}
        style={styles.input}
      />
      <Ionicons name="search" size={20} color={BrandColors.mutedText} />
    </View>
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
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: BrandColors.text,
  },
});

