import type { CartItem } from '@/lib/services/cart';
import * as cartService from '@/lib/services/cart';
import { createContext, useContext, useEffect, useState } from 'react';

interface ServiceItem {
  id: string;
  service: string;
  qty: string;
  price: string;
  note: string | null;
  l2: string;
  l3: string;
}

interface Order {
  orderId: string;
  mainService: {
    id: string;
    name: string;
    slug: string;
  };
  services: ServiceItem[];
  problems: string[];
  message: string;
  serviceDate: string | null;
  serviceTime: string | null;
  l2: string;
  l3: string;
  totalServiceCount: number;
  totalQuantity: number;
  totalPrice: number;
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
  };
}

interface CartContextType {
  orders: Order[];
  saveLaterItems: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (orderId: string, updatedOrder: Partial<Order>) => Promise<void>;
  removeOrder: (orderId: string) => Promise<void>;
  moveToSaveLater: (orderId: string) => Promise<void>;
  moveToCart: (orderId: string) => Promise<void>;
  totalOrders: number;
  totalPrice: number;
  getOrder: (orderId: string) => Order | undefined;
  loading: boolean;
  refreshCart: () => Promise<void>;
  refreshSaveLater: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper function to convert API CartItem to local Order format
const cartItemToOrder = (cartItem: CartItem): Order => {
  const totalPrice = parseFloat(cartItem.total_service_price || '0');

  return {
    orderId: String(cartItem.id),
    mainService: {
      id: String(cartItem.category_id),
      name: cartItem.category_name,
      slug: cartItem.category_slug,
    },
    services: cartItem.services.map((service) => ({
      id: service.id,
      service: service.service,
      qty: service.qty,
      price: service.price,
      note: service.note,
      l2: service.l2,
      l3: service.l3,
    })),
    problems: [],
    message: cartItem.message || '',
    serviceDate: cartItem.service_date,
    serviceTime: cartItem.service_time,
    l2: cartItem.services[0]?.l2 || '',
    l3: cartItem.services[0]?.l3 || '',
    totalServiceCount: cartItem.total_service,
    totalQuantity: cartItem.total_quantity,
    totalPrice: totalPrice,
    totals: {
      subtotal: totalPrice,
      discount: 0,
      tax: 0,
      grandTotal: totalPrice,
    },
  };
};

// Helper function to convert local Order to API AddToCartRequest
const orderToCartRequest = (order: Order): cartService.AddToCartRequest => {
  return {
    category_id: parseInt(order.mainService.id),
    category_name: order.mainService.name,
    category_slug: order.mainService.slug,
    category_image: '',
    services: order.services.map((service) => ({
      id: service.id,
      service: service.service,
      qty: service.qty,
      price: service.price,
      note: service.note,
      l2: service.l2,
      l3: service.l3,
    })),
    service_date: order.serviceDate,
    service_time: order.serviceTime,
    message: order.message,
    repair_text: null,
  };
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [saveLaterItems, setSaveLaterItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart from API on mount
  useEffect(() => {
    loadCart();
    loadSaveLater();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCartItems();

      if (response.status && response.data.cart_items) {
        const mappedOrders = response.data.cart_items.map(cartItemToOrder);
        setOrders(mappedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const loadSaveLater = async () => {
    try {
      const response = await cartService.getSaveLaterItems();

      if (response.status && response.data.save_later_items) {
        const mappedItems = response.data.save_later_items.map(cartItemToOrder);
        setSaveLaterItems(mappedItems);
      } else {
        setSaveLaterItems([]);
      }
    } catch (error) {
      console.error('Error loading save later items:', error);
      setSaveLaterItems([]);
    }
  };

  const refreshSaveLater = async () => {
    await loadSaveLater();
  };

  const moveToSaveLater = async (orderId: string) => {
    try {
      const cartId = parseInt(orderId);
      await cartService.moveToSaveLater(cartId);

      // Move item from orders to saveLaterItems in local state
      const item = orders.find((order) => order.orderId === orderId);
      if (item) {
        setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
        setSaveLaterItems((prev) => [...prev, item]);
      }
    } catch (error) {
      console.error('Error moving to save later:', error);
      throw error;
    }
  };

  const moveToCart = async (orderId: string) => {
    try {
      const cartId = parseInt(orderId);
      const response = await cartService.moveToCart(cartId);

      if (response.status && response.data.cart_item) {
        const movedItem = cartItemToOrder(response.data.cart_item);

        // Move item from saveLaterItems to orders in local state
        setSaveLaterItems((prev) =>
          prev.filter((item) => item.orderId !== orderId)
        );
        setOrders((prev) => [...prev, movedItem]);
      }
    } catch (error) {
      console.error('Error moving to cart:', error);
      throw error;
    }
  };

  const addOrder = async (order: Order) => {
    try {
      const cartRequest = orderToCartRequest(order);
      const response = await cartService.addToCart(cartRequest);

      if (response.status && response.data.cart_item) {
        const newOrder = cartItemToOrder(response.data.cart_item);
        setOrders((prev) => [...prev, newOrder]);
      }
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrder = async (orderId: string, updatedOrder: Partial<Order>) => {
    try {
      const cartId = parseInt(orderId);
      const updateData: cartService.UpdateCartRequest = {};

      if (updatedOrder.services) {
        updateData.services = updatedOrder.services.map((service) => ({
          id: service.id,
          service: service.service,
          qty: service.qty,
          price: service.price,
          note: service.note,
          l2: service.l2,
          l3: service.l3,
        }));
      }

      if (updatedOrder.serviceDate !== undefined) {
        updateData.service_date = updatedOrder.serviceDate || undefined;
      }

      if (updatedOrder.serviceTime !== undefined) {
        updateData.service_time = updatedOrder.serviceTime || undefined;
      }

      if (updatedOrder.message !== undefined) {
        updateData.message = updatedOrder.message || undefined;
      }

      const response = await cartService.updateCartItem(cartId, updateData);

      if (response.status && response.data.cart_item) {
        const updated = cartItemToOrder(response.data.cart_item);
        setOrders((prev) =>
          prev.map((order) => (order.orderId === orderId ? updated : order))
        );
      }
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const removeOrder = async (orderId: string) => {
    try {
      const cartId = parseInt(orderId);
      await cartService.removeCartItem(cartId);
      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
    } catch (error) {
      console.error('Error removing order:', error);
      throw error;
    }
  };

  //   const clearCart = async () => {
  //     try {
  //       await cartService.clearCart();
  //       setOrders([]);
  //     } catch (error) {
  //       console.error('Error clearing cart:', error);
  //       throw error;
  //     }
  //   };

  const getOrder = (orderId: string): Order | undefined => {
    return orders.find((order) => order.orderId === orderId);
  };

  const totalOrders = orders.length;
  const totalPrice = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  return (
    <CartContext.Provider
      value={{
        orders,
        saveLaterItems,
        addOrder,
        updateOrder,
        removeOrder,
        moveToSaveLater,
        moveToCart,
        totalOrders,
        totalPrice,
        getOrder,
        loading,
        refreshCart,
        refreshSaveLater,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
