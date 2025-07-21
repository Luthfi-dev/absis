
'use client'

import { useState, useEffect, useMemo } from 'react';
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
import { mockStudents, mockSubjects, mockAttendance, type Student, mockRoster } from '@/lib/mock-data';
import { subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfISOWeek } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { BarChart, Info } from 'lucide-react';

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

    const teacherSubjects = useMemo(() => {
        if (!user) return [];

        // Find all unique subject IDs taught by the current teacher from the roster
        const subjectIds = new Set<string>();
        Object.values(mockRoster).flat().forEach(entry => {
            if (entry.teacherId === user.id) {
                subjectIds.add(entry.subjectId);
            }
        });

        // Filter the main subjects list based on the IDs found
        return mockSubjects.filter(subject => subjectIds.has(subject.id));

    }, [user]);

    useEffect(() => {
        if (!selectedSubjectId || !user) {
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
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Laporan Kehadiran</h1>
                <p className="text-muted-foreground">Analisis data kehadiran siswa per mata pelajaran.</p>
            </div>

            {teacherSubjects.length === 0 ? (
                <Card className="text-center py-16">
                    <CardHeader>
                        <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-full w-fit">
                            <Info className="h-8 w-8 text-yellow-500 dark:text-yellow-400"/>
                        </div>
                        <CardTitle className="mt-4">Belum Ada Jadwal Mengajar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="max-w-md mx-auto text-muted-foreground">
                            Saat ini Anda belum ditugaskan untuk mengajar mata pelajaran apa pun.
                            Jika Anda merasa ini adalah sebuah kesalahan, silakan hubungi administrator sekolah Anda.
                        </p>
                    </CardContent>
                </Card>
            ) : (
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
                            <div className="rounded-md border">
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
                                        {reportData.length > 0 ? reportData.map(({ student, total, hadir, terlambat, absen }) => (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell className="text-center">{total}</TableCell>
                                                <TableCell className="text-center text-green-600 font-semibold">{hadir}</TableCell>
                                                <TableCell className="text-center text-orange-600 font-semibold">{terlambat}</TableCell>
                                                <TableCell className="text-center text-red-600 font-semibold">{absen}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    Tidak ada data laporan untuk filter yang dipilih.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>Silakan pilih mata pelajaran untuk menampilkan laporan.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
