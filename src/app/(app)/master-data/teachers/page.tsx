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
import { mockTeachers, type Teacher } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const { toast } = useToast()

    useEffect(() => {
        const savedTeachers = localStorage.getItem('mockTeachers');
        if (savedTeachers) {
            setTeachers(JSON.parse(savedTeachers));
        } else {
            localStorage.setItem('mockTeachers', JSON.stringify(mockTeachers));
            setTeachers(mockTeachers);
        }

        const handleStorageChange = () => {
            const updatedTeachers = localStorage.getItem('mockTeachers');
            if (updatedTeachers) {
                setTeachers(JSON.parse(updatedTeachers));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Custom event for same-tab updates
        window.addEventListener('teachersUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('teachersUpdated', handleStorageChange);
        };
    }, []);

    const handleStatusChange = (teacherId: string, newStatus: 'active' | 'pending') => {
        const updatedTeachers = teachers.map(teacher => 
            teacher.id === teacherId ? { ...teacher, status: newStatus } : teacher
        );
        setTeachers(updatedTeachers);
        localStorage.setItem('mockTeachers', JSON.stringify(updatedTeachers));
        toast({
            title: "Status Guru Diperbarui",
            description: `Status guru telah diubah menjadi ${newStatus === 'active' ? 'aktif' : 'menunggu'}.`,
        });
    };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Guru</h1>
        <p className="text-muted-foreground">Tambah, ubah, atau hapus data guru.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Daftar Guru</CardTitle>
              <CardDescription>Berikut adalah semua guru yang terdaftar dalam sistem.</CardDescription>
            </div>
              <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Guru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Guru</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktifkan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.nip}</TableCell>
                   <TableCell>
                      <Badge variant={teacher.status === 'active' ? 'default' : 'outline'}>
                        {teacher.status === 'active' ? 'Aktif' : 'Menunggu'}
                      </Badge>
                   </TableCell>
                  <TableCell className="text-right">
                    <Switch
                        checked={teacher.status === 'active'}
                        onCheckedChange={(checked) => handleStatusChange(teacher.id, checked ? 'active' : 'pending')}
                        aria-label={`Aktifkan ${teacher.name}`}
                    />
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
