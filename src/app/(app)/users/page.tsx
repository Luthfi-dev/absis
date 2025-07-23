
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
import { PlusCircle, Search, User } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

const ITEMS_PER_PAGE = 10;

export default function UsersPage() {
    const [users, setUsers] = useState<Teacher[]>([]);
    const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

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

        window.addEventListener('usersUpdated', handleStorageChange);
        return () => {
            window.removeEventListener('usersUpdated', handleStorageChange);
        };
    }, []);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">Kelola pengguna, peran, dan status akun.</p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>Berikut adalah semua pengguna yang terdaftar dalam sistem.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Cari pengguna (nama, email)..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
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
                  {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
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
                            <SelectItem value="superadmin">Super Admin</SelectItem>
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
                  )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            Tidak ada hasil.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                    Menampilkan {paginatedUsers.length} dari {filteredUsers.length} pengguna.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Sebelumnya
                    </Button>
                    <span className="text-sm font-medium">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
