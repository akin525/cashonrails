"use client"
import { AuthStateType, AuthActionTypes } from "./reducerTypes";
import { encryptData, decryptData } from "@/helpers/extras";

export const initialState: AuthStateType = {
    userDetails: null,
    businessDetails: null,
    token: "",
    businessID: "",
    mode: "test",
};

export const authReducer = (state: AuthStateType, action: AuthActionTypes): AuthStateType => {
    switch (action.type) {
        case "SWITCH_MODE": {
            // Don't update if the new mode is the same as current state (not initialState)
            if (state.mode === action.payload.mode) {
                return state;
            }
            
            // Update localStorage and state
            localStorage.setItem("crmode", action.payload.mode);
            
            return {
                ...state,
                mode: action.payload.mode,
            };
        }
            
        case "SET_USER_DETAILS": {
            const userData = {
                userDetails: action.payload.userDetails,
                token: action.payload.token,
            };
            localStorage.setItem('cr_usr_data', encryptData(userData));

            return {
                ...state,
                userDetails: action.payload.userDetails,
                token: action.payload.token,
            };
        }

        case "SET_BUSINESS_DETAILS": {
            const businessData = {
                businessID: action.payload.businessID,
                businessDetails: action.payload.businessDetails,
            };
            
            localStorage.setItem('cr_bus_data', encryptData(businessData));

            return {
                ...state,
                businessID: action.payload.businessID,
                businessDetails: action.payload.businessDetails,
            };
        }

        case "LOGOUT": {
            localStorage.removeItem("cr_usr_data");
            localStorage.removeItem("cr_bus_data");
            localStorage.removeItem("crmode"); // Also clear mode on logout

            return {
                ...initialState, // Reset to initial state on logout
            };
        }

        default:
            return state; // Return current state instead of initialState
    }
};