"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-hot-toast";
import Header from "./Header";
import Buttons from "@/components/buttons";
import { useRouter } from "next/navigation";
import { RouteLiteral } from "nextjs-routes";

export default function SearchPayout() {
    const { authState } = useAuth();
    const [transactionID, setTransactionID] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("details");
    const router = useRouter();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionID) return toast.error("Please enter a transaction ID");

        setLoading(true);
        setTransactionDetails(null);

        try {
            const res = await axiosInstance.get(`/finance/searchPayouts`, {
                params: { search: transactionID },
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (res.data.status) {
                setTransactionDetails(res.data.data[0]);
                toast.success("Details loaded!");
            } else toast.error("Not found.");
        } catch (err) {
            toast.error("Error fetching payout details.");
        } finally {
            setLoading(false);
        }
    };

    const resendwebhook = async () => {
        const { business_id, id } = transactionDetails;
        if (!business_id || !id) return;
        try {
            setLoading(true);
            const res = await axiosInstance.get(
                `/resend_payout_webhook/${business_id}/live/${id}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                }
            );
            toast[res.data.success ? "success" : "error"](res.data.message);
        } catch {
            toast.error("Webhook resend failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-8">
            <Header headerTitle="Search Payout" />

            <div className="max-w-5xl mx-auto">
                <form
                    onSubmit={handleSearch}
                    className="flex flex-col sm:flex-row items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                >
                    <div className="flex-1 w-full">
                        <input
                            value={transactionID}
                            onChange={(e) => setTransactionID(e.target.value)}
                            placeholder="Enter Transaction ID"
                            className="w-full px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                                    />
                                </svg>
                                Searching...
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6a4 4 0 014 4v0a4 4 0 11-8 0 4 4 0 014-4zm0 12a8 8 0 100-16 8 8 0 000 16z"
                                    />
                                </svg>
                                Search
                            </>
                        )}
                    </button>
                </form>

                {transactionDetails && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <TabHeader activeTab={activeTab} setActiveTab={setActiveTab}/>

                        <div className="mt-6">
                            {activeTab === "details" && (
                                <DetailSection details={transactionDetails}/>
                            )}
                            {activeTab === "webhook" && (
                                <WebhookSection
                                    webhook={transactionDetails.webhook_event}
                                    onResend={resendwebhook}
                                    loading={loading}
                                />
                            )}
                            {activeTab === "gateway" && (
                                <JSONViewer
                                    label="Gateway Response"
                                    data={transactionDetails.gateway_response}
                                />
                            )}
                            {activeTab === "business" && (
                                <BusinessSection
                                    business={transactionDetails.business}
                                    businessId={transactionDetails.business_id}
                                    router={router}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabHeader({
                       activeTab,
                       setActiveTab,
                   }: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}) {
    const tabs = ["details", "webhook", "gateway", "business"];
    return (
        <div className="flex flex-wrap gap-2 border-b border-gray-300 dark:border-gray-700">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={`capitalize px-4 py-2 rounded-t-md font-medium transition ${
                        activeTab === tab
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "text-gray-500 dark:text-gray-400 hover:text-green-600"
                    }`}
                    onClick={() => setActiveTab(tab)}
                >
                    {tab}
                </button>
            ))}
        </div>

    );
}

function DetailSection({details}: { details: any }) {
    const items = [
        ["Domain", details.domain],
        ["Amount", details.amount],
        ["Account Name", details.account_name],
        ["Account Number", details.account_number],
        ["Bank", `${details.bank_name} (${details.bank_code})`],
        ["Status", details.status],
        ["Currency", details.currency],
        ["Reference", details.reference],
        ["Session ID", details.sessionid],
        ["Date", details.created_at],
        ["Fee", details.fee],
        ["System Fee", details.sys_fee],
    ];

    return (
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {items.map(([label, value]) => (
                <div key={label}>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {label}
                    </dt>
                    <dd className="text-base">{value ?? "N/A"}</dd>
                </div>
            ))}
        </dl>
    );
}

function WebhookSection({
                            webhook,
                            onResend,
                            loading,
                        }: {
    webhook: any;
    onResend: () => void;
    loading: boolean;
}) {
    return (
        <div>
            <p><strong>Event:</strong> {webhook?.event ?? "N/A"}</p>
            <p><strong>Transaction ID:</strong> {webhook?.trx ?? "N/A"}</p>
            <p><strong>Response Code:</strong> {webhook?.responseCode ?? "N/A"}</p>
            <div className="my-4">
                <Buttons
                    onClick={onResend}
                    label={loading ? "Sending..." : "Resend Notification"}
                    type="smOutlineButton"
                    disabled={loading}
                />
            </div>
            <JSONViewer label="Webhook Request" data={webhook?.request} />
        </div>
    );
}

function BusinessSection({
                             business,
                             businessId,
                             router,
                         }: {
    business: any;
    businessId: string;
    router: any;
}) {
    return (
        <div className="space-y-2">
            <p><strong>Name:</strong> {business?.name}</p>
            <p><strong>Trade Name:</strong> {business?.trade_name}</p>
            <p><strong>Email:</strong> {business?.biz_email}</p>
            <p><strong>Phone:</strong> {business?.biz_phone}</p>
            <p><strong>Website:</strong> {business?.biz_url}</p>
            <p><strong>Address:</strong> {business?.biz_address}</p>
            <button
                onClick={() =>
                    router.push(
                        `/dashboard/operations/merchant/${businessId}/business` as RouteLiteral
                    )
                }
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                View Business
            </button>
        </div>
    );
}

function JSONViewer({ label, data }: { label: string; data: any }) {
    const formatted = (() => {
        try {
            return JSON.stringify(typeof data === "string" ? JSON.parse(data) : data, null, 2);
        } catch {
            return "Invalid or empty JSON";
        }
    })();

    return (
        <div>
            <h3 className="font-semibold mb-2">{label}</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
        {formatted}
      </pre>
        </div>
    );
}
