import { ChangeEvent, FocusEvent, useEffect, useRef, useState } from 'react';

type InputType = 'text' | 'password' | 'email' | 'number' | 'url' | 'tel' | 'search' | 'date';

interface InputProps {
    label: string;
    name: string;
    type?: InputType;
    value?: string;
    placeholder?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    loading?: boolean;
    tooltip?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    validate?: (value: string) => string | boolean;
    onChange?: (value: string) => void;
    onBlur?: (value: string) => void;
    className?: string;
}

export default function Input({
    label,
    name,
    type = 'text',
    value = '',
    placeholder,
    leadingIcon,
    trailingIcon,
    loading = false,
    tooltip,
    disabled = false,
    min,
    max,
    validate,
    onChange,
    onBlur,
    className = ''
}: InputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(value);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange && onChange(newValue);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (validate) {
            const validationError = validate(inputValue);
            setError(typeof validationError === 'string' ? validationError : null);
        }
        onBlur && onBlur(inputValue);
    };

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
                {loading && (
                    <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                )}
                {tooltip && (
                    <div className="relative group">
                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16">
                            <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 8v4M8 4h.01"></path>
                        </svg>
                        <div className="absolute hidden w-48 p-2 text-xs text-white bg-gray-700 rounded-md group-hover:block">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>

            <div className={`relative mt-2 ${disabled ? 'opacity-60' : ''}`}>
                {leadingIcon && <span className="absolute left-2 top-2.5">{leadingIcon}</span>}
                <input
                    ref={inputRef}
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    value={inputValue}
                    disabled={disabled}
                    className={`w-full pl-${leadingIcon ? '8' : '3'} pr-${trailingIcon ? '8' : '3'} py-2 border rounded-md focus:outline-none ${className}`}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                />
                {trailingIcon && <span className="absolute right-2 top-2.5">{trailingIcon}</span>}
            </div>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
