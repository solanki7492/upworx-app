// Export storage utilities
export { STORAGE_KEYS, StorageService } from './utils/storage';

// Export API client for other services
export { apiClient } from './api/config';

// Export types
export { ApiException } from './types/api';
export type { ApiError } from './types/api';
export type { LoginRequest, LoginResponse, LogoutResponse, RegisterRequest, RegisterResponse, ResendOtpRequest, ResendOtpResponse, User, VerifyOtpRequest, VerifyOtpResponse } from './types/auth';
export type { GetServiceByIdResponse, GetServicesResponse, Service } from './types/service';

// Export services API
export { getServiceById, getServices, login, logout, register, resendOtp, verifyOtp } from './services';

// Export custom hooks
export { useServices } from './hooks/useServices';
