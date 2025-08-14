"use client"
import { TableDetailSkeleton } from '@/components/loaders';
import { useAuth } from '@/contexts/authContext';
import axiosInstance from '@/helpers/axiosInstance';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Summary {
    total_transactions_count: number;
    total_transaction_value: number;
    total_revenue: number;
  }
  
  interface Business {
    id: number;
    user_id: number;
    name: string;
    trade_name: string;
    acc_prefix: string;
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
    biz_phone: string;
    biz_url: string | null;
    biz_country: string;
    biz_country_isoName: string;
    biz_state: string | null;
    biz_city: string | null;
    biz_address: string;
    support_email: string;
    support_phone: string;
    chargeback_email: string;
    bc_notify: number;
    cc_notify: number;
    bp_notify: number;
    authMode: string;
    acc_prefix_mode: string;
    paymentMethod: string | null;
    defautPaymentMethod: string;
    momo_options: string;
    autoRefund: number;
    kyc_status: string;
    kyc_reason_for_rejection: string | null;
    kyc_rejection_comment: string | null;
    phone_otp: string;
    phone_verified: number;
    id_verified: number;
    referral: string | null;
    ref_code: string;
    feeBearer: string;
    collection_status: number;
    payout_status: number;
    payout_limit_per_trans: string;
    status: string;
    created_at: string;
    updated_at: string;
    summary: Summary;
  }
  
  interface Transaction {
    id: number;
    business_id: number;
    trx: string;
    reference: string;
    transactionRef: string | null;
    sessionid: string | null;
    batch_id: string | null;
    currency: string;
    amount: string;
    fee: string;
    fee_source: string;
    sys_fee: string;
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    narration: string;
    sender_name: string;
    paymentMode: string;
    request_ip: string;
    initiator: string;
    domain: string;
    source: string;
    gateway: string;
    gateway_response: string | null;
    message: string | null;
    status: string;
    reversed: string;
    reversed_by: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    business: Business;
  }
  

const Page = ({ params }: { params: { id: string } }) => {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { authState } = useAuth();

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            if (!authState?.token) return;

            try {
                setIsLoading(true);
                const response = await axiosInstance.get<Transaction>(`/finance/payouts/${params.id}`, {
                    headers: {
                        Authorization: `Bearer ${authState.token}`
                    }
                });

                if (response.data.data && response.data.status) {
                    setTransaction(response.data.data);
                } else {
                    toast.error(response.data.message || "Something went wrong");
                }
                setIsLoading(false);
            } catch (err) {
                setError('Failed to fetch transaction details');
                setIsLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [params.id, authState?.token]);

    if (isLoading) {
        return <TableDetailSkeleton/>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-y pb-4 border-[#E4E7EC] pt-5">
            <div className="border-r border-[#E4E7EC]">
                <h2 className="text-xl font-medium mb-6">Payment Information</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Merchant Name</p>
                            <p className="font-medium">{transaction?.business.name}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Merchant ID</p>
                            <p className="font-medium">#{transaction?.business.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Transaction ID</p>
                            <p className="font-medium">{transaction?.trx}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Fees</p>
                            <p className="font-medium">{transaction?.fee}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Amount Requested</p>
                            <p className="font-medium">{transaction?.amount}</p>

                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Amount Paid</p>
                            <p className="font-medium">{transaction?.amount}</p>

                        </div>
                    </div>

                    <div>
                        <p className="text-[#00000066] text-sm">IP Address</p>
                        <p className="font-medium">{transaction?.request_ip}</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h2 className="text-xl font-medium mb-6">Beneficiary Information</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Account Name</p>
                            <p className="font-medium">{transaction?.account_name}</p>

                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[#00000066] text-sm">Bank Name</p>
                            <p className="font-medium">{transaction?.bank_name}</p>
                        </div>
                        <div>
                            <p className="text-[#00000066] text-sm">Account Number</p>
                            <p className="font-medium">{transaction?.account_number}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;