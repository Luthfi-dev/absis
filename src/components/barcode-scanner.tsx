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
      setMessage("Please enter a student ID.")
      return
    }

    // Simulate API call and validation
    if (studentId.toUpperCase().startsWith("S")) {
      setStatus("success")
      setMessage(`Student ${studentId.toUpperCase()} checked in successfully.`)
    } else {
      setStatus("error")
      setMessage(`Student ID ${studentId.toUpperCase()} not found.`)
    }
    setStudentId("")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-6 w-6" />
          Barcode Check-in
        </CardTitle>
        <CardDescription>
          Enter student ID or scan their barcode to register attendance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student-id">Student ID</Label>
          <Input
            id="student-id"
            placeholder="e.g., S001"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheckIn()}
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
            <AlertTitle>{status === "success" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
