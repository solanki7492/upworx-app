import { apiClient } from '../api/config';
import { handleApiError } from '../api/error-handler';
import { LedgerResponse } from '../types/ledger';

/**
 * Get ledger items for the authenticated user
 * @param page Page number for pagination
 * @returns Promise with ledger items
 * @throws ApiException if the request fails
 */
export const getLedgerItems = async (page: number): Promise<LedgerResponse> => {
    try {
        const response = await apiClient.get<LedgerResponse>(`/partner/ledger?page=${page}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}