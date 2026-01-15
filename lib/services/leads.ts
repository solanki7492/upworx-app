import { apiClient } from '../api/config';
import { LeadsResponse } from '../types/lead';
import { handleApiError } from '../api/error-handler';

/**
 * Get all leads for the authenticated user
 * @returns Promise with leads array
 * @throws ApiException if the request fails
 */
export const getLeads = async (page: number): Promise<LeadsResponse> => {
    try {
        const response = await apiClient.get<LeadsResponse>(`/partner/leads?page=${page}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}