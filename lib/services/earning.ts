import { apiClient } from '../api/config';
import { handleApiError } from '../api/error-handler';
import { EarningsResponse, EarningData } from '../types/earning';

export const getEarnings = async (
    page: number,
    search?: string
): Promise<EarningsResponse> => {
    try {
        const response = await apiClient.get<EarningsResponse>(
            '/partner/earning',
            {
                params: {
                    page,
                    search: search || undefined,
                },
            }
        );

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};