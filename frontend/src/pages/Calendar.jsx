import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const DAYS_TR = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

export default function Calendar() {
  const { petitions } = useOutletContext();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const deadlines = useMemo(() => (petitions || []).filter(p => p.created_at).map(p => {
    const created = new Date(p.created_at); const dl = new Date(created); dl.setDate(created.getDate() + 15);
    return { ...p, deadline: dl };
  }).filter(p => !isNaN(p.deadline.getTime())).sort((a,b) => a.deadline - b.deadline), [petitions]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const deadlineMap = useMemo(() => {
    const map = {};
    deadlines.forEach(d => {
      const key = `${d.deadline.getFullYear()}-${d.deadline.getMonth()}-${d.deadline.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(d);
    });
    return map;
  }, [deadlines]);

  const today = new Date();
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const getDayKey = (d) => `${year}-${month}-${d}`;
  const getDayDeadlines = (d) => deadlineMap[getDayKey(d)] || [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const selectedDeadlines = selectedDay ? getDayDeadlines(selectedDay) : [];

  const upcomingList = deadlines.filter(d => d.deadline >= new Date()).slice(0, 8);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-primary">Hukuki Takvim</h2>
        <p className="text-sm text-slate-400 mt-1">İtiraz süreleri ve kritik tarih takibi.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><ChevronLeft size={20}/></button>
            <h3 className="text-lg font-bold text-primary">{MONTHS_TR[month]} {year}</h3>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><ChevronRight size={20}/></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_TR.map(d => <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} className="min-h-[120px] rounded-2xl bg-slate-50/50 border border-slate-100/50"/>)}
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
              const dayDeadlines = getDayDeadlines(day);
              const isSelected = selectedDay === day;
              
              // Sort day deadlines: critical ones first
              const sortedDayDeadlines = [...dayDeadlines].sort((a,b) => {
                 const aDiff = (a.deadline - new Date())/(1000*60*60*24);
                 const bDiff = (b.deadline - new Date())/(1000*60*60*24);
                 return aDiff - bDiff;
              });

              return (
                <button key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`calendar-cell min-h-[120px] rounded-2xl relative p-2 flex flex-col items-start border-2 transition-all duration-300 ${isToday(day) ? 'calendar-cell-today border-accent/20 bg-accent/5' : isSelected ? 'border-accent shadow-lg shadow-accent/10 bg-white' : 'border-slate-100 bg-white hover:border-accent/50 hover:shadow-md'}`}>
                  
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday(day) ? 'bg-accent text-white' : 'text-slate-500'}`}>
                     {day}
                  </span>

                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    {sortedDayDeadlines.slice(0, 3).map((d, i) => {
                       const diff = Math.ceil((d.deadline - new Date())/(1000*60*60*24));
                       const isCritical = diff <= 3;
                       return (
                         <div key={i} className={`text-[10px] font-bold px-2 py-1 rounded-md w-full text-left truncate ${isCritical ? 'bg-danger-light text-danger' : 'bg-accent/10 text-accent'}`}>
                            {d.client_name?.split(' ')[0] || 'İsimsiz'}
                         </div>
                       );
                    })}
                    {sortedDayDeadlines.length > 3 && (
                       <div className="text-[10px] font-bold text-slate-400 pl-1">
                          +{sortedDayDeadlines.length - 3} dosya
                       </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected day popup */}
          <AnimatePresence>
            {selectedDay && selectedDeadlines.length > 0 && (
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
                className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-primary">{selectedDay} {MONTHS_TR[month]} — {selectedDeadlines.length} süre</h4>
                  <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-primary"><X size={14}/></button>
                </div>
                <div className="space-y-2">
                  {selectedDeadlines.map((d, i) => (
                    <div key={i} onClick={() => navigate(`/petition/${d.id}`)}
                      className="flex items-center gap-3 p-2.5 bg-white rounded-lg cursor-pointer hover:shadow-sm transition-all">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">{selectedDay}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{d.client_name || 'İsimsiz'}</p>
                        <p className="text-[11px] text-slate-400">{d.vehicle_plate} · {d.penalty_code || 'OCR'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="glass-card p-6 bg-primary text-white">
            <h3 className="font-bold flex items-center gap-2 mb-3"><AlertCircle size={18}/> İtiraz Süreleri</h3>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Tebliğ tarihinden itibaren <strong className="text-white">15 gün</strong> içinde itiraz edilmelidir.
            </p>
            <div className="p-3 bg-white/10 rounded-xl border border-white/10">
              <p className="text-xs text-white/90">Süre otomatik hesaplanır.</p>
            </div>
          </div>

          {/* Upcoming deadlines */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <Clock size={16} className="text-warning"/> Yaklaşan Süreler
            </h3>
            <div className="space-y-2">
              {upcomingList.length > 0 ? upcomingList.map((d, i) => {
                const diff = Math.ceil((d.deadline - new Date()) / (1000*60*60*24));
                const isCritical = diff <= 3;
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${isCritical ? 'bg-danger-light text-danger' : 'bg-accent-muted text-accent'}`}>
                      {diff}g
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{d.client_name || 'İsimsiz'}</p>
                      <p className="text-[11px] text-slate-400">{d.deadline.toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                );
              }) : <p className="text-sm text-slate-300 text-center py-4">Yaklaşan süre yok</p>}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary mb-3">İstatistikler</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Bu hafta</span><span className="font-semibold text-primary">{deadlines.filter(d => { const diff = (d.deadline - new Date())/(1000*60*60*24); return diff >= 0 && diff <= 7;}).length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Geçenler</span><span className="font-semibold text-danger">{deadlines.filter(d => d.deadline < new Date()).length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Toplam</span><span className="font-semibold text-primary">{deadlines.length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
