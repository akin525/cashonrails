// contexts/merchantContext.tsx
"use client"

import React, { createContext, useContext } from 'react'
// types/merchant.ts

export interface MerchantSummary {
    total_transactions_count: number
    total_transaction_value: number
    total_revenue: number
}

export interface BusinessType {
    id: number
    name: string
    message: string
    documents: string
    status: string
    created_at: string
    updated_at: string
}

export interface Industry {
    id: number
    name: string
    status: string
    created_at: string
    updated_at: string
}

export interface Category {
    id: number
    industry_id: number
    name: string
    status: string
    created_at: string
    updated_at: string
}

export type PaymentMethod = 'card' | string
export type MomoOptions = 'default' | string
export type AuthMode = 'pin' | string
export type KycStatus = 'approved' | 'pending' | 'rejected'
export type Status = 'active' | 'inactive'
export type FeeBearer = 'merchant' | string

export interface MerchantData {
    id: number
    user_id: number
    name: string
    trade_name: string
    acc_prefix: string
    industry_id: number
    category_id: number
    business_type: string
    description: string | null
    class: string | null
    rcNumber: string | null
    tin: string | null
    logo: string | null
    international_payment: number
    local_settlement_day: number
    foreign_settlement_day: number
    rolling_reserve: string
    rolling_duration: number
    rs: number
    trans_limit: string
    biz_email: string
    biz_bvn: string | null
    bvn_verify: number
    biz_phone: string
    biz_url: string | null
    biz_country: string
    biz_country_isoName: string
    biz_state: string | null
    biz_city: string | null
    biz_address: string
    support_email: string
    support_phone: string
    chargeback_email: string
    bc_notify: number
    cc_notify: number
    bp_notify: number
    authMode: AuthMode
    acc_prefix_mode: 'on' | 'off'
    paymentMethod: PaymentMethod | null
    defautPaymentMethod: PaymentMethod
    momo_options: MomoOptions
    autoRefund: number
    kyc_status: KycStatus
    kyc_reason_for_rejection: string | null
    kyc_rejection_comment: string | null
    phone_otp: string
    phone_verified: number
    id_verified: number
    referral: string | null
    ref_code: string
    feeBearer: FeeBearer
    collection_status: number
    payout_status: number
    payout_limit_per_trans: string
    status: Status
    created_at: string
    updated_at: string
    summary: MerchantSummary
    btype: BusinessType
    industry: Industry
    category: Category
}

export interface MerchantWallets {
    id: number;
    business_id: number;
    currency: string;
    balance: number;
    pending: string;
    rolling_reserve: string;
    domain: string;
    wallet_limit: string;
    low_balance: string;
    status: number;
    created_at: string; // ISO date string
    updated_at: string; // ISO date string
}
  

// Helper types for API responses
export interface ApiResponse<T> {
    status: string
    message: string
    success: boolean
    data: T
}

export type MerchantResponse = ApiResponse<MerchantData>

// Helper types for specific use cases
export interface MerchantBasicInfo {
    id: number
    name: string
    trade_name: string
    status: Status
    biz_email: string
    biz_phone: string
}

export interface MerchantKycInfo {
    kyc_status: KycStatus
    kyc_reason_for_rejection: string | null
    kyc_rejection_comment: string | null
    bvn_verify: number
    phone_verified: number
    id_verified: number
}

export interface MerchantSettlementInfo {
    local_settlement_day: number
    foreign_settlement_day: number
    rolling_reserve: string
    rolling_duration: number
    payout_limit_per_trans: string
}

interface MerchantContextType {
    merchantData: MerchantData | null
    isLoading: boolean
    merchantId: string
    merchantWallets: MerchantWallets[] | []
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined)

export function MerchantProvider({
    children,
    merchantData,
    isLoading,
    merchantId,
    merchantWallets
}: {
    children: React.ReactNode
    merchantData: MerchantData | null
    isLoading: boolean
    merchantId: string
    merchantWallets:MerchantWallets[] | []
}) {
    return (
        <MerchantContext.Provider value={{ merchantData, isLoading, merchantId, merchantWallets }}>
            {children}
        </MerchantContext.Provider>
    )
}

export function useMerchant() {
    const context = useContext(MerchantContext)
    if (context === undefined) {
        throw new Error('useMerchant must be used within a MerchantProvider')
    }
    return context
}