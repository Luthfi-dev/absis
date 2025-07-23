
'use client'

import { mockStudents, mockAttendance } from "@/lib/mock-data"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { notFound, useRouter } from "next/navigation"
import { decryptId } from "@/lib/crypto"
import { generateAvatarColor } from "@/lib/utils"
import { useEffect, useState } from "react"
import { type Student, type AttendanceRecord } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User } from "lucide-react"

type StatusVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

function getStatusVariant(status: string): StatusVariant {
    switch (status) {
        case 'Hadir':
            return 'default'
        case 'Excellent':
            return 'success'
        case 'Terlambat':
            return 'warning'
        case 'Absen':
        case 'Izin':
        case 'Sakit':
            return 'destructive'
        default:
            return 'secondary'
    }
}

export default function StudentRecordsPage({ params }: { params: { studentId: string } }) {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const encryptedStudentId = params.studentId;

  useEffect(() => {
    if (!encryptedStudentId) {
        setIsLoading(false);
        notFound();
        return;
    }

    try {
      const decryptedId = decryptId(encryptedStudentId)
      if (decryptedId === 'decryption_error') {
        notFound()
        return
      }
      
      const foundStudent = mockStudents.find((s) => s.id === decryptedId)
      if (foundStudent) {
        setStudent(foundStudent)
        const attendanceRecords = mockAttendance[decryptedId] || []
        setRecords(attendanceRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      } else {
        notFound()
      }
    } catch (e) {
      notFound()
    } finally {
      setIsLoading(false)
    }
  }, [encryptedStudentId])

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (!student) {
    return notFound()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarFallback className="text-2xl" style={{ backgroundColor: generateAvatarColor(student.name) }}>
                {student.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{student.name}</h1>
            <p className="text-muted-foreground">ID Siswa: {student.studentId}</p>
            </div>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kehadiran</CardTitle>
          <CardDescription>
            Log semua catatan kehadiran untuk {student.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length > 0 ? (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                    <TableCell className="font-medium">{record.subject}</TableCell>
                    <TableCell className="text-right">
                        <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    Tidak ada catatan kehadiran yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
