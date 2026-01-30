export interface EarningService {
    id: string;
    service: string;
    qty: string;
    price: string;
    l2?: string;
    l3?: string;
}

export interface EarningData {
    id: number;
    order_id: number;
    package_id: string;
    price: number;
    token: string;
    deduction: number;
    total_price: number | null;
    total_price_after: number | null;
    service_date: string;
    service_time: string;
    order_item_status: string | null;
    data: {
        name: string;
        services: EarningService[];
        total_service: number;
        total_service_price: number;
    };
    refund_id: number | null;
    refund_token: number | null;
    refund_deduction: number | null;
    refund_amount: number | null;
}

export interface EarningsResponse {
    data: EarningData[];
    meta: {
        current_page: number;
        last_page: number;
    };
    status: boolean;
    total_earning: number;
}
