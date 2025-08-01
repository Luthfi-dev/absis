
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
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState, useMemo, Fragment } from "react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { generateAvatarColor } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

const ITEMS_PER_PAGE = 10;

const ResponsiveRow = ({ user, currentUserRole, onRoleChange, onStatusChange }: { user: Teacher; currentUserRole: UserRole | undefined; onRoleChange: (id: string, role: UserRole) => void; onStatusChange: (id: string, status: 'active' | 'pending') => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Fragment>
            <TableRow className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback style={{ backgroundColor: generateAvatarColor(user.name) }}>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.name}</div>
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell className="hidden lg:table-cell">
                    <Select value={user.role} onValueChange={(value: UserRole) => onRoleChange(user.id, value)} disabled={currentUserRole !== 'superadmin'}>
                        <SelectTrigger className="w-[120px]" onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="superadmin">Super Admin</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="teacher">Guru</SelectItem>
                        </SelectContent>
                    </Select>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                        {user.status === 'active' ? 'Aktif' : 'Menunggu'}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <div className="hidden md:flex items-center justify-end gap-2">
                      <Switch
                          onClick={(e) => e.stopPropagation()}
                          checked={user.status === 'active'}
                          onCheckedChange={(checked) => onStatusChange(user.id, checked ? 'active' : 'pending')}
                          aria-label={`Aktifkan ${user.name}`}
                      />
                    </div>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow className="bg-muted/50 hover:bg-muted/50 md:hidden">
                    <TableCell colSpan={5}>
                        <div className="grid grid-cols-2 gap-4 p-2 text-sm">
                             <div className="md:hidden">
                                <div className="font-medium text-muted-foreground">Email</div>
                                <div className="truncate">{user.email}</div>
                            </div>
                            <div>
                                <div className="font-medium text-muted-foreground">Peran</div>
                                <Select value={user.role} onValueChange={(value: UserRole) => onRoleChange(user.id, value)} disabled={currentUserRole !== 'superadmin'}>
                                    <SelectTrigger className="w-[120px] h-8 mt-1" onClick={(e) => e.stopPropagation()}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="superadmin">Super Admin</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="teacher">Guru</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:hidden">
                                <div className="font-medium text-muted-foreground">Status</div>
                                <div>
                                    <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                                        {user.status === 'active' ? 'Aktif' : 'Menunggu'}
                                    </Badge>
                                </div>
                            </div>
                             <div className="col-span-2 flex items-center gap-4">
                               <span className="font-medium text-muted-foreground">Aktifkan Akun</span>
                               <Switch
                                    onClick={(e) => e.stopPropagation()}
                                    checked={user.status === 'active'}
                                    onCheckedChange={(checked) => onStatusChange(user.id, checked ? 'active' : 'pending')}
                                    aria-label={`Aktifkan ${user.name}`}
                                />
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </Fragment>
    )
}

export default function UsersPage() {
    const [users, setUsers] = useState<Teacher[]>([]);
    const { toast } = useToast()
    const { user: currentUser } = useAuth();
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
        let displayableUsers = users;
        if (currentUser?.role === 'admin') {
            displayableUsers = users.filter(user => user.role === 'teacher');
        }

        return displayableUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm, currentUser]);

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
        if (currentUser?.role !== 'superadmin') {
            toast({
                variant: "destructive",
                title: "Akses Ditolak",
                description: "Anda tidak memiliki izin untuk mengubah peran pengguna.",
            });
            return;
        }
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
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Peran</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                    <ResponsiveRow key={user.id} user={user} currentUserRole={currentUser?.role} onRoleChange={handleRoleChange} onStatusChange={handleStatusChange} />
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
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Sebelumnya</span>
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
                        <span className="hidden sm:inline">Berikutnya</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
