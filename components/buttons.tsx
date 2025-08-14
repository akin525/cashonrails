"use client";
import { useState, useEffect } from "react";

type ButtonProps = {
    label: string;
    loading?: string;
    disabled?: boolean;
    fullWidth?: boolean;
    state?: 'disabled' | 'active' | 'error';
    optionsIcon?: React.ReactElement<SVGElement>;
    children?: React.ReactNode;
    onClick?: () => void;
} & (
        {
            type: 'smPrimaryButton' | 'smOutlineButton' | 'smOutlineButtonWithIcon' |
            'mdPrimaryButton' | 'mdOutlineButton' | 'mdOutlineButtonWithOptionsIcon' | 'lgPrimaryButton';
            icon?: React.ReactElement<SVGElement>;
            iconPosition?: 'left' | 'right';
        } | {
            type: 'mdPrimaryButtonWithIcon' | 'mdTextButtonWithIcon' | 'mdOutlineButtonWithIcon';
            icon: React.ReactElement<SVGElement>;
            iconPosition: 'left' | 'right';
        }
    )

export default function Buttons({ type, label, icon, optionsIcon, iconPosition, children, loading, disabled, fullWidth, state, onClick }: ButtonProps) {
    const smButtonStyles = `${fullWidth && 'w-full '} text-[12px] text-center font-medium px-3 py-2 rounded-[4px]`
    const mdButtonStyles = `${fullWidth && 'w-full '} text-[14px] text-center px-4 py-2.5 rounded-[4px]`
    const lgButtonStyles = `${fullWidth && 'w-full '} text-[16px] text-center px-6 py-3 rounded-[4px]`

    const [openDropdownMenu, setOpenDropdownMenu] = useState(false);

    // Handle open dropdown options
    const handleOpenDropdownOptions = () => {
        setOpenDropdownMenu(val => !val);

        onClick && onClick();
    }

    // Close dropdown menu when clicked outside, except the button
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.getAttribute('data-target') !== 'button-options-dropdown-menu-target') {
                setOpenDropdownMenu(false);
            }
        }

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);


    return (
        <>
            {
                type === 'smPrimaryButton' && (
                    <button onClick={onClick} className={`${smButtonStyles} text-white  ${disabled ? (' bg-[#CBD5E1] cursor-not-allowed ') : (state === 'error' ? ' bg-[#E11D48] ' : ' bg-[#01AB79]  hover:bg-[#3aac8a] ')} whitespace-nowrap`}>
                        {
                            loading ? (
                                <div className="flex justify-center items-center gap-x-1.5 text-[#ffffffd7]">
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.2" fillRule="evenodd" clipRule="evenodd" d="M26.9999 48.3345C38.782 48.3345 48.3333 38.7832 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345ZM26.9999 53.6678C41.7275 53.6678 53.6666 41.7287 53.6666 27.0011C53.6666 12.2735 41.7275 0.334473 26.9999 0.334473C12.2723 0.334473 0.333252 12.2735 0.333252 27.0011C0.333252 41.7287 12.2723 53.6678 26.9999 53.6678Z" fill="#A9A7C1" /><path fillRule="evenodd" clipRule="evenodd" d="M26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345C28.4727 48.3345 29.6666 49.5284 29.6666 51.0011C29.6666 52.4739 28.4727 53.6678 26.9999 53.6678C12.2723 53.6678 0.333252 41.7287 0.333252 27.0011C0.333252 12.2735 12.2723 0.334473 26.9999 0.334473C41.7275 0.334473 53.6666 12.2735 53.6666 27.0011C53.6666 28.4739 52.4727 29.6678 50.9999 29.6678C49.5272 29.6678 48.3333 28.4739 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781Z" fill="url(#paint0_linear_1939_13920)" /><defs><linearGradient id="paint0_linear_1939_13920" x1="26.9999" y1="27.0011" x2="26.9999" y2="48.3345" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></linearGradient></defs></svg>
                                    {loading}
                                </div>
                            ) : (label)
                        }
                    </button>
                )
            }
            {
                type === 'smOutlineButton' && (
                    <button onClick={onClick} className={`${smButtonStyles} ${state === 'error' ? 'border-[#E11D48] text-[#E11D48] ' : ' border-[#01AB79] hover:border-[#3aac8a] text-[#01AB79] hover:bg-[#01ab780f] '} ${loading && ' pointer-events-none cursor-not-allowed '} border font-medium py-2 duration-300 whitespace-nowrap`}>
                        {
                            loading ? (
                                <div className="flex justify-center items-center gap-x-1.5">
                                    {loading}
                                </div>
                            ) : (
                                <>
                                    {icon}
                                    <p className="">{label}</p>
                                </>
                            )
                        }
                    </button>
                )
            }
            {
                type === 'mdPrimaryButton' && (
                    <button onClick={disabled ? () => { } : onClick} className={`${mdButtonStyles} text-white  ${disabled ? 'bg-[#e2f2ef] cursor-not-allowed ' : loading ? 'bg-[#32a180] pointer-events-none ' : state === 'error' ? ' bg-[#E11D48] ' : ' bg-[#01AB79]  hover:bg-[#3aac8a] '} duration-300 whitespace-nowrap`}>
                        {
                            loading ? (
                                <div className="flex justify-center items-center gap-x-1.5 text-[#ffffffd7]">
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.2" fillRule="evenodd" clipRule="evenodd" d="M26.9999 48.3345C38.782 48.3345 48.3333 38.7832 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345ZM26.9999 53.6678C41.7275 53.6678 53.6666 41.7287 53.6666 27.0011C53.6666 12.2735 41.7275 0.334473 26.9999 0.334473C12.2723 0.334473 0.333252 12.2735 0.333252 27.0011C0.333252 41.7287 12.2723 53.6678 26.9999 53.6678Z" fill="#A9A7C1" /><path fillRule="evenodd" clipRule="evenodd" d="M26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345C28.4727 48.3345 29.6666 49.5284 29.6666 51.0011C29.6666 52.4739 28.4727 53.6678 26.9999 53.6678C12.2723 53.6678 0.333252 41.7287 0.333252 27.0011C0.333252 12.2735 12.2723 0.334473 26.9999 0.334473C41.7275 0.334473 53.6666 12.2735 53.6666 27.0011C53.6666 28.4739 52.4727 29.6678 50.9999 29.6678C49.5272 29.6678 48.3333 28.4739 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781Z" fill="url(#paint0_linear_1939_13920)" /><defs><linearGradient id="paint0_linear_1939_13920" x1="26.9999" y1="27.0011" x2="26.9999" y2="48.3345" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></linearGradient></defs></svg>
                                    {loading}
                                </div>
                            ) : (label)
                        }
                    </button>
                )
            }
            {
                type === 'lgPrimaryButton' && (
                    <button onClick={disabled ? () => {} : onClick} className={`${lgButtonStyles} text-white  ${disabled ? 'bg-[#e2f2ef] cursor-not-allowed ' : loading ? 'bg-[#32a180] pointer-events-none ' : 'bg-[#01AB79]  hover:bg-[#3aac8a] '} duration-300 whitespace-nowrap`}>
                        {
                            loading ? (
                                <div className="flex justify-center items-center gap-x-1.5 text-[#ffffffd7]">
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.2" fillRule="evenodd" clipRule="evenodd" d="M26.9999 48.3345C38.782 48.3345 48.3333 38.7832 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345ZM26.9999 53.6678C41.7275 53.6678 53.6666 41.7287 53.6666 27.0011C53.6666 12.2735 41.7275 0.334473 26.9999 0.334473C12.2723 0.334473 0.333252 12.2735 0.333252 27.0011C0.333252 41.7287 12.2723 53.6678 26.9999 53.6678Z" fill="#A9A7C1" /><path fillRule="evenodd" clipRule="evenodd" d="M26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345C28.4727 48.3345 29.6666 49.5284 29.6666 51.0011C29.6666 52.4739 28.4727 53.6678 26.9999 53.6678C12.2723 53.6678 0.333252 41.7287 0.333252 27.0011C0.333252 12.2735 12.2723 0.334473 26.9999 0.334473C41.7275 0.334473 53.6666 12.2735 53.6666 27.0011C53.6666 28.4739 52.4727 29.6678 50.9999 29.6678C49.5272 29.6678 48.3333 28.4739 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781Z" fill="url(#paint0_linear_1939_13920)" /><defs><linearGradient id="paint0_linear_1939_13920" x1="26.9999" y1="27.0011" x2="26.9999" y2="48.3345" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></linearGradient></defs></svg>
                                    {loading}
                                </div>
                            ) : (label)
                        }
                    </button>
                )
            }
            {
                type === 'mdPrimaryButtonWithIcon' && (
                    <button onClick={disabled ? () => {} : onClick} className={`${mdButtonStyles} flex ${iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse'} justify-center items-center ${disabled ? 'bg-[#CBD5E1] cursor-not-allowed ' : loading ? 'bg-[#231663b4] pointer-events-none ' : 'bg-[#231663]  hover:bg-[#1b114c] '} gap-x-2 text-white whitespace-nowrap font-medium`}>
                        {
                            loading ? (
                                <div className="flex justify-center items-center gap-x-1.5 text-[#ffffffd7]">
                                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.2" fillRule="evenodd" clipRule="evenodd" d="M26.9999 48.3345C38.782 48.3345 48.3333 38.7832 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345ZM26.9999 53.6678C41.7275 53.6678 53.6666 41.7287 53.6666 27.0011C53.6666 12.2735 41.7275 0.334473 26.9999 0.334473C12.2723 0.334473 0.333252 12.2735 0.333252 27.0011C0.333252 41.7287 12.2723 53.6678 26.9999 53.6678Z" fill="#A9A7C1" /><path fillRule="evenodd" clipRule="evenodd" d="M26.9999 5.66781C15.2178 5.66781 5.66659 15.2191 5.66659 27.0011C5.66659 38.7832 15.2178 48.3345 26.9999 48.3345C28.4727 48.3345 29.6666 49.5284 29.6666 51.0011C29.6666 52.4739 28.4727 53.6678 26.9999 53.6678C12.2723 53.6678 0.333252 41.7287 0.333252 27.0011C0.333252 12.2735 12.2723 0.334473 26.9999 0.334473C41.7275 0.334473 53.6666 12.2735 53.6666 27.0011C53.6666 28.4739 52.4727 29.6678 50.9999 29.6678C49.5272 29.6678 48.3333 28.4739 48.3333 27.0011C48.3333 15.2191 38.782 5.66781 26.9999 5.66781Z" fill="url(#paint0_linear_1939_13920)" /><defs><linearGradient id="paint0_linear_1939_13920" x1="26.9999" y1="27.0011" x2="26.9999" y2="48.3345" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></linearGradient></defs></svg>
                                    {loading}
                                </div>
                            ) : (
                                <>
                                    {icon}
                                    <span className="text-white">{label}</span>
                                </>
                            )
                        }
                    </button>
                )
            }
            {
                type === 'mdOutlineButton' && (
                    <button onClick={disabled ? () => {} : onClick} className={`${mdButtonStyles} ${state === 'error' ? 'border-[#E11D48] text-[#E11D48] ' : 'border-[#272363] text-[#272363] '} ${loading && ' pointer-events-none cursor-not-allowed '} ${disabled ? ' opacity-25 cursor-not-allowed ' : ' opacity-100 '} border font-medium py-2 whitespace-nowrap`}>
                        {
                            loading ? (
                                <div className="flex justify-center items-center gap-x-1.5">
                                    {loading}
                                </div>
                            ) : (
                                <>
                                    {icon}
                                    <p className="">{label}</p>
                                </>
                            )
                        }
                    </button>
                )
            }
            {
                type === 'mdOutlineButtonWithOptionsIcon' && (
                    <div className='relative'>
                        <button
                            onClick={handleOpenDropdownOptions}
                            className={`${mdButtonStyles} ${state === 'error' ? 'border-[#E11D48] text-[#E11D48] ' : 'border-[#272363] text-[#272363] '} flex ${iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse'} ${disabled ? ' opacity-25 cursor-not-allowed ' : ' opacity-100 '} justify-between items-center gap-x-2 border font-medium py-2 whitespace-nowrap`}
                            data-target="button-options-dropdown-menu-target"
                        >
                            {label}
                            {optionsIcon}
                        </button>

                        {
                            openDropdownMenu && (
                                <>
                                    {children}
                                </>
                            )
                        }
                    </div>
                )
            }
            {
                type === 'smOutlineButtonWithIcon' && (
                    <button onClick={disabled ? () => {} : onClick} className={`${smButtonStyles} flex ${iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse'}  ${state === 'error' ? 'border-[#E11D48] text-[#E11D48] ' : 'border-[#272363] text-[#272363] '} ${disabled ? ' opacity-25 cursor-not-allowed ' : ' opacity-100 '} justify-center items-center gap-x-2 border whitespace-nowrap font-medium`}>
                        {icon}
                        <span className={`${state === 'error' ? 'text-[#E11D48]' : 'text-[#272363]'}`}>{label}</span>
                    </button>
                )
            }
            {
                type === 'mdOutlineButtonWithIcon' && (
                    <button onClick={disabled ? () => {} : onClick} className={`${mdButtonStyles} flex ${iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse'} justify-center items-center gap-x-2 whitespace-nowrap border ${ state === 'error' ? ' border-[#E11D48] ' : ' border-[#272363] ' }  text-[#272363] font-medium`}>
                        {icon}
                        <span className={`${state === 'error' ? 'text-[#E11D48]' : 'text-[#272363]'}`}>{label}</span>
                    </button>
                )
            }
            {
                type === 'mdTextButtonWithIcon' && (
                    <button onClick={disabled ? () => {} : onClick} className={`${mdButtonStyles} flex ${iconPosition === 'left' ? 'flex-row' : 'flex-row-reverse'} justify-center items-center gap-x-2 whitespace-nowrap text-[#462CC6]`}>
                        {icon}
                        <span className="font-medium">{label}</span>
                    </button>
                )
            }
        </>
    )
}