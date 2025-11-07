export interface StatsData {
    total_merchant: number;
    approved_merchant: number;
    new_merchant: number;
    rejected_merchant: number;
    pending_merchant: number;
}

export interface TableData {
    id: string;
    merchant_id: string;
    merchant_name: string;
    status: string;
    total_revenue: string;
    date_created: string;
    business_type: string;
    risk_score: string;
}

export interface MerchantData {
    stats: StatsData;
    table: TableData[];
}

export interface PaginationRes {
    totalPage: number;
    currentPage: number | string;
    totalItems: number;
}

export interface MerchantApiPayload {
    data?: MerchantData;
    pagination?: PaginationRes;
}

export type MerchantStatus = 'approved' | 'pending' | 'rejected' | 'new';
