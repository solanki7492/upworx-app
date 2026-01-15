import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageService } from '../lib';
import { User } from '../lib/types/auth';

interface AuthContextType {
    user: User | null;
    userRole: 'CUSTOMER' | 'PARTNER' | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    login: (token: string, userData: User, role?: 'CUSTOMER' | 'PARTNER') => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'CUSTOMER' | 'PARTNER' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await StorageService.getAccessToken();
            const userData = await StorageService.getUserData<User>();
            const role = await StorageService.getUserRole();

            if (token && userData) {
                setUser(userData);
                setUserRole(role || userData.role || 'CUSTOMER');
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (token: string, userData: User, role?: 'CUSTOMER' | 'PARTNER') => {
        try {
            const finalRole = role || userData.role || 'CUSTOMER';
            await StorageService.setAuthData(token, userData, finalRole);
            setUser(userData);
            setUserRole(finalRole);
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await StorageService.clearAuth();
            await StorageService.clearAll();
            setUser(null);
            setUserRole(null);
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userRole,
                isAuthenticated: !!user,
                isLoading,
                setUser,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
