
import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Layers, 
  Home, 
  Calendar, 
  Settings, 
  Plus, 
  Trash2, 
  Play,
  CheckCircle2,
  AlertCircle,
  Download
} from 'lucide-react';
import { Teacher, Subject, Batch, Room, PopulatedEntry, Day } from './types';
import { generateTimetable } from './services/algorithm';

// Mock Initial Data
const INITIAL_TEACHERS: Teacher[] = [
  { id: 't1', name: 'Dr. Ramesh Sharma', maxHoursPerDay: 6, unavailableSlots: ['MON-1'] },
  { id: 't2', name: 'Prof. Sunita Verma', maxHoursPerDay: 5, unavailableSlots: [] },
  { id: 't3', name: 'Mr. Amit Patel', maxHoursPerDay: 7, unavailableSlots: ['WED-4', 'WED-5'] },
];

const INITIAL_BATCHES: Batch[] = [
  { id: 'b1', name: 'B.Tech CS - Sem 3' },
  { id: 'b2', name: 'B.Tech IT - Sem 5' },
];

const INITIAL_ROOMS: Room[] = [
  { id: 'r1', name: 'Room 101', isLab: false },
  { id: 'r2', name: 'CS Lab 1', isLab: true },
  { id: 'r3', name: 'Room 202', isLab: false },
];

const INITIAL_SUBJECTS: Subject[] = [
  { id: 's1', name: 'Data Structures', code: 'CS301', isLab: false, sessionsPerWeek: 4, teacherId: 't1', batchId: 'b1' },
  { id: 's2', name: 'Algorithms Lab', code: 'CS302', isLab: true, sessionsPerWeek: 2, teacherId: 't1', batchId: 'b1' },
  { id: 's3', name: 'OS', code: 'IT501', isLab: false, sessionsPerWeek: 3, teacherId: 't2', batchId: 'b2' },
];

// --- Components ---

const SidebarLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

// --- Pages ---

const Dashboard = ({ teachers, batches, subjects }: any) => (
  <div className="space-y-6">
    <header>
      <h1 className="text-2xl font-bold text-slate-800">Welcome, Admin</h1>
      <p className="text-slate-500">Manage your institute's scheduling from one place.</p>
    </header>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Teachers</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{teachers.length}</h3>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={24} /></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Batches</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{batches.length}</h3>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Layers size={24} /></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Subjects</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{subjects.length}</h3>
          </div>
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><BookOpen size={24} /></div>
        </div>
      </div>
    </div>

    <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden">
      <div className="relative z-10 max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Ready to update schedules?</h2>
        <p className="text-indigo-100 mb-6">Our automated engine can generate a conflict-free weekly plan for all batches and teachers in seconds.</p>
        <Link to="/generate" className="inline-flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
          <Play size={18} fill="currentColor" />
          Go to Generator
        </Link>
      </div>
      <div className="absolute top-0 right-0 h-full w-1/3 bg-white/10 -skew-x-12 transform translate-x-1/2"></div>
    </div>
  </div>
);

const ManagementPage = <T extends { id: string, name: string }>({ 
  title, 
  data, 
  onAdd, 
  onDelete, 
  renderItem 
}: { 
  title: string, 
  data: T[], 
  onAdd: () => void, 
  onDelete: (id: string) => void,
  renderItem: (item: T) => React.ReactNode
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <button 
        onClick={onAdd}
        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Plus size={18} />
        Add New
      </button>
    </div>
    
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Details</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map(item => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
              <td className="px-6 py-4 text-slate-500 text-sm">{renderItem(item)}</td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">No items added yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const TimetableGenerator = ({ teachers, subjects, batches, rooms, onSave }: any) => {
  const [result, setResult] = useState<{ entries: PopulatedEntry[], unscheduled: Subject[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const res = generateTimetable(teachers, subjects, batches, rooms);
      setResult(res);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Generate Timetable</h1>
        <p className="text-slate-500">Run the conflict-free generator engine.</p>
      </header>

      {!result && !isGenerating && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-2">
            <Calendar size={48} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Engine Ready</h2>
          <p className="text-slate-500 max-w-md">The system will process all constraints including teacher availability and room types to create an optimal plan.</p>
          <button 
            onClick={handleGenerate}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            Start Generation
          </button>
        </div>
      )}

      {isGenerating && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Assigning classrooms and balancing loads...</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="text-emerald-600" />
              <div>
                <p className="text-emerald-800 font-bold">{result.entries.length} Sessions Scheduled</p>
                <p className="text-emerald-600 text-sm">All constraints satisfied.</p>
              </div>
            </div>
            {result.unscheduled.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-rose-600" />
                <div>
                  <p className="text-rose-800 font-bold">{result.unscheduled.length} Sessions Unscheduled</p>
                  <p className="text-rose-600 text-sm">Check teacher/room capacity.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Preview (Sample Grid)</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setResult(null)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Discard
                </button>
                <button 
                  onClick={() => onSave(result.entries)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                >
                  Finalize & Apply
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto border rounded-lg">
               <table className="w-full text-xs text-center border-collapse">
                 <thead>
                   <tr className="bg-slate-50">
                     <th className="p-3 border">Period</th>
                     {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <th key={d} className="p-3 border">{d}</th>)}
                   </tr>
                 </thead>
                 <tbody>
                   {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                     <tr key={p}>
                       <td className="p-3 border font-bold bg-slate-50">{p}</td>
                       {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => {
                         const entry = result.entries.find(e => e.day === d && e.period === p);
                         return (
                           <td key={d} className="p-3 border min-w-[120px] h-[80px] bg-slate-50">
                             {entry ? (
                               <div className="bg-white p-2 rounded shadow-sm border-l-4 border-indigo-500 text-left">
                                 <div className="font-bold text-slate-700 truncate">{entry.subjectName}</div>
                                 <div className="text-slate-400 text-[10px] mt-1">{entry.teacherName}</div>
                                 <div className="text-indigo-600 text-[10px] font-medium">{entry.roomName}</div>
                               </div>
                             ) : (
                               <span className="text-slate-300">---</span>
                             )}
                           </td>
                         )
                       })}
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewTimetable = ({ entries, batches, teachers }: { entries: PopulatedEntry[], batches: Batch[], teachers: Teacher[] }) => {
  const [filterType, setFilterType] = useState<'batch' | 'teacher'>('batch');
  const [filterId, setFilterId] = useState<string>(batches[0]?.id || '');

  const filteredEntries = useMemo(() => {
    if (filterType === 'batch') return entries.filter(e => e.batchId === filterId);
    return entries.filter(e => e.teacherId === filterId);
  }, [entries, filterType, filterId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Institutional Grid</h1>
          <p className="text-slate-500">View weekly schedules for specific classes or faculty.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <select 
            className="bg-transparent border-none focus:ring-0 text-sm font-medium px-2 py-1 outline-none"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as any);
              setFilterId(e.target.value === 'batch' ? batches[0]?.id : teachers[0]?.id);
            }}
          >
            <option value="batch">By Batch</option>
            <option value="teacher">By Teacher</option>
          </select>
          <div className="w-[1px] bg-slate-200 self-stretch my-1"></div>
          <select 
            className="bg-transparent border-none focus:ring-0 text-sm font-medium px-2 py-1 outline-none min-w-[150px]"
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
          >
            {filterType === 'batch' 
              ? batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
              : teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
            }
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center no-print">
          <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Weekly Schedule</span>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors"
          >
            <Download size={16} />
            Export PDF
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-4 border-r border-b text-slate-400 font-medium text-xs">Slot</th>
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                  <th key={d} className="p-4 border-b text-slate-700 font-bold text-sm tracking-widest uppercase">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                <tr key={p}>
                  <td className="p-4 border-r border-b bg-slate-50 font-black text-slate-300">#{p}</td>
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => {
                    const entry = filteredEntries.find(e => e.day === d && e.period === p);
                    return (
                      <td key={d} className={`p-4 border-b border-r min-w-[160px] h-[100px] transition-colors ${entry ? 'bg-indigo-50/20' : ''}`}>
                        {entry ? (
                          <div className="flex flex-col items-center justify-center text-center space-y-1">
                            <span className="text-sm font-bold text-indigo-900 leading-tight">{entry.subjectName}</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase">{filterType === 'batch' ? entry.teacherName : entry.batchName}</span>
                            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full uppercase tracking-tighter">{entry.roomName}</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-8 h-px bg-slate-100"></div>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none; }
          body { background: white; margin: 0; padding: 0; }
          .bg-white { box-shadow: none !important; border: none !important; }
          .rounded-2xl { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
};

// --- Main App Shell ---

export default function App() {
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [timetable, setTimetable] = useState<PopulatedEntry[]>([]);

  const addTeacher = () => {
    const name = prompt("Enter Teacher Name:");
    if (name) setTeachers([...teachers, { id: Date.now().toString(), name, maxHoursPerDay: 6, unavailableSlots: [] }]);
  };

  const addBatch = () => {
    const name = prompt("Enter Batch Name:");
    if (name) setBatches([...batches, { id: Date.now().toString(), name }]);
  };

  const addRoom = () => {
    const name = prompt("Enter Room Name:");
    if (name) setRooms([...rooms, { id: Date.now().toString(), name, isLab: false }]);
  };

  const deleteItem = (type: 'teacher' | 'batch' | 'room', id: string) => {
    if (type === 'teacher') setTeachers(teachers.filter(t => t.id !== id));
    if (type === 'batch') setBatches(batches.filter(b => b.id !== id));
    if (type === 'room') setRooms(rooms.filter(r => r.id !== id));
  };

  return (
    <HashRouter>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 flex flex-col no-print">
          <div className="p-6">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">AutoTimetable</h2>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Academic MVP</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <SidebarLink to="/" icon={Home} label="Dashboard" />
            <SidebarLink to="/teachers" icon={Users} label="Teachers" />
            <SidebarLink to="/batches" icon={Layers} label="Batches" />
            <SidebarLink to="/subjects" icon={BookOpen} label="Subjects" />
            <SidebarLink to="/rooms" icon={Settings} label="Rooms" />
            <div className="pt-4 border-t border-slate-800">
              <SidebarLink to="/generate" icon={Play} label="Generate Engine" />
              <SidebarLink to="/view" icon={Calendar} label="View Timetable" />
            </div>
          </nav>

          <div className="p-6 border-t border-slate-800">
            <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">AD</div>
              <div>
                <p className="text-sm font-bold text-white leading-none">Admin User</p>
                <p className="text-[10px] text-slate-500">System Administrator</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard teachers={teachers} batches={batches} subjects={subjects} />} />
            <Route path="/teachers" element={
              <ManagementPage 
                title="Manage Teachers" 
                data={teachers} 
                onAdd={addTeacher} 
                onDelete={(id) => deleteItem('teacher', id)}
                // Fixed type error: explicitly typed the 'renderItem' parameter to ensure access to 'Teacher' specific properties
                renderItem={(t: Teacher) => `Max ${t.maxHoursPerDay} hrs/day • ${t.unavailableSlots.length} unavailable slots`}
              />
            } />
            <Route path="/batches" element={
              <ManagementPage 
                title="Manage Batches" 
                data={batches} 
                onAdd={addBatch} 
                onDelete={(id) => deleteItem('batch', id)}
                renderItem={() => 'Regular Academic Group'}
              />
            } />
            <Route path="/rooms" element={
              <ManagementPage 
                title="Manage Rooms" 
                data={rooms} 
                onAdd={addRoom} 
                onDelete={(id) => deleteItem('room', id)}
                // Fixed type error: explicitly typed the 'renderItem' parameter to ensure access to 'Room' specific properties
                renderItem={(r: Room) => r.isLab ? 'Lab Facility' : 'Normal Classroom'}
              />
            } />
            <Route path="/subjects" element={
              <ManagementPage 
                title="Manage Subjects" 
                data={subjects.map(s => ({ ...s, name: `${s.name} (${s.code})` }))} 
                onAdd={() => alert("Add via dedicated form in a real app")} 
                onDelete={() => {}}
                renderItem={(s) => `${(s as any).sessionsPerWeek} sessions/week`}
              />
            } />
            <Route path="/generate" element={
              <TimetableGenerator 
                teachers={teachers} 
                subjects={subjects} 
                batches={batches} 
                rooms={rooms} 
                onSave={(newTable: any) => {
                  setTimetable(newTable);
                  alert("Timetable generated and saved successfully!");
                }}
              />
            } />
            <Route path="/view" element={
              <ViewTimetable entries={timetable} batches={batches} teachers={teachers} />
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
