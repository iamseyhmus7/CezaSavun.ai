import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Scale, Copy, Download, Printer,
  CheckCircle2, XCircle, AlertTriangle, FileText,
  Shield, Sparkles, Calendar, Tag, ChevronRight,
  BookOpen, Star, Clock, Loader2, User, Edit3, Save, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchPetition, downloadPetitionPDF, updatePetitionContent } from '../utils/api';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving]     = useState(false);
  const contentRef              = useRef();
  const textareaRef             = useRef();

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-bg-main font-inter pb-12">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
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
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-primary transition-colors"
            >
              <AnimatePresence mode="wait">
                {copied
                  ? <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" />Kopyalandı</motion.span>
                  : <motion.span key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1.5"><Copy size={15} />Kopyala</motion.span>
                }
              </AnimatePresence>
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
              <Printer size={15} /> PDF İndir
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid xl:grid-cols-[1fr_560px] gap-8 items-start">

          {/* ═══ LEFT: PETITION ═══ */}
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`rounded-3xl p-6 border-2 ${sd.bg} ${sd.border} flex items-center justify-between shadow-sm overflow-hidden relative`}>
              <div className="relative z-10 flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 ${sd.border} bg-white shadow-sm`}>
                  <span className={`text-2xl font-black ${sd.color}`}>{score}</span>
                  <span className="text-[10px] font-bold text-slate-400">SKOR</span>
                </div>
                <div>
                  <h1 className="text-xl font-black text-primary mb-1">Dilekçeniz Hazır!</h1>
                  <p className="text-sm text-slate-500 font-medium max-w-sm">
                    {petition.status === 'approved' 
                      ? 'AI Uzmanımız tarafından onaylanan yüksek kaliteli bir dilekçe üretildi.' 
                      : 'Kalite kontrol aşamasında bazı uyarılar alındı, lütfen inceleyin.'}
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="flex flex-col items-end gap-1">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm">
                      <Clock size={14} className="text-amber-500" />
                      <span className="text-xs font-bold text-slate-500">{petitionDate}</span>
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 rounded-full shadow-sm mt-2">
                      <Tag size={13} className="text-accent" />
                      <span className="text-xs font-bold text-slate-500 tracking-wider font-mono">{petition.vehicle_plate || 'PLAKA BELİRSİZ'}</span>
                   </div>
                </div>
              </div>
              <Sparkles className="absolute right-0 top-0 text-accent/10 w-32 h-32 -mr-8 -mt-8" />
            </div>

            {/* Content Card */}
            <div className="glass-card rounded-[32px] overflow-hidden shadow-dashboard">
              <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                    <FileText size={20} />
                  </div>
                  <h3 className="font-extrabold text-primary">
                    {isEditing ? 'Dilekçeyi Düzenle' : 'İtiraz Dilekçesi'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); setEditContent(''); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-500 transition-colors"
                      >
                        <X size={16} /> İptal
                      </button>
                      <button
                        onClick={async () => {
                          setSaving(true);
                          try {
                            await updatePetitionContent(id, editContent);
                            setPetition({ ...petition, content: editContent });
                            setIsEditing(false);
                            toast.success('Dilekçe başarıyla güncellendi!');
                          } catch (e) {
                            toast.error(e.message);
                          } finally { setSaving(false); }
                        }}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditContent(petition.content || ''); setIsEditing(true); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-accent/10 hover:bg-accent/20 rounded-xl text-sm font-bold text-accent transition-colors"
                      >
                        <Edit3 size={16} /> Düzenle
                      </button>
                      <button onClick={handleDownload} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                        <Download size={18} />
                      </button>
                      <button onClick={handleCopy} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                        <Copy size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-10 bg-white" ref={contentRef}>
                {isEditing ? (
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[500px] p-6 text-sm text-slate-700 leading-relaxed border-2 border-accent/20 rounded-2xl focus:border-accent focus:ring-2 focus:ring-accent/10 outline-none resize-y font-mono bg-slate-50/50 transition-colors"
                    placeholder="Dilekçe metnini buraya yazın..."
                  />
                ) : (
                  <div className="max-w-4xl mx-auto space-y-2">
                    {lines.map((line) => {
                      if (line.type === 'spacer') return <div key={line.key} className="h-4" />;
                      if (line.type === 'header') return <p key={line.key} className="font-black text-primary text-lg uppercase tracking-tight py-4 first:pt-0">{line.content}</p>;
                      if (line.type === 'numbered') return <p key={line.key} className="text-slate-700 text-base font-bold leading-relaxed pl-4 mb-2">{line.content}</p>;
                      return <p key={line.key} className="text-slate-600 text-base leading-relaxed mb-1">{line.content}</p>;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT: LEGAL REFERENCES (RAG) ═══ */}
          <aside className="space-y-6 sticky top-24">
            <div className="glass-card rounded-[32px] p-8 border-accent/20 border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                   <Shield size={24} />
                </div>
                <div>
                   <h3 className="font-extrabold text-xl text-primary leading-tight">Hukuki Dayanaklar</h3>
                   <p className="text-sm uppercase font-bold text-slate-400 tracking-widest mt-0.5">Yapay Zeka Savunma Stratejisi</p>
                </div>
              </div>

              {/* RAG References List */}
              <div className="space-y-4">
                {(!petition.rag_references || petition.rag_references.length === 0) ? (
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <BookOpen size={24} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-xs font-bold text-slate-400">Bu dilekçe için spesifik mevzuat verisi bulunamadı.</p>
                   </div>
                ) : (
                  petition.rag_references.map((item, idx) => (
                    <motion.div 
                       key={idx}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.3 + idx * 0.1 }}
                       className="group p-5 rounded-2xl bg-white border border-slate-100 hover:border-accent/40 hover:shadow-lg transition-all cursor-default"
                    >
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-accent/5 text-accent text-sm font-black rounded-lg uppercase">
                             {item.madde_no || 'MADDE BILGISI'}
                          </span>
                          <Star size={16} className="text-amber-400 fill-amber-400" />
                       </div>
                       <p className="text-base font-bold text-primary mb-3 line-clamp-2">
                          {item.ozet || 'Mevzuat özeti yüklenemedi.'}
                       </p>
                       <div className="pt-4 border-t border-slate-50 space-y-3">
                          <p className="text-sm font-black text-slate-400 uppercase tracking-tighter">Uzman İtiraz Argümanı:</p>
                          <div className="flex flex-wrap gap-2">
                             {(item.itiraz_argumanlari || []).slice(0, 2).map((arg, i) => (
                               <span key={i} className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                  {arg}
                               </span>
                             ))}
                          </div>
                          <p className="text-sm text-accent font-black mt-3 flex items-center gap-1.5">
                             <ChevronRight size={16} /> EMSAL: {item.ilgili_emsal || 'Görüntüle'}
                          </p>
                       </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-slate-100">
                 <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold text-primary">Argüman Gücü</span>
                    <span className="text-xs font-black text-emerald-500">Kuvvetli</span>
                 </div>
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${score}%` }}
                       className={`h-full ${sd.barColor}`}
                    />
                 </div>
                 <p className="text-[10px] text-slate-400 mt-4 leading-relaxed italic">
                    * Bu dilekçe 2918 sayılı KTK ve ilgili yönetmeliklere tam uyumlu olarak, semantik arama motorumuz tarafından en alakalı emsal kararlar taranarak üretilmiştir.
                 </p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </motion.div>
  );
}
