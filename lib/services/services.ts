import { apiClient, publicApi } from '../api/config';
import { 
    Service, 
    GetPartnerServicesResponse, 
    GetPartnerAddressesResponse, 
    DayAvailabilityResponse,
    AvailabilityState
} from '../types/service';
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


/** * Fetch services offered by partners
 * @returns Promise with services data
 * @throws ApiException if the request fails
 */
export const getPartnerServices = async (): Promise<GetPartnerServicesResponse> => {
    try {
        const response = await apiClient.get<GetPartnerServicesResponse>('/partner/services');
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

/** * delete a service item by ID
 * @param id - Service Item ID
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const deletePartnerService = async (id: number): Promise<{ status: boolean; message: string }> => {
    try {
        const response = await apiClient.delete<{ status: boolean; message: string }>(`/partner/service/${id}`);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

/** fetch list of partner addresses */
export const getPartnerAddresses = async (): Promise<GetPartnerAddressesResponse> => {
    try {
        const response = await apiClient.get<GetPartnerAddressesResponse>('/partner/address-list');
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

/** add a new service for partner
 * @param serviceId - Service ID
 * @param addressId - Address ID
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const addPartnerService = async (payload: {
    services: number[];
    addresses: number[];
}): Promise<{ status: boolean; message: string }> => {
    try {
        const response = await apiClient.post<{
            status: boolean;
            message: string;
        }>('/partner/service', {
            services: payload.services,
            addresses: payload.addresses,
        });

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/** get Availability 
 * @returns Promise with availability data
 * @throws ApiException if the request fails
 */
export const getPartnerAvailability = async (): Promise<DayAvailabilityResponse> => {
    try {
        const response = await apiClient.get<DayAvailabilityResponse>('/partner/availability');
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

/** update Availability
 * @param availability - Availability data
 * @returns Promise with success response
 * @throws ApiException if the request fails
 */
export const updatePartnerAvailability = async (
    availability: AvailabilityState
): Promise<{ status: boolean; message: string }> => {
    try {
        const response = await apiClient.put('/partner/store/time', {
            weekDay: availability,
        });

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
