import { apiClient, publicApi } from '../api/config';
import { Service } from '../types/service';
import { handleApiError } from '../api/error-handler';

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
