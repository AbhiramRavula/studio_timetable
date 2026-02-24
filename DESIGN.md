
# AutoTimetable MVP Design Document

## 1. Tech Stack (Free Tier)
- **Frontend:** React 18 + TypeScript + Tailwind CSS.
- **Backend:** Node.js + Express.
- **ORM:** Prisma.
- **Database:** PostgreSQL (Neon or Supabase free tier).
- **Auth:** JWT-based Email/Password authentication.
- **Hosting:**
  - Frontend: Vercel (Free).
  - Backend: Render.com (Free tier).
  - DB: Neon.tech (Serverless Postgres).

## 2. Data Models and Schema
```prisma
model User {
  id       String @id @default(uuid())
  email    String @unique
  password String
}

model Teacher {
  id               String           @id @default(uuid())
  name             String
  maxHoursPerDay   Int              @default(6)
  unavailability   String[]         // Array of Day-Slot IDs (e.g., "MON-1")
  entries          TimetableEntry[]
}

model Subject {
  id              String           @id @default(uuid())
  name            String
  code            String
  isLab           Boolean          @default(false)
  sessionsPerWeek Int
  teacherId       String
  teacher         Teacher          @relation(fields: [teacherId], references: [id])
}

model Batch {
  id      String           @id @default(uuid())
  name    String           @unique
  entries TimetableEntry[]
}

model Room {
  id      String           @id @default(uuid())
  name    String
  isLab   Boolean          @default(false)
  entries TimetableEntry[]
}

model TimetableEntry {
  id        String   @id @default(uuid())
  day       String   // MONDAY, TUESDAY...
  period    Int      // 1 to 8
  subjectId String
  teacherId String
  batchId   String
  roomId    String
  subject   Subject  @relation(fields: [subjectId], references: [id])
  teacher   Teacher  @relation(fields: [teacherId], references: [id])
  batch     Batch    @relation(fields: [batchId], references: [id])
  room      Room     @relation(fields: [roomId], references: [id])
}
```

## 3. Timetable Generation Algorithm
### Approach: Greedy with Random Shuffling
The algorithm iterates through a queue of all required sessions and attempts to place them in the first available valid slot.

### Step-by-Step Explanation
1. **Initialize Requirements:** Create a list of `neededSessions` where each item is a `(Subject, Batch, Teacher)` tuple.
2. **Shuffle:** Randomly shuffle the list to prevent bias towards specific days/times.
3. **Tracking:** Maintain 3D maps:
   - `teacherBusy[teacherId][day][period]`
   - `batchBusy[batchId][day][period]`
   - `roomBusy[roomId][day][period]`
4. **Allocation:**
   - Loop through each session.
   - Loop through days (1-6) and periods (1-8).
   - Check constraints (is teacher free? is batch free? is a suitable room free?).
   - If all free, book the slot and move to the next session.
   - If no slot is found after checking all options, mark as "Unscheduled".

### Pseudocode
```javascript
function generate(batches, subjects, teachers, rooms):
    let requirements = []
    for each sub in subjects:
        for i from 1 to sub.sessionsPerWeek:
            requirements.push({sub, sub.batch, sub.teacher})

    shuffle(requirements)
    let timetable = []

    for each req in requirements:
        let placed = false
        for day in ["MON", "TUE", "WED", "THU", "FRI", "SAT"]:
            for period from 1 to 8:
                if placed: break
                
                // Find a free room
                let room = rooms.find(r => r.isLab == req.sub.isLab && isFree(r, day, period))
                
                if (room && isFree(req.teacher, day, period) && isFree(req.batch, day, period)):
                    book(req.teacher, day, period)
                    book(req.batch, day, period)
                    book(room, day, period)
                    timetable.push({req, day, period, room})
                    placed = true
        
        if (!placed) mark_unscheduled(req)
    return timetable
```

## 4. API Design
- `GET /api/teachers`: Fetch all teachers.
- `POST /api/teachers`: Create a new teacher.
- `GET /api/timetable/batch/:id`: Get the weekly grid for a specific batch.
- `POST /api/timetable/generate`: Trigger the generation engine.

## 5. Setup & Deployment
1. **Database:** Create a project on Neon.tech, copy the connection string.
2. **Backend:** Initialize Node.js, install `express`, `prisma`, `cors`. Create `.env` with `DATABASE_URL`.
3. **Frontend:** Create React app, install `lucide-react`, `recharts`, `axios`.
4. **Deploy:** Push code to GitHub. Connect Vercel to frontend repo and Render to backend repo.
