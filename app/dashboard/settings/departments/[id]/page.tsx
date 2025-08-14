"use client";

import React, { useEffect, useState } from 'react';
import { FormSelect } from '@/components/formInputs/formInputs';
import Table, { Column } from '@/components/table';
import Header from './Header';
import axiosInstance, { handleAxiosError } from '@/helpers/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/authContext';
import moment from 'moment';

interface MerchantData {
    id: string;
    email: string;
    name: string;
}

interface DepartmentStats {
    membersCount: number;
    headOfDepartment: number;
    executiveManagement: number;
}

interface MenuPermission {
    title: string;
}

interface MenuSectionProps {
    title: string;
    permission: MenuPermission[];
}

type DepartmentResponse = {
    data: {
        id: number;
        name: string;
        description: string;
        permissions: {
            [key: string]: string[];
        };
        visibility: number;
        created_at: string;
        updated_at: string;
        department_members_count: number;
        department_executive_count: number;
        department_head_count: number;
        permissions_count: number;
    };
};

type MemberResponse = {
    data: {
        name: string;
        email: string;
        pivot: {
            admin_id: number;
        };
    }[];
    status: boolean;
    message: string;
};

const MenuSection: React.FC<MenuSectionProps> = ({ title, permission }) => (
    <div className="mb-12 grid grid-cols-1 md:grid-cols-2">
        <h2 className="font-medium text-gray-900 mb-4">{title}</h2>
        <div className="space-y-3">
            {permission.map((perm, index) => (
                <p
                    key={index}
                    className="block text-sm text-gray-700 hover:text-gray-900 hover:underline"
                >
                    {perm.title}
                </p>
            ))}
        </div>
    </div>
);

const Page = ({ params }: { params: { id: string } }) => {
    const [merchantData, setMerchantData] = useState<MerchantData[]>([]);
    const [departmentData, setDepartmentData] = useState<DepartmentStats>({
        membersCount: 0,
        headOfDepartment: 0,
        executiveManagement: 0,
    });
    const [permissionSection, setPermissionSection] = useState<MenuSectionProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { authState } = useAuth();

    const COLUMNS: Column<MerchantData>[] = [
        { id: 'name', label: 'NAME' },
        { id: 'email', label: 'EMAIL' },
    ];

    const fetchData = async (url: string, onSuccess: (data: any) => void) => {
        setIsLoading(true);
        console.log("Bearer token:", authState); // This should now reflect the latest authState
        try {
            const response = await axiosInstance.get(url, {
                headers: { Authorization: `Bearer ${authState?.token}` },
            });

            if (response.data.status) {
                onSuccess(response.data);
            } else {
                toast.error(response.data.message || "Something went wrong");
            }
        } catch (error) {
            handleAxiosError(error, (message) => toast.error(message || 'Something went wrong'));
        } finally {
            setIsLoading(false);
        }
    };
    const formatPermissionTitle = (permission: string) => {
        return permission
            .split('_')  // Split the string by underscores
            .map((word, index) => {
                // Capitalize the first letter of each word
                return index === 0
                    ? word.toLowerCase()
                    : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');  // Join the words back together with a space
    };
    useEffect(() => {
        if (!authState || !authState.token) return; // Ensure authState is initialized



        fetchData(`settings/departments/${params.id}`, (data: DepartmentResponse) => {
            console.log("settings/departments/", data);
            setDepartmentData({
                membersCount: data.data.department_members_count,
                headOfDepartment: data.data.department_head_count, // Placeholder value
                executiveManagement: data.data.department_executive_count, // Placeholder value
            });

            // Dynamically set the permission section based on the API response
            const updatedPermissions = Object.keys(data.data.permissions).map((sectionTitle) => {
                return {
                    title: sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1),
                    permission: data.data.permissions[sectionTitle].map((perm) => ({
                        title: formatPermissionTitle(perm),  // Convert each permission title to a well-formed format
                    })),
                };
            });

            setPermissionSection(updatedPermissions);
        });

        fetchData(`settings/departments/${params.id}/members`, (data: MemberResponse) => {
            setMerchantData(
                data.data.map((member) => ({
                    id: member.pivot.admin_id.toString(),
                    email: member.email,
                    name: member.name,
                }))
            );
        });
    }, [authState, params.id]);


    return (
        <div>
            <Header />
            <div className="p-2">
                <h1 className="font-medium text-2xl my-2 mt-5">Compliance</h1>
                <div className="grid md:grid-cols-3 gap-4 max-w-4xl grid-cols-1">
                    {Object.entries(departmentData).map(([key, value]) => (
                        <div
                            key={key}
                            className="rounded-lg p-4 shadow-sm w-full bg-[#F9FAFC] border-[0.9px]"
                        >
                            <h3 className="text-sm text-gray-600 mb-2">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h3>
                            <p className="text-3xl font-semibold text-gray-900">{value}</p>
                        </div>
                    ))}
                </div>
            </div>
            <section className="grid grid-cols-1 gap-5 mt-8 md:grid-cols-2 p-2 border-t border-[#E4E7EC]">
                <div className="border-r border-[#E4E7EC]">
                    <div className="flex items-center justify-between gap-2 md:flex-col md:items-start">
                        <p className="font-medium">Users</p>
                        <FormSelect
                            name={''}
                            defaultValue={"members"}
                            options={[{ label: 'members', value: 'members' }]}
                        />
                    </div>
                    <Table<MerchantData>
                        headers={COLUMNS}
                        data={merchantData}
                        limit={20}
                        showPagination={false}
                        loading={isLoading} pagination={{
                            totalItems: 0,
                            limit: 0,
                            totalPages: 0
                        }} onPaginate={() => null} />
                </div>
                <div>
                    <div className="mt-3">
                        <p className="font-medium">Permissions</p>
                    </div>
                    <div className="p-6 max-w-xl md:mx-auto">
                        <div className="space-y-8">
                            {permissionSection.map((section, index) => (
                                <MenuSection key={index} title={section.title} permission={section.permission} />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Page;
