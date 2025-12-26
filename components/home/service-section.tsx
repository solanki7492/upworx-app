import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from 'react-native';
import { BrandColors } from '@/app/theme/colors';

type Item = { id: string; image: any; title: string };

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;   // 3 columns, responsive

export function ServiceSection({ title, data }: { title: string; data: Item[] }) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.sectionTitle}>{title}</Text>

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

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.text,
    marginBottom: 14,
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
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceImage: {
    width: 36,
    height: 36,
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
