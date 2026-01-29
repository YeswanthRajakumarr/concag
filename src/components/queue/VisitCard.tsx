import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Clock, AlertCircle, ChevronRight, User, Building2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { VisitWithPatient, VisitStatus } from "@/types/database"
import { getStatusColorClasses } from "@/lib/theme"

interface VisitCardProps {
    visit: VisitWithPatient
    onAction?: (action: string, visitId: string) => void
}

export function VisitCard({ visit, onAction }: VisitCardProps) {
    const arrivalTime = new Date(visit.arrival_time)
    const waitTime = formatDistanceToNow(arrivalTime, { addSuffix: false })
    const isUrgent = visit.visit_type === "EMERGENCY"

    // Action button logic
    const renderActionParams = () => {
        switch (visit.status as VisitStatus) {
            case 'WAITING':
                return { label: "Triage", action: "start_triage", variant: "default" as const }
            case 'IN_TRIAGE':
                return { label: "Resume", action: "resume_triage", variant: "outline" as const, href: `/triage/${visit.id}` }
            case 'READY_FOR_DOCTOR':
                return { label: "Assign", action: "assign_doctor", variant: "default" as const }
            case 'WITH_DOCTOR':
                return { label: "Consult", action: "view_consult", variant: "outline" as const, href: `/visit/${visit.id}` }
            default:
                return null
        }
    }

    const actionParams = renderActionParams()

    return (
        <Card className={cn("hover:shadow-md transition-shadow flex flex-col", isUrgent && "border-red-200 bg-red-50/20")}>
            <CardContent className="p-3 space-y-3">
                {/* Top Row: Name and Time */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <div className="bg-muted p-1 rounded-md">
                            <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="font-bold text-sm truncate" title={visit.patient.name}>
                            {visit.patient.name}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap shrink-0 bg-muted/50 px-1.5 py-0.5 rounded-md">
                        <Clock className="h-3 w-3" />
                        <span>{waitTime}</span>
                    </div>
                </div>

                {/* Middle Row: Badges */}
                <div className="flex flex-wrap items-center gap-2 min-h-[1.5rem]">
                    {visit.department && (
                        <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 max-w-[140px] truncate flex items-center gap-1" title={visit.department}>
                            <Building2 className="h-3 w-3 opacity-50" />
                            {visit.department}
                        </Badge>
                    )}
                    {isUrgent && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                            URGENT
                        </Badge>
                    )}
                </div>

                {/* Bottom Row: Status and Action */}
                <div className="flex items-center justify-between gap-2 pt-1 mt-auto">
                    <Badge variant="outline" className={cn("text-[10px] font-medium h-6 px-2 border-0", getStatusColorClasses(visit.status))}>
                        {visit.status.replace(/_/g, " ")}
                    </Badge>

                    {actionParams && (
                        actionParams.href ? (
                            <Link href={actionParams.href}>
                                <Button size="sm" variant={actionParams.variant} className="h-7 text-xs px-3">
                                    {actionParams.label}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="sm"
                                variant={actionParams.variant}
                                className="h-7 text-xs px-3"
                                onClick={() => onAction?.(actionParams.action, visit.id)}
                            >
                                {actionParams.label}
                            </Button>
                        )
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
