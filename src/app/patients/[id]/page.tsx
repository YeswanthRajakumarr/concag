"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Edit,
    Plus,
    User,
    Loader2,
    Calendar,
    Phone,
    Activity,
    Clipboard,
    Database,
    History,
    TrendingUp,
    FileText,
    History as HistoryIcon,
    Stethoscope
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { getVitalStatus } from "@/lib/constants"
import { getPatientById, getVitalsByPatientId } from "@/lib/api"
import { toast } from "sonner"
import type { Patient, Vitals } from "@/types/database"

function calculateAge(dob: string | null | undefined): string {
    if (!dob) return "—"
    const birth = new Date(dob)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()
    const finalMonths = months >= 0 ? months : 12 + months
    return `${years} yrs${finalMonths > 0 ? `, ${finalMonths} mths` : ""}`
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })
}

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    })
}

function VitalValue({
    value,
    vitalKey,
    unit
}: {
    value: number | null | undefined
    vitalKey?: keyof typeof import("@/lib/constants").VITALS_THRESHOLDS
    unit?: string
}) {
    if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>

    const status = vitalKey ? getVitalStatus(vitalKey, value) : "normal"

    return (
        <div className="flex flex-col">
            <span className={cn(
                "text-2xl font-bold tracking-tight",
                status === "critical" && "text-red-500",
                status === "warning" && "text-amber-500",
                status === "normal" && "text-violet-900"
            )}>
                {value}
                <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
            </span>
            {status !== "normal" && (
                <span className={cn(
                    "text-[10px] uppercase font-bold tracking-wider",
                    status === "critical" && "text-red-500",
                    status === "warning" && "text-amber-500"
                )}>
                    {status}
                </span>
            )}
        </div>
    )
}

export default function PatientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [patient, setPatient] = useState<Patient | null>(null)
    const [vitals, setVitals] = useState<Vitals[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("history")

    useEffect(() => {
        async function fetchData() {
            try {
                const patientId = params.id as string
                const [patientData, vitalsData] = await Promise.all([
                    getPatientById(patientId),
                    getVitalsByPatientId(patientId),
                ])
                setPatient(patientData)
                setVitals(vitalsData)
            } catch (error) {
                console.error("Failed to fetch patient:", error)
                toast.error("Failed to load patient data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
            </div>
        )
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <User className="h-8 w-8" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold">Patient not found</p>
                    <p className="text-muted-foreground">The record you are looking for doesn't exist.</p>
                </div>
                <Button onClick={() => router.push("/patients")} variant="outline">
                    Back to Patient List
                </Button>
            </div>
        )
    }

    const latestVitals = vitals[0]

    return (
        <div className="min-h-screen bg-muted/20 animate-in-fade">
            {/* Top Bar with Navigation */}
            <div className="bg-white border-b px-6 py-3 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-8 w-px bg-border mx-2" />
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold shadow-md">
                        {patient.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">{patient.name}</h1>
                        <p className="text-xs text-muted-foreground font-mono">ID: {patient.id.toUpperCase()}</p>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 shadow-md">
                        <Plus className="h-4 w-4 mr-2" />
                        New Visit
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-[1600px] mx-auto">
                {/* Left Profile Sidebar */}
                <div className="w-full lg:w-80 space-y-6">
                    <Card className="border-none shadow-xl bg-violet-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <User size={120} />
                        </div>
                        <CardContent className="p-6 pt-10">
                            <div className="space-y-6 relative z-10">
                                <div className="space-y-1">
                                    <h3 className="text-xs uppercase font-black tracking-widest text-violet-300 opacity-70">Patient Information</h3>
                                    <p className="text-2xl font-bold">{patient.name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-violet-300">Gender</span>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-violet-700/50 hover:bg-violet-700/50 border-violet-400 text-white">
                                                {patient.gender || "Not specified"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-bold text-violet-300">Age</span>
                                        <p className="font-semibold text-lg">{calculateAge(patient.date_of_birth)}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-violet-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-violet-700/50 flex items-center justify-center">
                                            <Calendar className="h-4 w-4 text-violet-200" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-violet-300">Date of Birth</p>
                                            <p className="text-sm font-medium">{formatDate(patient.date_of_birth || "")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-violet-700/50 flex items-center justify-center">
                                            <Phone className="h-4 w-4 text-violet-200" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-violet-300">Phone</p>
                                            <p className="text-sm font-medium">{patient.phone || "—"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-white rounded-xl shadow-sm border p-2 space-y-1">
                        {[
                            { icon: Clipboard, label: "Medical Summary", active: true },
                            { icon: Activity, label: "Vitals History" },
                            { icon: FileText, label: "Visit Notes" },
                            { icon: Database, label: "Lab Reports" },
                            { icon: Stethoscope, label: "Prescriptions" },
                            { icon: HistoryIcon, label: "Audit Logs" },
                        ].map((item, i) => (
                            <button
                                key={i}
                                className={cn(
                                    "w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all",
                                    item.active
                                        ? "bg-violet-600 text-white shadow-md shadow-violet-100"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Main Content */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-violet-600" />
                            <h2 className="text-xl font-bold tracking-tight">Vitals & Trends</h2>
                        </div>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                            <TabsList className="grid w-[300px] grid-cols-2">
                                <TabsTrigger value="history">History View</TabsTrigger>
                                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {/* Latest Vitals Card Cluster */}
                        <Card className="col-span-full border-none shadow-xl bg-card overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Recent Vitals Reading</CardTitle>
                                        <CardDescription>
                                            {latestVitals
                                                ? `Recorded on ${formatDateTime(latestVitals.recorded_at)}`
                                                : "No vitals recorded yet"}
                                        </CardDescription>
                                    </div>
                                    {latestVitals && (
                                        <Badge variant="outline" className="bg-white border-violet-200 text-violet-700">
                                            Current
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {latestVitals ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
                                        <VitalValue value={latestVitals.bp_systolic} vitalKey="bp_systolic" unit={`/${latestVitals.bp_diastolic} BP`} />
                                        <VitalValue value={latestVitals.heart_rate} vitalKey="heart_rate" unit="BPM" />
                                        <VitalValue value={latestVitals.respiratory_rate} vitalKey="respiratory_rate" unit="RPM" />
                                        <VitalValue value={latestVitals.spo2} vitalKey="spo2" unit="% SpO2" />
                                        <VitalValue value={latestVitals.temperature} vitalKey="temperature" unit="°C" />
                                        <VitalValue value={latestVitals.bmi} unit="BMI" />
                                    </div>
                                ) : (
                                    <div className="py-8 text-center space-y-3">
                                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                                            <Activity className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground">No vitals data available for this patient.</p>
                                        <Button variant="outline" size="sm">Record Initial Vitals</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity / Visits */}
                        <Card className="md:col-span-2 shadow-lg border-none">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <History className="h-5 w-5 text-violet-600" />
                                        Vitals History
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50">
                                        View Full History
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {vitals.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/50 border-y">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="py-3 px-6">Timestamp</TableHead>
                                                    <TableHead>BP</TableHead>
                                                    <TableHead>Pulse</TableHead>
                                                    <TableHead>R. Rate</TableHead>
                                                    <TableHead>SpO2</TableHead>
                                                    <TableHead className="text-right px-6">Temp</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {vitals.slice(0, 5).map((vital) => (
                                                    <TableRow key={vital.id} className="hover:bg-muted/30 transition-colors">
                                                        <TableCell className="py-4 px-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold">{formatDate(vital.recorded_at)}</span>
                                                                <span className="text-[10px] text-muted-foreground">{new Date(vital.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-medium">{vital.bp_systolic}/{vital.bp_diastolic}</span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">{vital.heart_rate || "—"}</Badge>
                                                        </TableCell>
                                                        <TableCell>{vital.respiratory_rate || "—"}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className={cn(
                                                                getVitalStatus("spo2", vital.spo2) === "normal" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                                            )}>
                                                                {vital.spo2}%
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right px-6">
                                                            <span className="font-mono">{vital.temperature}°C</span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-muted-foreground">
                                        No history records available
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Visits / Appointments Quick View */}
                        <Card className="shadow-lg border-none">
                            <CardHeader>
                                <CardTitle className="text-lg">Recent Visits</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="group p-3 rounded-xl border bg-card hover:bg-violet-50/50 hover:border-violet-200 transition-all cursor-pointer">
                                            <div className="flex items-start justify-between mb-1">
                                                <span className="text-xs font-bold text-violet-700">OPD VISIT</span>
                                                <span className="text-[10px] text-muted-foreground">12 JAN, 2024</span>
                                            </div>
                                            <p className="text-sm font-semibold truncate group-hover:text-violet-900 transition-colors">Orthopaedics - Knee Pain</p>
                                            <p className="text-[11px] text-muted-foreground mt-1">Diagnosis: Left Knee Tendonitis</p>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full text-xs" size="sm">
                                    View All Visits
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
