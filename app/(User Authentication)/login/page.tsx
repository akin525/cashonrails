"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye,
    EyeOff,
    Loader2,
    LogIn,
    ShieldCheck,
    Lock,
    CheckCircle2,
    Moon,
    Sun,
    Sparkles,
    TrendingUp,
    Users,
    Activity
} from "lucide-react";
import toast from "react-hot-toast";

import Logo from "@/components/logo";
import axiosInstance, { handleAxiosError } from "@/helpers/axiosInstance";
import { useAuth } from "@/contexts/authContext";

/* API response types */
interface LoginResponse {
    status: boolean;
    message?: string;
    token?: string;
    data?: {
        id: number;
        email: string;
        name: string;
        phone: string | null;
        status: string;
        username: string;
    };
}

interface AdminData {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    image: string;
    address: string;
    city: string;
    state: string;
    role: string;
    admin_roles: null;
    status: number;
    login_time: null;
    pass_changed: string;
    view_user: number;
    manage_user: number;
    view_admin: number;
    reporting: number;
    view_transaction: number;
    manage_transaction: number;
    view_payout: number;
    manage_payout: number;
    manage_fees: number;
    view_settlement: number;
    view_refund: number;
    manage_refund: number;
    view_kyc: number;
    manage_kyc: number;
    created_at: null;
    updated_at: string;
}

export default function AdminLogin() {
    const router = useRouter();
    const { dispatch } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [remember, setRemember] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [isDark, setIsDark] = useState(false);

    // Dark mode initialization
    useEffect(() => {
        const theme = localStorage.getItem('theme') || 'light';
        setIsDark(theme === 'dark');
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, []);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setIsDark(!isDark);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const validate = () => {
        const next: typeof errors = {};
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) next.email = "Email is required";
        else if (!emailRx.test(email.trim())) next.email = "Enter a valid email address";
        if (!password.trim()) next.password = "Password is required";
        else if (password.length < 6) next.password = "Must be at least 6 characters";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            // 1) Login
            const res = await axiosInstance.post<LoginResponse>("/login", {
                email: email.trim(),
                password,
            });

            if (!res?.data?.status || !res.data.token || !res.data.data) {
                toast.error(res?.data?.message || "Login failed");
                return;
            }

            const token = res.data.token;
            const user = res.data.data;

            // 2) Fetch Admin Profile
            const adminRes = await axiosInstance.get<{ status: boolean; data: AdminData; message?: string }>(
                `/admin-users/${user.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!adminRes?.data?.status || !adminRes.data.data) {
                toast.error(adminRes?.data?.message || "Failed to fetch profile");
                return;
            }

            const admin = adminRes.data.data;

            // 3) ENFORCE ADMIN-ONLY ACCESS
            const role = (admin.role || "").toLowerCase();
            const isAdmin =
                ["admin", "superadmin", "super_admin", "administrator"].includes(role) ||
                admin.view_admin === 1 || admin.manage_user === 1 || admin.manage_transaction === 1;

            if (!isAdmin) {
                toast.error("Access restricted. Admins only.");
                return;
            }

            // 4) Save to Auth Context
            dispatch({
                type: "SET_USER_DETAILS",
                payload: {
                    userDetails: {
                        id: admin.id,
                        name: admin.name,
                        username: admin.username,
                        email: admin.email,
                        phone: admin.phone,
                        image: admin.image,
                        address: admin.address,
                        city: admin.city,
                        state: admin.state,
                        role: admin.role,
                        adminRoles: admin.admin_roles,
                        status: admin.status,
                        loginTime: admin.login_time,
                        passChanged: admin.pass_changed,
                        viewUser: admin.view_user,
                        manageUser: admin.manage_user,
                        viewAdmin: admin.view_admin,
                        reporting: admin.reporting,
                        viewTransaction: admin.view_transaction,
                        manageTransaction: admin.manage_transaction,
                        viewPayout: admin.view_payout,
                        managePayout: admin.manage_payout,
                        manageFees: admin.manage_fees,
                        viewSettlement: admin.view_settlement,
                        viewRefund: admin.view_refund,
                        manageRefund: admin.manage_refund,
                        viewKyc: admin.view_kyc,
                        manageKyc: admin.manage_kyc,
                        createdAt: admin.created_at,
                        updatedAt: admin.updated_at,
                    },
                    token,
                },
            });

            toast.success(`Welcome back, ${admin.name}!`);
            router.replace("/dashboard/overview");
        } catch (error: any) {
            handleAxiosError(error, (data: any) => {
                return typeof data?.message === "string" && data.message
                    ? toast.error(data.message)
                    : toast.error("Login failed");
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 transition-colors duration-300">
            {/* Animated Background */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                {/* Light mode gradients */}
                <div className="absolute -top-24 -left-24 h-[40rem] w-[40rem] rounded-full blur-3xl opacity-20 dark:opacity-10
                                bg-gradient-to-br from-green-400 to-emerald-300 animate-pulse"
                     style={{ animationDuration: '8s' }} />
                <div className="absolute top-1/2 -right-32 h-[35rem] w-[35rem] rounded-full blur-3xl opacity-20 dark:opacity-10
                                bg-gradient-to-bl from-blue-400 to-cyan-300 animate-pulse"
                     style={{ animationDuration: '10s', animationDelay: '2s' }} />
                <div className="absolute -bottom-32 left-1/4 h-[30rem] w-[30rem] rounded-full blur-3xl opacity-15 dark:opacity-10
                                bg-gradient-to-tr from-purple-400 to-pink-300 animate-pulse"
                     style={{ animationDuration: '12s', animationDelay: '4s' }} />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
                                bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]" />
            </div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700
                           hover:scale-110 transition-all duration-300 group"
                aria-label="Toggle theme"
            >
                {isDark ? (
                    <Sun className="h-5 w-5 text-yellow-500 group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                    <Moon className="h-5 w-5 text-gray-700 group-hover:-rotate-12 transition-transform duration-300" />
                )}
            </button>

            <div className="grid grid-cols-1 xl:grid-cols-2 min-h-screen">
                {/* Left: Brand / Hero Section */}
                <section className="relative hidden xl:flex items-center justify-center p-10 lg:p-16">
                    <div className="relative w-full max-w-2xl">
                        {/* Main Card */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/30
                                        bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900
                                        p-10 lg:p-12 transform hover:scale-[1.02] transition-transform duration-500">
                            {/* Glassmorphism overlay */}
                            <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm" />

                            {/* Floating shapes */}
                            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"
                                 style={{ animationDuration: '6s' }} />
                            <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"
                                 style={{ animationDuration: '8s', animationDelay: '2s' }} />

                            <div className="relative z-10 text-white space-y-8">
                                {/* Logo & Title */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                            <Logo width={40} height={40} fillColor="#ffffff" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold tracking-tight">Cashonrails</h2>
                                            <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 text-xs font-medium rounded-full
                                                           bg-white/20 border border-white/30 backdrop-blur-sm">
                                                <Sparkles className="w-3 h-3" />
                                                Admin Portal
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Headline */}
                                <div className="space-y-4">
                                    <h3 className="text-4xl lg:text-5xl font-bold leading-tight">
                                        Command center for
                                        <span className="block mt-2 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                                            modern finance
                                        </span>
                                    </h3>
                                    <p className="text-lg text-white/90 leading-relaxed">
                                        Powerful tools, real-time insights, and enterprise-grade security—all in one place.
                                    </p>
                                </div>

                                {/* Features */}
                                <ul className="space-y-4">
                                    {[
                                        { icon: ShieldCheck, text: "Role-based access control with comprehensive audit trails" },
                                        { icon: Lock, text: "Bank-grade encryption and multi-layer security protocols" },
                                        { icon: CheckCircle2, text: "Real-time monitoring of transactions, payouts & settlements" },
                                    ].map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-4 group">
                                            <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                                                <feature.icon className="h-5 w-5 flex-shrink-0" />
                                            </div>
                                            <span className="text-sm leading-relaxed">{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 pt-6">
                                    {[
                                        { icon: Users, label: "Admin Only", sublabel: "Access" },
                                        { icon: Activity, label: "24/7", sublabel: "Monitoring" },
                                        { icon: TrendingUp, label: "99.9%", sublabel: "Uptime" },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="group relative rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-sm
                                                                  px-5 py-4 border border-white/20 hover:bg-white/20 transition-all duration-300
                                                                  hover:scale-105 hover:shadow-xl">
                                            <stat.icon className="w-6 h-6 mb-2 text-white/80 group-hover:text-white transition-colors" />
                                            <div className="text-2xl font-bold">{stat.label}</div>
                                            <div className="text-xs text-white/80">{stat.sublabel}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Text */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" />
                                Restricted to authorized administrators only
                            </p>
                        </div>
                    </div>
                </section>

                {/* Right: Login Form */}
                <section className="flex items-center justify-center px-6 py-12 lg:px-8">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="xl:hidden mb-8 text-center">
                            <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                                <Logo width={32} height={32} fillColor={isDark ? "#ffffff" : "#111827"} />
                                <div className="text-left">
                                    <div className="font-bold text-gray-900 dark:text-white">Cashonrails</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</div>
                                </div>
                            </div>
                        </div>

                        {/* Login Card */}
                        <div className="relative rounded-3xl border border-gray-200 dark:border-gray-700
                                        bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
                                        p-8 lg:p-10 shadow-2xl transform hover:shadow-3xl transition-all duration-300">
                            {/* Decorative gradient */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-t-3xl" />

                            {/* Header */}
                            <header className="mb-8 text-center space-y-2">
                                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full
                                               bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 mb-4">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                        Secure Admin Access
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Welcome back
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Sign in with your admin credentials to continue
                                </p>
                            </header>

                            {/* Form */}
                            <form onSubmit={onSubmit} noValidate className="space-y-6">
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            className={`w-full rounded-xl border-2 ${
                                                errors.email
                                                    ? 'border-red-500 dark:border-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400'
                                            } bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white
                                            placeholder:text-gray-400 dark:placeholder:text-gray-500
                                            focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-400/10
                                            transition-all duration-200`}
                                            placeholder="admin@cashonrails.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                                            }}
                                            aria-invalid={!!errors.email}
                                            aria-describedby={errors.email ? "email-error" : undefined}
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p id="email-error" className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                                            <span className="w-1 h-1 rounded-full bg-red-600" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Password
                                        </label>
                                        <Link
                                            href="/"
                                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300
                                                       hover:underline transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPw ? "text" : "password"}
                                            autoComplete="current-password"
                                            className={`w-full rounded-xl border-2 ${
                                                errors.password
                                                    ? 'border-red-500 dark:border-red-500'
                                                    : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400'
                                            } bg-gray-50 dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-white
                                            placeholder:text-gray-400 dark:placeholder:text-gray-500
                                            focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-400/10
                                            transition-all duration-200`}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                                            }}
                                            aria-invalid={!!errors.password}
                                            aria-describedby={errors.password ? "password-error" : undefined}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPw((v) => !v)}
                                            className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600
                                                       dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                            aria-label={showPw ? "Hide password" : "Show password"}
                                        >
                                            {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p id="password-error" className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                                            <span className="w-1 h-1 rounded-full bg-red-600" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center">
                                    <label className="inline-flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 rounded-md border-2 border-gray-300 dark:border-gray-600
                                                       text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                                                       dark:focus:ring-offset-gray-900 transition-all cursor-pointer"
                                            checked={remember}
                                            onChange={(e) => setRemember(e.target.checked)}
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                            Remember me for 30 days
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    aria-busy={submitting}
                                    className="group relative w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-4
                                             text-white font-semibold shadow-lg transition-all duration-300
                                             bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700
                                             dark:from-emerald-500 dark:to-green-500 dark:hover:from-emerald-600 dark:hover:to-green-600
                                             focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50 dark:focus-visible:ring-emerald-400/50
                                             disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-emerald-600 disabled:hover:to-green-600
                                             hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
                                             overflow-hidden"
                                >
                                    {/* Button shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                                    translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                                    {submitting ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden />
                                            <span>Sign in to Dashboard</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer Notice */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                    <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                                        <strong className="font-semibold">Admin access required.</strong>
                                        <span className="block mt-1 text-blue-700 dark:text-blue-300">
                                            If you don't have admin credentials, please contact your organization administrator.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Links */}
                        <div className="mt-8 text-center space-y-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Protected by enterprise-grade security
                            </p>
                            <div className="flex items-center justify-center gap-4 text-xs">
                                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    Privacy Policy
                                </Link>
                                <span className="text-gray-300 dark:text-gray-700">•</span>
                                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
