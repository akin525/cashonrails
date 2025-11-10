"use client"
import React, { useEffect, useState } from 'react'
import NavLinkLayout from '@/components/dashboard/SettingsTab';
import Header from './Header';
import { CalendarIcon, CancelIcon, ChevronIcon } from '@/public/assets/icons';
import { Chip } from '@/components/chip';
import { useAuth } from '@/contexts/authContext';
import { useUI } from '@/contexts/uiContext';
import axiosInstance from '@/helpers/axiosInstance';
import toast from 'react-hot-toast';
import moment from 'moment';
import Alert, { AlertDescription } from '@/components/alert';
import { StringUtils } from '@/helpers/extras';
import { TableDetailSkeleton } from '@/components/loaders';
import { CustomDropdown, DropdownItem } from '@/components/dropDown';
import { RejectionComposer } from '@/components/EditorPad';
import { useTheme } from 'next-themes';

interface MerchantData {
    id: number;
    user_id: number;
    trade_name: string;
    name: string;
    status: string;
    created_at: string;
    btype?: { name: string, id: number };
    industry?: { name: string };
    category?: { name: string };
}

interface BusinessApprovalPayload {
    business_id: number;
    status: "approved" | "rejected";
}

interface BusinessRejectionPayload extends BusinessApprovalPayload {
    kyc_reason_for_rejection: string[];
    kyc_rejected_comment: string;
}

// Validation helper function
const validateBusinessPayload = (payload: BusinessApprovalPayload | BusinessRejectionPayload): string[] => {
    const errors: string[] = [];

    if (!payload.business_id) {
        errors.push("business_id is required");
    }

    if (!payload.status) {
        errors.push("status is required");
    }

    // Additional validation for rejection
    if (payload.status === "rejected") {
        const rejectionPayload = payload as BusinessRejectionPayload;
        if (!rejectionPayload.kyc_reason_for_rejection || !Array.isArray(rejectionPayload.kyc_reason_for_rejection)) {
            errors.push("kyc_reason_for_rejection is required and must be an array for rejection");
        }
        if (!rejectionPayload.kyc_rejected_comment) {
            errors.push("kyc_rejected_comment is required for rejection");
        }
    }

    return errors;
};

// Info Card Component
const InfoCard: React.FC<{ label: string; value: string | React.ReactNode; icon?: React.ReactNode; theme?: string }> = ({
                                                                                                                            label,
                                                                                                                            value,
                                                                                                                            icon,
                                                                                                                            theme
                                                                                                                        }) => (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${
        theme === "dark"
            ? "bg-gray-800/50 border-gray-700"
            : "bg-gray-50 border-gray-200"
    }`}>
        {icon && (
            <div className={`mt-0.5 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                {icon}
            </div>
        )}
        <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}>
                {label}
            </p>
            <div className={`text-sm font-medium ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>
                {value}
            </div>
        </div>
    </div>
);

export default function SettingsLayout({
                                           children,
                                           params
                                       }: {
    children: React.ReactNode,
    params: { "id": string }
}) {
    const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
    const [availableDocuments, setAvailableDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const { authState } = useAuth();
    const { flaggedDocuments } = useUI();
    const [isReviewing, setIsReviewing] = useState(false);
    const [visibleModal, setVisibleModal] = useState<"approve" | "dispute" | null>(null);
    const [draftContent, setDraftContent] = useState<string>("");
    const [isFullScreen, setIsFullScreen] = useState(false)
    const { theme } = useTheme()

    useEffect(() => {
        const fetchMerchantData = async () => {
            setIsLoading(true);
            setError(false);
            try {
                const response = await axiosInstance.get<MerchantData>(`/growth/merchants/${params.id}`, {
                    headers: { Authorization: `Bearer ${authState?.token}` },
                });
                if (response.data && response.data.data) {
                    setMerchantData(response.data.data);
                } else {
                    toast.error("No data found");
                }
                setIsLoading(false);
            } catch (err) {
                setError(true);
                toast.error("Error loading merchant data. Please try again.");
                setIsLoading(false);
            }
        };

        const fetchAvailableDocuments = async () => {
            const documents = [
                { id: 'directors_national_id', info: 'Directors National ID' },
                { id: 'business_website', info: 'Business Website' },
                { id: 'business_proof_of_address', info: 'Business Proof of Address' },
                { id: 'means_of_id_for_individual_account', info: 'Means of ID for Individual Account' },
                { id: 'individual_proof_of_address', info: 'Individual Proof of Address' },
            ];

            setAvailableDocuments(documents);
        };

        if (authState.token) {
            fetchMerchantData();
            fetchAvailableDocuments();
        }
    }, [params.id, authState?.token]);

    const handleReview = async (merchantStatus: "approved" | "rejected") => {
        setIsReviewing(true);
        try {
            if (!merchantData) {
                toast.error("Merchant data not loaded");
                setIsReviewing(false);
                return;
            }
            const requestPayload: BusinessApprovalPayload = {
                business_id: merchantData.id,
                status: merchantStatus
            };

            const validationErrors = validateBusinessPayload(requestPayload);
            if (validationErrors.length > 0) {
                toast.error(`Validation errors: ${validationErrors.join(', ')}`);
                return;
            }

            const response = await axiosInstance.post("/operations/review-merchant", requestPayload, {
                headers: { Authorization: `Bearer ${authState?.token}` },
            });
            if (response.data && response.data.status) {
                toast.success(`Merchant ${merchantStatus} successfully`);
                setMerchantData({ ...merchantData, status: merchantStatus === "approved" ? "approved" : "rejected" } as MerchantData);
            } else {
                toast.error(response.data.message || `Failed to ${merchantStatus} merchant`);
            }
        } catch (err) {
            toast.error(`Error reviewing merchant. Please try again.`);
        } finally {
            setIsReviewing(false);
        }
    };

    const handleDraftSend = async (content: string) => {
        setIsReviewing(true);
        try {
            if (!merchantData) {
                toast.error("Merchant data not loaded");
                setIsReviewing(false);
                return;
            }
            const merchantDocs = flaggedDocuments[merchantData.id] || [];
            const rejectionReasons = merchantDocs.length > 0
                ? merchantDocs.map((doc: { name: string; id: string }) => doc.id)
                : ['compliance_review'];

            const requestPayload: BusinessRejectionPayload = {
                business_id: merchantData.id,
                status: "rejected",
                kyc_reason_for_rejection: rejectionReasons,
                kyc_rejected_comment: content || (merchantDocs.length > 0
                    ? `The following documents do not meet compliance requirements: ${merchantDocs.map((doc: { name: string; id: string }) => doc.name).join(', ')}. Please review and resubmit these documents with the necessary corrections.`
                    : "The submitted documents do not meet our compliance requirements. Please review and resubmit the required documents."),
            };

            const validationErrors = validateBusinessPayload(requestPayload);
            if (validationErrors.length > 0) {
                toast.error(`Validation errors: ${validationErrors.join(', ')}`);
                return;
            }

            const response = await axiosInstance.post("/operations/review-merchant", requestPayload, {
                headers: { Authorization: `Bearer ${authState?.token}` },
            });
            if (response.data && response.data.status) {
                toast.success(`Merchant rejected successfully`);
                setMerchantData({ ...merchantData, status: "rejected" } as MerchantData);
                setVisibleModal(null);
                setDraftContent("");
            } else {
                toast.error(response.data.message || `Failed to reject merchant`);
            }
        } catch (err) {
            toast.error(`Error rejecting merchant. Please try again.`);
        } finally {
            setIsReviewing(false);
        }
    }

    const handleCancel = () => {
        setVisibleModal(null);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Alert variant="destructive">
                    <AlertDescription>Error loading merchant data. Please try again.</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isLoading) {
        return <TableDetailSkeleton />;
    }

    if (!isLoading && !merchantData) {
        return (
            <>
                <Header name={"N/A"} theme={theme} />
                <div className="flex flex-col items-center justify-center min-h-[80vh]">
                    <Alert>
                        <AlertDescription>No merchant data found for ID: {params.id}</AlertDescription>
                    </Alert>
                    <button
                        onClick={() => window.history.back()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Loading Overlay */}
            {isReviewing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 max-w-sm`}>
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-[#01AB79]/20 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#01AB79] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="text-center">
                            <h3 className={`font-semibold text-lg mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                                Processing Review
                            </h3>
                            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                Please wait while we process your request...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Header name={merchantData?.name} theme={theme} />

            <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className='max-w-7xl mx-auto p-6'>
                    {/* Merchant Header Card */}
                    <div className={`rounded-xl border ${
                        theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                    } shadow-sm mb-6`}>
                        <div className="p-6">
                            {/* Top Section - Logo, Name, Actions */}
                            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6'>
                                <div className='flex items-center gap-4'>
                                    <div className={`h-16 w-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                                        theme === "dark"
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
                                            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                    } shadow-lg`}>
                                        {merchantData?.trade_name?.charAt(0).toUpperCase() || 'M'}
                                    </div>
                                    <div>
                                        <h2 className={`font-semibold text-2xl mb-1 ${
                                            theme === "dark" ? "text-white" : "text-gray-900"
                                        }`}>
                                            {merchantData?.trade_name}
                                        </h2>
                                        <p className={`text-sm ${
                                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                                        }`}>
                                            Merchant ID: {merchantData?.id}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Chip variant={merchantData?.status}>
                                        {StringUtils.capitalizeWords(merchantData?.status ?? "")}
                                    </Chip>

                                    <CustomDropdown
                                        trigger={(isOpen) => (
                                            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#01AB79] hover:bg-[#019966] text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8 1.33334V14.6667M1.33334 8H14.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                Review Merchant
                                                <ChevronIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} stroke='white' />
                                            </button>
                                        )}
                                        dropdownClassName={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"} rounded-xl shadow-xl border`}
                                    >
                                        <DropdownItem
                                            icon={() => (
                                                <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M13.749 7.49902C13.749 4.04724 10.9508 1.24902 7.49902 1.24902C4.04724 1.24902 1.24902 4.04724 1.24902 7.49902C1.24902 10.9508 4.04724 13.749 7.49902 13.749C10.9508 13.749 13.749 10.9508 13.749 7.49902Z" fill="#01AB79" />
                                                    <path d="M4.99902 7.81348L6.56152 9.37598L9.99902 5.62598" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                            onClick={() => handleReview("approved")}
                                        >
                                            <p className='text-sm py-2 font-medium'>Approve Merchant</p>
                                        </DropdownItem>
                                        <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                                        <DropdownItem
                                            icon={() => (
                                                <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M13.7498 7.5C13.7498 4.04822 10.9515 1.25 7.49976 1.25C4.04797 1.25 1.24976 4.04822 1.24976 7.5C1.24976 10.9517 4.04797 13.75 7.49976 13.75C10.9515 13.75 13.7498 10.9517 13.7498 7.5Z" fill="#FF5656" />
                                                    <path d="M9.37463 9.375L5.625 5.625M5.6254 9.375L9.375 5.625" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                            onClick={() => setVisibleModal('dispute')}
                                        >
                                            <p className='text-sm py-2 font-medium'>Reject Merchant</p>
                                        </DropdownItem>
                                    </CustomDropdown>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <InfoCard
                                    label="Date Created"
                                    value={moment(merchantData?.created_at).format("MMM DD, YYYY, h:mma")}
                                    theme={theme}
                                    icon={<CalendarIcon height={18} width={18} strokeColor="currentColor" />}
                                />
                                <InfoCard
                                    label="Business Type"
                                    value={merchantData?.btype?.name || "N/A"}
                                    theme={theme}
                                    icon={
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    }
                                />
                                <InfoCard
                                    label="Industry"
                                    value={merchantData?.industry?.name || "N/A"}
                                    theme={theme}
                                    icon={
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />
                                <InfoCard
                                    label="Category"
                                    value={merchantData?.category?.name || "N/A"}
                                    theme={theme}
                                    icon={
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className={`rounded-xl border ${
                        theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                    } shadow-sm mb-6 overflow-hidden`}>
                        <NavLinkLayout links={[
                            {
                                label: 'Business',
                                href: `/dashboard/compliance/merchant-approval/${params.id}/business`
                            },
                            {
                                label: 'Compliance',
                                href: `/dashboard/compliance/merchant-approval/${params.id}/compliance`
                            },
                            {
                                label: 'Verification',
                                href: `/dashboard/compliance/merchant-approval/${params.id}/verification`
                            },
                            {
                                label: 'Profile',
                                href: `/dashboard/compliance/merchant-approval/${params.id}/profile`
                            },
                        ]} />
                    </div>

                    {/* Content Area */}
                    <div className={`rounded-xl border ${
                        theme === "dark"
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                    } shadow-sm overflow-hidden`}>
                        {children}
                    </div>
                </div>
            </div>

            {/* Rejection Modal */}
            {visibleModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className={`${
                        theme === "dark" ? "bg-gray-800" : "bg-white"
                    } rounded-2xl shadow-2xl flex flex-col relative ${
                        isFullScreen ? 'h-[95vh] w-[95vw]' : 'max-w-5xl w-full max-h-[90vh]'
                    } overflow-hidden`}>
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between px-6 py-4 border-b ${
                            theme === "dark" ? "border-gray-700" : "border-gray-200"
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                    <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.7498 7.5C13.7498 4.04822 10.9515 1.25 7.49976 1.25C4.04797 1.25 1.24976 4.04822 1.24976 7.5C1.24976 10.9517 4.04797 13.75 7.49976 13.75C10.9515 13.75 13.7498 10.9517 13.7498 7.5Z" fill="#FF5656" />
                                        <path d="M9.37463 9.375L5.625 5.625M5.6254 9.375L9.375 5.625" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 className={`text-lg font-semibold ${
                                    theme === "dark" ? "text-white" : "text-gray-900"
                                }`}>
                                    Rejection Composer
                                </h3>
                            </div>
                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => setIsFullScreen(!isFullScreen)}
                                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                                    }`}
                                    title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m15 15 6 6" /><path d="m15 9 6-6" /><path d="M21 16.2V21h-4.8" /><path d="M21 7.8V3h-4.8" /><path d="M3 16.2V21h4.8" /><path d="m3 21 6-6" /><path d="M3 7.8V3h4.8" /><path d="M9 9 3 3" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className='p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                                    title="Close"
                                >
                                    <CancelIcon size={24} color='#FF5656' />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {merchantData && (
                                <RejectionComposer
                                    userData={{
                                        name: merchantData.name,
                                        applicationId: merchantData.id.toString(),
                                        submissionDate: merchantData?.created_at,
                                        merchantId: params.id
                                    }}
                                    availableDocuments={availableDocuments}
                                    fullScreen={isFullScreen}
                                    onSend={(content) => handleDraftSend(content)}
                                    onCancel={handleCancel}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
