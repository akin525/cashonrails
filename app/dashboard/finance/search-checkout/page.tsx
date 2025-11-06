"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-hot-toast";
import Header from "./Header";
import { useRouter } from "next/navigation";
import { RouteLiteral } from "nextjs-routes";

export default function SearchCheckout() {
    const { authState } = useAuth();
    const [transactionID, setTransactionID] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const router = useRouter();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionID) return toast.error("Please enter a transaction ID");

        setLoading(true);
        setTransactionDetails(null);

        try {
            const res = await axiosInstance.get(`/finance/search-checkouts`, {
                params: { search: transactionID },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout: 300000,
            });

            if (res.data.status) {
                setTransactionDetails(res.data.data[0]);
                toast.success("Transaction found successfully!");
            } else {
                toast.error("Transaction not found.");
            }
        } catch (err) {
            toast.error("Error fetching transaction details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <Header headerTitle="Search Checkouts" />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Search Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Search Transaction
                    </h2>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                value={transactionID}
                                onChange={(e) => setTransactionID(e.target.value)}
                                placeholder="Enter Transaction ID, Reference, or Email"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Results Section */}
                {transactionDetails && (
                    <div className="space-y-6">
                        {/* Transaction Status Card */}
                        <TransactionStatusCard transaction={transactionDetails} />

                        {/* Tab Navigation */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

                            <div className="p-6">
                                {activeTab === "overview" && <OverviewTab transaction={transactionDetails} />}
                                {activeTab === "customer" && <CustomerTab customer={transactionDetails.customer} />}
                                {activeTab === "business" && (
                                    <BusinessTab
                                        business={transactionDetails.business}
                                        businessId={transactionDetails.business_id}
                                        router={router}
                                    />
                                )}
                                {activeTab === "technical" && <TechnicalTab transaction={transactionDetails} />}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TransactionStatusCard({ transaction }: { transaction: any }) {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Transaction #{transaction.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        {transaction.title || 'Payment Transaction'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 text-right">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {transaction.currency} {parseFloat(transaction.amount).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fee</p>
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                            {transaction.currency} {parseFloat(transaction.fee).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabNavigation({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
    const tabs = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "customer", label: "Customer", icon: "👤" },
        { id: "business", label: "Business", icon: "🏢" },
        { id: "technical", label: "Technical", icon: "⚙️" },
    ];

    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                                ? "border-green-500 text-green-600 dark:text-green-400"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}

function OverviewTab({ transaction }: { transaction: any }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const keyDetails = [
        { label: "Transaction Reference", value: transaction.transactionRef },
        { label: "Reference", value: transaction.reference },
        { label: "Email", value: transaction.email },
        { label: "Phone", value: transaction.phone || "N/A" },
        { label: "Payment Method", value: transaction.paymentMethod },
        { label: "Gateway", value: transaction.gateway },
        { label: "Fee Bearer", value: transaction.feeBearer },
        { label: "Domain", value: transaction.domain },
        { label: "Created At", value: formatDate(transaction.created_at) },
        { label: "Updated At", value: formatDate(transaction.updated_at) },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Transaction Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {keyDetails.map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                {label}
                            </dt>
                            <dd className="text-sm text-gray-900 dark:text-white font-mono break-all">
                                {value || "N/A"}
                            </dd>
                        </div>
                    ))}
                </div>
            </div>

            {transaction.description && (
                <div>
                    <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h4>
                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        {transaction.description}
                    </p>
                </div>
            )}
        </div>
    );
}

function CustomerTab({ customer }: { customer: any }) {
    const customerDetails = [
        { label: "Customer ID", value: customer.id },
        { label: "Customer Code", value: customer.customer_code },
        { label: "Email", value: customer.email },
        { label: "Phone", value: customer.phone },
        { label: "First Name", value: customer.first_name },
        { label: "Last Name", value: customer.last_name },
        { label: "Company Name", value: customer.company_name },
        { label: "Address", value: customer.address },
        { label: "Date of Birth", value: customer.dob },
        { label: "BVN", value: customer.bvn },
        { label: "NIN", value: customer.nin },
        { label: "RC Number", value: customer.rc_number },
        { label: "Status", value: customer.status },
        { label: "Domain", value: customer.domain },
        { label: "Created At", value: new Date(customer.created_at).toLocaleString() },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-xl">👤</span>
                </div>
                <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {customer.first_name && customer.last_name
                            ? `${customer.first_name} ${customer.last_name}`
                            : customer.company_name || customer.email
                        }
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400">{customer.customer_code}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerDetails.map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {label}
                        </dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                            {value || "N/A"}
                        </dd>
                    </div>
                ))}
            </div>

            {customer.metadata && customer.metadata !== '{}' && (
                <div>
                    <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Metadata</h5>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                        {JSON.stringify(JSON.parse(customer.metadata), null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}

function BusinessTab({ business, businessId, router }: { business: any; businessId: string; router: any }) {
    const businessDetails = [
        { label: "Business Name", value: business.name },
        { label: "Trade Name", value: business.trade_name },
        { label: "Email", value: business.biz_email },
        { label: "Phone", value: business.biz_phone },
        { label: "Website", value: business.biz_url },
        { label: "Country", value: business.biz_country },
        { label: "State", value: business.biz_state },
        { label: "City", value: business.biz_city },
        { label: "Address", value: business.biz_address },
        { label: "Industry ID", value: business.industry_id },
        { label: "KYC Status", value: business.kyc_status },
        { label: "Status", value: business.status },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-xl">🏢</span>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {business.name}
                        </h4>
                        <p className="text-gray-500 dark:text-gray-400">ID: {business.id}</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push(`/dashboard/operations/merchant/${businessId}/business` as RouteLiteral)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                    View Business
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessDetails.map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {label}
                        </dt>
                        <dd className="text-sm text-gray-900 dark:text-white">
                            {value || "N/A"}
                        </dd>
                    </div>
                ))}
            </div>

            {business.summary && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h5 className="font-medium mb-3 text-gray-900 dark:text-white">Business Summary</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {business.summary.total_transactions_count.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {parseFloat(business.summary.total_transaction_value).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Transaction Value</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {business.summary.total_revenue.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TechnicalTab({ transaction }: { transaction: any }) {
    const technicalDetails = [
        { label: "Access Code", value: transaction.access_code },
        { label: "Transaction ID", value: transaction.trans_id },
        { label: "Initiation Tran Ref", value: transaction.initiationTranRef },
        { label: "IP Address", value: transaction.ip },
        { label: "Account Number", value: transaction.account_number },
        { label: "Account Name", value: transaction.account_name },
        { label: "Bank Name", value: transaction.bank_name },
        { label: "Account Expiry", value: transaction.accountExpiry },
        { label: "Crypto Wallet ID", value: transaction.crypto_wallet_id },
        { label: "Redirect URL", value: transaction.redirectUrl },
        { label: "Logo URL", value: transaction.logoUrl },
        { label: "Session ID", value: transaction.sessionid },
        { label: "System Fee", value: transaction.sys_fee },
        { label: "Tokenize", value: transaction.tokenize ? "Yes" : "No" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {technicalDetails.map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {label}
                        </dt>
                        <dd className="text-sm text-gray-900 dark:text-white font-mono break-all">
                            {value || "N/A"}
                        </dd>
                    </div>
                ))}
            </div>

            {transaction.extra && transaction.extra !== '{}' && (
                <div>
                    <h5 className="font-medium mb-2 text-gray-900 dark:text-white">Extra Data</h5>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                        {JSON.stringify(JSON.parse(transaction.extra), null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
