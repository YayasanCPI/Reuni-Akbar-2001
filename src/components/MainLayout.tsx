import { useState, useEffect } from "react";
import { User, Task, Stats } from "../types.ts";
import Dashboard from "./Dashboard.tsx";
import KanbanBoard from "./KanbanBoard.tsx";
import CalendarMonthView from "./CalendarMonthView.tsx";
import TaskDetailModal from "./TaskDetailModal.tsx";
import { LayoutDashboard, Trello, Calendar, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function MainLayout() {
  const [view, setView] = useState<'dashboard' | 'board' | 'calendar'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ stats: [], workloads: [] });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchData = async () => {
    try {
      const fetchJson = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error \${res.status} on \${url}: \${text.substring(0, 50)}...`);
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return res.json();
        } else {
          throw new Error(`Expected JSON but got \${contentType} on \${url}`);
        }
      };

      const [tasksRes, usersRes, statsRes] = await Promise.all([
        fetchJson('/api/tasks'),
        fetchJson('/api/users'),
        fetchJson('/api/stats')
      ]);
      setTasks(tasksRes);
      setUsers(usersRes);
      setStats(statsRes);
    } catch (error) {
      console.error("Fetch data error:", error);
    }
  };

  useEffect(() => {
    fetchData();
    // Simulate real-time polling
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 w-full font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 bg-slate-900 text-white flex flex-col transition-all z-10 shrink-0">
        <div className="p-4 md:p-6 flex items-center justify-center md:justify-start gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-500 rounded-lg flex items-center justify-center font-bold text-slate-900 shrink-0">
            P25
          </div>
          <div className="hidden md:block">
            <h1 className="text-xs font-bold tracking-widest uppercase opacity-60">SMA 1 Padang</h1>
            <p className="text-sm font-semibold">Reuni Perak 25</p>
          </div>
        </div>
        
        <nav className="flex-1 w-full p-2 md:p-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 opacity-80'}`}
          >
            <LayoutDashboard className={`w-5 h-5 shrink-0 ${view === 'dashboard' ? 'opacity-70' : ''}`} />
            <span className="font-medium hidden md:block">Dashboard</span>
          </button>
          <button 
            onClick={() => setView('board')}
            className={`w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-lg transition-colors ${view === 'board' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 opacity-80'}`}
          >
            <Trello className={`w-5 h-5 shrink-0 ${view === 'board' ? 'opacity-70' : ''}`} />
            <span className="font-medium hidden md:block">Pekerjaan</span>
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-lg transition-colors ${view === 'calendar' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 opacity-80'}`}
          >
            <Calendar className={`w-5 h-5 shrink-0 ${view === 'calendar' ? 'opacity-70' : ''}`} />
            <span className="font-medium hidden md:block">Kalender</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 hidden md:block">
          <div className="p-3 bg-blue-900/40 rounded-lg border border-blue-800">
            <p className="text-xs text-blue-200 mb-1 font-medium">Cloud Integration</p>
            <div className="flex gap-2 opacity-80">
              <span className="text-[10px] bg-white text-blue-950 px-1 rounded">DOCS</span>
              <span className="text-[10px] bg-white text-green-950 px-1 rounded">SHEET</span>
              <span className="text-[10px] bg-white text-purple-950 px-1 rounded">FORM</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              {view === 'dashboard' ? 'Dashboard Overview' : 'Timeline Kepanitiaan'}
            </h2>
            <span className="hidden md:inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">Angkatan 2001</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex -space-x-2">
              {users.slice(0, 3).map((u, i) => (
                <div key={u.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs text-white ${['bg-blue-500', 'bg-emerald-500', 'bg-orange-500'][i % 3]}`}>
                  {u.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
              {users.length > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                  +{users.length - 3}
                </div>
              )}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col"
          >
            {view === 'dashboard' && <Dashboard stats={stats} />}
            {view === 'board' && <KanbanBoard tasks={tasks} users={users} onUpdate={fetchData} />}
            {view === 'calendar' && <CalendarMonthView tasks={tasks} users={users} setTaskToSelect={setSelectedTask} />}
          </motion.div>
        </div>

        <footer className="h-10 border-t border-slate-200 bg-white px-8 flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-medium shrink-0 z-10 hidden md:flex">
          <div className="flex gap-4">
            <span>v1.2.5 Silver Edition</span>
            <span>Terakhir sinkronisasi: 2 menit yang lalu</span>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Sistem Online</span>
            <span>Storage: 450 MB / 2 GB</span>
          </div>
        </footer>
      </main>

      <AnimatePresence>
        {selectedTask && (
          <TaskDetailModal 
            task={selectedTask} 
            users={users} 
            onClose={() => setSelectedTask(null)} 
            onUpdate={fetchData} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
