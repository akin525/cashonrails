"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // For detecting route changes
import moment from "moment";
import CryptoJS from "crypto-js";
import { ThemeProvider as NextThemesProvider } from 'next-themes';
const SECRET_KEY = "your-secret-key"; // Store securely in environment variables in production

// Encryption and decryption functions
const encryptData = (data: object): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
};

const decryptData = (cipherText: string): object | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

// Base filter interface
interface BaseFilterState {
  status: string;
  dateRange: {
    type: 'relative' | 'absolute';
    relativeRange?: string;
    startDate?: string;
    endDate?: string;
  };
}


// Specific filter interfaces
export interface FilterState extends BaseFilterState {
  transactionReference?: string;
  status: string;
  type?: string;
  currency?: string;
}

export interface BusinessTypeFilterState extends BaseFilterState {
  status: string;
  category?: string;
}

export interface SettlementsTypeFilterState extends BaseFilterState {
  status: string;
}

interface FlaggedDocument {
  name: string;
  id: string;
}

interface UIContextType {
  showHeader: boolean;
  setShowHeader: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: {
    startDate: string,
    endDate: string
  } | null;
  setDateFilter: (startDate: string | null, endDate: string | null) => void;
  showSearchQuery?: boolean;
  setShowSearchQuery: (value: boolean) => void;
  headerTitle: string;
  setHeaderTitle: (title: string) => void;
  filterState: BaseFilterState;
  setFilterState: (filter: BaseFilterState) => void;
  flaggedDocuments: Record<string, FlaggedDocument[]>;
  addFlaggedDocument: (document: FlaggedDocument, merchantId: string) => void;
  removeFlaggedDocument: (documentId: string, merchantId: string) => void;
  clearFlaggedDocuments: (merchantId: string) => void;
}

// Create a single context for UI, search, and date filter
const UIContext = createContext<UIContextType | undefined>(undefined);

// Provider component for the unified context
export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<{ startDate: string, endDate: string } | null>(null);
  const [showSearchQuery, setShowSearchQuery] = useState<boolean>(false);
  const [headerTitle, setHeaderTitle] = useState<string>("Dashboard");
  const [filterState, setFilterState] = useState<BaseFilterState>({
    status: '', // or 'all', 'pending', etc. depending on your app logic
    dateRange: {
      type: 'relative',
      relativeRange: undefined,
      startDate: undefined,
      endDate: undefined,
    },
  });

  const [mounted, setMounted] = useState(false);


  const [flaggedDocuments, setFlaggedDocuments] = useState<Record<string, FlaggedDocument[]>>(() => {
    let storedData;
    if (typeof window !== 'undefined') {
      storedData = localStorage.getItem("flaggedDocuments");
    }
    return storedData ? (decryptData(storedData) as Record<string, FlaggedDocument[]>) || {} : {};
  });

  useEffect(() => {
    setMounted(true);
  }, []);


  const pathname = usePathname(); // Detect route changes

  useEffect(() => {
    // Reset search and filter state when navigating to a new page
    setSearchQuery("");
    setDateFilter(null);
  }, [pathname]); // Trigger reset on route change

  const handleSetDateFilter = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) {
      setDateFilter(null);
    } else {
      setDateFilter({ startDate, endDate });
    }
  };

  useEffect(() => {
    localStorage.setItem("flaggedDocuments", encryptData(flaggedDocuments));
  }, [flaggedDocuments]);

  const addFlaggedDocument = (document: FlaggedDocument, merchantId: string) => {
    setFlaggedDocuments((prev) => {
      const merchantDocs = prev[merchantId] || [];
      if (merchantDocs.some((doc) => doc.id === document.id)) return prev;
      return { ...prev, [merchantId]: [...merchantDocs, document] };
    });
  };

  const removeFlaggedDocument = (documentId: string, merchantId: string) => {
    setFlaggedDocuments((prev) => {
      const merchantDocs = prev[merchantId]?.filter((doc) => doc.id !== documentId) || [];
      if (merchantDocs.length === 0) {
        const { [merchantId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [merchantId]: merchantDocs };
    });
  };


  const clearFlaggedDocuments = (merchantId: string) => {
    setFlaggedDocuments((prev) => {
      const { [merchantId]: _, ...rest } = prev;
      return rest;
    });
  };

  if (!mounted) return null;

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" >
      <UIContext.Provider value={{
        showHeader,
        setShowHeader,
        searchQuery,
        setSearchQuery,
        dateFilter,
        setDateFilter: handleSetDateFilter,
        showSearchQuery,
        setShowSearchQuery,
        headerTitle,
        setHeaderTitle,
        filterState,
        setFilterState,
        flaggedDocuments,
        addFlaggedDocument,
        removeFlaggedDocument,
        clearFlaggedDocuments
      }}>
        {children}
      </UIContext.Provider>
    </NextThemesProvider>
  );
};

// Custom hook for accessing the unified context
export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};