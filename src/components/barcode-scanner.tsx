"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, ScanLine, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export function BarcodeScanner() {
  const [studentId, setStudentId] = useState("")
  const [status, setStatus] = useState<"success" | "error" | "idle">("idle")
  const [message, setMessage] = useState("")

  const handleCheckIn = () => {
    if (studentId.trim() === "") {
      setStatus("error")
      setMessage("Silakan masukkan ID siswa.")
      return
    }

    // Simulasi panggilan API dan validasi
    if (studentId.toUpperCase().startsWith("S")) {
      setStatus("success")
      setMessage(`Siswa ${studentId.toUpperCase()} berhasil check-in.`)
    } else {
      setStatus("error")
      setMessage(`ID Siswa ${studentId.toUpperCase()} tidak ditemukan.`)
    }
    setStudentId("")

    // Reset status after a few seconds
    setTimeout(() => {
        setStatus("idle")
    }, 3000)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-6 w-6" />
          Absensi Barcode
        </CardTitle>
        <CardDescription>
          Masukkan ID siswa atau pindai barcode untuk mencatat kehadiran.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student-id">ID Siswa</Label>
          <Input
            id="student-id"
            placeholder="contoh: S001"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheckIn()}
            autoFocus
          />
        </div>
        <Button onClick={handleCheckIn} className="w-full">
          Check In
        </Button>
        {status !== "idle" && (
          <Alert variant={status === "success" ? "default" : "destructive"} className={status === 'success' ? 'bg-green-100 border-green-400' : ''}>
            {status === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>{status === "success" ? "Berhasil" : "Gagal"}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
