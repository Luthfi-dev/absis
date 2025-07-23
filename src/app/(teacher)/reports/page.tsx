'use client'

import { useState, useEffect, useMemo, Fragment } from 'react';
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
import { BarChart, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { generateAvatarColor } from '@/lib/utils';

type TimeRange = 'week' | 'month' | 'semester';
type ReportData = {
    student: Student;
    total: number;
    hadir: number;
    terlambat: number;
    absen: number;
};

const ResponsiveRow = ({ data }: { data: ReportData }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { student, total, hadir, terlambat, absen } = data;

    return (
        <Fragment>
            <TableRow className="cursor-pointer sm:cursor-auto" onClick={() => setIsExpanded(!isExpanded)}>
                <TableCell>
                     <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 hidden sm:flex">
                            <AvatarFallback style={{ backgroundColor: generateAvatarColor(student.name) }}>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{student.name}</div>
                    </div>
                </TableCell>
                <TableCell className="text-center hidden md:table-cell">{total}</TableCell>
                <TableCell className="text-center hidden sm:table-cell text-green-600 font-semibold">{hadir}</TableCell>
                <TableCell className="text-center hidden sm:table-cell text-orange-600 font-semibold">{terlambat}</TableCell>
                <TableCell className="text-center hidden sm:table-cell text-red-600 font-semibold">{absen}</TableCell>
                <TableCell className="text-right sm:hidden">
                    <Button size="icon" variant="ghost">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <span className="sr-only">Toggle details</span>
                    </Button>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-muted/50 hover:bg-muted/50 sm:hidden">
                    <TableCell colSpan={2}>
                        <div className="grid grid-cols-3 gap-y-2 p-2 text-sm text-center">
                             <div className="md:hidden">
                                <div className="font-medium text-muted-foreground">Total</div>
                                <div>{total}</div>
                            </div>
                            <div>
                                <div className="font-medium text-muted-foreground">Hadir</div>
                                <div className="text-green-600 font-semibold">{hadir}</div>
                            </div>
                            <div>
                                <div className="font-medium text-muted-foreground">Terlambat</div>
                                <div className="text-orange-600 font-semibold">{terlambat}</div>
                            </div>
                             <div>
                                <div className="font-medium text-muted-foreground">Absen</div>
                                <div className="text-red-600 font-semibold">{absen}</div>
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    )
}

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
        <>
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
                                            <TableHead className="text-center hidden md:table-cell">Total Pertemuan</TableHead>
                                            <TableHead className="text-center hidden sm:table-cell">Hadir</TableHead>
                                            <TableHead className="text-center hidden sm:table-cell">Terlambat</TableHead>
                                            <TableHead className="text-center hidden sm:table-cell">Absen</TableHead>
                                            <TableHead className="sm:hidden"><span className="sr-only">Details</span></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.length > 0 ? reportData.map((data) => (
                                            <ResponsiveRow key={data.student.id} data={data} />
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
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
        </>
    )
}
