
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

export type UserRole = 'superadmin' | 'admin' | 'teacher';

export type Teacher = {
  id: string;
  name: string;
  nip: string;
  email: string;
  password?: string;
  status: 'active' | 'pending';
  role: UserRole;
  avatar: string;
}

export type Class = {
  id: string;
  name: string;
  waliKelas: string;
}

export type Subject = {
  id: string;
  name: string;
  kode: string;
}

export type ScheduleItem = {
  id: string;
  time: string;
  subject: string;
  class: string;
  teacher: string;
  status: 'Sedang Berlangsung' | 'Selesai' | 'Akan Datang';
};

export type RosterEntry = {
    id: string;
    day: string;
    time: string;
    subjectId: string;
    teacherId: string;
}

export type Roster = {
    [classId: string]: RosterEntry[];
}


export type AttendanceRecord = {
  id: string;
  subject: string;
  date: string;
  status: 'Excellent' | 'Terlambat' | 'Absen' | 'Hadir'; // 'Hadir' is for per-subject, 'Excellent' for on-time
  checkInTime?: string;
  checkOutTime?: string;
};

export const mockStudents: Student[] = [
  { id: '1', name: 'Alice Johnson', studentId: 'S001', nis: '212210001', nisn: '0011223344', kelas: '12 IPA 1', avatar: 'https://placehold.co/128x128.png' },
  { id: '2', name: 'Bob Williams', studentId: 'S002', nis: '212210002', nisn: '0022334455', kelas: '12 IPA 1', avatar: 'https://placehold.co/128x128.png' },
  { id: '3', name: 'Charlie Brown', studentId: 'S003', nis: '212210003', nisn: '0033445566', kelas: '12 IPA 1', avatar: 'https://placehold.co/128x128.png' },
  { id: '4', name: 'Diana Miller', studentId: 'S004', nis: '212210004', nisn: '0044556677', kelas: '11 IPS 2', avatar: 'https://placehold.co/128x128.png' },
  { id: '5', name: 'Ethan Davis', studentId: 'S005', nis: '212210005', nisn: '0055667788', kelas: '10 A', avatar: 'https://placehold.co/128x128.png' },
];

export const mockTeachers: Teacher[] = [
  { id: 't1', name: 'Bpk. Smith', nip: 'G12345678', email: 'smith@attendease.com', status: 'active', role: 'teacher', password: 'password', avatar: 'https://placehold.co/128x128.png' },
  { id: 't2', name: 'Ibu Jones', nip: 'G87654321', email: 'jones@attendease.com', status: 'active', role: 'teacher', password: 'password', avatar: 'https://placehold.co/128x128.png' },
  { id: 't3', name: 'Dr. Quantum', nip: 'G56781234', email: 'quantum@attendease.com', status: 'pending', role: 'teacher', password: 'password', avatar: 'https://placehold.co/128x128.png' },
  { id: 't4', name: 'Prof. Verse', nip: 'G12348765', email: 'verse@attendease.com', status: 'active', role: 'teacher', password: 'password', avatar: 'https://placehold.co/128x128.png' },
  { id: 'sa', name: 'Super Admin', nip: 'A00000000', email: 'superadmin@gmail.com', status: 'active', role: 'superadmin', password: '123456', avatar: 'https://placehold.co/128x128.png'},
  { id: 'adm', name: 'Admin Biasa', nip: 'A00000001', email: 'admin@gmail.com', status: 'active', role: 'admin', password: 'admin*#', avatar: 'https://placehold.co/128x128.png'},
];

export const mockClasses: Class[] = [
  { id: 'k1', name: '12 IPA 1', waliKelas: 'Bpk. Smith' },
  { id: 'k2', name: '11 IPS 2', waliKelas: 'Ibu Jones' },
  { id: 'k3', name: '10 A', waliKelas: 'Dr. Quantum' },
];

export const mockSubjects: Subject[] = [
  { id: 'm1', name: 'Matematika 101', kode: 'MTK-101' },
  { id: 'm2', name: 'Sejarah Seni', kode: 'SS-201' },
  { id: 'm3', name: 'Fisika untuk Pemula', kode: 'FIS-101' },
  { id: 'm4', name: 'Lokakarya Penulisan Kreatif', kode: 'KRT-301' },
  { id: 'm5', name: 'Biologi Sel', kode: 'BIO-102' },
];

export const mockSchedule: ScheduleItem[] = [
  { id: 'c1', time: '09:00 - 10:30', subject: 'Matematika 101', class: '12 IPA 1', teacher: 'Bpk. Smith', status: 'Selesai' },
  { id: 'c2', time: '11:00 - 12:30', subject: 'Sejarah Seni', class: '11 IPS 2', teacher: 'Ibu Jones', status: 'Sedang Berlangsung' },
  { id: 'c3', time: '13:30 - 15:00', subject: 'Fisika untuk Pemula', class: '12 IPA 1', teacher: 'Dr. Quantum', status: 'Akan Datang' },
  { id: 'c4', time: '15:30 - 17:00', subject: 'Lokakarya Penulisan Kreatif', class: '11 IPS 2', teacher: 'Prof. Verse', status: 'Akan Datang' },
];

export const mockRoster: Roster = {
    'k1': [ // 12 IPA 1
        { id: 'r1-1', day: 'Senin', time: '07:00 - 08:30', subjectId: 'm1', teacherId: 't1' },
        { id: 'r1-2', day: 'Senin', time: '08:30 - 10:00', subjectId: 'm3', teacherId: 't3' },
        { id: 'r1-3', day: 'Selasa', time: '09:00 - 10:30', subjectId: 'm5', teacherId: 't3' },
        { id: 'r1-4', day: 'Sabtu', time: '09:00 - 11:00', subjectId: 'm4', teacherId: 't4' },

    ],
    'k2': [ // 11 IPS 2
        { id: 'r2-1', day: 'Senin', time: '07:00 - 08:30', subjectId: 'm2', teacherId: 't2' },
        { id: 'r2-2', day: 'Rabu', time: '10:00 - 11:30', subjectId: 'm4', teacherId: 't4' },
    ]
}


export let mockAttendance: Record<string, AttendanceRecord[]> = {
  '1': [
    { id: 'a1', subject: 'Absensi Pagi', date: '2024-05-20', status: 'Excellent', checkInTime: '06:55:12', checkOutTime: '15:02:00' },
    { id: 'a2', subject: 'Sejarah Seni', date: '2024-05-20', status: 'Hadir' },
    { id: 'a3', subject: 'Absensi Pagi', date: '2024-05-19', status: 'Terlambat', checkInTime: '07:15:30' },
    { id: 'a4', subject: 'Absensi Pagi', date: '2024-05-21', status: 'Excellent', checkInTime: '06:58:15', checkOutTime: '15:00:05' },
  ],
  '2': [
    { id: 'b1', subject: 'Absensi Pagi', date: '2024-05-20', status: 'Terlambat', checkInTime: '07:05:02', checkOutTime: '15:01:15' },
    { id: 'b2', subject: 'Sejarah Seni', date: '2024-05-20', status: 'Absen' },
    { id: 'b3', subject: 'Absensi Pagi', date: '2024-05-21', status: 'Excellent', checkInTime: '06:55:45', checkOutTime: '15:03:20' },
  ],
  '3': [
    { id: 'c1', subject: 'Absensi Pagi', date: '2024-05-20', status: 'Excellent', checkInTime: '06:58:41', checkOutTime: '15:05:30'},
    { id: 'c2', subject: 'Absensi Pagi', date: '2024-05-21', status: 'Excellent', checkInTime: '06:59:59', checkOutTime: '15:01:00' },
  ],
  '4': [
    { id: 'd1', subject: 'Absensi Pagi', date: '2024-05-20', status: 'Excellent', checkInTime: '06:50:00', checkOutTime: '14:59:00' },
    { id: 'd2', subject: 'Matematika 101', date: '2024-05-20', status: 'Absen' },
    { id: 'd3', subject: 'Absensi Pagi', date: '2024-05-21', status: 'Terlambat', checkInTime: '07:01:10', checkOutTime: '15:10:00' },
  ],
  '5': [
    { id: 'e1', subject: 'Absensi Pagi', date: '2024-05-20', status: 'Terlambat', checkInTime: '07:30:11' },
    { id: 'e2', subject: 'Matematika 101', date: '2024-05-20', status: 'Hadir' },
    { id: 'e3', subject: 'Absensi Pagi', date: '2024-05-21', status: 'Excellent', checkInTime: '06:50:30', checkOutTime: '15:05:00' },
  ],
};

// Function to update mock attendance in localStorage if in browser context
if (typeof window !== 'undefined') {
    const savedAttendance = localStorage.getItem('mockAttendance');
    if (savedAttendance) {
        mockAttendance = JSON.parse(savedAttendance);
    } else {
        localStorage.setItem('mockAttendance', JSON.stringify(mockAttendance));
    }
}
