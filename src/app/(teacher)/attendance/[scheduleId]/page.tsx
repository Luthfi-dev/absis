
'use client'

import { useState, useEffect } from 'react'
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockSchedule, mockStudents, mockClasses, mockAttendance } from "@/lib/mock-data"
import type { Student, ScheduleItem } from '@/lib/mock-data'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { generateAvatarColor } from '@/lib/utils'

type AttendanceStatus = "Hadir" | "Sakit" | "Izin" | "Alpa"

type StudentAttendance = {
  studentId: string
  status: AttendanceStatus
  notes: string
  isPresent: boolean
}

export default function TeacherAttendancePage({ params }: { params: { scheduleId: string } }) {
  const { toast } = useToast()
  const [schedule, setSchedule] = useState<ScheduleItem | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, StudentAttendance>>({})
  const { scheduleId } = params;
  
  useEffect(() => {
    // This logic needs to be aware of delegated tasks now.
    // For this prototype, we'll keep it simple and assume scheduleId is unique
    // across original and delegated tasks. A real app would need a more robust way
    // to fetch the correct schedule details (e.g., passing a date and delegation status).
    const foundSchedule = mockSchedule.find(s => s.id === scheduleId)
    if (foundSchedule) {
      setSchedule(foundSchedule)
      const classInfo = mockClasses.find(c => c.name === foundSchedule.class)
      if (classInfo) {
        const classStudents = mockStudents.filter(s => s.kelas === classInfo.name)
        setStudents(classStudents)
        
        // Initialize attendance state based on morning check-in
        const todayStr = new Date().toISOString().split('T')[0];
        const studentsWhoCheckedIn = new Set(
          Object.entries(mockAttendance)
            .filter(([studentId, records]) => {
              const morningCheckIn = records.find(r => r.date === todayStr && (r.status === 'Tepat Waktu' || r.status === 'Terlambat'));
              return !!morningCheckIn;
            })
            .map(([studentId]) => studentId)
        );

        const initialAttendance = classStudents.reduce((acc, student) => {
          const hasCheckedIn = studentsWhoCheckedIn.has(student.id);
          acc[student.id] = {
            studentId: student.id,
            status: hasCheckedIn ? 'Hadir' : 'Alpa',
            notes: '',
            isPresent: hasCheckedIn,
          }
          return acc
        }, {} as Record<string, StudentAttendance>)
        setAttendance(initialAttendance)
      }
    }
  }, [scheduleId])

  const handlePresenceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        isPresent,
        // If unchecked, set to Alpa, otherwise back to Hadir
        status: isPresent ? 'Hadir' : 'Alpa',
      },
    }))
  }

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        // If status is anything other than Hadir, uncheck presence
        isPresent: status === 'Hadir',
      },
    }))
  }

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }))
  }
  
  const handleSaveAttendance = () => {
    // In a real app, this is where you'd check if it's a delegated task
    // and save the attendance record under the ORIGINAL teacher's name/ID,
    // but maybe with a flag indicating who recorded it.
    // For now, we'll just log and toast.
    console.log("Saving attendance:", attendance)
    toast({
        title: "Absensi Disimpan",
        description: "Data kehadiran siswa telah berhasil disimpan.",
    })
  }

  if (!schedule) {
    // a delay to allow useEffect to run
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center">
            <div>
              <Button variant="outline" asChild>
                  <Link href="/teacher-dashboard">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Kembali ke Dasbor
                  </Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight font-headline mt-4">Absensi Kelas: {schedule.subject}</h1>
              <p className="text-muted-foreground">Kelas {schedule.class} - {schedule.time}</p>
          </div>
          <Button onClick={handleSaveAttendance}>
              <Save className="mr-2 h-4 w-4"/>
              Simpan Absensi
          </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
          <CardDescription>
            Centang siswa yang hadir. Kehadiran pagi telah terisi otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Hadir</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={attendance[student.id]?.isPresent || false}
                      onCheckedChange={(checked) => handlePresenceChange(student.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            {student.avatar && <AvatarImage src={student.avatar} alt={student.name} />}
                            <AvatarFallback style={{ backgroundColor: generateAvatarColor(student.name) }}>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.studentId}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={attendance[student.id]?.status || 'Hadir'}
                      onValueChange={(value: AttendanceStatus) => handleStatusChange(student.id, value)}
                      disabled={attendance[student.id]?.isPresent || false}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hadir">Hadir</SelectItem>
                        <SelectItem value="Sakit">Sakit</SelectItem>
                        <SelectItem value="Izin">Izin</SelectItem>
                        <SelectItem value="Alpa">Alpa</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Tambahkan catatan..."
                      value={attendance[student.id]?.notes || ''}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      disabled={attendance[student.id]?.isPresent || false}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
