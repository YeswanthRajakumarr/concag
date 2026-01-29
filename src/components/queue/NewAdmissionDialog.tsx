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
    DialogDescription,
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
            toast.success("Admission created")
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
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Admission
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === "search" && "Find Patient"}
                        {step === "patient_form" && "New Patient Registration"}
                        {step === "visit_form" && "Admission Details"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === "search" && "Search existing records or register new patient."}
                        {step === "patient_form" && "Enter patient demographics."}
                        {step === "visit_form" && `Admitting: ${selectedPatient?.name}`}
                    </DialogDescription>
                </DialogHeader>

                {step === "search" && (
                    <div className="space-y-4 py-2">
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                        </div>

                        <div className="max-h-[300px] overflow-auto border rounded-md divide-y">
                            {loading ? (
                                <div className="p-4 flex justify-center">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            ) : filteredPatients.length > 0 ? (
                                filteredPatients.map(p => (
                                    <div
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedPatient(p)
                                            setStep("visit_form")
                                        }}
                                        className="p-3 hover:bg-muted cursor-pointer flex justify-between items-center text-sm"
                                    >
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-muted-foreground text-xs">{p.phone}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-muted-foreground text-sm space-y-3">
                                    <p>No patients found</p>
                                    <Button variant="outline" size="sm" onClick={() => setStep("patient_form")}>
                                        Register New
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === "patient_form" && (
                    <Form {...patientForm}>
                        <form onSubmit={patientForm.handleSubmit(handlePatientSubmit)} className="space-y-4">
                            <FormField
                                control={patientForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
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
                                        <FormLabel>Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={patientForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+1..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-between pt-2">
                                <Button type="button" variant="outline" onClick={() => setStep("search")}>
                                    Back
                                </Button>
                                <Button type="submit" disabled={creating}>
                                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Profile
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {step === "visit_form" && (
                    <Form {...admissionForm}>
                        <form onSubmit={admissionForm.handleSubmit(handleAdmissionSubmit)} className="space-y-4">
                            <FormField
                                control={admissionForm.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
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
                                        <FormLabel>Visit Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="OPD">OPD</SelectItem>
                                                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                                                <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                                                <SelectItem value="PROCEDURE">Procedure</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between pt-4">
                                <Button type="button" variant="outline" onClick={() => setStep("search")}>
                                    Change Patient
                                </Button>
                                <Button type="submit" disabled={creating}>
                                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Admit Patient
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
