// User types
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    image: string | null;
    role?: 'CUSTOMER' | 'PARTNER';
    dob?: string;
    gender?: string;
    alternate_phone?: string;
    is_able_to_accept_lead?: boolean;
    at_least_one_id_proof_verified?: {
        name: string;
        url: string;
    }
}

// Auth request types
export interface LoginRequest {
    mobile: string;
    password: string;
    role: 'CUSTOMER' | 'PARTNER';
}

export interface RegisterRequest {
    name: string;
    phone: string;
    email: string;
    password: string;
    terms: number;
}

export interface VerifyOtpRequest {
    otp: string;
    mobile: string;
}

export interface ResendOtpRequest {
    mobile: string;
    role: 'CUSTOMER' | 'PARTNER';
}

// Auth response types
export interface LoginResponse {
    status: boolean;
    message: string;
    token: string;
    user: User;
    role: 'CUSTOMER' | 'PARTNER';
}

export interface RegisterResponse {
    status: boolean;
    message: string;
    data: {
        user_id: number;
        phone: string;
    };
}

export interface VerifyOtpResponse {
    status: boolean;
    message: string;
    token: string;
    user: User;
}

export interface ResendOtpResponse {
    status: boolean;
    message: string;
}

export interface LogoutResponse {
    status: boolean;
    message: string;
}

// Forgot Password types
export interface ForgotPasswordRequest {
    mobile: string;
    role: 'CUSTOMER' | 'PARTNER';
}

export interface ForgotPasswordResponse {
    status: boolean;
    message: string;
}

export interface ForgotPasswordVerifyOtpRequest {
    otp: string;
    mobile: string;
    role: 'CUSTOMER' | 'PARTNER';
}

export interface ForgotPasswordVerifyOtpResponse {
    status: boolean;
    message: string;
    token: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    password_confirmation: string;
}

export interface ResetPasswordResponse {
    status: boolean;
    message: string;
}
