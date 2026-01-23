import { User } from './auth';

export interface UserProfile {
    name: string;
    email: string;
    mobile: string;
    image?: {
        uri: string;
        name: string;
        type: string;
    };
}

export interface UserResponse {
    status: boolean;
    msg: string;
    data: User;
}