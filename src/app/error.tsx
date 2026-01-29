'use client' // Error pages must be Client Components

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 text-center px-4">
            <Card className="border-none shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-red-50 p-8 flex flex-col items-center border-b border-red-100">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-black text-red-900 tracking-tight">System Error</h2>
                    <p className="text-red-700 font-medium mt-2">
                        Something went wrong while processing your request.
                    </p>
                </div>
                <CardContent className="p-8 space-y-6">
                    <div className="bg-muted p-4 rounded-lg text-left overflow-auto max-h-32 text-xs font-mono text-muted-foreground break-all">
                        {error.message || "Unknown Application Error"}
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => window.location.href = '/queue'}
                            variant="outline"
                            className="flex-1 font-bold border-2"
                        >
                            Dashboard
                        </Button>
                        <Button
                            onClick={() => reset()}
                            className="flex-1 bg-violet-600 hover:bg-violet-700 font-bold uppercase tracking-wider"
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
