
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
import { mockClasses, mockTeachers, type Teacher } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function ClassesPage() {
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    // Load teachers dynamically to show correct wali kelas name
    const savedUsers = typeof window !== 'undefined' ? localStorage.getItem('mockTeachers') : null;
    if (savedUsers) {
      setAllTeachers(JSON.parse(savedUsers));
    } else {
      setAllTeachers(mockTeachers);
    }

    const handleUsersUpdated = () => {
        const updatedUsers = localStorage.getItem('mockTeachers');
        if (updatedUsers) {
            setAllTeachers(JSON.parse(updatedUsers));
        }
    };
    window.addEventListener('usersUpdated', handleUsersUpdated);

    return () => {
        window.removeEventListener('usersUpdated', handleUsersUpdated);
    };
  }, []);

  const getWaliKelasName = (teacherName: string) => {
    // This logic assumes the name is unique. In a real app, you'd use an ID.
    const teacher = allTeachers.find(t => t.name === teacherName);
    return teacher ? teacher.name : 'N/A (Guru tidak ditemukan)';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Kelas</h1>
        <p className="text-muted-foreground">Tambah, ubah, atau hapus data kelas.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Daftar Kelas</CardTitle>
              <CardDescription>Berikut adalah semua kelas yang terdaftar dalam sistem.</CardDescription>
            </div>
              <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Kelas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kelas</TableHead>
                <TableHead>Wali Kelas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{getWaliKelasName(cls.waliKelas)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
