import { Button } from "@/components/ui/button"
import { StudentTable } from "@/components/student-table"
import { PlusCircle } from "lucide-react"
import { RosterImporter } from "@/components/roster-importer"

export default function StudentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Siswa</h1>
            <p className="text-muted-foreground">Tambah, ubah, dan kelola daftar siswa Anda.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Siswa
            </Button>
            <RosterImporter />
        </div>
      </div>
      
      <StudentTable />
    </div>
  )
}
