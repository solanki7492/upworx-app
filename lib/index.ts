// Export storage utilities
export { STORAGE_KEYS, StorageService } from './utils/storage';

// Export API client for other services
export { apiClient } from './api/config';

// Export types
export type { Address, AddressResponse, CreateAddressRequest, GeocodingResult, GetAddressesResponse, UpdateAddressRequest } from './types/address';
export { ApiException } from './types/api';
export type { ApiError } from './types/api';
export type { ForgotPasswordRequest, ForgotPasswordResponse, ForgotPasswordVerifyOtpRequest, ForgotPasswordVerifyOtpResponse, LoginRequest, LoginResponse, LogoutResponse, RegisterRequest, RegisterResponse, ResendOtpRequest, ResendOtpResponse, ResetPasswordRequest, ResetPasswordResponse, User, VerifyOtpRequest, VerifyOtpResponse } from './types/auth';
export type { GetServiceByIdResponse, GetServicesResponse, Service } from './types/service';

// Export services API
export { forgotPassword, forgotPasswordVerifyOtp, getServiceById, getServices, login, logout, register, resendOtp, resetPassword, verifyOtp } from './services';
export { createAddress, deleteAddress, getAddresses, updateAddress } from './services/address';

// Export custom hooks
export { useServices } from './hooks/useServices';
