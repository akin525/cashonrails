import React from "react";
import toast from "react-hot-toast";

type CopyToClipboardProps = {
    text: string | number;
    label?: string;
    icon?: React.ReactNode
};

export default function CopyToClipboard({ text, label, icon }: CopyToClipboardProps) {
    const handleCopyToClipboard = (event: any) => {

        event.stopPropagation();
        event.preventDefault();

        if (!navigator.clipboard) { console.log('Copy not allowed!') }

        const textToBeCopied = text || '';

        navigator.clipboard.writeText(textToBeCopied.toString()).then(function () {
            // console.log('Copying to clipboard was successful!');
            toast.success('Copied!', {
                id: 'copied',
            });
        }, function (err) {
            console.error('Could not copy text: ', err);
            toast.error('Could not copy');
        });
    }

    return (
        <>
            <button className="flex gap-x-1 items-center" onClick={(event) => handleCopyToClipboard(event)}>
                {icon ? icon : <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.33329 4.66667V10C5.33329 10.7364 5.93025 11.3333 6.66663 11.3333H10.6666M5.33329 4.66667V3.33333C5.33329 2.59695 5.93025 2 6.66663 2H9.72382C9.90063 2 10.0702 2.07024 10.1952 2.19526L13.138 5.13807C13.2631 5.2631 13.3333 5.43266 13.3333 5.60948V10C13.3333 10.7364 12.7363 11.3333 12 11.3333H10.6666M5.33329 4.66667H4.66663C3.56206 4.66667 2.66663 5.5621 2.66663 6.66667V12.6667C2.66663 13.403 3.26358 14 3.99996 14H8.66663C9.7712 14 10.6666 13.1046 10.6666 12V11.3333" stroke="#4029B6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                {label && <p className="text-sm font-medium text-[#4029B6]">Copy</p>}
            </button>
        </>
    )
}


export function CopyLinkToClipboard({ text, label }: CopyToClipboardProps) {
    const handleCopyToClipboard = (event: any) => {

        event.stopPropagation();
        event.preventDefault();

        if (!navigator.clipboard) { console.log('Copy not allowed!') }

        const textToBeCopied = text || '';

        navigator.clipboard.writeText(textToBeCopied.toString()).then(function () {
            // console.log('Copying to clipboard was successful!');
            toast.success('Copied!', {
                id: 'copied',
            });
        }, function (err) {
            console.error('Could not copy text: ', err);
            toast.error('Could not copy');
        });
    }

    return (
        <>
            <button className="flex gap-x-1 items-center" onClick={(event) => handleCopyToClipboard(event)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.1302 11.0152C11.2616 11.8838 9.85334 11.8838 8.98468 11.0152C8.11611 10.1466 8.11611 8.73833 8.98468 7.8697L10.9507 5.90375C11.7797 5.07467 13.1004 5.03694 13.9743 5.79055M13.703 3.15146C14.5716 2.28285 15.9798 2.28285 16.8485 3.15146C17.7171 4.02006 17.7171 5.42836 16.8485 6.29696L14.8825 8.26292C14.0535 9.092 12.7328 9.12975 11.8589 8.37608" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.74992 2.5C6.01048 2.5 4.64074 2.5 3.7188 3.25658C3.54998 3.39512 3.39519 3.54991 3.25665 3.71873C2.50006 4.64066 2.50005 6.01039 2.50002 8.74983L2.5 10.8332C2.49997 13.976 2.49996 15.5473 3.47627 16.5237C4.45258 17.5 6.02394 17.5 9.16667 17.5H11.2499C13.9895 17.5 15.3592 17.5 16.2812 16.7433C16.45 16.6048 16.6047 16.4501 16.7433 16.2813C17.4999 15.3593 17.4999 13.9896 17.4999 11.25" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {label}
            </button>
        </>
    )
}

