import { apiClient } from '../api/config';
import { UserResponse } from '../types/user';
import { handleApiError } from '../api/error-handler';

/**
 * Update user profile
 * @returns Promise with user profile data
 * @throws ApiException if the request fails
 */
export const updateUserProfile = async (
    profile: {
        name: string;
        email: string;
        mobile: string;
        image?: {
            uri: string;
            name: string;
            type: string;
        };
    }
): Promise<UserResponse> => {
    try {
        const formData = new FormData();

        formData.append('name', profile.name);
        formData.append('email', profile.email);
        formData.append('mobile', profile.mobile);

        if (profile.image) {
            formData.append('image', {
                uri: profile.image.uri,
                name: profile.image.name,
                type: profile.image.type,
            } as any);
        }

        const response = await apiClient.post<UserResponse>(
            '/profile-update',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

export const updatePartnerProfile = async (formData: FormData) => {
    const res = await apiClient.post('/partner/profile-update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};
