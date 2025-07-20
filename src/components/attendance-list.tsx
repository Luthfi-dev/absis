
'use client'

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
import { mockStudents, mockAttendance } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'Excellent':
            return 'success';
        case 'Terlambat':
            return 'warning';
        case 'Hadir':
            return 'default';
        default:
            return 'destructive';
    }
}

const allAttendance = Object.entries(mockAttendance).flatMap(([studentId, records]) => {
    const student = mockStudents.find(s => s.id === studentId)
    return records.map(record => ({
        ...record,
        studentName: student?.name || 'Unknown',
        studentId: student?.studentId || 'N/A'
    }))
}).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateB - dateA;

    // If dates are the same, sort by checkInTime
    const timeA = a.checkInTime ? a.checkInTime.split(':').join('') : '999999';
    const timeB = b.checkInTime ? b.checkInTime.split(':').join('') : '999999';
    return Number(timeA) - Number(timeB);
});


export function AttendanceList() {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Semua Catatan Kehadiran</CardTitle>
            <CardDescription>Menampilkan semua data kehadiran yang tercatat dalam sistem, diurutkan berdasarkan yang terbaru.</CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Jam Masuk</TableHead>
                <TableHead>Jam Pulang</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAttendance.map((record) => (
                <TableRow key={`${record.id}-${record.studentId}`}>
                  <TableCell>{new Date(record.date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>{record.subject}</TableCell>
                  <TableCell>{record.checkInTime || '-'}</TableCell>
                  <TableCell>{record.checkOutTime || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  )
}
