import React from 'react';

interface SupportOutlineIconProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
}

const SupportOutlineIcon: React.FC<SupportOutlineIconProps> = ({
    width = 24,
    height = 25,
    fill = "none",
    stroke = "black",
    ...props
}) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 24 25"
        fill={fill}
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M17 11.3045C17 10.9588 17 10.786 17.052 10.632C17.2032 10.1844 17.6018 10.0108 18.0011 9.82888C18.45 9.62442 18.6744 9.52219 18.8968 9.5042C19.1493 9.48378 19.4022 9.53818 19.618 9.65929C19.9041 9.81984 20.1036 10.1249 20.3079 10.373C21.2513 11.5188 21.7229 12.0918 21.8955 12.7236C22.0348 13.2334 22.0348 13.7666 21.8955 14.2764C21.6438 15.1979 20.8485 15.9704 20.2598 16.6854C19.9587 17.0511 19.8081 17.234 19.618 17.3407C19.4022 17.4618 19.1493 17.5162 18.8968 17.4958C18.6744 17.4778 18.45 17.3756 18.0011 17.1711C17.6018 16.9892 17.2032 16.8156 17.052 16.368C17 16.214 17 16.0412 17 15.6955V11.3045Z" stroke={stroke} strokeWidth="1.5"/>
        <path d="M7 11.3046C7 10.8694 6.98778 10.4782 6.63591 10.1722C6.50793 10.0609 6.33825 9.98361 5.99891 9.82905C5.55001 9.62458 5.32556 9.52235 5.10316 9.50436C4.43591 9.4504 4.07692 9.90581 3.69213 10.3732C2.74875 11.519 2.27706 12.0919 2.10446 12.7237C1.96518 13.2336 1.96518 13.7668 2.10446 14.2766C2.3562 15.1981 3.15152 15.9705 3.74021 16.6856C4.11129 17.1363 4.46577 17.5475 5.10316 17.496C5.32556 17.478 5.55001 17.3757 5.99891 17.1713C6.33825 17.0167 6.50793 16.9394 6.63591 16.8281C6.98778 16.5221 7 16.131 7 15.6957V11.3046Z" stroke={stroke} strokeWidth="1.5"/>
        <path d="M5 9.5C5 6.18629 8.13401 3.5 12 3.5C15.866 3.5 19 6.18629 19 9.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="round"/>
        <path d="M19 17.5V18.3C19 20.0673 17.2091 21.5 15 21.5H13" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export default SupportOutlineIcon;
