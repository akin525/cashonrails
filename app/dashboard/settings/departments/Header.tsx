"use client"
import { CloseIcon } from '@/assets/icons';
import FilterIcon from '@/assets/icons/filter/filled';
import Buttons from '@/components/buttons';
import CustomFilter, { BaseFilterConfig } from '@/components/dashboard/filters/CustomFilter';
import DateRangeSelector from '@/components/filter/DateRangePicker';
import FormInputs, { FormCheckbox, FormSelect } from '@/components/formInputs/formInputs';
import Modal from '@/components/modal';
import { useUI, BusinessTypeFilterState } from '@/contexts/uiContext';
import { PlusIcon } from '@/public/assets/icons';
import moment from 'moment';
import React, { useState } from 'react';

const Header = () => {
    const [showModal, setShowModal] = useState(false)
    const { setSearchQuery, showSearchQuery, setDateFilter, filterState, setFilterState } = useUI();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const typedFilterState = filterState as BusinessTypeFilterState;
    console.log("typedFilterState", typedFilterState)
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleDateFilterChange = ({ startDate, endDate }: { startDate: Date, endDate: Date }) => {
        setDateFilter(moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'));
    };

    const handleFilterToggle = () => {
        setIsFilterOpen(!isFilterOpen);
    };

     
    // UsersPage.tsx - Different filter configuration
    const userFilterConfig: BaseFilterConfig[] = [
        {
            type: 'text',
            label: 'Settlement ID',
            name: 'settlementId',
            placeholder: 'Enter settlement ID'
        },
        {
            type: 'text',
            label: 'Beneficiary',
            name: 'beneficiaryName',
            placeholder: 'Enter beneficiary Name'
        },
        {
            type: 'select',
            label: 'Status',
            name: 'status',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Completed', value: 'completed' },
                { label: 'Failed', value: 'failed' }

            ]
        },
        {
            type: 'select',
            label: 'Currency',
            name: 'currency',
            options: [
                { label: 'NGN', value: 'ngn' },
                { label: 'USD', value: 'usd' }
            ]
        }
    ];
    return (
        <header className="flex items-center justify-between p-4 border-b border-bar min-h-auto relative flex-wrap gap-2">
            <div className='flex gap-5 items-center flex-1 max-w-xl justify-between'>
                <h1 className="md:text-lg font-medium">
                    Departments
                </h1>
                <div className='flex-1 max-w-[300px]'>
                    <FormInputs leadingItem={
                        <>
                            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.22869 12.2814C3.16827 12.2814 0.676605 9.78975 0.676605 6.72933C0.676605 3.66891 3.16827 1.17725 6.22869 1.17725C9.28911 1.17725 11.7808 3.66891 11.7808 6.72933C11.7808 9.78975 9.28911 12.2814 6.22869 12.2814ZM6.22869 1.98975C3.61244 1.98975 1.48911 4.1185 1.48911 6.72933C1.48911 9.34016 3.61244 11.4689 6.22869 11.4689C8.84494 11.4689 10.9683 9.34016 10.9683 6.72933C10.9683 4.1185 8.84494 1.98975 6.22869 1.98975Z" fill="black" fillOpacity="0.6" />
                                <path d="M11.9166 12.8232C11.8137 12.8232 11.7108 12.7853 11.6296 12.704L10.5462 11.6207C10.3891 11.4636 10.3891 11.2036 10.5462 11.0465C10.7033 10.8894 10.9633 10.8894 11.1204 11.0465L12.2037 12.1299C12.3608 12.2869 12.3608 12.5469 12.2037 12.704C12.1225 12.7853 12.0196 12.8232 11.9166 12.8232Z" fill="black" fillOpacity="0.6" />
                            </svg>
                        </>
                    } label={''} name={'search'} placeholder='Search' className='max-w-[300px]' />
                </div>
            </div>


            <nav className="flex items-center space-x-3">
                <div className='flex items-center gap-2'>
                    <button className='border-[#D0D5DD] border p-3 rounded-lg' onClick={handleFilterToggle}>
                        <FilterIcon />
                    </button>
                     
                    <button className="border-[#D0D5DD] border font-medium text-sm py-2 px-4 rounded-md">
                        Download
                    </button>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-[#01AB79] border-[#01AB79] border flex items-center font-medium text-sm py-2 px-4 rounded-md text-white">
                    <PlusIcon stroke='white' /> New Department
                </button>
            </nav>
            <Modal isOpen={showModal} onClose={function (): void {
                setShowModal(false)
            }}>
                <>
                    <div className='flex items-center justify-between'>
                        <p>Add New Member</p>
                        <CloseIcon />
                    </div>
                    <div className='space-y-4 mt-7'>
                        <FormInputs label={'Email Id'} name={''} />
                        <FormSelect label='SELECT TEAM' name={'Select Team'} options={[
                            { label: "Operstions", value: "operations" }
                        ]} />
                        <FormSelect label='SELECT ROLE' name={'Select Role'} options={[
                            { label: "Operstions", value: "operations" }
                        ]} />
                        <div className='flex items-center gap-2 justify-between mt-5'>
                            <FormCheckbox initialValue={false} name={'operations'} label='Operations' />
                            <FormCheckbox initialValue={false} name={'compliance'} label='Compliance' />
                            <FormCheckbox initialValue={false} name={'finance'} label='Finance' />
                            <FormCheckbox initialValue={false} name={'growth'} label='Growth' />
                        </div>
                        <Buttons label='Send Invite' type='smPrimaryButton' fullWidth />

                    </div>
                </>
            </Modal>
        </header>

    )
}

export default Header

