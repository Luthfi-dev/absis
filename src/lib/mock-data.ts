export type Student = {
  id: string;
  name: string;
  studentId: string;
  email: string;
  avatar: string;
};

export type ScheduleItem = {
  id: string;
  time: string;
  subject: string;
  status: 'Ongoing' | 'Upcoming' | 'Finished';
  teacher: string;
};

export type AttendanceRecord = {
  id: string;
  subject: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
};

export const mockStudents: Student[] = [
  { id: '1', name: 'Alice Johnson', studentId: 'S001', email: 'alice.j@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  { id: '2', name: 'Bob Williams', studentId: 'S002', email: 'bob.w@example.com', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: '3', name: 'Charlie Brown', studentId: 'S003', email: 'charlie.b@example.com', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d' },
  { id: '4', name: 'Diana Miller', studentId: 'S004', email: 'diana.m@example.com', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d' },
  { id: '5', name: 'Ethan Davis', studentId: 'S005', email: 'ethan.d@example.com', avatar: 'https://i.pravatar.cc/150?u=a092581f4e29026705d' },
];

export const mockSchedule: ScheduleItem[] = [
  { id: 'c1', time: '09:00 - 10:30', subject: 'Mathematics 101', status: 'Ongoing', teacher: 'Mr. Smith' },
  { id: 'c2', time: '11:00 - 12:30', subject: 'History of Art', status: 'Upcoming', teacher: 'Ms. Jones' },
  { id: 'c3', time: '13:30 - 15:00', subject: 'Physics for Beginners', status: 'Upcoming', teacher: 'Dr. Quantum' },
  { id: 'c4', time: '15:30 - 17:00', subject: 'Creative Writing Workshop', status: 'Upcoming', teacher: 'Prof. Verse' },
];

export const mockAttendance: Record<string, AttendanceRecord[]> = {
  '1': [
    { id: 'a1', subject: 'Mathematics 101', date: '2024-05-20', status: 'Present' },
    { id: 'a2', subject: 'History of Art', date: '2024-05-20', status: 'Present' },
    { id: 'a3', subject: 'Mathematics 101', date: '2024-05-19', status: 'Late' },
  ],
  '2': [
    { id: 'b1', subject: 'Mathematics 101', date: '2024-05-20', status: 'Present' },
    { id: 'b2', subject: 'History of Art', date: '2024-05-20', status: 'Absent' },
  ],
  '3': [
    { id: 'c1', subject: 'Mathematics 101', date: '2024-05-20', status: 'Present' },
  ],
  '4': [
    { id: 'd1', subject: 'Physics for Beginners', date: '2024-05-20', status: 'Present' },
  ],
  '5': [
    { id: 'e1', subject: 'Creative Writing Workshop', date: '2024-05-20', status: 'Late' },
  ],
};
