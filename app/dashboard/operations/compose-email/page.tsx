'use client';

import React, { useEffect, useState, useCallback } from 'react';
import 'react-quill/dist/quill.snow.css';
import Header from "./Header";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface Business {
    id: string;
    merchant_name: string;
    merchant_id: string;
}

export default function EmailComposer() {
    const { authState } = useAuth();

    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState('');
    const [merchantSearch, setMerchantSearch] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedBizId, setSelectedBizId] = useState('');
    const [businesses, setBusinesses] = useState<Business[]>([]);

    const fetchBusinesses = useCallback(async () => {
        if (merchantSearch.trim() && authState.token) {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosInstance.get(`/operations/merchants`, {
                    params: { name: merchantSearch },
                    headers: { Authorization: `Bearer ${authState.token}` },
                });

                if (!response.data.status) {
                    throw new Error(response.data.message || "Failed to find business");
                }

                const merchants = response.data.data?.table || [];
                setBusinesses(merchants);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unexpected error occurred");
                }
            } finally {
                setLoading(false);
            }
        } else {
            setBusinesses([]);
        }
    }, [merchantSearch, authState.token]); // Added dependencies

    useEffect(() => {
        const debounceTime = 500;
        const timeoutId = setTimeout(fetchBusinesses, debounceTime);
        return () => clearTimeout(timeoutId);
    }, [merchantSearch, fetchBusinesses]); // Added fetchBusinesses

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMerchantSearch(e.target.value);
    };

    const handleBusinessSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedBizId(id);
    };

    const sendmail = async () => {
        if (!subject.trim() || !content.trim() || !selectedBizId) {
            toast.error("Subject, content, and merchant must be selected.");
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.post(
                '/sendmail',
                {
                    subject,
                    mail_body: content,
                    business_id: selectedBizId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );
            toast.success("Email sent successfully!");
            setSubject('');
            setContent('');
            setSelectedBizId('');
            setMerchantSearch('');
            setBusinesses([]);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header headerTitle={'Compose Email'} />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="space-y-2">
                    <label className="block text-lg font-semibold">Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email subject"
                    />
                </div>

                <div className="flex flex-col mb-4">
                    <label className="mb-1 font-medium text-gray-700 dark:text-neutral-200">
                        Search Business
                    </label>
                    <input
                        type="text"
                        value={merchantSearch}
                        onChange={handleSearchChange}
                        className="h-12 w-full rounded-lg border border-gray-300 bg-white p-3 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                        placeholder="Type to search business"
                    />
                    {loading && <p>Loading...</p>}
                    {error && <p className="text-red-500">{error}</p>}

                    {businesses.length > 0 && (
                        <select
                            onChange={handleBusinessSelect}
                            value={selectedBizId}
                            className="mt-2 h-12 w-full rounded-lg border border-gray-300 bg-white p-3 outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                        >
                            <option value="">Select a business</option>
                            {businesses.map((biz) => (
                                <option key={biz.id} value={biz.merchant_id}>
                                    {biz.merchant_name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-lg font-semibold">Email Content</label>
                    <ReactQuill theme="snow" value={content} onChange={setContent} />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={sendmail}
                        className="bg-green-500 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Mail'}
                    </button>
                </div>
            </div>
        </>
    );
}
