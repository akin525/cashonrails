"use client"
import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment'; // Import moment
import Link from 'next/link';
type TransactionType = 'all' | 'transaction' | 'transfer' | 'subscription';
interface NotificationProps {
    type: TransactionType;
    status: 'completed' | 'failed';
    title: string;
    description: string;
    date: Date; // Use Date object for date
    icon: React.ReactNode;
}

const Notification: React.FC<NotificationProps> = ({ type, status, title, description, date, icon }) => (
    <div className="flex items-center p-3 last:border-0 hover:bg-[#F2F2F2] hover:rounded-lg my-4">
        <div className="mr-3 border-[#D0D5DDC9] rounded-full border bg-white p-2">{icon}</div>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <p className="font-medium">{title}</p>
                <span className="text-xs text-[#00000080]">{moment(date).fromNow()}</span>
            </div>
            <p className="text-sm text-gray-700">{description}</p>
        </div>
    </div>
);

const NotificationsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [activeTab, setActiveTab] = useState<TransactionType>('all'); // Track active tab

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    // Function to get icon based on notification type
    const getIcon = (type: TransactionType) => {
        switch (type) {
            case 'transaction':
                return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.66675 13.3346C1.66675 15.1771 1.66675 16.0983 2.25164 16.7133C2.34519 16.8117 2.44829 16.9027 2.55978 16.9852C3.25682 17.5013 4.30087 17.5013 6.38897 17.5013H6.94452C9.03266 17.5013 10.0767 17.5013 10.7737 16.9852C10.8852 16.9027 10.9883 16.8117 11.0818 16.7133C11.6667 16.0983 11.6667 15.1771 11.6667 13.3346C11.6667 11.4922 11.6667 10.571 11.0818 9.95597C10.9883 9.85755 10.8852 9.76655 10.7737 9.68405C10.0767 9.16797 9.03266 9.16797 6.94452 9.16797H6.38897C4.30087 9.16797 3.25682 9.16797 2.55978 9.68405C2.44829 9.76655 2.34519 9.85755 2.25164 9.95597C1.66675 10.571 1.66675 11.4922 1.66675 13.3346Z" stroke="black" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.33325 6.66667C8.33325 4.82422 8.33325 3.90301 8.91817 3.28797C9.01167 3.1896 9.11484 3.09862 9.22625 3.01607C9.92334 2.5 10.9673 2.5 13.0555 2.5H13.611C15.6992 2.5 16.7432 2.5 17.4403 3.01607C17.5517 3.09862 17.6548 3.1896 17.7483 3.28797C18.3333 3.90301 18.3333 4.82422 18.3333 6.66667C18.3333 8.50907 18.3333 9.43032 17.7483 10.0453C17.6548 10.1437 17.5517 10.2347 17.4403 10.3172C16.8079 10.7854 15.8902 10.8289 14.1666 10.8329" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.66675 12.5H11.6667" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8.33325 5.83203H18.3333" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M1.66675 7.5C1.66675 4.73572 3.90246 2.5 6.66675 2.5L5.95246 3.92858" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18.3333 12.5C18.3333 15.2642 16.0975 17.5 13.3333 17.5L14.0475 16.0714" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>;
            case 'transfer':
                return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_2547_14938)">
                        <path d="M1.66675 7.14219C1.66675 6.14538 2.06873 5.53449 2.90061 5.07154L6.32497 3.16584C8.11933 2.16726 9.0165 1.66797 10.0001 1.66797C10.9837 1.66797 11.8808 2.16726 13.6752 3.16584L17.0996 5.07154C17.9314 5.53449 18.3334 6.14539 18.3334 7.14219C18.3334 7.41249 18.3334 7.54764 18.3039 7.65875C18.1488 8.24251 17.6198 8.33464 17.109 8.33464H2.89115C2.38031 8.33464 1.85135 8.2425 1.69626 7.65875C1.66675 7.54764 1.66675 7.41249 1.66675 7.14219Z" stroke="black" strokeWidth="1.5" />
                        <path d="M9.99658 5.83203H10.0041" stroke="black" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M3.33325 8.33203V15.4154M6.66659 8.33203V15.4154" stroke="black" strokeWidth="1.5" />
                        <path d="M13.3333 8.33203V15.4154M16.6666 8.33203V15.4154" stroke="black" strokeWidth="1.5" />
                        <path d="M15.8334 15.418H4.16675C2.78604 15.418 1.66675 16.5372 1.66675 17.918C1.66675 18.1481 1.8533 18.3346 2.08341 18.3346H17.9167C18.1468 18.3346 18.3334 18.1481 18.3334 17.918C18.3334 16.5372 17.2142 15.418 15.8334 15.418Z" stroke="black" strokeWidth="1.5" />
                    </g>
                    <defs>
                        <clipPath id="clip0_2547_14938">
                            <rect width="20" height="20" fill="white" />
                        </clipPath>
                    </defs>
                </svg>;
            case 'subscription':
                return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.6571 2.5L14.4928 3.31312C14.8662 3.67637 15.0528 3.85801 14.9871 4.01234C14.9214 4.16667 14.6574 4.16667 14.1294 4.16667H7.66193C4.35088 4.16667 1.66675 6.77834 1.66675 10C1.66675 11.2393 2.06398 12.3885 2.74133 13.3333" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.34297 17.5013L5.50729 16.6882C5.13395 16.3249 4.94728 16.1433 5.01298 15.989C5.07868 15.8346 5.34267 15.8346 5.87065 15.8346H12.3382C15.6492 15.8346 18.3333 13.223 18.3333 10.0013C18.3333 8.76197 17.9361 7.61283 17.2588 6.66797" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>;
            default:
                return <></>; // Fallback if needed
        }
    };

    // Dummy data for notifications
    const notifications: Omit<NotificationProps, 'icon'>[] = [ // Type the notifications array
        {
            type: 'transaction' as TransactionType, // Cast to TransactionType
            status: 'completed',
            title: 'Transaction Completed',
            description: 'A payment of ₦200 was successfully processed',
            date: new Date(), // Today

        },
        {
            type: 'transfer' as TransactionType, // Cast to TransactionType
            status: 'failed',
            title: 'Transfer Failed',
            description: 'Transfer of $150 to David Matthew could not be completed. Please check account details and retry the transfer.',
            date: new Date(), // Today
        },
        {
            type: 'subscription' as TransactionType, // Cast to TransactionType
            status: 'completed',
            title: 'New Subscription',
            description: 'Sam Chukwueze has subscribed to the Basic plan at $50/month',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
        {
            type: 'subscription' as TransactionType, // Cast to TransactionType
            status: 'completed',
            title: 'New Subscription',
            description: 'John Doe has subscribed to the Premium plan at $100/month',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
    ];

    // Filter notifications based on the active tab
    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'all') return true;
        return notification.type === activeTab.toLowerCase(); // Convert activeTab to lowercase for comparison
    });

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    // Function to format date to a readable string
    const formatDate = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return moment(date).format('MMMM D, YYYY'); // Format other dates
        }
    };

    // Group notifications by date
    const groupedNotifications = filteredNotifications.reduce((acc: { [key: string]: Omit<NotificationProps, 'icon'>[] }, notification) => {
        const dateKey = formatDate(notification.date);
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(notification);
        return acc;
    }, {});

    if (!isOpen && !isAnimating) return null; // Don't render if not open and not animating

    return (
        <div className={`fixed inset-0 top-0 flex items-start justify-end z-50 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
            <div ref={modalRef} className={`w-full max-w-xl mx-auto md:mx-0 mt-20 bg-white rounded-lg shadow-lg p-5 relative z-10 border border-[#EAEAEC] transition-transform duration-300 transform ${isAnimating ? 'scale-100' : 'scale-95'}`}>
                <header className="flex justify-between items-center pb-3 mb-3">
                    <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700 md:hidden" // Hide on medium and larger screens
                        onClick={onClose} // Close button functionality
                        aria-label="Close Notifications"
                    >
                        ✕
                    </button>
                </header>

                <div className="flex space-x-4 pb-3 mb-3">
                    {['all', 'transactions', 'transfers', 'subscriptions'].map((tab) => (
                        <button
                            key={tab}
                            className={`text-sm capitalize font-medium pb-2 ${activeTab === tab ? 'text-gray-900 border-b-2 border-black' : 'text-gray-500'}`}
                            onClick={() => setActiveTab(tab as TransactionType)} // Set active tab on click
                        >
                            {tab} <span className={`text-xs ${activeTab === tab ? 'bg-black text-gray-200' : 'bg-gray-200 text-gray-600'} px-1 rounded ml-1`}>
                                {notifications.filter(n => n.type === tab.toLowerCase()).length}
                            </span>
                        </button>
                    ))}
                </div>

                <section className="max-h-[60vh] overflow-y-auto">
                    {Object.keys(groupedNotifications).map((dateKey) => (
                        <div key={dateKey}>
                            <h3 className="text-xs font-normal text-black capitalize mb-3 bg-[#F7F7F7] p-3">{dateKey}</h3>
                            {groupedNotifications[dateKey].map((notification, index) => (
                                <Notification
                                    key={index}
                                    date={notification.date}
                                    description={notification.description}
                                    status={notification.status}
                                    title={notification.title}
                                    type={notification.type}
                                    icon={getIcon(notification.type as TransactionType)} // Render icon based on type
                                />
                            ))}
                        </div>
                    ))}
                </section>

                <footer className="mt-4 text-left indent-4">
                    <Link className="text-sm text-emerald-600 hover:underline" href={'/'}>View All Notifications</Link>
                </footer>
            </div>
        </div>
    );
};

export default NotificationsPanel;