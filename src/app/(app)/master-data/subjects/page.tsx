
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
import { mockSubjects } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function SubjectsPage() {
  return (
    <>
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Mata Pelajaran</h1>
        <p className="text-muted-foreground">Tambah, ubah, atau hapus data mata pelajaran.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Daftar Mata Pelajaran</CardTitle>
              <CardDescription>Berikut adalah semua mata pelajaran yang terdaftar.</CardDescription>
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
    </>
  )
}
