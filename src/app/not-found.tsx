import Link from "next/link"
import { FileQuestion, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 text-center px-4">
            <div className="flex items-center justify-center h-24 w-24 rounded-3xl bg-violet-100 mb-8 animate-in zoom-in-50 duration-500">
                <FileQuestion className="h-12 w-12 text-violet-600" />
            </div>
            <h1 className="text-4xl font-black text-violet-900 tracking-tight mb-2">Page Not Found</h1>
            <p className="text-muted-foreground font-medium mb-8 max-w-md text-lg">
                The clinical resource you are looking for might have been moved, deleted, or you may not have permission to view it.
            </p>
            <Link href="/queue">
                <Button className="bg-violet-600 hover:bg-violet-700 font-bold uppercase tracking-widest px-8 py-6 rounded-xl gap-2 shadow-lg shadow-violet-200">
                    <Home className="h-5 w-5" />
                    Return to Queue
                </Button>
            </Link>
        </div>
    )
}
