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
import { mockTeachers, type Teacher, type UserRole } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UsersPage() {
    const [users, setUsers] = useState<Teacher[]>([]);
    const { toast } = useToast()

    useEffect(() => {
        const savedUsers = localStorage.getItem('mockTeachers');
        if (savedUsers) {
            setUsers(JSON.parse(savedUsers));
        } else {
            localStorage.setItem('mockTeachers', JSON.stringify(mockTeachers));
            setUsers(mockTeachers);
        }

        const handleStorageChange = () => {
            const updatedUsers = localStorage.getItem('mockTeachers');
            if (updatedUsers) {
                setUsers(JSON.parse(updatedUsers));
            }
        };

        // Listen for custom event for same-tab updates
        window.addEventListener('usersUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('usersUpdated', handleStorageChange);
        };
    }, []);

    const updateUsersInStorage = (updatedUsers: Teacher[]) => {
        setUsers(updatedUsers);
        localStorage.setItem('mockTeachers', JSON.stringify(updatedUsers));
        window.dispatchEvent(new Event('usersUpdated'));
    }

    const handleStatusChange = (userId: string, newStatus: 'active' | 'pending') => {
        const updatedUsers = users.map(user => 
            user.id === userId ? { ...user, status: newStatus } : user
        );
        updateUsersInStorage(updatedUsers);
        toast({
            title: "Status Pengguna Diperbarui",
            description: `Status telah diubah menjadi ${newStatus === 'active' ? 'aktif' : 'menunggu'}.`,
        });
    };

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        const updatedUsers = users.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
        );
        updateUsersInStorage(updatedUsers);
        toast({
            title: "Peran Pengguna Diperbarui",
            description: `Peran telah diubah menjadi ${newRole}.`,
        });
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">Kelola pengguna, peran, dan status akun.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>Berikut adalah semua pengguna yang terdaftar dalam sistem.</CardDescription>
            </div>
              {/* <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah Pengguna
              </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktifkan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select value={user.role} onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="teacher">Guru</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                   <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                        {user.status === 'active' ? 'Aktif' : 'Menunggu'}
                      </Badge>
                   </TableCell>
                  <TableCell className="text-right">
                    <Switch
                        checked={user.status === 'active'}
                        onCheckedChange={(checked) => handleStatusChange(user.id, checked ? 'active' : 'pending')}
                        aria-label={`Aktifkan ${user.name}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
