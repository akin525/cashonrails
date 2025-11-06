"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterState, useUI } from '@/contexts/uiContext';
import { useAuth } from '@/contexts/authContext';
import moment from 'moment';
import toast from 'react-hot-toast';
import {
    Users,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Shield,
    ShieldCheck,
    Calendar,
    Mail,
    Building2
} from 'lucide-react';

import Header from './Header';
import axiosInstance from '@/helpers/axiosInstance';
import { ROLES_ENUMS, STAFF_ENUMS, STATUS_ENUMS } from '@/types';
import { RouteLiteral } from 'nextjs-routes';

// Enhanced interface based on API response
export interface AdminUser {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string | null;
    image: string;
    address: string;
    city: string;
    state: string;
    role: string;
    admin_roles: string | null;
    status: number;
    login_time: string | null;
    created_at: string;
    updated_at: string;
    departments: Department[];
}

interface Department {
    id: number;
    name: string;
    description: string;
    permissions: Record<string, string[]>;
    pivot: {
        role: string;
        status: number;
    };
}

interface ApiResponse {
    status: boolean;
    message: string;
    data: AdminUser[];
    pagination: {
        total: number;
        limit: string;
        offset: number;
        next_offset: number;
        total_offset: number;
    };
}

// Status Badge Component
const StatusBadge: React.FC<{ status: number }> = ({ status }) => {
    const getStatusConfig = (status: number) => {
        switch (status) {
            case 1:
                return { label: 'Active', className: 'bg-green-100 text-green-800 border-green-200' };
            case 0:
                return { label: 'Inactive', className: 'bg-red-100 text-red-800 border-red-200' };
            default:
                return { label: 'Unknown', className: 'bg-gray-100 text-gray-800 border-gray-200' };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
            {config.label}
        </span>
    );
};

// Role Badge Component
const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
    const getRoleConfig = (role: string) => {
        switch (role.toLowerCase()) {
            case 'superadmin':
                return {
                    label: 'Super Admin',
                    className: 'bg-purple-100 text-purple-800 border-purple-200',
                    icon: <ShieldCheck className="w-3 h-3" />
                };
            case 'admin':
                return {
                    label: 'Admin',
                    className: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: <Shield className="w-3 h-3" />
                };
            default:
                return {
                    label: role,
                    className: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <Users className="w-3 h-3" />
                };
        }
    };

    const config = getRoleConfig(role);

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
            {config.icon}
            {config.label}
        </span>
    );
};

// User Card Component
const UserCard: React.FC<{ user: AdminUser; onView: (user: AdminUser) => void }> = ({ user, onView }) => {
    const lastLogin = user.login_time ? moment(user.login_time).fromNow() : 'Never';
    const createdDate = moment(user.created_at).format('MMM DD, YYYY');

    return (
        <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <StatusBadge status={user.status} />
                        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                    </div>

                    <div className="flex items-center justify-between">
                        <RoleBadge role={user.role} />
                        {user.departments.length > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                                <Building2 className="w-4 h-4 mr-1" />
                                {user.departments[0].name}
                                {user.departments.length > 1 && (
                                    <span className="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                        +{user.departments.length - 1}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                        <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Created {createdDate}
                        </div>
                        <div className="mt-1">
                            Last login: {lastLogin}
                        </div>
                    </div>
                    <button
                        onClick={() => onView(user)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                    </button>
                </div>
            </div>
        </div>
    );
};

// Loading Skeleton Component
const LoadingSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// Pagination Component
const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {pages.map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === currentPage
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

// Main Component
const AdminUsersPage: React.FC = () => {
    const { setShowHeader, setShowSearchQuery, filterState } = useUI();
    const { authState } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1,
        limit: 10
    });

    const fetchData = useCallback(async (page: number) => {
        if (!authState.token) return;

        setLoading(true);
        try {
            const response = await axiosInstance.get<ApiResponse>("/admin-users", {
                params: {
                    page,
                    limit: pagination.limit,
                    search: searchQuery,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    role: roleFilter !== 'all' ? roleFilter : undefined
                },
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.data.status && response.data.data) {
                setData(response.data.data);
                setPagination({
                    total: response.data.pagination.total,
                    totalPages: Math.ceil(response.data.pagination.total / parseInt(response.data.pagination.limit)),
                    limit: parseInt(response.data.pagination.limit)
                });
            } else {
                toast.error(response.data.message || 'Failed to fetch admin users');
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error('Failed to fetch admin users');
        } finally {
            setLoading(false);
        }
    }, [authState.token, pagination.limit, searchQuery, statusFilter, roleFilter]);

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

    const handleUserView = (user: AdminUser) => {
        router.push(`/dashboard/settings/teams/${user.id}` as RouteLiteral);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchData(1);
    };

    const filteredData = useMemo(() => {
        return data.filter(user => {
            const matchesSearch = searchQuery === '' ||
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || user.status.toString() === statusFilter;
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
        });
    }, [data, searchQuery, statusFilter, roleFilter]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Page Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <Users className="w-8 h-8 mr-3 text-blue-600" />
                                    Admin Users
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage system administrators and their permissions
                                </p>
                            </div>
                            {/*<button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">*/}
                            {/*    <Plus className="w-4 h-4 mr-2" />*/}
                            {/*    Add Admin User*/}
                            {/*</button>*/}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>

                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Roles</option>
                                <option value="superadmin">Super Admin</option>
                                <option value="admin">Admin</option>
                            </select>

                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Summary */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600">
                        Showing {filteredData.length} of {pagination.total} admin users
                    </p>
                </div>

                {/* User Cards */}
                {loading ? (
                    <LoadingSkeleton />
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No admin users found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Try adjusting your search or filter criteria.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredData.map((user) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onView={handleUserView}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && filteredData.length > 0 && pagination.totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
