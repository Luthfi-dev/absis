import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mockSchedule, type ScheduleItem } from "@/lib/mock-data"
import { CalendarClock, Clock } from "lucide-react"

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
        <ul className="space-y-4">
          {mockSchedule.map((item) => (
            <li key={item.id} className="flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{item.subject}</p>
                   <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.teacher}</p>
                <p className="text-sm text-muted-foreground">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
