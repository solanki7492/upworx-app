export interface OrdersResponse {
    status: boolean;
    type: string;
    data: {
        current_page: number;
        data: OrderItem[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: any[];
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}

export interface OrderDetailsResponse {
    status: boolean;
    data: OrderItem;
}

export interface OrderItem {
    id: number;
    cart_id: number;
    order_id: number;
    package_id: number | null;
    price: number;
    visiting_inspection_cost: number | null;
    repair_cost: number | null;
    convenience_cost: number | null;
    total_price: number;
    service_date: string;
    service_time: string;
    message: string | null;
    cancel_by_id: number | null;
    assign_partner_id: number | null;
    payment_status: string | null;
    created_at: string;
    updated_at: string;
    cart: Cart;
    order: Order;
    order_status: OrderStatus;
    payment_transaction: PaymentTransaction | null;
}

export interface Cart {
    id: number;
    user_id: number;
    name: string;
    service_for: string;
    city: string;
    category_id: number;
    type_id: number | null;
    capacity_id: number | null;
    total_service: number;
    total_service_price: number;
    message: string | null;
    created_at: string;
    updated_at: string;
    services: CartService[];
}

export interface CartService {
    id: number;
    cart_id: number;
    service_id: number;
    qty: number;
    price: number;
    created_at: string;
    updated_at: string;
    service: string;
}

export interface Order {
    id: number;
    user_id: number;
    order_id: string;
    address_id: number;
    date: string;
    order_time: string;
    subtotal: number;
    total: number;
    payment_method: string | null;
    transaction_id: string | null;
    created_at: string;
    updated_at: string;
    address: Address;
}

interface Address {
    id: number;
    user_id: number;
    name: string;
    mobile_number: string;
    email: string | null;
    pincode: string;
    locality: string;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string;
    landmark: string | null;
    alternative_mobile: string | null;
    address_type: string;
    is_default: number;
    created_at: string;
    updated_at: string;
}

export interface OrderStatus {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export interface PaymentTransaction {
    id: number;
    type: string;
    amount: number;
    status: string;
    transaction_id: string;
}

export interface CancelBookingResponse {
    status: boolean;
    message: string;
}

export interface RescheduleBookingRequest {
    date: string;
    time: string;
}

export interface RescheduleBookingResponse {
    status: boolean;
    message: string;
}
