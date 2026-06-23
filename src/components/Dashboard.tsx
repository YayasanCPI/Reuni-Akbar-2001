import { Stats } from "../types.ts";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

const COLORS = ['#6366f1', '#eab308', '#22c55e', '#ef4444'];

export default function Dashboard({ stats }: { stats: Stats }) {
  const notYet = stats.stats.find(s => s.status === 'not yet')?.count || 0;
  const onProgress = stats.stats.find(s => s.status === 'on progress')?.count || 0;
  const done = stats.stats.find(s => s.status === 'done')?.count || 0;
  const total = notYet + onProgress + done;

  const pieData = [
    { name: 'Not Yet', value: notYet },
    { name: 'On Progress', value: onProgress },
    { name: 'Done', value: done }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Not Yet</p>
          <p className="text-3xl font-bold text-slate-800">{notYet}</p>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-slate-300 h-full transition-all" style={{ width: `${total ? (notYet / total) * 100 : 0}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-orange-500 uppercase tracking-tight">On Progress</p>
          <p className="text-3xl font-bold text-slate-800">{onProgress}</p>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full transition-all" style={{ width: `${total ? (onProgress / total) * 100 : 0}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-tight">Done</p>
          <p className="text-3xl font-bold text-slate-800">{done}</p>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-tight">Total Tasks</p>
          <p className="text-3xl font-bold text-slate-800">{total}</p>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 w-full h-full"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h4 className="text-sm font-bold text-slate-700 mb-4 shrink-0">Status Penyelesaian</h4>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4 shrink-0">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center text-sm text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h4 className="text-sm font-bold text-slate-700 mb-4 shrink-0">Beban Kerja Tim</h4>
          <div className="space-y-4 overflow-y-auto pr-2">
            {stats.workloads.map((w, i) => {
              const perc = total ? Math.round((w.tasksCount / total) * 100) : 0;
              const barColors = ['bg-blue-600', 'bg-emerald-500', 'bg-orange-400', 'bg-purple-500'];
              return (
                <div key={w.picId}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-600 font-medium">{w.name || 'Unassigned'}</span>
                    <span className="font-bold">{perc}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${barColors[i % barColors.length]} h-full transition-all`} style={{ width: `${perc}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center">
      <div className={`${bg} ${color} p-3 rounded-lg mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
