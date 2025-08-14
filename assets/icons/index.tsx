export { default as HomeIcon } from './home/outline';
export { default as HomeFilledIcon } from './home/filled';
export { default as ShopOutlineIcon } from './shop/outline'; // Added ShopOutlineIcon
export { default as PaymentOutlineIcon } from './payment/outline'; // Added PaymentOutlineIcon
export { default as TransactionOutlineIcon } from './transaction/outline'; // Added TransactionOutlineIcon
export { default as BalanceOutlineIcon } from './balance/outline'; // Added BalanceOutlineIcon
export { default as SubscriptionOutlineIcon } from './subscription/outline'; // Added SubscriptionOutlineIcon
export { default as GiftOutlineIcon } from './gift/outline'; // Added MoreOutlineIcon
export { default as SupportOutlineIcon } from './support/outline';
export { default as SettingsOutlineIcon } from './settings/outline';
export { default as BellOutlineIcon } from './bell/outline';
interface CustomIconProps {
    className?: string; // Optional className for styling
    width?: number; // Optional width
    height?: number; // Optional height
    fill?: string; // Optional fill color
    stroke?: string
}
export const PlusIcon: React.FC<CustomIconProps> = ({
    className = '',
    width = 20,
    height = 20,
    stroke = '#0000',
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M10.0001 4.1665V15.8332M4.16675 9.99984H15.8334" stroke={stroke} strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};



export const DownloadIcon: React.FC<CustomIconProps> = ({
    className = '',
    width = 20,
    height = 20,
    fill = 'none',
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M10.0001 12.0833V3.75M10.0001 12.0833C9.41658 12.0833 8.32636 10.4214 7.91675 10M10.0001 12.0833C10.5836 12.0833 11.6738 10.4214 12.0834 10" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.6666 13.75C16.6666 15.8183 16.2349 16.25 14.1666 16.25H5.83325C3.76492 16.25 3.33325 15.8183 3.33325 13.75" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export const BankIcon: React.FC<CustomIconProps> = ({
    className = '',
    width = 23,
    height = 23,
    fill = 'none',
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 23 23"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M1.99121 8.01286C1.99121 6.91636 2.43339 6.24438 3.34846 5.73513L7.11526 3.63886C9.08905 2.54043 10.0759 1.99121 11.1579 1.99121C12.2398 1.99121 13.2267 2.54043 15.2005 3.63886L18.9673 5.73513C19.8823 6.24438 20.3245 6.91637 20.3245 8.01286C20.3245 8.31019 20.3245 8.45885 20.2921 8.58107C20.1215 9.22321 19.5396 9.32454 18.9777 9.32454H3.33805C2.77613 9.32454 2.19427 9.2232 2.02368 8.58107C1.99121 8.45885 1.99121 8.31019 1.99121 8.01286Z" stroke="black" strokeWidth="1.1" />
            <path d="M11.1538 6.57373H11.1627" stroke="black" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.82422 9.32422V17.1159M7.49089 9.32422V17.1159" stroke="black" strokeWidth="1.1" />
            <path d="M14.8242 9.32422V17.1159M18.4909 9.32422V17.1159" stroke="black" strokeWidth="1.1" />
            <path d="M17.5745 17.1157H4.74121C3.22243 17.1157 1.99121 18.3469 1.99121 19.8657C1.99121 20.1188 2.19642 20.3241 2.44954 20.3241H19.8662C20.1193 20.3241 20.3245 20.1188 20.3245 19.8657C20.3245 18.3469 19.0934 17.1157 17.5745 17.1157Z" stroke="black" strokeWidth="1.1" />
        </svg>
    );
};


export const DollarIcon: React.FC<CustomIconProps> = ({
    className = '',
    width = 22,
    height = 22,
    fill = 'none',
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 22 22"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M20.1339 4.1308C20.1339 4.1308 20.2953 2.4948 19.9002 2.09977M19.9002 2.09977C19.5028 1.7024 17.8694 1.8675 17.8694 1.8675M19.9002 2.09977L17.4165 4.58347" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.1339 17.8692C20.1339 17.8692 20.2953 19.5051 19.9002 19.9002M19.9002 19.9002C19.5028 20.2976 17.8694 20.1325 17.8694 20.1325M19.9002 19.9002L17.4165 17.4165" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.09977 2.09976L4.58349 4.58347M2.09977 2.09976C2.49713 1.7024 4.1306 1.8675 4.1306 1.8675M2.09977 2.09976C1.70473 2.4948 1.86614 4.13079 1.86614 4.13079" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.09977 19.9002L4.58349 17.4165M2.09977 19.9002C2.49713 20.2976 4.1306 20.1325 4.1306 20.1325M2.09977 19.9002C1.70473 19.5052 1.86614 17.8692 1.86614 17.8692" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17.4168 11.0002C17.4168 14.544 14.544 17.4168 11.0002 17.4168C7.45634 17.4168 4.5835 14.544 4.5835 11.0002C4.5835 7.45634 7.45634 4.5835 11.0002 4.5835C14.544 4.5835 17.4168 7.45634 17.4168 11.0002Z" stroke="black" strokeWidth="1.5" />
            <path d="M10.921 8.52633C9.90845 8.52633 9.1665 9.11497 9.1665 9.79814C9.1665 10.4812 9.64491 10.9084 10.9998 10.9084C12.4924 10.9084 12.8332 11.5889 12.8332 12.272C12.8332 12.9552 12.1808 13.4948 10.921 13.4948M10.921 8.52633C11.7192 8.52633 12.1412 8.80578 12.4744 9.18196M10.921 8.52633V7.75244M10.921 13.4948C10.1228 13.4948 9.81239 13.3371 9.37275 12.9393M10.921 13.4948V14.2166" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};


export const ArrowIcon: React.FC<CustomIconProps> = ({
    className = '',
    width = 20,
    height = 20,
    fill = 'none',
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M3.33301 10H16.6663" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.49965 14.1663C7.49965 14.1663 3.33302 11.0977 3.33301 9.99967C3.333 8.90167 7.49967 5.83301 7.49967 5.83301" stroke="black" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export const ChevronIcon: React.FC<CustomIconProps> = ({
    className = '',
    width = 10,
    height = 5,
    fill = 'none',
}) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 12 7"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg">
            <path d="M11 1.00004C11 1.00004 7.31758 6 6 6C4.68233 6 1 1 1 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

    );
}

export const CustomerIcon: React.FC<CustomIconProps> = ({
    className = '',
    width = 20,
    height = 20,
    fill = 'none',
}) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 25"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5 20.5V18.4704C16.5 17.2281 15.9407 16.0099 14.8103 15.4946C13.4315 14.8661 11.7779 14.5 10 14.5C8.22212 14.5 6.5685 14.8661 5.18968 15.4946C4.05927 16.0099 3.5 17.2281 3.5 18.4704V20.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.5 20.501V18.4713C20.5 17.229 19.9407 16.0109 18.8103 15.4956C18.5497 15.3768 18.2792 15.2673 18 15.168" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11.5C11.933 11.5 13.5 9.933 13.5 8C13.5 6.067 11.933 4.5 10 4.5C8.067 4.5 6.5 6.067 6.5 8C6.5 9.933 8.067 11.5 10 11.5Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 4.64453C16.4457 5.07481 17.5 6.41408 17.5 7.99959C17.5 9.5851 16.4457 10.9244 15 11.3547" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>


    );
}


interface CalendarIconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}

export const CalendarIcon: React.FC<CalendarIconProps> = ({ width = 20, height = 20, strokeColor = 'black' }) => (
  <svg width={width} height={height} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M15 1.6665V3.33317M5 1.6665V3.33317" 
      stroke={strokeColor} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M9.99609 10.8335H10.0036M9.99609 14.1668H10.0036M13.3257 10.8335H13.3332M6.6665 10.8335H6.67398M6.6665 14.1668H6.67398" 
      stroke={strokeColor} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M2.9165 6.6665H17.0832" 
      stroke={strokeColor} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M2.0835 10.2027C2.0835 6.57162 2.0835 4.75607 3.12693 3.62803C4.17036 2.5 5.84974 2.5 9.2085 2.5H10.7918C14.1506 2.5 15.83 2.5 16.8734 3.62803C17.9168 4.75607 17.9168 6.57162 17.9168 10.2027V10.6307C17.9168 14.2618 17.9168 16.0773 16.8734 17.2053C15.83 18.3333 14.1506 18.3333 10.7918 18.3333H9.2085C5.84974 18.3333 4.17036 18.3333 3.12693 17.2053C2.0835 16.0773 2.0835 14.2618 2.0835 10.6307V10.2027Z" 
      stroke={strokeColor} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path 
      d="M2.5 6.6665H17.5" 
      stroke={strokeColor} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

interface IconProps {
  width?: number;
  height?: number;
  strokeColor?: string;
}

export const CloseIcon: React.FC<IconProps> = ({ width = 16, height = 16, strokeColor = 'black' }) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12.6668 3.3335L3.3335 12.6668M3.3335 3.3335L12.6668 12.6668" 
      stroke={strokeColor} 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);
interface IconProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeColor?: string;
    fillColor? : string;
  }
export const ShoppingCartIconFilled: React.FC<IconProps> = ({
    width = 24,
    height = 24,
    fillColor = "black",
    strokeColor = "black",
    ...props
}) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M3 2.5H4.30116C5.48672 2.5 6.0795 2.5 6.4814 2.87142C6.88331 3.24285 6.96165 3.86307 7.11834 5.10351L8.24573 14.0287C8.45464 15.6826 8.5591 16.5095 9.09497 17.0048C9.63085 17.5 10.4212 17.5 12.002 17.5H22"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <path
            d="M11.5 21.5C12.3284 21.5 13 20.8284 13 20C13 19.1716 12.3284 18.5 11.5 18.5C10.6716 18.5 10 19.1716 10 20C10 20.8284 10.6716 21.5 11.5 21.5Z"
            stroke={strokeColor}
            strokeWidth="1.5"
        />
        <path
            d="M18.5 21.5C19.3284 21.5 20 20.8284 20 20C20 19.1716 19.3284 18.5 18.5 18.5C17.6716 18.5 17 19.1716 17 20C17 20.8284 17.6716 21.5 18.5 21.5Z"
            stroke={strokeColor}
            strokeWidth="1.5"
        />
        <path
            d="M18 14.5H16C14.1144 14.5 13.1716 14.5 12.5858 13.9142C12 13.3284 12 12.3856 12 10.5V8.5C12 6.61438 12 5.67157 12.5858 5.08579C13.1716 4.5 14.1144 4.5 16 4.5H18C19.8856 4.5 20.8284 4.5 21.4142 5.08579C22 5.67157 22 6.61438 22 8.5V10.5C22 12.3856 22 13.3284 21.4142 13.9142C20.8284 14.5 19.8856 14.5 18 14.5Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M16.5 7.5H17.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>

)

export const ShoppingCartIconOutline: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  strokeColor = "black",
  ...props
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 2.5H4.30116C5.48672 2.5 6.0795 2.5 6.4814 2.87142C6.88331 3.24285 6.96165 3.86307 7.11834 5.10351L8.24573 14.0287C8.45464 15.6826 8.5591 16.5095 9.09497 17.0048C9.63085 17.5 10.4212 17.5 12.002 17.5H22"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M11.5 21.5C12.3284 21.5 13 20.8284 13 20C13 19.1716 12.3284 18.5 11.5 18.5C10.6716 18.5 10 19.1716 10 20C10 20.8284 10.6716 21.5 11.5 21.5Z"
      stroke={strokeColor}
      strokeWidth="1.5"
    />
    <path
      d="M18.5 21.5C19.3284 21.5 20 20.8284 20 20C20 19.1716 19.3284 18.5 18.5 18.5C17.6716 18.5 17 19.1716 17 20C17 20.8284 17.6716 21.5 18.5 21.5Z"
      stroke={strokeColor}
      strokeWidth="1.5"
    />
    <path
      d="M18 14.5H16C14.1144 14.5 13.1716 14.5 12.5858 13.9142C12 13.3284 12 12.3856 12 10.5V8.5C12 6.61438 12 5.67157 12.5858 5.08579C13.1716 4.5 14.1144 4.5 16 4.5H18C19.8856 4.5 20.8284 4.5 21.4142 5.08579C22 5.67157 22 6.61438 22 8.5V10.5C22 12.3856 22 13.3284 21.4142 13.9142C20.8284 14.5 19.8856 14.5 18 14.5Z"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.5 7.5H17.5"
      stroke={strokeColor}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);