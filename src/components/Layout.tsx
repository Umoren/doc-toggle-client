import Link from 'next/link'
import { ReactNode } from 'react'
import { SignedIn, SignedOut, SignOutButton, SignInButton } from '@clerk/nextjs'
import { Button } from './ui/button'
import { Toaster } from "@/components/ui/toaster"

interface LayoutProps {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
                        <div className="flex justify-start lg:w-0 lg:flex-1">
                            <Link href="/" className="text-xl font-bold text-gray-800">
                                Document Manager
                            </Link>
                        </div>
                        <nav className="hidden md:flex space-x-10">
                            <Link href="/categories" className="text-base font-medium text-gray-500 hover:text-gray-900">
                                Categories
                            </Link>
                            <Link href="/documents" className="text-base font-medium text-gray-500 hover:text-gray-900">
                                Documents
                            </Link>
                            {/* <Link href="/roles" className="text-base font-medium text-gray-500 hover:text-gray-900">
                                Roles
                            </Link> */}
                        </nav>
                        <div className="flex space-x-4">
                            <SignedOut>
                                <SignInButton>
                                    <Button className="bg-primary text-white">Sign In</Button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <SignOutButton>
                                    <Button className="bg-red-500 text-white">Sign Out</Button>
                                </SignOutButton>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <Toaster />
        </div>
    )
}
