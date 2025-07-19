import { Button } from "@/components/ui/button"
import { StudentTable } from "@/components/student-table"
import { PlusCircle } from "lucide-react"
import { RosterImporter } from "@/components/roster-importer"

export default function StudentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Student Management</h1>
        <p className="text-muted-foreground">Add, edit, and manage your student roster.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Student
        </Button>
        <RosterImporter />
      </div>
      <StudentTable />
    </div>
  )
}
