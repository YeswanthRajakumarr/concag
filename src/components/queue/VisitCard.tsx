"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Clock, ArrowRight, AlertCircle, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { VISIT_STATUS_CONFIG } from "@/lib/constants"
import type { VisitWithPatient, VisitStatus } from "@/types/database"

interface VisitCardProps {
    visit: VisitWithPatient
    onAction?: (action: string, visitId: string) => void
}

export function VisitCard({ visit, onAction }: VisitCardProps) {
    const arrivalTime = new Date(visit.arrival_time)
    const waitTime = formatDistanceToNow(arrivalTime, { addSuffix: false })

    const waitingTooLong = Date.now() - arrivalTime.getTime() > 30 * 60 * 1000
    const isUrgent = visit.visit_type === "EMERGENCY"

    const getActionButton = () => {
        const baseClass = "w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-10 shadow-sm transition-all active:scale-[0.98]"

        switch (visit.status as VisitStatus) {
            case 'WAITING':
                return (
                    <Button
                        size="sm"
                        className={cn(baseClass, "bg-violet-600 hover:bg-violet-900 shadow-violet-100")}
                        onClick={() => onAction?.('start_triage', visit.id)}
                    >
                        Initiate Triage
                    </Button>
                )
            case 'IN_TRIAGE':
                return (
                    <Link href={`/triage/${visit.id}`} className="w-full">
                        <Button size="sm" variant="outline" className={cn(baseClass, "border-violet-200 text-violet-700 hover:bg-violet-50 group")}>
                            Resume Assessment
                            <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                )
            case 'READY_FOR_DOCTOR':
                return (
                    <Button
                        size="sm"
                        className={cn(baseClass, "bg-violet-600 hover:bg-violet-900 shadow-violet-100")}
                        onClick={() => onAction?.('assign_doctor', visit.id)}
                    >
                        Assign Doctor
                    </Button>
                )
            case 'WITH_DOCTOR':
                return (
                    <Link href={`/visit/${visit.id}`} className="w-full">
                        <Button size="sm" variant="outline" className={cn(baseClass, "border-violet-200 text-violet-700 hover:bg-violet-50 group")}>
                            Consult Detail
                            <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                )
            default:
                return null
        }
    }

    return (
        <Card className={cn(
            "group relative border-none shadow-sm bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
            isUrgent && "ring-1 ring-red-100"
        )}>
            {/* Urgent Status Ribbon */}
            {isUrgent && (
                <div className="absolute top-0 right-0 p-1.5">
                    <div className="bg-red-500 rounded-full h-1.5 w-1.5 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                </div>
            )}

            <CardContent className="p-5">
                <div className="space-y-4">
                    {/* Header: Patient Info */}
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm transform transition-transform group-hover:rotate-3",
                            isUrgent ? "bg-red-50 text-red-600" : "bg-violet-50 text-violet-600"
                        )}>
                            {visit.patient.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                                {visit.patient.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider",
                                    waitingTooLong && !isUrgent ? "text-amber-500" : "text-slate-400"
                                )}>
                                    {waitTime} ago
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-2">
                        {visit.department && (
                            <div className="px-2 py-0.5 rounded-md bg-slate-50 border text-[9px] font-black uppercase tracking-widest text-slate-500">
                                {visit.department}
                            </div>
                        )}
                        <div className="px-2 py-0.5 rounded-md bg-white border border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {visit.visit_type}
                        </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2">
                        {getActionButton()}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
