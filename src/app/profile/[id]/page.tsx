import { mockStudents } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, ShieldCheck, Hash, BookUser, Phone } from 'lucide-react'

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const studentId = atob(params.id) // Decrypt the ID from Base64
  const student = mockStudents.find((s) => s.id === studentId)

  if (!student) {
    return notFound()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 border-4 border-primary mb-4">
            <AvatarImage src={student.avatar} alt={student.name} />
            <AvatarFallback className="text-4xl">{student.name.charAt(0)}</AvatarFallback>
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
