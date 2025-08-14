import React from 'react';

interface BellOutlineIconProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
}

const BellOutlineIcon: React.FC<BellOutlineIconProps> = ({
    width = 20,
    height = 20,
    fill = "none",
    stroke = "black",
    ...props
}) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 20 20"
        fill={fill}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M2.10819 11.9951C1.93098 13.1227 2.72325 13.9052 3.69329 14.2952C7.41226 15.7906 12.5876 15.7906 16.3065 14.2952C17.2766 13.9052 18.0688 13.1227 17.8917 11.9951C17.7828 11.3022 17.2443 10.7252 16.8453 10.1617C16.3227 9.41466 16.2708 8.59983 16.2707 7.73292C16.2707 4.38267 13.4632 1.66675 9.99992 1.66675C6.53669 1.66675 3.72919 4.38267 3.72919 7.73292C3.72911 8.59983 3.67719 9.41466 3.15459 10.1617C2.75562 10.7252 2.21709 11.3022 2.10819 11.9951Z" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.5 17.5C8.16344 18.0182 9.03958 18.3333 10 18.3333C10.9604 18.3333 11.8366 18.0182 12.5 17.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default BellOutlineIcon;
