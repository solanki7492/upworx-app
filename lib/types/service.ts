// Service types
export interface Service {
    id: number;
    name: string;
    slug: string;
    icon_image: string;
}

// API Response types
export interface GetServicesResponse {
    data: Service[];
}

export interface GetServiceByIdResponse {
    data: Service;
}
