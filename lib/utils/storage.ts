import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: '@upworx/access_token',
    REFRESH_TOKEN: '@upworx/refresh_token',
    USER_DATA: '@upworx/user_data',
    USER_ROLE: '@upworx/user_role',
    SELECTED_CITY: '@upworx/selected_city',
} as const;

export class StorageService {
    /**
     * Store access token securely
     */
    static async setAccessToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        } catch (error) {
            console.error('Error storing access token:', error);
            throw new Error('Failed to store access token');
        }
    }

    /**
     * Get access token
     */
    static async getAccessToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        } catch (error) {
            console.error('Error retrieving access token:', error);
            return null;
        }
    }

    /**
     * Store refresh token
     */
    static async setRefreshToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
        } catch (error) {
            console.error('Error storing refresh token:', error);
            throw new Error('Failed to store refresh token');
        }
    }

    /**
     * Get refresh token
     */
    static async getRefreshToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        } catch (error) {
            console.error('Error retrieving refresh token:', error);
            return null;
        }
    }

    /**
     * Store user data
     */
    static async setUserData(userData: Record<string, any>): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        } catch (error) {
            console.error('Error storing user data:', error);
            throw new Error('Failed to store user data');
        }
    }

    /**
     * Get user data
     */
    static async getUserData<T = Record<string, any>>(): Promise<T | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error retrieving user data:', error);
            return null;
        }
    }

    /**
     * Store auth data (token, user, and role)
     */
    static async setAuthData(token: string, userData: Record<string, any>, role?: string): Promise<void> {
        try {
            const items: [string, string][] = [
                [STORAGE_KEYS.ACCESS_TOKEN, token],
                [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
            ];

            if (role) {
                items.push([STORAGE_KEYS.USER_ROLE, role]);
            }

            await AsyncStorage.multiSet(items);
        } catch (error) {
            console.error('Error storing auth data:', error);
            throw new Error('Failed to store auth data');
        }
    }

    /**
     * Check if user is authenticated
     */
    static async isAuthenticated(): Promise<boolean> {
        const token = await this.getAccessToken();
        return !!token;
    }

    /**
     * Clear all authentication data
     */
    static async clearAuth(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.ACCESS_TOKEN,
                STORAGE_KEYS.REFRESH_TOKEN,
                STORAGE_KEYS.USER_DATA,
                STORAGE_KEYS.USER_ROLE,
            ]);
        } catch (error) {
            console.error('Error clearing auth data:', error);
            throw new Error('Failed to clear authentication data');
        }
    }

    /**
     * Clear all storage data (for debugging/logout)
     */
    static async clearAll(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing all storage:', error);
            throw new Error('Failed to clear storage');
        }
    }

    /**
     * Store selected city
     */
    static async setSelectedCity(city: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_CITY, city);
        } catch (error) {
            console.error('Error storing selected city:', error);
            throw new Error('Failed to store selected city');
        }
    }

    /**
     * Get selected city
     */
    static async getSelectedCity(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_CITY);
        } catch (error) {
            console.error('Error retrieving selected city:', error);
            return null;
        }
    }

    /**
     * Store user role
     */
    static async setUserRole(role: 'CUSTOMER' | 'PARTNER'): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
        } catch (error) {
            console.error('Error storing user role:', error);
            throw new Error('Failed to store user role');
        }
    }

    /**
     * Get user role
     */
    static async getUserRole(): Promise<'CUSTOMER' | 'PARTNER' | null> {
        try {
            const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
            return role as 'CUSTOMER' | 'PARTNER' | null;
        } catch (error) {
            console.error('Error retrieving user role:', error);
            return null;
        }
    }
}