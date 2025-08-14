"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import Table, { Column } from '@/components/table'
import { useAuth } from '@/contexts/authContext';
import axiosInstance from '@/helpers/axiosInstance';
import toast from 'react-hot-toast';

interface MerchantData {
    id: string;
    memberName: string;
    emailAddress: string;
    role: string;
    date: string;

}

const MERCHANT_DATA_COLUMNS: Column<MerchantData>[] = [
    { id: "memberName", label: "MEMBER NAME" },
    { id: "emailAddress", label: "EMAIL ADDRESS" },
    { id: "role", label: "ROLE", minWidth: 120 },
    { id: "date", label: "DATE", minWidth: 120 },
];

// Data Generation Utility
const generateMerchantData = (count: number): MerchantData[] => {
    const ROLE_OPTIONS: string[] = ["Admin", "Customer Support", "Manager", "Sales"];

    return Array.from({ length: count }, (_, i) => ({
        date: new Date().toLocaleDateString(),
        id: `${i + 1}`,
        memberName: `Scott Lexium`,
        role: ROLE_OPTIONS[Math.floor(Math.random() * ROLE_OPTIONS.length)],
        emailAddress: "email@example.com"
    }));
};


// Page Component
const Page = ({ params }: {
    params: {
        id: string
    }
}) => {

    const { setShowHeader, setHeaderTitle, filterState } = useUI();
    const { authState } = useAuth()
    const [data, setData] = useState<MerchantData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 20 });
    const typedFilterState = filterState as FilterState;
    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [filterState]);

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<MerchantData[]>(`/operations/merchants/${params.id}/teams`, {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (response.data.status && response.data.data) {
                setData(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch departments');
            }
            setPagination(response.data.pagination ? response.data.pagination : { totalItems: 0, totalPages: 1, limit: 20 });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [authState.token, queryParams, pagination.limit]);
    useEffect(() => {
        fetchData(currentPage);
    }, [fetchData, currentPage]);

    useEffect(() => {
        // Setup header and search query
        setShowHeader(false);

        // Cleanup on unmount
        return () => {
            setShowHeader(false);
        };
    }, [setHeaderTitle, setShowHeader]);

    return (
        <Table<MerchantData>
            headers={MERCHANT_DATA_COLUMNS}
            data={data}
            loading={loading}
            limit={pagination.limit} pagination={pagination} onPaginate={setCurrentPage} />
    );
};

export default Page;