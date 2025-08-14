"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import toast from 'react-hot-toast';

import Header from './Header';
import { cn, StringUtils } from '@/helpers/extras';
import { CalendarIcon } from '@/assets/icons';
import { Chip } from '@/components/chip';
import { TableDetailSkeleton } from '@/components/loaders';
import axiosInstance, { handleAxiosError } from '@/helpers/axiosInstance';
import { STATUS_ENUMS } from '@/types';
import { StatusIcon } from '@/public/assets/icons';
import moment from 'moment';

interface TeamMember {
    id: number;
    name: string;
    email: string;
    role: string;
    departments: string[];
    // departments: {
    //     name: string
    // }[];
    created_at: string;
    status: number;
    permissions: Record<string, string[]>;
}


const PERMISSION_GROUPS = [
    {
        title: "Transactions",
        permissions: [
            "View Transactions",
            "Download Transactions",
            "Manage Refunds"
        ]
    },
    {
        title: "Payment Links",
        permissions: [
            "View Payment Links",
            "Create Payment Links",
            "Manage Payment Links"
        ]
    },
    {
        title: "Customers",
        permissions: [
            "View Customers",
            "Create Customers",
            "Manage Customers"
        ]
    },
    {
        title: "Balances",
        permissions: [
            "View Wallet, Settlements, History",
            "Fund Wallet",
            "Set Low Limit",
            "Download Wallet Statement",
            "Download Settlement History"
        ]
    },
    {
        title: "Transfers",
        permissions: [
            "View Transfers",
            "Create Transfers",
            "Download Transfers"
        ]
    },
    {
        title: "Invoicing",
        permissions: [
            "View Invoices",
            "Create Invoices",
            "Manage Invoices",
            "Download Invoices"
        ]
    }
] as const;

const TeamDetailsPage = ({ params }: { params: { id: string } }) => {
    const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { authState } = useAuth();

    const fetchTeamMember = async () => {
        if (!authState?.token) return;

        try {
            const response = await axiosInstance.get<TeamMember>(`/admin-users/${params.id}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });

            if (response.data.status && response.data.data) {
                console.log("response.data.data", response.data.data)
                setTeamMember(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to fetch team member details");
            }
        } catch (error) {
            handleAxiosError(error, message =>
                toast.error(message || 'Failed to fetch team member details')
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamMember();
    }, [authState?.token, params.id]);

    const TeamMemberInfo = ({ member }: { member: TeamMember }) => (
        <div className='space-y-1'>
            <h2 className='font-normal text-3xl'>{member.name}</h2>
            <p className='text-[#00000099] text-sx'>{member.email}</p>

            <div className='flex items-start mt-10 gap-20 '>
                <div className='flex gap-10 w-full'>
                    <ul className='text-sm text-[#00000080] font-normal space-y-4'>
                        <li className='flex items-center gap-1'>
                            <StatusIcon />Status</li>
                        <li className='flex items-center gap-1'>
                            <CalendarIcon height={18} width={18} strokeColor='#00000080' />
                            Date Created
                        </li>
                        <li className='flex items-center gap-1'>
                            <CalendarIcon height={18} width={18} strokeColor='#00000080' />
                            Departments
                        </li>
                        <li className='flex items-center gap-1'>
                            <CalendarIcon height={18} width={18} strokeColor='#00000080' />
                            Role
                        </li>
                    </ul>
                    <ul className='text-sm space-y-4'>
                        <li>
                            <Chip withDot variant={STATUS_ENUMS[member.status]}>
                                {StringUtils.capitalizeWords(STATUS_ENUMS[member.status])}
                            </Chip>
                        </li>
                        <li className='font-normal'>{member.created_at ? moment(member.created_at).format('MMM D, YYYY') : "No Data"}</li>
                        <li className='font-normal'>
                            {member.departments.length > 0 ? member.departments.join(', ') : "No Departments"}
                        </li>
                        <li className='font-normal'>
                            {member.role === "1" ? 'Member' : StringUtils.capitalizeWords(member.role)}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const PermissionsList = () => (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6")}>
            {PERMISSION_GROUPS.map(group => (
                <div
                    key={group.title}
                    className="bg-white rounded-lg space-y-4"
                >
                    <h2 className="text-lg font-semibold text-gray-900">
                        {group.title}
                    </h2>
                    <ul className="space-y-2">
                        {group.permissions.map(permission => (
                            <li
                                key={permission}
                                className="text-gray-600 text-sm flex items-center gap-2"
                            >
                                {permission}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );

    return (
        <div>
            <Header adminId={params.id} />
            <div className='p-6'>
                {isLoading ? (
                    <TableDetailSkeleton />
                ) : teamMember ? (
                    <>
                        <TeamMemberInfo member={teamMember} />
                        <PermissionsList />
                    </>
                ) : (
                    <p>No team member data available</p>
                )}
            </div>
        </div>
    );
};

export default TeamDetailsPage;