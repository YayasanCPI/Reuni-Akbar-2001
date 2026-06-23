import { Task, User } from "../types.ts";
import { Plus, Check, Clock, CircleDot, AlertCircle } from "lucide-react";
import { useState } from "react";
import TaskDetailModal from "./TaskDetailModal.tsx";

export default function KanbanBoard({ tasks, users, onUpdate }: { tasks: Task[], users: User[], onUpdate: () => void }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const cols = [
    { id: 'not yet', title: 'Belum Mulai', icon: CircleDot, color: 'text-slate-400', bg: 'bg-white', border: 'border-slate-200', tagClass: 'bg-slate-100 text-slate-500' },
    { id: 'on progress', title: 'Sedang Proses', icon: Clock, color: 'text-orange-500', bg: 'bg-slate-50', border: 'border-slate-200', tagClass: 'bg-orange-100 text-orange-600' },
    { id: 'done', title: 'Selesai', icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-50/30', border: 'border-slate-200', tagClass: 'bg-emerald-100 text-emerald-600' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("taskId");
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === status) return;
    
    // Optimistic / Simple update API call
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, status })
    });
    onUpdate();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-medium text-slate-800">Board Pekerjaan</h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm text-xs"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Rencana
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-start overflow-auto pb-4">
        {cols.map(col => (
          <div 
            key={col.id} 
            className={`flex flex-col h-full max-h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className={`flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50`}>
              <div className="flex items-center">
                <col.icon className={`w-4 h-4 mr-2 ${col.color}`} />
                <h3 className="font-bold text-slate-700">{col.title}</h3>
              </div>
              <span className="text-xs font-semibold bg-white text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className={`flex-1 min-h-[200px] p-4 space-y-3 overflow-y-auto ${col.bg}`}>
              {tasks.filter(t => t.status === col.id).map(task => {
                const initial = task.picName ? task.picName.substring(0, 2).toUpperCase() : '?';
                const avatarBg = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-orange-100 text-orange-600'][task.picName ? task.picName.length % 3 : 0] || 'bg-slate-200 text-slate-600';

                return (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTask(task)}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow hover:border-slate-300 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${col.tagClass}`}>
                        {col.id}
                      </span>
                      {task.milestone && (
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                           {task.milestone.substring(0, 15)}
                         </span>
                      )}
                    </div>
                    <div className="font-medium text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarBg}`}>
                          {initial}
                        </div>
                        <span className="text-xs text-slate-500">{task.picName || 'Unassigned'}</span>
                      </div>
                      {task.comments?.length > 0 && (
                        <div className="flex items-center opacity-50">
                           <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-600">
                             <AlertCircle className="w-3 h-3" /> {task.comments.length}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {tasks.filter(t => t.status === col.id).length === 0 && (
                 <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm bg-white/50">
                   Drop tugas ke sini
                 </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {(selectedTask || isCreating) && (
        <TaskDetailModal 
          task={selectedTask} 
          users={users} 
          onClose={() => { setSelectedTask(null); setIsCreating(false); }} 
          onUpdate={onUpdate} 
        />
      )}
    </div>
  );
}
