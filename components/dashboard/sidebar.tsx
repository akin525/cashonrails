"use client";
import React, { Suspense, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShopOutlineIcon,
  BalanceOutlineIcon,
  SupportOutlineIcon,
  SettingsOutlineIcon,
  ChevronIcon,
  CustomerIcon,
  OverviewOutline,
  OverviewFilled,
  ComplianceIconOutline, AnalyticsIcon, ReportIcon,
} from "@icons/index";
import { useAuth } from "@/contexts/authContext";
import { useUI } from "@/contexts/uiContext"; // Import the UI context
import { Route, RouteLiteral } from "nextjs-routes";
import { useTheme } from "next-themes";
import ThemeSwitcher from "../utils";
import {Menu} from "lucide-react";

// Types
interface NavItem {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  path: string;
  expandable?: boolean;
  subItems?: { label: string; path: string }[];
  roles?: string[];
}



const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { dispatch, authState } = useAuth();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const userRole = authState.userDetails?.role || "admin"; // Default to "admin" if undefined
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Payment: true,
    More: false,
    Account: false,
    Subscriptions: false,
  });

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    return router.replace("/login");
  };

  const navItems: NavItem[] = [
    {
      icon: <OverviewOutline />,
      activeIcon: <OverviewFilled />,
      label: "Overview",
      path: "/dashboard/overview",
      roles: ["admin", "superadmin"],
    },

    {
      icon: <OverviewOutline />,
      activeIcon: <OverviewFilled />,
      label: "Overview Addition",
      path: "/dashboard/overview2",
      roles: ["admin","superadmin"],

    },
    {
      icon: <OverviewOutline />,
      activeIcon: <OverviewFilled />,
      label: "Compose Mail",
      path: "/dashboard/operations/compose-email",
      roles: ["admin", "superadmin"],

    },
    {
      icon: <OverviewOutline />,
      activeIcon: <OverviewFilled />,
      label: "Board Analytics",
      path: "/dashboard/overviewNew",
      roles: ["admin", "superadmin"],

    },
    {
      icon: <AnalyticsIcon />,
      activeIcon: <AnalyticsIcon />,
      label: "Analytics",
      path: "/",
      expandable: true,
      subItems: [
        { label: "System Calculator", path: "/dashboard/Analytics/system-calculator" },
        { label: "Virtual Stats", path: "/dashboard/Analytics/virtual-account" },
        { label: "System Statistics Daily", path: "/dashboard/Analytics/system-statistics" },
        { label: "System Statistics Monthly", path: "/dashboard/Analytics/monthly-statistics" },
        // ...(userRole === "superadmin"
        //     ? [
        //       { label: "Virtual Stats", path: "/dashboard/Analytics/virtual-account" },
        //       { label: "System Statistics Daily", path: "/dashboard/Analytics/system-statistics" },
        //       { label: "System Statistics Monthly", path: "/dashboard/Analytics/monthly-statistics" },
        //     ]
        //     : []),
      ],
    },

    {
      icon: <ReportIcon />,
      activeIcon: <ReportIcon />,
      label: "Report",
      path: "/",
      expandable: true,
      roles: ["admin", "superadmin"],
      subItems: [
        { label: "Transaction Report", path: "/dashboard/reports/transaction-report" },
        { label: "Payout Report", path: "/dashboard/reports/payout-report" },
        { label: "Refund Report", path: "/dashboard/reports/refund-report" },
      ],
    },

    {
      icon: <CustomerIcon />,
      activeIcon: <CustomerIcon />,
      label: "Operations",
      path: "/",
      expandable: true,
      roles: ["admin", "superadmin"],
      subItems: [
        { label: "Business-Overview", path: "/dashboard/operations/merchant-overview" },
        { label: "Business", path: "/dashboard/operations/merchant" },
        { label: "Transfer Bucket", path: "/dashboard/operations/transfer-bucket" },
        { label: "List Merchant", path: "/dashboard/operations/users" },
        { label: "Virtual Accounts", path: "/dashboard/operations/virtual-accounts" },
        { label: "Resolve Transaction", path: "/dashboard/operations/resolve-transaction" },
      ],
    },
    {
      icon: <CustomerIcon />,
      activeIcon: <CustomerIcon />,
      label: "Cashier",
      path: "/",
      roles: ["superadmin"],
      expandable: true,
      subItems: [
        { label: "Payout-Cashier", path: "/dashboard/cashier/payout-cashier" },
        { label: "Deposit-Cashier", path: "/dashboard/cashier/deposit-cashier"},
      ],
    },
    {
      icon: <OverviewOutline />,
      activeIcon: <OverviewFilled />,
      label: "Storefronts",
      path: "/dashboard/storefronts",
      roles: ["admin", "superadmin"],
    },

    {
      icon: <ReportIcon />,
      activeIcon: <ReportIcon />,
      label: "NETMFB",
      path: "/" as const,
      expandable: true,
      subItems: [
        { label: "Summary", path: "/dashboard/netmfb/summary" as const },
        { label: "Statement", path: "/dashboard/netmfb/statement" as const },
        ...(userRole === "superadmin"
            ? [{ label: "Transfer", path: "/dashboard/netmfb/transfer" as const }]
            : []),
          ],
    },

    {
      icon: <ComplianceIconOutline />,
      label: "Compliance",
      path: "/",
      roles: ["admin","superadmin"],
      expandable: true,
      subItems: [
        { label: "Business Approval", path: "/dashboard/compliance/merchant-approval" },
      ],
    },

    {
      icon: <CustomerIcon />,
      activeIcon: <CustomerIcon />,
      label: "Staff",
      path: "/",
      roles: ["superadmin"],
      expandable: true,
      subItems: [
        { label: "Staff", path: "/dashboard/settings/teams" },
        // { label: "Add Staff", path: "/" },
      ],
    },
    {
      icon: <BalanceOutlineIcon size={20} />,
      label: "Finance",
      path: "/",
      expandable: true,
      roles: ["admin", "superadmin"],
      subItems: [
        { label: "Export Per Business", path: "/dashboard/finance/getbusiness" },
        { label: "Transactions", path: "/dashboard/finance/transactions" },
        { label: "Transfers", path: "/dashboard/finance/transfers" },
        { label: "Settlements", path: "/dashboard/finance/settlements" },
        { label: "Chargebacks", path: "/dashboard/finance/chargebacks" },
        { label: "Checkouts", path: "/dashboard/finance/checkout" },
        { label: "Wallet Transactions", path: "/dashboard/finance/wallet-transactions" },
        { label: "Incoming Transfers", path: "/dashboard/finance/inbound-transfers" },
        { label: "Unsettled Transactions", path: "/dashboard/finance/unsettled-transactions" },



      ],
    },
    {
      icon: <ReportIcon />,
      activeIcon: <ReportIcon />,
      label: "Payouts",
      path: "/",
      expandable: true,
      roles: ["admin", "superadmin"],
      subItems: [
        { label: "Payouts", path: "/dashboard/finance/payouts" },
        { label: "Pending Payout", path: "/dashboard/finance/pending-payouts" },
        { label: "Failed Payouts", path: "/dashboard/finance/failed-payouts" },


      ],
    },

    {
      icon: <CustomerIcon />,
      label: "Growth",
      path: "/",
      expandable: true,
      roles: ["superadmin"],
      subItems: [
        { label: "Merchant Performance", path: "/dashboard/growth/merchant-performance" },
        { label: "Fees Management", path: "/dashboard/growth/fees-management" },
      ],
    },


  ];

  const accountItems: NavItem[] = [
    {
      icon: <SettingsOutlineIcon />,
      label: "Settings",
      path: "/dashboard/settings/profile",
      roles: ["admin", "superadmin"],
      expandable: true,
      subItems: [
        { label: "Profile", path: "/dashboard/settings/profile" },
        { label: "Audit Logs", path: "/dashboard/settings/audit-logs" },
        { label: "Departments", path: "/dashboard/settings/departments" },
      ],
    },
  ];
  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (itemPath: string) =>
    pathname === itemPath || pathname.startsWith(`${itemPath}/`);

  const renderNavItem = (item: NavItem, index: number) => (
      <div key={index} className="mb-1">
        <Link href={item.path as any}>
          <div
              className={`flex items-center rounded-lg justify-between px-4 py-2.5 cursor-pointer transition-all duration-200 ease-in-out ${
                  isActive(item.path) ||
                  (item.subItems && item.subItems.some((subItem) => isActive(subItem.path)))
                      ? isDarkMode
                          ? "bg-[#01ab7880]"
                          : "bg-secondary-background"
                      : "hover:bg-[#01ab7822]"
              }`}
              onClick={(e) => {
                if (item.expandable) {
                  e.preventDefault();
                  toggleExpand(item.label);
                }
              }}
          >
            <div className="flex items-center space-x-3">
            <span className="transition-colors duration-200">
              {isActive(item.path) && item.activeIcon ? item.activeIcon : item.icon}
            </span>
              <span className={`transition-colors duration-200 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
              {item.label}
            </span>
            </div>
            {item.expandable && (
                <ChevronIcon
                    stroke={isDarkMode ? "white" : "black"}
                    className={`transform transition-transform duration-300 ease-in-out ${
                        expandedItems[item.label] ? "rotate-90" : ""
                    }`}
                />
            )}
          </div>
        </Link>
        {item.expandable && (
            <div
                className={`ml-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedItems[item.label] ? "max-h-[500px] opacity-100 transform translate-y-0" : "max-h-0 opacity-0 transform -translate-y-2"
                }`}
            >
              {item.subItems?.map((subItem, subIndex) => (
                  <Link key={subIndex} href={subItem.path as any}>
                    <div
                        className={`py-2 px-2 my-1 rounded-lg text-sm cursor-pointer transition-all duration-200 ease-in-out ${
                            isActive(subItem.path) ? "text-green-400 font-medium" : isDarkMode ? "text-gray-400" : "text-gray-700"
                        }`}
                    >
                      {subItem.label}
                    </div>
                  </Link>
              ))}
            </div>
        )}
      </div>
  );

  return (
      <>
        {/* Mobile Toggle Button */}
        <button
            className="md:hidden fixed top-4 left-4 z-50 bg-green-600 text-white p-2 shadow-lg"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        {/* Sidebar Container */}
        <div
            className={`fixed md:relative top-0 left-0 z-40 h-screen w-64 md:w-[18%] md:block overflow-y-auto scrollbar-hidden px-4 py-2.5
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        bg-white dark:bg-[#122023]
        border-r border-gray-300 dark:border-gray-700`}
        >
          {/* User Info */}
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-between w-full rounded-lg py-2.5 px-2.5 bg-gray-100 dark:bg-[#F1FDF608]">
              <div className="flex items-center gap-x-2.5">
            <span className="w-8 h-8 rounded-full font-medium flex justify-center items-center text-sm uppercase bg-green-500 text-white">
              {(authState.userDetails?.name?.split("")[0] || "")?.charAt(0)}
            </span>
                <div>
                  <p className="font-medium text-sm truncate text-black dark:text-white">
                    {authState.userDetails?.name}
                  </p>
                </div>
              </div>
              <ChevronIcon
                  className="float-right -rotate-90 transition-transform duration-200"
                  stroke="currentColor"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems
                .filter((item) => !item.roles || item.roles.includes(userRole))
                .map(renderNavItem)}
          </nav>

          {/* Account Section Label */}
          <div className="px-4 py-2 text-sm mt-6 mb-2 text-gray-500 dark:text-gray-400">
            ACCOUNT
          </div>

          {/* Account Items */}
          <nav className="space-y-1">
            {accountItems.map(renderNavItem)}

            <button
                className="w-full flex items-center px-4 py-2.5 text-red-500 transition-all duration-200 ease-in-out hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-4"
                onClick={logout}
            >
              <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-3"
              >
                <path
                    d="M15 8.00004C15 8.00004 11.3176 13 10 13C8.68233 13 5 8 5 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
              </svg>
              Logout
            </button>
          </nav>
        </div>

        {/* Background Overlay for Mobile */}
        {isSidebarOpen && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
                onClick={() => setSidebarOpen(false)}
            ></div>
        )}
      </>
  );

};
export default Sidebar;
