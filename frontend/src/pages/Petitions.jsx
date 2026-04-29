import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { FileText, Filter, Download, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiFetch } from '../utils/api';

const STATUS_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'approved', label: 'Hazır' },
  { key: 'generating', label: 'Analizde' },
  { key: 'pending', label: 'Beklemede' },
];

function statusLabel(s) {
  if (s === 'approved') return { text: 'Hazır', cls: 'status-ready', dot: 'bg-success' };
  if (s === 'generating') return { text: 'Analizde', cls: 'status-processing', dot: 'bg-warning' };
  return { text: 'Beklemede', cls: 'status-waiting', dot: 'bg-slate-400' };
}

export default function Petitions() {
  const { filteredPetitions, loadingList: loading, loadData } = useOutletContext();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petitionToDelete, setPetitionToDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(0);
  const perPage = 10;

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`/petitions/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Dilekçe silindi'); loadData(); setIsDeleteModalOpen(false); setPetitionToDelete(null); }
      else { const err = await res.json(); toast.error(err.detail || 'Silme başarısız'); }
    } catch (e) { toast.error('Bağlantı hatası'); }
  };

  const processed = useMemo(() => {
    let list = [...filteredPetitions];
    if (activeFilter !== 'all') {
      list = list.filter(p => {
        if (activeFilter === 'pending') return p.status !== 'approved' && p.status !== 'generating';
        return p.status === activeFilter;
      });
    }
    if (sortBy === 'date') list.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === 'score') list.sort((a,b) => (b.quality_score||0) - (a.quality_score||0));
    return list;
  }, [filteredPetitions, activeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage));
  const paginated = processed.slice(page * perPage, (page+1) * perPage);
  const filterCounts = useMemo(() => ({
    all: filteredPetitions.length,
    approved: filteredPetitions.filter(p => p.status === 'approved').length,
    generating: filteredPetitions.filter(p => p.status === 'generating').length,
    pending: filteredPetitions.filter(p => p.status !== 'approved' && p.status !== 'generating').length,
  }), [filteredPetitions]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Dilekçelerim</h2>
          <p className="text-sm text-slate-400 mt-1">Tüm itiraz belgeleriniz ve analiz sonuçları.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input py-2 px-3 w-auto text-xs">
            <option value="date">Tarihe Göre</option>
            <option value="score">Skora Göre</option>
          </select>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => { setActiveFilter(f.key); setPage(0); }}
            className={`tab-item ${activeFilter === f.key ? 'tab-item-active' : 'tab-item-inactive'}`}
          >
            {f.label}
            <span className="ml-1.5 text-[11px] opacity-60">{filterCounts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <section className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="py-20 text-center">
              <FileText size={40} className="mx-auto text-slate-200 mb-3"/>
              <p className="text-sm font-medium text-slate-400">Bu filtreye uygun dilekçe bulunamadı.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3.5">Dosya ID</th>
                  <th className="px-4 py-3.5">Müvekkil / Plaka</th>
                  <th className="px-4 py-3.5">KTK Maddesi</th>
                  <th className="px-4 py-3.5">Kalite</th>
                  <th className="px-4 py-3.5">Durum</th>
                  <th className="px-4 py-3.5">Tarih</th>
                  <th className="px-6 py-3.5 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {paginated.map(p => {
                  const { text, cls, dot } = statusLabel(p.status);
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 text-xs font-medium text-slate-400 group-hover:text-primary font-mono">
                        #{String(p.id).slice(0,8).toUpperCase()}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-primary">{p.client_name || '—'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.vehicle_plate || '—'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{p.penalty_code || 'OCR'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 w-24">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${(p.quality_score||0) >= 80 ? 'bg-emerald-500' : (p.quality_score||0) >= 60 ? 'bg-amber-500' : 'bg-red-400'}`} style={{width:`${p.quality_score||0}%`}}/>
                          </div>
                          <span className="text-xs font-semibold text-primary">%{p.quality_score||0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`status-badge ${cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dot}`}/>
                          {text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString('tr-TR')}</td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-3">
                        <button onClick={() => navigate(`/petition/${p.id}`)} className="text-accent font-semibold text-xs hover:underline">Detay</button>
                        <button onClick={() => {setPetitionToDelete(p.id);setIsDeleteModalOpen(true);}} className="text-slate-300 hover:text-danger transition-colors p-1" title="Sil">
                          <Trash2 size={15}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">{processed.length} dilekçeden {page*perPage+1}-{Math.min((page+1)*perPage, processed.length)} arası</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronLeft size={16}/></button>
              {Array.from({length: totalPages}, (_,i) => (
                <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 rounded-lg text-xs font-semibold ${page===i ? 'bg-accent text-white' : 'text-slate-400 hover:bg-slate-100'}`}>{i+1}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page===totalPages-1} className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </section>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setIsDeleteModalOpen(false)} className="absolute inset-0 bg-black/30 backdrop-blur-sm"/>
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}} className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-danger-light text-danger rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={32}/></div>
                <h3 className="text-xl font-bold text-primary mb-2">Emin misiniz?</h3>
                <p className="text-slate-500 text-sm mb-6">Bu dilekçe kalıcı olarak silinecektir.</p>
                <div className="flex gap-3">
                  <button onClick={()=>setIsDeleteModalOpen(false)} className="flex-1 btn-secondary py-3">Vazgeç</button>
                  <button onClick={()=>handleDelete(petitionToDelete)} className="flex-1 btn-danger py-3">Sil</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
