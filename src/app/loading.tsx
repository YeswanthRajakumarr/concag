import { Activity } from "lucide-react"

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="relative">
                <div className="absolute inset-0 bg-violet-600/20 blur-xl rounded-full animate-pulse" />
                <div className="relative h-16 w-16 rounded-2xl bg-violet-600 flex items-center justify-center animate-bounce shadow-xl shadow-violet-200">
                    <Activity className="h-8 w-8 text-white animate-pulse" />
                </div>
            </div>
            <p className="mt-8 text-sm font-black uppercase tracking-widest text-violet-900 animate-pulse">
                Loading Clinical Data...
            </p>
        </div>
    )
}
