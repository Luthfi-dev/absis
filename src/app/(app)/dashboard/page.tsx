
'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DynamicSchedule } from "@/components/dynamic-schedule"
import { Users, UserCheck, UserX, BookOpen, UserCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { mockStudents, mockTeachers, mockSubjects, mockAttendance } from "@/lib/mock-data"
import type { Student, Teacher, AttendanceRecord } from "@/lib/mock-data"

export default function DashboardPage() {
    const [stats, setStats] = useState([
        { title: "Total Siswa", value: "0", icon: Users, color: "text-blue-500" },
        { title: "Total Guru", value: "0", icon: UserCircle, color: "text-purple-500" },
        { title: "Total Mata Pelajaran", value: "0", icon: BookOpen, color: "text-yellow-500" },
        { title: "Hadir Hari Ini", value: "0", icon: UserCheck, color: "text-green-500" },
        { title: "Absen Hari Ini", value: "0", icon: UserX, color: "text-red-500" },
    ]);

    useEffect(() => {
        // In a real app, you'd fetch this data. For now, we use mock data which might
        // be updated in localStorage by other components.
        const students: Student[] = JSON.parse(localStorage.getItem('mockStudents') || JSON.stringify(mockStudents));
        const teachers: Teacher[] = JSON.parse(localStorage.getItem('mockTeachers') || JSON.stringify(mockTeachers));
        const subjects = mockSubjects;
        const attendance: Record<string, AttendanceRecord[]> = JSON.parse(localStorage.getItem('mockAttendance') || JSON.stringify(mockAttendance));
        
        const todayStr = new Date().toISOString().split('T')[0];

        const studentsPresentToday = new Set(
            Object.values(attendance).flat().filter(record => 
                record.date === todayStr && 
                (record.status === 'Excellent' || record.status === 'Terlambat' || record.status === 'Hadir')
            ).map(record => {
                // Find studentId from the key of the attendance object
                for(const studentId in attendance){
                    if(attendance[studentId].some(att => att.id === record.id)){
                        return studentId;
                    }
                }
                return null;
            }).filter(Boolean)
        );
        
        const totalStudents = students.length;
        const presentTodayCount = studentsPresentToday.size;
        const absentTodayCount = totalStudents - presentTodayCount;
        const totalTeachers = teachers.filter(t => t.role === 'teacher').length;
        const totalSubjects = subjects.length;

        setStats([
            { title: "Total Siswa", value: String(totalStudents), icon: Users, color: "text-blue-500" },
            { title: "Total Guru", value: String(totalTeachers), icon: UserCircle, color: "text-purple-500" },
            { title: "Total Mata Pelajaran", value: String(totalSubjects), icon: BookOpen, color: "text-yellow-500" },
            { title: "Hadir Hari Ini", value: String(presentTodayCount), icon: UserCheck, color: "text-green-500" },
            { title: "Absen Hari Ini", value: String(absentTodayCount), icon: UserX, color: "text-red-500" },
        ]);

    }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dasbor Super Admin</h1>
        <p className="text-muted-foreground">Selamat datang kembali! Berikut adalah ringkasan sistem Anda.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div>
        <DynamicSchedule />
      </div>
    </div>
  )
}
