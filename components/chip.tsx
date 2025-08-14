import React from 'react';
import { cn } from "@/helpers/extras";
import { STATUS_ENUMS } from '@/types';

export type ChipVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'pending' | 'deactivated' | 'approved' | 'failed' | 'successfull' | 'blacklisted' | 'active' | 'rejected' | 'processed';
type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: ChipVariant | string;
    size?: ChipSize;
    withDot?: boolean;
}

const variantStyles: Record<ChipVariant, string> = {
    success: 'bg-[#ECFDF3] text-[#027A48]',
    active: 'bg-[#ECFDF3] text-[#027A48]',
    successfull: 'bg-[#ECFDF3] text-[#027A48]',
    warning: 'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-700',
    failed: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
    default: 'bg-gray-50 text-gray-700',
    pending: 'bg-[#FFF6ED] text-[#DB7704]',
    deactivated: 'bg-[#FFD4D4B5] text-[#FF5656]',
    approved: 'bg-[#ECFDF3] text-[#027A48]',
    blacklisted: 'bg-red-50 text-red-700', // Added blacklisted variant
    rejected: 'bg-red-50 text-red-700',
    processed: 'bg-[#ECFDF3] text-[#027A48]'

};

const sizeStyles: Record<ChipSize, string> = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
};

const dotStyles: Record<ChipVariant, string> = {
    approved: 'bg-[#027A48]',
    active: 'bg-[#027A48]',
    success: 'bg-[#027A48]',
    successfull: 'bg-[#027A48]',
    warning: 'bg-[#FFD700]',
    failed: 'bg-[#FF0000]',
    error: 'bg-[#FF0000]',
    info: 'bg-[#007ACC]',
    default: 'bg-[#808080]',
    pending: 'bg-[#DB7704]',
    deactivated: 'bg-[#808080]',
    blacklisted: 'bg-[#FF0000]', // Added blacklisted dot style
    rejected: 'bg-[#FF0000]',
    processed: 'bg-[#027A48]'

};

/**
 * A reusable Chip component that can be used to display small, labeled pieces of information.
 *
 * @component
 * @param {Object} props - The props for the Chip component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the Chip.
 * @param {ChipVariant} [props.variant='default'] - The variant of the Chip, which determines the background and text colors.
 * @param {ChipSize} [props.size='sm'] - The size of the Chip.
 * @param {boolean} [props.withDot=false] - Whether to display a dot next to the Chip content.
 * @param {string} [props.className] - Additional CSS classes to be applied to the Chip.
 * @param {React.HTMLAttributes<HTMLSpanElement>} [props] - Any additional props to be passed to the underlying `span` element.
 * @returns {React.ForwardRefExoticComponent<ChipProps & React.RefAttributes<HTMLSpanElement>>} - The Chip component.
 */
const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(({
    children,
    variant = 'default',
    size = 'md',
    withDot = true,
    className,
    ...props
}, ref) => {
    return (
        <span
            ref={ref}
            className={cn(
                'inline-flex items-center gap-1.5 font-medium rounded-full',
                variantStyles[variant as ChipVariant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {withDot && (
                <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    dotStyles[variant as ChipVariant]
                )} />
            )}
            {children}
        </span>
    );
});

Chip.displayName = 'Chip';
// Your `STATUS_CHIP_VARIANTS` mapping
const STATUS_CHIP_VARIANTS: Record<string, ChipVariant> = {
    active: 'success',
    inactive: 'deactivated',
    pending: 'pending',
    blacklisted: 'blacklisted', // Added blacklisted mapping
    rejected: 'rejected'
} as const;

// deprecated
/**
 * @deprecated
 * @param statusEnum 
 * @returns 
 */
const getChipVariantForStatus = (statusEnum: STATUS_ENUMS): ChipVariant => {
    // Map the status enum to its string value
    const statusMap: Record<STATUS_ENUMS, string> = {
        [STATUS_ENUMS.pending]: 'pending',
        [STATUS_ENUMS.approved]: 'active',
        [STATUS_ENUMS.deactivated]: 'inactive',

        // [STATUS_ENUMS.blacklisted]: 'blacklisted', // Added blacklisted mapping
    };

    // Get the string for the status
    const statusString = statusMap[statusEnum];

    // Return the corresponding chip variant
    return STATUS_CHIP_VARIANTS[statusString] ?? 'default'; // Default in case statusString is not found
};

export { Chip, getChipVariantForStatus };
export type { ChipProps };