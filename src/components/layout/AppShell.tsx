"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"

const publicRoutes = ["/login", "/signup"]

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    if (isPublicRoute) {
        return <>{children}</>
    }

    return (
        <>
            <Sidebar />
            <div className="lg:pl-64">
                <Header />
                <main className="min-h-screen bg-muted/30">
                    {children}
                </main>
            </div>
        </>
    )
}
