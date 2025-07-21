import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockSchedule, type ScheduleItem } from "@/lib/mock-data"
import { CalendarClock } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

function getStatusVariant(status: ScheduleItem['status']) {
  switch (status) {
    case 'Sedang Berlangsung':
      return 'default'
    case 'Selesai':
      return 'secondary'
    case 'Akan Datang':
      return 'outline'
    default:
      return 'default'
  }
}

export function DynamicSchedule() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-6 w-6" />
          Jadwal Hari Ini
        </CardTitle>
        <CardDescription>Kelas yang sedang berlangsung dan akan datang hari ini.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Pelajaran</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead>Guru</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {mockSchedule.length > 0 ? mockSchedule.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.time}</TableCell>
                        <TableCell>{item.subject}</TableCell>
                        <TableCell>{item.class}</TableCell>
                        <TableCell>{item.teacher}</TableCell>
                        <TableCell className="text-right">
                            <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Tidak ada jadwal untuk hari ini.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  )
}
