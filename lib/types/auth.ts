// User types
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    image: string | null;
}

// Auth request types
export interface LoginRequest {
    mobile: string;
    password: string;
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
}

// Auth response types
export interface LoginResponse {
    status: boolean;
    message: string;
    token: string;
    user: User;
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
