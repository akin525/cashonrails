import React from 'react';

interface FilterIconProps {
  className?: string; // Optional className for styling
  width?: number; // Optional width
  height?: number; // Optional height
  fill?: string; // Optional fill color
}

const FilterIcon: React.FC<FilterIconProps> = ({
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
      <path d="M5.83325 17.5V15" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.1667 17.5V12.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.1667 5V2.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.83325 7.5V2.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.83325 15C5.05669 15 4.6684 15 4.36211 14.8732C3.95374 14.704 3.62928 14.3795 3.46012 13.9712C3.33325 13.6648 3.33325 13.2766 3.33325 12.5C3.33325 11.7234 3.33325 11.3352 3.46012 11.0288C3.62928 10.6205 3.95374 10.296 4.36211 10.1268C4.6684 10 5.05669 10 5.83325 10C6.60982 10 6.9981 10 7.30439 10.1268C7.71277 10.296 8.03723 10.6205 8.20639 11.0288C8.33325 11.3352 8.33325 11.7234 8.33325 12.5C8.33325 13.2766 8.33325 13.6648 8.20639 13.9712C8.03723 14.3795 7.71277 14.704 7.30439 14.8732C6.9981 15 6.60982 15 5.83325 15Z" stroke="black" strokeWidth="1.5" />
      <path d="M14.1667 10C13.3902 10 13.0019 10 12.6956 9.87317C12.2872 9.704 11.9627 9.3795 11.7936 8.97117C11.6667 8.66483 11.6667 8.27657 11.6667 7.5C11.6667 6.72343 11.6667 6.33515 11.7936 6.02886C11.9627 5.62048 12.2872 5.29602 12.6956 5.12687C13.0019 5 13.3902 5 14.1667 5C14.9433 5 15.3316 5 15.6379 5.12687C16.0462 5.29602 16.3707 5.62048 16.5399 6.02886C16.6667 6.33515 16.6667 6.72343 16.6667 7.5C16.6667 8.27657 16.6667 8.66483 16.5399 8.97117C16.3707 9.3795 16.0462 9.704 15.6379 9.87317C15.3316 10 14.9433 10 14.1667 10Z" stroke="black" strokeWidth="1.5" />
    </svg>
  );
};

export default FilterIcon;
