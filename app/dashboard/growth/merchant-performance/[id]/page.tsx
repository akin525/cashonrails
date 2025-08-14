"use client"
import React, { useEffect } from 'react';
import moment from 'moment';
import { CalendarIcon } from '@/public/assets/icons';
import { Chip, ChipVariant } from '@/components/chip';
import Table, { Column } from '@/components/table';
import Header from './Header';
import { TableDetailSkeleton } from '@/components/loaders';
import { useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import { useFetchHook } from '@/helpers/globalRequests';

// Types
interface MerchantSummary {
    total_transactions_count: number;
    total_transaction_value: number;
    total_revenue: number;
}

interface MerchantData {
    id: number;
    user_id: number;
    name: string;
    trade_name: string;
    business_type: string;
    created_at: string;
    summary: MerchantSummary;
    btype: {
        id: number,
        name: string,
        message: string,
        documents: string,
        status: string,
        created_at: string,
        updated_at: string
    },
    industry: {
        id: number,
        name: string,
        status: string,
        created_at: string,
        updated_at: string
    },
    category: {
        id: number,
        industry_id: number,
        name: string,
        status: string,
        created_at: string,
        updated_at: string
    }
    // Add other fields as needed, removed unused ones for clarity
}

interface TransactionData {
    id: string;
    type: string;
    status: string;
    amount: string;
    fee: string;
    created_at: string;
}

interface PageProps {
    params: {
        id: string;
    };
}


const TRANSACTION_COLUMNS: Column<TransactionData>[] = [
    {
        id: "id",
        label: "TRANSACTION ID"
    },
    {
        id: "type",
        label: "TRANSACTION TYPE"
    },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => (
            <Chip variant={value.status}>
                {value.status}
            </Chip>
        ),
    },
    {
        id: "amount",
        label: "AMOUNT",
        minWidth: 120,
        format: (value) => `₦${Number(value).toLocaleString()}`
    },
    {
        id: "fee",
        label: "FEE",
        minWidth: 120,
        format: (value) => `₦${Number(value).toLocaleString()}`
    },
    {
        id: "created_at",
        label: "DATE",
        minWidth: 120
    },
];

// Components
const MerchantInfo: React.FC<{ merchant: MerchantData }> = ({ merchant }) => (
    <div className='mb-7'>
        <div className='flex items-center gap-4'>
            <div className='h-12 w-12 bg-blue-200 rounded-xl' />
            <h2 className='font-medium text-3xl'>{merchant.trade_name}</h2>
        </div>
        <div className='grid grid-cols-2 max-w-80 mt-10'>
            <ul className='text-sm text-[#00000080] font-medium space-y-2'>
                <li className='flex items-center gap-1'>
                    <CalendarIcon height={18} width={18} strokeColor='#00000080' />
                    Date Created
                </li>
                <li className='flex items-center gap-1'>
                    <CalendarIcon height={18} width={18} strokeColor='#00000080' />
                    Business Type
                </li>
                <li className='flex items-center gap-1'>
                    <CalendarIcon height={18} width={18} strokeColor='#00000080' />
                    Business ID
                </li>
            </ul>
            <ul className='text-sm space-y-2'>
                <li>{moment(merchant.created_at).format('MMM DD, YYYY, h:mmA')}</li>
                <li>{merchant.btype.name}</li>
                <li>{merchant.id}</li>
            </ul>
        </div>
    </div>
);

// Main Page Component
export default function MerchantDetailPage({ params }: PageProps) {
    const { authState } = useAuth();
    const { setShowHeader } = useUI();

    const { data: merchantData, isLoading: isFetchingMerchant } = useFetchHook<MerchantData>({
        endpoint: `/growth/merchants/${params.id}`,
        token: authState?.token,
        includeDateFilter: true
    });

    const { data: transactions, isLoading: isFetchingTransactions } = useFetchHook<TransactionData[]>({
        endpoint: `/growth/merchants/${params.id}/transactions`,
        token: authState?.token,
        includeDateFilter: true
    });

    useEffect(() => {
        setShowHeader(false);
        return () => setShowHeader(false);
    }, [setShowHeader]);

    if (isFetchingMerchant) {
        return (
            <>
                <Header title="Loading" />
                <div className='w-full p-4 min-h-screen'>
                    <TableDetailSkeleton />
                </div>
            </>
        );
    }

    if (!merchantData) {
        return (
            <>
                <Header title="Error" />
                <div className='w-full p-4 min-h-screen'>
                    <p>Failed to load merchant data</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header title={merchantData.trade_name} />
            <div className='w-full p-4 min-h-screen'>
                <MerchantInfo merchant={merchantData} />
                <Table<TransactionData>
                    headers={TRANSACTION_COLUMNS}
                    data={transactions || []}
                    limit={20}
                    loading={isFetchingTransactions} pagination={{
                        totalItems: 0,
                        limit: 0,
                        totalPages: 0
                    }} onPaginate={() => null}
                />
            </div>
        </>
    );
}