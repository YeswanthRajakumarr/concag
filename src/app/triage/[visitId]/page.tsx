"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Clipboard, Activity, FileText, CheckCircle, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { VitalsForm } from "@/components/vitals/VitalsForm"
import { TriageSummary } from "@/components/triage/TriageSummary"
import { toast } from "sonner"
import { SYMPTOM_LABELS } from "@/lib/constants"
import { getVisitById, createOrUpdateTriage, createVitals, updateVisitStatus } from "@/lib/api"
import type { TriageInput, VitalsInput, Patient, TriageRecord, Vitals, SymptomsData } from "@/types/database"
import { cn } from "@/lib/utils"

const symptomsList = ["fever", "cough", "breathlessness", "pain", "vomiting", "dizziness", "injury"] as const

const TriageSteps = [
    { id: "complaint", label: "Complaint", icon: FileText },
    { id: "symptoms", label: "Signs & Pain", icon: Activity },
    { id: "history", label: "History", icon: Clipboard },
    { id: "vitals", label: "Vitals", icon: Stethoscope },
    { id: "summary", label: "Review", icon: CheckCircle },
]

export default function TriagePage({ params }: { params: Promise<{ visitId: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("complaint")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [patient, setPatient] = useState<Patient | null>(null)
    const [existingTriage, setExistingTriage] = useState<TriageRecord | null>(null)
    const [existingVitals, setExistingVitals] = useState<Vitals | null>(null)

    const [triage, setTriage] = useState<Partial<TriageInput>>({
        symptoms: {},
        pain_score: 0,
    })

    const [vitals, setVitals] = useState<Partial<VitalsInput>>({
        context: "TRIAGE",
    })

    useEffect(() => {
        async function fetchVisit() {
            try {
                const visit = await getVisitById(resolvedParams.visitId)
                if (visit?.patient) {
                    setPatient(visit.patient as Patient)
                }
                if (visit?.triage_records?.[0]) {
                    const tr = visit.triage_records[0] as TriageRecord
                    setExistingTriage(tr)
                    setTriage({
                        chief_complaint: tr.chief_complaint || "",
                        symptoms: tr.symptoms || {},
                        pain_score: tr.pain_score || 0,
                        known_conditions: tr.known_conditions || "",
                        medications: tr.medications || "",
                        allergies: tr.allergies || "",
                        past_surgeries: tr.past_surgeries || "",
                        notes: tr.notes || "",
                    })
                }
                if (visit?.vitals?.[0]) {
                    const v = visit.vitals[0] as Vitals
                    setExistingVitals(v)
                    setVitals({
                        context: "TRIAGE",
                        bp_systolic: v.bp_systolic || undefined,
                        bp_diastolic: v.bp_diastolic || undefined,
                        heart_rate: v.heart_rate || undefined,
                        respiratory_rate: v.respiratory_rate || undefined,
                        spo2: v.spo2 || undefined,
                        temperature: v.temperature || undefined,
                        weight: v.weight || undefined,
                        height: v.height || undefined,
                    })
                }
            } catch (error) {
                console.error("Failed to fetch visit:", error)
                toast.error("Failed to load visit data")
            } finally {
                setLoading(false)
            }
        }
        fetchVisit()
    }, [resolvedParams.visitId])

    const handleSymptomChange = (symptom: string, checked: boolean) => {
        setTriage((prev) => ({
            ...prev,
            symptoms: {
                ...(prev.symptoms as SymptomsData),
                [symptom]: checked,
            },
        }))
    }

    const handleSendToDoctor = async () => {
        setSaving(true)
        try {
            await createOrUpdateTriage({
                visit_id: resolvedParams.visitId,
                chief_complaint: triage.chief_complaint,
                symptoms: triage.symptoms as Record<string, boolean | string>,
                pain_score: triage.pain_score,
                known_conditions: triage.known_conditions,
                medications: triage.medications,
                allergies: triage.allergies,
                past_surgeries: triage.past_surgeries,
                notes: triage.notes,
            })

            if (Object.values(vitals).some(v => v !== undefined && v !== "TRIAGE")) {
                await createVitals({
                    visit_id: resolvedParams.visitId,
                    context: "TRIAGE",
                    bp_systolic: vitals.bp_systolic,
                    bp_diastolic: vitals.bp_diastolic,
                    heart_rate: vitals.heart_rate,
                    respiratory_rate: vitals.respiratory_rate,
                    spo2: vitals.spo2,
                    temperature: vitals.temperature,
                    weight: vitals.weight,
                    height: vitals.height,
                })
            }

            await updateVisitStatus(resolvedParams.visitId, "READY_FOR_DOCTOR")
            toast.success("Patient assessment completed and sent to doctor")
            router.push("/queue")
        } catch (error) {
            console.error("Failed to save triage:", error)
            toast.error("Failed to finalise assessment")
        } finally {
            setSaving(false)
        }
    }

    const triageAsRecord: TriageRecord = {
        id: existingTriage?.id || "temp",
        visit_id: resolvedParams.visitId,
        chief_complaint: triage.chief_complaint || null,
        symptoms: triage.symptoms as SymptomsData,
        pain_score: triage.pain_score ?? null,
        known_conditions: triage.known_conditions || null,
        medications: triage.medications || null,
        allergies: triage.allergies || null,
        past_surgeries: triage.past_surgeries || null,
        notes: triage.notes || null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    const vitalsAsRecord: Vitals | null = (vitals.bp_systolic || vitals.heart_rate || vitals.temperature) ? {
        id: existingVitals?.id || "temp",
        visit_id: resolvedParams.visitId,
        recorded_by: null,
        recorded_at: new Date().toISOString(),
        context: "TRIAGE",
        bp_systolic: vitals.bp_systolic ?? null,
        bp_diastolic: vitals.bp_diastolic ?? null,
        heart_rate: vitals.heart_rate ?? null,
        respiratory_rate: vitals.respiratory_rate ?? null,
        spo2: vitals.spo2 ?? null,
        temperature: vitals.temperature ?? null,
        weight: vitals.weight ?? null,
        height: vitals.height ?? null,
        bmi: null,
    } : null

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/20 pb-20">
                <div className="bg-white border-b sticky top-0 z-30 shadow-sm px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="h-6 w-px bg-border" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                </div>
                <div className="max-w-[1000px] mx-auto p-3 space-y-3 mt-2">
                    <Skeleton className="h-10 w-full" />
                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="p-4">
                            <Skeleton className="h-[150px] w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const currentIndex = TriageSteps.findIndex(s => s.id === activeTab)

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            {/* Standard Density Header */}
            <div className="bg-white border-b sticky top-0 z-30 shadow-sm px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Triage</span>
                        <Badge variant="outline" className="font-normal text-xs">{patient?.name}</Badge>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    {TriageSteps.map((step, idx) => {
                        const Icon = step.icon
                        const isCompleted = idx < currentIndex
                        const isActive = idx === currentIndex
                        return (
                            <div key={step.id} className={cn(
                                "flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                                isActive ? "bg-primary text-primary-foreground" :
                                    isCompleted ? "text-emerald-600" : "text-muted-foreground"
                            )}>
                                <Icon className="h-3 w-3" />
                                <span className="hidden lg:inline">{step.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto p-3 space-y-3 mt-2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Chief Complaint */}
                    <TabsContent value="complaint" className="mt-0 outline-none">
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base">Primary Concern</CardTitle>
                                <CardDescription>Patient's chief complaint in their own words</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4">
                                <Textarea
                                    placeholder="e.g. Severe lower back pain..."
                                    value={triage.chief_complaint || ""}
                                    onChange={(e) =>
                                        setTriage((prev) => ({ ...prev, chief_complaint: e.target.value }))
                                    }
                                    className="min-h-[150px]"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Symptoms */}
                    <TabsContent value="symptoms" className="mt-0 outline-none space-y-3">
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base">Signs & Symptoms</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    {symptomsList.map((symptom) => {
                                        const isChecked = (triage.symptoms as SymptomsData)?.[symptom] || false
                                        return (
                                            <div key={symptom} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                                                <Checkbox
                                                    id={symptom}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handleSymptomChange(symptom, checked as boolean)}
                                                />
                                                <Label htmlFor={symptom} className="text-sm font-medium cursor-pointer flex-1">
                                                    {SYMPTOM_LABELS[symptom]}
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="other" className="text-xs text-muted-foreground">Other specific signs</Label>
                                    <Input
                                        id="other"
                                        placeholder="Comma separated..."
                                        value={(triage.symptoms as SymptomsData)?.other || ""}
                                        onChange={(e) =>
                                            setTriage((prev) => ({
                                                ...prev,
                                                symptoms: { ...(prev.symptoms as SymptomsData), other: e.target.value },
                                            }))
                                        }
                                        className="h-9"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base">Pain Score (0-10)</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-center gap-4 py-4">
                                    <span className="text-sm font-medium w-6 text-center">{triage.pain_score}</span>
                                    <Slider
                                        value={[triage.pain_score || 0]}
                                        onValueChange={([value]) => setTriage((prev) => ({ ...prev, pain_score: value }))}
                                        max={10}
                                        step={1}
                                        className="flex-1"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History */}
                    <TabsContent value="history" className="mt-0 outline-none">
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base">Medical History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Known Conditions</Label>
                                        <Textarea
                                            value={triage.known_conditions || ""}
                                            onChange={(e) => setTriage((prev) => ({ ...prev, known_conditions: e.target.value }))}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Medications</Label>
                                        <Textarea
                                            value={triage.medications || ""}
                                            onChange={(e) => setTriage((prev) => ({ ...prev, medications: e.target.value }))}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-red-600 font-medium">Allergies</Label>
                                    <Input
                                        value={triage.allergies || ""}
                                        onChange={(e) => setTriage((prev) => ({ ...prev, allergies: e.target.value }))}
                                        className="border-red-200 focus-visible:ring-red-500"
                                        placeholder="List any allergies..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Notes</Label>
                                    <Textarea
                                        value={triage.notes || ""}
                                        onChange={(e) => setTriage((prev) => ({ ...prev, notes: e.target.value }))}
                                        className="min-h-[80px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Vitals */}
                    <TabsContent value="vitals" className="mt-0 outline-none">
                        <Card>
                            <CardHeader className="p-4 pb-0">
                                <CardTitle className="text-base">Vitals Check</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <VitalsForm values={vitals} onChange={setVitals} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Summary */}
                    <TabsContent value="summary" className="mt-0 outline-none">
                        {patient && (
                            <TriageSummary
                                patient={patient}
                                triage={triageAsRecord}
                                latestVitals={vitalsAsRecord}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Bottom Floating Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-3 z-40 lg:ml-56">
                <div className="max-w-[1000px] mx-auto flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentIndex === 0}
                        onClick={() => setActiveTab(TriageSteps[currentIndex - 1].id)}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>

                    <div className="text-xs text-muted-foreground font-medium hidden sm:block">
                        Step {currentIndex + 1} of {TriageSteps.length}
                    </div>

                    {currentIndex === TriageSteps.length - 1 ? (
                        <Button
                            onClick={handleSendToDoctor}
                            disabled={saving}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {saving ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Complete
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setActiveTab(TriageSteps[currentIndex + 1].id)}
                            size="sm"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
