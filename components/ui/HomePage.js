import React, { useState } from 'react'
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ActionCards from './ActionCard';
import { IndianRupee, LayoutDashboard } from "lucide-react";
const HomePage = () => {
    const { user, loading, logout } = useAuth();
    const [loadCards, setLoadCards] = useState(false);
    const router = useRouter();
    useEffect(() => {
        if (!loading && !user) router.push("/");
        if(!loading && user) setLoadCards(true);
    }, [user, loading]);
  return (
    <>
        <div>
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
                
                {/* Left: Brand */}
                <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm">
                    <IndianRupee size={20} />
                </div>

                <div className="leading-tight">
                    <h1 className="text-base font-semibold text-gray-900">
                    ISM Fee Dashboard
                    </h1>
                    <p className="text-xs text-gray-500">
                    Student Fee & Due Management
                    </p>
                </div>
                </div>

                {/* Right: Page indicator */}
                <div className="hidden items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 sm:flex">
                <LayoutDashboard size={14} />
                Dashboard
                </div>
            </div>
            </header>
            <div className='p-5'>
                {loadCards && (
                    <ActionCards email={user.email} />
                )}
            </div>
        </div>
    </>
  )
}

export default HomePage