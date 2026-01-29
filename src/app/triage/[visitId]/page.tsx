"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Loader2, Clipboard, Activity, FileText, CheckCircle, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
            <div className="flex items-center justify-center min-h-screen bg-muted/20">
                <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
            </div>
        )
    }

    const currentIndex = TriageSteps.findIndex(s => s.id === activeTab)

    return (
        <div className="min-h-screen bg-muted/20 pb-20 animate-in-fade">
            {/* Header Area */}
            <div className="bg-white border-b px-6 py-4 sticky top-0 z-30 shadow-sm overflow-hidden">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-violet-600/5 -skew-x-12 transform translate-x-1/2" />
                <div className="max-w-[1200px] mx-auto flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="h-10 w-px bg-border mx-1" />
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-black text-violet-900 leading-none">
                                Triage Assessment
                            </h1>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-none px-2 py-0 h-5 text-[10px] font-black uppercase tracking-widest">In Progress</Badge>
                                <span className="text-sm font-medium text-muted-foreground">{patient?.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        {TriageSteps.map((step, idx) => {
                            const Icon = step.icon
                            const isCompleted = idx < currentIndex
                            const isActive = idx === currentIndex
                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-bold uppercase tracking-wider",
                                        isActive && "bg-violet-600 text-white shadow-lg shadow-violet-200",
                                        isCompleted && "bg-emerald-500 text-white",
                                        !isActive && !isCompleted && "text-muted-foreground hover:bg-muted"
                                    )}>
                                        {isCompleted ? <CheckCircle className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                                        <span className="hidden lg:block">{step.label}</span>
                                    </div>
                                    {idx < TriageSteps.length - 1 && (
                                        <div className="w-4 h-px bg-border mx-1" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto p-6 space-y-8 mt-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    {/* Chief Complaint */}
                    <TabsContent value="complaint" className="animate-in-slide-up outline-none">
                        <Card className="border-none shadow-xl overflow-hidden">
                            <CardHeader className="bg-violet-900 text-white p-8">
                                <CardTitle className="text-3xl font-black italic">What is the primary concern?</CardTitle>
                                <CardDescription className="text-violet-200 text-lg">Record the patient's chief complaint in their own words if possible.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <Textarea
                                    placeholder="e.g., Severe lower back pain radiating down left leg for 3 days..."
                                    value={triage.chief_complaint || ""}
                                    onChange={(e) =>
                                        setTriage((prev) => ({ ...prev, chief_complaint: e.target.value }))
                                    }
                                    className="min-h-[250px] text-xl p-6 bg-muted/30 border-none shadow-inner resize-none focus-visible:ring-violet-500"
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Symptoms */}
                    <TabsContent value="symptoms" className="animate-in-slide-up outline-none space-y-8">
                        <Card className="border-none shadow-xl">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-2xl font-black">Associated Symptoms</CardTitle>
                                <CardDescription>Tick any signs or symptoms the patient is experiencing.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {symptomsList.map((symptom) => {
                                        const isChecked = (triage.symptoms as SymptomsData)?.[symptom] || false
                                        return (
                                            <div
                                                key={symptom}
                                                onClick={() => handleSymptomChange(symptom, !isChecked)}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none",
                                                    isChecked
                                                        ? "bg-violet-600 border-violet-600 shadow-lg shadow-violet-100 text-white"
                                                        : "bg-background hover:bg-muted border-border text-muted-foreground"
                                                )}
                                            >
                                                <Checkbox
                                                    id={symptom}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handleSymptomChange(symptom, checked as boolean)}
                                                    className={cn("border-white/20", isChecked && "bg-white text-violet-600")}
                                                />
                                                <Label htmlFor={symptom} className="font-bold cursor-pointer">{SYMPTOM_LABELS[symptom]}</Label>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="space-y-3 pt-4">
                                    <Label htmlFor="other" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Other specific signs</Label>
                                    <Input
                                        id="other"
                                        placeholder="Comma separated symptoms..."
                                        value={(triage.symptoms as SymptomsData)?.other || ""}
                                        onChange={(e) =>
                                            setTriage((prev) => ({
                                                ...prev,
                                                symptoms: {
                                                    ...(prev.symptoms as SymptomsData),
                                                    other: e.target.value,
                                                },
                                            }))
                                        }
                                        className="h-12 bg-muted/30 border-none shadow-inner"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-xl bg-violet-900 text-white overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-2xl font-black">Pain Assessment</CardTitle>
                                <CardDescription className="text-violet-300">Evaluate pain intensity using the numeric rating scale.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-12">
                                <div className="pt-6">
                                    <Slider
                                        value={[triage.pain_score || 0]}
                                        onValueChange={([value]) =>
                                            setTriage((prev) => ({ ...prev, pain_score: value }))
                                        }
                                        max={10}
                                        step={1}
                                        className="py-4"
                                    />
                                </div>
                                <div className="flex justify-between items-center relative">
                                    <div className="text-center w-1/4">
                                        <p className="text-3xl">😊</p>
                                        <p className="text-[10px] font-black uppercase text-violet-400 mt-2">Zero</p>
                                    </div>
                                    <div className="absolute left-1/2 -translate-x-1/2 -top-4 flex flex-col items-center">
                                        <div className={cn(
                                            "h-20 w-20 rounded-full flex items-center justify-center border-4 border-white shadow-2xl transition-all duration-300 scale-125",
                                            triage.pain_score! >= 8 ? "bg-red-500" :
                                                triage.pain_score! >= 5 ? "bg-amber-500" : "bg-emerald-500"
                                        )}>
                                            <span className="text-4xl font-black tracking-tighter">{triage.pain_score}</span>
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest mt-4">Selected Score</p>
                                    </div>
                                    <div className="text-center w-1/4">
                                        <p className="text-3xl">😫</p>
                                        <p className="text-[10px] font-black uppercase text-violet-400 mt-2">Maximum</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History */}
                    <TabsContent value="history" className="animate-in-slide-up outline-none space-y-6">
                        <Card className="border-none shadow-xl">
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-2xl font-black">Medical History & Risk Factors</CardTitle>
                                <CardDescription>Identify underlying conditions or allergies that may affect treatment.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="conditions" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Known Conditions</Label>
                                        <Textarea
                                            id="conditions"
                                            placeholder="Diabetes, Hypertension, cardiac issues..."
                                            value={triage.known_conditions || ""}
                                            onChange={(e) => setTriage((prev) => ({ ...prev, known_conditions: e.target.value }))}
                                            className="min-h-[120px] bg-muted/30 border-none shadow-inner transition-all hover:bg-muted/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="medications" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Current Medications</Label>
                                        <Textarea
                                            id="medications"
                                            placeholder="Aspirin, Insulin, Metformin..."
                                            value={triage.medications || ""}
                                            onChange={(e) => setTriage((prev) => ({ ...prev, medications: e.target.value }))}
                                            className="min-h-[120px] bg-muted/30 border-none shadow-inner transition-all hover:bg-muted/50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="allergies" className="font-black text-xs uppercase tracking-widest text-red-600 flex items-center gap-2">
                                        Allergies (CRITICAL)
                                    </Label>
                                    <Textarea
                                        id="allergies"
                                        placeholder="Drug allergies, food allergies, environmental..."
                                        className="bg-red-50 border-red-100 shadow-inner focus-visible:ring-red-500 font-bold text-red-700 min-h-[80px]"
                                        value={triage.allergies || ""}
                                        onChange={(e) => setTriage((prev) => ({ ...prev, allergies: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Internal Clinical Notes</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any additional observations here for the doctor..."
                                        value={triage.notes || ""}
                                        onChange={(e) => setTriage((prev) => ({ ...prev, notes: e.target.value }))}
                                        className="min-h-[120px] bg-muted/30 border-none shadow-inner"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Vitals */}
                    <TabsContent value="vitals" className="animate-in-slide-up outline-none space-y-6">
                        <VitalsForm values={vitals} onChange={setVitals} />
                    </TabsContent>

                    {/* Summary */}
                    <TabsContent value="summary" className="animate-in-slide-up outline-none space-y-6">
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
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t p-4 z-40 lg:ml-64">
                <div className="max-w-[1000px] mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        disabled={currentIndex === 0}
                        onClick={() => setActiveTab(TriageSteps[currentIndex - 1].id)}
                        className="gap-2 font-bold uppercase tracking-wider text-xs"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Button>

                    <div className="flex-1 px-8 hidden sm:block">
                        <div className="h-1 w-full bg-muted rounded-full">
                            <div
                                className="h-full bg-violet-600 rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${((currentIndex + 1) / TriageSteps.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    {currentIndex === TriageSteps.length - 1 ? (
                        <Button
                            onClick={handleSendToDoctor}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 gap-2 font-black uppercase tracking-widest py-6 px-8 rounded-xl"
                        >
                            {saving ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Complete Assessment
                                    <CheckCircle className="h-5 w-5" />
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setActiveTab(TriageSteps[currentIndex + 1].id)}
                            className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-100 gap-2 font-black uppercase tracking-widest py-6 px-8 rounded-xl"
                        >
                            Next Step
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
