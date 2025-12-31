import { AxiosError } from 'axios';
import { apiClient, publicApi } from '../api/config';
import { ApiException } from '../types/api';
import { Service } from '../types/service';

/**
 * Handle API errors and transform them into ApiException
 * @param error - The error object from axios
 * @returns ApiException with proper error details
 */
const handleApiError = (error: unknown): never => {
    if (error instanceof AxiosError) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        const errors = error.response?.data?.errors;

        throw new ApiException(message, statusCode, errors);
    }

    if (error instanceof Error) {
        throw new ApiException(error.message);
    }

    throw new ApiException('An unexpected error occurred');
};

/**
 * Fetch all available services
 * @returns Promise with services data
 * @throws ApiException if the request fails
 */
export const getServices = async (): Promise<Service[]> => {
    try {
        const response = await publicApi.get<Service[]>('/services');
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Fetch a specific service by ID
 * @param id - Service ID
 * @returns Promise with service data
 * @throws ApiException if the request fails
 */
export const getServiceById = async (id: number): Promise<Service> => {
    try {
        const response = await apiClient.get<Service>(`/services/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
