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
import { mockClasses } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function ClassesPage() {
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
                  <TableCell>{cls.waliKelas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
