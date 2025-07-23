
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
import { mockRoster as initialRoster, mockStudents, mockClasses, mockAttendance, mockSubjects, mockDelegations as initialDelegations } from "@/lib/mock-data"
import type { Student, ScheduleItem, DelegatedTask, Roster, RosterEntry } from '@/lib/mock-data'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { generateAvatarColor } from '@/lib/utils'
import { useParams } from 'next/navigation'

type AttendanceStatus = "Hadir" | "Sakit" | "Izin" | "Alpa"

type StudentAttendance = {
  studentId: string
  status: AttendanceStatus
  notes: string
  isPresent: boolean
}

export default function TeacherAttendancePage() {
  const { toast } = useToast()
  const params = useParams();
  const scheduleId = params.scheduleId as string;
  const [schedule, setSchedule] = useState<ScheduleItem | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, StudentAttendance>>({})
  
  useEffect(() => {
    if (!scheduleId) return;

    let foundScheduleItem: ScheduleItem | null = null;
    let rosterEntryForAttendance: RosterEntry | null = null;
    let foundClassName: string | null = null;

    // Load data safely from localStorage or use initial data
    const savedDelegations = typeof window !== 'undefined' ? localStorage.getItem('mockDelegations') : null;
    const delegations: DelegatedTask[] = savedDelegations ? JSON.parse(savedDelegations) : initialDelegations;

    const savedRoster = typeof window !== 'undefined' ? localStorage.getItem('mockRoster') : null;
    const rosterData: Roster = savedRoster ? JSON.parse(savedRoster) : initialRoster;

    // 1. Check if it's a delegated task first
    const delegatedTask = delegations.find(d => d.id === scheduleId);

    if (delegatedTask) {
        rosterEntryForAttendance = delegatedTask.rosterEntry;
        const subjectName = mockSubjects.find(s => s.id === rosterEntryForAttendance!.subjectId)?.name || 'N/A';
        const classInfo = Object.entries(rosterData).find(([_, entries]) => entries.some(e => e.id === rosterEntryForAttendance!.id));
        foundClassName = classInfo ? mockClasses.find(c => c.id === classInfo[0])?.name || 'N/A' : 'N/A';
        
        foundScheduleItem = {
            id: delegatedTask.id,
            time: rosterEntryForAttendance.time,
            subject: subjectName,
            class: foundClassName,
            teacher: 'Delegated Task', 
            status: 'Sedang Berlangsung'
        };
    } else {
        // 2. If not a delegation, check the regular roster
        for (const classId in rosterData) {
            const entry = rosterData[classId].find(e => e.id === scheduleId);
            if (entry) {
                rosterEntryForAttendance = entry;
                const subjectName = mockSubjects.find(s => s.id === rosterEntryForAttendance!.subjectId)?.name || 'N/A';
                foundClassName = mockClasses.find(c => c.id === classId)?.name || 'N/A';
                foundScheduleItem = {
                    id: rosterEntryForAttendance.id,
                    time: rosterEntryForAttendance.time,
                    subject: subjectName,
                    class: foundClassName,
                    teacher: 'Regular Schedule',
                    status: 'Sedang Berlangsung'
                };
                break; // Exit loop once found
            }
        }
    }

    if (foundScheduleItem && foundClassName) {
        setSchedule(foundScheduleItem);
        const classStudents = mockStudents.filter(s => s.kelas === foundClassName);
        setStudents(classStudents);

        const todayStr = new Date().toISOString().split('T')[0];
        const morningAttendance = JSON.parse(localStorage.getItem('mockAttendance') || JSON.stringify(mockAttendance));
        
        const studentsWhoCheckedIn = new Set(
          Object.entries(morningAttendance)
            .filter(([studentId, records] : [string, any]) => {
              const morningCheckIn = records.find((r:any) => r.date === todayStr && (r.status === 'Tepat Waktu' || r.status === 'Terlambat'));
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
          };
          return acc;
        }, {} as Record<string, StudentAttendance>);
        setAttendance(initialAttendance);
    }
  }, [scheduleId]);

  const handlePresenceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        isPresent,
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
    console.log("Saving attendance:", attendance)
    toast({
        title: "Absensi Disimpan",
        description: "Data kehadiran siswa telah berhasil disimpan.",
    })
  }

  if (!schedule) {
    return <div className="p-8">Loading...</div>
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
