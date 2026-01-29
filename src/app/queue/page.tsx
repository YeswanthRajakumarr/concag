"use client"

import { useState, useEffect } from "react"
import { Plus, RefreshCw, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import { Button } from "@/components/ui/button"
import { VisitCard } from "@/components/queue/VisitCard"
import { StatusColumn } from "@/components/queue/StatusColumn"
import { NewAdmissionDialog } from "@/components/queue/NewAdmissionDialog"
import { getActiveVisits, updateVisitStatus } from "@/lib/api"
import { toast } from "sonner"
import type { VisitWithPatient, VisitStatus } from "@/types/database"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
            <div className={cn("flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]", THEME.spacing.page)}>
                <div className="flex justify-between items-center mb-2">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-32" />
                    </div>
                </div>
                <div className={cn("hidden md:grid grid-cols-2 lg:grid-cols-4 h-full overflow-hidden", THEME.spacing.cardGap)}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col h-[calc(100vh-9rem)] border rounded-lg bg-muted/10 p-3 space-y-3">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]", THEME.spacing.page)}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Patient Queue</h1>
                    <p className="text-xs text-muted-foreground">
                        {visits.length} active sessions
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex-1 sm:flex-none h-8 text-xs"
                    >
                        <RefreshCw className={cn("h-3 w-3 mr-2", refreshing && "animate-spin")} />
                        Sync
                    </Button>
                    <NewAdmissionDialog onSuccess={handleNewAdmission} />
                </div>
            </div>

            {/* Mobile View: Tabs */}
            <div className="flex-1 md:hidden">
                <Tabs defaultValue="WAITING" className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-4 mb-4">
                        <TabsTrigger value="WAITING" className="text-[10px] sm:text-xs">Wait</TabsTrigger>
                        <TabsTrigger value="IN_TRIAGE" className="text-[10px] sm:text-xs">Triage</TabsTrigger>
                        <TabsTrigger value="READY_FOR_DOCTOR" className="text-[10px] sm:text-xs">Ready</TabsTrigger>
                        <TabsTrigger value="WITH_DOCTOR" className="text-[10px] sm:text-xs">Doctor</TabsTrigger>
                    </TabsList>
                    {statusOrder.map((status) => {
                        const statusVisits = getVisitsByStatus(status)
                        return (
                            <TabsContent key={status} value={status} className="flex-1 mt-0 h-full">
                                <StatusColumn status={status} count={statusVisits.length}>
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
                            </TabsContent>
                        )
                    })}
                </Tabs>
            </div>

            {/* Desktop View: Grid */}
            <div className={cn("hidden md:grid grid-cols-2 lg:grid-cols-4 h-full overflow-hidden", THEME.spacing.cardGap)}>
                {statusOrder.map((status) => {
                    const statusVisits = getVisitsByStatus(status)
                    return (
                        <StatusColumn key={status} status={status} count={statusVisits.length}>
                            {statusVisits.length === 0 ? (
                                <div className="text-center py-8 text-xs text-muted-foreground">
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
