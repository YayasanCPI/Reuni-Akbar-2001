import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CircleDot, Clock, Check } from "lucide-react";
import { Task, User } from "../types.ts";

export default function CalendarMonthView({ tasks, users, setTaskToSelect }: { tasks: Task[]; users: User[]; setTaskToSelect: (task: Task) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date("2026-06-01"));

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const startDate = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const endDate = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;

      const dayTasks = tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), cloneDay));

      days.push(
        <div 
          key={day.toString()} 
          className={`min-h-[100px] border border-slate-100 p-2 flex flex-col \${
            !isSameMonth(day, currentDate) ? "bg-slate-50 text-slate-400" : "bg-white"
          }`}
        >
          <div className="flex justify-end mb-1">
            <span className={`text-xs font-semibold \${isSameDay(day, new Date()) ? 'bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full' : 'text-slate-600'}`}>
              {formattedDate}
            </span>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
            {dayTasks.map(task => {
              const u = users.find(u => u.id === task.picId);
              return (
                <div 
                  key={task.id} 
                  onClick={() => setTaskToSelect(task)}
                  className={`text-[10px] p-1.5 rounded-md cursor-pointer border truncate shadow-sm transition-all hover:brightness-95 \${
                    task.status === 'done' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    task.status === 'on progress' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                    'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="font-bold">{task.title}</span><br />
                  <span className="opacity-75">{u?.name || "Unassigned"}</span>
                </div>
              )
            })}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const weekDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">
          {format(currentDate, "MMMM yyyy", { locale: id })}
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded hover:bg-slate-200 transition-colors border border-slate-200 bg-white">
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-xs font-bold uppercase rounded hover:bg-slate-200 transition-colors border border-slate-200 bg-white text-slate-600">
            Hari Ini
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded hover:bg-slate-200 transition-colors border border-slate-200 bg-white">
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 shrink-0">
        {weekDays.map(wd => (
          <div key={wd} className="text-center py-2 text-xs font-bold text-slate-500 uppercase">
            {wd}
          </div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="flex-1 overflow-y-auto">
        {rows}
      </div>
    </div>
  );
}
