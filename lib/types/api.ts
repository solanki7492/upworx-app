// Common API Error types
export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}

export class ApiException extends Error {
    statusCode?: number;
    errors?: Record<string, string[]>;

    constructor(message: string, statusCode?: number, errors?: Record<string, string[]>) {
        super(message);
        this.name = 'ApiException';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
