import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud, FileText, CheckCircle2,
  Download, Sparkles, History,
  Loader2, X, AlertCircle, Trash2,
  Clock, TrendingUp, BarChart3, ArrowRight, Calendar
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { generatePetition, apiFetch, downloadPetitionPDF } from '../utils/api';

function statusLabel(s) {
  if (s === 'approved') return { text: 'Hazır', cls: 'status-ready' };
  if (s === 'generating') return { text: 'Analizde', cls: 'status-processing' };
  return { text: 'Beklemede', cls: 'status-waiting' };
}

export default function Dashboard() {
  const { currentUser, petitions, filteredPetitions, loadData, loadingList, openNotifications } = useOutletContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [clientName, setClientName] = useState('');
  const [plate, setPlate] = useState('');
  const [lastPetitionId, setLastPetitionId] = useState(null);
  const [lastPetitionData, setLastPetitionData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petitionToDelete, setPetitionToDelete] = useState(null);
  const fileInputRef = useRef();

  const addLog = (message, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), message, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiFetch(`/petitions/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Dilekçe silindi'); loadData(); setIsDeleteModalOpen(false); setPetitionToDelete(null); }
      else { const err = await res.json(); toast.error(err.detail || 'Silme başarısız'); }
    } catch (e) { toast.error('Bağlantı hatası'); }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setStep(2); setIsProcessing(true); setAnalysisPhase(0);
    addLog(`${file.name} yüklendi, AI kuyruğuna ekleniyor…`, 'info');
    try {
      const data = await generatePetition(file, clientName);
      setLastPetitionId(data.petition_id);
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/ws/petition/${data.petition_id}`);
      ws.onopen = () => addLog('AI sunucusuna bağlanıldı.', 'info');
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.message) addLog(payload.message, payload.status === 'failed' ? 'error' : 'info');
          if (payload.phase !== undefined) setAnalysisPhase(payload.phase);
          if (payload.status === 'completed') {
            ws.close(); setIsProcessing(false); setAnalysisPhase(4); setStep(3);
            addLog("AI işlemleri tamamlandı.", "success"); loadData();
            try { new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3").play(); } catch(e){}
            openNotifications();
          } else if (payload.status === 'failed') {
            ws.close(); setIsProcessing(false); setStep(1);
            toast.error(payload.message || 'AI hata verdi.'); loadData();
          }
        } catch (err) {}
      };
      ws.onerror = () => { addLog('WebSocket bağlantı hatası', 'error'); ws.close(); setIsProcessing(false); setStep(1); };
    } catch (e) {
      addLog(`Hata: ${e.message}`, 'error'); toast.error(e.message || 'Hata oluştu.'); setIsProcessing(false); setStep(1);
    }
  };

  const handleDownloadRaw = async () => {
    if (!lastPetitionId) return;
    try { await downloadPetitionPDF(lastPetitionId); toast.success('İndirildi!'); } catch (error) { toast.error(error.message || 'İndirme hatası.'); }
  };

  useEffect(() => {
    const activePetition = petitions.find(p => p.status === 'generating');
    if (activePetition && !isProcessing && step === 1) {
      setStep(2); setIsProcessing(true); setLastPetitionId(activePetition.id);
      addLog(`AI analizi sürüyor… ID: #${String(activePetition.id).slice(0,4)}`, 'info');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/ws/petition/${activePetition.id}`);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.message) addLog(payload.message, payload.status === 'failed' ? 'error' : 'info');
          if (payload.phase !== undefined) setAnalysisPhase(payload.phase);
          if (payload.status === 'completed') { ws.close(); setIsProcessing(false); setAnalysisPhase(4); setStep(3); addLog("Tamamlandı.", "success"); loadData(); try { new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3").play(); } catch(e){} openNotifications(); }
          else if (payload.status === 'failed') { ws.close(); setIsProcessing(false); setStep(1); toast.error(payload.message || 'Hata.'); loadData(); }
        } catch (err) {}
      };
      ws.onerror = () => ws.close();
      return () => ws.close();
    }
  }, [petitions, isProcessing, step, loadData, openNotifications]);

  const resetForm = () => { setStep(1); setLastPetitionId(null); setLastPetitionData(null); setUploadedFileName(''); setClientName(''); setPlate(''); setAnalysisPhase(0); };

  const totalPetitions = petitions.length;
  const approvedCount = petitions.filter(p => p.status === 'approved').length;
  const successRate = totalPetitions > 0 ? Math.round((approvedCount / totalPetitions) * 100) : 0;
  const avgScore = totalPetitions > 0 ? Math.round(petitions.reduce((s, p) => s + (p.quality_score || 0), 0) / totalPetitions) : 0;

  const deadlines = (petitions || []).filter(p => p.created_at).map(p => {
    const created = new Date(p.created_at); const dl = new Date(created); dl.setDate(created.getDate() + 15);
    return { ...p, deadline: dl };
  }).filter(p => !isNaN(p.deadline.getTime())).sort((a,b) => a.deadline - b.deadline);
  const urgentDeadlines = deadlines.filter(d => { const diff = (d.deadline - new Date()) / (1000*60*60*24); return diff >= 0 && diff <= 7; }).slice(0, 3);

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">

        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Hoş geldiniz{currentUser ? `, ${currentUser.name}` : ''} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">İşte güncel durumunuz.</p>
          </div>
          <button onClick={() => navigate('/upload')} className="btn-primary hidden sm:flex items-center gap-2">
            <UploadCloud size={18} /> Ceza Yükle
          </button>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FileText size={20}/>} label="Toplam Dilekçe" value={totalPetitions} color="blue" loading={loadingList} />
          <StatCard icon={<CheckCircle2 size={20}/>} label="Onaylanan" value={approvedCount} color="emerald" loading={loadingList} />
          <StatCard icon={<TrendingUp size={20}/>} label="Başarı Oranı" value={`%${successRate}`} color="violet" loading={loadingList} />
          <StatCard icon={<BarChart3 size={20}/>} label="Ort. Skor" value={avgScore || '—'} color="amber" loading={loadingList} />
        </section>

        {/* Middle row: Success donut + Urgent deadlines */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-accent" /> Başarı Dağılımı
            </h3>
            <div className="flex items-center gap-6">
              <MiniDonut approved={approvedCount} total={totalPetitions} />
              <div className="space-y-3">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"/><span className="text-xs text-slate-500">Onaylanan: <b className="text-primary">{approvedCount}</b></span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200"/><span className="text-xs text-slate-500">Diğer: <b className="text-primary">{totalPetitions - approvedCount}</b></span></div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <Clock size={16} className="text-warning" /> Yaklaşan Süreler
            </h3>
            {urgentDeadlines.length > 0 ? (
              <div className="space-y-3">
                {urgentDeadlines.map((d, i) => {
                  const diff = Math.ceil((d.deadline - new Date()) / (1000*60*60*24));
                  return (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${diff <= 3 ? 'bg-danger-light text-danger' : 'bg-warning-light text-warning'}`}>
                        {diff}g
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">{d.client_name || 'İsimsiz'}</p>
                        <p className="text-[11px] text-slate-400">{d.vehicle_plate} · {d.deadline.toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center"><p className="text-sm text-slate-300">Yaklaşan süre yok</p></div>
            )}
          </div>
        </div>

        {/* Recent Petitions Table */}
        <section className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-primary">Son Dilekçeler</h2>
            <button onClick={() => navigate('/petitions')} className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
              Tümünü Gör <ArrowRight size={14}/>
            </button>
          </div>
          <div className="overflow-x-auto">
            {loadingList ? (
              <div className="py-16 flex justify-center text-slate-400"><Loader2 className="animate-spin" /></div>
            ) : petitions.length === 0 ? (
              <div className="py-16 text-center"><p className="text-sm text-slate-400">Henüz dilekçe yok</p></div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3">ID</th><th className="px-4 py-3">Müvekkil / Plaka</th><th className="px-4 py-3">Durum</th><th className="px-6 py-3 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredPetitions.slice(0, 5).map(p => {
                    const { text, cls } = statusLabel(p.status);
                    return (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-xs font-medium text-slate-400 group-hover:text-primary">#{p.id.slice(0,6).toUpperCase()}</td>
                        <td className="px-4 py-4"><span className="font-semibold text-primary">{p.client_name || '—'}</span> <span className="text-xs text-slate-400 ml-1">{p.vehicle_plate}</span></td>
                        <td className="px-4 py-4"><span className={`status-badge ${cls}`}>{text}</span></td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => navigate(`/petition/${p.id}`)} className="text-accent font-semibold text-xs hover:underline">Detay</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* AI Log Widget */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-accent" /> AI Analiz Akışı
          </h3>
          <div className="space-y-3">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.type === 'success' ? 'bg-success' : log.type === 'error' ? 'bg-danger' : 'bg-accent'}`} />
                <div>
                  <p className="text-sm text-slate-600">{log.message}</p>
                  <span className="text-[11px] text-slate-300">{log.time}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-300 text-center py-6">Sistem hazır. Belge yüklenmesi bekleniyor.</p>
            )}
          </div>
        </div>
      </main>

      {/* Right Panel */}
      <aside className="hidden xl:flex w-[480px] bg-slate-50/50 border-l border-slate-200 flex-col shrink-0 p-8 overflow-y-auto">
        <NewPetitionPanel
          isProcessing={isProcessing} step={step} analysisPhase={analysisPhase}
          uploadedFileName={uploadedFileName} clientName={clientName} setClientName={setClientName}
          handleFile={handleFile} fileInputRef={fileInputRef} lastPetitionId={lastPetitionId}
          handleDownloadRaw={handleDownloadRaw} resetForm={resetForm} navigate={navigate}
        />
      </aside>

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

// ─── Components ────────────────────────────────────────────
function StatCard({ icon, label, value, color, loading }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', violet: 'bg-violet-50 text-violet-600', amber: 'bg-amber-50 text-amber-600' };
  return (
    <div className="glass-card p-5 group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
      {loading ? <div className="skeleton h-8 w-16"/> : <p className="text-2xl font-bold text-primary tracking-tight">{value}</p>}
    </div>
  );
}

function MiniDonut({ approved, total }) {
  const pct = total > 0 ? (approved / total) * 100 : 0;
  const r = 40, c = 2 * Math.PI * r;
  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#059669" strokeWidth="10" strokeDasharray={`${(pct/100)*c} ${c}`} strokeLinecap="round" className="transition-all duration-1000"/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-primary">%{Math.round(pct)}</span>
      </div>
    </div>
  );
}

function NewPetitionPanel({ isProcessing, step, analysisPhase, uploadedFileName, clientName, setClientName, handleFile, fileInputRef, lastPetitionId, handleDownloadRaw, resetForm, navigate }) {
  const phases = ['OCR Tarama', 'Delil Analizi', 'Emsal Arama', 'Dilekçe Yazımı', 'Kalite Kontrol'];
  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white shadow-lg shadow-accent/20">
          <Sparkles size={24}/>
        </div>
        <div>
          <h3 className="font-black text-primary text-base">Yeni Dilekçe Oluştur</h3>
          <p className="text-xs font-medium text-slate-400">Yapay zeka asistanı ile otomatik süreç</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 px-2">
        {[1,2,3].map(n => (
          <React.Fragment key={n}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${step >= n ? 'bg-accent text-white shadow-md shadow-accent/20 scale-110' : 'bg-white border border-slate-200 text-slate-400'}`}>
              {step > n ? <CheckCircle2 size={18}/> : n}
            </div>
            {n < 3 && <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step > n ? 'bg-accent' : 'bg-slate-200'}`}/>}
          </React.Fragment>
        ))}
      </div>

      {/* AI Progress */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="space-y-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Analiz Süreci</h4>
            {phases.map((ph, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 ${analysisPhase > i ? 'bg-success text-white' : analysisPhase === i ? 'bg-accent text-white animate-pulse shadow-lg shadow-accent/30' : 'bg-slate-100 text-slate-300'}`}>
                  {analysisPhase > i ? '✓' : i+1}
                </div>
                <span className={`text-sm font-medium ${analysisPhase >= i ? 'text-primary' : 'text-slate-400'}`}>{ph}</span>
                {analysisPhase === i && <Loader2 size={14} className="animate-spin text-accent ml-auto"/>}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropzone */}
      <div
        className={`dropzone min-h-[220px] flex flex-col items-center justify-center relative border-2 border-dashed rounded-3xl transition-all duration-500 ${isProcessing ? 'border-accent bg-accent/5 opacity-50 cursor-not-allowed' : 'border-slate-300 hover:border-accent hover:bg-white bg-slate-50/50 cursor-pointer shadow-sm hover:shadow-md'}`}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input type="file" ref={fileInputRef} className="hidden" onChange={e => handleFile(e.target.files[0])} />
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${isProcessing ? 'bg-white shadow-lg' : 'bg-white shadow-sm group-hover:scale-110'}`}>
            {isProcessing ? <Loader2 className="animate-spin text-accent" size={32}/> : <UploadCloud className="text-accent" size={32}/>}
          </div>
          <p className="text-base font-bold text-primary mb-1">{uploadedFileName || 'Ceza Tutanağını Yükleyin'}</p>
          <p className="text-sm font-medium text-slate-400">{isProcessing ? `Aşama ${analysisPhase+1}/5` : 'Sürükleyip bırakın veya tıklayın'}</p>
        </div>
      </div>

      {/* Client name */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <label className="form-label text-[11px] mb-2">Müvekkil Adı (Opsiyonel)</label>
        <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="İsim Soyisim…" className="form-input bg-slate-50/50 border-slate-200" disabled={isProcessing}/>
      </div>

      {/* Action */}
      <div className="mt-auto pt-6 border-t border-slate-200">
        {step === 3 ? (
          <div className="space-y-3">
            <button onClick={() => navigate(`/petition/${lastPetitionId}`)} className="w-full btn-primary py-4 text-base shadow-lg shadow-accent/20">Dilekçeyi Görüntüle</button>
            <button onClick={resetForm} className="w-full btn-secondary py-3 text-sm">Yeni Dilekçe Oluştur</button>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} disabled={isProcessing} className="w-full btn-primary py-4 text-base shadow-lg shadow-accent/20 disabled:opacity-50 disabled:shadow-none transition-all">
            {isProcessing ? 'Yapay Zeka Analiz Ediyor…' : 'Hemen Analize Başla'}
          </button>
        )}
      </div>
    </div>
  );
}