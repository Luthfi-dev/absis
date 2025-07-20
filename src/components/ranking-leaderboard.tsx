
'use client'

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockStudents, mockAttendance, mockClasses, Student, AttendanceRecord } from '@/lib/mock-data';
import { startOfWeek, startOfMonth, startOfToday } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Crown, Medal } from 'lucide-react';

type TimeRange = 'today' | 'week' | 'month';
type Scope = 'all' | string; // 'all' for overall, or classId for specific class

type RankingData = {
  student: Student;
  checkInTime: string;
  checkInDate: Date;
};

const getMedalColor = (rank: number) => {
    switch (rank) {
        case 1: return "text-yellow-400";
        case 2: return "text-gray-400";
        case 3: return "text-amber-600";
        default: return "text-muted-foreground";
    }
}

export function RankingLeaderboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [scope, setScope] = useState<Scope>('all');
  const [rankings, setRankings] = useState<RankingData[]>([]);

  const filteredRankings = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
        case 'week':
            startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
            break;
        case 'month':
            startDate = startOfMonth(now);
            break;
        case 'today':
        default:
            startDate = startOfToday();
            break;
    }

    const relevantStudents = scope === 'all' 
        ? mockStudents 
        : mockStudents.filter(s => {
            const classInfo = mockClasses.find(c => c.id === scope);
            return s.kelas === classInfo?.name;
        });

    const studentFastestCheckIns: { [studentId: string]: RankingData } = {};

    relevantStudents.forEach(student => {
        const records = mockAttendance[student.id] || [];
        
        records.forEach(record => {
            const recordDate = new Date(record.date);
            if (record.checkInTime && recordDate >= startDate) {
                const currentFastest = studentFastestCheckIns[student.id];
                if (!currentFastest || record.checkInTime < currentFastest.checkInTime) {
                    studentFastestCheckIns[student.id] = {
                        student,
                        checkInTime: record.checkInTime,
                        checkInDate: recordDate,
                    };
                }
            }
        });
    });

    return Object.values(studentFastestCheckIns)
        .sort((a, b) => a.checkInTime.localeCompare(b.checkInTime));
        
  }, [timeRange, scope]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-yellow-500" />
                    Peringkat Kehadiran Tercepat
                </CardTitle>
                <CardDescription>Siswa dengan rekor waktu check-in paling awal.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Select onValueChange={(value: Scope) => setScope(value)} defaultValue="all">
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Pilih Lingkup" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Keseluruhan</SelectItem>
                        {mockClasses.map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select onValueChange={(value: TimeRange) => setTimeRange(value)} defaultValue="today">
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Pilih Rentang Waktu" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Hari Ini</SelectItem>
                        <SelectItem value="week">Minggu Ini</SelectItem>
                        <SelectItem value="month">Bulan Ini</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRankings.length > 0 ? (
            <ul className="space-y-3">
                {filteredRankings.map((item, index) => {
                    const rank = index + 1;
                    return (
                        <li key={item.student.id} className={`flex items-center gap-4 p-3 rounded-lg border ${rank <= 3 ? 'bg-muted/50 font-semibold' : ''}`}>
                            <div className={`flex items-center justify-center w-10 text-xl font-bold ${getMedalColor(rank)}`}>
                               {rank <= 3 ? <Medal className="w-7 h-7" /> : <span className="text-base">{rank}</span>}
                            </div>
                             <Avatar className="h-12 w-12 border-2 border-primary/50">
                                <AvatarImage src={item.student.avatar} alt={item.student.name} />
                                <AvatarFallback>{item.student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-base">{item.student.name}</p>
                                <p className="text-sm text-muted-foreground">{item.student.kelas}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-primary">{item.checkInTime}</p>
                                <p className="text-xs text-muted-foreground">{item.checkInDate.toLocaleDateString('id-ID', { weekday: 'long' })}</p>
                            </div>
                        </li>
                    )
                })}
            </ul>
        ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="text-lg font-medium">Tidak Ada Data Peringkat</p>
                <p>Belum ada data kehadiran yang tercatat untuk filter yang dipilih.</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
