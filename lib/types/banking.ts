export interface BankAccount {
    id: number;
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
    status: 'pending' | 'approved';
    is_default: number;
    created_at: string;
}

export interface BankAccountsResponse {
    data: BankAccount[];
    status: boolean;
}

export interface AddBankAccountRequest {
    bank_name: string;
    account_holder_name: string;
    account_number: string;
    ifsc_code: string;
}

export interface AddBankAccountResponse {
    status: boolean;
    message: string;
    data: BankAccount;
}