"use client"

import { useState, useEffect } from "react"
import { Plus, RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { VisitCard } from "@/components/queue/VisitCard"
import { StatusColumn } from "@/components/queue/StatusColumn"
import { NewAdmissionDialog } from "@/components/queue/NewAdmissionDialog"
import { getActiveVisits, updateVisitStatus } from "@/lib/api"
import { toast } from "sonner"
import type { VisitWithPatient, VisitStatus } from "@/types/database"
import { THEME } from "@/lib/theme"

const statusOrder: VisitStatus[] = [
    "WAITING",
    "IN_TRIAGE",
    "READY_FOR_DOCTOR",
    "WITH_DOCTOR",
]

export default function QueuePage() {
    const [visits, setVisits] = useState<VisitWithPatient[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchVisits = async () => {
        try {
            const data = await getActiveVisits()
            setVisits(data)
        } catch (error) {
            console.error("Failed to fetch visits:", error)
            toast.error("Failed to load visits")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchVisits()
    }, [])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchVisits()
    }

    const handleNewAdmission = (newVisit: VisitWithPatient) => {
        setVisits((prev) => [newVisit, ...prev])
    }

    const handleAction = async (action: string, visitId: string) => {
        try {
            let newStatus: VisitStatus | null = null

            switch (action) {
                case "start_triage":
                    newStatus = "IN_TRIAGE"
                    break
                case "assign_doctor":
                    newStatus = "WITH_DOCTOR"
                    break
            }

            if (newStatus) {
                const updated = await updateVisitStatus(visitId, newStatus)
                setVisits((prev) =>
                    prev.map((v) => (v.id === visitId ? updated : v))
                )
                toast.success(`Visit status updated to ${newStatus.replace(/_/g, " ")}`)
            }
        } catch (error) {
            console.error("Failed to update visit:", error)
            toast.error("Failed to update visit status")
        }
    }

    const getVisitsByStatus = (status: VisitStatus) =>
        visits.filter((v) => v.status === status)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className={cn("p-8 max-w-[1600px] mx-auto", THEME.animations.fadeIn)}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <h1 className={THEME.typography.heading}>Patient Queue</h1>
                    <div className="flex items-center gap-2">
                        <div className={cn(THEME.components.pulse, "bg-emerald-500")} />
                        <p className={THEME.typography.meta}>
                            {visits.length} Live Clinical Sessions
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={cn(THEME.typography.meta, "h-10 px-5 transition-colors")}
                    >
                        <RefreshCw className={cn("h-3 w-3 mr-2", refreshing && "animate-spin")} />
                        Synch Data
                    </Button>
                    <NewAdmissionDialog onSuccess={handleNewAdmission} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statusOrder.map((status) => {
                    const statusVisits = getVisitsByStatus(status)
                    return (
                        <StatusColumn key={status} status={status} count={statusVisits.length}>
                            {statusVisits.length === 0 ? (
                                <div className="text-center py-8 text-sm text-muted-foreground">
                                    No visits
                                </div>
                            ) : (
                                statusVisits.map((visit) => (
                                    <VisitCard
                                        key={visit.id}
                                        visit={visit}
                                        onAction={handleAction}
                                    />
                                ))
                            )}
                        </StatusColumn>
                    )
                })}
            </div>
        </div>
    )
}
