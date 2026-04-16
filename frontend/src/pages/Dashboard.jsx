import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, FileText, CheckCircle2,
  Download, Sparkles, History,
  Loader2, X, AlertCircle, Trash2,
  Filter, MoreHorizontal
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { generatePetition, apiFetch, downloadPetitionPDF } from '../utils/api';

// ─── Status helpers ───────────────────────────────────────────────────────────
function statusLabel(s) {
  if (s === 'approved') return { text: 'HAZIR', cls: 'status-ready' };
  if (s === 'generating') return { text: 'ANALİZDE', cls: 'status-processing' };
  return { text: 'BEKLEMEDE', cls: 'status-waiting' };
}

export default function Dashboard() {
  const { currentUser, petitions, filteredPetitions, loadData, loadingList, openNotifications } = useOutletContext();
  const navigate = useNavigate();

  // Upload flow
  const [step, setStep] = useState(1);
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [clientName, setClientName] = useState('');
  const [plate, setPlate] = useState('');
  const [lastPetitionId, setLastPetitionId] = useState(null);
  const [lastPetitionData, setLastPetitionData] = useState(null);
  const [logs, setLogs] = useState([]);

  // Deletion logic
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petitionToDelete, setPetitionToDelete] = useState(null);

  const fileInputRef = useRef();

  // ── Helpers ──
  const addLog = (message, type = 'info') => {
    setLogs(prev =>
      [{ id: Date.now(), message, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5)
    );
  };

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

  // ── File upload & generate ──
  const handleFile = async (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setStep(2);
    setIsProcessing(true);
    setAnalysisPhase(0);
    addLog(`${file.name} belgesi yüklendi, yapay zeka sırasına alınıyor...`, 'info');

    try {
      // 1. Backend'e gönderip, task'i tetikleyip anında petition_id dönüyoruz
      const data = await generatePetition(file, clientName);
      setLastPetitionId(data.petition_id);

      // 2. WebSocket Bağlantısını Kur
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/petition/${data.petition_id}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        addLog('AI Gerçek Zamanlı Sunucusuna bağlanıldı.', 'info');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.message) {
            addLog(payload.message, payload.status === 'failed' ? 'error' : 'info');
          }

          if (payload.phase !== undefined) {
            setAnalysisPhase(payload.phase);
          }

          if (payload.status === 'completed') {
            ws.close();
            setIsProcessing(false);
            setAnalysisPhase(4);
            setStep(3);
            addLog("Bütün AI işlemleri başarıyla tamamlandı.", "success");
            loadData(); // Yenile
            
            // Analiz bitişi "çan" animasyonu ve ses
            try { new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3").play(); } catch(e){}
            openNotifications();

          } else if (payload.status === 'failed') {
            ws.close();
            setIsProcessing(false);
            setStep(1);
            toast.error(payload.message || 'AI üretim aşamasında kritik hata.');
            loadData();
          }

        } catch (err) {
          console.error("WS Parse error", err);
        }
      };

      ws.onerror = (err) => {
        addLog('Sistem: WebSocket bağlantı kopukluğu', 'error');
        ws.close();
        // Hata durumunda state'i kurtar
        setIsProcessing(false);
        setStep(1);
      };

    } catch (e) {
      console.error('Generate hatası:', e);
      addLog(`Hata: ${e.message}`, 'error');
      toast.error(e.message || 'AI kuyruğuna eklenirken hata oluştu.');
      setIsProcessing(false);
      setStep(1);
    }
  };

  const handleDownloadRaw = async () => {
    if (!lastPetitionId) return;
    try {
      await downloadPetitionPDF(lastPetitionId);
      toast.success('Dilekçe başarıyla indirildi!');
    } catch (error) {
      toast.error(error.message || 'İndirme hatası.');
    }
  };

  // ── Auto-Reconnect for Background Tasks ──
  useEffect(() => {
    // Sayfa değiştirip/yenileyip Dashboard'a gelirsek ve arkada iş varsa WebSoket'i dirilt
    const activePetition = petitions.find(p => p.status === 'generating');
    if (activePetition && !isProcessing && step === 1) {
      setStep(2);
      setIsProcessing(true);
      setLastPetitionId(activePetition.id);
      addLog(`(Devam Ediyor) AI analizi sürüyor... ID: #${String(activePetition.id).slice(0,4)}`, 'info');
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/petition/${activePetition.id}`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.message) addLog(payload.message, payload.status === 'failed' ? 'error' : 'info');
          if (payload.phase !== undefined) setAnalysisPhase(payload.phase);
          
          if (payload.status === 'completed') {
            ws.close();
            setIsProcessing(false);
            setAnalysisPhase(4);
            setStep(3);
            addLog("Bütün AI işlemleri başarıyla tamamlandı.", "success");
            loadData(); 
            try { new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3").play(); } catch(e){}
            openNotifications();
          } else if (payload.status === 'failed') {
            ws.close();
            setIsProcessing(false);
            setStep(1);
            toast.error(payload.message || 'AI hata verdi.');
            loadData();
          }
        } catch (err) {}
      };
      
      ws.onerror = () => ws.close();
      return () => ws.close();
    }
  }, [petitions, isProcessing, step, loadData, openNotifications]);

  const resetForm = () => {
    setStep(1);
    setLastPetitionId(null);
    setLastPetitionData(null);
    setUploadedFileName('');
    setClientName('');
    setPlate('');
    setAnalysisPhase(0);
  };

  // Stats from context data
  const totalPetitions = petitions.length;
  const approvedCount = petitions.filter(p => p.status === 'approved').length;
  const successRate = totalPetitions > 0 ? Math.round((approvedCount / totalPetitions) * 100) : 0;
  const avgScore = totalPetitions > 0
    ? Math.round(petitions.reduce((s, p) => s + (p.quality_score || 0), 0) / totalPetitions)
    : 0;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ═══ 1. MAIN CONTENT ═══ */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="TOPLAM DİLEKÇE" value={String(totalPetitions)} sub="Tüm zamanlar" loading={loadingList} />
          <StatCard label="ONAYLANAN DİLEKÇE" value={String(approvedCount)} sub="Bu hesap" loading={loadingList} />
          <StatCard label="BAŞARI ORANI" value={`%${successRate}`} sub="Ortalama" loading={loadingList} />
          <StatCard label="ORTALAMA SKOR" value={String(avgScore || '—')} sub="Kalite" loading={loadingList} />
        </section>

        {/* RECENT ACTIVITY TABLE */}
        <section className="glass-card rounded-[32px] overflow-hidden bg-white shadow-xl shadow-slate-200/50">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-lg text-primary tracking-tight">Son Dilekçeler</h2>
            <button
              onClick={() => navigate('/petitions')}
              className="text-xs font-black text-accent hover:underline uppercase tracking-widest"
            >
              Tümünü Gör
            </button>
          </div>

          <div className="overflow-x-auto">
            {loadingList ? (
              <div className="py-20 flex justify-center text-slate-400"><Loader2 className="animate-spin" /></div>
            ) : petitions.length === 0 ? (
              <div className="py-20 text-center"><p className="font-bold text-slate-300">Henüz dilekçe yok</p></div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-4">ID</th>
                    <th className="px-4 py-4">MÜVEKKİL / PLAKA</th>
                    <th className="px-4 py-4">DURUM</th>
                    <th className="px-8 py-4 text-center">İŞLEMLER</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredPetitions.slice(0, 5).map(p => (
                    <PetitionRow
                      key={p.id}
                      petition={p}
                      onView={() => navigate(`/petition/${p.id}`)}
                      onDelete={() => { setPetitionToDelete(p.id); setIsDeleteModalOpen(true); }}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* BOTTOM WIDGETS */}
        <div className="grid lg:grid-cols-2 gap-8 pb-8">
          <section className="glass-card rounded-[32px] p-8 bg-white shadow-lg">
            <h3 className="font-extrabold text-primary mb-6 flex items-center gap-2">AI Analiz Akışı <Sparkles size={16} className="text-accent animate-pulse" /></h3>
            <div className="space-y-4">
              {logs.length > 0 ? logs.map(log => <LogItem key={log.id} log={log} />) : <div className="py-10 text-center text-slate-300 text-xs font-bold uppercase tracking-widest leading-loose">Sistem Hazır.<br />Belge Yüklenmesi Bekleniyor.</div>}
            </div>
          </section>

          <section className="glass-card rounded-[32px] p-8 bg-white shadow-lg text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-black text-primary mb-2 tracking-tight">Hesap Durumu</h3>
            <p className="text-slate-400 text-sm font-medium mb-6">Hesabınız tüm hukuki araçlara tam erişim hakkına sahiptir.</p>
            <button
              onClick={() => navigate('/profile')}
              className="px-8 py-3 bg-slate-100 text-primary rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-200"
            >
              Bilgileri Düzenle
            </button>
          </section>
        </div>
      </main>

      {/* ═══ 2. RIGHT PANEL (Desktop Assistant) ═══ */}
      <aside className="hidden xl:flex w-[380px] bg-white border-l border-slate-200 flex-col shrink-0 p-8 shadow-2xl relative z-40">
        <NewPetitionPanel
          isProcessing={isProcessing}
          step={step}
          analysisPhase={analysisPhase}
          uploadedFileName={uploadedFileName}
          clientName={clientName}
          setClientName={setClientName}
          plate={plate}
          setPlate={setPlate}
          handleFile={handleFile}
          fileInputRef={fileInputRef}
          lastPetitionId={lastPetitionId}
          lastPetitionData={lastPetitionData}
          handleDownloadRaw={handleDownloadRaw}
          resetForm={resetForm}
          navigate={navigate}
        />
      </aside>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6"><Trash2 size={40} /></div>
                <h3 className="text-2xl font-black text-primary mb-2">Emin misiniz?</h3>
                <p className="text-slate-500 font-medium mb-8">Bu dilekçe kalıcı olarak silinecektir.</p>
                <div className="flex gap-4 w-full">
                  <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Vazgeç</button>
                  <button onClick={() => handleDelete(petitionToDelete)} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold">Sil</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── LOCAL UI COMPONENTS ───────────────────────────────────────────────────

function StatCard({ label, value, sub, loading }) {
  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform`} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">{label}</p>
      {loading ? <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg" /> : (
        <div className="flex items-baseline gap-2 relative z-10">
          <h4 className="text-3xl font-black text-primary tracking-tighter">{value}</h4>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
        </div>
      )}
    </div>
  );
}

function PetitionRow({ petition, onView, onDelete }) {
  const { text, cls } = statusLabel(petition.status);
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-5 font-black text-slate-300 group-hover:text-primary transition-colors text-xs">#{petition.id.slice(0, 4).toUpperCase()}</td>
      <td className="px-4 py-5 font-black text-primary text-sm">{petition.client_name || '—'} <span className="text-[10px] text-slate-400 ml-2">{petition.vehicle_plate}</span></td>
      <td className="px-4 py-5"><span className={`status-badge ${cls}`}>{text}</span></td>
      <td className="px-8 py-5 text-center">
        <button onClick={onView} className="text-accent font-black text-xs uppercase tracking-widest hover:underline">DETAY</button>
      </td>
    </tr>
  );
}

function NewPetitionPanel({
  isProcessing, step, analysisPhase, uploadedFileName,
  clientName, setClientName, handleFile, fileInputRef,
  lastPetitionId, lastPetitionData, handleDownloadRaw,
  resetForm, navigate
}) {
  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent"><Sparkles size={18} fill="currentColor" /></div>
        <h3 className="font-black text-primary uppercase text-sm tracking-widest">YENİ DİLEKÇE</h3>
      </div>

      <div className="flex justify-between items-center px-4 relative">
        <div className="absolute top-[18px] left-0 w-full h-0.5 bg-slate-100 -z-10" />
        <StepNode num={1} active={step >= 1} current={step === 1} />
        <StepNode num={2} active={step >= 2} current={step === 2} />
        <StepNode num={3} active={step >= 3} current={step === 3} />
      </div>

      <div
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer relative overflow-hidden group
          ${isProcessing ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-accent hover:bg-slate-50'}`}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} className="hidden" onChange={e => handleFile(e.target.files[0])} />
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
            {isProcessing ? <Loader2 className="animate-spin text-accent" /> : <UploadCloud className="text-slate-400 group-hover:text-accent" />}
          </div>
          <p className="font-black text-sm text-primary mb-1">{uploadedFileName || 'Dosya Yükleyin'}</p>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{isProcessing ? `AŞAMA ${analysisPhase + 1}/5` : 'PDF VEYA GÖRSEL'}</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">MÜVEKKİL ADI</label>
          <input
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="İsim Soyisim..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-5 text-sm font-bold outline-none focus:border-accent"
            disabled={isProcessing}
          />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-50">
        {step === 3 ? (
          <div className="space-y-3">
            <button onClick={() => navigate(`/petition/${lastPetitionId}`)} className="w-full bg-accent text-primary font-black py-4 rounded-2xl shadow-lg shadow-accent/20">Dilekçeyi Gör</button>
            <button onClick={resetForm} className="w-full py-3 text-xs font-black text-slate-400 hover:text-primary transition-all">Yeni Oluştur</button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isProcessing ? 'İşleniyor...' : 'Analizi Başlat'}
          </button>
        )}
      </div>
    </div>
  );
}

function StepNode({ num, active, current }) {
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all border-2
      ${current ? 'bg-primary text-white border-primary scale-110 shadow-lg' : active ? 'bg-primary text-white border-primary' : 'bg-white text-slate-200 border-slate-100'}`}>
      {num}
    </div>
  );
}

function LogItem({ log }) {
  const isS = log.type === 'success';
  const isE = log.type === 'error';
  return (
    <div className="flex gap-4 items-center">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100
        ${isS ? 'bg-emerald-50 text-emerald-500' : isE ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-sky-500'}`}>
        <Sparkles size={14} />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-700 leading-tight mb-0.5">{log.message}</p>
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{log.time}</span>
      </div>
    </div>
  );
}
