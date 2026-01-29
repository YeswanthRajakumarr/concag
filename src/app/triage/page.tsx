"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Loader2, ClipboardList, ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getActiveVisits } from "@/lib/api"
import { toast } from "sonner"
import type { VisitWithPatient } from "@/types/database"

export default function TriageIndexPage() {
    const [visits, setVisits] = useState<VisitWithPatient[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchVisits() {
            try {
                const data = await getActiveVisits()
                // Filter to show only visits needing triage
                const triageVisits = data.filter(v =>
                    v.status === "WAITING" || v.status === "IN_TRIAGE"
                )
                setVisits(triageVisits)
            } catch (error) {
                console.error("Failed to fetch visits:", error)
                toast.error("Failed to load visits")
            } finally {
                setLoading(false)
            }
        }
        fetchVisits()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="p-3">
            <div className="mb-2">
                <h1 className="text-xl font-bold">Triage Queue</h1>
                <p className="text-xs text-muted-foreground">
                    {visits.length} patients waiting for or in triage
                </p>
            </div>

            {visits.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No patients in triage queue</p>
                        <p className="text-muted-foreground mt-1">
                            Patients will appear here when they arrive
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/queue">View Full Queue</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-2">
                    {visits.map((visit) => (
                        <Card key={visit.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                                            <span className="text-violet-600 font-semibold text-xs">
                                                {visit.patient.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">{visit.patient.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                    {visit.department || "General"}
                                                </Badge>
                                                <span>•</span>
                                                <span>{visit.visit_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={visit.status === "IN_TRIAGE" ? "default" : "secondary"}
                                            className="text-[10px] px-2 h-6"
                                        >
                                            {visit.status === "IN_TRIAGE" ? "In Progress" : "Waiting"}
                                        </Badge>
                                        <Button asChild size="sm" className="h-7 text-xs">
                                            <Link href={`/triage/${visit.id}`}>
                                                {visit.status === "IN_TRIAGE" ? "Continue" : "Start"}
                                                <ArrowRight className="h-3 w-3 ml-1" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
