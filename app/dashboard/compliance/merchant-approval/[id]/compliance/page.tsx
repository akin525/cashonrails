"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";
import toast from "react-hot-toast";
import { TableDetailSkeleton } from "@/components/loaders";
import { DocumentNode } from "@/components/utils";

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
        <div className="font-semibold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
);

interface DocumentData {
    id: number;
    business_id: number;
    info: string;
    file: string;
    file_type: string | null;
    status: string;
    approved_by: string | null;
    approved_on: string | null;
    created_at: string;
    updated_at: string;
}

const categorizeDocuments = (documents: DocumentData[]) => {
    return documents.reduce<Record<string, DocumentData[]>>((acc, doc) => {
        if (!acc[doc.info]) {
            acc[doc.info] = [];
        }
        acc[doc.info].push(doc);
        return acc;
    }, {});
};

const Page = ({ params }: { params: { id: string } }) => {
    const { authState } = useAuth();
    const [documents, setDocuments] = useState<DocumentData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingDocId, setLoadingDocId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setIsLoading(true);
                const response = await axiosInstance.get(`/growth/merchants/${params.id}/compliance`, {
                    headers: { Authorization: `Bearer ${authState?.token}` },
                });
                if (response.data && response.data.data) {
                    setDocuments(response.data.data);
                } else {
                    setError("No data found");
                }
            } catch (err) {
                setError("Failed to fetch documents");
                toast.error("Failed to fetch documents");
            } finally {
                setIsLoading(false);
            }
        };

        if (authState?.token) {
            fetchDocuments();
        }
    }, [params.id, authState?.token]);

    const handleUpdateStatus = async (docId: number, newStatus: string) => {
        setLoadingDocId(docId);
        try {
            const response = await axiosInstance.put(
                `/operations/kyc/${docId}/approve`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${authState?.token}` } }
            );

            if (response.data.status) {
                toast.success(`Document ${newStatus.toLowerCase()} successfully`);
                setDocuments((prevDocs) =>
                    prevDocs.map((doc) =>
                        doc.id === docId ? { ...doc, status: newStatus } : doc
                    )
                );
            } else {
                toast.error(response.data.message || "Failed to update document status");
            }
        } catch (error) {
            toast.error("Error updating document status");
        } finally {
            setLoadingDocId(null);
        }
    };

    if (isLoading) return <TableDetailSkeleton />;
    if (error) return <div className="text-center py-6 text-red-500">{error}</div>;
    if (documents.length === 0)
        return <div className="text-center py-6 text-gray-600 dark:text-gray-400">No documents found</div>;

    const categorizedDocuments = categorizeDocuments(documents);

    return (
        <div className="flex flex-col gap-6 border-t border-gray-300 dark:border-gray-700 p-6 bg-gray-50 dark:bg-[#111827] rounded-lg min-h-[70vh]">
            <div className="flex flex-col sm:flex-row sm:items-center w-full max-w-4xl sm:gap-8 md:gap-20 mb-6">
                <InfoItem label="Business Industry" value="Fintech" />
                <InfoItem label="Compliance Score" value="100%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-x-12">
                {Object.entries(categorizedDocuments).map(([category, docs]) => (
                    <div
                        key={category}
                        className="py-6 px-6 bg-white dark:bg-[#1f2937] rounded-xl shadow-md dark:shadow-black/40"
                    >
                        <h3 className="text-lg font-semibold mb-5 text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                            {category}
                        </h3>
                        {docs.map((doc) => (
                            <div
                                key={doc.id}
                                className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg mb-5 last:mb-0 bg-gray-50 dark:bg-[#374151]"
                            >
                                <DocumentNode
                                    merchantId={params.id}
                                    label={doc.info}
                                    file={{ name: doc.info || "", url: doc.file, id: doc.id }}
                                />
                                <div className="flex justify-between items-center mt-5">
                  <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold tracking-wide shadow-sm ${
                          doc.status === "approved"
                              ? "bg-green-600 text-green-100 shadow-green-700/50"
                              : doc.status === "disapproved"
                                  ? "bg-red-600 text-red-100 shadow-red-700/50"
                                  : "bg-gray-500 text-gray-100 shadow-gray-600/50"
                      }`}
                  >
                    {doc.status.toUpperCase()}
                  </span>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleUpdateStatus(doc.id, "approved")}
                                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 flex items-center justify-center ${
                                                loadingDocId === doc.id
                                                    ? "bg-green-400 cursor-not-allowed"
                                                    : "bg-green-600 hover:bg-green-700"
                                            } text-white`}
                                            disabled={loadingDocId === doc.id}
                                            aria-label={`Approve document ${doc.info}`}
                                        >
                                            {loadingDocId === doc.id ? (
                                                <span className="loader w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                                            ) : (
                                                "Approve"
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(doc.id, "disapproved")}
                                            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-300 flex items-center justify-center ${
                                                loadingDocId === doc.id
                                                    ? "bg-red-400 cursor-not-allowed"
                                                    : "bg-red-600 hover:bg-red-700"
                                            } text-white`}
                                            disabled={loadingDocId === doc.id}
                                            aria-label={`Disapprove document ${doc.info}`}
                                        >
                                            {loadingDocId === doc.id ? (
                                                <span className="loader w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                                            ) : (
                                                "Disapprove"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Page;
