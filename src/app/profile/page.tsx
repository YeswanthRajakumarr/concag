"use client"

import { useState, useEffect } from "react"
import { User, Mail, Shield, Calendar, Clock, Loader2, Activity } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getActiveVisits } from "@/lib/api"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export default function ProfilePage() {
    const [user, setUser] = useState<SupabaseUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        activePatients: 0,
        myPatients: 0
    })

    useEffect(() => {
        async function fetchProfile() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                setUser(user)

                // Fetch basic stats
                const visits = await getActiveVisits()
                const myActive = visits.filter(v =>
                    v.status === "WITH_DOCTOR" // Assuming 'assigned' logic might be complex, just counting 'WITH_DOCTOR' generally or filtering if we had doctor_id on visit (we don't strictly enforce it on visit row yet, usually in doctor_notes)
                )

                setStats({
                    activePatients: visits.length,
                    myPatients: myActive.length // This is a rough proxy for now
                })

            } catch (error) {
                console.error("Failed to load profile", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) return null

    const role = user.user_metadata?.role || "DOCTOR"
    const roleColor = role === "NURSE" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
    const initials = user.user_metadata?.full_name
        ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)
        : user.email?.substring(0, 2).toUpperCase()

    return (
        <div className="p-3 max-w-4xl mx-auto space-y-4">
            <h1 className="text-xl font-bold">My Profile</h1>

            <div className="grid md:grid-cols-3 gap-2">
                {/* ID Card */}
                <Card className="md:col-span-2">
                    <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Identity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                        <div className="flex items-start gap-4">
                            <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                <span className="text-2xl font-black text-violet-600">
                                    {initials}
                                </span>
                            </div>
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold">
                                        {user.user_metadata?.full_name || "Doctor"}
                                    </h2>
                                    <Badge variant="secondary" className={roleColor}>
                                        {role}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Shield className="h-3 w-3" />
                                    ID: <span className="font-mono text-xs">{user.id.substring(0, 8)}...</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader className="p-3 pb-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Todays Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-violet-500" />
                                <span className="text-sm font-medium">Queue Load</span>
                            </div>
                            <span className="text-lg font-bold">{stats.activePatients}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-emerald-500" />
                                <span className="text-sm font-medium">Active Consults</span>
                            </div>
                            <span className="text-lg font-bold">{stats.myPatients}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Account Details */}
            <Card>
                <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">System Information</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Account Created</label>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {new Date(user.created_at).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Last Sign In</label>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {new Date(user.last_sign_in_at || "").toLocaleString()}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
