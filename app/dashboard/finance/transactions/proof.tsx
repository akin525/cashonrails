import React, { useState } from 'react';
import Image from 'next/image';  // Add this line
import Modal from '@/components/modal';
import Buttons from '@/components/buttons';
import { Download, X, Printer, Copy, CheckCircle } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';
import {string} from "postcss-selector-parser";


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
    chargeback_email: string | null;
    bc_notify: number;
    cc_notify: number;
    bp_notify: number;
    authMode: string;
    acc_prefix_mode: string;
    paymentMethod: string | null;
    defautPaymentMethod: string;
    momo_options: string;
    autoRefund: number;
    instant_settlement: string;
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
}

interface TableData {
    id: string;
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
    plan: string | null;
    card_attempt: number;
    settlement_batchid: string;
    settled_at: string | null;
    split_code: string | null;
    ip_address: string;
    gateway: string;
    gateway_response: string; // JSON string
    webhook_status: string | null;
    webhook_response: string | null;
    webhook_count: number;
    paid_at: string;
    status: string;
    created_at: string;
    updated_at: string;
    business: Business;
};


interface ProofOfPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionData: TableData | null;
}

const ProofOfPaymentModal: React.FC<ProofOfPaymentModalProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     transactionData
                                                                 }) => {
    const [isScreenshotMode, setIsScreenshotMode] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!transactionData) return null;

    const handleScreenshotMode = () => {
        setIsScreenshotMode(true);
        toast.success('Screenshot mode activated!');
        setTimeout(() => {
            setIsScreenshotMode(false);
            toast.success('Screenshot mode deactivated');
        }, 15000);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCopyDetails = () => {
        const details = `
PAYMENT RECEIPT
═══════════════════════════════════════
Transaction ID: ${transactionData.reference}
Amount: ${transactionData.currency} ${Number(transactionData.amount).toLocaleString()}
Status: ${transactionData.status.toUpperCase()}
Date: ${moment(transactionData.paid_at || transactionData.created_at).format('MMM Do YYYY, h:mm A')}
Business: ${transactionData.business.name}
═══════════════════════════════════════
        `.trim();

        navigator.clipboard.writeText(details).then(() => {
            setCopied(true);
            toast.success('Receipt copied!');
            setTimeout(() => setCopied(false), 3000);
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success':
            case 'successful':
                return 'text-green-700 bg-green-100 border-green-200';
            case 'pending':
                return 'text-yellow-700 bg-yellow-100 border-yellow-200';
            case 'failed':
            case 'fail':
                return 'text-red-700 bg-red-100 border-red-200';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            header={
                !isScreenshotMode && (
                    <div className="flex justify-between items-center no-print">
                        <h2 className="text-lg font-semibold text-gray-800">Payment Receipt</h2>
                        <div className="flex gap-2">
                            <Buttons
                                onClick={handleScreenshotMode}
                                label="Screenshot"
                                type="smOutlineButton"
                                icon={<Download className="w-4 h-4" />}
                            />
                            <Buttons
                                onClick={handlePrint}
                                label="Print"
                                type="smOutlineButton"
                                icon={<Printer className="w-4 h-4" />}
                            />
                            <Buttons
                                onClick={handleCopyDetails}
                                label={copied ? "Copied!" : "Copy"}
                                type="smOutlineButton"
                                icon={copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            />
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )
            }
            scrollableContent={false}
        >
            <div className={`bg-white ${isScreenshotMode ? 'p-6' : 'p-4'} max-w-2xl mx-auto`}>
                {/* Header */}
                <div className="text-center mb-6 border-b pb-4">
                    {transactionData.business.logo ? (
                        <Image
                            src={transactionData.business.logo}
                            alt="Logo"
                            width={48}
                            height={48}
                            className="h-12 mx-auto mb-3 object-contain"
                            unoptimized
                        />
                    ) : (
                        <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-white font-bold text-lg">
                                {transactionData.business.name.charAt(0)}
                            </span>
                        </div>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Receipt</h1>
                    <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
                        <span className="text-xs text-gray-600">Receipt #</span>
                        <span className="ml-2 font-mono font-bold text-sm">
                            {transactionData.reference.slice(-8).toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Status */}
                <div className="flex justify-center mb-6">
                    <div className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 border ${getStatusColor(transactionData.status)}`}>
                        <CheckCircle className="w-5 h-5" />
                        <span>Payment {transactionData.status}</span>
                    </div>
                </div>

                {/* Transaction Details - Compact Grid */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4 text-center">Transaction Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white p-3 rounded border">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Amount</label>
                            <p className="text-xl font-bold text-green-600">
                                {transactionData.currency === 'NGN' ? '₦' :
                                    transactionData.currency === 'USD' ? '$' :
                                        transactionData.currency + ' '}
                                {Number(transactionData.amount).toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white p-3 rounded border">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Date</label>
                            <p className="font-semibold text-gray-800">
                                {moment(transactionData.paid_at || transactionData.created_at).format('MMM Do, YYYY')}
                            </p>
                            <p className="text-xs text-gray-600">
                                {moment(transactionData.paid_at || transactionData.created_at).format('h:mm A')}
                            </p>
                        </div>

                        <div className="bg-white p-3 rounded border">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Method</label>
                            <p className="font-medium text-gray-800 capitalize">
                                {transactionData.channel === "banktransfer" ? "Bank Transfer" : transactionData.type}
                            </p>
                        </div>

                        <div className="bg-white p-3 rounded border">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Gateway</label>
                            <p className="font-medium text-gray-800 capitalize">{transactionData.gateway}</p>
                        </div>
                    </div>

                    {/* Transaction ID - Full width */}
                    <div className="bg-white p-3 rounded border mt-4">
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Transaction ID</label>
                        <p className="font-mono text-sm text-gray-800 break-all">{transactionData.reference}</p>
                    </div>
                </div>

                {/* Business Info - Compact */}
                <div className="border-t pt-4 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 text-center">Merchant Details</h3>
                    <div className="bg-white border rounded-lg p-4">
                        <div className="grid grid-cols-1 gap-3 text-sm">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Business</label>
                                <p className="font-bold text-gray-800">{transactionData.business.name}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Email</label>
                                    <p className="text-gray-800 break-all">{transactionData.business.biz_email}</p>
                                </div>

                                {transactionData.business.biz_phone && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Phone</label>
                                        <p className="text-gray-800">{transactionData.business.biz_phone}</p>
                                    </div>
                                )}
                            </div>

                            {transactionData.business.biz_address && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Address</label>
                                    <p className="text-gray-800 text-xs leading-relaxed">{transactionData.business.biz_address}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Compact */}
                <div className="border-t pt-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <span className="font-bold text-gray-800">Official Receipt</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                            Generated on {moment().format('MMM Do YYYY, h:mm A')}
                        </p>
                        <p className="text-xs text-gray-500">
                            This is a computer-generated receipt and serves as proof of payment.
                        </p>

                        {/* Security indicators */}
                        <div className="flex justify-center items-center gap-3 mt-3 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-gray-500">Verified</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-500">Secure</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="text-gray-500">Official</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Screenshot Mode Indicator */}
                {isScreenshotMode && (
                    <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                        <div className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            <div>
                                <p className="font-bold text-sm">Screenshot Mode</p>
                                <p className="text-xs opacity-90">Ready for capture!</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ProofOfPaymentModal;
