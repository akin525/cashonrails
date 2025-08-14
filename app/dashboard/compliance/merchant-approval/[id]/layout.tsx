"use client"
import React, { useEffect, useState } from 'react'
import NavLinkLayout from '@/components/dashboard/SettingsTab';
import Header from './Header';
import { CalendarIcon, CancelIcon, ChevronIcon } from '@/public/assets/icons';
import { Chip } from '@/components/chip';
import { useAuth } from '@/contexts/authContext';
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

export default function SettingsLayout({
    children,
    params
}: {
    children: React.ReactNode,
    params: { "id": string }
}) {
    const [merchantData, setMerchantData] = useState<MerchantData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const { authState } = useAuth();
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
        if (authState.token) {
            fetchMerchantData();
        }
    }, [params.id, authState?.token]);

    const handleReview = async (merchantStatus: "approved" | "rejected") => {
        setIsReviewing(true); // Start loading
        try {
            const response = await axiosInstance.post("/operations/review-merchant", {
                business_id: merchantData?.id,
                status: merchantStatus
            }, {
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
            setIsReviewing(false); // End loading
        }
    };

    const handleDraftSend = async (content: string) => {
        setIsReviewing(true); // Start loading
        try {
            const response = await axiosInstance.post("/operations/review-merchant", {
                business_id: merchantData?.id,
                status: "rejected",
                mail_body: content
            }, {
                headers: { Authorization: `Bearer ${authState?.token}` },
            });
            if (response.data && response.data.status) {
                toast.success(`Merchant rejected successfully`);
                setMerchantData({ ...merchantData, status: "rejected" } as MerchantData);
            } else {
                toast.error(response.data.message || `Failed to reject merchant`);
            }
        } catch (err) {
            toast.error(`Error rejecting merchant. Please try again.`);
        } finally {
            setIsReviewing(false); // End loading
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
                <Header name={"N/A"} />
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
        < >
            {/* Loading Overlay */}
            {isReviewing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#01AB79] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-700">Processing review...</span>
                    </div>
                </div>
            )}
            <Header name={merchantData?.name} theme={theme}/>
            <div className='w-full p-4 min-h-screen'>
                <div>
                    <div className='flex items-center gap-4'>
                        <div className="h-12 w-12 bg-blue-200 dark:bg-gray-700 rounded-xl"></div>

                        <h2 className='font-medium text-3xl'>{merchantData?.trade_name}</h2>
                    </div>
                    <div className='flex items-start mt-10 gap-20'>
                        <div className="grid grid-cols-2">
                            <ul className="text-sm text-gray-600 dark:text-gray-400 font-medium space-y-2">
                                <li>Status</li>
                                <li className="flex items-center gap-1">
                                    <CalendarIcon height={18} width={18} strokeColor="currentColor" /> Date Created
                                </li>
                                <li>Business Type</li>
                                <li>Business ID</li>
                                <li>Industry</li>
                                <li>Category</li>
                            </ul>
                            <ul className="text-sm space-y-2">
                                <li>
                                    <Chip variant={merchantData?.status}>
                                        {StringUtils.capitalizeWords(merchantData?.status ?? "")}
                                    </Chip>
                                </li>
                                <li>{moment(merchantData?.created_at).format("MMM DD, YYYY, h:mma")}</li>
                                <li>{merchantData?.btype?.name || "N/A"}</li>
                                <li>{merchantData?.id || "N/A"}</li>
                                <li>{merchantData?.industry?.name || "N/A"}</li>
                                <li>{merchantData?.category?.name || "N/A"}</li>
                            </ul>
                        </div>
                        <div>
                            <CustomDropdown
                                trigger={(isOpen) => <button className="flex items-center text-white rounded-lg p-2 bg-[#01AB79] gap-2">
                                    Review Merchant <ChevronIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} stroke='white' />
                                </button>}
                                dropdownClassName="bg-gray-50 rounded-lg "
                            >
                                <DropdownItem
                                    icon={() => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.749 7.49902C13.749 4.04724 10.9508 1.24902 7.49902 1.24902C4.04724 1.24902 1.24902 4.04724 1.24902 7.49902C1.24902 10.9508 4.04724 13.749 7.49902 13.749C10.9508 13.749 13.749 10.9508 13.749 7.49902Z" fill="#01AB79" />
                                        <path d="M4.99902 7.81348L6.56152 9.37598L9.99902 5.62598" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    onClick={() => handleReview("approved")}
                                >
                                    <p className='text-xs py-2'>Approve Merchant</p>
                                </DropdownItem>
                                <DropdownItem
                                    icon={() => <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.7498 7.5C13.7498 4.04822 10.9515 1.25 7.49976 1.25C4.04797 1.25 1.24976 4.04822 1.24976 7.5C1.24976 10.9517 4.04797 13.75 7.49976 13.75C10.9515 13.75 13.7498 10.9517 13.7498 7.5Z" fill="#FF5656" />
                                        <path d="M9.37463 9.375L5.625 5.625M5.6254 9.375L9.375 5.625" stroke="white" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    onClick={() => setVisibleModal('dispute')}
                                >
                                    <p className='text-xs py-2'>Reject Merchant</p>
                                </DropdownItem>
                            </CustomDropdown>
                        </div>
                    </div>
                </div>
                <div className='max-w-3xl mt-10'>
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
                            label: 'Profile',
                            href: `/dashboard/compliance/merchant-approval/${params.id}/profile`
                        },
                    ]} />
                </div>

                {children}
            </div>

            {visibleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-scroll">
                    <div className={`bg-white p-6 rounded-lg shadow-lg flex flex-col gap-3 py-5 max-h-screen overflow-scroll relative ${isFullScreen && 'h-full w-full'}`}>
                        <div className='flex items-center justify-between px-4'>
                            <p>Rejection Composer</p>
                            <div className='flex items-center gap-2'>
                                <button
                                    onClick={() => setIsFullScreen(!isFullScreen)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-expand"><path d="m15 15 6 6" /><path d="m15 9 6-6" /><path d="M21 16.2V21h-4.8" /><path d="M21 7.8V3h-4.8" /><path d="M3 16.2V21h4.8" /><path d="m3 21 6-6" /><path d="M3 7.8V3h4.8" /><path d="M9 9 3 3" /></svg>
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className=''>
                                    <CancelIcon size={32} color='#FF5656' />
                                </button>
                            </div>
                        </div>

                        {merchantData &&
                            <RejectionComposer
                                userData={{
                                    name: merchantData.name,
                                    applicationId: merchantData.id.toString(),
                                    submissionDate: merchantData?.created_at,
                                    merchantId: params.id
                                }}
                                fullScreen={isFullScreen}
                                onSend={(content) => handleDraftSend(content)}
                                onCancel={handleCancel}
                            />}
                    </div>
                </div>
            )}
        </>
    )
}