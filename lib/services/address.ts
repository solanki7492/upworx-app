import { apiClient } from '../api/config';
import {
    Address,
    AddressResponse,
    CreateAddressRequest,
    GetAddressesResponse,
    UpdateAddressRequest,
} from '../types/address';
import { handleApiError } from '../api/error-handler';

/**
 * Get all addresses for the authenticated user
 * @returns Promise with addresses array
 * @throws ApiException if the request fails
 */
export const getAddresses = async (): Promise<Address[]> => {
    try {
        const response = await apiClient.get<GetAddressesResponse>('/user/addresses');
        return response.data.addresses;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Create a new address
 * @param addressData - Address data to create
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const createAddress = async (addressData: CreateAddressRequest): Promise<AddressResponse> => {
    try {
        const response = await apiClient.post<AddressResponse>('/user/addresses', addressData);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Update an existing address
 * @param id - Address ID
 * @param addressData - Updated address data
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const updateAddress = async (
    id: number,
    addressData: UpdateAddressRequest
): Promise<AddressResponse> => {
    try {
        const response = await apiClient.put<AddressResponse>(`/user/addresses/${id}`, addressData);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Delete an address
 * @param id - Address ID
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const deleteAddress = async (id: number): Promise<AddressResponse> => {
    try {
        const response = await apiClient.delete<AddressResponse>(`/user/addresses/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
