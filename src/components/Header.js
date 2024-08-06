import Link from 'next/link';
import React from 'react'
import { signOut } from 'next-auth/react';

function Header() {
    return (
        <header className='sticky top-0 z-50 bg-white px-4 py-2 shadow-sm'>
            <div className='max-w-4xl mx-auto'>
                <div className='flex items-center justify-between'>
                    <Link href='/' className='text-slate-500 dark:text-offwhite font-bold text-base md:text-2xl'>ShopFloor Managing App</Link>
                    <button onClick={() => signOut({ callbackUrl: '/login' })} className='px-2 py-1 rounded-md bg-red-700 text-gray-100 text-xs md:text-sm'>Log Out</button>
                </div>
            </div>
        </header>
    )
}

export default Header