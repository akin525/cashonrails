"use client"
import { CustomDropdown, DropdownItem } from '@/components/dropDown'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import axiosInstance from '@/helpers/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/authContext';

const Header = ({adminId}: {adminId: string}) => {
    const [selectedOption, setSelectedOption] = useState<"deactivate" | "delete" | null>(null);
    const router = useRouter();
    const {authState} = useAuth()

    const handleDeactivateUser = async () => {
        try {
            const response = await axiosInstance.delete(`/admin-users/${adminId}`, {
                headers: {
                    Authorization: `Bearer ${authState.token}`
                }
            });
            if (response.data && response.data.success) {
                toast.success("User deactivated successfully");
                // Perform any additional actions if needed
            } else {
                toast.error(response.data.message || "Failed to deactivate user");
            }
        } catch (err) {
            toast.error("Error deactivating user. Please try again.");
        }
    };

    const handleDeleteUser = async () => {
        try {
            const response = await axiosInstance.delete(`/admin-users/${adminId}`, {
                headers: {
                    Authorization: `Bearer ${authState.token}`
                }
            });
            if (response.data && response.data.success) {
                toast.success("User deleted successfully");
                // Perform any additional actions if needed
            } else {
                toast.error(response.data.message || "Failed to delete user");
            }
        } catch (err) {
            toast.error("Error deleting user. Please try again.");
        }
    };

    const customTrigger = ({ isOpen }: { isOpen: boolean }) => (
        <button className="flex items-center gap-2 px-6 py-3 text-black border border-[#D0D5DD] rounded-md">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.99365 10H10.0012" stroke="black" strokeWidth="2.08333" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.98682 15H9.99432" stroke="black" strokeWidth="2.08333" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 5H10.0075" stroke="black" strokeWidth="2.08333" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Manage User
        </button>
    );

    return (
        <div className="flex items-center justify-between h-[96px] px-2 border-b border-[#E4E7EC]">
            <div className="flex items-center space-x-4">
                <p className="text-[#00000080] text-lg">Teams</p>
                <span className="text-gray-400 font-medium">/</span>
                <button onClick={() => {
                    router.back()
                }} className="text-black hover:text-gray-900 font-medium text-lg">User Details</button>
            </div>
            <nav>
                <CustomDropdown
                    trigger={customTrigger}
                    dropdownClassName="bg-gray-50 rounded-[18px]"
                >
                    <DropdownItem
                        className='py-2'
                        onClick={() => {
                            setSelectedOption('deactivate');
                            // handleDeactivateUser();
                        }}
                    >
                        Deactivate User
                    </DropdownItem>
                    <DropdownItem
                        className='py-2 text-[#FF5656]'
                        onClick={() => {
                            setSelectedOption('delete');
                            handleDeleteUser();
                        }}
                    >
                        Delete User
                    </DropdownItem>
                </CustomDropdown>
            </nav>
        </div>
    )
}

export default Header