"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MobileSidebar } from "./Sidebar"
import { Activity, LogOut, User, Stethoscope, HeartPulse, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

type UserRole = "DOCTOR" | "NURSE"

export function Header() {
    const router = useRouter()
    const [user, setUser] = useState<{ email?: string; name?: string; role?: UserRole } | null>(null)

    useEffect(() => {
        async function getUser() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser({
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email?.split("@")[0],
                    role: user.user_metadata?.role || "DOCTOR",
                })
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        toast.success("Logged out successfully")
        router.push("/login")
        router.refresh()
    }

    const RoleIcon = user?.role === "NURSE" ? HeartPulse : Stethoscope
    const roleLabel = user?.role === "NURSE" ? "Nurse" : "Doctor"
    const roleColor = user?.role === "NURSE" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4">
            <div className="flex items-center gap-4">
                <div className="lg:hidden">
                    <MobileSidebar />
                </div>
                <div className="flex items-center gap-2 lg:hidden">
                    <Activity className="h-5 w-5 text-primary" />
                    <span className="text-lg font-bold">ConCag</span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                                <RoleIcon className="h-4 w-4 text-violet-600" />
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {user?.name || "User"}
                                </span>
                                <Badge variant="secondary" className={roleColor}>
                                    {roleLabel}
                                </Badge>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span>{user?.name}</span>
                                    <Badge variant="secondary" className={roleColor}>
                                        {roleLabel}
                                    </Badge>
                                </div>
                                <span className="text-xs font-normal text-muted-foreground">
                                    {user?.email}
                                </span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/profile" className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
