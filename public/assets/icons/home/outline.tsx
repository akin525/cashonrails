import React from 'react';

interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
    size?: string| number; // Optional size prop
    stroke?: string; // Optional stroke color for the icon
}

const CustomIcon: React.FC<CustomIconProps> = ({
    size = "25", // Default size
    stroke = "black", // Default stroke color
    ...props
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M7.08848 5.26243L6.08847 6.04298C4.57181 7.22681 3.81348 7.81873 3.40674 8.65333C3 9.48792 3 10.452 3 12.3803V14.4715C3 18.2562 3 20.1485 4.17157 21.3243C5.34315 22.5 7.22876 22.5 11 22.5H13C16.7712 22.5 18.6569 22.5 19.8284 21.3243C21 20.1485 21 18.2562 21 14.4715V12.3803C21 10.452 21 9.48792 20.5933 8.65333C20.1865 7.81873 19.4282 7.22681 17.9115 6.04298L16.9115 5.26243C14.5521 3.42081 13.3724 2.5 12 2.5C10.6276 2.5 9.44787 3.42081 7.08848 5.26243Z"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
        <path
            d="M15 17H17V19M15 17V19H17M15 17L17 19"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
        />
    </svg>
);

export default CustomIcon;