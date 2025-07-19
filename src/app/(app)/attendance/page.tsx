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
import { mockStudents, mockAttendance, mockSchedule } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"

const allAttendance = Object.entries(mockAttendance).flatMap(([studentId, records]) => {
    const student = mockStudents.find(s => s.id === studentId)
    return records.map(record => ({
        ...record,
        studentName: student?.name || 'Unknown',
        studentId: student?.studentId || 'N/A'
    }))
}).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())


export default function AttendancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Laporan Kehadiran</h1>
        <p className="text-muted-foreground">Lihat dan filter seluruh catatan kehadiran siswa.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Semua Catatan</CardTitle>
            <CardDescription>Menampilkan semua data kehadiran yang tercatat dalam sistem.</CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama Siswa</TableHead>
                <TableHead>ID Siswa</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAttendance.map((record) => (
                <TableRow key={`${record.id}-${record.studentId}`}>
                  <TableCell>{new Date(record.date).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.studentId}</Badge>
                  </TableCell>
                  <TableCell>{record.subject}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={record.status === 'Hadir' ? 'default' : record.status === 'Terlambat' ? 'outline' : 'destructive'}>{record.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
