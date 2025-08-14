"use client";
import React, { useState } from 'react';
import { PlusIcon } from '@icons/index';
import { BusinessTypeFilterState, useUI } from '@/contexts/uiContext';
import FilterIcon from '@/assets/icons/filter/filled';
import DateRangeSelector from '@/components/filter/DateRangePicker';
import FormInputs, { FormSelect } from '@/components/formInputs/formInputs';
import moment from 'moment';
import CustomFilter, { BaseFilterConfig } from '@/components/dashboard/filters/CustomFilter';

// Constants
const ROUTES = {
  DEVELOPERS: '/'
} as const;

// Define props type for ModeToggle
interface ModeToggleProps {
  mode: 'live' | 'test';
  onToggle: () => void;
}

const CreateButton: React.FC = () => (
  <button className="md:px-4 px-2 py-1 md:py-2 text-black border-bar text-sm md:text-base border-[1.5px] rounded-lg flex items-center gap-1">
    <PlusIcon stroke="black" />
    Create
  </button>
);

const Header: React.FC<{ headerTitle: string }> = ({ headerTitle }) => {
  const { setSearchQuery, showSearchQuery, setDateFilter, filterState, setFilterState } = useUI();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const typedFilterState = filterState as BusinessTypeFilterState;

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
      type: 'select',
      label: 'Status',
      name: 'status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    },
    {
      type: 'select',
      label: 'User Type',
      name: 'userType',
      options: [
        { label: 'Individual', value: 'individual' },
        { label: 'Business', value: 'business' }
      ]
    },
    {
      type: 'select',
      label: 'Business Type',
      name: 'businessType',
      options: [
        { label: 'Sole Proprietorship', value: 'sole-proprietorship' },
        { label: 'Partnership', value: 'partnership' },
        { label: 'Corporation', value: 'corporation' },
        { label: 'Non-Profit', value: 'non-profit' }
      ]
    },
    {
      type: 'select',
      label: 'Currency',
      name: 'currency',
      options: [
        { label: 'USD', value: 'usd' },
        { label: 'EUR', value: 'eur' },
        { label: 'GBP', value: 'gbp' },
        { label: 'NGN', value: 'ngn' }
      ]
    }
  ];

  return (
    <>
      <header className="flex items-center justify-between p-4 border-b border-bar min-h-auto relative flex-wrap gap-2">
        <div className='flex gap-5 items-center'>
          <h1 className="md:text-lg font-medium">
            {headerTitle}
          </h1>
          <FormSelect name={''}
            placeholder={{
              label: "NGN",
              value: "ngn"
            }}
            options={[
              {
                label: "NGN",
                value: "ngn"
              }
            ]} />
        </div>
        {showSearchQuery &&
          <div className='flex-1 max-w-[400px]'>
            <FormInputs leadingItem={
              <>
                <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.22869 12.2814C3.16827 12.2814 0.676605 9.78975 0.676605 6.72933C0.676605 3.66891 3.16827 1.17725 6.22869 1.17725C9.28911 1.17725 11.7808 3.66891 11.7808 6.72933C11.7808 9.78975 9.28911 12.2814 6.22869 12.2814ZM6.22869 1.98975C3.61244 1.98975 1.48911 4.1185 1.48911 6.72933C1.48911 9.34016 3.61244 11.4689 6.22869 11.4689C8.84494 11.4689 10.9683 9.34016 10.9683 6.72933C10.9683 4.1185 8.84494 1.98975 6.22869 1.98975Z" fill="black" fillOpacity="0.6" />
                  <path d="M11.9166 12.8232C11.8137 12.8232 11.7108 12.7853 11.6296 12.704L10.5462 11.6207C10.3891 11.4636 10.3891 11.2036 10.5462 11.0465C10.7033 10.8894 10.9633 10.8894 11.1204 11.0465L12.2037 12.1299C12.3608 12.2869 12.3608 12.5469 12.2037 12.704C12.1225 12.7853 12.0196 12.8232 11.9166 12.8232Z" fill="black" fillOpacity="0.6" />
                </svg>
              </>
            } label={''} name={'search'} placeholder='Search' className='max-w-[300px]' />
          </div>
        }


        <nav className="flex items-center space-x-3">
          <button className='border-[#D0D5DD] border p-3 rounded-lg' onClick={handleFilterToggle}>
            <FilterIcon />
          </button>
           
          <button className="border-[#D0D5DD] border font-medium text-sm py-2 px-4 rounded-md">
            Download
          </button>
        </nav>

      </header>

    </>
  );
};

export default Header;