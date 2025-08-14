import React from 'react';

const Header = ({ name, theme }: { name?: string; theme?: string }) => {
    const isDark = theme === "dark";

    return (
        <div className={`flex items-center justify-between py-4 px-2 border-b ${isDark ? "border-gray-700" : "border-[#E4E7EC]"}`}>
            <div className="flex items-center space-x-4">
                <a href="#" className={`${isDark ? "text-gray-400" : "text-[#00000080]"} text-lg`}>
                    Merchant Approval
                </a>
                <span className={`${isDark ? "text-gray-500" : "text-gray-400"} font-medium`}>/</span>
                <a href="#" className={`${isDark ? "text-white hover:text-gray-300" : "text-black hover:text-gray-900"} font-medium text-lg`}>
                    {name ?? "N/A"}
                </a>
            </div>
        </div>
    );
};

export default Header;
