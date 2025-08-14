"use client"
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import axiosInstance from '@/helpers/axiosInstance';
import toast from 'react-hot-toast';
import { TableDetailSkeleton } from '@/components/loaders';

export interface TransactionResponse {
    id: number;
    business_id: number;
    currency: string;
    amount: string;
    requested_amount: string;
    fee: string;
    stamp_duty: string;
    total: string;
    sys_fee: string;
    trx: string;
    reference: string;
    channel: string;
    type: string;
    domain: string;
    customer_id: number;
    plan: null;
    card_attempt: number;
    settlement_batchid: null;
    settled_at: null;
    split_code: null;
    ip_address: string;
    gateway: string;
    gateway_response: string;
    webhook_status: null;
    webhook_response: null;
    paid_at: string;
    status: string;
    created_at: string;
    updated_at: string;
    merchant: {
        id: number;
        user_id: number;
        name: string;
        trade_name: string;
        acc_prefix: string;
        industry_id: number;
        category_id: number;
        business_type: string;
        description: null;
        class: null;
        rcNumber: null;
        tin: null;
        logo: null;
        international_payment: number;
        local_settlement_day: number;
        foreign_settlement_day: number;
        rolling_reserve: string;
        rolling_duration: number;
        rs: number;
        trans_limit: string;
        biz_email: string;
        biz_bvn: null;
        bvn_verify: number;
        biz_phone: string;
        biz_url: null;
        biz_country: string;
        biz_country_isoName: string;
        biz_state: null;
        biz_city: null;
        biz_address: string;
        support_email: string;
        support_phone: string;
        chargeback_email: string;
        bc_notify: number;
        cc_notify: number;
        bp_notify: number;
        authMode: string;
        acc_prefix_mode: string;
        paymentMethod: null;
        defautPaymentMethod: string;
        momo_options: string;
        autoRefund: number;
        kyc_status: string;
        kyc_reason_for_rejection: null;
        kyc_rejection_comment: null;
        phone_otp: string;
        phone_verified: number;
        id_verified: number;
        referral: null;
        ref_code: string;
        feeBearer: string;
        collection_status: number;
        payout_status: number;
        payout_limit_per_trans: string;
        status: string;
        created_at: string;
        updated_at: string;
        summary: {
            total_transactions_count: number;
            total_transaction_value: number;
            total_revenue: number;
        };
    };
    customer: {
        id: number;
        business_id: number;
        account_name: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        bvn: string;
        nin: string;
        address: string;
        dob: string;
        customer_code: string;
        metadata: string;
        domain: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
};
const Page = ({ params }: { params: { id: string } }) => {
    const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { authState } = useAuth();

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            if (!authState?.token) return;

            try {
                setIsLoading(true);
                const response = await axiosInstance.get<TransactionResponse>(`/finance/transactions/${params.id}`, {
                    headers: {
                        Authorization: `Bearer ${authState.token}`
                    }
                });

                if (response.data.data && response.data.status) {
                    setTransaction(response.data.data);
                }else{
                    toast.error(response.data.message || "Something went wrong")
                }
                setIsLoading(false);
            } catch (err) {
                setError('Failed to fetch transaction details');
                setIsLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [params.id, authState?.token]);

    if (isLoading) return <TableDetailSkeleton />;
    if (error) return <div>{error}</div>;
    if (!transaction) return <div>No transaction found</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t border-[#E4E7EC] pt-5">
            <div className="border-r border-[#E4E7EC]">
                <h2 className="text-xl font-medium mb-6">Payment Information</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Merchant Name</p>
                            <p className="font-medium">{transaction.merchant.name}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Merchant ID</p>
                            <p className="font-medium">#{transaction.merchant.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Transaction ID</p>
                            <p className="font-medium">{transaction.trx}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Fees</p>
                            <p className="font-medium">₦{transaction.fee}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Amount Requested</p>
                            <p className="font-medium">₦{transaction.requested_amount}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Amount Paid</p>
                            <p className="font-medium">₦{transaction.amount}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-[#00000066] text-sm">IP Address</p>
                        <p className="font-medium">{transaction.ip_address}</p>
                    </div>
                </div>
                <br />
                <hr />
                <h2 className="text-xl font-medium mt-8 mb-6">Customer Information</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">First Name</p>
                            <p className="font-medium">{transaction.customer.first_name}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Last Name</p>
                            <p className="font-medium">{transaction.customer.last_name}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Support Email</p>
                            <p className="font-medium break-all">{transaction.customer.email}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Phone Number</p>
                            <p className="font-medium">{transaction.customer.phone}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h2 className="text-xl font-medium mb-6">Payment Information</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Payment Type</p>
                            <p className="font-medium">{transaction.type}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Channel</p>
                            <p className="font-medium">{transaction.channel}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Gateway</p>
                            <p className="font-medium">{transaction.gateway}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Status</p>
                            <p className="font-medium">{transaction.status}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;