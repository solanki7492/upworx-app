import { apiClient } from '../api/config';
import { CapacityItem, CategoryTypeResponse, GetServicesPriceResponse } from '../types/booking';
import { handleApiError } from '../api/error-handler';

export const getType = async (city: string, slug: string): Promise<CategoryTypeResponse> => {
    try {
        const response = await apiClient.get<CategoryTypeResponse>(`/booking/${city}/${slug}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const getCapacities = async (id: string): Promise<CapacityItem> => {
    try {
        const response = await apiClient.get<CapacityItem>(`/booking/type/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

export const getServices = async (id: string, city: string): Promise<GetServicesPriceResponse> => {
    try {
        const response = await apiClient.get<GetServicesPriceResponse>(`/booking/services/${id}/${city}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

export const payLater = async (payload: any): Promise<any> => {
    try {
        const response = await apiClient.post('/booking/pay-later', payload);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}