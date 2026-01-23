import { apiClient } from '../api/config';
import { handleApiError } from '../api/error-handler';
import { 
    BankAccount,
    BankAccountsResponse,
    AddBankAccountRequest,
    AddBankAccountResponse
} from '../types/banking';

/**
 * Fetch partner's bank accounts
 * @returns Promise with bank accounts data
 * @throws ApiException if the request fails
 */
export const getBankAccounts = async (): Promise<BankAccountsResponse> => {
    try {
        const response = await apiClient.get<BankAccountsResponse>('/partner/banking');
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/** * Add a new bank account for the partner
 * @param payload - Bank account details
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const addBankAccount = async (payload: AddBankAccountRequest): Promise<AddBankAccountResponse> => {
    try {
        const response = await apiClient.post<AddBankAccountResponse>('/partner/banking', payload);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

/** * make default bank account by ID
 * @param id - Bank Account ID
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const makeDefaultBankAccount = async (id: number): Promise<{ status: boolean; message: string }> => {
    try {
        const response = await apiClient.post<{ status: boolean; message: string }>(`partner/put-default-bank`, { id: id });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}