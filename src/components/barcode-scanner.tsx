"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScanLine } from "lucide-react"
import { mockStudents, Student } from "@/lib/mock-data"

export type ScanResult = {
  status: "success" | "error";
  message: string;
  student?: Student;
  timestamp?: string;
};

type BarcodeScannerProps = {
  onScanComplete: (result: ScanResult) => void;
}

export function BarcodeScanner({ onScanComplete }: BarcodeScannerProps) {
  const [studentId, setStudentId] = useState("")

  const handleCheckIn = () => {
    if (studentId.trim() === "") {
        // Don't show an error for empty input, just ignore.
        return
    }

    const student = mockStudents.find(s => s.studentId.toLowerCase() === studentId.toLowerCase());
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${now.toLocaleTimeString('id-ID')}`;

    if (student) {
        onScanComplete({
            status: "success",
            message: "Berhasil melakukan absensi.",
            student: student,
            timestamp: timestamp,
        });
    } else {
        onScanComplete({
            status: "error",
            message: `ID Siswa ${studentId.toUpperCase()} tidak ditemukan.`,
            timestamp: timestamp,
        });
    }
    setStudentId("");
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentId(e.target.value);
  }

  return (
    <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <ScanLine className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium">Arahkan Barcode ke Kamera</h3>
        <p className="text-sm text-muted-foreground">
            Atau ketik ID Siswa di bawah ini dan tekan Enter.
        </p>
        <div className="space-y-2 pt-2">
          <Label htmlFor="student-id" className="sr-only">ID Siswa</Label>
          <Input
            id="student-id"
            placeholder="Pindai atau ketik ID..."
            value={studentId}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleCheckIn()}
            autoFocus
            className="text-center text-lg h-12"
          />
        </div>
      </div>
  )
}
