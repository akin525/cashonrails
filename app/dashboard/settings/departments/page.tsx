"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/authContext';
import moment from 'moment';
import toast from 'react-hot-toast';

import Header from './Header';
import Table, { Column } from '@/components/table';
import axiosInstance, { handleAxiosError } from '@/helpers/axiosInstance';
import { RouteLiteral } from 'nextjs-routes';
import { FilterState, useUI } from '@/contexts/uiContext';

 interface DepartmentData {
    id: string;
    created_at: string;
    name: string;
    department_head_count: number; // 100
    department_executive_count: number; //100
    department_members_count: number; // 100
    department_head: string // Scott Lexium
}

 const COLUMNS: Column<DepartmentData>[] = [
    { id: 'name', label: 'DEPARTMENTS' },
    { id: 'department_head', label: 'HEAD OF DEPARTMENT' },
    { id: 'department_members_count', label: 'MEMBERS', minWidth: 120 },
    { id: 'department_executive_count', label: 'MANAGEMENT', minWidth: 120 },
    { id: 'created_at', label: 'DATE CREATED', minWidth: 120 },
];

const DepartmentsPage = () => {
    const { authState } = useAuth();
    const router = useRouter();
    const { filterState } = useUI()


    const formatDepartmentData = (department: DepartmentData): DepartmentData => ({
        ...department,
        id: department.id.toString(),
        created_at: moment(department.created_at).format('MMM D, YYYY'),
    });
    const [data, setData] = useState<DepartmentData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, limit: 20 });
    const typedFilterState = filterState as FilterState;
    const queryParams = useMemo(() => ({
        status: typedFilterState.status,
        start_date: filterState.dateRange.startDate,
        end_date: filterState.dateRange.endDate,
    }), [typedFilterState.status, filterState.dateRange.startDate, filterState.dateRange.endDate]);



    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get<DepartmentData[]>("/settings/departments", {
                params: { ...queryParams, page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (response.data.status && response.data.data) {
                const formattedData = response.data.data.map(formatDepartmentData);
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


    const handleRowClick = (row: DepartmentData) => {
        router.push(`/dashboard/settings/departments/${row.id}` as RouteLiteral);
    };

    return (
        <div className="space-y-4">
            <Header />
            <Table<DepartmentData>
                headers={COLUMNS}
                data={data}
                limit={20}
                onRowClick={handleRowClick}
                loading={loading}
                onPaginate={setCurrentPage} pagination={pagination}
            />
        </div>
    );
};

export default DepartmentsPage;