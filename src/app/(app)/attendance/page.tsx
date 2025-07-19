import { BarcodeScanner } from "@/components/barcode-scanner";

export default function AttendancePage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Attendance Check-in</h1>
                <p className="text-muted-foreground">Use the scanner below to check students in for today's classes.</p>
            </div>
            <div className="flex justify-center">
                <BarcodeScanner />
            </div>
        </div>
    )
}