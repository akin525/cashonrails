import React from 'react';

interface LogoProps {
    width?: string; // Optional width prop
    height?: string; // Optional height prop
    fillColor?: string; // Optional fill color prop
}

const Logo: React.FC<LogoProps> = ({ width = "40", height = "41", fillColor = "#0E2921" }) => (
    <svg width={width} height={height} viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10.6342V26.8397C50 39.6429 39.6213 50.0215 26.8181 50.0215H10.3649V40.7065C10.3814 40.5876 10.3979 40.472 10.4144 40.3531H40.2985L40.3084 20.4381V10.6309H50V10.6342Z" fill={fillColor}/>
        <path d="M40.5332 0.899902V10.2149C40.52 10.3338 40.5002 10.4495 40.4837 10.5684H10.5996L10.593 30.4834V40.2906H0.898102V24.0851C0.898102 11.2786 11.2801 0.899902 24.0833 0.899902H40.5365H40.5332Z" fill={fillColor}/>
        <path d="M31.3799 19.4077H19.3595V31.4281H31.3799V19.4077Z" fill={fillColor}/>
    </svg>
);

export default Logo;
