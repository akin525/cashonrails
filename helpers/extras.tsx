import crypto from 'crypto';
import { useRouter, useSearchParams } from 'next/navigation';
import { Route, RouteLiteral } from "nextjs-routes";
import { twMerge } from "tailwind-merge"
import { clsx, type ClassValue } from "clsx"

/**
 * 
 * @param data 
 * @returns 
 */
// This is a cryptography function that encrypts data, using the secret key and iv provided in the .env file.
export const encryptData = (data: object) => {
    try {
        const key: string = process.env.NEXT_PUBLIC_API_SECRET_KEY || '';
        const iv: string = process.env.NEXT_PUBLIC_API_SECRET_IV || '';

        const encryption_method: string = process.env.NEXT_PUBLIC_API_ENCRYPTION_METHOD || '';

        const bufferData = JSON.stringify(data);
        const bufferKey = Buffer.from(key, 'utf-8');
        const bufferIv = Buffer.from(iv, 'utf-8');

        const cipher = crypto.createCipheriv(encryption_method, bufferKey, bufferIv);
        let encrypted = cipher.update(bufferData, 'utf-8', 'hex');
        encrypted += cipher.final('hex');

        return encrypted;
    } catch (error) {
        console.error('Error encrypting data');
        return ''; // Handle encryption errors gracefully
    }
}


/**
 * 
 * @param encryptedData 
 * @returns 
 */
// This is a cryptography function that decrypts data, using the secret key and iv provided in the .env file.
export const decryptData = (encryptedData: string): Record<string, any> | null => {
    try {
        const key: string = process.env.NEXT_PUBLIC_API_SECRET_KEY || '';
        const iv: string = process.env.NEXT_PUBLIC_API_SECRET_IV || '';

        const encryption_method: string = process.env.NEXT_PUBLIC_API_ENCRYPTION_METHOD || '';
        const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || '';

        const bufferKey = Buffer.from(key, 'utf-8');
        const bufferIv = Buffer.from(iv, 'utf-8');

        const decipher = crypto.createDecipheriv(encryption_method, bufferKey, bufferIv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');

        if (environment === 'development') console.log('Decryption Data:', JSON.parse(decrypted));

        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Error decrypting data');
        return null; // Handle decryption errors gracefully
    }
};


// Extract Phone Number Details, this function extracts the country code and phone number from a phone number string
/**
 * 
 * @param number 
 * @returns 
 */
export const extractPhoneNumberDetails = (number: string): { code: string, number: string } => {
    // Convert number to string and remove any whitespace
    number = number.toString().trim();

    // Check if the number starts with '234' (Nigeria country code)
    const countryCode = '234';
    let phoneNumber;

    if (number.startsWith('+')) {
        // If the number starts with '+', remove the '+' sign
        number = number.slice(1);
    }

    if (number.startsWith(countryCode)) {
        phoneNumber = number.slice(3); // Remove the '234' prefix
    } else if (number.startsWith('0')) {
        phoneNumber = number.slice(1); // Remove the leading zero
    } else {
        phoneNumber = number; // Assume it's already formatted
    }

    return {
        code: `+${countryCode}`,
        number: phoneNumber
    };
};


// Handle Download QR Code, this function generates a QR code image and downloads it, using the canvas element
/**
 * 
 * @param refSelector 
 */
export const handleDownloadQRCode = (refSelector: React.RefObject<HTMLDivElement> | null) => {
    const canvas = refSelector?.current?.querySelector("canvas");
    const image = canvas?.toDataURL("image/png");

    if (image) {
        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.href = image;
        anchor.download = `qr-code.png`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    } else {
        console.error("Failed to generate QR code image.");
    }
}


// Format file size, this function converts the file size from bytes to KB or MB
/**
 * 
 * @param size 
 * @returns 
 */
export const convertFileSize = (size: number) => {
    if (size < 1024) {
        return size + " B";
    } else if (size < 1024 * 1024) {
        return Math.round(size / 1024) + " KB";
    } else {
        return (size / (1024 * 1024)).toFixed(1) + " MB";
    }
}


// Currency Formatter, this function formats a number as a currency, using the currency symbol provided
/**
 * 
 * @param currency 
 * @param amount 
 * @returns 
 */
export const currencyFormatter = (currency: string, amount: number | string) => {
    if (!currency) {
        currency = '';
    }

    const getCurrencyUnicode = (currency: string) => {
        switch (currency.toLowerCase()) {
            case 'ngn': return '₦';
            case 'usd': return '$';
            case 'eur': return '€';
            case 'gbp': return '£';
            case 'kes': return 'KSh';
            case 'ghs': return 'GH₵';
            case 'zar': return 'R';
            case 'tzs': return 'TSh';
            default: return currency.toUpperCase() || ''; // Return empty string for unknown currency
        }
    }

    const getAmount = (amount: number | string) => {
        if (!amount || (typeof amount === 'number' && isNaN(amount)) || amount === null || amount === undefined) {
            return '0.00'; // Handling cases where amount is not a valid number
        }

        if (typeof amount === 'string') {
            // Check if it has commas
            if (amount.includes(',')) {
                // Remove commas from the string and convert it to a number
                amount = amount.replace(/,/g, '');
            }

            // check if it has non numeric characters, apart from the decimal point, remove them
            if (amount.match(/[^0-9.]/g)) {
                // Remove all non numeric characters, apart from the decimal point
                amount = amount.replace(/[^0-9.]/g, '');
            }
        }

        // Convert the amount to a number
        // Do this checks
        // 1. if the amount is a string, check if it has a decimal point and convert it to a number with 2 decimal places
        // 2. if the amount is a number, convert it to a string and add 2 decimal places
        // Now convert the number to a string and add commas to it

        const formattedAmount = parseFloat(amount.toString()).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        return formattedAmount;
    }

    return `${getCurrencyUnicode(currency)}${getAmount(amount)}`;
};



// Figure Formatter, this function formats a number by removing commas and non-numeric characters
/**
 * 
 * @param amount 
 * @returns 
 */
export const figureFormatter = (amount: number | string) => {
    if (typeof amount !== 'string') {
        return 0;
    }

    // Remove commas
    let cleanedAmount = amount.replace(/,/g, '');

    // Remove non-numeric characters except for the decimal point
    cleanedAmount = cleanedAmount.replace(/[^0-9.]/g, '');

    // Convert to number
    const numberAmount = parseFloat(cleanedAmount);

    if (isNaN(numberAmount)) {
        return 0;
    }

    return numberAmount;
};


// Get Mobile OS, this function detects the operating system of the user's device
/**
 * 
 * @returns 
 */
export const getOS = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }

    return os;
}


export const useNavigation = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const navigate = (pathname: Route["pathname"], queryParams: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());

        // Update or add new query parameters
        Object.entries(queryParams).forEach(([key, value]) => {
            params.set(key, value);
        });

        // Construct the new URL
        const newUrl = `${pathname}?${params.toString()}` as RouteLiteral;

        // Navigate to the new URL
        router.push(newUrl);
    };

    return navigate;
};


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount).replace('NGN', '₦');
};

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);



/**
 * Utility class for string operations
 */
export class StringUtils {
    /**
 * Converts a snake_case string to a capitalized string.
 * @param {string} str - The snake_case string to convert.
 * @returns {string} - The capitalized string.
 * 
 * @example
 * StringUtils.snakeToCapitalized('hello_world'); // "Hello World"
 */
    static snakeToCapitalized(str: string): string {
        return str
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    /**
     * Converts a string to well-formed title case: "apple" => "Apple"
     * @param str - The string to convert
     * @returns The converted string
     */
    static lowerCaseToTitleCase(str: string): string {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Capitalizes every word in a sentence: "hello world" => "Hello World"
     * @param str - The string to convert
     * @returns The converted string
     */
    static capitalizeWords(str: string): string {
        if (!str) return '';
        return str
            .split(' ')
            .map(word => this.lowerCaseToTitleCase(word))
            .join(' ');
    }

    /**
     * Converts snake_case or kebab-case to camelCase: "hello_world" => "helloWorld"
     * @param str - The string to convert
     * @returns The converted string
     */
    static snakeCaseToCamelCase(str: string): string {
        if (!str) return '';
        return str
            .split(/[_-]/)
            .map((word, index) =>
                index === 0 ? word.toLowerCase() : this.lowerCaseToTitleCase(word)
            )
            .join('');
    }

    /**
     * Converts a string to snake_case: "Hello World" => "hello_world"
     * @param str - The string to convert
     * @returns The converted string
     */
    static camelCaseToSnakeCase(str: string): string {
        if (!str) return '';
        return str
            .replace(/\s+/g, '_')
            .replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
            .replace(/^_/, '')
            .toLowerCase();
    }

    /**
     * Converts a string to kebab-case: "Hello World" => "hello-world"
     * @param str - The string to convert
     * @returns The converted string
     */
    static toKebabCase(str: string): string {
        if (!str) return '';
        return str
            .replace(/\s+/g, '-')
            .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
            .replace(/^-/, '')
            .toLowerCase();
    }

    /**
     * Truncates a string and appends ellipsis if it exceeds the max length: "Hello World" => "Hello..."
     * @param str - The string to truncate
     * @param maxLength - The maximum length of the string
     * @returns The truncated string
     */
    static truncate(str: string, maxLength: number): string {
        if (!str || str.length <= maxLength) return str;
        return str.slice(0, maxLength) + '...';
    }

    /**
     * Checks if a string is a valid email
     * @param email - The email to validate
     * @returns True if the email is valid, false otherwise
     */
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Checks if a string contains only alphanumeric characters
     * @param str - The string to check
     * @returns True if the string contains only alphanumeric characters, false otherwise
     */
    static isAlphanumeric(str: string): boolean {
        const alphaNumRegex = /^[a-z0-9]+$/i;
        return alphaNumRegex.test(str);
    }

    /**
     * Formats a number or numeric string with commas as thousand separators
     * @param value - The number or string to format
     * @returns A string representation of the number with commas, or an empty string if invalid
     */
    static formatWithCommas(value: string | number): string {
        const num = Number(value);
        if (isNaN(num)) return '';
        return num.toLocaleString('en-US');
    }

}