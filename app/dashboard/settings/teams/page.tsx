"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import moment from 'moment';
import toast from 'react-hot-toast';

import Table, { Column } from '@/components/table';
import { Chip } from '@/components/chip';
import Header from './Header';
import axiosInstance, { handleAxiosError } from '@/helpers/axiosInstance';
import {ROLES_ENUMS, STAFF_ENUMS, STATUS_ENUMS} from '@/types';
import { RouteLiteral } from 'nextjs-routes';
import { useFetchHook } from '@/helpers/globalRequests';

export interface TeamsData {
    id: string;
    name: string;
    email: string;
    role: any;
    status: STATUS_ENUMS;
    created_at: string | null;
    departments: string[];
}

const COLUMNS: Column<TeamsData>[] = [
    { id: "email", label: "EMAIL" },
    { id: "name", label: "NAME" },
    {
        id: "departments",
        label: "DEPARTMENTS",
        minWidth: 120,
        type: "custom",
        renderCustom: (value) => value.departments.join(', ')
    },
    {
        id: "status",
        label: "STATUS",
        type: "custom",
        renderCustom: (value) => (
            <Chip variant={STAFF_ENUMS[value.status]}>
                {String(STAFF_ENUMS[value.status])}
            </Chip>
        ),
    },
    {
        id: "role",
        label: "ROLE",
        minWidth: 120,
        type: "custom",
        renderCustom: (value) => (
            <span>
                {value.role === "superadmin" ? "superadmin" : ROLES_ENUMS[value.role as keyof typeof ROLES_ENUMS] || value.role}
            </span>
        ),
    },
    { id: "created_at", label: "DATE INITIATED", minWidth: 120 },
];

const AdminUsersPage = () => {
    const { setShowHeader, setShowSearchQuery, filterState } = useUI();
    const { authState } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<TeamsData[]>([]);
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
            const response = await axiosInstance.get<TeamsData[]>("/admin-users", {
                params: {  page, limit: pagination.limit },
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            if (response.data.status && response.data.data) {
                const formattedData = response.data.data.map(formatUserData);
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

    const formatUserData = (user: TeamsData): TeamsData => ({
        ...user,
        departments: ["-"],
        created_at: moment(user.created_at).format('MMM DD, YYYY'),
    });

    return (
        <>
            <Header />
            <div className="p-4 mt-4">
                <Table<TeamsData>
                    headers={COLUMNS}
                    data={data}
                    limit={pagination.limit}
                    onRowClick={(row) => router.push(`/dashboard/settings/teams/${row.id}` as RouteLiteral)}
                    loading={loading}
                    onPaginate={setCurrentPage}
                    pagination={pagination}             
                />
            </div>
        </>
    );
};

export default AdminUsersPage;
