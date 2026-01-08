import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const CART_STORAGE_KEY = '@upworx_cart';
const BOOKING_DETAILS_KEY = '@upworx_booking_details';

interface CartItem {
    id: number;
    name: string;
    price: number;
    qty: number;
    categorySlug?: string;
}

interface BookingDetails {
    problems: string[];
    message: string;
    serviceDate: string;
    serviceTime: string;
    address: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'qty'>) => void;
    updateQty: (id: number, delta: number) => void;
    removeItem: (id: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    categorySlug: string | null;
    bookingDetails: BookingDetails | null;
    setBookingDetails: (details: BookingDetails) => void;
    clearBookingDetails: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [categorySlug, setCategorySlug] = useState<string | null>(null);
    const [bookingDetails, setBookingDetailsState] = useState<BookingDetails | null>(null);

    // Load cart from AsyncStorage on mount
    useEffect(() => {
        loadCart();
        loadBookingDetails();
    }, []);

    // Save cart to AsyncStorage whenever items change
    useEffect(() => {
        saveCart();
    }, [items]);

    const loadCart = async () => {
        try {
            const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
            if (cartData) {
                const parsed = JSON.parse(cartData);
                setItems(parsed.items || []);
                setCategorySlug(parsed.categorySlug || null);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    };

    const loadBookingDetails = async () => {
        try {
            const data = await AsyncStorage.getItem(BOOKING_DETAILS_KEY);
            if (data) {
                setBookingDetailsState(JSON.parse(data));
            }
        } catch (error) {
            console.error('Error loading booking details:', error);
        }
    };

    const saveCart = async () => {
        try {
            const cartData = {
                items,
                categorySlug,
            };
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    const addItem = (item: Omit<CartItem, 'qty'>) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
            }
            return [...prev, { ...item, qty: 1 }];
        });

        // Set category slug from first item
        if (items.length === 0 && item.categorySlug) {
            setCategorySlug(item.categorySlug);
        }
    };

    const updateQty = (id: number, delta: number) => {
        setItems((prev) => {
            const newItems = prev
                .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
                .filter((i) => i.qty > 0);

            // Clear category slug if cart is empty
            if (newItems.length === 0) {
                setCategorySlug(null);
            }

            return newItems;
        });
    };

    const removeItem = (id: number) => {
        setItems((prev) => {
            const newItems = prev.filter((i) => i.id !== id);

            // Clear category slug if cart is empty
            if (newItems.length === 0) {
                setCategorySlug(null);
            }

            return newItems;
        });
    };

    const clearCart = async () => {
        setItems([]);
        setCategorySlug(null);
        try {
            await AsyncStorage.removeItem(CART_STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const setBookingDetails = async (details: BookingDetails) => {
        setBookingDetailsState(details);
        try {
            await AsyncStorage.setItem(BOOKING_DETAILS_KEY, JSON.stringify(details));
        } catch (error) {
            console.error('Error saving booking details:', error);
        }
    };

    const clearBookingDetails = async () => {
        setBookingDetailsState(null);
        try {
            await AsyncStorage.removeItem(BOOKING_DETAILS_KEY);
        } catch (error) {
            console.error('Error clearing booking details:', error);
        }
    };

    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.qty) || 0;
        return sum + price * qty;
        }, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                updateQty,
                removeItem,
                clearCart,
                totalItems,
                totalPrice,
                categorySlug,
                bookingDetails,
                setBookingDetails,
                clearBookingDetails,
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
