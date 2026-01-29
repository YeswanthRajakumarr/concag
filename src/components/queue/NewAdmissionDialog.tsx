"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Search, Plus, User, Check, Loader2, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getPatients, createPatient, createVisit } from "@/lib/api"
import type { Patient, VisitWithPatient } from "@/types/database"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { THEME } from "@/lib/theme"

const admissionSchema = z.object({
    visit_type: z.enum(["OPD", "EMERGENCY", "FOLLOW_UP", "PROCEDURE"]),
    department: z.string().min(1, "Department is required"),
})

type AdmissionFormValues = z.infer<typeof admissionSchema>

const patientSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    gender: z.enum(["Male", "Female", "Other"]),
    date_of_birth: z.string().optional(),
    phone: z.string().optional(),
})

type PatientFormValues = z.infer<typeof patientSchema>

interface NewAdmissionDialogProps {
    onSuccess: (visit: VisitWithPatient) => void
}

export function NewAdmissionDialog({ onSuccess }: NewAdmissionDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<"search" | "patient_form" | "visit_form">("search")
    const [patients, setPatients] = useState<Patient[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        if (open && step === "search") {
            const fetchPatients = async () => {
                try {
                    setLoading(true)
                    const data = await getPatients()
                    setPatients(data)
                } catch (error) {
                    console.error(error)
                } finally {
                    setLoading(false)
                }
            }
            fetchPatients()
        }
    }, [open, step])

    const admissionForm = useForm<AdmissionFormValues>({
        resolver: zodResolver(admissionSchema),
        defaultValues: {
            visit_type: "OPD",
            department: "General Medicine",
        },
    })

    const patientForm = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            name: "",
            gender: "Male",
            date_of_birth: "",
            phone: "",
        },
    })

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone?.includes(searchQuery)
    )

    const handlePatientSubmit = async (values: PatientFormValues) => {
        try {
            setCreating(true)
            const newPatient = await createPatient(values)
            setSelectedPatient(newPatient)
            setStep("visit_form")
        } catch (error) {
            toast.error("Failed to register patient")
        } finally {
            setCreating(false)
        }
    }

    const handleAdmissionSubmit = async (values: AdmissionFormValues) => {
        if (!selectedPatient) return

        try {
            setCreating(true)
            const visit = await createVisit({
                patient_id: selectedPatient.id,
                visit_type: values.visit_type,
                department: values.department,
            })
            toast.success("New admission created")
            onSuccess(visit)
            setOpen(false)
            resetDialog()
        } catch (error) {
            toast.error("Failed to create admission")
        } finally {
            setCreating(false)
        }
    }

    const resetDialog = () => {
        setStep("search")
        setSelectedPatient(null)
        setSearchQuery("")
        patientForm.reset()
        admissionForm.reset()
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetDialog()
        }}>
            <DialogTrigger asChild>
                <Button size="sm" className={THEME.components.buttonSecondary}>
                    <Plus className="h-4 w-4" />
                    New Admission
                </Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false} className={cn(THEME.components.card, "sm:max-w-[500px] p-0")}>
                <div className={`bg-${THEME.colors.brand.primary} p-8 text-white relative`}>
                    <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4" />
                    </div>
                    <p className={THEME.typography.subheading}>Registration Portal</p>
                    <DialogTitle className={THEME.typography.heading}>
                        {step === "search" && "Find Patient"}
                        {step === "patient_form" && "New Profile"}
                        {step === "visit_form" && "Assign Dept"}
                    </DialogTitle>
                </div>

                <div className="p-8">
                    {step === "search" && (
                        <div className="space-y-6">
                            <div className="relative group">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-${THEME.colors.text.muted} group-focus-within:text-${THEME.colors.brand.primary} transition-colors`} />
                                <Input
                                    placeholder="Search by name or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={THEME.components.input}
                                />
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-3">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Searching Records...</p>
                                    </div>
                                ) : filteredPatients.length > 0 ? (
                                    filteredPatients.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedPatient(p)
                                                setStep("visit_form")
                                            }}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-50 cursor-pointer transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-600 group-hover:bg-${THEME.colors.brand.primary} group-hover:text-white transition-colors`}>
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-${THEME.colors.text.main}`}>{p.name}</p>
                                                    <p className={THEME.typography.meta}>{p.phone || "No Contact"}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className={`h-4 w-4 text-slate-300 group-hover:text-${THEME.colors.brand.primary}`} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                        <p className="text-slate-500 font-bold text-sm mb-4">No patients found matches</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep("patient_form")}
                                            className="border-violet-200 text-violet-600 hover:bg-violet-50 rounded-xl"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Register New Patient
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === "patient_form" && (
                        <Form {...patientForm}>
                            <form onSubmit={patientForm.handleSubmit(handlePatientSubmit)} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={patientForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</FormLabel>
                                                <FormControl>
                                                    <Input className="h-12 bg-slate-50 border-none rounded-xl" placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={patientForm.control}
                                        name="gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 bg-slate-50 border-none rounded-xl">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Male">Male</SelectItem>
                                                        <SelectItem value="Female">Female</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={patientForm.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</FormLabel>
                                                <FormControl>
                                                    <Input className="h-12 bg-slate-50 border-none rounded-xl" placeholder="+123..." {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setStep("search")} className="flex-1 h-12 rounded-xl text-slate-500 font-bold uppercase tracking-widest text-[10px]">Back</Button>
                                    <Button type="submit" disabled={creating} className={cn(THEME.components.buttonPrimary, "flex-[2]")}>
                                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue to Visit"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}

                    {step === "visit_form" && (
                        <Form {...admissionForm}>
                            <form onSubmit={admissionForm.handleSubmit(handleAdmissionSubmit)} className="space-y-6">
                                <div className={`p-4 rounded-2xl bg-${THEME.colors.brand.primaryLight} flex items-center gap-4 border border-violet-100`}>
                                    <div className={`h-12 w-12 rounded-xl bg-${THEME.colors.brand.primary} flex items-center justify-center font-black text-white text-lg shadow-lg shadow-violet-200`}>
                                        {selectedPatient?.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className={`font-black text-${THEME.colors.brand.primaryHover} leading-tight`}>{selectedPatient?.name}</p>
                                        <p className={THEME.typography.subheading}>Selected Patient</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <FormField
                                        control={admissionForm.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className={THEME.typography.label}>Clinical Department</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className={THEME.components.input}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="General Medicine">General Medicine</SelectItem>
                                                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                                                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                                                        <SelectItem value="Orthopaedics">Orthopaedics</SelectItem>
                                                        <SelectItem value="Emergency">Emergency Care</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={admissionForm.control}
                                        name="visit_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admission Type</FormLabel>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {["OPD", "EMERGENCY", "FOLLOW_UP", "PROCEDURE"].map((type) => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => field.onChange(type)}
                                                            className={cn(
                                                                "h-12 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border-2",
                                                                field.value === type
                                                                    ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-100"
                                                                    : "bg-white border-slate-100 text-slate-500 hover:border-violet-200"
                                                            )}
                                                        >
                                                            {type.replace("_", " ")}
                                                        </button>
                                                    ))}
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setStep("search")} className="flex-1 h-14 rounded-2xl text-slate-500 font-bold uppercase tracking-widest text-[10px]">Switch Patient</Button>
                                    <Button type="submit" disabled={creating} className={cn(THEME.components.buttonSecondary, "flex-[2] h-14")}>
                                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Admission"}
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
