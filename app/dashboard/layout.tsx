"use client";
import React, { ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/authContext';
import SideNav from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import { useUI } from '@/contexts/uiContext';
import ThemeSwitcher from '@/components/utils';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const { authState } = useAuth();

    // Check if the path has exactly two or three segments, like "/dashboard/subscriptions/plans" 
    // NOTE: This is not a perfect check and could be improved (experimental feature) by Scott Lexium
    const pathSegments = pathname.split('/').filter(Boolean);
    // const showHeader = (pathSegments.length === 2 || pathSegments.length === 3) && pathSegments[0] === 'dashboard';
    const { showHeader } = useUI();

    return (
        <Suspense>
            <div className="flex h-screen relative">
                <SideNav />
                <main className="flex-1 overflow-y-auto relative">
                    {showHeader && <Header />}
                    <div className={`${showHeader && 'p-5'}`}>
                        {children}
                    </div>
                </main>
              
            </div>
        </Suspense>
    );
};

export default DashboardLayout;
