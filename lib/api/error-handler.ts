import { AxiosError } from 'axios';
import { apiClient } from '../api/config';
import { ApiException } from '../types/api';

/**
 * Handle API errors and transform them into ApiException
 */
export const handleApiError = (error: unknown): never => {
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