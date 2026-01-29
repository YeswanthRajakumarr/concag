"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getVitalStatus, type VitalStatus } from "@/lib/constants"
import type { VitalsInput } from "@/types/database"
import { Activity, Thermometer, Droplets, Heart, Wind, Scale, Ruler } from "lucide-react"

interface VitalsFormProps {
    values: Partial<VitalsInput>
    onChange: (values: Partial<VitalsInput>) => void
    disabled?: boolean
}

const vitalFields = [
    { key: "bp_systolic", label: "BP Systolic", unit: "mmHg", placeholder: "120", icon: Activity },
    { key: "bp_diastolic", label: "BP Diastolic", unit: "mmHg", placeholder: "80", icon: Activity },
    { key: "heart_rate", label: "Heart Rate", unit: "bpm", placeholder: "72", icon: Heart },
    { key: "respiratory_rate", label: "Resp. Rate", unit: "/min", placeholder: "16", icon: Wind },
    { key: "spo2", label: "SpO₂", unit: "%", placeholder: "98", icon: Droplets },
    { key: "temperature", label: "Temperature", unit: "°C", placeholder: "37.0", icon: Thermometer },
    { key: "weight", label: "Weight", unit: "kg", placeholder: "70", icon: Scale },
    { key: "height", label: "Height", unit: "cm", placeholder: "170", icon: Ruler },
] as const

function getStatusStyles(status: VitalStatus): string {
    switch (status) {
        case "critical":
            return "border-red-500 bg-red-50 text-red-900 focus-visible:ring-red-500"
        case "warning":
            return "border-amber-500 bg-amber-50 text-amber-900 focus-visible:ring-amber-500"
        default:
            return "bg-muted/30 focus-visible:ring-violet-500"
    }
}

export function VitalsForm({ values, onChange, disabled }: VitalsFormProps) {
    const handleChange = (key: string, value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value)
        onChange({ ...values, [key]: numValue })
    }

    const getFieldStatus = (key: string, value: number | undefined): VitalStatus => {
        if (value === undefined) return "normal"
        if (key === "bp_systolic") return getVitalStatus("bp_systolic", value)
        if (key === "bp_diastolic") return getVitalStatus("bp_diastolic", value)
        if (key === "heart_rate") return getVitalStatus("heart_rate", value)
        if (key === "respiratory_rate") return getVitalStatus("respiratory_rate", value)
        if (key === "spo2") return getVitalStatus("spo2", value)
        if (key === "temperature") return getVitalStatus("temperature", value)
        return "normal"
    }

    const bmi = values.weight && values.height && values.height > 0
        ? (values.weight / ((values.height / 100) ** 2)).toFixed(1)
        : null

    return (
        <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {vitalFields.map((field) => {
                        const value = values[field.key as keyof VitalsInput] as number | undefined
                        const status = getFieldStatus(field.key, value)
                        const Icon = field.icon

                        return (
                            <div key={field.key} className="space-y-2 group">
                                <Label htmlFor={field.key} className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 group-hover:text-violet-600 transition-colors">
                                    <Icon className="h-3 w-3" />
                                    {field.label}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id={field.key}
                                        type="number"
                                        step={field.key === "temperature" ? "0.1" : "1"}
                                        placeholder={field.placeholder}
                                        value={value ?? ""}
                                        onChange={(e) => handleChange(field.key, e.target.value)}
                                        disabled={disabled}
                                        className={cn(
                                            "h-12 pl-4 pr-12 text-lg font-semibold border-none shadow-sm transition-all",
                                            getStatusStyles(status)
                                        )}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                                            {field.unit}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {bmi && (
                    <div className="mt-8 p-4 bg-violet-50 rounded-xl border border-violet-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center text-white">
                                <Scale className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-violet-600/70">Calculated BMI</p>
                                <p className="text-xl font-black text-violet-900 leading-tight">{bmi} <span className="text-xs font-normal">kg/m²</span></p>
                            </div>
                        </div>
                        <Badge className={cn(
                            "px-4 py-1 rounded-full text-xs font-bold shadow-sm",
                            parseFloat(bmi) < 18.5 && "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
                            parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25 && "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
                            parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200",
                            parseFloat(bmi) >= 30 && "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                        )}>
                            {parseFloat(bmi) < 18.5 && "Underweight"}
                            {parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25 && "Healthy Weight"}
                            {parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && "Overweight"}
                            {parseFloat(bmi) >= 30 && "Obese"}
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
