export interface Address {
    id: number;
    name: string;
    user_id: number;
    mobile_number: string;
    address_line_1: string;
    address_line_2: string;
    pincode: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    address_type: 'home' | 'work' | 'other';
    default_address: number | null;
    address_for: string | null;
    range_area: number;
    coordinates_updated: number;
    created_at: string;
    updated_at: string;
}

export interface GetAddressesResponse {
    addresses: Address[];
}

export interface CreateAddressRequest {
    name: string;
    mobile_number: string;
    pincode: string;
    address_line_2: string;
    address_line_1: string;
    latitude: string;
    longitude: string;
    city: string;
    state: string;
    address_type: 'home' | 'work' | 'other';
}

export interface UpdateAddressRequest extends CreateAddressRequest { }

export interface AddressResponse {
    status: boolean;
    msg: string;
}

export interface GeocodingResult {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
}
