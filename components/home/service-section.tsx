import { BrandColors } from '@/app/theme/colors';
import React from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Item = { id: string; image: any; title: string };

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;   // 3 columns, responsive

export function ServiceSection({ title, data, onViewMore }: { title: string; data: Item[]; onViewMore?: () => void }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onViewMore && (
          <TouchableOpacity onPress={onViewMore}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={data}
        numColumns={3}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={[styles.serviceCard, { width: CARD_WIDTH }]}>
            <View style={styles.imageWrapper}>
              <Image source={item.image} style={styles.serviceImage} />
            </View>
            <Text style={styles.serviceText}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.text,
  },

  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.primary,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  serviceCard: {
    backgroundColor: '#DDF6FA',
    borderRadius: 5,
    paddingVertical: 20,
    alignItems: 'center',
  },

  imageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceImage: {
    width: 62,
    height: 62,
    resizeMode: 'contain',
  },

  serviceText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.text,
    textAlign: 'center',
  },
});
