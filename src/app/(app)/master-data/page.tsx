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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockTeachers, mockSchedule, mockClasses, mockSubjects } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { PlusCircle, User, Clock, BookOpen, School, Book } from "lucide-react"

export default function MasterDataPage() {
  // In a real app, this data would be fetched and managed via state (e.g., useState, useQuery)
  // For this prototype, we are just displaying the mock data.
  // CRUD operations would update this state.

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Master Data</h1>
        <p className="text-muted-foreground">Kelola data inti aplikasi: Guru, Kelas, Pelajaran, dan Jadwal.</p>
      </div>

      <Tabs defaultValue="teachers">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="teachers"><User className="mr-2 h-4 w-4" />Data Guru</TabsTrigger>
          <TabsTrigger value="classes"><School className="mr-2 h-4 w-4"/>Data Kelas</TabsTrigger>
          <TabsTrigger value="subjects"><Book className="mr-2 h-4 w-4"/>Data Pelajaran</TabsTrigger>
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

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Manajemen Kelas</CardTitle>
                  <CardDescription>Tambah, ubah, atau hapus data kelas.</CardDescription>
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
                      <TableCell>{cls.waliKelas}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
           <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Manajemen Mata Pelajaran</CardTitle>
                  <CardDescription>Tambah, ubah, atau hapus data mata pelajaran.</CardDescription>
                </div>
                 <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Pelajaran
                </Button>
              </div>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pelajaran</TableHead>
                    <TableHead>Kode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.kode}</TableCell>
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
                  <CardTitle>Manajemen Jadwal Umum</CardTitle>
                  <CardDescription>Atur slot waktu pelajaran yang tersedia.</CardDescription>
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
                    <TableHead>Waktu</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Guru Pengajar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSchedule.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.time}</TableCell>
                      <TableCell>{schedule.subject}</TableCell>
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
