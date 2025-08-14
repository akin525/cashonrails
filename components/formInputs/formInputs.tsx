"use client";
import React, { useState, useEffect, useRef } from "react";
import CountryFlag from "@/components/countryFlag";
import styles from './formInputs.module.css';
import { FormInputsProps, FormPasswordProps, FormSelectProps, FormInputsWithTextButtonProps, FormMultipleInputsProps, FormInputAndSelectProps, FormCheckboxProps } from "@/types/formInterfaces";
import clsx from "clsx";
import { cn } from "@/helpers/extras";
import { useTheme } from "next-themes";


type HandleValidationAndSetPayloadProps = {
    event: any; // Both Native and Custom Event
    validationFunc?: (inputValue: string) => string | boolean;
    setPayloadValues?: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    setErrorText?: React.Dispatch<React.SetStateAction<{ error: string | boolean, initiated: boolean }>>;
}

const handleValidationAndSetPayload = ({ event, validationFunc, setPayloadValues, setErrorText }: HandleValidationAndSetPayloadProps) => {
    // Call validation function
    if (validationFunc && setErrorText) {
        let specialEvent = false // Show error on blur or backspace, if input is empty
        if (event.type === 'blur') { specialEvent = true }
        if (event.type === 'keyup' && event.key === 'Backspace' && event.target.value === '') { specialEvent = true }
        // if (event.type === 'input' && event.target.value !== '') { specialEvent = true }

        setErrorText(prevState => ({
            ...prevState,
            error: validationFunc(event.target.value),
            initiated: !prevState.initiated ? specialEvent : true
        }))
    }

    // Add to Payload Values with input name as key
    if (setPayloadValues) {
        let inputValue = event.target.value
        if (validationFunc) { // validate value if validation function is provided
            if (typeof validationFunc(inputValue) === 'string') { inputValue = null }
        }

        setPayloadValues(prevState => ({
            ...prevState,
            [event.target.name]: inputValue
        }))
    }
}


export default function FormInputs({
    label,
    name,
    type,
    defaultValue,
    clearValue,
    leadingItem,
    trailingItem,
    getValue,
    placeholder,
    min,
    max,
    loading,
    autoComplete,
    tooltip,
    disabled,
    validationFunc,
    payloadValues,
    setPayloadValues,
    onBlurEventCallback,
    onChange,
    className,
}: FormInputsProps) {
    const inputTextSelector = useRef<HTMLInputElement>(null);

    const [errorText, setErrorText] = useState<{ error: string | boolean, initiated: boolean }>({
        error: false,
        initiated: false
    });

    const handleOnInputEvent = (event: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;

        handleValidationAndSetPayload({ event, validationFunc, setPayloadValues, setErrorText });
        getValue && getValue(target.value);

        if (event.type === 'blur' && onBlurEventCallback) {
            onBlurEventCallback(target.value);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleOnInputEvent(event);
        onChange && onChange(event);
    };

    useEffect(() => {
        defaultValue && setPayloadValues && setPayloadValues((prevState: Record<string, any>) => ({
            ...prevState,
            [name]: defaultValue
        }));

        if (defaultValue) {
            getValue && getValue(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        if (payloadValues && payloadValues[name] === undefined) {
            if (inputTextSelector.current) {
                inputTextSelector.current.value = '';
            }
        }
    }, [payloadValues]);

    return (
        <div className="flex-1">
            <div className="flex items-center gap-x-2">
                <label className="text-sm text-[#344054] font-medium">{label}</label>
                {loading && (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.2" fillRule="evenodd" clipRule="evenodd" d="M26.9999 48.3345C38.782 48.3345 48.3333 38.7832 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345ZM26.9999 53.6678C41.7275 53.6678 53.6666 41.7287 53.6666 27.0011C53.6666 12.2735 41.7275 0.334473 26.9999 0.334473C12.2723 0.334473 0.333252 12.2735 0.333252 27.0011C0.333252 41.7287 12.2723 53.6678 26.9999 53.6678Z" fill="#A9A7C1" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345C28.4727 48.3345 29.6666 49.5284 29.6666 51.0011C29.6666 52.4739 28.4727 53.6678 26.9999 53.6678C12.2723 53.6678 0.333252 41.7287 0.333252 27.0011C0.333252 12.2735 12.2723 0.334473 26.9999 0.334473C41.7275 0.334473 53.6666 12.2735 53.6666 27.0011C53.6666 28.4739 52.4727 29.6678 50.9999 29.6678C49.5272 29.6678 48.3333 28.4739 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781Z" fill="url(#paint0_linear_1939_13920)" />
                        <defs>
                            <linearGradient id="paint0_linear_1939_13920" x1="26.9999" y1="27.0011" x2="26.9999" y2="48.3345" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#231663" />
                                <stop offset="1" stopColor="#231663" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                )}

                {tooltip && (
                    <div className="tooltip-container relative inline-block">
                        <div className="tooltip-trigger cursor-pointer">
                            <svg width="18" height="18" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.66667 11.1667H8V8.5H7.33333M8 5.83333H8.00667M14 8.5C14 11.8137 11.3137 14.5 8 14.5C4.68629 14.5 2 11.8137 2 8.5C2 5.18629 4.68629 2.5 8 2.5C11.3137 2.5 14 5.18629 14 8.5Z" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className={`tooltip-content absolute top-[-60px] md:top-[-27.5px] left-[-80px] md:left-[25px] ${tooltip.length > 75 ? 'w-[300px] md:w-[300px]' : 'w-[240px] md:w-[190px]'} bg-[#272363] rounded-md p-3 text-xs font-light text-white`}>
                                {tooltip}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`relative flex items-center border 
                px-2
                ${disabled ? 'border-[#eaeaf3]' : 'border-[#D0D5DD] hover:border-[#bcc1ca]'} 
                ${disabled ? 'text-[#A9A7C1]' : 'focus-within:border-[#01AB79] focus-within:shadow-lg focus-within:shadow-[#05e47818]'} 
                duration-300 rounded-md`}>

                {leadingItem && (
                    <div className="flex py-2.5 items-center pr-2 h-full">
                        {leadingItem}
                    </div>
                )}

                <input
                    ref={inputTextSelector}
                    type={type || 'text'}
                    placeholder={placeholder}
                    name={name}
                    disabled={disabled}
                    min={min}
                    max={max}
                    defaultValue={defaultValue || ''}
                    className={`
                        ${className}
                        flex-1 outline-0 py-2.5 text-[0.875em] 
                        ${trailingItem ? 'pr-10' : 'pr-3'}
                        rounded-md
                        bg-transparent
                    `}
                    onChange={handleChange}
                    onKeyUp={handleOnInputEvent}
                    onInput={handleOnInputEvent}
                    onBlur={handleOnInputEvent}
                />

                {trailingItem && (
                    <div className="flex items-center pl-2">
                        {trailingItem}
                    </div>
                )}
            </div>

            {errorText.initiated && errorText.error && typeof errorText.error === 'string' && (
                <p className="text-[#FF4D4F] text-xs mt-1">{errorText.error}</p>
            )}
        </div>
    );
}


export function FormPassword({ label, type, name, placeholder, tooltip, defaultValue, validationFunc, setPayloadValues, onBlurEventCallback }: FormPasswordProps) {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errorText, setErrorText] = useState<{ error: string | boolean, initiated: boolean }>({
        error: false, initiated: false
    }) // [errorText, errorState]

    const handleOnInputEvent = (event: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        handleValidationAndSetPayload({ event, validationFunc, setPayloadValues, setErrorText })

        if (event.type === 'blur' && onBlurEventCallback) {
            onBlurEventCallback(target.value);
        }
    }

    useEffect(() => {
        defaultValue && setPayloadValues && setPayloadValues((prevState: Record<string, any>) => ({
            ...prevState,
            [name]: defaultValue
        }))
    }, [defaultValue])

    return (
        <div>
            <div className="flex items-center gap-x-2">
                <label className='text-sm text-[#344054] font-medium'>{label}</label>
                {
                    tooltip && (
                        <div className="tooltip-container relative inline-block">
                            <div className="tooltip-trigger cursor-pointer">
                                <svg width="18" height="18" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.66667 11.1667H8V8.5H7.33333M8 5.83333H8.00667M14 8.5C14 11.8137 11.3137 14.5 8 14.5C4.68629 14.5 2 11.8137 2 8.5C2 5.18629 4.68629 2.5 8 2.5C11.3137 2.5 14 5.18629 14 8.5Z" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                <div className={`tooltip-content absolute top-[-60px] md:top-[-27.5px] left-[-80px] md:left-[25px] ${tooltip.length > 75 ? 'w-[300px] md:w-[300px]' : 'w-[240px] md:w-[190px]'} bg-[#272363] rounded-md p-3 text-xs font-light text-white`}>{tooltip}</div>
                            </div>
                        </div>
                    )
                }
            </div>

            <div className="relative">
                <div onClick={() => setShowPassword((val) => !val)} className="cursor-pointer absolute right-2 top-3 z-20 p-1">
                    {
                        showPassword ?
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.9998 12C14.9998 13.6569 13.6566 15 11.9998 15C10.3429 15 8.99976 13.6569 8.99976 12C8.99976 10.3431 10.3429 9 11.9998 9C13.6566 9 14.9998 10.3431 14.9998 12Z" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" /><path d="M2.45801 12C3.73228 7.94288 7.52257 5 12.0002 5C16.4778 5 20.2681 7.94291 21.5424 12C20.2681 16.0571 16.4778 19 12.0002 19C7.52256 19 3.73226 16.0571 2.45801 12Z" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            :
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.00024 3L6.5894 6.58916M21.0002 21L17.4114 17.4112M13.8751 18.8246C13.268 18.9398 12.6414 19 12.0007 19C7.52305 19 3.73275 16.0571 2.4585 12C2.80539 10.8955 3.33875 9.87361 4.02168 8.97118M9.87892 9.87868C10.4218 9.33579 11.1718 9 12.0002 9C13.6571 9 15.0002 10.3431 15.0002 12C15.0002 12.8284 14.6645 13.5784 14.1216 14.1213M9.87892 9.87868L14.1216 14.1213M9.87892 9.87868L6.5894 6.58916M14.1216 14.1213L6.5894 6.58916M14.1216 14.1213L17.4114 17.4112M6.5894 6.58916C8.14922 5.58354 10.0068 5 12.0007 5C16.4783 5 20.2686 7.94291 21.5429 12C20.836 14.2507 19.3548 16.1585 17.4114 17.4112" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    }
                </div>
                <input type={!showPassword ? 'password' : type} placeholder={placeholder || label}
                    name={name}
                    defaultValue={defaultValue || ''}
                    onKeyUp={handleOnInputEvent} onInput={handleOnInputEvent} onBlur={handleOnInputEvent}
                    className='w-full outline-0 bg-[#F8FAFC] border border-[#D0D5DD] hover:border-[#bcc1ca] focus:border-[#01AB79] focus:shadow-lg focus:shadow-[#05e47818] rounded-md px-2.5 pr-10 py-2.5 text-[0.875em] mt-2'
                />
                {errorText.initiated && errorText.error && typeof errorText.error === 'string' && <p className='text-[#FF4D4F] text-xs mt-1'>{errorText.error}</p>}
            </div>
        </div>
    )
}


export function FormInputsWithTextButton({
    label, name, type, defaultValue, getValue, placeholder, min, max, loading, autoComplete,
    tooltip, disabled, validationFunc, setPayloadValues, onBlurEventCallback, textButtonProps
}: FormInputsWithTextButtonProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [errorText, setErrorText] = useState<{ error: string | boolean, initiated: boolean }>({
        error: false, initiated: false
    }) // [errorText, errorState]

    const handleOnInputEvent = (event: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;

        handleValidationAndSetPayload({ event, validationFunc, setPayloadValues, setErrorText })
        getValue && getValue(target.value)

        if (event.type === 'blur' && onBlurEventCallback) {
            onBlurEventCallback(target.value);
        }
    }

    useEffect(() => {
        defaultValue && setPayloadValues && setPayloadValues((prevState: Record<string, any>) => ({
            ...prevState,
            [name]: defaultValue
        }))

        if (defaultValue) {
            getValue && getValue(defaultValue)
        }
    }, [defaultValue])

    return (
        <div>
            <div className="flex items-center gap-x-2">
                <label className='text-sm text-[#344054] font-medium'>{label}</label>
                {loading && (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.2" fillRule="evenodd" clipRule="evenodd" d="M26.9999 48.3345C38.782 48.3345 48.3333 38.7832 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345ZM26.9999 53.6678C41.7275 53.6678 53.6666 41.7287 53.6666 27.0011C53.6666 12.2735 41.7275 0.334473 26.9999 0.334473C12.2723 0.334473 0.333252 12.2735 0.333252 27.0011C0.333252 41.7287 12.2723 53.6678 26.9999 53.6678Z" fill="#A9A7C1" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345C28.4727 48.3345 29.6666 49.5284 29.6666 51.0011C29.6666 52.4739 28.4727 53.6678 26.9999 53.6678C12.2723 53.6678 0.333252 41.7287 0.333252 27.0011C0.333252 12.2735 12.2723 0.334473 26.9999 0.334473C41.7275 0.334473 53.6666 12.2735 53.6666 27.0011C53.6666 28.4739 52.4727 29.6678 50.9999 29.6678C49.5272 29.6678 48.3333 28.4739 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781Z" fill="url(#paint0_linear_1939_13920)" />
                        <defs>
                            <linearGradient id="paint0_linear_1939_13920" x1="26.9999" y1="27.0011" x2="26.9999" y2="48.3345" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#231663" />
                                <stop offset="1" stopColor="#231663" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>
                )}

                {
                    tooltip && (
                        <div className="tooltip-container relative inline-block">
                            <div className="tooltip-trigger cursor-pointer">
                                <svg width="18" height="18" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.66667 11.1667H8V8.5H7.33333M8 5.83333H8.00667M14 8.5C14 11.8137 11.3137 14.5 8 14.5C4.68629 14.5 2 11.8137 2 8.5C2 5.18629 4.68629 2.5 8 2.5C11.3137 2.5 14 5.18629 14 8.5Z" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className={`tooltip-content absolute top-[-60px] md:top-[-27.5px] left-[-80px] md:left-[25px] ${tooltip.length > 75 ? 'w-[300px] md:w-[300px]' : 'w-[240px] md:w-[190px]'} bg-[#272363] rounded-md p-3 text-xs font-light text-white`}>
                                    {tooltip}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>

            <div className="flex border border-[#D0D5DD] hover:border-[#bcc1ca] focus:border-[#01AB79] rounded-md px-2 py-2.5 mt-2">
                <input
                    type={type || 'text'} placeholder={placeholder}
                    ref={inputRef}
                    name={name} disabled={disabled ? true : false}
                    min={min} max={max}
                    defaultValue={defaultValue || ''}
                    className={`w-[65%] md:w-[70%] outline-0 bg-transparent focus:bg-transparent rounded-sm text-[0.875em]`}
                    onKeyUp={handleOnInputEvent}
                    onInput={handleOnInputEvent} onBlur={handleOnInputEvent}
                />

                <div className="w-[35%] md:w-[30%] flex items-center justify-end text-right text-[#01C246] text-sm">
                    {
                        inputRef.current && !inputRef.current.value ? (
                            <p className={`opacity-20 cursor-pointer whitespace-nowrap`}>VERIFY</p>
                        ) : textButtonProps.isActive ? (
                            <p className={`opacity-100 uppercase tracking-wide whitespace-nowrap`}>Verified</p>
                        ) : textButtonProps.loading ? (
                            <p className={`cursor-pointer whitespace-nowrap`}>{textButtonProps.loading}</p>
                        ) : (
                            <p onClick={textButtonProps.onClick} className={`${textButtonProps.isInputValid ? ' opacity-100 ' : ' opacity-20 '} cursor-pointer whitespace-nowrap`}>{textButtonProps.text}</p>
                        )
                    }
                </div>
            </div>
            {errorText.initiated && errorText.error && typeof errorText.error === 'string' && <p className='text-[#FF4D4F] text-xs mt-1'>{errorText.error}</p>}
        </div>
    )
}



export function FormSelect({ label, name, placeholder, loading, options, tooltip, disabled, defaultValue, getValue, validationFunc, payloadValues, setPayloadValues, onBlurEventCallback, className, getValueOnChange }: FormSelectProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const { theme } = useTheme()
    const [errorText, setErrorText] = useState<{ error: string | boolean, initiated: boolean }>({
        error: false, initiated: false
    });

    // Handle Dropdown Open with animation
    const handleDropdownOpen = () => {
        setIsAnimating(true);
        setIsDropdownOpen((val) => !val);
        setTimeout(() => setIsAnimating(false), 300); // Match this with transition duration
    }


    // Handle Select Option
    const handleOnChange = (event: React.MouseEvent<HTMLElement>, label: string, value: string) => {
        event.stopPropagation()

        if (labelRef.current) {
            labelRef.current.dataset.label = label; // Set data label labelRef
            labelRef.current.dataset.value = value; // Set data value labelRef
        }

        const customEvent = {
            type: 'blur', target: { value: value, name: name }
        }
        handleValidationAndSetPayload({ event: customEvent, validationFunc, setPayloadValues, setErrorText })
        getValue && getValue(value)

        setIsDropdownOpen(false)


        if (onBlurEventCallback) {
            onBlurEventCallback(value);
        }
        if (getValueOnChange) {
            getValueOnChange({ name, value });
        }
    }

    // Close the dropdown when clicking outside
    useEffect(() => {
        if (options.length > 0 && labelRef.current && !labelRef.current.dataset.label && !labelRef.current.dataset.value) { // Set Default value
            if (defaultValue) {
                const index = options.findIndex((item: { label: string, value: string | number }) => item.value === defaultValue) // get the index of the default value

                labelRef.current.dataset.label = options[index]?.label || ''; // Set data label labelRef
                labelRef.current.dataset.value = String(options[index]?.value || ''); // Set data value labelRef
            }
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (isDropdownOpen && labelRef.current && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                const customEvent = {
                    type: 'blur', target: { value: labelRef.current.dataset.value, name: name }
                }

                handleValidationAndSetPayload({ event: customEvent, validationFunc, setPayloadValues, setErrorText })
                getValue && getValue(labelRef.current.dataset.value || '')

                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isDropdownOpen, options]);


    useEffect(() => {
        if (defaultValue) {
            setPayloadValues && setPayloadValues((prevState: Record<string, any>) => ({
                ...prevState,
                [name]: defaultValue
            }))

            getValue && getValue(defaultValue)
        }
    }, [defaultValue])


    // Handle search dropdown options
    const [dropdownOptions, setDropdownOptions] = useState<any[]>([])


    const handleSearchDropdown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement
        const searchValue = target.value

        if (searchValue === '') {
            setDropdownOptions(options.reverse())
            return options.reverse()
        }

        const searchResults = options?.filter((option: { label: string, value: string | number }) => {
            return option?.label?.toLowerCase().includes(searchValue.toLowerCase())
        })

        if (searchResults.length === 0) {
            setDropdownOptions([])
        } else {
            setDropdownOptions(searchResults)
        }
    }

    useEffect(() => {
        // Add index to options
        const newOptions = options.map((option: { label: string, value: string | number }, index: number) => {
            return { ...option, index: index }
        })

        setDropdownOptions(newOptions)
    }, [options])


    // Clear Input Text Value if payloadValues is updated and its empty
    useEffect(() => {
        if (payloadValues) {
            if (payloadValues[name] === undefined && labelRef.current) {
                labelRef.current.dataset.label = '';
                labelRef.current.dataset.value = '';
                return;
            }

            if (Array.isArray(payloadValues[name]) && payloadValues[name].length === 2) {
                if (payloadValues[name][0] === 'set') {
                    const index = options.findIndex((item: { label: string, value: string | number }) => item.value === payloadValues[name][1])
                    if ((index !== -1) && labelRef.current) {
                        labelRef.current.dataset.label = options[index]?.label // Set data label labelRef
                        labelRef.current.dataset.value = String(options[index]?.value) // Set data value labelRef

                        getValue && getValue(options[index]?.value);
                    }
                    return;
                }

                if (payloadValues[name][0] === 'clear' && labelRef.current) {
                    labelRef.current.dataset.label = '';
                    labelRef.current.dataset.value = '';
                    return;
                }

                return;
            }
        }
    }, [payloadValues])

    return (
        <div className="relative">
            <div className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-2">
                    {label && (
                        <label
                            className={`${label && 'mb-2 '} text-sm text-[#344054] font-medium transform transition-all duration-200 ${isDropdownOpen ? 'text-[#01AB79]' : ''}`}
                        >
                            {label}
                        </label>
                    )}
                    {loading && (
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path opacity="0.2" fillRule="evenodd" clipRule="evenodd" d="M26.9999 48.3345C38.782 48.3345 48.3333 38.7832 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345ZM26.9999 53.6678C41.7275 53.6678 53.6666 41.7287 53.6666 27.0011C53.6666 12.2735 41.7275 0.334473 26.9999 0.334473C12.2723 0.334473 0.333252 12.2735 0.333252 27.0011C0.333252 41.7287 12.2723 53.6678 26.9999 53.6678Z" fill="#A9A7C1" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345C28.4727 48.3345 29.6666 49.5284 29.6666 51.0011C29.6666 52.4739 28.4727 53.6678 26.9999 53.6678C12.2723 53.6678 0.333252 41.7287 0.333252 27.0011C0.333252 12.2735 12.2723 0.334473 26.9999 0.334473C41.7275 0.334473 53.6666 12.2735 53.6666 27.0011C53.6666 28.4739 52.4727 29.6678 50.9999 29.6678C49.5272 29.6678 48.3333 28.4739 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781Z" fill="url(#paint0_linear_1939_13920)" />
                            <defs>
                                <linearGradient id="paint0_linear_1939_13920" x1="26.9999" y1="27.0011" x2="26.9999" y2="48.3345" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#231663" />
                                    <stop offset="1" stopColor="#231663" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    )}

                    {
                        tooltip && (
                            <div className="tooltip-container relative inline-block">
                                <div className="tooltip-trigger cursor-pointer">
                                    <svg width="18" height="18" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.66667 11.1667H8V8.5H7.33333M8 5.83333H8.00667M14 8.5C14 11.8137 11.3137 14.5 8 14.5C4.68629 14.5 2 11.8137 2 8.5C2 5.18629 4.68629 2.5 8 2.5C11.3137 2.5 14 5.18629 14 8.5Z" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className={`tooltip-content absolute top-[-60px] md:top-[-27.5px] left-[-80px] md:left-[25px] 
                                    ${tooltip.length > 75 ? 'w-[300px] md:w-[300px]' : 'w-[240px] md:w-[190px]'} 
                                    bg-[#272363] rounded-md p-3 text-xs font-light text-white
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                                        {tooltip}
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>

            <div
                ref={dropdownRef}
                className={`${cn(className)} relative w-full outline-0 bg-transparent 
                    border ${disabled ? 'border-[#eaeaf3] text-[#A9A7C1] cursor-not-allowed' :
                        'border-[#D0D5DD] hover:border-[#bcc1ca] cursor-pointer'} 
                    focus:border-[#01AB79] rounded-md px-2 text-sm
                    transition-all duration-300 ease-in-out
                    ${isDropdownOpen ? 'shadow-lg shadow-[#05e47818] border-[#01AB79]' : ''}`}
            >
                <div
                    onClick={disabled ? () => { } : handleDropdownOpen}
                    className="flex justify-between items-center gap-x-2 py-3 transition-all duration-300 ease-in-out"
                >
                    <div className="flex items-center gap-x-2">
                        <CountryFlag currencyCode={labelRef?.current?.dataset.value} />
                        <p className={`${!labelRef?.current?.dataset.label && 'text-[#6d6d6d] text-sm'} 
                            transition-colors duration-200`}
                            ref={labelRef}
                            data-label=""
                            data-value="">
                            {(labelRef?.current?.dataset?.label || '') || (placeholder ? (placeholder?.label || '') : (label || ''))}
                        </p>
                    </div>

                    <div className={`transform transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}>
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.6667 10L8.00004 5.33333L3.33337 10" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                <div
                    tabIndex={990}
                    className={`absolute top-12 left-0 w-full min-w-[130px] 
                        transform transition-all duration-300 ease-in-out
                        ${isDropdownOpen ? 'opacity-100 translate-y-0 z-[9999]' : 'opacity-0 -translate-y-2 pointer-events-none'}
                        shadow-md`}
                >
                    {options.length > 10 && (
                        <div className="w-full flex items-center gap-x-2 whitespace-nowrap border-y border-[#f1f5f9] 
                            hover:bg-[#f8fafc] px-3 py-2.5 transition-colors duration-200">
                            <div className="w-[4%]">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="9.90015" cy="9.90015" r="9" stroke="#52536D" strokeWidth="1.5" />
                                    <path d="M16.5 16.5L22.864 22.864" stroke="#52536D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <input
                                onKeyUp={handleSearchDropdown}
                                type="text"
                                placeholder="Search"
                                className="outline-0 bg-transparent w-[96%] transition-all duration-200 focus:placeholder-opacity-75"
                            />
                        </div>
                    )
                    }

                    <ul className={`w-full flex flex-col max-h-[275px] overflow-y-scroll border border-[#eaeaf3]
                        ${theme === "light" ? 'bg-white' : 'bg-gray-800'} rounded-md list-none`}>
                        {dropdownOptions.map((option, index) => (
                            <li
                                key={index}
                                onClick={(event) => handleOnChange(event, option.label, option.value)}
                                tabIndex={option.index}
                                className={`flex items-center gap-x-2 whitespace-nowrap border-y border-[#f1f5f9] 
                                 ${theme === "light" ? 'hover:bg-[#f8fafc]': 'hover:bg-gray-800/60'} px-3 py-2.5 transition-all duration-200 
                                    hover:translate-x-1`}
                            >
                                <CountryFlag currencyCode={option.value} />
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>



            {errorText.initiated && errorText.error && typeof errorText.error === 'string' && <p className='text-[#FF4D4F] text-xs mt-1'>{errorText.error}</p>}
        </div>
    )
}



export function FormInputsTextArea({ label, name, type, defaultValue, getValue, placeholder, tooltip, validationFunc, setPayloadValues, onBlurEventCallback }: FormInputsProps) {

    const [errorText, setErrorText] = useState<{ error: string | boolean, initiated: boolean }>({
        error: false, initiated: false
    }) // [errorText, errorState]

    const handleOnInputEvent = (event: React.ChangeEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement> | React.FocusEvent<HTMLTextAreaElement>) => {
        const target = event.target as HTMLTextAreaElement;

        handleValidationAndSetPayload({ event, validationFunc, setPayloadValues, setErrorText })
        getValue && getValue(target.value)

        if (event.type === 'blur' && onBlurEventCallback) {
            onBlurEventCallback(target.value);
        }
    }

    useEffect(() => {
        defaultValue && setPayloadValues && setPayloadValues((prevState: Record<string, any>) => ({
            ...prevState,
            [name]: defaultValue
        }))

        if (defaultValue) {
            getValue && getValue(defaultValue)
        }
    }, [defaultValue])

    return (
        <div>
            <div className="flex items-center gap-x-2">
                <label className='text-sm text-[#344054] font-medium'>{label}</label>
                {
                    tooltip && (
                        <div className="tooltip-container relative inline-block">
                            <div className="tooltip-trigger cursor-pointer">
                                <svg width="18" height="18" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.66667 11.1667H8V8.5H7.33333M8 5.83333H8.00667M14 8.5C14 11.8137 11.3137 14.5 8 14.5C4.68629 14.5 2 11.8137 2 8.5C2 5.18629 4.68629 2.5 8 2.5C11.3137 2.5 14 5.18629 14 8.5Z" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className={`tooltip-content absolute top-[-60px] md:top-[-27.5px] left-[-80px] md:left-[25px] ${tooltip.length > 75 ? 'w-[300px] md:w-[300px]' : 'w-[240px] md:w-[190px]'} bg-[#272363] rounded-md p-3 text-xs font-light text-white`}>
                                    {tooltip}
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
            <textarea placeholder={placeholder || label} rows={2}
                defaultValue={defaultValue || ''}
                name={name}
                className='w-full outline-0 border border-[#D0D5DD] hover:border-[#bcc1ca] focus:border-[#01AB79] focus:shadow-lg focus:shadow-[#05e47818] duration-300 rounded-md px-2.5 py-2.5 mt-2 min-h-40'
                onKeyUp={handleOnInputEvent} onInput={handleOnInputEvent} onBlur={handleOnInputEvent}
            />
            {errorText.initiated && errorText.error && typeof errorText.error === 'string' && <p className='text-[#FF4D4F] text-xs mt-1'>{errorText.error}</p>}
        </div>
    )
}



export function FormMultipleInputs({ length, type, getValueCallback, onCompleteValuesCallback }: FormMultipleInputsProps) {
    const multipleInputStyle = ` inline-block w-[47px] h-[50px] md:w-[55px] md:h-[57px] text-center text-lg font-semibold outline-0 duration-300 bg-transparent border border-[#0E2921] focus:border-[#01AB79] bg-[#FFFFFF] focus:shadow-md focus:shadow-green-200 rounded-lg `

    // Create an array of length
    const inputArray = Array.from({ length: length }, (_, i) => i);

    // Handle Get All Values
    const getAllValues = (event: React.KeyboardEvent<HTMLInputElement> | React.ClipboardEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;

        // Get direct parent of event.target
        const parent = target.parentElement;

        if (!parent) return;

        // Get children of parent
        const children = Array.from(parent.children);

        // Get value of all children
        const childrenValue = children.map((item) => (item as HTMLInputElement).value).join('');

        getValueCallback && getValueCallback(childrenValue);

        if (childrenValue.length === length && onCompleteValuesCallback) {
            onCompleteValuesCallback(childrenValue);
        }
    }

    // Handle Inputs
    const handleInputs = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        const target = event.target as HTMLInputElement;

        // Get value, next input and previous input of event.target
        const { value, nextElementSibling, previousElementSibling } = target;

        if (value.length > 0) {
            if (index < length - 1) {
                nextElementSibling && (nextElementSibling as HTMLInputElement).focus();
            }
        }

        if (value.length === 0) {
            if (index > 0) {
                previousElementSibling && (previousElementSibling as HTMLInputElement).focus();
            }
        }

        getAllValues(event);
    }

    // Handle Paste
    const handleOnPaste = (event: React.ClipboardEvent<HTMLInputElement>, length: number) => { // Added 'length' parameter
        const target = event.target as HTMLInputElement;

        event.preventDefault();

        // Get pasted data
        const pastedData = event.clipboardData.getData('text');

        const pastedDataArray = pastedData.split('');

        // Get direct parent of event.target
        const parent = target.parentElement;

        if (!parent) return;

        // Get children of parent
        const children = Array.from(parent.children);

        children.forEach((child, i: number) => {
            if (!pastedDataArray[i]) return;
            (child as HTMLInputElement).value = pastedDataArray[i];
            (child as HTMLInputElement).focus();
        });

        getAllValues(event);
    }


    return (
        <div className="flex justify-between gap-x-0.5 md:gap-x-1">
            {
                inputArray.map((_, index) => (
                    <input key={index} type={type || 'password'}
                        className={multipleInputStyle}
                        maxLength={1}
                        onKeyUp={(event) => handleInputs(event, index)}
                        onPaste={(event) => handleOnPaste(event, index)}
                    />
                ))
            }
        </div>
    )
}



/**
 * FormCheckbox component
 * @param {string} label - The label for the checkbox
 * @param {string} name - The name of the checkbox
 * @param {boolean} initialValue - The initial value of the checkbox, default is false
 * @param {boolean} triggerCheckbox - The trigger value for the checkbox
 * @param {Function} getValue - The function to get the value of the checkbox
 * @param {Function} getValueOnChange - The function to get the value of the checkbox on change
 * @param {Function} setPayloadValues - The function to set the payload values
 * @param {Function} onBlurEventCallback - The function to handle the blur event
 */
export function FormCheckbox({ label, name, initialValue = false, triggerCheckbox, getValue, getValueOnChange, setPayloadValues, onBlurEventCallback }: FormCheckboxProps) {
    const [isChecked, setIsChecked] = useState<boolean>(initialValue);

    const handleCheckboxChange = (event: any) => {
        const newCheckedValue = event.target.checked;
        setIsChecked(newCheckedValue);

        getValue && getValue({ name: event.target.name, value: newCheckedValue });
        getValueOnChange && getValueOnChange({ name: event.target.name, value: newCheckedValue });

        setPayloadValues && setPayloadValues((prevState: Record<string, any>) => ({
            ...prevState,
            [event.target.name]: newCheckedValue
        }))

        if (onBlurEventCallback) {
            onBlurEventCallback(newCheckedValue)
        }

        // onChange && onChange(newCheckedValue); // Added to notify outside the component of the change
    };

    useEffect(() => {
        getValue && getValue({ name: name, value: initialValue });

        initialValue && setPayloadValues && setPayloadValues((prevState: Record<string, any>) => ({
            ...prevState,
            [name]: initialValue
        }))
    }, [initialValue])


    useEffect(() => {
        if (triggerCheckbox === undefined) return;
        setIsChecked(triggerCheckbox || false);
    }, [triggerCheckbox]);


    return (
        <>
            <div className="flex gap-x-2 cursor-pointer">
                <input type="checkbox" id={label} name={name}
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                />
                <label htmlFor={label} className="cursor-pointer text-sm">{label}</label>
            </div>
        </>
    )
}


export function FormInputAndSelect({ label, inputProps, selectProps }: FormInputAndSelectProps) {
    const [errorText, setErrorText] = useState<{ error: string | boolean, initiated: boolean }>({
        error: false, initiated: false
    }) // [errorText, errorState]

    const handleOnInputEvent = (event: any) => {
        handleValidationAndSetPayload({ event, validationFunc: inputProps.validationFunc, setPayloadValues: inputProps.setPayloadValues, setErrorText })
        inputProps.getValue && inputProps.getValue(event.target.value)

        if (event.type === 'blur' && inputProps.onBlurEventCallback) {
            inputProps.onBlurEventCallback(event.target.value);
        }
    }


    const [selectErrorText, setSelectErrorText] = useState<{ error: string | boolean, initiated: boolean }>({
        error: false, initiated: false
    }) // [errorText, errorState]


    /** Select Dropdown **/
    const dropdownContainerRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLParagraphElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    // Handle Dropdown Open
    const handleDropdownOpen = () => { setIsDropdownOpen((val) => !val) }

    // Handle Select Option
    const handleOnChange = (event: any, index: number) => {
        event.stopPropagation();

        if (index === -1 || !selectProps.options[index]) return; // Prevent invalid index
        if (!selectedRef.current || !selectedRef.current.dataset) return;

        selectedRef.current.dataset.label = selectProps.options[index]?.label || '' // Set data label labelRef
        selectedRef.current.dataset.value = String(selectProps.options[index]?.value || '') // Set data value labelRef

        const customEvent = {
            type: 'blur', target: { value: selectProps.options[index]?.value, name: selectProps.name }
        }

        handleValidationAndSetPayload({ event: customEvent, validationFunc: selectProps.validationFunc, setPayloadValues: selectProps.setPayloadValues, setErrorText: setSelectErrorText })
        setIsDropdownOpen(false);

        selectProps.getValue && selectProps.getValue(selectProps.options[index]?.value);
    }

    // Close the dropdown when clicking outside
    useEffect(() => {
        if (selectProps.options.length > 0) { // Set Default value
            if (selectProps.defaultValue) {
                handleOnChange(
                    { stopPropagation: () => { }, target: { value: selectProps.defaultValue } },
                    selectProps.options.findIndex((item: any) => item.value === selectProps.defaultValue)
                )
            } else if (!selectProps.placeholder) {
                handleOnChange(
                    { stopPropagation: () => { }, target: { value: selectProps.options[0]?.value } }, 0
                )
            }
        }
    }, [selectProps.defaultValue]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isDropdownOpen && dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node)) {
                if (selectedRef.current && selectedRef.current.dataset) {
                    handleOnChange(
                        { stopPropagation: () => { }, target: { value: selectedRef.current.dataset.value } },
                        selectProps.options.findIndex((item: any) => item.value === selectedRef.current?.dataset.value || '')
                    )
                }
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, [isDropdownOpen]);


    // Set Default Value
    useEffect(() => {
        if (selectProps.defaultValue) {
            handleOnChange(
                { stopPropagation: () => { }, target: { value: selectProps.defaultValue } },
                selectProps.options.findIndex((item: any) => item.value === selectProps.defaultValue)
            )
        }
    }, [selectProps.defaultValue]);


    return (
        <div>
            <label className='text-sm text-[#344054] font-medium'>{label}</label>

            <div className={`flex items-center border border-[#E0E0E9] hover:border-[#01AB79] rounded-lg mt-2 text-sm`}>
                <div className="">
                    <div ref={dropdownContainerRef} className={`relative w-full outline-0 bg-[#F1F5F9] cursor-pointer focus:border-[#9696c5] rounded-l-lg px-3 text-sm`}>
                        <div onClick={selectProps.disabled ? () => { } : handleDropdownOpen} className={`flex justify-around items-center gap-x-0.5 py-3`}>
                            <div className="flex items-center gap-x-2">
                                {selectProps.prependFlag ? <CountryFlag currencyCode={selectedRef?.current?.dataset.value} /> : <></>}
                                <p ref={selectedRef} className="font-medium text-[#344054] whitespace-nowrap" data-label="" data-value="">{selectedRef.current?.dataset?.label || selectProps.placeholder || ''}</p>
                            </div>

                            <div className={`transition ${isDropdownOpen ? 'rotate-0 ' : 'rotate-180 '}`}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.6667 10L8.00004 5.33333L3.33337 10" stroke="#686592" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        <div tabIndex={990} className={`${isDropdownOpen ? 'block ' : 'hidden '} absolute top-12 left-0 z-[1000] shadow-md`}>
                            <ul className="w-[120px] flex flex-col max-h-[250px] overflow-y-scroll border border-[#eaeaf3] bg-white rounded-md list-none">
                                {
                                    selectProps.options.map((option, index) => (
                                        <li key={index} onClick={(event) => handleOnChange(event, index)} tabIndex={index} className="flex items-center gap-x-2 border-y border-[#f1f5f9] hover:bg-[#f8fafc] px-3 py-2.5">
                                            {selectProps.prependFlag ? <CountryFlag currencyCode={option.value} /> : <></>}
                                            {option.label}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <input type={inputProps.type || 'text'} placeholder={inputProps.placeholder || label} name={inputProps.name}
                        className={`w-full bg-transparent outline-0 px-2 py-3`}
                        defaultValue={inputProps.defaultValue || ''}
                        disabled={inputProps.disabled ? true : false}
                        onKeyUp={handleOnInputEvent} onInput={handleOnInputEvent} onBlur={handleOnInputEvent}
                    />
                </div>
            </div>

            {selectErrorText.initiated && selectErrorText.error && typeof selectErrorText.error === 'string' && <p className='text-[#FF4D4F] text-xs mt-1'>{selectErrorText.error}</p>}
            {errorText.initiated && errorText.error && typeof errorText.error === 'string' && <p className='text-[#FF4D4F] text-xs mt-1'>{errorText.error}</p>}
        </div>
    )
}




interface RadioOption {
    label: string;
    value: string;
}

interface RadioButtonGroupProps {
    options: RadioOption[];
    onChange: (value: string) => void;
    selectedValue?: string;
    color?: string;
    spacing?: string | number; //experimental
}

export const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
    options,
    onChange,
    selectedValue,
    color = 'teal',
    spacing = 4,
}) => {
    return (
        <div className={`flex gap-${spacing}`}>
            {options.map((option, i) => (
                <label
                    key={option.value}
                    className={`flex items-center gap-2 cursor-pointer ${selectedValue === option.value ? 'text-black' : 'text-gray-500'
                        }`}
                >
                    <input
                        type="radio"
                        value={option.value}
                        checked={selectedValue === option.value}
                        onChange={() => onChange(option.value)} // Directly update the parent state
                        className="hidden"
                        name="radio"
                        id={`${option.value}-${i}`}
                    />
                    <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 ${selectedValue === option.value ? `border-[#01AB79] bg-[#01AB79]` : 'border-gray-300'
                            }`}
                    >
                        {selectedValue === option.value && <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.61914 4.78516L4.74414 7.91016L11.0052 1.66016" stroke="white" strokeWidth="1.65636" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        }
                    </span>
                    <span>{option.label}</span>
                </label>
            ))}
        </div>
    );
};

