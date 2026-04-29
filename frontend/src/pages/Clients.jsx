import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, FileText, Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATAR_COLORS = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500','bg-indigo-500','bg-teal-500'];

export default function Clients() {
  const { petitions } = useOutletContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClient, setExpandedClient] = useState(null);
  const [sortBy, setSortBy] = useState('count');

  const clients = useMemo(() => {
    const map = petitions.reduce((acc, p) => {
      const name = p.client_name || 'İsimsiz Müvekkil';
      if (!acc[name]) acc[name] = { name, count: 0, plates: new Set(), lastDate: p.created_at, petitions: [] };
      acc[name].count += 1;
      if (p.vehicle_plate) acc[name].plates.add(p.vehicle_plate);
      if (new Date(p.created_at) > new Date(acc[name].lastDate)) acc[name].lastDate = p.created_at;
      acc[name].petitions.push(p);
      return acc;
    }, {});
    let list = Object.values(map);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || Array.from(c.plates).some(p => p.toLowerCase().includes(q)));
    }
    if (sortBy === 'count') list.sort((a,b) => b.count - a.count);
    else list.sort((a,b) => new Date(b.lastDate) - new Date(a.lastDate));
    return list;
  }, [petitions, searchQuery, sortBy]);

  const statusLabel = (s) => {
    if (s === 'approved') return { text: 'Hazır', cls: 'status-ready' };
    if (s === 'generating') return { text: 'Analizde', cls: 'status-processing' };
    return { text: 'Beklemede', cls: 'status-waiting' };
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Müvekkiller</h2>
          <p className="text-sm text-slate-400 mt-1">Sistemde kayıtlı müvekkil listesi ve dosya özeti.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
            <input type="text" placeholder="İsim veya plaka ara…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="form-input pl-9 py-2 w-80 md:w-96 text-sm"/>
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="form-input py-2 px-3 w-auto text-xs">
            <option value="count">En Çok Dilekçe</option>
            <option value="date">Son İşlem</option>
          </select>
        </div>
      </header>

      {clients.length === 0 ? (
        <div className="py-20 text-center">
          <Users size={48} className="mx-auto text-slate-200 mb-4"/>
          <p className="font-medium text-slate-400">{searchQuery ? 'Aramanızla eşleşen müvekkil yok' : 'Henüz müvekkil kaydı yok'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client, idx) => {
            const isExpanded = expandedClient === client.name;
            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const approvedCount = client.petitions.filter(p => p.status === 'approved').length;
            return (
              <motion.div key={client.name} layout className="glass-card overflow-hidden">
                {/* Card header */}
                <div className="p-5 cursor-pointer" onClick={() => setExpandedClient(isExpanded ? null : client.name)}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${colorClass} text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0`}>
                      {client.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-primary truncate">{client.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{Array.from(client.plates).join(', ') || 'Plaka bilgisi yok'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-primary">{client.count}</p>
                      <p className="text-[10px] text-slate-400">dilekçe</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Son: {new Date(client.lastDate).toLocaleDateString('tr-TR')}</span>
                      <span className="text-success">{approvedCount} onaylı</span>
                    </div>
                    <div className="text-slate-300">
                      {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </div>
                  </div>
                </div>

                {/* Expanded section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider py-3">Dilekçe Geçmişi</p>
                        <div className="space-y-2">
                          {client.petitions.map(p => {
                            const { text, cls } = statusLabel(p.status);
                            return (
                              <div key={p.id} onClick={() => navigate(`/petition/${p.id}`)}
                                className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                                <FileText size={14} className="text-slate-400 shrink-0"/>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-primary truncate">#{String(p.id).slice(0,8)} · {p.penalty_code || 'OCR'}</p>
                                  <p className="text-[11px] text-slate-400">{new Date(p.created_at).toLocaleDateString('tr-TR')}</p>
                                </div>
                                <span className={`status-badge ${cls} text-[10px]`}>{text}</span>
                                <ExternalLink size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"/>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
