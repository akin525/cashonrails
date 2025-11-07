"use client";
import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronDown,
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
  Sparkles,
  Zap,
  Crown,
  Home,
  Layers,
} from "lucide-react";

// Types
interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  expandable?: boolean;
  subItems?: { label: string; path: string; icon?: React.ReactNode }[];
  roles?: string[];
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
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

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    router.replace("/login");
  };

  const navSections: NavSection[] = useMemo(
      () => [
        {
          title: "Dashboard",
          items: [
            {
              icon: <Home className="w-4 h-4" />,
              label: "Overview",
              path: "/dashboard/overview",
              badge: "New",
              badgeColor: "blue",
            },
            {
              icon: <PieChart className="w-4 h-4" />,
              label: "Board Analytics",
              path: "/dashboard/overviewNew",
            },
            {
              icon: <Activity className="w-4 h-4" />,
              label: "System Analytics",
              path: "/dashboard/overview2",
            },
          ],
        },
        {
          title: "Operations",
          items: [
            {
              icon: <Briefcase className="w-4 h-4" />,
              label: "Business Management",
              path: "/dashboard/operations",
              expandable: true,
              subItems: [
                { label: "Business Overview", path: "/dashboard/operations/merchant-overview", icon: <Eye className="w-3 h-3" /> },
                { label: "Business Directory", path: "/dashboard/operations/merchant", icon: <Building2 className="w-3 h-3" /> },
                { label: "Merchant List", path: "/dashboard/operations/users", icon: <Users className="w-3 h-3" /> },
                { label: "Virtual Accounts", path: "/dashboard/operations/virtual-accounts", icon: <CreditCard className="w-3 h-3" /> },
                { label: "Transfer Bucket", path: "/dashboard/operations/transfer-bucket", icon: <ArrowUpDown className="w-3 h-3" /> },
                { label: "Resolve Transaction", path: "/dashboard/operations/resolve-transaction", icon: <AlertTriangle className="w-3 h-3" /> },
              ],
            },
            {
              icon: <Store className="w-4 h-4" />,
              label: "Storefronts",
              path: "/dashboard/storefronts",
              roles: ["admin", "superadmin"],
            },
            {
              icon: <Mail className="w-4 h-4" />,
              label: "Communications",
              path: "/dashboard/operations/compose-email",
            },
          ],
        },
        {
          title: "Finance",
          items: [
            {
              icon: <DollarSign className="w-4 h-4" />,
              label: "Finance",
              path: "/dashboard/finance",
              expandable: true,
              roles: ["admin", "superadmin"],
              subItems: [
                { label: "Export Per Business", path: "/dashboard/finance/getbusiness", icon: <FileText className="w-3 h-3" /> },
                { label: "Transactions", path: "/dashboard/finance/transactions", icon: <ArrowUpDown className="w-3 h-3" /> },
                { label: "Transfers", path: "/dashboard/finance/transfers", icon: <ArrowUpDown className="w-3 h-3" /> },
                { label: "Settlements", path: "/dashboard/finance/settlements", icon: <CheckCircle className="w-3 h-3" /> },
                { label: "Chargebacks", path: "/dashboard/finance/chargebacks", icon: <XCircle className="w-3 h-3" /> },
                { label: "Checkouts", path: "/dashboard/finance/checkout", icon: <CreditCard className="w-3 h-3" /> },
                { label: "Wallet Transactions", path: "/dashboard/finance/wallet-transactions", icon: <Wallet className="w-3 h-3" /> },
                { label: "Incoming Transfers", path: "/dashboard/finance/inbound-transfers", icon: <ArrowUpDown className="w-3 h-3" /> },
                { label: "Unsettled Transactions", path: "/dashboard/finance/unsettled-transactions", icon: <Clock className="w-3 h-3" /> },
              ],
            },
            {
              icon: <CreditCard className="w-4 h-4" />,
              label: "Payouts",
              path: "/dashboard/payouts",
              expandable: true,
              roles: ["admin", "superadmin"],
              subItems: [
                { label: "All Payouts", path: "/dashboard/finance/payouts", icon: <CheckCircle className="w-3 h-3" /> },
                { label: "Pending Payouts", path: "/dashboard/finance/pending-payouts", icon: <Clock className="w-3 h-3" /> },
                { label: "Failed Payouts", path: "/dashboard/finance/failed-payouts", icon: <XCircle className="w-3 h-3" /> },
              ],
            },
            {
              icon: <Building2 className="w-4 h-4" />,
              label: "NETMFB Banking",
              path: "/dashboard/netmfb",
              expandable: true,
              subItems: [
                { label: "Account Summary", path: "/dashboard/netmfb/summary", icon: <BarChart3 className="w-3 h-3" /> },
                { label: "Bank Statement", path: "/dashboard/netmfb/statement", icon: <FileText className="w-3 h-3" /> },
                { label: "Bank Transfer", path: "/dashboard/netmfb/transfer", icon: <ArrowUpDown className="w-3 h-3" /> },
              ],
            },
          ],
        },
        {
          title: "Intelligence",
          items: [
            {
              icon: <BarChart3 className="w-4 h-4" />,
              label: "Analytics",
              path: "/dashboard/analytics",
              roles: ["admin", "superadmin"],
              expandable: true,
              subItems: [
                { label: "System Calculator", path: "/dashboard/Analytics/system-calculator", icon: <Calculator className="w-3 h-3" /> },
                { label: "Virtual Account Stats", path: "/dashboard/Analytics/virtual-account", icon: <CreditCard className="w-3 h-3" /> },
                { label: "Daily Statistics", path: "/dashboard/Analytics/system-statistics", icon: <Activity className="w-3 h-3" /> },
                { label: "Monthly Statistics", path: "/dashboard/Analytics/monthly-statistics", icon: <PieChart className="w-3 h-3" /> },
              ],
            },
            {
              icon: <FileText className="w-4 h-4" />,
              label: "Reports",
              path: "/dashboard/reports",
              expandable: true,
              roles: ["admin", "superadmin"],
              subItems: [
                { label: "Transaction Report", path: "/dashboard/reports/transaction-report", icon: <ArrowUpDown className="w-3 h-3" /> },
                { label: "Payout Report", path: "/dashboard/reports/payout-report", icon: <CreditCard className="w-3 h-3" /> },
                { label: "Refund Report", path: "/dashboard/reports/refund-report", icon: <XCircle className="w-3 h-3" /> },
              ],
            },
            {
              icon: <Search className="w-4 h-4" />,
              label: "Search & Lookup",
              path: "/dashboard/finance",
              expandable: true,
              roles: ["admin", "superadmin"],
              subItems: [
                { label: "Search Transaction", path: "/dashboard/finance/search-transaction", icon: <ArrowUpDown className="w-3 h-3" /> },
                { label: "Search Payout", path: "/dashboard/finance/search-payout", icon: <CreditCard className="w-3 h-3" /> },
                { label: "Search Incoming", path: "/dashboard/finance/search-incoming", icon: <ArrowUpDown className="w-3 h-3" /> },
                { label: "Search Checkout", path: "/dashboard/finance/search-checkout", icon: <CreditCard className="w-3 h-3" /> },
              ],
            },
          ],
        },
        {
          title: "Administration",
          items: [
            {
              icon: <Shield className="w-4 h-4" />,
              label: "Compliance",
              path: "/dashboard/compliance",
              roles: ["superadmin", "admin"],
              expandable: true,
              subItems: [
                { label: "Business Approval", path: "/dashboard/compliance/merchant-approval", icon: <UserCheck className="w-3 h-3" /> },
              ],
            },
            {
              icon: <Users className="w-4 h-4" />,
              label: "Staff Management",
              path: "/dashboard/staff",
              expandable: true,
              subItems: [
                { label: "Team Members", path: "/dashboard/settings/teams", icon: <Users className="w-3 h-3" /> },
              ],
            },
            {
              icon: <Wallet className="w-4 h-4" />,
              label: "Cashier Operations",
              path: "/dashboard/cashier",
              expandable: true,
              subItems: [
                { label: "Payout Cashier", path: "/dashboard/cashier/payout-cashier", icon: <CreditCard className="w-3 h-3" /> },
                { label: "Deposit Cashier", path: "/dashboard/cashier/deposit-cashier", icon: <Wallet className="w-3 h-3" /> },
              ],
            },
            {
              icon: <TrendingUp className="w-4 h-4" />,
              label: "Growth & Performance",
              path: "/dashboard/growth",
              expandable: true,
              subItems: [
                { label: "Merchant Performance", path: "/dashboard/growth/merchant-performance", icon: <BarChart3 className="w-3 h-3" /> },
                { label: "Fees Management", path: "/dashboard/growth/fees-management", icon: <DollarSign className="w-3 h-3" /> },
              ],
            },
            {
              icon: <Settings className="w-4 h-4" />,
              label: "Settings",
              path: "/dashboard/settings/profile",
              roles: ["admin", "superadmin"],
              expandable: true,
              subItems: [
                { label: "Profile", path: "/dashboard/settings/profile", icon: <UserCog className="w-3 h-3" /> },
                { label: "Audit Logs", path: "/dashboard/settings/audit-logs", icon: <Eye className="w-3 h-3" /> },
                { label: "Departments", path: "/dashboard/settings/departments", icon: <Building2 className="w-3 h-3" /> },
              ],
            },
          ],
        },
      ],
      [userRole]
  );

  const isActive = (itemPath: string) => pathname === itemPath || pathname.startsWith(`${itemPath}/`);

  const isParentActive = (item: NavItem) =>
      isActive(item.path) || (item.subItems && item.subItems.some((s) => isActive(s.path)));

  const toggleExpand = (label: string) => setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleNavClick = (item: NavItem) => {
    if (item.expandable) {
      toggleExpand(item.label);
    } else {
      router.push(item.path as any);
    }
  };

  const getBadgeStyles = (color?: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "green":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "red":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    }
  };

  const NavRow = ({ item }: { item: NavItem }) => {
    const parentActive = isParentActive(item);
    const expanded = expandedItems[item.label];

    return (
        <div>
          {item.expandable ? (
              <button
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      parentActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                  }`}
                  onClick={() => handleNavClick(item)}
              >
            <span className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className={`${parentActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`}>
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
              {item.badge && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${getBadgeStyles(item.badgeColor)}`}>
                  {item.badge}
                </span>
              )}
            </span>
                <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`} />
              </button>
          ) : (
              <Link href={item.path as any}>
                <div
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                        parentActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
                    }`}
                >
              <span className={`${parentActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}`}>
                {item.icon}
              </span>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded flex-shrink-0 ${getBadgeStyles(item.badgeColor)}`}>
                  {item.badge}
                </span>
                  )}
                </div>
              </Link>
          )}

          {item.expandable && expanded && (
              <div className="mt-1 ml-6 pl-3 border-l border-gray-200 dark:border-gray-700 space-y-0.5">
                {item.subItems?.map((s) => {
                  const active = isActive(s.path);
                  return (
                      <Link key={s.path} href={s.path as any}>
                        <div
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                                active
                                    ? "text-emerald-700 bg-emerald-50/50 dark:text-emerald-400 dark:bg-emerald-900/10"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/30"
                            }`}
                        >
                          {s.icon && <span className="flex-shrink-0">{s.icon}</span>}
                          <span className="truncate">{s.label}</span>
                        </div>
                      </Link>
                  );
                })}
              </div>
          )}
        </div>
    );
  };

  return (
      <>
        {/* Mobile Toggle */}
        <button
            className="md:hidden fixed top-4 left-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg shadow-lg transition-all"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar */}
        <aside
            className={`fixed md:relative top-0 left-0 z-40 h-screen w-72 md:w-[280px] transition-transform duration-300
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isDarkMode ? "bg-gray-900" : "bg-white"} border-r ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              {/* Logo */}
              {/*<div className="flex items-center gap-3 mb-4">*/}
              {/*  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">*/}
              {/*    <Layers className="w-5 h-5 text-white" />*/}
              {/*  </div>*/}
              {/*  <div>*/}
              {/*    <h1 className="text-base font-bold text-gray-900 dark:text-white">NinjaTech</h1>*/}
              {/*    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">Admin Portal</p>*/}
              {/*  </div>*/}
              {/*</div>*/}

              {/* User Profile */}
              <div className={`flex items-center gap-3 p-2.5 rounded-lg ${isDarkMode ? "bg-gray-800/50" : "bg-gray-50"}`}>
                <div className="relative">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(authState.userDetails?.name?.[0] || "U").toUpperCase()}
                  </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-gray-900 dark:text-white">
                    {authState.userDetails?.name || "User"}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {navSections.map((section) => {
                const visibleItems = section.items.filter(
                    (item) => !item.roles || item.roles.includes(userRole)
                );

                if (visibleItems.length === 0) return null;

                return (
                    <div key={section.title}>
                      <h3 className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {section.title}
                      </h3>
                      <nav className="space-y-0.5">
                        {visibleItems.map((item) => (
                            <NavRow key={item.label} item={item} />
                        ))}
                      </nav>
                    </div>
                );
              })}
            </div>

            {/* Footer - Logout */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800">
              <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-all"
                  onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
            <div
                className="fixed inset-0 bg-black/50 md:hidden z-30 transition-opacity"
                onClick={() => setSidebarOpen(false)}
            />
        )}

        <style jsx global>{`
        /* Custom Scrollbar */
        aside::-webkit-scrollbar {
          width: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
      </>
  );
};

export default Sidebar;
