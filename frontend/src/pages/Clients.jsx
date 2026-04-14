import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, FileText, Search, ExternalLink, Mail, Phone } from 'lucide-react';

export default function Clients() {
  const { petitions } = useOutletContext();
  const navigate = useNavigate();

  // Extract unique clients
  const clientMap = petitions.reduce((acc, p) => {
    const name = p.client_name || 'İsimsiz Müvekkil';
    if (!acc[name]) {
      acc[name] = { name, count: 0, plates: new Set(), lastDate: p.created_at };
    }
    acc[name].count += 1;
    if (p.vehicle_plate) acc[name].plates.add(p.vehicle_plate);
    if (new Date(p.created_at) > new Date(acc[name].lastDate)) acc[name].lastDate = p.created_at;
    return acc;
  }, {});

  const clients = Object.values(clientMap).sort((a,b) => b.count - a.count);

  return (
    <div className="p-8 space-y-8">
      <header>
        <h2 className="text-3xl font-black text-primary tracking-tight">Müvekkiller</h2>
        <p className="text-slate-500 font-medium mt-1">Sistemde kayıtlı aktif müvekkil listesi.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client, idx) => (
          <div key={idx} className="glass-card rounded-[32px] p-8 hover:scale-[1.02] transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-xl border border-primary/5">
                {client.name[0].toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">DİLEKÇE</p>
                <p className="text-2xl font-black text-primary">{client.count}</p>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-primary mb-1 group-hover:text-accent transition-colors">{client.name}</h3>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-bold text-slate-400">Son İşlem:</span>
              <span className="text-xs font-bold text-primary">{new Date(client.lastDate).toLocaleDateString()}</span>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-slate-400 text-xs font-bold">
                <FileText size={14} />
                <span>{Array.from(client.plates).join(', ') || 'Plaka bilgisi yok'}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/petitions')}
              className="w-full mt-8 py-4 bg-slate-50 group-hover:bg-primary group-hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Tüm Dosyaları Gör
            </button>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="font-bold text-slate-400">Henüz müvekkil kaydı bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
}
