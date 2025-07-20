'use client'

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from '@/hooks/use-auth';
import { mockStudents, mockSubjects, mockAttendance, type Student } from '@/lib/mock-data';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfISOWeek } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { BarChart } from 'lucide-react';

type TimeRange = 'week' | 'month' | 'semester';
type ReportData = {
    student: Student;
    total: number;
    hadir: number;
    terlambat: number;
    absen: number;
};

export default function TeacherReportsPage() {
    const { user } = useAuth();
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [reportData, setReportData] = useState<ReportData[]>([]);

    const teacherSubjects = mockSubjects; // In a real app, filter by teacher

    useEffect(() => {
        if (!selectedSubjectId) {
            setReportData([]);
            return;
        }

        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        switch (timeRange) {
            case 'week':
                startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
                endDate = endOfWeek(now, { weekStartsOn: 1 });
                break;
            case 'month':
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case 'semester':
                startDate = subMonths(now, 6);
                break;
        }
        
        const subjectName = mockSubjects.find(s => s.id === selectedSubjectId)?.name || '';

        // In a real app, you would filter students by class taught by the teacher for that subject.
        const relevantStudents = mockStudents; 

        const data = relevantStudents.map(student => {
            const studentRecords = mockAttendance[student.id] || [];
            const filteredRecords = studentRecords.filter(record => {
                const recordDate = new Date(record.date);
                return record.subject === subjectName && recordDate >= startDate && recordDate <= endDate;
            });

            return {
                student: student,
                total: filteredRecords.length,
                hadir: filteredRecords.filter(r => r.status === 'Hadir' || r.status === 'Excellent').length,
                terlambat: filteredRecords.filter(r => r.status === 'Terlambat').length,
                absen: filteredRecords.filter(r => r.status === 'Absen').length,
            };
        });

        setReportData(data);

    }, [selectedSubjectId, timeRange, user]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Laporan Kehadiran</h1>
                <p className="text-muted-foreground">Analisis data kehadiran siswa per mata pelajaran.</p>
            </div>

             <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart className="h-6 w-6" />
                                Filter Laporan
                            </CardTitle>
                            <CardDescription>Pilih mata pelajaran dan rentang waktu untuk melihat laporan.</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Select onValueChange={setSelectedSubjectId}>
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Pilih Mata Pelajaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teacherSubjects.map(subject => (
                                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(value: TimeRange) => setTimeRange(value)} defaultValue="week">
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Pilih Rentang Waktu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">Minggu Ini</SelectItem>
                                    <SelectItem value="month">Bulan Ini</SelectItem>
                                    <SelectItem value="semester">Semester Ini (6 Bulan)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {selectedSubjectId ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Siswa</TableHead>
                                    <TableHead className="text-center">Total Pertemuan</TableHead>
                                    <TableHead className="text-center">Hadir</TableHead>
                                    <TableHead className="text-center">Terlambat</TableHead>
                                    <TableHead className="text-center">Absen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.map(({ student, total, hadir, terlambat, absen }) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="text-center">{total}</TableCell>
                                        <TableCell className="text-center text-green-600 font-semibold">{hadir}</TableCell>
                                        <TableCell className="text-center text-orange-600 font-semibold">{terlambat}</TableCell>
                                        <TableCell className="text-center text-red-600 font-semibold">{absen}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>Silakan pilih mata pelajaran untuk menampilkan laporan.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
