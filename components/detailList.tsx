import React, { Dispatch, ReactNode, useState } from 'react';
import FormInputs from './formInputs/formInputs';

export interface DetailItem {
    id: string;
    label: string;
    value: string | number;
    type?: 'text' | 'number' | 'currency' | string;
    formatter?: (value: any) => ReactNode;
    editable?: boolean;
}

type DetailListProps = {
    items: DetailItem[]; // Ensures items is always an array of DetailItem
    className?: string; // Optional additional classes for styling
    idEditing: boolean; // Indicates if the component is in editing mode
    setPayloadValues: (index: number, value: string | number) => void; // Callback to update item values
};


const DetailList = ({ items, className = '', idEditing, setPayloadValues }: DetailListProps) => {
    const formatValue = (item: DetailItem) => {
        if (item.formatter) {
            return item.formatter(item.value);
        }

        switch (item.type) {
            case 'currency':
                return `₦${Number(item.value).toLocaleString()}`;
            case 'number':
                return Number(item.value).toLocaleString();
            default:
                return item.value;
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className="py-2 border-b border-gray-100"
                >
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-gray-900 text-base font-normal">
                            {item.label}
                        </span>

                        <div className="flex items-center gap-3">
                            {idEditing ? (
                                <FormInputs
                                    type="text"
                                    defaultValue={item.value}
                                    onChange={(e) => setPayloadValues(index, e.target.value)}
                                    className="text-gray-900 text-base font-normal"
                                    label={''}
                                    name={index.toString()}
                                />

                            ) : (
                                <span className="text-gray-900 text-base font-normal">
                                    {formatValue(item)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DetailList;