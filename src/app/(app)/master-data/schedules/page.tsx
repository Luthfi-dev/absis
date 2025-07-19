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
import { mockSchedule } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function SchedulesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Jadwal Umum</h1>
        <p className="text-muted-foreground">Atur slot waktu pelajaran umum yang tersedia di sekolah.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Daftar Slot Jadwal</CardTitle>
              <CardDescription>Berikut adalah semua slot jadwal yang telah diatur.</CardDescription>
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
    </div>
  )
}
