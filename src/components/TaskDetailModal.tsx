import { useState } from "react";
import { Task, User } from "../types.ts";
import { X, Save, Trash2, Calendar, Mail, FileText, Upload, MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function TaskDetailModal({ task, users, onClose, onUpdate }: { task: Task | null, users: User[], onClose: () => void, onUpdate: () => void }) {
  const isEditing = !!task;
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [picId, setPicId] = useState(task?.picId || "");
  const [milestone, setMilestone] = useState(task?.milestone || "");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [comment, setComment] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const handleSave = async () => {
    const payload = { title, description, picId, milestone, dueDate, id: task?.id || 't' + Date.now() };
    await fetch(isEditing ? `/api/tasks/${task.id}` : '/api/tasks', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    onUpdate();
    onClose();
  };

  const handleDelete = async () => {
    if (!task) return;
    if (confirm("Hapus tugas ini?")) {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      onUpdate();
      onClose();
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim() || !task) return;
    await fetch(`/api/tasks/${task.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'c' + Date.now(), content: comment, userId: 'u1' }) // Hardcode as user 1 for demo
    });
    setComment("");
    onUpdate();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !task) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('document', e.target.files[0]);
    await fetch(`/api/tasks/${task.id}/upload`, {
      method: 'POST',
      body: formData
    });
    setUploading(false);
    onUpdate();
  };

  const triggerGoogleWorkspaceAction = (action: string) => {
    alert(`Memicu integrasi Google ${action}... Pastikan OAuth credentials diatur di Settings.`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
        >
          {/* Form / Detail Area */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">{isEditing ? 'Detail Pekerjaan' : 'Tambah Pekerjaan'}</h2>
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full md:hidden"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Pekerjaan</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Booking Tempat" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Detail tugas..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PIC (Penanggung Jawab)</label>
                  <select value={picId} onChange={(e) => setPicId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500">
                    <option value="">Pilih Anggota</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Milestone</label>
                  <input type="text" value={milestone} onChange={(e) => setMilestone(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500" placeholder="e.g. Persiapan Awal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tenggat Waktu</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleSave} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg flex items-center justify-center font-medium transition-colors">
                <Save className="w-4 h-4 mr-2" /> Simpan
              </button>
              {isEditing && (
                <button onClick={handleDelete} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {isEditing && (
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Aksi Cepat & Notifikasi</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => triggerGoogleWorkspaceAction('Calendar')} className="flex items-center text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 hover:bg-blue-100 transition-colors">
                    <Calendar className="w-4 h-4 mr-2" /> Buat Rapat (Calendar)
                  </button>
                  <button onClick={() => triggerGoogleWorkspaceAction('Gmail')} className="flex items-center text-sm bg-emerald-50 text-emerald-700 px-3 py-2 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors">
                    <Mail className="w-4 h-4 mr-2" /> Kirim Email
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Collaboration Area */}
          <div className="w-full md:w-80 bg-slate-50 flex flex-col pt-0 md:pt-6 h-[400px] md:h-auto">
            <div className="px-6 pb-4 flex justify-end hidden md:flex">
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            {isEditing ? (
              <>
                <div className="px-6 flex-1 overflow-y-auto w-full">
                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center mb-4"><FileText className="w-4 h-4 mr-2" /> Dokumen Pendukung</h3>
                  <div className="space-y-2 mb-6">
                    {task.attachments?.map(att => (
                      <a key={att.id} href={att.url} target="_blank" className="block p-3 bg-white border border-slate-200 rounded-lg text-sm text-blue-600 hover:border-blue-300 truncate transition-colors">
                        {att.fileName}
                      </a>
                    ))}
                    <label className="cursor-pointer border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center p-4 text-slate-500 hover:bg-slate-50 hover:text-blue-600 hover:border-blue-400 transition-all text-sm">
                      <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                      <Upload className="w-4 h-4 mr-2" /> {uploading ? 'Mengunggah...' : 'Upload Dokumen'}
                    </label>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center mb-4"><MessageSquare className="w-4 h-4 mr-2" /> Diskusi & Notifikasi</h3>
                  <div className="space-y-4 mb-4">
                    {task.comments?.map(c => (
                      <div key={c.id} className="bg-white p-3 rounded-lg border border-slate-200 text-sm">
                        <div className="font-semibold text-slate-700 mb-1">{users.find(u => u.id === c.userId)?.name || 'User'}</div>
                        <p className="text-slate-600">{c.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border-t border-slate-200 bg-white">
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                      placeholder="Tulis komentar..." 
                      className="flex-1 border border-slate-300 rounded-l-lg p-2 outline-none focus:border-blue-500"
                    />
                    <button onClick={handlePostComment} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-lg transition-colors border-y border-r border-blue-600">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 p-6 text-center text-sm">
                Simpan tugas ini terlebih dahulu untuk mengakses fitur unggah dokumen dan diskusi tim.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
