/**
 * ConCag Design System - Theme Configuration
 * Centralized styles, colors, and UI tokens to maintain a premium professional aesthetic.
 */

export const THEME = {
    // Brand Colors & Shadcn Token Mapping
    colors: {
        brand: {
            primary: "violet-600",
            primaryHover: "violet-900",
            primaryLight: "violet-50",
            secondary: "slate-900",
            secondaryHover: "black",
        },
        status: {
            waiting: "amber-500",
            urgent: "red-600",
            urgentBg: "red-50",
            triage: "blue-600",
            triageBg: "blue-50",
            doctor: "emerald-600",
            doctorBg: "emerald-50",
        },
        text: {
            main: "slate-900",
            muted: "slate-400",
            light: "slate-500",
            onPrimary: "white",
        },
    },

    // Typography Bundles
    typography: {
        // Clinical Labels (e.g., "DRUG ALLERGIES")
        label: "text-[10px] font-black uppercase tracking-widest leading-none text-slate-400",
        // Dashboard Stats / Titles
        heading: "text-3xl font-black tracking-tight leading-none uppercase",
        // Small labels
        subheading: "text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2 leading-none",
        // Sub-text / Metadata
        meta: "text-[10px] font-bold uppercase tracking-wider",
        // Card Content
        body: "text-sm",
    },

    // Component Styles (Tailwind Class Bundles)
    components: {
        // Premium Cards
        card: "border-none shadow-xl rounded-3xl overflow-hidden bg-white",
        cardInteractive: "transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer",

        // High-end Buttons
        buttonPrimary: "bg-violet-600 hover:bg-violet-900 text-white font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-violet-100 transition-all active:scale-95 flex items-center justify-center gap-2",
        buttonSecondary: "bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] h-11 px-8 rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2",
        buttonOutline: "border-violet-200 text-violet-700 hover:bg-violet-50 font-bold uppercase tracking-wider text-[10px] h-11 px-6 rounded-xl border-2 transition-all flex items-center justify-center gap-2",

        // Input Fields (Medical Portal Look)
        input: "h-14 rounded-2xl bg-slate-50 border-none shadow-inner text-base font-medium placeholder:text-slate-400 focus-visible:ring-violet-500 transition-all",

        // Status Indicators
        pulse: "h-1.5 w-1.5 rounded-full animate-pulse",
    },

    // Animation presets
    animations: {
        fadeUp: "animate-in-slide-up",
        fadeIn: "animate-in-fade",
    }
} as const;

// Helper to get status color specifically for shadcn badges or custom chips
export const getStatusColors = (status: string) => {
    switch (status) {
        case 'WAITING': return { text: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" };
        case 'IN_TRIAGE': return { text: "text-blue-700", bg: "bg-blue-100", border: "border-blue-200" };
        case 'READY_FOR_DOCTOR': return { text: "text-violet-700", bg: "bg-violet-100", border: "border-violet-200" };
        case 'WITH_DOCTOR': return { text: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" };
        default: return { text: "text-slate-700", bg: "bg-slate-100", border: "border-slate-200" };
    }
};
