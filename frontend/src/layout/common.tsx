import { Navbar } from '@/components/navbar'
import { Outlet } from 'react-router'
import React from 'react'

export const CommonLayout: React.FC = () => {
    return (
        <main className='flex flex-col min-h-screen'>
            <Navbar />
            <main className='px-4 md:px-6'>
                <main className='mx-auto flex max-w-screen-2xl 2xl:max-w-screen'>
                    <Outlet />
                </main>
            </main>
        </main>
    )
}