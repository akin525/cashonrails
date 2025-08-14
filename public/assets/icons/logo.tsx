import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 24, height = 24, className }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M16.5557 5.11883C15.7488 4.57099 14.8724 4.14848 13.9552 3.8602C12.7981 3.49648 12.2195 3.31462 11.6098 3.7715C11 4.22839 11 4.9705 11 6.45472V11.0064C11 12.2697 11 12.9013 11.2341 13.4676C11.4683 14.034 11.9122 14.4761 12.8 15.3604L15.999 18.5466C17.0421 19.5855 17.5637 20.105 18.3116 19.9823C19.0596 19.8597 19.3367 19.3125 19.8911 18.2182C20.3153 17.381 20.6251 16.4835 20.8079 15.5499C21.1937 13.5788 20.9957 11.5358 20.2388 9.67903C19.4819 7.82232 18.2002 6.23535 16.5557 5.11883Z" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M14 20.9185C13.0736 21.2935 12.0609 21.5 11 21.5C6.58172 21.5 3 17.9183 3 13.5C3 10.0631 5.16736 7.13232 8.20988 6" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;


