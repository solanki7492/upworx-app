export interface LedgerItem {
    id: number;
    package_id: number;
    trans_mode: string;
    type: string;
    nature: string;
    amount: number;
    trans_status: string;
    transaction_id: string;
    l_date: string;
    tr_reference_no: string;
    data?: {
        name?: string;
    };
}

export interface LedgerResponse {
    status: boolean;
    message: string;
    data: LedgerItem[];
    total_balance: number;
    link: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
    };
}