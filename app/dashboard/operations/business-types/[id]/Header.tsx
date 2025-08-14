import React from 'react'

const Header = () => {
    return (
        <div className="flex items-center justify-between h-[96px] px-2 border-b border-[#E4E7EC]">
            <div className="flex items-center space-x-4">
                <a href="#" className="text-[#00000080] text-lg">Merchants</a>
                <span className="text-gray-400 font-medium">/</span>
                <a href="#" className="text-black hover:text-gray-900 font-medium text-lg">GreenMart</a>
            </div>
            <button className="bg-[#FF5656] text-white font-medium text-sm py-2 px-4 rounded-md">
                Blacklist Merchant
            </button>
        </div>
    )
}

export default Header