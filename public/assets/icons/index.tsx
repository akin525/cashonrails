import { cn } from '@/helpers/extras';

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
  width = "20",
  height = "21",
  fill = 'none',
  stroke = "white"
}) => {
  return (
    // <svg
    //   className={className}
    //   width={width}
    //   height={height}
    //   viewBox="0 0 12 7"
    //   fill={fill}
    //   xmlns="http://www.w3.org/2000/svg">
    //   <path d="M11 1.00004C11 1.00004 7.31758 6 6 6C4.68233 6 1 1 1 1" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    // </svg>

    <svg className={`${className} duration-500 `} width={width} height={height} viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8.00004C15 8.00004 11.3176 13 10 13C8.68233 13 5 8 5 8"
      stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>

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


export const AnalyticsIcon: React.FC<CustomIconProps> = ({
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
          viewBox="0 0 24 24"
          fill={fill}
          xmlns="http://www.w3.org/2000/svg"
      >
        <path
            d="M3 21H21"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M6 17V10"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 17V7"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M14 17V4"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M18 17V12"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
      </svg>
  );
};


export const ReportIcon: React.FC<CustomIconProps> = ({
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
            viewBox="0 0 24 24"
            fill={fill}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M4 3H20V21H4V3Z"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 7H16"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 12H16"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 17H12"
                stroke="black"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};


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
  fillColor?: string;
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


export const OverviewFilled: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16.5557 5.11883C15.7488 4.57099 14.8724 4.14848 13.9552 3.8602C12.7981 3.49648 12.2195 3.31462 11.6098 3.7715C11 4.22839 11 4.9705 11 6.45472V11.0064C11 12.2697 11 12.9013 11.2341 13.4676C11.4683 14.034 11.9122 14.4761 12.8 15.3604L15.999 18.5466C17.0421 19.5855 17.5637 20.105 18.3116 19.9823C19.0596 19.8597 19.3367 19.3125 19.8911 18.2182C20.3153 17.381 20.6251 16.4835 20.8079 15.5499C21.1937 13.5788 20.9957 11.5358 20.2388 9.67903C19.4819 7.82232 18.2002 6.23535 16.5557 5.11883Z"
      fill="black"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 20.9185C13.0736 21.2935 12.0609 21.5 11 21.5C6.58172 21.5 3 17.9183 3 13.5C3 10.0631 5.16736 7.13232 8.20988 6"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);



export const OverviewOutline: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="25"
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16.5557 5.11883C15.7488 4.57099 14.8724 4.14848 13.9552 3.8602C12.7981 3.49648 12.2195 3.31462 11.6098 3.7715C11 4.22839 11 4.9705 11 6.45472V11.0064C11 12.2697 11 12.9013 11.2341 13.4676C11.4683 14.034 11.9122 14.4761 12.8 15.3604L15.999 18.5466C17.0421 19.5855 17.5637 20.105 18.3116 19.9823C19.0596 19.8597 19.3367 19.3125 19.8911 18.2182C20.3153 17.381 20.6251 16.4835 20.8079 15.5499C21.1937 13.5788 20.9957 11.5358 20.2388 9.67903C19.4819 7.82232 18.2002 6.23535 16.5557 5.11883Z"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 20.9185C13.0736 21.2935 12.0609 21.5 11 21.5C6.58172 21.5 3 17.9183 3 13.5C3 10.0631 5.16736 7.13232 8.20988 6"
      stroke="black"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


export const ComplianceIconOutline: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M21 11.6833V8.78029C21 7.14029 21 6.32028 20.5959 5.78529C20.1918 5.25029 19.2781 4.99056 17.4507 4.4711C16.2022 4.1162 15.1016 3.68863 14.2223 3.29829C13.0234 2.7661 12.424 2.5 12 2.5C11.576 2.5 10.9766 2.7661 9.77771 3.29829C8.89839 3.68863 7.79784 4.11619 6.54933 4.4711C4.72193 4.99056 3.80822 5.25029 3.40411 5.78529C3 6.32028 3 7.14029 3 8.78029V11.6833C3 17.3085 8.06277 20.6835 10.594 22.0194C11.2011 22.3398 11.5046 22.5 12 22.5C12.4954 22.5 12.7989 22.3398 13.406 22.0194C15.9372 20.6835 21 17.3085 21 11.6833Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5C13.3807 9.5 14.5 10.6193 14.5 12Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};


export const FinanceIconOutline: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14 18.5C18.4183 18.5 22 14.9183 22 10.5C22 6.08172 18.4183 2.5 14 2.5C9.58172 2.5 6 6.08172 6 10.5C6 14.9183 9.58172 18.5 14 18.5Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.15657 11.5C2.42523 12.6176 2 13.9535 2 15.3888C2 19.3162 5.18378 22.5 9.11116 22.5C10.5465 22.5 11.8824 22.0748 13 21.3434"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.7712 8.70518C15.555 7.79305 14.4546 6.96998 13.1337 7.58573C11.8128 8.20148 11.603 10.1826 13.601 10.3931C14.5041 10.4882 15.0928 10.2827 15.6319 10.864C16.1709 11.4453 16.2711 13.0619 14.8931 13.4976C13.5151 13.9333 12.1506 13.2525 12.002 12.2859M13.9862 6.50415V7.37319M13.9862 13.6317V14.5041"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};


export const GrowthIconOutline: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3 4.5V14.5C3 17.3284 3 18.7426 3.87868 19.6213C4.75736 20.5 6.17157 20.5 9 20.5H21"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 14.5L9.25 11.25C9.89405 10.6059 10.2161 10.2839 10.5927 10.1777C10.8591 10.1025 11.1409 10.1025 11.4073 10.1777C11.7839 10.2839 12.1059 10.6059 12.75 11.25C13.3941 11.8941 13.7161 12.2161 14.0927 12.3223C14.3591 12.3975 14.6409 12.3975 14.9073 12.3223C15.2839 12.2161 15.6059 11.8941 16.25 11.25L20 7.5"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};


export const NormalShopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M6.14381 13.5244V18.4281C6.14381 21.2021 6.14381 22.589 7.00527 23.4508C7.86672 24.3126 9.2532 24.3126 12.0262 24.3126H17.9085C20.6815 24.3126 22.0679 24.3126 22.9294 23.4508C23.7909 22.589 23.7909 21.2021 23.7909 18.4281V13.5244"
        stroke="black"
        strokeWidth="1.47059"
        strokeLinecap="round"
      />
      <path
        d="M17.9085 19.895C17.2378 20.4903 16.1701 20.8754 14.9673 20.8754C13.7646 20.8754 12.6968 20.4903 12.0262 19.895"
        stroke="black"
        strokeWidth="1.47059"
        strokeLinecap="round"
      />
      <path
        d="M13.1409 11.4902C12.8644 12.4886 11.859 14.2109 9.94868 14.4605C8.26198 14.6809 6.98269 13.9446 6.65593 13.6368C6.29565 13.3872 5.47455 12.5885 5.27348 12.0892C5.07239 11.59 5.30699 10.5084 5.47455 10.0674L6.14443 8.12783C6.30796 7.64066 6.69077 6.4884 7.08323 6.09866C7.4757 5.70893 8.27029 5.69197 8.59734 5.69197H15.4655C17.2333 5.71695 21.0988 5.6762 21.8629 5.69198C22.627 5.70774 23.0863 6.34827 23.2203 6.62284C24.3604 9.38443 24.8038 10.966 24.8038 11.6399C24.655 12.3589 24.0391 13.7145 21.8629 14.3108C19.6012 14.9304 18.3189 13.7251 17.9166 13.2624M12.2109 13.2624C12.5293 13.6534 13.528 14.4406 14.9758 14.4605C16.4236 14.4805 17.6737 13.4704 18.1177 12.9629C18.2434 12.8131 18.5149 12.3688 18.7965 11.4902"
        stroke="black"
        strokeWidth="1.47059"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const ActiveShopIcon: React.FC<CustomIconProps> = ({
  width = 30,
  height = 30,
  fill = "none",
  stroke = "black",
  className = "",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 30 30"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_3538_17594)">
        <path
          d="M6.1438 13.5244V18.4281C6.1438 21.2021 6.1438 22.589 7.00525 23.4508C7.8667 24.3126 9.25318 24.3126 12.0262 24.3126H17.9085C20.6814 24.3126 22.0679 24.3126 22.9294 23.4508C23.7909 22.589 23.7909 21.2021 23.7909 18.4281V13.5244"
          stroke={stroke}
          strokeWidth="1.47059"
          strokeLinecap="round"
        />
        <path
          d="M17.9085 19.895C17.2378 20.4903 16.17 20.8754 14.9673 20.8754C13.7646 20.8754 12.6968 20.4903 12.0261 19.895"
          stroke={stroke}
          strokeWidth="1.47059"
          strokeLinecap="round"
        />
        <path
          d="M13.1408 11.4902C12.8644 12.4886 11.8589 14.2109 9.94864 14.4605C8.26193 14.6809 6.98265 13.9446 6.65588 13.6368C6.29561 13.3872 5.47451 12.5885 5.27343 12.0892C5.07234 11.59 5.30694 10.5084 5.47451 10.0674L6.14438 8.12783C6.30791 7.64066 6.69072 6.4884 7.08318 6.09866C7.47565 5.70893 8.27024 5.69197 8.59729 5.69197H15.4654C17.2333 5.71695 21.0988 5.6762 21.8629 5.69198C22.627 5.70774 23.0862 6.34827 23.2202 6.62284C24.3603 9.38443 24.8038 10.966 24.8038 11.6399C24.6549 12.3589 24.0391 13.7145 21.8629 14.3108C19.6011 14.9304 18.3189 13.7251 17.9166 13.2624M12.2108 13.2624C12.5292 13.6534 13.528 14.4406 14.9757 14.4605C16.4236 14.4805 17.6737 13.4704 18.1177 12.9629C18.2434 12.8131 18.5148 12.3688 18.7964 11.4902"
          stroke={stroke}
          strokeWidth="1.47059"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g clipPath="url(#clip1_3538_17594)">
          <path
            d="M22.0588 14.1176C25.47 14.1176 28.2353 11.3523 28.2353 7.94112C28.2353 4.52995 25.47 1.76465 22.0588 1.76465C18.6476 1.76465 15.8823 4.52995 15.8823 7.94112C15.8823 11.3523 18.6476 14.1176 22.0588 14.1176Z"
            fill={stroke}
            stroke={stroke}
            strokeWidth="0.772059"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.3699 8.46718L20.9833 10.0806L24.748 6.31592"
            stroke="white"
            strokeWidth="1.07563"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_3538_17594">
          <rect
            width="28.2353"
            height="28.2353"
            fill="white"
            transform="translate(0.882324 0.882324)"
          />
        </clipPath>
        <clipPath id="clip1_3538_17594">
          <rect
            width="16.4706"
            height="16.4706"
            fill="white"
            transform="translate(13.8235 -0.294189)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};


export const PendingShopIcon: React.FC<IconProps> = ({ className, style }: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <g clipPath="url(#clip0_3538_17615)">
        <path
          d="M6.1438 13.5244V18.4281C6.1438 21.2021 6.1438 22.589 7.00525 23.4508C7.8667 24.3126 9.25318 24.3126 12.0262 24.3126H17.9085C20.6814 24.3126 22.0679 24.3126 22.9294 23.4508C23.7909 22.589 23.7909 21.2021 23.7909 18.4281V13.5244"
          stroke="black"
          strokeWidth="1.47059"
          strokeLinecap="round"
        />
        <path
          d="M17.9085 19.895C17.2378 20.4903 16.17 20.8754 14.9673 20.8754C13.7646 20.8754 12.6968 20.4903 12.0261 19.895"
          stroke="black"
          strokeWidth="1.47059"
          strokeLinecap="round"
        />
        <path
          d="M13.1409 11.4902C12.8644 12.4886 11.859 14.2109 9.9487 14.4605C8.26199 14.6809 6.98271 13.9446 6.65594 13.6368C6.29567 13.3872 5.47457 12.5885 5.27349 12.0892C5.0724 11.59 5.307 10.5084 5.47457 10.0674L6.14444 8.12783C6.30797 7.64066 6.69078 6.4884 7.08325 6.09866C7.47572 5.70893 8.2703 5.69197 8.59735 5.69197H15.4655C17.2333 5.71695 21.0988 5.6762 21.8629 5.69198C22.6271 5.70774 23.0863 6.34827 23.2203 6.62284C24.3604 9.38443 24.8038 10.966 24.8038 11.6399C24.655 12.3589 24.0391 13.7145 21.8629 14.3108C19.6012 14.9304 18.3189 13.7251 17.9167 13.2624M12.2109 13.2624C12.5293 13.6534 13.528 14.4406 14.9758 14.4605C16.4236 14.4805 17.6737 13.4704 18.1177 12.9629C18.2434 12.8131 18.5149 12.3688 18.7965 11.4902"
          stroke="black"
          strokeWidth="1.47059"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g clipPath="url(#clip1_3538_17615)">
          <path
            d="M22.0588 14.1176C25.47 14.1176 28.2353 11.3523 28.2353 7.94112C28.2353 4.52995 25.47 1.76465 22.0588 1.76465C18.6476 1.76465 15.8823 4.52995 15.8823 7.94112C15.8823 11.3523 18.6476 14.1176 22.0588 14.1176Z"
            fill="black"
          />
          <g clipPath="url(#clip2_3538_17615)">
            <path
              d="M22.0588 12.1567C19.7306 12.1567 17.8431 10.2693 17.8431 7.94105C17.8431 5.61278 19.7306 3.72534 22.0588 3.72534C23.9465 3.72534 25.5265 4.96598 26.0637 6.67633H25.0098"
              stroke="white"
              strokeWidth="0.91"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22.0588 6.25464V7.94092L22.902 8.78406"
              stroke="white"
              strokeWidth="0.91"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M26.2556 8.36249C26.2681 8.22375 26.2745 8.08311 26.2745 7.94092M23.3235 12.1566C23.4675 12.1092 23.6082 12.0539 23.7451 11.9913M25.7646 10.0488C25.846 9.89211 25.9185 9.72977 25.9815 9.56236M24.6693 11.4101C24.8145 11.2899 24.9521 11.1599 25.0809 11.0211"
              stroke="white"
              strokeWidth="0.91"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>
      <defs>
        <clipPath id="clip0_3538_17615">
          <rect width="28.2353" height="28.2353" fill="white" transform="translate(0.882324 0.882324)" />
        </clipPath>
        <clipPath id="clip1_3538_17615">
          <rect width="16.4706" height="16.4706" fill="white" transform="translate(13.8235 -0.294189)" />
        </clipPath>
        <clipPath id="clip2_3538_17615">
          <rect width="10.1177" height="10.1177" fill="white" transform="translate(17 2.88208)" />
        </clipPath>
      </defs>
    </svg>
  );
};


export const DisabledShopIcon: React.FC = () => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_3538_17639)">
        <path
          d="M6.1438 13.5244V18.4281C6.1438 21.2021 6.1438 22.589 7.00525 23.4508C7.8667 24.3126 9.25318 24.3126 12.0262 24.3126H17.9085C20.6814 24.3126 22.0679 24.3126 22.9294 23.4508C23.7909 22.589 23.7909 21.2021 23.7909 18.4281V13.5244"
          stroke="black"
          strokeWidth="1.47059"
          strokeLinecap="round"
        />
        <path
          d="M17.9085 19.895C17.2378 20.4903 16.17 20.8754 14.9673 20.8754C13.7646 20.8754 12.6968 20.4903 12.0261 19.895"
          stroke="black"
          strokeWidth="1.47059"
          strokeLinecap="round"
        />
        <path
          d="M13.1408 11.4902C12.8644 12.4886 11.8589 14.2109 9.94864 14.4605C8.26193 14.6809 6.98265 13.9446 6.65588 13.6368C6.29561 13.3872 5.47451 12.5885 5.27343 12.0892C5.07234 11.59 5.30694 10.5084 5.47451 10.0674L6.14438 8.12783C6.30791 7.64066 6.69072 6.4884 7.08318 6.09866C7.47565 5.70893 8.27024 5.69197 8.59729 5.69197H15.4654C17.2333 5.71695 21.0988 5.6762 21.8629 5.69198C22.627 5.70774 23.0862 6.34827 23.2202 6.62284C24.3603 9.38443 24.8038 10.966 24.8038 11.6399C24.6549 12.3589 24.0391 13.7145 21.8629 14.3108C19.6011 14.9304 18.3189 13.7251 17.9166 13.2624M12.2108 13.2624C12.5292 13.6534 13.528 14.4406 14.9757 14.4605C16.4236 14.4805 17.6737 13.4704 18.1177 12.9629C18.2434 12.8131 18.5148 12.3688 18.7964 11.4902"
          stroke="black"
          strokeWidth="1.47059"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g clipPath="url(#clip1_3538_17639)">
          <path
            d="M22.0588 14.1176C25.47 14.1176 28.2353 11.3523 28.2353 7.94112C28.2353 4.52995 25.47 1.76465 22.0588 1.76465C18.6476 1.76465 15.8823 4.52995 15.8823 7.94112C15.8823 11.3523 18.6476 14.1176 22.0588 14.1176Z"
            fill="black"
          />
          <line
            x1="18"
            y1="8"
            x2="26"
            y2="8"
            stroke="white"
            strokeWidth="2"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_3538_17639">
          <rect
            width="28.2353"
            height="28.2353"
            fill="white"
            transform="translate(0.882324 0.882324)"
          />
        </clipPath>
        <clipPath id="clip1_3538_17639">
          <rect
            width="16.4706"
            height="16.4706"
            fill="white"
            transform="translate(13.8235 -0.294189)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

type Direction = 'up' | 'down' | 'right' | 'left';
interface TrendIconProps {
  direction?: Direction;
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
  circular?: boolean;
  animated?: boolean;
}
export const TrendIcon: React.FC<TrendIconProps> = ({
  direction = 'up',
  size = 14,
  className,
  color = 'currentColor',
  strokeWidth = 1.5,
  circular = true,
  animated = false,
}) => {
  const viewBoxSize = 14;
  const offset = 0.39;
  const scale = size / viewBoxSize;
  const scaledHeight = viewBoxSize * scale;
  const scaledOffset = offset * scale;

  const getArrowPath = (): { line: string; arrow: string } => {
    switch (direction) {
      case 'up':
        return {
          line: 'M8.75036 5.63965L5.25036 9.13965',
          arrow: 'M6.1257 5.63965H8.7507V8.26465'
        };
      case 'down':
        return {
          line: 'M5.25036 5.63965L8.75036 9.13965',
          arrow: 'M8.7507 6.51465V9.13965H6.1257'
        };
      case 'right':
        return {
          line: 'M5.25036 5.63965L8.75036 7.38965L5.25036 9.13965',
          arrow: 'M7.8757 7.38965H8.7507'
        };
      case 'left':
        return {
          line: 'M8.75036 5.63965L5.25036 7.38965L8.75036 9.13965',
          arrow: 'M6.1257 7.38965H5.2507'
        };
    }
  };

  const arrowPath = getArrowPath();

  return (
    <div 
      className={cn(
        "inline-flex items-center justify-center",
        animated && "transition-transform duration-200 hover:scale-110",
        className
      )}
      style={{ height: scaledHeight }}
    >
      <svg
        width={size}
        height={scaledHeight}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize + offset}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_trend)">
          {circular && (
            <path
              d="M7.00024 12.6396C9.89974 12.6396 12.2502 10.2891 12.2502 7.38965C12.2502 4.49015 9.89974 2.13965 7.00024 2.13965C4.10075 2.13965 1.75024 4.49015 1.75024 7.38965C1.75024 10.2891 4.10075 12.6396 7.00024 12.6396Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <path
            d={arrowPath.line}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={arrowPath.arrow}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_trend">
            <rect
              width={viewBoxSize}
              height={viewBoxSize}
              fill="white"
              transform={`translate(0 ${offset})`}
            />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};


interface IconProps extends React.SVGProps<SVGSVGElement> { }

export const DocumentIcon: React.FC<IconProps> = (props) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props} // Allow passing additional props like className, style, etc.
    >
      <path
        d="M15.3757 7.87518V7.50018C15.3757 4.67175 15.3757 3.25755 14.497 2.37886C13.6183 1.50018 12.2041 1.50018 9.37566 1.50018H8.62573C5.79736 1.50018 4.38316 1.50018 3.50448 2.37885C2.6258 3.25752 2.62579 4.67172 2.62576 7.50013L2.62573 10.8752C2.62571 13.3407 2.6257 14.5736 3.30664 15.4033C3.43132 15.5553 3.57063 15.6945 3.72255 15.8193C4.55231 16.5002 5.7851 16.5002 8.25066 16.5002"
        stroke="#01AB79"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.625 5.24994H12.375"
        stroke="#01AB79"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.625 8.99994H10.125"
        stroke="#01AB79"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.3735 15.0002V12.7502C15.3735 11.6781 14.3662 10.5002 13.1235 10.5002C11.8809 10.5002 10.8735 11.6781 10.8735 12.7502V15.3752C10.8735 15.9965 11.3772 16.5002 11.9985 16.5002C12.6198 16.5002 13.1235 15.9965 13.1235 15.3752V12.7502"
        stroke="#01AB79"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

type EditCancelProps = {
  color?: string; // Stroke color for the icon
  size?: number; // Size of the icon
  strokeWidth?: number; // Width of the stroke
};

export const CancelIcon: React.FC<EditCancelProps> = ({
  color = "currentColor",
  size = 20,
  strokeWidth = 2,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 5L5 15M5 5L15 15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const EditIcon: React.FC<EditCancelProps> = ({
  color = "black",
  size = 20,
  strokeWidth = 1.25,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.6882 3.83757L14.5132 3.01258C15.1967 2.32914 16.3048 2.32914 16.9882 3.01258C17.6716 3.69603 17.6716 4.80411 16.9882 5.48756L16.1632 6.31255M13.6882 3.83757L8.1388 9.387C7.71587 9.81 7.41585 10.3398 7.27079 10.9201L6.66748 13.3333L9.08073 12.73C9.66098 12.585 10.1908 12.2849 10.6138 11.862L16.1632 6.31255M13.6882 3.83757L16.1632 6.31255"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path
      d="M15.8333 11.2501C15.8333 13.9897 15.8333 15.3594 15.0767 16.2814C14.9382 16.4502 14.7834 16.6049 14.6146 16.7434C13.6927 17.5001 12.3228 17.5001 9.58325 17.5001H9.16667C6.02397 17.5001 4.45263 17.5001 3.47632 16.5237C2.50002 15.5475 2.5 13.9761 2.5 10.8334V10.4167C2.5 7.67718 2.5 6.30741 3.25662 5.38545C3.39514 5.21666 3.54992 5.06189 3.7187 4.92336C4.64066 4.16675 6.01043 4.16675 8.75 4.16675"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


export const StatusIcon = () => (
  <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10.5019 10.392C10.5355 10.4284 10.5783 10.4551 10.6257 10.4691C10.6736 10.4832 10.7244 10.4841 10.7727 10.4718C10.8206 10.4594 10.8643 10.4344 10.8993 10.3994C10.9343 10.3644 10.9594 10.3207 10.9718 10.2728C10.984 10.2263 10.9831 10.1773 10.9694 10.1311C10.9544 10.0837 10.927 10.041 10.8901 10.0076L10.8849 10.0024L9.78665 8.90423C9.73214 8.85972 9.66378 8.83568 9.59341 8.83627C9.52531 8.83626 9.45994 8.86305 9.41143 8.91085C9.36219 8.95961 9.33314 9.02515 9.3301 9.09438C9.32706 9.16362 9.35024 9.23145 9.39503 9.28434L10.5013 10.3914L10.5019 10.392ZM7.28702 2.84692V1.30761C7.28703 1.30151 7.28736 1.29542 7.28799 1.28936C7.28737 1.23955 7.27477 1.19062 7.25126 1.1467C7.22874 1.10234 7.19447 1.06502 7.15219 1.03881C7.10925 1.0134 7.06027 1 7.01038 1C6.96049 1 6.91151 1.0134 6.86857 1.03881C6.82 1.06845 6.77972 1.1099 6.7515 1.15931C6.72559 1.20191 6.7121 1.2509 6.71256 1.30075L6.73436 2.83418C6.73877 2.90443 6.76988 2.97033 6.82131 3.01837C6.87275 3.06641 6.94061 3.09296 7.01099 3.09257C7.08171 3.09314 7.15002 3.06688 7.20215 3.0191C7.25058 2.97434 7.2808 2.9133 7.28702 2.84765V2.84692ZM3.35608 6.7863C3.42641 6.78211 3.49249 6.75122 3.5408 6.69994C3.58911 6.64865 3.61602 6.58086 3.61602 6.5104C3.61602 6.43995 3.58911 6.37215 3.5408 6.32087C3.49249 6.26959 3.42641 6.2387 3.35608 6.2345L1.77991 6.23352C1.73245 6.23143 1.68531 6.24235 1.64361 6.26512C1.60003 6.28961 1.56373 6.32523 1.53842 6.36835C1.51316 6.41121 1.49989 6.46007 1.5 6.50982C1.50011 6.55957 1.51358 6.60837 1.53902 6.65112C1.56446 6.69387 1.60092 6.729 1.6446 6.75283C1.68827 6.77665 1.73754 6.7883 1.78726 6.78655H3.35559L3.35608 6.7863ZM4.23656 4.10445C4.28943 4.14932 4.35729 4.17259 4.42657 4.16962C4.49586 4.16665 4.56147 4.13765 4.61031 4.08841C4.65699 4.04343 4.68394 3.98178 4.68525 3.91697C4.68472 3.84819 4.65937 3.78191 4.61386 3.73034L3.52054 2.60763C3.48669 2.57105 3.44357 2.54431 3.39575 2.53026C3.34793 2.5162 3.29719 2.51535 3.24893 2.52779C3.20098 2.54007 3.15726 2.56513 3.12243 2.60029L3.1152 2.60702C3.08375 2.64117 3.06132 2.68263 3.04993 2.72764C3.03503 2.78387 3.03402 2.84287 3.04699 2.89958C3.05645 2.94273 3.07843 2.98213 3.11018 3.01285L4.23681 4.10396L4.23656 4.10445ZM4.21366 8.90484L3.11569 10.0022L3.11043 10.0073C3.07896 10.0362 3.05654 10.0735 3.04589 10.1149C3.03416 10.1667 3.03551 10.2207 3.04981 10.2719V10.2726C3.06225 10.3205 3.08725 10.3642 3.12224 10.3992C3.15722 10.4341 3.20092 10.4591 3.24881 10.4716C3.30029 10.486 3.35454 10.4873 3.40666 10.4754C3.44798 10.4649 3.48532 10.4425 3.51405 10.411L4.62647 9.28434C4.66145 9.2451 4.68418 9.19648 4.69186 9.14448C4.69955 9.09248 4.69185 9.03936 4.66972 8.99168C4.64759 8.944 4.61199 8.90383 4.56732 8.87613C4.52264 8.84843 4.47084 8.8344 4.41829 8.83578C4.34443 8.83427 4.27231 8.85832 4.21415 8.90386L4.21366 8.90484ZM6.73448 11.7128C6.7328 11.7626 6.74451 11.812 6.7684 11.8557L6.7733 11.8657C6.79686 11.9049 6.82981 11.9377 6.86918 11.9611L6.87898 11.9673C6.92135 11.9897 6.9687 12.0009 7.0166 11.9999C7.0645 11.999 7.11137 11.9858 7.1528 11.9618C7.1965 11.9378 7.23344 11.9031 7.2602 11.861C7.28081 11.825 7.29056 11.7839 7.28824 11.7425L7.28738 10.1668C7.28337 10.0963 7.25245 10.0301 7.20102 9.98176C7.14959 9.93343 7.08157 9.90668 7.01099 9.90705C6.9356 9.9089 6.86365 9.93901 6.80942 9.99142C6.75474 10.0403 6.72042 10.1079 6.71329 10.1809L6.73448 11.7128ZM12.2345 6.78679C12.2842 6.78843 12.3334 6.77671 12.377 6.75287C12.4206 6.72902 12.457 6.69392 12.4825 6.65121C12.5079 6.6085 12.5214 6.55976 12.5216 6.51005C12.5218 6.46035 12.5087 6.4115 12.4836 6.3686C12.4571 6.32626 12.4195 6.292 12.3749 6.26953C12.3276 6.24438 12.2745 6.23201 12.2209 6.23365H12.214V6.23426H10.6534C10.5878 6.24051 10.5268 6.27067 10.482 6.319C10.4339 6.37108 10.4075 6.43944 10.4079 6.51028C10.4076 6.58059 10.4343 6.64834 10.4824 6.69964C10.5304 6.75094 10.5963 6.7819 10.6665 6.78618H12.2347L12.2345 6.78679ZM9.78751 4.11572L10.8851 3.01812L10.8904 3.01297C10.9275 2.97765 10.9544 2.93292 10.9681 2.88353C10.9832 2.8325 10.9846 2.77839 10.9721 2.72666C10.9596 2.67876 10.9346 2.63504 10.8996 2.60004C10.8646 2.56504 10.8208 2.54001 10.7729 2.52755C10.7247 2.51507 10.674 2.51592 10.6262 2.53C10.5784 2.54408 10.5353 2.57087 10.5016 2.60751L9.38719 3.73022C9.34541 3.77843 9.32352 3.84072 9.32596 3.90447C9.33051 3.97428 9.3611 4.03983 9.41168 4.08816C9.46334 4.13999 9.53255 4.17058 9.60566 4.17388C9.67106 4.17736 9.73547 4.1568 9.78677 4.11608L9.78751 4.11572Z" fill="black" fillOpacity="0.5" stroke="black" strokeOpacity="0.5" strokeWidth="1.5" />
  </svg>

);