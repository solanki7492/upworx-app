import { apiClient } from '../api/config';
import { handleApiError } from '../api/error-handler';

// Types for Cart API
export interface ServiceItem {
  id: string;
  service: string;
  qty: string;
  price: string;
  note: string | null;
  l2: string;
  l3: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  session_id: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  category_image: string;
  services: ServiceItem[];
  total_service: number;
  total_quantity: number;
  total_service_price: string;
  service_date: string | null;
  service_time: string | null;
  message: string | null;
  repair_text: string | null;
  type: 'cart' | 'save_later';
  created_at: string;
  updated_at: string;
  category?: any;
}

export interface CartResponse {
  status: boolean;
  message: string;
  data: {
    cart_items: CartItem[];
    total_amount: number;
    total_items: number;
    cart_count: number;
  };
}

export interface CartItemResponse {
  status: boolean;
  message: string;
  data: {
    cart_item: CartItem;
    cart_count: number;
  };
}

export interface CartCountResponse {
  status: boolean;
  data: {
    cart_count: number;
  };
}

export interface SaveLaterResponse {
  status: boolean;
  message: string;
  data: {
    save_later_items: CartItem[];
    count: number;
  };
}

export interface AddToCartRequest {
  category_id: number;
  category_name?: string;
  category_slug?: string;
  category_image?: string;
  services: ServiceItem[];
  service_date?: string | null;
  service_time?: string | null;
  message?: string | null;
  repair_text?: string | null;
}

export interface UpdateCartRequest {
  services?: ServiceItem[];
  service_date?: string;
  service_time?: string;
  message?: string;
  repair_text?: string;
}

/**
 * Get all cart items for authenticated user
 */
export const getCartItems = async (): Promise<CartResponse> => {
  try {
    const response = await apiClient.get<CartResponse>('/cart');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get cart count
 */
export const getCartCount = async (): Promise<CartCountResponse> => {
  try {
    const response = await apiClient.get<CartCountResponse>('/cart/count');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (
  data: AddToCartRequest
): Promise<CartItemResponse> => {
  try {
    const response = await apiClient.post<CartItemResponse>('/cart', data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update cart item
 */
export const updateCartItem = async (
  id: number,
  data: UpdateCartRequest
): Promise<CartItemResponse> => {
  try {
    const response = await apiClient.put<CartItemResponse>(`/cart/${id}`, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (
  id: number
): Promise<CartCountResponse> => {
  try {
    const response = await apiClient.delete<CartCountResponse>(`/cart/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Move cart item to save for later
 */
export const moveToSaveLater = async (
  id: number
): Promise<CartCountResponse> => {
  try {
    const response = await apiClient.post<CartCountResponse>(
      `/cart/${id}/move-to-save-later`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Move save for later item to cart
 */
export const moveToCart = async (id: number): Promise<CartItemResponse> => {
  try {
    const response = await apiClient.post<CartItemResponse>(
      `/cart/${id}/move-to-cart`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// /**
//  * Clear all cart items
//  */
// export const clearCart = async (): Promise<{
//   status: boolean;
//   message: string;
// }> => {
//   try {
//     const response = await apiClient.delete<{
//       status: boolean;
//       message: string;
//     }>('/cart/clear');
//     return response.data;
//   } catch (error) {
//     return handleApiError(error);
//   }
// };

/**
 * Remove specific service from cart item
 */
export const removeServiceFromCart = async (
  cartId: number,
  serviceIndex: number
): Promise<CartItemResponse | CartCountResponse> => {
  try {
    const response = await apiClient.delete<
      CartItemResponse | CartCountResponse
    >(`/cart/${cartId}/service/${serviceIndex}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get all save for later items
 */
export const getSaveLaterItems = async (): Promise<SaveLaterResponse> => {
  try {
    const response = await apiClient.get<SaveLaterResponse>('/save-later');
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};
