"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Save, ClipboardList, Lightbulb } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

const diagnosisSchema = z.object({
    diagnosis: z.string().min(10, "Diagnosis must be descriptive (at least 10 characters)"),
    advice: z.string().optional(),
})

type DiagnosisFormValues = z.infer<typeof diagnosisSchema>

interface DiagnosisFormProps {
    initialDiagnosis?: string
    initialAdvice?: string
    onSave: (values: DiagnosisFormValues) => void
    disabled?: boolean
}

export function DiagnosisForm({
    initialDiagnosis,
    initialAdvice,
    onSave,
    disabled,
}: DiagnosisFormProps) {
    const form = useForm<DiagnosisFormValues>({
        resolver: zodResolver(diagnosisSchema),
        defaultValues: {
            diagnosis: initialDiagnosis || "",
            advice: initialAdvice || "",
        },
    })

    return (
        <Card className="border-none shadow-xl overflow-hidden animate-in-fade">
            <CardHeader className="bg-violet-900 text-white p-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-violet-700 flex items-center justify-center">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold">Clinical Impression</CardTitle>
                        <CardDescription className="text-violet-200">Record your diagnosis and advice for the patient.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSave)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="diagnosis"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            Diagnosis <span className="text-red-500">*</span>
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter primary and secondary diagnosis here..."
                                            className={cn(
                                                "min-h-[150px] text-lg p-4 bg-muted/30 border-none shadow-inner resize-none focus-visible:ring-violet-500",
                                                disabled && "opacity-80"
                                            )}
                                            disabled={disabled}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="advice"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Lightbulb className="h-3 w-3 text-amber-500" />
                                        Patient Advice & Instructions
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Activity restrictions, diet advice, follow-up timeline..."
                                            className={cn(
                                                "min-h-[120px] p-4 bg-muted/30 border-none shadow-inner resize-none focus-visible:ring-violet-500 italic",
                                                disabled && "opacity-80"
                                            )}
                                            disabled={disabled}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {!disabled && (
                            <div className="flex justify-end pt-4">
                                <Button type="submit" className="bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-100 px-8 py-6 rounded-xl font-black uppercase tracking-widest gap-2">
                                    <Save className="h-4 w-4" />
                                    Save Record
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
