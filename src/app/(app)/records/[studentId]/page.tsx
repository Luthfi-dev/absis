
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
import { notFound } from "next/navigation"
import { decryptId } from "@/lib/crypto"
import { generateAvatarColor } from "@/lib/utils"

type StatusVariant = "default" | "secondary" | "destructive" | "outline"

function getStatusVariant(status: 'Hadir' | 'Absen' | 'Terlambat'): StatusVariant {
    switch (status) {
        case 'Hadir':
            return 'default'
        case 'Terlambat':
            return 'outline'
        case 'Absen':
            return 'destructive'
    }
}

export default function StudentRecordsPage({ params }: { params: { studentId: string } }) {
  const studentId = decryptId(params.studentId)
  const student = mockStudents.find((s) => s.id === studentId)
  const records = mockAttendance[studentId] || []

  if (!student) {
    notFound()
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20 border-2 border-primary">
          {student.avatar && <AvatarImage src={student.avatar} />}
          <AvatarFallback className="text-2xl" style={{ backgroundColor: generateAvatarColor(student.name) }}>{student.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{student.name}</h1>
          <p className="text-muted-foreground">ID Siswa: {student.studentId}</p>
        </div>
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
                    <TableCell>{record.date}</TableCell>
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
