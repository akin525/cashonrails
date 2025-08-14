"use client"
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import moment from 'moment';

import Table, { Column } from '@/components/table';
import { Chip, ChipVariant } from '@/components/chip';
import Header from './Header';
import Modal from '@/components/modal';
import { CalendarIcon, CloseIcon } from '@/assets/icons';
import axiosInstance, { handleAxiosError } from '@/helpers/axiosInstance';
import toast from 'react-hot-toast';
import { StatusIcon } from '@/public/assets/icons';

type Status = 'Active' | 'Inactive' | 'Pending';

interface AuditData {
    id: string;
    admin_id: number;
    name: string;
    email: string;
    department: string | null;
    role: string;
    action: string;
    description: string;
    created_at: string;
    admin_status: Status;
}

interface ModalData {
    action: string;
    status: Status;
    dateCreated: string;
    role: string;
    actionDetails: string;
    name: string;
    email: string;
}

interface AuditLogResponse {
    status: boolean;
    data: AuditData[];
    message: string;
    pagination: {
        total: number;
        limit: number;
        offset: number;
        next_offset: number;
        total_offset: number;
    };
}

const STATUS_VARIANT_MAP: Record<string, ChipVariant> = {
    approved: 'success',
    active: 'success',
    inactive: 'error',
    pending: 'warning',
    rejected: 'error',
};

const COLUMNS: Column<AuditData>[] = [
    { id: "email", label: "EMAIL" },
    { id: "name", label: "NAME" },
    { id: "department", label: "DEPARTMENT", minWidth: 120 },
    { id: "role", label: "ROLE", minWidth: 120 },
    { id: "action", label: "ACTION", minWidth: 120 },
    { id: "created_at", label: "DATE INITIATED", minWidth: 120 },
];

const getChipVariant = (status: string): ChipVariant =>
    STATUS_VARIANT_MAP[status.toLowerCase()] || 'default';

const Page: React.FC = () => {
    const { setShowHeader, setShowSearchQuery, filterState } = useUI();
    const [rowModalData, setRowModalData] = useState<ModalData | null>(null);
    const { authState } = useAuth();
    const [data, setData] = useState<AuditData[]>([]);
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
            const response = await axiosInstance.get<AuditData[]>("/settings/audit-logs", {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (response.data.status && response.data.data) {

                const formattedData = response.data?.data?.map(log => ({
                    ...log,
                    action: log.action.charAt(0).toUpperCase() + log.action.slice(1),
                    created_at: moment(log.created_at).format('MMM DD, YYYY'),
                    department: log.department || '-',
                })) || [];
                setData(formattedData);
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
        setShowHeader(false);
        setShowSearchQuery(false);

        return () => {
            setShowHeader(false);
            setShowSearchQuery(false);
        };
    }, [setShowHeader, setShowSearchQuery]);


    const handleRowClick = (row: AuditData) => {
        setRowModalData({
            action: row.action,
            status: row.admin_status,
            dateCreated: row.created_at,
            role: row.role,
            actionDetails: row.description,
            name: row.name,
            email: row.email
        });
    };

    return (
        <>
            <Header />
            <div className="p-4 mt-4">
                <Table<AuditData>
                    headers={COLUMNS}
                    data={data}
                    limit={20}
                    onRowClick={handleRowClick}
                    loading={loading}
                    onPaginate={setCurrentPage}
                    pagination={pagination}
                />

                {rowModalData && (
                    <Modal
                        className='min-w-[718px] p-3.5'
                        isOpen={true}
                        onClose={() => setRowModalData(null)}
                    >
                        <div>
                            <div className='flex items-center justify-between gap-2'>
                                <div>
                                    <p>{rowModalData.name}</p>
                                    <p>{rowModalData.email}</p>
                                </div>
                                <button onClick={() => setRowModalData(null)}>
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className='mt-5'>
                                <p>Action</p>
                                <p className='text-lg font-medium text-[#01AB79]'>
                                    {rowModalData.action}
                                </p>
                            </div>

                            <div className='grid grid-cols-2 mt-5'>
                                <ul className='text-[#00000080] font-medium space-y-4'>
                                    <li className='flex items-center gap-2'>
                                        <StatusIcon />
                                        Status
                                    </li>
                                    <li className='flex items-center gap-2'>
                                        <CalendarIcon /> Date Created
                                    </li>
                                    <li className='flex items-center gap-2'>
                                        <CalendarIcon /> Role
                                    </li>
                                    <li className='flex items-center gap-2'>
                                        <CalendarIcon /> Action Details
                                    </li>
                                </ul>

                                <ul className='space-y-4 font-medium'>
                                    <li>
                                        <Chip variant={getChipVariant(rowModalData.status)}>
                                            {rowModalData.status}
                                        </Chip>
                                    </li>
                                    <li>Date Created: {rowModalData.dateCreated}</li>
                                    <li>Role: {rowModalData.role}</li>
                                    <li>Action Details: {rowModalData.actionDetails}</li>
                                    <li className='text-[#01AB79]'>View Details</li>
                                </ul>
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
        </>
    );
};



export default Page;