import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: '@mockmate/access_token',
    REFRESH_TOKEN: '@mockmate/refresh_token',
    USER_DATA: '@mockmate/user_data',
    HAS_SEEN_ONBOARDING: '@mockmate/has_seen_onboarding',
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
    static async getUserData(): Promise<Record<string, any> | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error retrieving user data:', error);
            return null;
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
}