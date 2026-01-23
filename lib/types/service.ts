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

export interface ServiceCategory {
    id: number;
    name: string;
    slug: string;
}

export interface ServiceAddress {
    id: number;
    address_line_1: string;
    city: string;
    state: string;
    range_area: number;
}

export interface ServiceItem {
    id: number;
    category_id: number;
    status: number;
    category: ServiceCategory;
    address: ServiceAddress;
    created_at: string;
}

export interface GetPartnerServicesResponse {
    data: ServiceItem[];
    status: boolean;
}

export interface PartnerAddress {
    id: number;
    address_line_1: string;
    range_area: number;
}

export interface GetPartnerAddressesResponse {
    data: PartnerAddress[];
    status: boolean;
}

export type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface DayAvailability {
    available: DayKey;
    start: string;
    end: string;
}

export type AvailabilityState = Record<DayKey, DayAvailability>;

export interface DayAvailabilityResponse {
    data: AvailabilityState;
    status: boolean;
}

