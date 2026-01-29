"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    Users,
    ClipboardList,
    Stethoscope,
    Activity,
    LayoutDashboard,
    Menu,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

const navItems = [
    {
        title: "Queue",
        href: "/queue",
        icon: LayoutDashboard,
    },
    {
        title: "Patients",
        href: "/patients",
        icon: Users,
    },
    {
        title: "Triage",
        href: "/triage",
        icon: ClipboardList,
    },
    {
        title: "Visits",
        href: "/visit",
        icon: Stethoscope,
    },
]

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside
            className={cn(
                "hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r bg-card",
                className
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 px-6 border-b bg-background">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-600">
                    <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
                    ConCag
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t">
                <div className="px-3 py-2 text-xs text-muted-foreground">
                    Triage & Visit Management
                </div>
            </div>
        </aside>
    )
}

export function MobileSidebar() {
    const pathname = usePathname()
    const [open, setOpen] = React.useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex h-16 items-center gap-2 px-6 border-b">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-600">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">ConCag</span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-violet-600 text-white"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    )
}
