"use client";
import { TableDetailSkeleton } from '@/components/loaders';
import { useAuth } from '@/contexts/authContext';
import axiosInstance, { handleAxiosError } from '@/helpers/axiosInstance';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Header from './Header';
import { Chip } from '@/components/chip';
import { CalendarIcon } from '@/assets/icons';
import { StatusIcon } from '@/public/assets/icons';
import moment from 'moment';

interface SettlementDetails {
    id: string;
    merchant_name: string;
    merchant_id: string;
    settlement_id: string;
    fees: number;
    destination: string;
    status: string;
    amount: string;
    account_name: string;
    bank_name: string;
    created_at: string;
}
// "business_id": 1,
// "trx": "2025010306442117420400",
// "reference": "COR-2025010306442117420400",
// "transactionRef": null,
// "amount": "100",
// "fee": "0",
// "bank_name": "OPAY",
// "account_number": "7036218209",
// "account_name": "TOLULOPE OYEBIYI OYENIYI",
// "narration": "test payout",
// "sender_name": "Cashonrails - Paylony",
// "paymentMode": "bank",
// "request_ip": "10.0.1.5",
// "initiator": "1|Tolulope Oyeniyi",
// "domain": "test",
// "source": "WEB",
// "gateway": "safehaven",
// "gateway_response": null,
// "message": null,
// "status": "pending",
// "reversed": "No",
// "reversed_by": null,
// "created_at": "2025-01-03T05:44:42.000000Z",


const Page = ({ params }: { params: { id: string } }) => {

    const [data, setData] = useState<SettlementDetails | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const { authState } = useAuth()
    const fetchDetails = async () => {
        if (!authState.token) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await axiosInstance.get<SettlementDetails>(
                `/finance/settlements/${params.id}`,
                {
                    headers: { Authorization: `Bearer ${authState.token}` },
                }
            );

            if (response.data.status && response.data.data) {
                setData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch settlement details');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An error occurred';
            setError(message);
            handleAxiosError(error, (data) => {
                toast.error(data);
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authState.token) {
            setIsLoading(false);
            return;
        }
        fetchDetails()

    }, [authState.token])


    return (
        <>
            <Header />
            {isLoading ? (
                <TableDetailSkeleton />
            ) : data && (
                <div className='w-full p-4 min-h-screen'>
                    <div className='flex items-start mt-10 gap-20 justify-between max-w-4xl'>
                        <div className='grid gap-5 grid-cols-2 max-w-96'>
                            <ul className='text-sm text-[#00000080] font-medium space-y-2'>
                                <li className='flex items-center gap-2'> <StatusIcon/> Status</li>
                                <li className='flex items-center gap-1'> <CalendarIcon height={18} width={18} strokeColor='#00000080' /> Date</li>

                                <li className='flex items-center gap-1'> <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_3831_20538)">
                                        <path d="M11.625 9.75C14.3174 9.75 16.5 9.07843 16.5 8.25C16.5 7.42157 14.3174 6.75 11.625 6.75C8.93261 6.75 6.75 7.42157 6.75 8.25C6.75 9.07843 8.93261 9.75 11.625 9.75Z" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" />
                                        <path d="M16.5 11.625C16.5 12.4534 14.3174 13.125 11.625 13.125C8.93257 13.125 6.75 12.4534 6.75 11.625" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" />
                                        <path d="M16.5 8.25V14.85C16.5 15.7613 14.3174 16.5 11.625 16.5C8.93257 16.5 6.75 15.7613 6.75 14.85V8.25" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" />
                                        <path d="M6.37488 4.5C9.06727 4.5 11.2499 3.82843 11.2499 3C11.2499 2.17157 9.06727 1.5 6.37488 1.5C3.68249 1.5 1.49988 2.17157 1.49988 3C1.49988 3.82843 3.68249 4.5 6.37488 4.5Z" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" />
                                        <path d="M4.49988 8.25C3.08102 8.07735 1.77731 7.63088 1.49988 6.75M4.49988 12C3.08102 11.8274 1.77731 11.3809 1.49988 10.5" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M4.49988 15.751C3.08102 15.5783 1.77731 15.1319 1.49988 14.251V3.00098" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M11.25 4.50098V3.00098" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_3831_20538">
                                            <rect width="18" height="18" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                    Amount</li>

                                <li className='flex items-center gap-1'> <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_3831_20538)">
                                        <path d="M11.625 9.75C14.3174 9.75 16.5 9.07843 16.5 8.25C16.5 7.42157 14.3174 6.75 11.625 6.75C8.93261 6.75 6.75 7.42157 6.75 8.25C6.75 9.07843 8.93261 9.75 11.625 9.75Z" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" />
                                        <path d="M16.5 11.625C16.5 12.4534 14.3174 13.125 11.625 13.125C8.93257 13.125 6.75 12.4534 6.75 11.625" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" />
                                        <path d="M16.5 8.25V14.85C16.5 15.7613 14.3174 16.5 11.625 16.5C8.93257 16.5 6.75 15.7613 6.75 14.85V8.25" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" />
                                        <path d="M6.37488 4.5C9.06727 4.5 11.2499 3.82843 11.2499 3C11.2499 2.17157 9.06727 1.5 6.37488 1.5C3.68249 1.5 1.49988 2.17157 1.49988 3C1.49988 3.82843 3.68249 4.5 6.37488 4.5Z" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" />
                                        <path d="M4.49988 8.25C3.08102 8.07735 1.77731 7.63088 1.49988 6.75M4.49988 12C3.08102 11.8274 1.77731 11.3809 1.49988 10.5" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M4.49988 15.751C3.08102 15.5783 1.77731 15.1319 1.49988 14.251V3.00098" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
                                        <path d="M11.25 4.50098V3.00098" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_3831_20538">
                                            <rect width="18" height="18" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                    Merchant</li>
                            </ul>

                            <ul className='text-sm space-y-2'>
                                <li><Chip variant={data.status}>{data.status}</Chip></li>
                                <li>{moment(data.created_at).format('MMM DD, YYYY, h:mmA')}</li>
                                <li>₦{data.amount}</li>
                                <li> Solomon Adeleke</li>
                            </ul>
                        </div>
                        <div>
                            <p className='text-[#00000099] font-medium'>Amount</p>
                            <p className='text-[#01AB79] text-2xl font-semibold'>N25,653.72</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-y pb-4 border-[#E4E7EC] pt-5">
                        <div className="">
                            <h2 className="text-xl font-medium mb-6">Settlement Details</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[#00000066] text-sm">Merchant Name</p>
                                        <p className="font-medium">Solomon Adeleke</p>
                                    </div>
                                    <div>
                                        <p className="text-[#00000066] text-sm">Merchant ID</p>
                                        <p className="font-medium">#428390</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[#00000066] text-sm">Settlement ID</p>
                                        <p className="font-medium">TRF262528902</p>
                                    </div>
                                    <div>
                                        <p className="text-[#00000066] text-sm">Fees</p>
                                        <p className="font-medium">₦30</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[#00000066] text-sm">Destination</p>
                                        <p className="font-medium">Bank</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default Page;