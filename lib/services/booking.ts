import { AxiosError } from 'axios';
import { apiClient } from '../api/config';
import { ApiException } from '../types/api';
import { CapacityItem, CategoryTypeResponse, GetServicesPriceResponse } from '../types/booking';

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