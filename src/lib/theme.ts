/**
 * ConCag Design System - Clinical Theme Configuration
 * Simplified tokens for a production-grade, high-density medical interface.
 */

export const THEME = {
    // Clinical Status Colors (Standardized)
    colors: {
        status: {
            waiting: "amber-600",
            waitingBg: "amber-50",
            triage: "blue-600",
            triageBg: "blue-50",
            doctor: "emerald-600",
            doctorBg: "emerald-50",
            urgent: "red-600",
            urgentBg: "red-50",
        },
    },

    // Standard Spacing/Layout
    spacing: {
        page: "p-6",
        cardGap: "gap-4",
    },
} as const;

export const getStatusColorClasses = (status: string) => {
    switch (status) {
        case 'WAITING':
            return "bg-amber-100 text-amber-800 border-amber-200";
        case 'IN_TRIAGE':
            return "bg-blue-100 text-blue-800 border-blue-200";
        case 'READY_FOR_DOCTOR':
            return "bg-violet-100 text-violet-800 border-violet-200";
        case 'WITH_DOCTOR':
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
        default:
            return "bg-slate-100 text-slate-800 border-slate-200";
    }
};
