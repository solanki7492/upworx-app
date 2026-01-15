import { apiClient } from '../api/config';
import {
    CancelBookingResponse,
    OrdersResponse,
    OrderDetailsResponse,
    RescheduleBookingRequest,
    RescheduleBookingResponse,
} from '../types/order';
import { handleApiError } from '../api/error-handler';

/**
 * Fetch orders list
 * @param type - Optional filter type (e.g., 'all', 'pending', 'completed')
 * @returns Promise with orders list
 * @throws ApiException if the request fails
 */
export const fetchOrders = async (type?: string, page?: number): Promise<OrdersResponse> => {
    try {
        const url = type ? `/bookings/${type}` : `/bookings?page=${page}`;
        const response = await apiClient.get<OrdersResponse>(url);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Fetch order details by ID
 * @param orderId - The order ID
 * @returns Promise with order details
 * @throws ApiException if the request fails
 */
export const fetchOrderById = async (orderId: number): Promise<OrderDetailsResponse> => {
    try {
        const response = await apiClient.get<OrderDetailsResponse>(`/bookings/details/${orderId}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * Cancel a booking
 * @param packageId - The order item id (package id)
 * @returns Promise with cancellation response
 * @throws ApiException if the request fails
 */
export const cancelBooking = async (packageId: number): Promise<CancelBookingResponse> => {
    try {
        const response = await apiClient.put<CancelBookingResponse>(`/bookings/${packageId}/cancel`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Reschedule a booking
 * @param packageId - The order item id (package id)
 * @param data - New date and time
 * @returns Promise with reschedule response
 * @throws ApiException if the request fails
 */
export const rescheduleBooking = async (
    packageId: number,
    data: RescheduleBookingRequest
): Promise<RescheduleBookingResponse> => {
    try {
        const response = await apiClient.put<RescheduleBookingResponse>(
            `/bookings/${packageId}/reschedule`,
            data
        );
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
