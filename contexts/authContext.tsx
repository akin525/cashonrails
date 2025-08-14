"use client"
import { createContext, useContext, useEffect, useReducer } from "react";
import { AuthStateType, AuthActionTypes } from "@/contexts/reducerTypes";
import { initialState, authReducer } from "@/contexts/authReducer";
import { encryptData, decryptData } from "@/helpers/extras";
import { useRouter, usePathname } from "next/navigation";
import { UIProvider } from "./uiContext";
import ThemeSwitcher from "@/components/utils";

const AuthContext = createContext<{
    authState: AuthStateType;
    dispatch: React.Dispatch<AuthActionTypes>;
} | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const protectedRoutes = ['/dashboard'];
    // const protectedRoutes = ['/kyc', '/select-business'];

    const [authState, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const currentLiveTestMode = localStorage.getItem("crmode") as 'live' | 'test';
        const currentUserData = localStorage.getItem("cr_usr_data");
        const currentBusinessData = localStorage.getItem("cr_bus_data");

        // Update the mode
        const updateMode = () => {
            dispatch({
                type: "SWITCH_MODE",
                payload: {
                    mode: (currentLiveTestMode === 'live' || currentLiveTestMode === 'test') ? currentLiveTestMode : 'live',
                }
            });
        };

        // Update User Data
        const updateUserData = () => {
            if (currentUserData) {
                const decryptedUserData = decryptData(currentUserData);

                console.log("decryptedUserData", decryptedUserData)

                if (decryptedUserData) {
                    dispatch({
                        type: "SET_USER_DETAILS",
                        payload: {
                            userDetails: decryptedUserData.userDetails,
                            token: decryptedUserData.token
                        }
                    });
                } else {
                    // Logout user if not logged in
                    if (protectedRoutes.some(route => pathname.startsWith(route))) {
                        dispatch({ type: "LOGOUT" });
                        router.push('/login');
                    }
                }
            } else {
                // If no user data, logout
                if (protectedRoutes.some(route => pathname.startsWith(route))) {
                    dispatch({ type: "LOGOUT" });
                    router.push('/login');
                }
            }
        };

        // Update Business Data
        const updateBusinessData = () => {
            if (currentBusinessData) {
                const decryptedBusinessData = decryptData(currentBusinessData);
                if (decryptedBusinessData) {
                    dispatch({
                        type: "SET_BUSINESS_DETAILS",
                        payload: {
                            businessID: decryptedBusinessData.businessID,
                            businessDetails: decryptedBusinessData.businessDetails,
                        }
                    });
                } else {
                    // Logout user if not logged in
                    if (protectedRoutes.some(route => pathname.startsWith(route))) {
                        dispatch({ type: "LOGOUT" });
                        router.push('/login');
                    }
                }
            }
        };

        updateMode(); // Update the mode
        updateUserData(); // Update the user data
        updateBusinessData(); // Update the business data
    }, [dispatch, pathname]); // Add dependencies to re-run effect when dispatch or pathname changes

    return (
        <UIProvider>
            <AuthContext.Provider value={{ authState, dispatch }}>
                <div className="relative">
                    {children}
                    <span className='absolute z-[9999] pl-10 ml-4 left-10 bottom-4'>
                        <ThemeSwitcher />
                    </span>
                </div>
            </AuthContext.Provider>
        </UIProvider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};