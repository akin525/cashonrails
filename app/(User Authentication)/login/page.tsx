"use client"
import { useState } from "react";
import FormInputs, { FormPassword } from "@/components/formInputs/formInputs";
import axiosInstance, { handleAxiosError } from "@/helpers/axiosInstance";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";
import Buttons from "@/components/buttons";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/authContext";
import { checkInputLengthValidity, checkEmailInputValidity, checkPasswordValidity } from "@/helpers/formInputValidator";
import CarouselSlickSlider from "@/components/carouselSlickSlider";
import toast from "react-hot-toast";


export default function Login() {
    const router = useRouter();
    const { authState, dispatch } = useAuth();
    const [loginPayload, setLoginPayload] = useState({
        email: '', password: ''
    })

    // Validate Payload
    const validatePayload = () => {
        if (!loginPayload.email || !loginPayload.password) {
            return false
        }
        return true
    }

    // Get Device Name
    const getDeviceName = () => {
        const userAgent = navigator.userAgent;

        // Optional: Parse userAgent for more specific device information
        if (/Android/i.test(userAgent)) {
            return "Android Device";
        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
            return "iOS Device";
        } else if (/Windows NT/i.test(userAgent)) {
            return "Windows PC";
        } else if (/Macintosh/i.test(userAgent)) {
            return "Mac";
        } else {
            return "Unknown Device";
        }
    };

    // Handle Login
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const handleLogin = async () => {
        try {
            if (!validatePayload()) {
                return toast.error('Please enter email and password');
            };

            setIsLoginLoading(true);

            const response = await axiosInstance.post<any>('/login', {
                email: loginPayload.email,
                password: loginPayload.password,
                // device_name: getDeviceName()
            })
            console.log("response", response.data)
            if (!response?.data?.status) {
                return toast.error(response?.data?.message || 'Login failed');
            }

            toast.success('Login successful'); // Login successful

            const loginDetail = response?.data?.data as {
                email: string; 
                name: string; 
                phone: any; 
                status: string;
                id: number;
                username: string;
            };

            // fetch user details
            const fetchSingleAdmin = await axiosInstance.get<any>(`/admin-users/${loginDetail.id}`, {
                headers:{
                    Authorization: `Bearer ${response.data.token}`
                }
            })
            console.log("fetchSingleAdmin", fetchSingleAdmin.data)
            if (!fetchSingleAdmin?.data?.status) {
                return toast.error(fetchSingleAdmin?.data?.message || 'Error Fetching data');
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

            const adminData: AdminData = fetchSingleAdmin.data.data;
            // Set the user data
            dispatch({
                type: 'SET_USER_DETAILS',
                payload: {
                    userDetails: {
                        id: adminData.id,
                        name: adminData.name,
                        username: adminData.username,
                        email: adminData.email,
                        phone: adminData.phone,
                        image: adminData.image,
                        address: adminData.address,
                        city: adminData.city,
                        state: adminData.state,
                        role: adminData.role,
                        adminRoles: adminData.admin_roles,
                        status: adminData.status,
                        loginTime: adminData.login_time,
                        passChanged: adminData.pass_changed,
                        viewUser: adminData.view_user,
                        manageUser: adminData.manage_user,
                        viewAdmin: adminData.view_admin,
                        reporting: adminData.reporting,
                        viewTransaction: adminData.view_transaction,
                        manageTransaction: adminData.manage_transaction,
                        viewPayout: adminData.view_payout,
                        managePayout: adminData.manage_payout,
                        manageFees: adminData.manage_fees,
                        viewSettlement: adminData.view_settlement,
                        viewRefund: adminData.view_refund,
                        manageRefund: adminData.manage_refund,
                        viewKyc: adminData.view_kyc,
                        manageKyc: adminData.manage_kyc,
                        createdAt: adminData.created_at,
                        updatedAt: adminData.updated_at
                    },
                    token: response?.data?.token || ''
                }
            })
            // Redirect to select business page
            return router.push('/dashboard/overview');
        } catch (error: any) {
            console.log("error", error)
            handleAxiosError(error, (data: any) => {
                return toast.error(data?.message);
            })
            return toast.error(error?.message);
        } finally {
            setIsLoginLoading(false)
        }
    }

    const CarouselList = [
        {
            heading: 'Hey! Welcome Back to Cashonrails<',
            description: <>Your trusted payment gateway for fast, easy, and secure <br></br> transactions—seamless payments, every time.</>,
            image: '/assets/img/auth-slide-0.png'
        },
        {
            heading: 'Share your interests',
            description: <>Your trusted payment gateway for fast, easy, and secure <br></br> transactions—seamless payments, every time.</>,
            image: '/assets/img/auth-slide-1.png'
        },
        {
            heading: 'Share your interests',
            description: <>Your trusted payment gateway for fast, easy, and secure <br></br> transactions—seamless payments, every time.</>,
            image: '/assets/img/auth-slide-2.png'
        }
    ]

    return (
        <main className="w-full grid grid-cols-1 lg:grid-cols-2 h-screen">
            <div className="w-full lg:max-w-[31rem] mx-auto flex justify-center items-center p-3">
                <div>
                    <div className="flex justify-center mb-10">
                        <Logo width={60} height={60} fillColor="#000000" />
                    </div>

                    <h4 className="font-semibold text-2xl tracking-tight">Login to your account</h4>
                    <p className="text-sm font-light text-[#000000ad]">Log in to manage payments and track your transactions.</p>

                    <div className="flex flex-col gap-y-4 mt-6">
                        <FormInputs
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="Enter your Email Address"
                            validationFunc={(val) => checkEmailInputValidity(val)}
                            setPayloadValues={setLoginPayload}
                        />

                        <div>
                            <FormPassword
                                label="Password"
                                name="password"
                                placeholder="Enter your Password"
                                // validationFunc={(val) => checkPasswordValidity(val)}
                                setPayloadValues={setLoginPayload}
                            />

                            <Link href="/">
                                <p className="text-right text-[#009569] text-sm mt-3">Forgot Password?</p>
                            </Link>
                        </div>

                        <Buttons
                            onClick={handleLogin}
                            loading={isLoginLoading ? 'Logging in...' : ''}
                            disabled={!validatePayload()} type="mdPrimaryButton" label="Login"
                            fullWidth={true}
                        />

                    </div>
                </div>
            </div>

            <div className="hidden lg:block overflow-hidden">
                <CarouselSlickSlider slidesToShow={1} slidesToScroll={1} autoPlay={true} speed={400} >
                    {
                        CarouselList.map((item, i) => (
                            <div key={i} className="relative">
                                <div className="absolute top-0 left-0 w-full h-full z-10 flex flex-col justify-end items-center text-white" style={{
                                    background: 'linear-gradient(0deg, rgba(0,0,0,1) 2%, rgba(255,255,255,0) 90%)'
                                }}>
                                    <div className="flex flex-col justify-center mb-16">
                                        <h4 className="text-2xl font-medium">{item.heading}</h4>
                                        <p className="font-light text-sm text-center text-[#ffffffc8] pt-1">
                                            {item.description}
                                        </p>

                                        <div className="inline-flex gap-x-1.5 justify-center items-center mt-14">
                                            {Array.from({ length: 3 }).map((_, j) => (
                                                <span key={j} className={`${j === i ? ' bg-white  ' : '  '} w-2.5 h-2.5 border rounded-full`}></span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-screen"
                                    style={{
                                        backgroundImage: `url(${item.image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}>
                                </div>
                            </div>
                        ))
                    }
                </CarouselSlickSlider>
            </div>
        </main>
    )
}