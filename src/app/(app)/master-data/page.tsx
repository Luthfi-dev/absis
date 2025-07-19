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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockTeachers, mockSchedule } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { PlusCircle, User, Clock, BookOpen, Link2 } from "lucide-react"

export default function MasterDataPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Master Data</h1>
        <p className="text-muted-foreground">Kelola data inti aplikasi: Guru, Jadwal, dan lainnya.</p>
      </div>

      <Tabs defaultValue="teachers">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="teachers"><User className="mr-2 h-4 w-4" />Data Guru</TabsTrigger>
          <TabsTrigger value="schedules"><Clock className="mr-2 h-4 w-4" />Data Jadwal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Manajemen Guru</CardTitle>
                  <CardDescription>Tambah, ubah, atau hapus data guru.</CardDescription>
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
                    <TableHead>Email</TableHead>
                    <TableHead>NIP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.nip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
           <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Manajemen Jadwal</CardTitle>
                  <CardDescription>Atur jadwal pelajaran dan hubungkan dengan guru pengajar.</CardDescription>
                </div>
                 <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Jadwal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Guru Pengajar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSchedule.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.subject}</TableCell>
                      <TableCell>{schedule.time}</TableCell>
                      <TableCell>{schedule.teacher}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
