import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon } from '@/public/assets/icons';
import FormInputs, { FormSelect } from '@/components/formInputs/formInputs';
import DateRangeSelector from '@/components/filter/DateRangePicker';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';

export type FilterOptionType = {
    label: string;
    value: string;
};

export interface BaseFilterConfig {
    type: 'text' | 'select' | 'date';
    label: string;
    name: string;
    placeholder?: string;
    options?: FilterOptionType[];
}

export interface DateRangeFilter {
    type: 'relative' | 'absolute';
    relativeRange?: string;
    startDate?: string;
    endDate?: string;
}

export interface FilterState {
    [key: string]: any;
    dateRange: DateRangeFilter;
}

interface FilterProps {
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    isOpen?: boolean;
    filterConfig: BaseFilterConfig[];
    initialState?: Partial<FilterState>;
}

const generateInitialState = (config: BaseFilterConfig[], baseState?: Partial<FilterState>): FilterState => {
    const defaultState: FilterState = {
        dateRange: {
            type: 'relative',
            relativeRange: undefined,
            startDate: undefined,
            endDate: undefined,
        },
    };

    config.forEach(filter => {
        if (filter.type !== 'date') {
            defaultState[filter.name] = '';
        }
    });

    return {
        ...defaultState,
        ...baseState,
    };
};

const CustomFilter: React.FC<FilterProps> = ({ onClose, onApply, isOpen, filterConfig, initialState }) => {
    const [filters, setFilters] = useState<FilterState>(() => generateInitialState(filterConfig, initialState));
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

    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={filterRef}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="absolute top-full right-0 shadow-xl rounded-lg z-10"
                >
                    <div className="bg-white rounded-3xl w-full max-w-md">
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-sm font-medium">Filters</h2>
                                <button onClick={onClose} className="p-1">
                                    <CloseIcon />
                                </button>
                            </div>

                            <div className='space-y-2'>
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

                                {filterConfig.map((config) => {
                                    if (config.type === 'text') {
                                        return (
                                            <FormInputs
                                                key={config.name}
                                                type="text"
                                                defaultValue={filters[config.name]}
                                                onChange={(e) => handleFilterChange(config.name, e.target.value)}
                                                className="w-full"
                                                placeholder={config.placeholder}
                                                label={config.label}
                                                name={config.name}
                                            />
                                        );
                                    }
                                    if (config.type === 'select' && config.options) {
                                        return (
                                            <FormSelect
                                                key={config.name}
                                                getValueOnChange={(e) => handleFilterChange(config.name, e.value)}
                                                options={config.options}
                                                label={config.label}
                                                name={config.name}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={onClose}
                                    className="flex-1 p-2 border rounded-lg text-center hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        onApply(filters);
                                        onClose();
                                    }}
                                    className="flex-1 p-2 bg-emerald-500 text-white rounded-lg text-center hover:bg-emerald-600 transition"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CustomFilter;
