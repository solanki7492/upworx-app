import { apiClient } from '../api/config';
import { handleApiError } from '../api/error-handler';
import { LeadDetailsResponse, LeadsResponse } from '../types/lead';

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

/**
 * Get lead details by ID
 * @param id Lead ID
 * @returns Promise with lead details
 * @throws ApiException if the request fails
 */
export const getLeadDetails = async (id: number): Promise<LeadDetailsResponse> => {
    try {
        const response = await apiClient.get<LeadDetailsResponse>(`/partner/lead/${id}/details`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * Accept a lead
 * @param id Lead ID
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const acceptLead = async (id: number): Promise<{ status: boolean; message: string }> => {
    try {
        const response = await apiClient.post<{ status: boolean; message: string }>(`/partner/lead/${id}/accept`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * Cancel a lead
 * @param id Lead ID
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const cancelLead = async (id: number): Promise<{ status: boolean; message: string }> => {
    try {
        const response = await apiClient.post<{ status: boolean; message: string }>(`/partner/lead/${id}/cancel`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

export interface CompleteLeadRequest {
    service: 'complete' | 'customer';
    payment_status: 'Cash' | 'Online';
    visiting_cost: number;
    repair_cost?: number;
    convenience_cost?: number;
}

/**
 * Complete a lead
 * @param id Lead ID
 * @param data Complete lead request data
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const completeLead = async (
    id: number,
    data: CompleteLeadRequest
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await apiClient.post<{ success: boolean; message: string }>(
            `/partner/lead/${id}/complete`,
            data
        );
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}