import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Scale, Copy, Download, Printer,
  CheckCircle2, XCircle, AlertTriangle, FileText,
  Shield, Sparkles, Calendar, Tag, ChevronRight,
  BookOpen, Star, Clock, Loader2, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchPetition, downloadPetitionPDF } from '../utils/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getScoreData(score) {
  if (score >= 80) return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Mükemmel', barColor: 'bg-emerald-500' };
  if (score >= 60) return { color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-200',  label: 'İyi',       barColor: 'bg-amber-500'  };
  return           { color: 'text-red-500',            bg: 'bg-red-50',     border: 'border-red-200',    label: 'Zayıf',     barColor: 'bg-red-500'    };
}

function formatLines(text) {
  if (!text) return [];
  return text.split('\n').map((line, i) => {
    const t = line.trim();
    if (!t) return { type: 'spacer', content: '', key: i };
    if (/^[A-ZÇĞİÖŞÜ\s]{4,}:?$/.test(t)) return { type: 'header',  content: t, key: i };
    if (/^\d+[\.\)]\s/.test(t))           return { type: 'numbered', content: t, key: i };
    return { type: 'para', content: t, key: i };
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PetitionView() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [petition, setPetition] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied]     = useState(false);
  const contentRef              = useRef();

  // ── Fetch petition from DB ──
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPetition(id);
        if (!data) { setNotFound(true); return; }
        setPetition(data);
      } catch (e) {
        console.error('Dilekçe yüklenemedi:', e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Actions ──
  const handleCopy = async () => {
    await navigator.clipboard.writeText(petition?.content || '');
    setCopied(true);
    toast.success('Dilekçe panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const el   = document.createElement('a');
    const blob = new Blob([petition?.content || ''], { type: 'text/plain;charset=utf-8' });
    el.href    = URL.createObjectURL(blob);
    el.download = `itiraz_dilekcesi_${(petition?.vehicle_plate || id).replace(/\s/g, '_')}.txt`;
    el.click();
    toast.success('Dilekçe TXT olarak indirildi!');
  };

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center font-inter">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold text-sm">Dilekçe yükleniyor...</p>
      </div>
    </div>
  );

  // ── Not found ──
  if (notFound) return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center font-inter px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-24 h-24 bg-white border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-dashboard">
          <FileText className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-primary mb-2">Dilekçe Bulunamadı</h2>
        <p className="text-slate-400 font-medium mb-8 max-w-sm mx-auto">
          Bu ID'ye ait dilekçe bulunamadı veya erişim yetkiniz yok.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20"
        >
          Dashboard'a Dön
        </button>
      </motion.div>
    </div>
  );

  const score = petition.quality_score || 0;
  const sd    = getScoreData(score);
  const lines = formatLines(petition.content);
  const petitionDate = petition.created_at
    ? new Date(petition.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const qualityChecks = [
    { label: 'KTK Madde Doğruluğu', weight: 30 },
    { label: 'Emsal Karar Uyumu',   weight: 25 },
    { label: 'Dilekçe Formatı',     weight: 20 },
    { label: 'Hukuki Tutarlılık',   weight: 15 },
    { label: 'Dil ve Üslup',        weight: 10 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-bg-main font-inter">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="w-px h-5 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-accent" />
              <span className="font-extrabold text-primary text-sm">
                CezaSavun<span className="text-accent">.ai</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-slate-300">
              <ChevronRight size={14} />
              <span className="text-xs font-bold text-slate-400">
                #{String(id).slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-primary transition-colors"
            >
              <AnimatePresence mode="wait">
                {copied
                  ? <motion.span key="ok"  initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" />Kopyalandı</motion.span>
                  : <motion.span key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5"><Copy size={15} />Kopyala</motion.span>
                }
              </AnimatePresence>
            </button>
            <button
              onClick={handleDownload}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-primary transition-colors"
            >
              <Download size={15} /> İndir (.txt)
            </button>
            <button
              onClick={async () => {
                try {
                  await downloadPetitionPDF(id);
                  toast.success('Dilekçe başarıyla indirildi!');
                } catch (e) { toast.error('İndirme hatası!'); }
              }}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-primary/20"
            >
              <Printer size={15} /> PDF Olarak İndir
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid xl:grid-cols-[1fr_360px] gap-8 items-start">

          {/* ═══ LEFT ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Status Banner */}
            <div className={`rounded-3xl p-5 border-2 ${sd.bg} ${sd.border} flex flex-wrap items-center gap-4`}>
              <div className={`w-[72px] h-[72px] rounded-2xl flex flex-col items-center justify-center border-2 ${sd.border} bg-white shrink-0`}>
                <span className={`text-2xl font-black ${sd.color}`}>{score}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">/ 100</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-extrabold ${sd.color} text-lg`}>{sd.label} Kalite Skoru</p>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {petition.status === 'approved'
                    ? '✅ AI kalite kontrolünden geçti'
                    : '⚠️ Manuel inceleme gerektirebilir'}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Sparkles size={14} className="text-accent" />
                <span className="text-xs font-bold text-slate-400">Gemini Flash · {petition.iteration_count} revizyon</span>
              </div>
            </div>

            {/* Meta Info — gerçek DB verisi */}
            <div className="glass-card rounded-3xl p-5 grid sm:grid-cols-3 gap-4">
              {[
                { icon: <User size={15} />,     label: 'Müvekkil',    value: petition.client_name   || '—' },
                { icon: <Tag size={15} />,      label: 'Plaka',       value: petition.vehicle_plate || '—' },
                { icon: <Calendar size={15} />, label: 'Oluşturuldu', value: petitionDate },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-accent shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="font-bold text-primary text-sm truncate">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Petition Text */}
            <div className="glass-card rounded-3xl overflow-hidden" ref={contentRef}>
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
                <h2 className="font-extrabold text-primary flex items-center gap-2 text-base">
                  <BookOpen size={18} className="text-accent" />
                  Dilekçe Metni
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                    {lines.filter(l => l.type !== 'spacer').length} satır
                  </span>
                  <button onClick={handleCopy} className="sm:hidden text-slate-400 hover:text-accent transition-colors p-1">
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="px-7 py-6 space-y-1 max-h-[65vh] overflow-y-auto scroll-smooth">
                {lines.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Dilekçe içeriği bulunamadı.</p>
                ) : lines.map((line) => {
                  if (line.type === 'spacer')
                    return <div key={line.key} className="h-2" />;
                  if (line.type === 'header')
                    return (
                      <p key={line.key} className="font-extrabold text-primary text-sm tracking-wide pt-5 pb-1 border-t border-slate-100 mt-4 first:border-t-0 first:pt-0">
                        {line.content}
                      </p>
                    );
                  if (line.type === 'numbered')
                    return (
                      <p key={line.key} className="text-slate-700 text-sm leading-relaxed font-semibold pl-4">
                        {line.content}
                      </p>
                    );
                  return (
                    <p key={line.key} className="text-slate-600 text-sm leading-relaxed">
                      {line.content}
                    </p>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5 sticky top-24"
          >
            {/* Quick Actions */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="font-extrabold text-primary text-xs uppercase tracking-widest mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                {[
                  { icon: <Copy size={16} />,    label: 'Metni Kopyala',   sub: 'Panoya kopyala',       onClick: handleCopy,                                     highlight: false },
                  { icon: <Download size={16} />, label: 'TXT İndir',       sub: 'Düz metin formatı',    onClick: handleDownload,                                  highlight: false },
                  { icon: <Printer size={16} />,  label: 'Yazdır / PDF',    sub: 'Resmi format indir', onClick: async () => {
                      try { await downloadPetitionPDF(id); toast.success('İndiriliyor...'); } 
                      catch(e) { toast.error('İndirme hatası!'); }
                    },       highlight: true  },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={action.onClick}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all group text-left border
                      ${action.highlight
                        ? 'bg-primary/5 hover:bg-primary/10 border-primary/20'
                        : 'bg-slate-50 hover:bg-accent/5 border-slate-100 hover:border-accent/30'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors
                      ${action.highlight
                        ? 'bg-primary text-white'
                        : 'bg-white border border-slate-100 text-slate-400 group-hover:text-accent group-hover:border-accent/30'}`}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primary">{action.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{action.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Breakdown */}
            <div className="glass-card rounded-3xl p-6">
              <h3 className="font-extrabold text-primary text-xs uppercase tracking-widest mb-5">Kalite Analizi</h3>
              <div className="space-y-4">
                {qualityChecks.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
                      <span className="text-[10px] font-extrabold text-slate-400">%{item.weight}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${sd.barColor}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Reminder */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-primary via-primary to-[#1e3a5f] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={16} className="text-accent" />
                  <span className="font-extrabold text-xs tracking-widest uppercase text-accent">Hukuki Hatırlatma</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  Trafik cezasına itiraz için <strong className="text-white">ceza tebliğ tarihinden itibaren 15 gün</strong> içinde
                  Sulh Ceza Hakimliği'ne başvurmanız gerekmektedir.
                </p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                  <Clock size={13} className="text-white/50" />
                  <span className="text-[11px] text-white/50 font-medium">5271 sayılı CMK Madde 267</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="glass-card rounded-3xl p-5 flex items-center gap-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star
                    key={s}
                    size={18}
                    className={s <= Math.round(score / 20) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                  />
                ))}
              </div>
              <div>
                <p className="text-xs font-extrabold text-primary">AI Kalite Değerlendirmesi</p>
                <p className="text-[11px] text-slate-400">Gemini Flash analizi</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </motion.div>
  );
}
