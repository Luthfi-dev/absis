
'use client'

import { mockStudents } from '@/lib/mock-data'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, ShieldCheck, Hash, BookUser, Phone } from 'lucide-react'
import { decryptId } from '@/lib/crypto'
import { useEffect, useState } from 'react'

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<typeof mockStudents[0] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const studentId = decryptId(params.id)
      const foundStudent = mockStudents.find((s) => s.id === studentId)
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        setError("Siswa tidak ditemukan.");
      }
    } catch (e) {
      console.error("Decryption or loading failed", e);
      setError("Gagal memuat profil siswa. ID tidak valid.");
    }
  }, [params.id]);


  if (error) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="items-center text-center">
                    <CardTitle className="font-headline text-2xl font-bold text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p>{error}</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!student) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <p>Loading...</p>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 border-4 border-primary mb-4">
            {student.avatar && <AvatarImage src={student.avatar} alt={student.name} />}
            <AvatarFallback className="text-4xl"><User className="h-10 w-10"/></AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-3xl font-bold">{student.name}</CardTitle>
          <p className="text-muted-foreground">{student.kelas}</p>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">Nama Lengkap</p>
                    <p className="font-medium">{student.name}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="text-sm text-muted-foreground">ID Siswa</p>
                    <p className="font-medium">{student.studentId}</p>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">NIS</p>
                        <p className="font-medium">{student.nis}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="text-sm text-muted-foreground">NISN</p>
                        <p className="font-medium">{student.nisn}</p>
                    </div>
                </div>
            </div>
            {student.nomorOrangTua && (
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                      <p className="text-sm text-muted-foreground">Nomor Orang Tua</p>
                      <p className="font-medium">{student.nomorOrangTua}</p>
                  </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  )
}
