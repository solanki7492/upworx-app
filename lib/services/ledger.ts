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

export const requestWithdrawal = async (amount: number): Promise<{ status: boolean; message: string }> => {
    try {
        const response = await apiClient.post<{ status: boolean; message: string }>(
            '/partner/payment/withdraw',
            { amount }
        );
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

export const initAddMoney = async (amount: number): Promise<{ status: boolean; message: string; payment_url: string }> => {
    try {
        const response = await apiClient.post<{ status: boolean; message: string; payment_url: string }>(
            '/partner/payment/init-add-money',
            { amount }
        );
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

export const downloadStatement = async (): Promise<{ status: boolean; path: string }> => {
    try {
        const response = await apiClient.get<{ status: boolean; path: string }>(
            '/partner/download-statement',
        );
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}