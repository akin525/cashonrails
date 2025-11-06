"use client";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BalanceOutlineIcon,
  ChevronIcon,
  CustomerIcon,
  OverviewOutline,
  OverviewFilled,
  ComplianceIconOutline,
  AnalyticsIcon,
  ReportIcon,
  SettingsOutlineIcon,
  SupportOutlineIcon,
} from "@icons/index";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  LogOut,
  ChevronRight,
  BarChart3,
  Users,
  CreditCard,
  Search,
  DollarSign,
  Shield,
  TrendingUp,
  Mail,
  Store,
  Building2,
  UserCheck,
  FileText,
  Calculator,
  Activity,
  ArrowUpDown,
  Wallet,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  PieChart,
  Settings,
  UserCog,
  Eye,
  Briefcase,
} from "lucide-react";

// Types
interface NavItem {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  path: string;
  expandable?: boolean;
  subItems?: { label: string; path: string; icon?: React.ReactNode }[];
  roles?: string[];
}

interface Department {
  name: string;
  items: NavItem[];
}

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { dispatch, authState } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const userRole = authState.userDetails?.role || "admin";

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Auto close on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    router.replace("/login");
  };

  // ORGANIZED DEPARTMENTS
  const departments: Department[] = useMemo(
      () => [
        // DASHBOARD & OVERVIEW
        {
          name: "Dashboard",
          items: [
            {
              icon: <BarChart3 className="w-5 h-5" />,
              activeIcon: <BarChart3 className="w-5 h-5 text-emerald-500" />,
              label: "Overview",
              path: "/dashboard/overview",
              roles: ["admin", "superadmin"],
            },
            {
              icon: <PieChart className="w-5 h-5" />,
              activeIcon: <PieChart className="w-5 h-5 text-emerald-500" />,
              label: "Board Analytics",
              path: "/dashboard/overviewNew",
              roles: ["superadmin"],
            },
            {
              icon: <Activity className="w-5 h-5" />,
              activeIcon: <Activity className="w-5 h-5 text-emerald-500" />,
              label: "System Analytics",
              path: "/dashboard/overview2",
              roles: ["superadmin"],
            },
          ],
        },

        // BUSINESS OPERATIONS
        {
          name: "Business Operations",
          items: [
            {
              icon: <Briefcase className="w-5 h-5" />,
              label: "Business Management",
              path: "/dashboard/operations",
              expandable: true,
              roles: ["admin", "superadmin"],
              subItems: [
                {
                  label: "Business Overview",
                  path: "/dashboard/operations/merchant-overview",
                  icon: <Eye className="w-4 h-4" />
                },
                {
                  label: "Business Directory",
                  path: "/dashboard/operations/merchant",
                  icon: <Building2 className="w-4 h-4" />
                },
                {
                  label: "Merchant List",
                  path: "/dashboard/operations/users",
                  icon: <Users className="w-4 h-4" />
                },
                {
                  label: "Virtual Accounts",
                  path: "/dashboard/operations/virtual-accounts",
                  icon: <CreditCard className="w-4 h-4" />
                },
                ...(userRole === "superadmin"
                ?[{
                  label: "Transfer Bucket",
                  path: "/dashboard/operations/transfer-bucket",
                  icon: <ArrowUpDown className="w-4 h-4" />
                },
                {
                  label: "Resolve Transaction",
                  path: "/dashboard/operations/resolve-transaction",
                  icon: <AlertTriangle className="w-4 h-4" />
                }]
                  :[]),
              ],
            },
            {
              icon: <Store className="w-5 h-5" />,
              activeIcon: <Store className="w-5 h-5 text-emerald-500" />,
              label: "Storefronts",
              path: "/dashboard/storefronts",
              roles: ["admin", "superadmin"],
            },
            {
              icon: <Mail className="w-5 h-5" />,
              activeIcon: <Mail className="w-5 h-5 text-emerald-500" />,
              label: "Communications",
              path: "/dashboard/operations/compose-email",
              roles: ["superadmin"],
            },
          ],
        },

        // FINANCIAL OPERATIONS
        {
          name: "Financial Operations",
          items: [
            {
              icon: <DollarSign className="w-5 h-5" />,
              label: "Finance",
              path: "/dashboard/finance",
              expandable: true,
              roles: ["admin", "superadmin"],
              subItems: [
                {
                  label: "Export Per Business",
                  path: "/dashboard/finance/getbusiness",
                  icon: <FileText className="w-4 h-4" />
                },
                {
                  label: "Transactions",
                  path: "/dashboard/finance/transactions",
                  icon: <ArrowUpDown className="w-4 h-4" />
                },
                {
                  label: "Transfers",
                  path: "/dashboard/finance/transfers",
                  icon: <ArrowUpDown className="w-4 h-4" />
                },
                {
                  label: "Settlements",
                  path: "/dashboard/finance/settlements",
                  icon: <CheckCircle className="w-4 h-4" />
                },
                {
                  label: "Chargebacks",
                  path: "/dashboard/finance/chargebacks",
                  icon: <XCircle className="w-4 h-4" />
                },
                {
                  label: "Checkouts",
                  path: "/dashboard/finance/checkout",
                  icon: <CreditCard className="w-4 h-4" />
                },
                {
                  label: "Wallet Transactions",
                  path: "/dashboard/finance/wallet-transactions",
                  icon: <Wallet className="w-4 h-4" />
                },
                {
                  label: "Incoming Transfers",
                  path: "/dashboard/finance/inbound-transfers",
                  icon: <ArrowUpDown className="w-4 h-4" />
                },
                {
                  label: "Unsettled Transactions",
                  path: "/dashboard/finance/unsettled-transactions",
                  icon: <Clock className="w-4 h-4" />
                },
              ],
            },
            {
              icon: <CreditCard className="w-5 h-5" />,
              label: "Payouts",
              path: "/dashboard/payouts",
              expandable: true,
              roles: ["admin", "superadmin"],
              subItems: [
                {
                  label: "All Payouts",
                  path: "/dashboard/finance/payouts",
                  icon: <CheckCircle className="w-4 h-4" />
                },
                {
                  label: "Pending Payouts",
                  path: "/dashboard/finance/pending-payouts",
                  icon: <Clock className="w-4 h-4" />
                },
                {
                  label: "Failed Payouts",
                  path: "/dashboard/finance/failed-payouts",
                  icon: <XCircle className="w-4 h-4" />
                },
              ],
            },
            {
              icon: <Building2 className="w-5 h-5" />,
              label: "NETMFB Banking",
              path: "/dashboard/netmfb",
              roles: ["superadmin"],

              expandable: true,
              subItems: [
                {
                  label: "Account Summary",
                  path: "/dashboard/netmfb/summary",
                  icon: <BarChart3 className="w-4 h-4" />
                },
                {
                  label: "Bank Statement",
                  path: "/dashboard/netmfb/statement",
                  icon: <FileText className="w-4 h-4" />
                },
                ...(userRole === "superadmin"
                    ? [{
                      label: "Bank Transfer",
                      path: "/dashboard/netmfb/transfer",
                      icon: <ArrowUpDown className="w-4 h-4" />
                    }]
                    : []),
              ],
            },
          ],
        },

        // ANALYTICS & REPORTING
        {
          name: "Analytics & Reports",
          items: [
            {
              icon: <BarChart3 className="w-5 h-5" />,
              label: "Analytics",
              path: "/dashboard/analytics",
              roles: ["admin","superadmin"],
              expandable: true,
              subItems: [
                {
                  label: "System Calculator",
                  path: "/dashboard/Analytics/system-calculator",
                  icon: <Calculator className="w-4 h-4" />
                },
                {
                  label: "Virtual Account Stats",
                  path: "/dashboard/Analytics/virtual-account",
                  icon: <CreditCard className="w-4 h-4" />
                },
                {
                  label: "Daily Statistics",
                  path: "/dashboard/Analytics/system-statistics",
                  icon: <Activity className="w-4 h-4" />
                },
                {
                  label: "Monthly Statistics",
                  path: "/dashboard/Analytics/monthly-statistics",
                  icon: <PieChart className="w-4 h-4" />
                },
              ],
            },
            {
              icon: <FileText className="w-5 h-5" />,
              label: "Reports",
              path: "/dashboard/reports",
              expandable: true,
              roles: ["admin", "superadmin"],
              subItems: [
                {
                  label: "Transaction Report",
                  path: "/dashboard/reports/transaction-report",
                  icon: <ArrowUpDown className="w-4 h-4" />
                },
                {
                  label: "Payout Report",
                  path: "/dashboard/reports/payout-report",
                  icon: <CreditCard className="w-4 h-4" />
                },
                {
                  label: "Refund Report",
                  path: "/dashboard/reports/refund-report",
                  icon: <XCircle className="w-4 h-4" />
                },
              ],
            },
            {
              icon: <Search className="w-5 h-5" />,
              label: "Search & Lookup",
              path: "/dashboard/finance",
              expandable: true,
              roles: ["admin", "superadmin"],
              subItems: [
                {
                  label: "Search Transaction",
                  path: "/dashboard/finance/search-transaction",
                  icon: <ArrowUpDown className="w-4 h-4" />
                },
                {
                  label: "Search Payout",
                  path: "/dashboard/finance/search-payout",
                  icon: <CreditCard className="w-4 h-4" />
                },
                {
                  label: "Search Incoming",
                  path: "/dashboard/finance/search-incoming",
                  icon: <ArrowUpDown className="w-4 h-4" />
                },
                {
                  label: "Search Checkout",
                  path: "/dashboard/finance/search-checkout",
                  icon: <CreditCard className="w-4 h-4" />
                },
              ],
            },
          ],
        },

        // ADMINISTRATION
        {
          name: "Administration",
          items: [
            {
              icon: <Shield className="w-5 h-5" />,
              label: "Compliance",
              path: "/dashboard/compliance",
              roles: ["superadmin","admin"],
              expandable: true,
              subItems: [
                {
                  label: "Business Approval",
                  path: "/dashboard/compliance/merchant-approval",
                  icon: <UserCheck className="w-4 h-4" />
                }
              ],
            },
            {
              icon: <Users className="w-5 h-5" />,
              label: "Staff Management",
              path: "/dashboard/staff",
              roles: ["superadmin"],
              expandable: true,
              subItems: [
                {
                  label: "Team Members",
                  path: "/dashboard/settings/teams",
                  icon: <Users className="w-4 h-4" />
                }
              ],
            },
            {
              icon: <Wallet className="w-5 h-5" />,
              label: "Cashier Operations",
              path: "/dashboard/cashier",
              roles: ["superadmin"],
              expandable: true,
              subItems: [
                {
                  label: "Payout Cashier",
                  path: "/dashboard/cashier/payout-cashier",
                  icon: <CreditCard className="w-4 h-4" />
                },
                {
                  label: "Deposit Cashier",
                  path: "/dashboard/cashier/deposit-cashier",
                  icon: <Wallet className="w-4 h-4" />
                },
              ],
            },
            {
              icon: <TrendingUp className="w-5 h-5" />,
              label: "Growth & Performance",
              path: "/dashboard/growth",
              expandable: true,
              roles: ["superadmin"],
              subItems: [
                {
                  label: "Merchant Performance",
                  path: "/dashboard/growth/merchant-performance",
                  icon: <BarChart3 className="w-4 h-4" />
                },
                {
                  label: "Fees Management",
                  path: "/dashboard/growth/fees-management",
                  icon: <DollarSign className="w-4 h-4" />
                },
              ],
            },
          ],
        },
      ],
      [userRole]
  );

  const accountItems: NavItem[] = [
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Settings",
      path: "/dashboard/settings/profile",
      roles: ["admin", "superadmin"],
      expandable: true,
      subItems: [
        {
          label: "Profile",
          path: "/dashboard/settings/profile",
          icon: <UserCog className="w-4 h-4" />
        },
        {
          label: "Audit Logs",
          path: "/dashboard/settings/audit-logs",
          icon: <Eye className="w-4 h-4" />
        },
        {
          label: "Departments",
          path: "/dashboard/settings/departments",
          icon: <Building2 className="w-4 h-4" />
        },
      ],
    },
  ];

  const isActive = (itemPath: string) =>
      pathname === itemPath || pathname.startsWith(`${itemPath}/`);

  const isParentActive = (item: NavItem) =>
      isActive(item.path) || (item.subItems && item.subItems.some((s) => isActive(s.path)));

  const toggleExpand = (label: string) =>
      setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleNavClick = (item: NavItem) => {
    if (item.expandable) {
      toggleExpand(item.label);
    } else {
      router.push(item.path as any);
    }
  };

  const NavRow = ({ item }: { item: NavItem }) => {
    const parentActive = isParentActive(item);
    const expanded = expandedItems[item.label];

    return (
        <div className="mb-1">
          {item.expandable ? (
              <button
                  className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      parentActive
                          ? isDarkMode
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-emerald-50 text-emerald-700"
                          : isDarkMode
                              ? "text-gray-300 hover:bg-white/5 hover:text-white"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  onClick={() => handleNavClick(item)}
                  aria-expanded={!!expanded}
              >
                {parentActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-emerald-500 rounded-r-full" />
                )}

                <span className="flex items-center gap-3 min-w-0">
              <span className="flex-shrink-0">
                {parentActive && item.activeIcon ? item.activeIcon : item.icon}
              </span>
              <span className="truncate text-sm font-medium">{item.label}</span>
            </span>

                <ChevronRight
                    className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`}
                />
              </button>
          ) : (
              <Link href={item.path as any}>
                <div
                    className={`group relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                        parentActive
                            ? isDarkMode
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-emerald-50 text-emerald-700"
                            : isDarkMode
                                ? "text-gray-300 hover:bg-white/5 hover:text-white"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  {parentActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-emerald-500 rounded-r-full" />
                  )}

                  <span className="flex items-center gap-3 min-w-0">
                <span className="flex-shrink-0">
                  {parentActive && item.activeIcon ? item.activeIcon : item.icon}
                </span>
                <span className="truncate text-sm font-medium">{item.label}</span>
              </span>
                </div>
              </Link>
          )}

          {item.expandable && (
              <div
                  className={`ml-4 overflow-hidden transition-[max-height,opacity] duration-300 ${
                      expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
              >
                <div className="mt-1 pl-3 border-l border-gray-200 dark:border-white/10 space-y-0.5">
                  {item.subItems?.map((s) => {
                    const active = isActive(s.path);
                    return (
                        <Link key={s.path} href={s.path as any}>
                    <span
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-all ${
                            active
                                ? isDarkMode
                                    ? "text-emerald-300 bg-emerald-500/10"
                                    : "text-emerald-700 bg-emerald-50"
                                : isDarkMode
                                    ? "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                      {s.icon && <span className="flex-shrink-0">{s.icon}</span>}
                      <span className="truncate">{s.label}</span>
                    </span>
                        </Link>
                    );
                  })}
                </div>
              </div>
          )}
        </div>
    );
  };

  return (
      <>
        {/* Mobile Toggle */}
        <button
            className="md:hidden fixed top-4 left-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg shadow-lg transition-all"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <aside
            className={`fixed md:relative top-0 left-0 z-40 h-screen w-68 md:w-[18%] overflow-y-auto px-3 py-3
        transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isDarkMode ? "bg-[#0F1719] border-r border-white/10" : "bg-white border-r border-gray-200"}`}
        >
          {/* User Profile */}
          <div
              className={`flex items-center justify-between w-full rounded-lg p-3 mb-6 ${
                  isDarkMode ? "bg-white/5" : "bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-500 text-white text-sm font-semibold">
              {(authState.userDetails?.name?.[0] || "U").toUpperCase()}
            </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                  {authState.userDetails?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
              </div>
            </div>
            <ChevronIcon className="-rotate-90 opacity-60" stroke="currentColor" />
          </div>

          {/* Department Navigation */}
          <div className="space-y-6">
            {departments.map((department) => {
              const visibleItems = department.items.filter(
                  (item) => !item.roles || item.roles.includes(userRole)
              );

              if (visibleItems.length === 0) return null;

              return (
                  <div key={department.name}>
                    <div className="px-1 py-2 text-xs mb-3 tracking-wider uppercase text-gray-500 dark:text-gray-400 font-semibold">
                      {department.name}
                    </div>
                    <nav className="space-y-1">
                      {visibleItems.map((item) => (
                          <NavRow key={item.label} item={item} />
                      ))}
                    </nav>
                  </div>
              );
            })}
          </div>

          {/* Account Section */}
          <div className="mt-8">
            <div className="px-1 py-2 text-xs mb-3 tracking-wider uppercase text-gray-500 dark:text-gray-400 font-semibold">
              Account
            </div>
            <nav className="space-y-1">
              {accountItems.map((item) => (
                  <NavRow key={item.label} item={item} />
              ))}

              <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 rounded-lg mt-4 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={logout}
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
            <div
                className="fixed inset-0 bg-black/40 md:hidden z-30"
                onClick={() => setSidebarOpen(false)}
            />
        )}
      </>
  );
};

export default Sidebar;
