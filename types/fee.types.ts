export type FeeType = "collection" | "payout";

export interface BaseFeeData {
    id: string;
    currency: string;
    fee_type: "percent" | "flat" | "";
    fee: string;
    status?: number;
}

export interface CollectionFeeData extends BaseFeeData {
    fee_cap?: string;
}

export interface PayoutFeeData extends BaseFeeData {
    range_set?: string;
    min_fee?: string;
    max_fee?: string;
}

export type MerchantFeeData = CollectionFeeData | PayoutFeeData;

export interface FeeFormData {
    id?: string;
    currency: string;
    fee_type: string;
    fee: string;
    fee_cap?: string;
    range_set?: string;
    min_fee?: string;
    max_fee?: string;
}

export interface FeeApiResponse {
    status: boolean;
    message: string;
    data: {
        collection_fee: CollectionFeeData[];
        payout_fee: PayoutFeeData[];
    };
}

export interface SelectOption {
    label: string;
    value: string;
}
