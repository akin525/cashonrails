import { AuthMode } from "@/contexts/reducerTypes";

export interface GetBusinessesResponse {
    id: number;
    user_id: number;
    name: string;
    trade_name: string;
    industry_id: number;
    category_id: number;
    business_type: string;
    description: string | null;
    class: string | null;
    rcNumber: string | null;
    tin: string | null;
    logo: string | null;
    international_payment: number;
    local_settlement_day: number;
    foreign_settlement_day: number;
    rolling_reserve: string;
    rolling_duration: number;
    rs: number;
    trans_limit: string;
    biz_email: string;
    biz_bvn: string | null;
    bvn_verify: number;
    biz_phone: string | null;
    biz_url: string | null;
    biz_country: string;
    biz_country_isoName: string;
    biz_state: string | null;
    biz_city: string | null;
    biz_address: string | null;
    support_email: string | null;
    support_phone: string | null;
    chargeback_email: string | null;
    bc_notify: number;
    cc_notify: number;
    bp_notify: number;
    authMode: AuthMode;
    acc_prefix_mode: string;
    paymentMethod: string | null;
    defautPaymentMethod: string;
    momo_options: string;
    autoRefund: number;
    kyc_status: string;
    phone_otp: string | null;
    phone_verified: number;
    id_verified: number;
    referral: string | null;
    ref_code: string;
    collection_status: number;
    payout_status: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export enum ROLES_ENUMS {
    member = 1,
    head = 2,
    executive = 3
}

export enum STATUS_ENUMS {
    pending = 1,
    approved = 2,
    deactivated = 3
    
}
export enum STAFF_ENUMS {
    pending = 0,
    approved = 1,
    deactivated = 3

}