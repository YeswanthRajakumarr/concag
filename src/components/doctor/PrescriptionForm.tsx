"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Pill, Clock, Calendar, Info, X, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import type { Prescription } from "@/types/database"
import { cn } from "@/lib/utils"

const prescriptionSchema = z.object({
    medication: z.string().min(1, "Medication name is required"),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    duration: z.string().optional(),
    notes: z.string().optional(),
})

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

interface PrescriptionFormProps {
    prescriptions: Prescription[]
    onAdd: (prescription: PrescriptionFormValues) => void
    onRemove: (id: string) => void
    disabled?: boolean
}

export function PrescriptionForm({
    prescriptions,
    onAdd,
    onRemove,
    disabled,
}: PrescriptionFormProps) {
    const [isAdding, setIsAdding] = useState(false)

    const form = useForm<PrescriptionFormValues>({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: {
            medication: "",
            dosage: "",
            frequency: "",
            duration: "",
            notes: "",
        },
    })

    const onSubmit = (values: PrescriptionFormValues) => {
        onAdd(values)
        form.reset()
        setIsAdding(false)
    }

    return (
        <Card className="border-none shadow-xl overflow-hidden animate-in-fade">
            <CardHeader className="bg-violet-900 text-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-violet-700 flex items-center justify-center">
                            <Pill className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Prescriptions</CardTitle>
                            <CardDescription className="text-violet-200">Manage medications for this visit.</CardDescription>
                        </div>
                    </div>
                    {!disabled && !isAdding && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsAdding(true)}
                            className="bg-white text-violet-900 hover:bg-violet-50 font-bold"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Medication
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Existing Prescriptions */}
                <div className="grid gap-4">
                    {prescriptions.map((rx) => (
                        <div
                            key={rx.id}
                            className="group flex items-start justify-between p-4 bg-muted/30 hover:bg-violet-50 border border-transparent hover:border-violet-100 rounded-2xl transition-all"
                        >
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-border group-hover:border-violet-200 text-violet-600 transition-all">
                                    <Pill className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-lg text-violet-900 leading-tight">{rx.medication}</p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                        {rx.dosage && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Info className="h-3 w-3" />
                                                {rx.dosage}
                                            </div>
                                        )}
                                        {rx.frequency && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Clock className="h-3 w-3 text-emerald-500" />
                                                {rx.frequency}
                                            </div>
                                        )}
                                        {rx.duration && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <Calendar className="h-3 w-3 text-blue-500" />
                                                {rx.duration}
                                            </div>
                                        )}
                                    </div>
                                    {rx.notes && (
                                        <p className="text-xs text-muted-foreground italic mt-2 bg-white/50 px-2 py-1 rounded-md border border-border/50">
                                            Note: {rx.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {!disabled && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemove(rx.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 rounded-full"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {prescriptions.length === 0 && !isAdding && (
                    <div className="text-center py-12 space-y-3 bg-muted/20 border border-dashed rounded-2xl">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                            <Pill className="h-6 w-6 opacity-20" />
                        </div>
                        <p className="text-muted-foreground font-medium italic">No medications prescribed yet.</p>
                        {!disabled && (
                            <Button variant="outline" size="sm" onClick={() => setIsAdding(true)} className="border-violet-200 text-violet-600">
                                Click to add prescription
                            </Button>
                        )}
                    </div>
                )}

                {/* Add Form with high-end fields */}
                {isAdding && (
                    <div className="bg-violet-50/50 p-6 rounded-2xl border border-violet-100 shadow-inner animate-in-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black uppercase tracking-widest text-[10px] text-violet-600">New Prescription Entry</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="h-6 w-6 rounded-full">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="medication"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medication Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter brand or generic name..." className="h-12 bg-white border-none shadow-sm focus-visible:ring-violet-500 font-bold text-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="dosage"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dosage</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., 500mg" className="h-10 bg-white border-none shadow-sm focus-visible:ring-violet-500" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="frequency"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Frequency</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., TID / 1-0-1" className="h-10 bg-white border-none shadow-sm focus-visible:ring-violet-500" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="duration"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1.5">
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Duration</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., 5 days" className="h-10 bg-white border-none shadow-sm focus-visible:ring-violet-500" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1.5">
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pharmacy Notes</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="e.g., After meals, avoid dairy..." className="bg-white border-none shadow-sm focus-visible:ring-violet-500 resize-none h-20" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-3 justify-end pt-2">
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-wider text-xs px-6 rounded-lg gap-2">
                                        <Check className="h-4 w-4" />
                                        Add to List
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            form.reset()
                                            setIsAdding(false)
                                        }}
                                        className="font-bold uppercase tracking-wider text-xs px-6"
                                    >
                                        Discard
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
