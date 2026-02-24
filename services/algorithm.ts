
import { Day, Teacher, Subject, Batch, Room, PopulatedEntry } from '../types';

const DAYS: Day[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export function generateTimetable(
  teachers: Teacher[],
  subjects: Subject[],
  batches: Batch[],
  rooms: Room[]
): { entries: PopulatedEntry[]; unscheduled: Subject[] } {
  const entries: PopulatedEntry[] = [];
  const unscheduled: Subject[] = [];

  // Requirements queue
  let requirements: { subject: Subject; teacher: Teacher; batch: Batch }[] = [];
  
  subjects.forEach(sub => {
    const teacher = teachers.find(t => t.id === sub.teacherId);
    const batch = batches.find(b => b.id === sub.batchId);
    if (teacher && batch) {
      for (let i = 0; i < sub.sessionsPerWeek; i++) {
        requirements.push({ subject: sub, teacher, batch });
      }
    }
  });

  // Shuffle requirements to avoid bias
  requirements = requirements.sort(() => Math.random() - 0.5);

  // Tracking busy states
  const teacherBusy = new Set<string>(); // "teacherId-DAY-PERIOD"
  const batchBusy = new Set<string>();   // "batchId-DAY-PERIOD"
  const roomBusy = new Set<string>();    // "roomId-DAY-PERIOD"

  requirements.forEach(req => {
    let placed = false;

    // Try finding a slot
    for (const day of DAYS) {
      if (placed) break;
      for (const period of PERIODS) {
        if (placed) break;

        const teacherKey = `${req.teacher.id}-${day}-${period}`;
        const batchKey = `${req.batch.id}-${day}-${period}`;

        // Basic constraints: teacher free, batch free, not an unavailable slot
        const isTeacherUnavailable = req.teacher.unavailableSlots.includes(`${day}-${period}`);
        
        if (!teacherBusy.has(teacherKey) && !batchBusy.has(batchKey) && !isTeacherUnavailable) {
          // Find a suitable room
          const room = rooms.find(r => 
            r.isLab === req.subject.isLab && 
            !roomBusy.has(`${r.id}-${day}-${period}`)
          );

          if (room) {
            const roomKey = `${room.id}-${day}-${period}`;
            
            // Mark as busy
            teacherBusy.add(teacherKey);
            batchBusy.add(batchKey);
            roomBusy.add(roomKey);

            entries.push({
              id: Math.random().toString(36).substr(2, 9),
              day,
              period,
              subjectId: req.subject.id,
              teacherId: req.teacher.id,
              batchId: req.batch.id,
              roomId: room.id,
              subjectName: req.subject.name,
              teacherName: req.teacher.name,
              batchName: req.batch.name,
              roomName: room.name,
            });
            placed = true;
          }
        }
      }
    }

    if (!placed) {
      unscheduled.push(req.subject);
    }
  });

  return { entries, unscheduled };
}
