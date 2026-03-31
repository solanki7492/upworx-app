import { useCart } from '@/contexts/cart-context';
import { BrandColors } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SaveLaterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { saveLaterItems, moveToCart, removeOrder } = useCart();

  // Item expansion state
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleItemExpansion = (orderId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleMoveToCart = (orderId: string) => {
    Alert.alert('Move to Cart', 'Move this item to your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Move',
        onPress: async () => {
          try {
            await moveToCart(orderId);
            Alert.alert('Success', 'Item moved to cart');
          } catch (error) {
            Alert.alert('Error', 'Failed to move item. Please try again.');
            console.error('Error moving to cart:', error);
          }
        },
      },
    ]);
  };

  const handleRemoveItem = (orderId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeOrder(orderId);
            Alert.alert('Success', 'Item removed');
          } catch (error) {
            Alert.alert('Error', 'Failed to remove item. Please try again.');
            console.error('Error removing item:', error);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={BrandColors.text} />
        </TouchableOpacity>
        <Text style={styles.heading}>Saved for Later</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {saveLaterItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="bookmark-outline"
              size={80}
              color={BrandColors.mutedText}
            />
            <Text style={styles.emptyText}>No saved items</Text>
            <Text style={styles.emptySubtext}>
              Items you save for later will appear here
            </Text>
          </View>
        ) : (
          <>
            {/* Saved Item Cards */}
            {saveLaterItems.map((item: any) => {
              const isExpanded = expandedItems[item.orderId] || false;

              return (
                <View key={item.orderId} style={styles.itemCard}>
                  {/* Item Header */}
                  <TouchableOpacity
                    style={styles.itemHeader}
                    onPress={() => toggleItemExpansion(item.orderId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemHeaderLeft}>
                      <Ionicons
                        name="bookmark"
                        size={24}
                        color={BrandColors.primary}
                      />
                      <View>
                        <Text style={styles.itemTitle}>
                          {item.mainService.name}
                        </Text>
                        <Text style={styles.itemSubtitle}>
                          {item.totalQuantity} item(s) • ₹
                          {item.totals.grandTotal.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.itemHeaderRight}>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleMoveToCart(item.orderId);
                        }}
                        style={styles.moveToCartBtn}
                      >
                        <Ionicons
                          name="cart-outline"
                          size={20}
                          color={BrandColors.primary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.orderId);
                        }}
                        style={styles.removeBtn}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={BrandColors.mutedText}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Item Details - Expandable */}
                  {isExpanded && (
                    <View style={styles.itemDetails}>
                      {/* Services List */}
                      {item.services.map((service: any, idx: number) => (
                        <View key={idx} style={styles.serviceItemRow}>
                          <View style={styles.serviceInfo}>
                            <Text style={styles.serviceName}>
                              {service.service}
                            </Text>
                            <Text style={styles.servicePrice}>
                              ₹{service.price}/unit
                            </Text>
                          </View>
                          <View style={styles.qtyInfo}>
                            <Text style={styles.qtyText}>
                              Qty: {service.qty}
                            </Text>
                            <Text style={styles.totalText}>
                              ₹
                              {(
                                parseInt(service.price) * parseInt(service.qty)
                              ).toLocaleString()}
                            </Text>
                          </View>
                        </View>
                      ))}

                      {/* Summary */}
                      <View style={styles.summarySection}>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Total</Text>
                          <Text style={styles.summaryValue}>
                            ₹{item.totals.grandTotal.toLocaleString()}
                          </Text>
                        </View>
                      </View>

                      {/* Move to Cart Button */}
                      <TouchableOpacity
                        style={styles.moveToCartButton}
                        onPress={() => handleMoveToCart(item.orderId)}
                      >
                        <Ionicons name="cart" size={20} color="#fff" />
                        <Text style={styles.moveToCartButtonText}>
                          Move to Cart
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.text,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: BrandColors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: BrandColors.mutedText,
    marginTop: 4,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moveToCartBtn: {
    padding: 4,
  },
  removeBtn: {
    padding: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.text,
  },
  itemSubtitle: {
    fontSize: 13,
    color: BrandColors.mutedText,
    marginTop: 2,
  },
  itemDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  serviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.text,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 12,
    color: BrandColors.mutedText,
  },
  qtyInfo: {
    alignItems: 'flex-end',
  },
  qtyText: {
    fontSize: 13,
    color: BrandColors.mutedText,
    marginBottom: 4,
  },
  totalText: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.text,
  },
  summarySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.text,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.text,
  },
  moveToCartButton: {
    backgroundColor: BrandColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  moveToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
