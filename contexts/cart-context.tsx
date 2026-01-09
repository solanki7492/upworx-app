import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const CART_STORAGE_KEY = '@upworx_cart';

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
    addOrder: (order: Order) => void;
    updateOrder: (orderId: string, updatedOrder: Partial<Order>) => void;
    removeOrder: (orderId: string) => void;
    clearCart: () => void;
    totalOrders: number;
    totalPrice: number;
    getOrder: (orderId: string) => Order | undefined;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);

    // Load cart from AsyncStorage on mount
    useEffect(() => {
        loadCart();
    }, []);

    // Save cart to AsyncStorage whenever orders change
    useEffect(() => {
        saveCart();
    }, [orders]);

    const loadCart = async () => {
        try {
            const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);

            if (!cartData) {
                setOrders([]);
                return;
            }

            const parsed = JSON.parse(cartData);

            if (Array.isArray(parsed)) {
                setOrders(parsed);
            } else {
                console.warn('Invalid cart data found. Resetting cart.');
                setOrders([]);
                await AsyncStorage.removeItem(CART_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            setOrders([]);
        }
    }

    const saveCart = async () => {
        try {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(orders));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    const addOrder = (order: Order) => {
        setOrders((prev) => [...prev, order]);
    };

    const updateOrder = (orderId: string, updatedOrder: Partial<Order>) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.orderId === orderId ? { ...order, ...updatedOrder } : order
            )
        );
    };

    const removeOrder = (orderId: string) => {
        setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
    };

    const clearCart = async () => {
        setOrders([]);
        try {
            await AsyncStorage.removeItem(CART_STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const getOrder = (orderId: string): Order | undefined => {
        return orders.find((order) => order.orderId === orderId);
    };

    const totalOrders = orders.length;
    const totalPrice = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    return (
        <CartContext.Provider
            value={{
                orders,
                addOrder,
                updateOrder,
                removeOrder,
                clearCart,
                totalOrders,
                totalPrice,
                getOrder,
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
