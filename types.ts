
export type Day = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT';

export interface Teacher {
  id: string;
  name: string;
  maxHoursPerDay: number;
  unavailableSlots: string[]; // Format: "MON-1", "TUE-4"
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  isLab: boolean;
  sessionsPerWeek: number;
  teacherId: string;
  batchId: string;
}

export interface Batch {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
  isLab: boolean;
}

export interface TimetableEntry {
  id: string;
  day: Day;
  period: number;
  subjectId: string;
  teacherId: string;
  batchId: string;
  roomId: string;
}

export interface PopulatedEntry extends TimetableEntry {
  subjectName: string;
  teacherName: string;
  batchName: string;
  roomName: string;
}
