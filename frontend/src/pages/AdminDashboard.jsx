import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, FileText, TrendingUp, 
  CheckCircle2, XCircle, Loader2, Scale,
  ArrowUpRight, Clock, AlertTriangle, ShieldCheck,
  Zap, Activity, ChevronRight, Search
} from 'lucide-react';
import { fetchAdminStats } from '../utils/api';
import { useNavigate } from 'react-router-dom';

// ─── Constants & Config ──────────────────────────────────────────────────────
const CATEGORY_UI = {
  hiz_ihlali: { label: 'Hız İhlali', color: '#38BDF8', gradient: ['#38BDF8', '#0EA5E9'] },
  kirmizi_isik: { label: 'Kırmızı Işık', color: '#F43F5E', gradient: ['#F43F5E', '#BE123C'] },
  hatali_park: { label: 'Hatalı Park', color: '#8B5CF6', gradient: ['#8B5CF6', '#6D28D9'] },
  alkol: { label: 'Alkol/Madde', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
  emniyet_kemeri: { label: 'Emniyet Kemeri', color: '#10B981', gradient: ['#10B981', '#059669'] },
  diger: { label: 'Diğer İhlaller', color: '#64748B', gradient: ['#64748B', '#334155'] },
};

// ─── Utility Components ──────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub, delay = 0 }) {
  const themes = {
    blue:   "bg-blue-50 text-blue-600 border-blue-100/50 shadow-blue-500/5",
    rose:   "bg-rose-50 text-rose-600 border-rose-100/50 shadow-rose-500/5",
    violet: "bg-violet-50 text-violet-600 border-violet-100/50 shadow-violet-500/5",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100/50 shadow-emerald-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`premium-card p-6 rounded-[32px] group relative overflow-hidden ${themes[color]}`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
            {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
          </div>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm cursor-pointer"
          >
            <ArrowUpRight size={14} />
          </motion.div>
        </div>
        
        <div>
          <div className="text-4xl font-black tracking-tighter mb-1 text-primary">
            <AnimatedCounter target={value} prefix={label.includes('Skor') || label.includes('Oran') ? '%' : ''} />
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">
            {label}
          </div>
        </div>

        {sub && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sub}</span>
          </div>
        )}
      </div>
      
      {/* Decorative background shape */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:bg-white/40 transition-colors" />
    </motion.div>
  );
}

function AnimatedCounter({ target, prefix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const isFloat = String(target).includes('.');
    const end = parseFloat(target);
    if (!end) return;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(isFloat ? parseFloat(start.toFixed(1)) : Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  
  return <>{prefix === '%' ? <>%{count}</> : <>{count}{prefix}</>}</>;
}

// ─── Premium Bar Chart ───────────────────────────────────────────────────────
function ModernBarChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const formattedData = useMemo(() => {
    if (!data?.length) return [];
    const maxVal = Math.max(...data.map(d => d.count), 1);
    return data.map(d => ({ ...d, ratio: d.count / maxVal }));
  }, [data]);

  if (!formattedData.length) return <div className="h-64 flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">Veri bekleniyor...</div>;

  return (
    <div className="relative h-64 flex items-end justify-between px-2 gap-3">
      {formattedData.map((d, i) => (
        <div 
          key={i} 
          className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end"
          onMouseEnter={() => setHoveredIdx(i)}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {hoveredIdx === i && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                className="absolute bottom-full mb-3 px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg shadow-xl z-20 whitespace-nowrap"
              >
                {d.count} Dilekçe
                <div className="absolute top-full left-1/2 -ml-1 border-4 border-transparent border-t-primary" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${d.ratio * 80}%` }}
            transition={{ duration: 1, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full max-w-[40px] rounded-t-2xl rounded-b-lg relative transition-all duration-500 overflow-hidden
              ${hoveredIdx === i ? 'shadow-lg shadow-accent/20' : 'opacity-80'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-accent to-accent-light" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
          
          <span className="text-[9px] font-bold text-slate-400 rotate-45 md:rotate-0 origin-left mt-2 whitespace-nowrap">
            {d.month?.slice(5)}/{d.month?.slice(2,4)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Premium Donut Chart ──────────────────────────────────────────────────────
function ModernDonutChart({ data }) {
  const entries = Object.entries(data || {}).sort((a,b) => b[1] - a[1]);
  const total = entries.reduce((a, b) => a + b[1], 0);

  if (!total) return <div className="h-64 flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">Veri bulunamadı</div>;

  let currentAngle = -90;
  const cx = 100, cy = 100, r = 70, innerR = 48;

  const toRad = (d) => (d * Math.PI) / 180;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-10">
      <div className="relative w-[200px] h-[200px]">
        <svg viewBox="0 0 200 200" className="w-full h-full transform transition-transform duration-700 hover:rotate-12">
          {entries.map(([key, val], i) => {
            const angle = (val / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const startOuter = { x: cx + r * Math.cos(toRad(startAngle)), y: cy + r * Math.sin(toRad(startAngle)) };
            const endOuter = { x: cx + r * Math.cos(toRad(startAngle + angle)), y: cy + r * Math.sin(toRad(startAngle + angle)) };
            const startInner = { x: cx + innerR * Math.cos(toRad(startAngle + angle)), y: cy + innerR * Math.sin(toRad(startAngle + angle)) };
            const endInner = { x: cx + innerR * Math.cos(toRad(startAngle)), y: cy + innerR * Math.sin(toRad(startAngle)) };
            const largeArc = angle > 180 ? 1 : 0;
            
            const d = `M ${startOuter.x} ${startOuter.y} A ${r} ${r} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y} L ${startInner.x} ${startInner.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y} Z`;
            const ui = CATEGORY_UI[key] || CATEGORY_UI.diger;

            return (
              <motion.path
                key={key}
                d={d}
                fill={ui.color}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.9, scale: 1 }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                whileHover={{ scale: 1.05 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className="text-3xl font-black text-primary tracking-tighter leading-none">{total}</span>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">İhlal</span>
        </div>
      </div>

      <div className="flex-1 w-full space-y-3">
        {entries.map(([key, val]) => {
          const ui = CATEGORY_UI[key] || CATEGORY_UI.diger;
          const perc = Math.round((val / total) * 100);
          return (
            <div key={key} className="flex items-center gap-4 group cursor-default">
              <div className="w-3 h-3 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: ui.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-600 group-hover:text-primary transition-colors">{ui.label}</span>
                  <span className="text-[10px] font-black text-primary bg-slate-100 px-2 py-0.5 rounded-full">%{perc}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${perc}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: ui.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Admin Component ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="animate-spin text-accent" size={48} />
            <div className="absolute inset-0 blur-xl bg-accent/20 animate-pulse" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Analiz ediliyor...</p>
        </div>
      </div>
    );
  }

  const s = stats;

  return (
    <div className="min-h-full bg-[#FBFDFF] px-4 py-8 md:p-10 space-y-10 max-w-[1400px] mx-auto font-sans">
      
      {/* ─── 1. HEADER & STATUS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-primary">Operasyon Merkezi</h1>
          </div>
          <p className="text-sm font-medium text-slate-400">CezaSavun.ai platformu gerçek zamanlı performans analizi ve denetimi.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-5"
        >
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-glow" />
             <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">SİSTEM CANLI</span>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm hidden sm:flex items-center gap-3">
             <Clock size={16} className="text-slate-400" />
             <span className="text-xs font-bold text-slate-600">
                {new Date().toLocaleDateString('tr-TR', { day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
             </span>
          </div>
        </motion.div>
      </div>

      {/* ─── 2. KEY PERFORMANCE INDICATORS (KPIs) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0.1} label="Toplam Dilekçe" value={s.total_petitions} color="blue" icon={<FileText />} sub={`${s.generating_count} AKTİF ÜRETİM`} />
        <StatCard delay={0.2} label="Kalite Skoru" value={s.average_quality_score} color="violet" icon={<Zap />} sub="YAPAY ZEKA ANALİZİ" />
        <StatCard delay={0.3} label="Onay Oranı" value={s.approval_rate} color="emerald" icon={<TrendingUp />} sub={`${s.approved_count} BAŞARILI SONUÇ`} />
        <StatCard delay={0.4} label="Kullanıcı" value={s.total_users} color="rose" icon={<Users />} sub="DOĞRULANMIŞ HESAP" />
      </div>

      {/* ─── 3. INTERACTIVE ANALYTICS ─── */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="lg:col-span-2 premium-card p-8 rounded-[40px] bg-white border border-slate-100"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-primary tracking-tight">Büyüme Grafiği</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Aylık dilekçe üretim hacmi</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
               <Activity size={16} className="text-accent" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Canlı Akış</span>
            </div>
          </div>
          <ModernBarChart data={s.monthly_petitions} />
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="premium-card p-8 rounded-[40px] bg-slate-900 text-white border-0 shadow-2xl shadow-primary/20 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-xl font-black tracking-tight mb-1">İtiraz Dağılımı</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Kategori bazlı analiz</p>
            <ModernDonutChart data={s.category_distribution} />
          </div>
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        </motion.div>
      </div>

      {/* ─── 4. RECENT ACTIVITY LIST ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="premium-card rounded-[40px] bg-white border border-slate-100 overflow-hidden"
      >
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
           <div>
             <h3 className="text-xl font-black text-primary tracking-tight">Son Dilekçeler</h3>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Operasyonel kayıtlar</p>
           </div>
           <button className="flex items-center gap-2 text-xs font-black text-accent hover:text-accent-dark transition-colors uppercase tracking-[0.15em]">
              Tümünü Gör <ChevronRight size={16} />
           </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="py-6 px-10 text-left">Müvekkil Bilgisi</th>
                <th className="py-6 px-4 text-left">İhlal Tipi</th>
                <th className="py-6 px-4 text-center">Kalite</th>
                <th className="py-6 px-4 text-center">Durum</th>
                <th className="py-6 px-10 text-right">Zaman Grafiği</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {s.recent_petitions.map((p, i) => (
                <tr 
                  key={p.id}
                  onClick={() => navigate(`/petition/${p.id}`)}
                  className="group hover:bg-slate-50/80 transition-all duration-500 cursor-pointer"
                >
                  <td className="py-6 px-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-black group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                        {p.client_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary group-hover:text-accent transition-colors">{p.client_name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400 mt-0.5 tracking-tighter uppercase">{p.vehicle_plate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_UI[p.category]?.color || '#cbd5e1' }} />
                       <span className="text-xs font-bold text-slate-600">{CATEGORY_UI[p.category]?.label || p.category}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 group-hover:border-accent/20 transition-all">
                       <Zap size={10} className={(p.quality_score || 0) >= 70 ? 'text-emerald-500' : 'text-amber-500'} />
                       <span className={`text-[11px] font-black ${(p.quality_score || 0) >= 70 ? 'text-emerald-600' : 'text-amber-500'}`}>%{p.quality_score || 0}</span>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-6 px-10 text-right">
                    <p className="text-xs font-black text-slate-600">{new Date(p.created_at).toLocaleDateString('tr-TR')}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                       {new Date(p.created_at).toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {s.recent_petitions.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center gap-4">
               <AlertTriangle className="text-slate-200" size={64} />
               <p className="text-sm font-black text-slate-300 uppercase tracking-[0.2em]">Henüz işlem kaydı bulunmuyor</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    approved: { label: 'ONAYLANDI', icon: <CheckCircle2 size={12}/>, cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    failed: { label: 'KRİTİK HATA', icon: <XCircle size={12}/>, cls: 'bg-rose-50 text-rose-600 border-rose-100' },
    generating: { label: 'İŞLENİYOR', icon: <Loader2 size={12} className="animate-spin"/>, cls: 'bg-amber-50 text-amber-600 border-amber-100' },
  };
  const c = config[status] || { label: status?.toUpperCase(), icon: null, cls: 'bg-slate-50 text-slate-500 border-slate-100' };
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-black tracking-[0.1em] ${c.cls}`}>
       {c.icon}
       {c.label}
    </div>
  );
}
