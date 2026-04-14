import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Filter, Download, 
  Trash2, MoreHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiFetch } from '../utils/api';

export default function Petitions() {
  const { filteredPetitions, loadingList: loading, loadData } = useOutletContext();
  const navigate = useNavigate();

  // Deletion logic
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petitionToDelete, setPetitionToDelete] = useState(null);

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`/petitions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Dilekçe başarıyla silindi');
        loadData(); // Layout'tan gelen datayı tazele
        setIsDeleteModalOpen(false);
        setPetitionToDelete(null);
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Silme işlemi başarısız');
      }
    } catch (e) {
      toast.error('Bağlantı hatası oluştu');
    }
  };

  return (
    <div className="p-8 space-y-8 relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tight">Dilekçelerim</h2>
          <p className="text-slate-500 font-medium mt-1">Tüm itiraz belgeleriniz ve analiz sonuçları.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} /> Filtrele
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Download size={18} /> Dışa Aktar
          </button>
        </div>
      </header>

      <section className="glass-card rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">DOSYA ID</th>
                <th className="px-4 py-5">MÜVEKKİL / PLAKA</th>
                <th className="px-4 py-5">KTK MADDESİ</th>
                <th className="px-4 py-5">KALİTE SKORU</th>
                <th className="px-4 py-5">DURUM</th>
                <th className="px-4 py-5">TARİH</th>
                <th className="px-8 py-5 text-center">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredPetitions.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 font-bold text-slate-400 text-xs tracking-tighter group-hover:text-primary transition-colors">
                    #{String(p.id).slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-primary">{p.client_name || '—'}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.vehicle_plate || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                      {p.penalty_code || 'OCR'}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3 w-28">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${p.quality_score >= 80 ? 'bg-emerald-500' : p.quality_score >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                          style={{ width: `${p.quality_score || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-extrabold text-primary">%{p.quality_score || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className={`status-badge ${p.status === 'approved' ? 'status-ready' : p.status === 'generating' ? 'status-processing' : 'status-waiting'}`}>
                      {p.status === 'approved' ? 'HAZIR' : p.status === 'generating' ? 'ANALİZDE' : 'BEKLEMEDE'}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-xs font-bold text-slate-500">
                    {new Date(p.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-8 py-5 text-center flex items-center justify-center gap-4">
                    <button 
                      onClick={() => navigate(`/petition/${p.id}`)}
                      className="text-accent hover:text-accent-dark font-black text-xs uppercase tracking-widest"
                    >
                      DETAY
                    </button>
                    <button 
                      onClick={() => { setPetitionToDelete(p.id); setIsDeleteModalOpen(true); }}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl">
              <div className="flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6"><Trash2 size={40}/></div>
                 <h3 className="text-2xl font-black text-primary mb-2">Emin misiniz?</h3>
                 <p className="text-slate-500 font-medium mb-8">Bu dilekçe kalıcı olarak silinecektir.</p>
                 <div className="flex gap-4 w-full">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Vazgeç</button>
                    <button onClick={() => handleDelete(petitionToDelete)} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">Sil</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
