"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Lock, Eye, EyeOff, Activity, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success("Welcome back!")
            router.push("/queue")
            router.refresh()
        } catch {
            toast.error("An error occurred during login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-4 animate-in-fade relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-600/5 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-green-600/5 blur-[100px] -z-10" />

            <Card className="w-full max-w-md border-none shadow-2xl bg-white/70 backdrop-blur-xl z-10 transition-all hover:shadow-emerald-200/50">
                <CardHeader className="text-center pb-8 pt-10">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-200 transform -rotate-6 hover:rotate-0 transition-transform">
                        <Activity className="text-white h-8 w-8" />
                    </div>
                    <div className="text-sm font-bold text-emerald-500 tracking-widest uppercase mb-2">App done using Antigravity</div>
                    <CardTitle className="text-3xl font-black text-emerald-900 tracking-tight">Lets Log U In</CardTitle>
                    <CardDescription className="text-muted-foreground mt-2 font-medium">
                        Secure Access to ConCag TVMS Portal
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6 px-8">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Identifier</Label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="doctor@hospital.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 pl-12 bg-muted/30 border-none shadow-inner focus-visible:ring-emerald-500 font-medium"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" title="Password Label" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Credentials</Label>
                                <Link href="#" className="text-[10px] font-bold text-emerald-600 uppercase hover:underline">Forgot?</Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-600 transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 pl-12 pr-12 bg-muted/30 border-none shadow-inner focus-visible:ring-emerald-500 font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-6 px-8 pb-10 pt-4">
                        <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-900 shadow-xl shadow-emerald-200 transition-all font-black uppercase tracking-widest text-xs rounded-xl gap-2" disabled={loading}>
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign In Portal <ChevronRight className="h-4 w-4" /></>}
                        </Button>
                        <div className="flex items-center gap-4 w-full">
                            <div className="h-px bg-muted flex-1" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">New to ConCag?</span>
                            <div className="h-px bg-muted flex-1" />
                        </div>
                        <Link href="/signup" className="w-full">
                            <Button variant="outline" type="button" className="w-full h-12 border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold uppercase tracking-wider text-[10px] rounded-xl">
                                Create Medical Account
                            </Button>
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
