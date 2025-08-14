"use client";

import React, { useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import { toast } from "react-hot-toast";
import Header from "./Header";
import Buttons from "@/components/buttons";
import {string} from "postcss-selector-parser";
import {RouteLiteral} from "nextjs-routes";
import {useRouter} from "next/navigation";

export default function SearchIncoming() {
    const { authState } = useAuth();
    const [transactionID, setTransactionID] = useState("");
    const [loading, setLoading] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState<any>(null);
    const [webhookOpen, setWebhookOpen] = useState(false);
    const [gatewayOpen, setGatewayOpen] = useState(false);
    const router = useRouter()

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionID) {
            toast.error("Please enter a transaction ID");
            return;
        }

        setLoading(true);
        setTransactionDetails(null);

        try {
            const response = await axiosInstance.get(`/finance/search-transfer`, {
                params:{search: transactionID} ,
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:60000

            });

            if (response.data.status) {
                setTransactionDetails(response.data.data[0]);
                toast.success("Incoming Transfer details loaded successfully!");
            } else {
                toast.error("Payout not found.");
            }
        } catch (error) {
            console.error("Error fetching payout details:", error);
            toast.error("Something went wrong while fetching the payout details.");
        } finally {
            setLoading(false);
        }
    };
    const resendwebhook = async (businessId?: string, transactionId?: string) => {
        if (!businessId || !transactionId) {
            console.error("Missing businessId or transactionId");
            return;
        }


        try {
            setLoading(true);
            const response = await axiosInstance.get<Response>(
                `/resend_transaction_webhook/${businessId}/live/${transactionId}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                    timeout:60000

                }
            );
            if (response.data.success){
                toast.success(response.data.message);
            }else {
                toast.error(response.data.message);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }; // Fix dependency array

    return (
        <div>
            <Header headerTitle="Search Incoming Transfer" />
            <div className="flex flex-col items-center min-h-screen bg-gray-100 p-8">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
                    <h2 className="text-2xl font-bold text-green-600 text-center mb-6">Search Incoming Transfer</h2>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium">Transfer ID/SessionID/Account Number</label>
                            <input
                                type="text"
                                value={transactionID}
                                onChange={(e) => setTransactionID(e.target.value)}
                                className="w-full p-3 border-2 rounded-md focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className={`w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition ${
                                    loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={loading}
                            >
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </form>

                    {transactionDetails && (
                        <div>
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold mb-3">incoming Transfer Details</h3>
                                <table className="min-w-full bg-white border rounded-lg shadow-md">
                                    <thead>
                                    <tr className="bg-green-500 text-white">
                                        <th className="p-4 text-left">Field</th>
                                        <th className="p-4 text-left">Value</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {[
                                        {label: "Domain", value: transactionDetails.domain},
                                        {label: "Amount", value: transactionDetails.amount},
                                        {label: "Sender Account Name", value: transactionDetails.sender_account_name},
                                        {label: "Account Number", value: transactionDetails.account_number},
                                        {label: "Sender Account Number", value: transactionDetails.sender_account_number},
                                        {label: "Sender Bank Code", value: transactionDetails.sender_bank_code},
                                        {label: "Stamp Duty", value: transactionDetails.stamp_duty},
                                        {label: "Status", value: transactionDetails.status},
                                        {label: "Currency", value: transactionDetails.currency},
                                        {label: "Reference", value: transactionDetails.reference},
                                        {label: "Webhook Response", value: transactionDetails.webhook_event.response},
                                        // {label: "Webhook status", value: transactionDetails.webhook_status},
                                        {label: "Fee", value: transactionDetails.fee},
                                        {label: "Gateway", value: transactionDetails.gateway},
                                        {label: "Webhook Count", value: transactionDetails.webhook_event.round},
                                    ].map((item, index) => (
                                        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                            <td className="p-4 border">{item.label}</td>
                                            <td className="p-4 border">{item.value ?? "N/A"}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>


                                {/* Webhook Section */}
                                <button onClick={() => setWebhookOpen(!webhookOpen)}
                                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md m-3">
                                    {webhookOpen ? "Hide Webhook Event" : "View Webhook Event"}
                                </button>
                                {webhookOpen && (
                                    <div className="mt-3 bg-gray-100 p-4 rounded-md border">
                                        <p><strong>Event:</strong> {transactionDetails.webhook_event?.event ?? "N/A"}
                                        </p>
                                        <p><strong>Transaction
                                            ID:</strong> {transactionDetails.webhook_event?.trx ?? "N/A"}
                                        </p>
                                        <Buttons
                                            onClick={() => resendwebhook(transactionDetails?.business_id as any, transactionDetails?.id)}
                                            label={loading ? "Sending..." : "Resend Notification"}
                                            fullWidth
                                            type="smOutlineButton"
                                            disabled={loading}
                                        />

                                        <p><strong>Response
                                            Code:</strong> {transactionDetails.webhook_event?.responseCode ?? "N/A"}</p>
                                        <pre className="whitespace-pre-wrap bg-white p-3 rounded-md border">
                                        {(() => {
                                            try {
                                                return JSON.stringify(JSON.parse(transactionDetails.webhook_event?.request ?? "{}"), null, 2);
                                            } catch {
                                                return "Invalid JSON data";
                                            }
                                        })()}
                                    </pre>
                                    </div>
                                )}

                                {/* Gateway Response Section */}
                                <button onClick={() => setGatewayOpen(!gatewayOpen)}
                                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md">
                                    {gatewayOpen ? "Hide Gateway Response" : "View Gateway Response"}
                                </button>
                                {gatewayOpen && (
                                    <div className="mt-3 bg-gray-100 p-4 rounded-md border">
                                        <p><strong>Response
                                            Code:</strong> {transactionDetails.gateway_response?.responseCode ?? "N/A"}
                                        </p>
                                        <pre className="whitespace-pre-wrap bg-white p-3 rounded-md border">
                                        {(() => {
                                            try {
                                                return JSON.stringify(JSON.parse(transactionDetails.gateway_response ?? "{}"), null, 2);
                                            } catch {
                                                return transactionDetails.gateway_response?.message ?? "No Response Message";
                                            }
                                        })()}
                                    </pre>
                                    </div>
                                )}


                            </div>
                            <h3 className="text-lg font-semibold mt-6 mb-3">Business Details</h3>
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
                                <p><strong>Business Name:</strong> {transactionDetails.business?.name ?? "N/A"}</p>
                                <p><strong>Trade Name:</strong> {transactionDetails.business?.trade_name ?? "N/A"}</p>
                                <p><strong>Email:</strong> {transactionDetails.business?.biz_email ?? "N/A"}</p>
                                <p><strong>Phone:</strong> {transactionDetails.business?.biz_phone ?? "N/A"}</p>
                                <p>
                                    <strong>Website:</strong>{" "}
                                    {transactionDetails.business?.biz_url ? (
                                        <a
                                            href={transactionDetails.business.biz_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500"
                                        >
                                            {transactionDetails.business.biz_url}
                                        </a>
                                    ) : "N/A"}
                                </p>
                                <p><strong>Address:</strong> {transactionDetails.business?.biz_address ?? "N/A"}</p>
                                <button
                                    onClick={() => router.push(`/dashboard/operations/merchant/${transactionDetails?.business_id}/business` as RouteLiteral)}
                                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md">Go to Business
                                </button>
                            </div>
                        </div>
                            )}
                        </div>
                        </div>
                        </div>
                        );
                    }