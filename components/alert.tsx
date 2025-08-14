import React from 'react'
import { cn } from '@/helpers/extras'


const variants = {
    default: "bg-blue-50 text-blue-900 border-blue-200",
    destructive: "bg-red-50 text-red-900 border-red-200",
    warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
    success: "bg-green-50 text-green-900 border-green-200"
}

const icons = {
    default: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>,
    destructive: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>,
    warning: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>,
    success: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof variants
    title?: string
    description?: string | React.ReactNode
}

export function Alert({
    className,
    variant = "default",
    title,
    description,
    ...props
}: AlertProps) {
    const IconComponent = icons[variant]
    const renderIcon = () => icons[variant]

    return (
        <div
            role="alert"
            className={cn(
                "relative w-full rounded-lg border p-4",
                variants[variant],
                className
            )}
            {...props}
        >
            <div className="flex items-start gap-4">
                {renderIcon()}
                <div className="flex-1">
                    {title && (
                        <h5 className="mb-1 font-medium leading-none tracking-tight">
                            {title}
                        </h5>
                    )}
                    {description && (
                        <div className="text-sm [&_p]:leading-relaxed">
                            {description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export function AlertTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h5
            className={cn("mb-1 font-medium leading-none tracking-tight", className)}
            {...props}
        />
    )
}

export function AlertDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("text-sm [&_p]:leading-relaxed text-black", className)}
            {...props}
        />
    )
}

export default Alert