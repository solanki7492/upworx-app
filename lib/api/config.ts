import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://upworx03.upworx.in/api';

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Create axios instance with default configuration
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
    async (config) => {
        const token = await import('../utils/storage').then(module =>
            module.StorageService.getAccessToken()
        );

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle token expiration
            await import('../utils/storage').then(module =>
                module.StorageService.clearAuth()
            );
            // You can add navigation to login screen here if needed
        }

        return Promise.reject(error);
    }
);

export default apiClient;