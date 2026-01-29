"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Thermometer, Activity, Heart, Wind, User, Clipboard, History, CheckCircle2 } from "lucide-react"
import { SYMPTOM_LABELS, getVitalStatus } from "@/lib/constants"
import type { TriageRecord, Vitals, Patient, SymptomsData } from "@/types/database"
import { cn } from "@/lib/utils"

interface TriageSummaryProps {
    patient: Patient
    triage: TriageRecord | null
    latestVitals: Vitals | null
}

function VitalBadge({
    label,
    value,
    unit,
    status,
}: {
    label: string
    value: number | null | undefined
    unit: string
    status: "normal" | "warning" | "critical"
}) {
    if (value === null || value === undefined) return null

    return (
        <div
            className={cn(
                "flex flex-col gap-1 px-4 py-3 rounded-xl border transition-all shadow-sm bg-white hover:shadow-md",
                status === "critical" && "border-red-200 bg-red-50/50",
                status === "warning" && "border-amber-200 bg-amber-50/50",
                status === "normal" && "border-border"
            )}
        >
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className={cn(
                    "text-xl font-bold",
                    status === "critical" && "text-red-700",
                    status === "warning" && "text-amber-700",
                    status === "normal" && "text-violet-900"
                )}>
                    {value}
                    <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>
                </span>
                {status !== "normal" && <AlertCircle className={cn(
                    "h-4 w-4",
                    status === "critical" ? "text-red-500" : "text-amber-500"
                )} />}
            </div>
        </div>
    )
}

export function TriageSummary({ patient, triage, latestVitals }: TriageSummaryProps) {
    const activeSymptoms = triage?.symptoms
        ? Object.entries(triage.symptoms as SymptomsData)
            .filter(([key, value]) => value === true && key !== "other")
            .map(([key]) => SYMPTOM_LABELS[key] || key)
        : []

    const otherSymptom = (triage?.symptoms as SymptomsData)?.other

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col gap-1 mb-2">
                <h2 className="text-2xl font-black text-violet-900 flex items-center gap-3">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                    Review Triage Summary
                </h2>
                <p className="text-muted-foreground px-10">Review all recorded data before finalizing the assessment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Complaint & History */}
                <div className="md:col-span-2 space-y-6">
                    {/* Chief Complaint */}
                    <Card className="border-none shadow-lg bg-red-50/30 overflow-hidden">
                        <CardHeader className="pb-3 border-b border-red-100/50 bg-red-50/50">
                            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                                <AlertCircle className="h-5 w-5" />
                                Chief Complaint
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-lg font-medium text-red-900 leading-relaxed italic">
                                "{triage?.chief_complaint || "No complaint recorded"}"
                            </p>
                        </CardContent>
                    </Card>

                    {/* Medical History */}
                    {(triage?.known_conditions || triage?.medications || triage?.allergies || triage?.past_surgeries) && (
                        <Card className="border-none shadow-lg">
                            <CardHeader className="pb-3 border-b border-violet-50 bg-violet-50/30">
                                <CardTitle className="text-lg flex items-center gap-2 text-violet-800">
                                    <History className="h-5 w-5" />
                                    Clinical Background
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 grid sm:grid-cols-2 gap-6">
                                {triage?.known_conditions && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Known Conditions</p>
                                        <p className="text-sm font-medium">{triage.known_conditions}</p>
                                    </div>
                                )}
                                {triage?.medications && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Medications</p>
                                        <p className="text-sm font-medium">{triage.medications}</p>
                                    </div>
                                )}
                                {triage?.allergies && (
                                    <div className="space-y-1 bg-red-50 p-3 rounded-lg border border-red-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Allergies</p>
                                        <p className="text-sm font-bold text-red-700">{triage.allergies}</p>
                                    </div>
                                )}
                                {triage?.past_surgeries && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Past Surgeries</p>
                                        <p className="text-sm font-medium">{triage.past_surgeries}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Vitals Grid */}
                    {latestVitals && (
                        <Card className="border-none shadow-lg overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-emerald-50/30">
                                <CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
                                    <Activity className="h-5 w-5" />
                                    Vital Signs Review
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    <VitalBadge label="BP" status={getVitalStatus("bp_systolic", latestVitals.bp_systolic)} value={latestVitals.bp_systolic} unit={latestVitals.bp_diastolic ? `/${latestVitals.bp_diastolic}` : ""} />
                                    <VitalBadge label="SpO₂" status={getVitalStatus("spo2", latestVitals.spo2)} value={latestVitals.spo2} unit="%" />
                                    <VitalBadge label="Temp" status={getVitalStatus("temperature", latestVitals.temperature)} value={latestVitals.temperature} unit="°C" />
                                    <VitalBadge label="HR" status={getVitalStatus("heart_rate", latestVitals.heart_rate)} value={latestVitals.heart_rate} unit="bpm" />
                                    <VitalBadge label="RR" status={getVitalStatus("respiratory_rate", latestVitals.respiratory_rate)} value={latestVitals.respiratory_rate} unit="/min" />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Symptoms, Pain & Patient Info Quick View */}
                <div className="space-y-6">
                    {/* Symptoms & Pain Score */}
                    <Card className="border-none shadow-lg bg-violet-900 text-white overflow-hidden">
                        <CardHeader className="pb-3 border-b border-violet-800">
                            <CardTitle className="text-sm uppercase tracking-widest font-black text-violet-300">Symptoms & Assessment</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-3">
                                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Active Symptoms</p>
                                <div className="flex flex-wrap gap-2">
                                    {activeSymptoms.length > 0 ? (
                                        activeSymptoms.map((symptom) => (
                                            <Badge key={symptom} className="bg-violet-700 hover:bg-violet-700 border-violet-500 text-white font-medium py-1 px-3">
                                                {symptom}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-xs text-violet-400 italic">No specific symptoms selected</p>
                                    )}
                                    {otherSymptom && (
                                        <Badge className="bg-white/10 hover:bg-white/10 border-white/20 text-white font-medium py-1 px-3">
                                            {otherSymptom}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-white/10" />

                            {triage?.pain_score !== null && triage?.pain_score !== undefined && (
                                <div className="flex flex-col gap-2">
                                    <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Pain Assessment</p>
                                    <div className="flex items-end gap-3">
                                        <span className={cn(
                                            "text-4xl font-black leading-none",
                                            triage.pain_score >= 8 ? "text-red-400" :
                                                triage.pain_score >= 5 ? "text-amber-400" : "text-emerald-400"
                                        )}>
                                            {triage.pain_score}
                                            <span className="text-xl font-normal text-violet-400 ml-1">/10</span>
                                        </span>
                                        <p className="text-[10px] text-violet-300 font-bold uppercase mb-1">
                                            {triage.pain_score === 0 && "No Pain"}
                                            {triage.pain_score > 0 && triage.pain_score < 4 && "Mild Pain"}
                                            {triage.pain_score >= 4 && triage.pain_score < 7 && "Moderate Pain"}
                                            {triage.pain_score >= 7 && triage.pain_score < 9 && "Severe Pain"}
                                            {triage.pain_score >= 9 && "Excruciating"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Nurse Notes Snapshot */}
                    {triage?.notes && (
                        <Card className="border-none shadow-lg">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-violet-800 uppercase tracking-widest flex items-center gap-2">
                                    <Clipboard className="h-4 w-4" />
                                    Clinical Observations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-lg border border-dashed border-muted-foreground/20 leading-relaxed font-serif">
                                    "{triage.notes}"
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
