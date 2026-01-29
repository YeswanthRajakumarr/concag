"use client"

import { cn } from "@/lib/utils"
import { VISIT_STATUS_CONFIG } from "@/lib/constants"
import type { VisitStatus } from "@/types/database"
import { getStatusColorClasses } from "@/lib/theme"

interface StatusColumnProps {
    status: VisitStatus
    count: number
    children: React.ReactNode
}

export function StatusColumn({ status, count, children }: StatusColumnProps) {
    const config = VISIT_STATUS_CONFIG[status]
    const statusColor = getStatusColorClasses(status)

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] border rounded-lg bg-muted/10 overflow-hidden">
            {/* Standard Table-like Header */}
            <div className={cn("px-4 py-3 border-b bg-background flex items-center justify-between sticky top-0 z-10", statusColor.replace('text-', 'border-l-4 border-l-'))}>
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm uppercase text-foreground">
                        {config.label}
                    </h3>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {count}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    )
}
