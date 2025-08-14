"use client"
import React, { useEffect, useState } from 'react'
import Header from './Header'
import { useUI } from '@/contexts/uiContext';
import { ToggleSwitch } from '@/components/utils';
import Table, { Column } from '@/components/table';
import FormInputs from '@/components/formInputs/formInputs';
import { Chip } from '@/components/chip';

interface BusinessData {
    id: string;
    merchantId: string;
    merchantName: string;
    dateCreated: string;
    status: "active" | "deactivated"
}

const Page = () => {
    const { setShowHeader } = useUI()

    const [tableData, setTableData] = useState<BusinessData[]>([]);

    const MERCHANT_DATA_COLUMNS: Column<BusinessData>[] = [
        { id: "merchantId", label: "MERCHANT ID" },
        { id: "merchantName", label: "MERCHANT NAME" },
        {
            id: "status",
            label: "STATUS",
            type: "custom",
            renderCustom: (row: BusinessData) => (
                <Chip variant='success'>
                    Active
                </Chip>
            )
        },
        { id: "dateCreated", label: "DATE CREATED" },
    ];
    useEffect(() => {
        // Setup header and search query
        setShowHeader(false);
        const initialTableData: BusinessData[] = [
            { merchantId: "54789", merchantName: "GreenMart" as const, dateCreated: "Jan 6, 2024", id: "1", status: "active" },
        ];
        setTableData(initialTableData);
        // Cleanup on unmount
        return () => {
            setShowHeader(false);
        };
    }, [setShowHeader]);
    return (
        <div>
            <Header />
            <section className='p-8'>
                <h1 className='text-xl font-medium'>Company Name</h1>
                <p className='text-[#00000080]'>Businesses offering credit services to individuals or companies.</p>

                <div className='grid grid-cols-4 mt-10 max-w-3xl gap-2'>
                    <div className='space-y-2'>
                        <p className='text-[#00000080] text-sm'>Business Type</p>
                        <p>Corporate Entities</p>
                    </div>
                    <div className='space-y-2'>
                        <p className='text-[#00000080] text-sm'>Merchants</p>
                        <p>600</p>
                    </div>
                    <div className='space-y-2'>
                        <p className='text-[#00000080] text-sm'>Date Created</p>
                        <p>Oct 24, 2024; 5:50pm</p>
                    </div>
                    <div className='pl-5 space-y-2'>
                        <p className='text-[#00000080] text-sm'>Status</p>
                        <div className='flex items-center gap-2'>
                            <ToggleSwitch enabled={false} onToggle={function (enabled: boolean): void {
                                throw new Error('Function not implemented.');
                            }} />
                            <p>Enabled</p>
                        </div>
                    </div>
                </div>
                <div className='border-t border-[#E4E7EC] flex items-start mt-8'>
                    <div className='flex-1 border-r border-[#E4E7EC] pr-5'>
                        <div className='my-5 flex items-center justify-between'>
                            <h1>Merchants (600)</h1>
                            <div className='max-w-sm'>
                                <FormInputs label={''} name={''} placeholder='Search' leadingItem={
                                    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.2286 12.2814C3.16818 12.2814 0.676514 9.78975 0.676514 6.72933C0.676514 3.66891 3.16818 1.17725 6.2286 1.17725C9.28901 1.17725 11.7807 3.66891 11.7807 6.72933C11.7807 9.78975 9.28901 12.2814 6.2286 12.2814ZM6.2286 1.98975C3.61235 1.98975 1.48901 4.1185 1.48901 6.72933C1.48901 9.34016 3.61235 11.4689 6.2286 11.4689C8.84485 11.4689 10.9682 9.34016 10.9682 6.72933C10.9682 4.1185 8.84485 1.98975 6.2286 1.98975Z" fill="black" fillOpacity="0.6" />
                                        <path d="M11.9167 12.8232C11.8138 12.8232 11.7109 12.7853 11.6296 12.704L10.5463 11.6207C10.3892 11.4636 10.3892 11.2036 10.5463 11.0465C10.7034 10.8894 10.9634 10.8894 11.1204 11.0465L12.2038 12.1299C12.3609 12.2869 12.3609 12.5469 12.2038 12.704C12.1225 12.7853 12.0196 12.8232 11.9167 12.8232Z" fill="black" fillOpacity="0.6" />
                                    </svg>
                                } />
                            </div>
                        </div>
                        <Table<BusinessData>
                            headers={MERCHANT_DATA_COLUMNS}
                            data={tableData}
                            limit={20}
                            showPagination={false} pagination={{
                                totalItems: 0,
                                limit: 0,
                                totalPages: 0
                            }} onPaginate={function (page: number): void {
                                throw new Error('Function not implemented.');
                            }} />
                    </div>
                    <div className='w-full max-w-md h-full p-5'>
                        <h1>Compliance  Requirement</h1>
                        <p className='text-[#00000080]'>The documents needed for merchants of this type.</p>
                        <ul className='space-y-4 mt-8 text-sm'>
                            <li className='border-b border-[#E4E7EC] py-2'>SCUML Certificate</li>
                            <li className='border-b border-[#E4E7EC] py-2'>Betting License By The National Lottery Regulatory Commission </li>
                            <li className='border-b border-[#E4E7EC] py-2'>Terms of Agreement</li>

                        </ul>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Page