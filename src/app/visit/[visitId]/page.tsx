"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Lock,
    CheckCircle,
    Loader2,
    ClipboardCheck,
    Activity,
    FileSignature,
    Pill,
    History,
    User,
    ChevronDown,
    Save
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TriageSummary } from "@/components/triage/TriageSummary"
import { VitalsCharts } from "@/components/vitals/VitalsCharts"
import { DiagnosisForm } from "@/components/doctor/DiagnosisForm"
import { PrescriptionForm } from "@/components/doctor/PrescriptionForm"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import {
    getVisitById,
    updateVisitStatus,
    createPrescription,
    deletePrescription,
    createDoctorNote
} from "@/lib/api"
import type {
    Patient,
    TriageRecord,
    Vitals,
    Prescription,
} from "@/types/database"
import { cn } from "@/lib/utils"

export default function VisitPage({ params }: { params: Promise<{ visitId: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("diagnosis")
    const [isLocked, setIsLocked] = useState(false)

    const [patient, setPatient] = useState<Patient | null>(null)
    const [triage, setTriage] = useState<TriageRecord | null>(null)
    const [vitals, setVitals] = useState<Vitals[]>([])
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
    const [visitInfo, setVisitInfo] = useState<{ department?: string; visit_type?: string; status?: string }>({})

    const [diagnosis, setDiagnosis] = useState("")
    const [advice, setAdvice] = useState("")

    useEffect(() => {
        async function fetchVisit() {
            try {
                const visit = await getVisitById(resolvedParams.visitId)
                if (visit) {
                    setPatient(visit.patient as Patient)
                    setTriage(visit.triage_records?.[0] as TriageRecord || null)
                    setVitals(visit.vitals as Vitals[] || [])
                    setPrescriptions(visit.prescriptions as Prescription[] || [])
                    setVisitInfo({
                        department: visit.department,
                        visit_type: visit.visit_type,
                        status: visit.status,
                    })
                    setIsLocked(visit.status === "COMPLETED")

                    const diagnosisNote = visit.doctor_notes?.find((n: { note_type: string }) => n.note_type === "DIAGNOSIS")
                    if (diagnosisNote) {
                        setDiagnosis(diagnosisNote.content || "")
                    }
                }
            } catch (error) {
                console.error("Failed to fetch visit:", error)
                toast.error("Failed to load clinical record")
            } finally {
                setLoading(false)
            }
        }
        fetchVisit()
    }, [resolvedParams.visitId])

    const latestVitals = vitals.length > 0 ? vitals[vitals.length - 1] : null

    const handleAddPrescription = async (rx: {
        medication: string
        dosage?: string
        frequency?: string
        duration?: string
        notes?: string
    }) => {
        try {
            const newRx = await createPrescription({
                visit_id: resolvedParams.visitId,
                medication: rx.medication,
                dosage: rx.dosage,
                frequency: rx.frequency,
                duration: rx.duration,
                notes: rx.notes,
            })
            setPrescriptions((prev) => [...prev, newRx])
            toast.success("Prescription added to record")
        } catch (error) {
            console.error("Failed to add prescription:", error)
            toast.error("Failed to save prescription")
        }
    }

    const handleRemovePrescription = async (id: string) => {
        try {
            await deletePrescription(id)
            setPrescriptions((prev) => prev.filter((rx) => rx.id !== id))
            toast.success("Medication removed")
        } catch (error) {
            console.error("Failed to remove prescription:", error)
            toast.error("An error occurred")
        }
    }

    const handleSaveDiagnosis = async (values: { diagnosis: string; advice?: string }) => {
        try {
            await createDoctorNote({
                visit_id: resolvedParams.visitId,
                note_type: "DIAGNOSIS",
                content: values.diagnosis,
            })
            setDiagnosis(values.diagnosis)
            setAdvice(values.advice || "")
            toast.success("Clinical record updated")
        } catch (error) {
            console.error("Failed to save diagnosis:", error)
            toast.error("Failed to update record")
        }
    }

    const handleCompleteVisit = async () => {
        if (!diagnosis) {
            toast.error("Clinical diagnosis is required before completion")
            setActiveTab("diagnosis")
            return
        }

        setSaving(true)
        try {
            await updateVisitStatus(resolvedParams.visitId, "COMPLETED")
            setIsLocked(true)
            toast.success("Visit finalized and record locked")
            router.push("/queue")
        } catch (error) {
            console.error("Failed to complete visit:", error)
            toast.error("Failed to finalize record")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-muted/20">
                <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
            </div>
        )
    }

    if (!patient) return null

    return (
        <div className="min-h-screen bg-muted/20 pb-20 animate-in-fade">
            {/* Top Bar / Patient Quick Profile */}
            <div className="bg-white border-b px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-violet-600 flex items-center justify-center text-white font-bold shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                                {patient.name.charAt(0)}
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-black text-violet-900 leading-tight tracking-tight">{patient.name}</h1>
                                    {isLocked ? (
                                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 uppercase text-[9px] font-black border-slate-200">
                                            <Lock className="h-3 w-3 mr-1" />
                                            Record Locked
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 uppercase text-[9px] font-black border-emerald-200">Active Consult</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {patient.gender}, {patient.date_of_birth ? `${new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}Y` : "—"}</span>
                                    <span className="h-1 w-1 rounded-full bg-border" />
                                    <span className="uppercase tracking-widest">{visitInfo.department} • {visitInfo.visit_type}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isLocked && (
                            <>
                                <Button variant="outline" size="sm" className="hidden sm:flex border-violet-200 text-violet-700 hover:bg-violet-50 font-bold uppercase tracking-wider text-[10px]" onClick={() => handleSaveDiagnosis({ diagnosis, advice })}>
                                    <Save className="h-3 w-3 mr-2" />
                                    Save Draft
                                </Button>
                                <Button
                                    onClick={handleCompleteVisit}
                                    disabled={saving}
                                    className="bg-violet-900 hover:bg-black text-white px-6 shadow-xl shadow-violet-100 font-black uppercase tracking-widest text-xs h-11 rounded-xl gap-2"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                    Finalise Consult
                                </Button>
                            </>
                        )}
                        {isLocked && (
                            <Button variant="outline" className="font-bold gap-2">
                                <History className="h-4 w-4" />
                                Review History
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Clinical Workpanel */}
                <div className="lg:col-span-8 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-white p-1 rounded-xl shadow-sm border w-full flex overflow-x-auto justify-start h-auto">
                            <TabsTrigger value="diagnosis" className="flex-1 py-3 px-4 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm flex items-center gap-2">
                                <FileSignature className="h-4 w-4" />
                                <span className="hidden sm:inline">Diagnosis & Note</span>
                                <span className="sm:hidden">Note</span>
                            </TabsTrigger>
                            <TabsTrigger value="prescription" className="flex-1 py-3 px-4 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                <span className="hidden sm:inline">Prescriptions</span>
                                <span className="sm:hidden">Rx</span>
                            </TabsTrigger>
                            <TabsTrigger value="summary" className="flex-1 py-3 px-4 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4" />
                                <span className="hidden sm:inline">Triage Summary</span>
                                <span className="sm:hidden">Triage</span>
                            </TabsTrigger>
                            <TabsTrigger value="vitals-charts" className="flex-1 py-3 px-4 rounded-lg data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-sm flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                <span className="hidden sm:inline">Vitals Trends</span>
                                <span className="sm:hidden">Vitals</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                            <TabsContent value="diagnosis" className="mt-0 outline-none">
                                <DiagnosisForm
                                    initialDiagnosis={diagnosis}
                                    initialAdvice={advice}
                                    onSave={handleSaveDiagnosis}
                                    disabled={isLocked}
                                />
                            </TabsContent>

                            <TabsContent value="prescription" className="mt-0 outline-none">
                                <PrescriptionForm
                                    prescriptions={prescriptions}
                                    onAdd={handleAddPrescription}
                                    onRemove={handleRemovePrescription}
                                    disabled={isLocked}
                                />
                            </TabsContent>

                            <TabsContent value="summary" className="mt-0 outline-none">
                                {triage ? (
                                    <TriageSummary
                                        patient={patient}
                                        triage={triage}
                                        latestVitals={latestVitals}
                                    />
                                ) : (
                                    <Card className="border-dashed border-2 py-12">
                                        <CardContent className="flex flex-col items-center justify-center text-muted-foreground">
                                            <ClipboardCheck className="h-12 w-12 opacity-20 mb-4" />
                                            <p className="font-medium italic">Triage has not been performed for this visit.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="vitals-charts" className="mt-0 outline-none">
                                {vitals.length > 0 ? (
                                    <VitalsCharts vitals={vitals} />
                                ) : (
                                    <Card className="border-dashed border-2 py-12">
                                        <CardContent className="flex flex-col items-center justify-center text-muted-foreground">
                                            <Activity className="h-12 w-12 opacity-20 mb-4" />
                                            <p className="font-medium italic">No vital sign readings logged yet.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Patient Context Sidebar (Doctor's Quick Ref) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Chief Complaint Brief */}
                    {triage?.chief_complaint && (
                        <Card className="border-none shadow-lg bg-red-50/50 border-l-4 border-red-500 rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Primary Symptom</p>
                                <p className="text-xl font-black text-red-900 italic leading-tight">"{triage.chief_complaint}"</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Vitals Quick Glance */}
                    {latestVitals && (
                        <Card className="border-none shadow-lg rounded-2xl overflow-hidden">
                            <div className="bg-violet-900 px-6 py-3 flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-violet-300">Latest Vitals</p>
                                <span className="text-[9px] text-violet-400 font-bold">{new Date(latestVitals.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-2 divide-x divide-y border-b">
                                    <div className="p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">BP</span>
                                        <p className="text-xl font-black text-violet-900">{latestVitals.bp_systolic}/{latestVitals.bp_diastolic}</p>
                                        <span className="text-[8px] text-muted-foreground">mmHg</span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">SpO2</span>
                                        <p className="text-xl font-black text-emerald-600">{latestVitals.spo2}%</p>
                                        <span className="text-[8px] text-muted-foreground">Oxygen Sat</span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">Heart Rate</span>
                                        <p className="text-xl font-black text-violet-900">{latestVitals.heart_rate}</p>
                                        <span className="text-[8px] text-muted-foreground">bpm</span>
                                    </div>
                                    <div className="p-4 flex flex-col items-center justify-center text-center">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-70">Temp</span>
                                        <p className="text-xl font-black text-violet-900">{latestVitals.temperature}°C</p>
                                        <span className="text-[8px] text-muted-foreground">Degrees C</span>
                                    </div>
                                </div>
                                <Button variant="ghost" className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-violet-700 hover:bg-violet-50 transition-colors" onClick={() => setActiveTab("vitals-charts")}>
                                    View Full Analytics
                                    <ChevronDown className="h-3 w-3 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Labels / Risk Factors */}
                    <Card className="border-none shadow-lg rounded-2xl overflow-hidden bg-white">
                        <CardContent className="p-6 space-y-6">
                            {triage?.allergies && (
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                                        Drug Allergies
                                    </div>
                                    <p className="text-sm font-bold text-red-900 bg-red-50 p-3 rounded-lg border border-red-100">{triage.allergies}</p>
                                </div>
                            )}

                            {triage?.known_conditions && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-violet-800">Chronic Conditions</p>
                                    <div className="flex flex-wrap gap-2">
                                        {triage.known_conditions.split(",").map((cond, i) => (
                                            <Badge key={i} variant="secondary" className="bg-violet-50 text-violet-700 hover:bg-violet-50 border-violet-100 font-medium">{cond.trim()}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Clinical Assets</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button variant="outline" className="justify-start h-12 rounded-xl text-xs font-bold gap-3 border shadow-sm hover:border-violet-600 hover:bg-violet-600 hover:text-white transition-all">
                                        <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-white/20">
                                            <History className="h-3 w-3" />
                                        </div>
                                        Previous Visit History
                                    </Button>
                                    <Button variant="outline" className="justify-start h-12 rounded-xl text-xs font-bold gap-3 border shadow-sm hover:border-violet-600 hover:bg-violet-600 hover:text-white transition-all">
                                        <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-white/20">
                                            <Activity className="h-3 w-3" />
                                        </div>
                                        Imaging & Labs (PACS)
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
