"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FilterState, useUI } from "@/contexts/uiContext";
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import Table, { Column } from "@/components/table";
import { Chip } from "@/components/chip";
import Header from "./Header";
import moment from "moment";
import { StringUtils } from "@/helpers/extras";
import Modal from "@/components/modal";
import axiosInstance from "@/helpers/axiosInstance";
// Types

interface TransactionData {
    id: string;
    business_id: number;
    trx: string;
    reference: string;
    transactionRef: string | null;
    sessionid: string | null;
    batch_id: string | null;
    currency: string;
    amount: string;
    fee: string;
    fee_source: string;
    sys_fee: string;
    bank_code: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    narration: string;
    sender_name: string;
    paymentMode: string;
    request_ip: string;
    initiator: string | null;
    domain: string;
    source: string;
    gateway: string;
    gateway_response: string | null;
    message: string;
    status: string;
    reversed: string;
    reversed_by: string | null;
    note: string;
    created_at: string;
    updated_at: string;
  }
  
// Page Component
const Page = () => {
    const router = useRouter();
    const { authState } = useAuth();
    const { setShowSearchQuery, filterState } = useUI();
    const typedFilterState = filterState as FilterState;
    const [showSettleConfirmation, setShowSettleConfirmation] = useState<null | TransactionData>(null);
    const [activeFilter, setActiveFilter] = useState<string>('Total');

    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 10 });
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<TransactionData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);


    const TABLE_COLUMNS: Column<TransactionData>[] = [
        { id: "business_id", label: "BUSINESS ID" },
    
        { id: "reference", label: "REFERENCE" },
    
        {
            id: "amount",
            label: "AMOUNT",
            sortable: true,
            sortType: 'currency',
        },
    
        { id: "currency", label: "CURRENCY" },
    
        { id: "fee", label: "FEE" },

    
        { id: "sys_fee", label: "SYS FEE" },

    
        { id: "gateway", label: "GATEWAY" },
    
        {
            id: "status",
            label: "STATUS",
            type: "custom",
            renderCustom: (value) => <Chip variant={value.status}>{StringUtils.capitalizeWords(value.status)}</Chip>,
        },

    
        { id: "created_at", label: "DATE", type: "dateTime" },
    ];
    

    useEffect(() => {
        setShowSearchQuery(true);
        return () => {
            setShowSearchQuery(false);
        };
    }, [setShowSearchQuery, typedFilterState]);


    const queryParams = useMemo(() => ({
        status: activeFilter !== 'Total' ? activeFilter : undefined,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [activeFilter, filterState]);

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<TransactionData[]>("/finance/failpayout", {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
                timeout:60000

            });
            setData(response.data?.data ?? []);
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

    console.log("data", data);
    return (
        <div>
            <Header headerTitle={"Failed Payouts"} />
            <div className="p-4 mt-4">
                <Table<TransactionData>
                    headers={TABLE_COLUMNS}
                    data={data ? data : []}
                    limit={pagination.limit}
                    loading={loading}
                    pagination={pagination}
                    onPaginate={setCurrentPage}
                    showPagination
                />
            </div>
        </div>
    );
};

export default Page;
