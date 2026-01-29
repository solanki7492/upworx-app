import { apiClient, publicApi } from '../api/config';
import { handleApiError } from '../api/error-handler';
import {
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ForgotPasswordVerifyOtpRequest,
    ForgotPasswordVerifyOtpResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RegisterRequest,
    RegisterResponse,
    ResendOtpRequest,
    ResendOtpResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from '../types/auth';

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

/**
 * Change password for current user
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Promise with logout response
 * @throws ApiException if the request fails
 */
export const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
): Promise<LogoutResponse> => {
    try {
        const response = await apiClient.post<LogoutResponse>('/auth/change-password', {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword,
        });
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * Send OTP for forgot password
 * @param data - Mobile/email and role
 * @returns Promise with forgot password response
 * @throws ApiException if the request fails
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    try {
        const response = await publicApi.post<ForgotPasswordResponse>('/forgot-password', data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Verify OTP for forgot password
 * @param data - OTP, mobile/email and role
 * @returns Promise with verification response including token
 * @throws ApiException if the request fails
 */
export const forgotPasswordVerifyOtp = async (data: ForgotPasswordVerifyOtpRequest): Promise<ForgotPasswordVerifyOtpResponse> => {
    try {
        const response = await publicApi.post<ForgotPasswordVerifyOtpResponse>('/forgot-password/verify-otp', data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};

/**
 * Reset password with token from forgot password flow
 * @param data - Token, new password and confirmation
 * @returns Promise with reset password response
 * @throws ApiException if the request fails
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    try {
        const response = await publicApi.post<ResetPasswordResponse>('/reset-password', data);
        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
};
