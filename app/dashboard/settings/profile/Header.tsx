import FilterIcon from '@/assets/icons/filter/filled';
import DateRangeSelector from '@/components/filter/DateRangePicker';
import FormInputs, { FormSelect } from '@/components/formInputs/formInputs';
import React from 'react'

const Header = () => {
    return (
        <header className="flex items-center justify-between p-4 border-b border-bar min-h-auto relative flex-wrap gap-2">
            <div className='flex gap-5 items-center'>
                <h1 className="md:text-lg font-medium">
                    Profile
                </h1>
            </div>
        </header>
    )
}

export default Header

