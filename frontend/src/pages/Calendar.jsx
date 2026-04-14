import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar() {
  const { petitions } = useOutletContext();

  // Highlight deadlines (15 days from creation)
  const deadlines = (petitions || [])
    .filter(p => p.created_at)
    .map(p => {
      const created = new Date(p.created_at);
      const deadline = new Date(created);
      deadline.setDate(created.getDate() + 15);
      return { ...p, deadline };
    })
    .filter(p => !isNaN(p.deadline.getTime()))
    .sort((a,b) => a.deadline - b.deadline);

  return (
    <div className="p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary tracking-tight">Hukuki Takvim</h2>
          <p className="text-slate-500 font-medium mt-1">İtiraz süreleri ve kritik tarih takibi.</p>
        </div>
        <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
          <div className="px-6 py-2 flex items-center justify-center font-black text-sm text-primary uppercase tracking-widest">
            {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deadline List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-primary flex items-center gap-3">
            <Clock size={20} className="text-accent"/>
            Yaklaşan Süreler
          </h3>
          
          <div className="space-y-4">
            {deadlines.length > 0 ? deadlines.slice(0, 10).map((d, idx) => {
              const diff = Math.ceil((d.deadline - new Date()) / (1000 * 60 * 60 * 24));
              const isCritical = diff <= 3;
              const isExpired = diff < 0;
              
              return (
                <div key={idx} className="glass-card rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-6 border border-white hover:border-slate-100 transition-all">
                  <div className={`w-16 h-16 rounded-[22px] flex flex-col items-center justify-center shrink-0 border-2
                    ${isExpired ? 'bg-slate-100 border-slate-200 text-slate-400' : isCritical ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{isExpired ? 'GEÇTİ' : 'KALAN'}</span>
                    <span className="text-2xl font-black">{Math.abs(diff)}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-1">GÜN</span>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">İTİRAZ SON TARİHİ</p>
                    <h4 className="text-lg font-black text-primary mb-1 underline decoration-accent/30 decoration-2">{d.client_name || 'İsimsiz Müvekkil'}</h4>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{d.vehicle_plate || 'Plaka Belirsiz'} · {d.penalty_code || 'Madde Belirsiz'}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-primary">{d.deadline.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-2">
                       {isExpired ? (
                         <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full">Süre Doldu</span>
                       ) : isCritical ? (
                         <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase bg-red-50 px-2 py-0.5 rounded-full">Kritik Süre</span>
                       ) : (
                         <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">Takipte</span>
                       )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                 <CalendarIcon size={48} className="mx-auto text-slate-100 mb-4"/>
                 <p className="font-bold text-slate-300">Takip edilecek süre bulunmuyor</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
           <div className="glass-card rounded-[32px] p-8 bg-primary text-white space-y-6 shadow-xl shadow-primary/20">
              <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
                <AlertCircle size={20}/>
                Süre Hatırlatıcı
              </h3>
              <p className="text-sm font-medium text-slate-300 leading-relaxed">
                Türk Trafik Hukuku'na göre ceza tebliğ tarihinden itibaren <b>15 gün</b> içinde itiraz etme hakkınız bulunmaktadır.
              </p>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">PRO İSİPUCU</p>
                 <p className="text-xs font-bold leading-relaxed text-white/90">Sisteme yüklediğiniz her ceza için bu süre otomatik olarak hesaplanır.</p>
              </div>
           </div>

           <div className="glass-card rounded-[32px] p-8 space-y-6 bg-white border border-slate-50">
              <h3 className="font-black text-primary text-lg tracking-tight">İstatistikler</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-400 uppercase text-[10px] tracking-widest">Bu Haftaki Süreler</span>
                    <span className="text-primary">{deadlines.filter(d => {
                      const diff = (d.deadline - new Date()) / (1000 * 60 * 60 * 24);
                      return diff >= 0 && diff <= 7;
                    }).length}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold pt-4 border-t border-slate-50">
                    <span className="text-slate-400 uppercase text-[10px] tracking-widest">Günü Geçenler</span>
                    <span className="text-red-500">{deadlines.filter(d => (d.deadline - new Date()) < 0).length}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
