"use client"

import { useState, useEffect } from "react"
import { Search, Plus, User, Phone, Loader2, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PatientFormDialog } from "@/components/patients/PatientFormDialog"
import { toast } from "sonner"
import { getPatients, createPatient } from "@/lib/api"
import type { Patient } from "@/types/database"
import { cn } from "@/lib/utils"

function calculateAge(dob: string | null | undefined): string {
    if (!dob) return "—"
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    return `${age} yrs`
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        async function fetchPatients() {
            try {
                const data = await getPatients()
                setPatients(data)
            } catch (error) {
                console.error("Failed to fetch patients:", error)
                toast.error("Failed to load patients")
            } finally {
                setLoading(false)
            }
        }
        fetchPatients()
    }, [])

    const filteredPatients = patients.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleAddPatient = async (values: {
        name: string
        gender?: "Male" | "Female" | "Other"
        date_of_birth?: string
        phone?: string
    }) => {
        try {
            const newPatient = await createPatient(values)
            setPatients((prev) => [newPatient, ...prev])
            toast.success("Patient registered successfully")
        } catch (error) {
            console.error("Failed to create patient:", error)
            toast.error("Failed to register patient")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in-fade">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and view all registered patients in the system.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <PatientFormDialog onSubmit={handleAddPatient} />
                </div>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-muted/50 border-none focus-visible:ring-violet-500"
                    />
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                        {filteredPatients.length}
                    </Badge>
                    <span>Patients listed</span>
                </div>
            </div>

            <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="w-[300px] py-4">Patient Name</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead className="text-right py-4">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPatients.map((patient) => (
                            <TableRow key={patient.id} className="group hover:bg-violet-50/50 transition-colors">
                                <TableCell className="py-4">
                                    <Link
                                        href={`/patients/${patient.id}`}
                                        className="flex items-center gap-3 group/link"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold shrink-0 shadow-sm border border-violet-200 group-hover/link:bg-violet-600 group-hover/link:text-white transition-all duration-300">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground group-hover/link:text-violet-700 transition-colors">
                                                {patient.name}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                ID: {patient.id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {patient.gender ? (
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "font-normal",
                                                patient.gender === "Male" && "bg-blue-100 text-blue-700",
                                                patient.gender === "Female" && "bg-pink-100 text-pink-700",
                                                patient.gender === "Other" && "bg-slate-100 text-slate-700"
                                            )}
                                        >
                                            {patient.gender}
                                        </Badge>
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {calculateAge(patient.date_of_birth)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {patient.phone ? (
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            {patient.phone}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-xs italic">Not provided</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="sm" asChild className="hover:bg-violet-100 hover:text-violet-700">
                                            <Link href={`/patients/${patient.id}`}>
                                                Details
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-violet-200 hover:border-violet-600 hover:bg-violet-600 hover:text-white transition-all"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            New Visit
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredPatients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-16">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">No patients found</p>
                                            <p className="text-muted-foreground text-sm">
                                                {patients.length === 0
                                                    ? "Register your first patient to get started."
                                                    : "Try adjusting your search query."}
                                            </p>
                                        </div>
                                        {patients.length === 0 && (
                                            <PatientFormDialog onSubmit={handleAddPatient} />
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
