interface LogoProps {
    width: number; // Optional width prop
    height: number; // Optional height prop
    fillColor?: string; // Optional fill color prop
}

export default function Logo({ width, height, fillColor }: LogoProps) {
    return (
        <svg width={width || 60} height={height || 60} viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="84" height="84" rx="15" fill="#05E47A" />
            <path d="M67 27.6342V43.8397C67 56.6429 56.6213 67.0215 43.8181 67.0215H27.3649V57.7065C27.3814 57.5876 27.3979 57.472 27.4144 57.3531H57.2985L57.3084 37.4381V27.6309H67V27.6342Z" fill={fillColor || ''} />
            <path d="M57.5332 17.8994V27.2144C57.52 27.3334 57.5002 27.449 57.4837 27.5679H27.5996L27.593 47.4829V57.2901H17.8981V41.0846C17.8981 28.2781 28.2801 17.8994 41.0833 17.8994H57.5365H57.5332Z" fill={fillColor || ''} />
            <path d="M48.3799 36.4072H36.3595V48.4276H48.3799V36.4072Z" fill={fillColor || ''} />
        </svg>
    )
}