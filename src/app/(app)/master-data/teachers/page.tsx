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
import { mockTeachers } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function TeachersPage() {
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
    </div>
  )
}
