import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, CloseIcon } from '@/public/assets/icons';
import FormInputs, { FormSelect } from '@/components/formInputs/formInputs';
import DateRangeSelector from '@/components/filter/DateRangePicker';
import moment from 'moment';

interface FilterProps {
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    isOpen?: boolean;
}

export interface FilterState {
    dateRange: {
        type: 'relative' | 'absolute';
        relativeRange?: string;
        startDate?: string;
        endDate?: string;
    };
    transactionReference: string;
    status: string;
    type: string;
    currency: string;
 
}

const FilterComponent: React.FC<FilterProps> = ({ onClose, onApply, isOpen }) => {
    const [filters, setFilters] = useState<FilterState>({
        dateRange: {
            type: 'relative',
            relativeRange: '7d',
            startDate: moment().format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD'),
        },
        transactionReference: '',
        status: '',
        type: '',
        currency: '',
    });

    const filterRef = useRef<HTMLDivElement>(null);

    const handleDateChange = ({ startDate, endDate }: { startDate: string, endDate: string }) => {
        setFilters(prev => ({
            ...prev,
            dateRange: {
                type: 'absolute',
                startDate,
                endDate,
            },
        }));
    };

    const handleConfirm = () => {
        onApply(filters);
        onClose();
    };

    // Handle click outside to close the filter
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    
    if (!isOpen) return null;

    return (
        <div ref={filterRef} className="absolute top-full right-0 shadow-xl rounded-lg z-10">
            <div className="bg-white rounded-3xl w-full max-w-md">
                <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-medium">Filters</h2>
                        <button onClick={onClose} className="p-1">
                            <CloseIcon />
                        </button>
                    </div>

                    <div className='space-y-2'>
                        {/* Date Range Selector */}
                        <DateRangeSelector
                            startDate={new Date(filters.dateRange.startDate || Date.now())}
                            endDate={new Date(filters.dateRange.endDate || Date.now())}
                            onDateChange={({ startDate, endDate }) => handleDateChange({
                                startDate: moment(startDate).format('YYYY-MM-DD'),
                                endDate: moment(endDate).format('YYYY-MM-DD')
                            })}
                            onRelativeRangeChange={({ startDate, endDate }) => handleDateChange({
                                startDate: moment(startDate).format('YYYY-MM-DD'),
                                endDate: moment(endDate).format('YYYY-MM-DD')
                            })}
                            defaultRelativeRangeValue={'7d'} 
                        />
                        {/* Rest of the filters remain the same */}
                        <FormInputs
                            type="text"
                            defaultValue={filters.transactionReference}
                            onChange={(e) => setFilters({ ...filters, transactionReference: e.target.value })}
                            className="w-full"
                            placeholder="Enter transaction reference" label={'Transaction Reference'} name={'transactionReference'} />

                        <FormSelect
                            getValueOnChange={(e) => setFilters({ ...filters, status: e.value })}
                            options={[
                                { label: "Pending", value: "pending" },
                            ]} label={'Status'} name={'status'} />

                        <FormSelect
                            getValueOnChange={(e) => setFilters({ ...filters, type: e.value })}
                            options={[
                                { label: "Deposit", value: "deposit" },
                            ]} label={'Type'} name={'type'} />

                        <FormSelect
                            getValueOnChange={(e) => setFilters({ ...filters, currency: e.value })}
                            options={[
                                { label: "USD", value: "usd" },
                            ]} label={'Currency'} name={'currency'} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 p-2 border rounded-lg text-center"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 p-2 bg-emerald-500 text-white rounded-lg text-center"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterComponent;