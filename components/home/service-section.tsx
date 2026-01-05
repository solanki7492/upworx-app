import { useApp } from '@/contexts/app-context';
import { BrandColors } from '@/theme/colors';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Item = { id: number; icon_image: ImageSourcePropType | string; name: string; slug: string };

const SCREEN_WIDTH = Dimensions.get('window').width;
const NUM_COLUMNS = 3;
const GAP = 12;
const HORIZONTAL_PADDING = 16 * 2;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export function ServiceSection({ title, data, onViewMore }: { title: string; data: Item[]; onViewMore?: () => void }) {
  const router = useRouter();
  const { city } = useApp();

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
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => {
          const isLastColumn = (index + 1) % NUM_COLUMNS === 0;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                router.push({
                  pathname: '/(booking)',
                  params: {
                    slug: item.slug,
                    serviceName: item.name,
                    city: city,
                  },
                });
              }}
              style={[styles.serviceCard, { width: CARD_WIDTH }, !isLastColumn && { marginRight: GAP }]}
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={
                    typeof item.icon_image === 'string'
                      ? { uri: `${item.icon_image}` }
                      : item.icon_image
                  }
                  style={styles.serviceImage}
                  defaultSource={require('@/assets/images/react-logo.png')}
                />
              </View>
              <Text style={styles.serviceText}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
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
    flex: 1,
    justifyContent: 'flex-start',
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
