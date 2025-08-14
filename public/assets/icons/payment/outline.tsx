import React from 'react';

interface PaymentOutlineIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    fill?: string;
    stroke?: string;
}

const PaymentOutlineIcon: React.FC<PaymentOutlineIconProps> = ({
    size = 24,
    fill = "none",
    stroke = "black",
    ...props
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 25"
        fill={fill}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M3.3457 16.6976L16.1747 3.86865M18.6316 11.5556L16.4321 13.7551M14.5549 15.6099L13.5762 16.5886" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3.17467 16.6411C1.60844 15.0749 1.60844 12.5355 3.17467 10.9693L10.4693 3.67467C12.0355 2.10844 14.5749 2.10844 16.1411 3.67467L20.8253 8.35891C22.3916 9.92514 22.3916 12.4645 20.8253 14.0307L13.5307 21.3253C11.9645 22.8916 9.42514 22.8916 7.85891 21.3253L3.17467 16.6411Z" stroke={stroke} strokeWidth="1.5"/>
        <path d="M4 22.5H20" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
);

export default PaymentOutlineIcon;