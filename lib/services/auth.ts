import { AxiosError } from 'axios';
import { apiClient, publicApi } from '../api/config';
import { ApiException } from '../types/api';
import {
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
    ResendOtpRequest,
    ResendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from '../types/auth';

/**
 * Handle API errors and transform them into ApiException
 */
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

/**
 * Login with mobile and password
 * @param credentials - Mobile and password
 * @returns Promise with login response including token and user data
 * @throws ApiException if the request fails
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await publicApi.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Register a new user
 * @param userData - Registration data
 * @returns Promise with registration response
 * @throws ApiException if the request fails
 */
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
        const response = await publicApi.post<RegisterResponse>('/auth/register', userData);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Verify OTP for mobile number
 * @param otpData - OTP and mobile number
 * @returns Promise with verification response including token and user data
 * @throws ApiException if the request fails
 */
export const verifyOtp = async (otpData: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    try {
        const response = await publicApi.post<VerifyOtpResponse>('/auth/verify-otp', otpData);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Resend OTP to mobile number
 * @param data - Mobile number
 * @returns Promise with resend response
 * @throws ApiException if the request fails
 */
export const resendOtp = async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    try {
        const response = await publicApi.post<ResendOtpResponse>('/auth/resend-otp', data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Logout current user
 * @returns Promise with logout response
 * @throws ApiException if the request fails
 */
export const logout = async (): Promise<LogoutResponse> => {
    try {
        const response = await apiClient.post<LogoutResponse>('/auth/logout');
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
