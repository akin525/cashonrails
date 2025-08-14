// export type UserDetailsType = {
//     id: any; // User ID
//     name: string; // User's first name
//     username: string;
//     email: string; // Verification status
// };

export interface UserDetailsType{
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
    adminRoles: null;
    status: number;
    loginTime: null;
    passChanged: string;
    viewUser: number;
    manageUser: number;
    viewAdmin: number;
    reporting: number;
    viewTransaction: number;
    manageTransaction: number;
    viewPayout: number;
    managePayout: number;
    manageFees: number;
    viewSettlement: number;
    viewRefund: number;
    manageRefund: number;
    viewKyc: number;
    manageKyc: number;
    createdAt: null;
    updatedAt: string;
}


export type BusinessDetailsType = {
    businessId: string; // Business ID from the system
    businessName: string; // Name of the business
    tradeName: string; // Trade name of the business
    businessCountry: string;
    businessCountryIsoName: string;
    businessRCNumber: string | null; // Registration number (nullable)
    businessType: string; // Type of business
    description: string | null; // Description of the business (nullable)
    industry: string; // Industry type
    authMode: AuthMode;
    brandName: string;
    supportEmail: string | null;
    website: string | null; 
    supportPhone: string | null;
    kycStatus: 'submitted' | 'unsubmitted' | 'approved' | 'rejected',
    status: 'active' | 'inactive' | 'pending'
};

export type AuthMode = "pin" | "otp"

export type AuthStateType = {
    userDetails: UserDetailsType | null; // User details (nullable)
    businessDetails: BusinessDetailsType | null; // Business details (nullable)
    token: string; // Authentication token
    businessID: string; // Business ID
    mode: 'live' | 'test'; // Mode of operation
};


export type AuthActionTypes = (
    {
        type: "SET_USER_DETAILS";
        payload: {
            userDetails: AuthStateType['userDetails'];
            token: AuthStateType['token'];
        }
    } | {
        type: "LOGOUT";
    } | {
        type: "SET_BUSINESS_DETAILS";
        payload: {
            businessID: AuthStateType['businessID'];
            businessDetails: AuthStateType['businessDetails'];
        }
    } | {
        type: "SWITCH_MODE";
        payload: {
            mode: AuthStateType['mode'];
        }
    }
)