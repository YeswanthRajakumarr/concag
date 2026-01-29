"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Lock, Eye, EyeOff, User, Stethoscope, HeartPulse, Activity, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type UserRole = "DOCTOR" | "NURSE"

export default function SignupPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [role, setRole] = useState<UserRole>("DOCTOR")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: role,
                    },
                },
            })

            if (error) {
                toast.error(error.message)
                return
            }

            toast.success("Account created! Please check your email to verify.")
            router.push("/login")
        } catch {
            toast.error("An error occurred during signup")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-violet-100 p-4 animate-in-fade relative overflow-hidden py-12">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-violet-600/5 blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-600/5 blur-[120px] -z-10" />

            <Card className="w-full max-w-xl border-none shadow-2xl bg-white/70 backdrop-blur-xl z-10">
                <CardHeader className="text-center pb-8 pt-10">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-violet-600 flex items-center justify-center mb-6 shadow-xl shadow-violet-200 transform -rotate-6 hover:rotate-0 transition-transform">
                        <Activity className="text-white h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-black text-violet-900 tracking-tight">Create Medical Account</CardTitle>
                    <CardDescription className="text-muted-foreground mt-2 font-medium">
                        Join the ConCag TVMS Network
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-8 px-8">
                        {/* Role Selection */}
                        <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Identity</Label>
                            <RadioGroup
                                value={role}
                                onValueChange={(v) => setRole(v as UserRole)}
                                className="grid grid-cols-2 gap-4"
                            >
                                <Label
                                    htmlFor="doctor"
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-transparent bg-muted/30 p-6 hover:bg-violet-50 transition-all cursor-pointer",
                                        role === "DOCTOR" && "border-violet-600 bg-white shadow-lg shadow-violet-100 ring-4 ring-violet-50"
                                    )}
                                >
                                    <RadioGroupItem value="DOCTOR" id="doctor" className="sr-only" />
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                                        role === "DOCTOR" ? "bg-violet-600 text-white" : "bg-white text-muted-foreground"
                                    )}>
                                        <Stethoscope className="h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className={cn("text-sm font-bold", role === "DOCTOR" ? "text-violet-900" : "text-muted-foreground")}>Doctor / Consultant</p>
                                        <p className="text-[10px] text-muted-foreground opacity-60">View & Diagnose</p>
                                    </div>
                                </Label>
                                <Label
                                    htmlFor="nurse"
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-transparent bg-muted/30 p-6 hover:bg-violet-50 transition-all cursor-pointer",
                                        role === "NURSE" && "border-violet-600 bg-white shadow-lg shadow-violet-100 ring-4 ring-violet-50"
                                    )}
                                >
                                    <RadioGroupItem value="NURSE" id="nurse" className="sr-only" />
                                    <div className={cn(
                                        "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                                        role === "NURSE" ? "bg-violet-600 text-white" : "bg-white text-muted-foreground"
                                    )}>
                                        <HeartPulse className="h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className={cn("text-sm font-bold", role === "NURSE" ? "text-violet-900" : "text-muted-foreground")}>Nursing / Triage Staff</p>
                                        <p className="text-[10px] text-muted-foreground opacity-60">Record Vitals & Prep</p>
                                    </div>
                                </Label>
                            </RadioGroup>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-violet-600 transition-colors" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder={role === "DOCTOR" ? "Dr. John Doe" : "Clara Smith"}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 pl-12 bg-muted/30 border-none shadow-inner focus-visible:ring-violet-500 font-medium"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Identifier</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-violet-600 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@hospital.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 pl-12 bg-muted/30 border-none shadow-inner focus-visible:ring-violet-500 font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="password" title="Password Label" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Credentials</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-violet-600 transition-colors" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 pl-12 pr-12 bg-muted/30 border-none shadow-inner focus-visible:ring-violet-500 font-medium"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" title="Confirm Password Label" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Verify Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-violet-600 transition-colors" />
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-12 pl-12 bg-muted/30 border-none shadow-inner focus-visible:ring-violet-500 font-medium"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-6 px-8 pb-10 pt-6">
                        <Button type="submit" className="w-full h-14 bg-violet-600 hover:bg-violet-900 shadow-xl shadow-violet-200 transition-all font-black uppercase tracking-widest text-xs rounded-xl gap-2" disabled={loading}>
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Initialize Medical Profile <ChevronRight className="h-4 w-4" /></>}
                        </Button>
                        <p className="text-sm text-muted-foreground font-medium">
                            Already part of the network?{" "}
                            <Link href="/login" className="text-violet-600 hover:underline font-bold">
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
