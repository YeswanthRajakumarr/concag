"use client"

import { cn } from "@/lib/utils"
import { VISIT_STATUS_CONFIG } from "@/lib/constants"
import type { VisitStatus } from "@/types/database"

interface StatusColumnProps {
    status: VisitStatus
    count: number
    children: React.ReactNode
}

export function StatusColumn({ status, count, children }: StatusColumnProps) {
    const config = VISIT_STATUS_CONFIG[status]

    return (
        <div className="flex flex-col min-h-[500px] bg-white/50 border rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md">
            {/* Minimal Header */}
            <div className="px-5 py-4 border-b bg-white flex items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {/* Status Type Indicator Dot */}
                        <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            status === "WAITING" && "bg-amber-400",
                            status === "IN_TRIAGE" && "bg-blue-400",
                            status === "READY_FOR_DOCTOR" && "bg-violet-600",
                            status === "WITH_DOCTOR" && "bg-emerald-500",
                        )} />
                        <h3 className="font-black text-[12px] uppercase tracking-[0.1em] text-slate-900 leading-none">
                            {config.label}
                        </h3>
                    </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
                    <span className="text-[10px] font-black text-slate-600 tracking-tighter">{count}</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 space-y-4 overflow-auto bg-slate-50/30">
                {children}
            </div>
        </div>
    )
}
