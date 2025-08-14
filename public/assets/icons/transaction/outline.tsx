import React from 'react';

interface TransactionOutlineIconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    fill?: string;
    stroke?: string;
}

const TransactionOutlineIcon: React.FC<TransactionOutlineIconProps> = ({
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
        <path d="M21 13.002C21 18.2487 16.7467 22.502 11.5 22.502C6.25329 22.502 2 18.2487 2 13.002C2 7.75525 6.25329 3.50195 11.5 3.50195" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13.7046 7.88562L14.5805 5.27321C15.1261 3.64611 15.3989 2.83256 16.2494 2.57407C17.0999 2.31558 17.6633 2.75023 18.79 3.61953C19.5732 4.22378 20.2762 4.92682 20.8805 5.71C21.7498 6.83675 22.1844 7.40012 21.9259 8.25059C21.6674 9.10106 20.8539 9.37386 19.2268 9.91946L16.6144 10.7954C14.7053 11.4356 13.7508 11.7557 13.2475 11.2525C12.7443 10.7492 13.0644 9.7947 13.7046 7.88562Z" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
);

export default TransactionOutlineIcon;