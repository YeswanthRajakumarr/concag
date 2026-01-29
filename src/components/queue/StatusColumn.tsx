"use client"

import { cn } from "@/lib/utils"
import { VISIT_STATUS_CONFIG } from "@/lib/constants"
import type { VisitStatus } from "@/types/database"
import { THEME } from "@/lib/theme"

interface StatusColumnProps {
    status: VisitStatus
    count: number
    children: React.ReactNode
}

export function StatusColumn({ status, count, children }: StatusColumnProps) {
    const config = VISIT_STATUS_CONFIG[status]

    const getIndicatorColor = () => {
        switch (status) {
            case "WAITING": return "bg-amber-400";
            case "IN_TRIAGE": return "bg-blue-400";
            case "READY_FOR_DOCTOR": return `bg-${THEME.colors.brand.primary}`;
            case "WITH_DOCTOR": return `bg-${THEME.colors.status.doctor}`;
            default: return "bg-slate-400";
        }
    }

    return (
        <div className={cn("flex flex-col min-h-[500px] border rounded-3xl shadow-sm overflow-hidden transition-all hover:shadow-lg", THEME.animations.fadeIn)}>
            {/* Minimal Header */}
            <div className="px-5 py-4 border-b bg-white flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {/* Status Type Indicator Dot */}
                        <div className={cn("h-1.5 w-1.5 rounded-full", getIndicatorColor())} />
                        <h3 className={cn(THEME.typography.meta, "text-slate-900 leading-none")}>
                            {config.label}
                        </h3>
                    </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                    <span className="text-[10px] font-black text-slate-600 tracking-tighter">{count}</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 space-y-4 overflow-auto bg-slate-50/20">
                {children}
            </div>
        </div>
    )
}
