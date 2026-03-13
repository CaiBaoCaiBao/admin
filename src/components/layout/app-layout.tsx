'use client'
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner"
export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (<>
        <TooltipProvider>
            {children}
            <Toaster />
        </TooltipProvider>
    </>)
}