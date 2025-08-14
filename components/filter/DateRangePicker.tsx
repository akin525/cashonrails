"use client"
import React, { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronIcon } from '@/public/assets/icons';
import { FormSelect } from '@/components/formInputs/formInputs';

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onDateChange: (startDate: Date, endDate: Date) => void;
    onClose: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onDateChange, onClose }) => {
    const [currentMonth, setCurrentMonth] = useState(startDate);
    const [selectedStart, setSelectedStart] = useState(startDate);
    const [selectedEnd, setSelectedEnd] = useState(endDate);
    const [selecting, setSelecting] = useState<'start' | 'end'>('start');

    const mobilePickerRef = useRef<HTMLDivElement>(null);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days: Date[] = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Add padding days from previous month
        for (let i = firstDay.getDay() - 1; i >= 0; i--) {
            days.push(new Date(year, month, -i));
        }

        // Add days of current month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const handleDateClick = (date: Date) => {
        if (selecting === 'start') {
            setSelectedStart(date);
            setSelecting('end');
        } else {
            if (date < selectedStart) {
                setSelectedStart(date);
            }
            setSelectedEnd(date);
            onDateChange && onDateChange(selectedStart, date);
            onClose();
        }
    };

    const isSelected = (date: Date) => (
        (date >= selectedStart && date <= selectedEnd) ||
        date.toDateString() === selectedStart.toDateString() ||
        date.toDateString() === selectedEnd.toDateString()
    );

    // Handle click outside to close on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobilePickerRef.current && !mobilePickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        // Add event listener for mobile only
        if (window.innerWidth < 768) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <>
            {/* Desktop Version */}
            <div className="hidden md:block absolute md:top-full md:right-0 md:bg-white md:rounded-xl md:shadow-lg md:border md:p-4 md:w-80 md:z-50 md:mt-3">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded bg-emerald-500">
                        <ChevronIcon className="w-3 h-3 rotate-90" />
                    </button>
                    <span className="font-medium">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded bg-emerald-500">
                        <ChevronIcon className="w-3 h-3 -rotate-90" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(day => <div key={day} className="text-center text-sm text-gray-500">{day}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentMonth).map((date, index) => (
                        <button key={index} onClick={() => handleDateClick(date)} className={`p-2 text-sm rounded-lg ${isSelected(date) ? 'bg-emerald-500 text-white' : ''} ${date.getMonth() !== currentMonth.getMonth() ? 'text-gray-400' : ''} hover:bg-emerald-100`}>
                            {date.getDate()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile Backdrop */}
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" />

            {/* Mobile DateRangePicker */}
            <div className="fixed inset-0 flex items-center justify-center z-50 md:hidden">
                <div ref={mobilePickerRef} className="bg-white rounded-xl shadow-lg border p-4 w-80 max-w-full">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronIcon className="w-3 h-3 rotate-90" />
                        </button>
                        <span className="font-medium">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded">
                            <ChevronIcon className="w-3 h-3 -rotate-90" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(day => <div key={day} className="text-center text-sm text-gray-500">{day}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((date, index) => (
                            <button key={index} onClick={() => handleDateClick(date)} className={`p-2 text-sm rounded-lg ${isSelected(date) ? 'bg-emerald-500 text-white' : ''} ${date.getMonth() !== currentMonth.getMonth() ? 'text-gray-400' : ''} hover:bg-emerald-100`}>
                                {date.getDate()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

/**
 * Props for the DateRangeSelector component.
 */
interface DateRangeSelectorProps {
    /** The currently selected relative range. */
    defaultRelativeRangeValue: 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'last_month' | '';
    /** Callback function to handle changes in the relative range. */
    onRelativeRangeChange: ({ startDate, endDate, range }: { startDate: Date, endDate: Date, range: string }) => void;
    /** The start date for the date range. */
    startDate: Date;
    /** The end date for the date range. */
    endDate: Date;
    /** Callback function to handle date changes. */
    onDateChange: ({startDate, endDate}: {startDate: Date, endDate: Date}) => void;
    /** The default relative date ranges to display */
    defaultRelativeRanges?: {label: string; value: string}[];
}

/**
 * A component that allows users to select a date range, either relative or absolute.
 * 
 * @param {DateRangeSelectorProps} props - The props for the DateRangeSelector component.
 * @example
 * <DateRangeSelector
 *     relativeRange="7d"
 *     onRelativeRangeChange={(range) => console.log(range)}
 *     startDate={new Date()}
 *     endDate={new Date()}
 *     onDateChange={(start, end) => console.log(start, end)}
 * />
 */
const DEFAULT_RELATIVE_RANGES = [
    {
    label: 'Today',
    value: 'today'
  },
  {
    label: 'Yesterday',
    value: 'yesterday'
  },
  {
    label: 'Last 7 Days',
    value: '7d'
  },
  {
    label: 'Last 30 Days',
    value: '30d'
  },
  {
    label: 'This Month',
    value: 'this_month'
  },
  {
    label: 'Last Month',
    value: 'last_month'
  }
];
const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ defaultRelativeRangeValue, onRelativeRangeChange, startDate, endDate, onDateChange, defaultRelativeRanges = DEFAULT_RELATIVE_RANGES }) => {
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const dateRangePickerRef = useRef<HTMLDivElement>(null);

    const formatDateRange = () => (startDate && endDate) ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : '';

    // Close the date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dateRangePickerRef.current && !dateRangePickerRef.current.contains(event.target as Node)) {
                setShowDateRangePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex items-center relative">
            <FormSelect
                // defaultValue={relativeRange}
                getValue={(value) => {
                    const now = new Date();
                    let start, end;
                    
                    switch(value) {
                        case 'today':
                            start = end = now;
                            break;
                        case '7d':
                            start = new Date(now.setDate(now.getDate() - 7));
                            end = new Date();
                            break;
                        case '30d':
                            start = new Date(now.setDate(now.getDate() - 30));
                            end = new Date();
                            break;
                        case 'this_month':
                            start = new Date(now.getFullYear(), now.getMonth(), 1);
                            end = new Date();
                            break;
                        case 'last_month':
                            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                            end = new Date(now.getFullYear(), now.getMonth(), 0);
                            break;
                        case 'yesterday':
                            start = new Date(now.setDate(now.getDate() - 1));
                            end = new Date();
                            break;
                        default:
                            start = end = now;
                    }
                    
                    onRelativeRangeChange({
                        startDate: start,
                        endDate: end,
                        range: value.toString()
                    });
                }}
                className="w-full border rounded-l-md rounded-r-none appearance-none border-r-0"
                options={defaultRelativeRanges}
                label={''}
                name={''}
                placeholder={{ label: 'Last 7 Days', value: "Select a date range" }}
            />
            <div className="relative">
                <button onClick={() => setShowDateRangePicker(!showDateRangePicker)} className="w-full p-2.5 border rounded-r-md text-left flex justify-between items-center gap-2 font-normal text-black/60">
                    <CalendarIcon strokeColor='rgb(0 0 0 / 0.6)' />
                    <span>{formatDateRange()}</span>
                </button>
                {showDateRangePicker && (
                    <div ref={dateRangePickerRef}>
                        <DateRangePicker startDate={startDate} endDate={endDate} onDateChange={(start, end) => onDateChange({ startDate: start, endDate: end })} onClose={() => setShowDateRangePicker(false)} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DateRangeSelector;