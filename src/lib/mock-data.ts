export type Student = {
  id: string; // Internal unique ID
  studentId: string; // Auto-generated e.g., S001
  name: string;
  nis: string;
  nisn: string;
  kelas: string;
  nomorOrangTua?: string;
  avatar: string;
};

export type Teacher = {
  id: string;
  name: string;
  nip: string;
  email: string;
}

export type ScheduleItem = {
  id: string;
  time: string;
  subject: string;
  status: 'Sedang Berlangsung' | 'Akan Datang' | 'Selesai';
  teacher: string;
};

export type AttendanceRecord = {
  id: string;
  subject: string;
  date: string;
  status: 'Hadir' | 'Absen' | 'Terlambat';
};

export const mockStudents: Student[] = [
  { id: '1', name: 'Alice Johnson', studentId: 'S001', nis: '212210001', nisn: '0011223344', kelas: '12 IPA 1', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  { id: '2', name: 'Bob Williams', studentId: 'S002', nis: '212210002', nisn: '0022334455', kelas: '12 IPA 1', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: '3', name: 'Charlie Brown', studentId: 'S003', nis: '212210003', nisn: '0033445566', kelas: '11 IPS 2', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  { id: '4', name: 'Diana Miller', studentId: 'S004', nis: '212210004', nisn: '0044556677', kelas: '11 IPS 2', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
  { id: '5', name: 'Ethan Davis', studentId: 'S005', nis: '212210005', nisn: '0055667788', kelas: '10 A', avatar: 'https://i.pravatar.cc/150?u=a092581f4e29026705d' },
];

export const mockTeachers: Teacher[] = [
  { id: 't1', name: 'Bpk. Smith', nip: 'G12345678', email: 'smith@attendease.com' },
  { id: 't2', name: 'Ibu Jones', nip: 'G87654321', email: 'jones@attendease.com' },
  { id: 't3', name: 'Dr. Quantum', nip: 'G56781234', email: 'quantum@attendease.com' },
  { id: 't4', name: 'Prof. Verse', nip: 'G12348765', email: 'verse@attendease.com' },
]

export const mockSchedule: ScheduleItem[] = [
  { id: 'c1', time: '09:00 - 10:30', subject: 'Matematika 101', status: 'Sedang Berlangsung', teacher: 'Bpk. Smith' },
  { id: 'c2', time: '11:00 - 12:30', subject: 'Sejarah Seni', status: 'Akan Datang', teacher: 'Ibu Jones' },
  { id: 'c3', time: '13:30 - 15:00', subject: 'Fisika untuk Pemula', status: 'Akan Datang', teacher: 'Dr. Quantum' },
  { id: 'c4', time: '15:30 - 17:00', subject: 'Lokakarya Penulisan Kreatif', status: 'Akan Datang', teacher: 'Prof. Verse' },
];

export const mockAttendance: Record<string, AttendanceRecord[]> = {
  '1': [
    { id: 'a1', subject: 'Matematika 101', date: '2024-05-20', status: 'Hadir' },
    { id: 'a2', subject: 'Sejarah Seni', date: '2024-05-20', status: 'Hadir' },
    { id: 'a3', subject: 'Matematika 101', date: '2024-05-19', status: 'Terlambat' },
  ],
  '2': [
    { id: 'b1', subject: 'Matematika 101', date: '2024-05-20', status: 'Hadir' },
    { id: 'b2', subject: 'Sejarah Seni', date: '2024-05-20', status: 'Absen' },
  ],
  '3': [
    { id: 'c1', subject: 'Matematika 101', date: '2024-05-20', status: 'Hadir' },
  ],
  '4': [
    { id: 'd1', subject: 'Fisika untuk Pemula', date: '2024-05-20', status: 'Hadir' },
    { id: 'd2', subject: 'Matematika 101', date: '2024-05-20', status: 'Absen' },
  ],
  '5': [
    { id: 'e1', subject: 'Lokakarya Penulisan Kreatif', date: '2024-05-20', status: 'Terlambat' },
    { id: 'e2', subject: 'Matematika 101', date: '2024-05-20', status: 'Hadir' },
  ],
};
