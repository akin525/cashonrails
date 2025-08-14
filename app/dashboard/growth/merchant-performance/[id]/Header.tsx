"use client";
import React from 'react'
import { useRouter } from 'next/navigation';
const Header = ({ title }: {title: string}) => {
    const router = useRouter()
    return (
        <div className="flex items-center justify-between h-[96px] px-2 border-b border-[#E4E7EC]">
            <div className="flex items-center space-x-4">
                <button onClick={()=> router.back()} className="text-[#00000080] text-lg">Merchant Performance</button>
                <span className="text-gray-400 font-medium">/</span>
                <p className="text-black hover:text-gray-900 font-medium text-lg">{title}</p>
            </div>
        </div>
    )
}


export default Header