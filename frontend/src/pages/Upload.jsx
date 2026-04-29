import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, Loader2, Sparkles, CheckCircle2, Image, X, ArrowRight } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { generatePetition } from '../utils/api';

const PHASES = ['OCR Tarama', 'Delil Analizi', 'Emsal Karar Arama', 'Dilekçe Yazımı', 'Kalite Kontrol'];

export default function Upload() {
  const { loadData, openNotifications } = useOutletContext();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [clientName, setClientName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState(-1);
  const [petitionId, setPetitionId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (msg, type = 'info') => setLogs(p => [{ id: Date.now(), msg, type, time: new Date().toLocaleTimeString() }, ...p].slice(0, 8));

  const handleFileSelect = useCallback((f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        handleFileSelect(item.getAsFile());
        break;
      }
    }
  }, [handleFileSelect]);

  const handleSubmit = async () => {
    if (!file) { toast.error('Lütfen bir dosya yükleyin'); return; }
    setIsProcessing(true); setPhase(0);
    addLog(`${file.name} yüklendi, AI analizi başlatılıyor…`);

    try {
      const data = await generatePetition(file, clientName);
      setPetitionId(data.petition_id);

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/ws/petition/${data.petition_id}`);

      ws.onopen = () => addLog('AI sunucusuna bağlanıldı.', 'info');
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.message) addLog(payload.message, payload.status === 'failed' ? 'error' : 'info');
          if (payload.phase !== undefined) setPhase(payload.phase);
          if (payload.status === 'completed') {
            ws.close(); setIsProcessing(false); setPhase(5);
            addLog('Tüm AI işlemleri tamamlandı!', 'success');
            loadData();
            try { new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3").play(); } catch(e){}
            openNotifications();
          } else if (payload.status === 'failed') {
            ws.close(); setIsProcessing(false); setPhase(-1);
            toast.error(payload.message || 'AI hata verdi.'); loadData();
          }
        } catch (err) {}
      };
      ws.onerror = () => { ws.close(); setIsProcessing(false); setPhase(-1); addLog('Bağlantı hatası', 'error'); };
    } catch (e) {
      addLog(`Hata: ${e.message}`, 'error');
      toast.error(e.message || 'Hata oluştu.');
      setIsProcessing(false); setPhase(-1);
    }
  };

  const isComplete = phase === 5;

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8" onPaste={handlePaste}>
      <header>
        <h2 className="text-3xl font-black text-primary">Ceza Yükleme & OCR</h2>
        <p className="text-base text-slate-400 mt-2">Trafik cezası tutanağını sürükleyin veya yapıştırın, yapay zeka saniyeler içinde analiz etsin.</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Upload area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => !isProcessing && !file && fileInputRef.current?.click()}
            className={`dropzone min-h-[400px] flex flex-col items-center justify-center relative border-3 border-dashed rounded-[32px] transition-all duration-500 ease-out ${isDragOver ? 'dropzone-active border-accent bg-accent/5 scale-[1.02] shadow-2xl shadow-accent/20' : 'border-slate-200 hover:border-accent/50 hover:bg-slate-50'} ${file ? 'border-accent bg-accent/5' : ''}`}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={e => handleFileSelect(e.target.files[0])} />

            {file ? (
              <div className="text-center">
                {preview ? (
                  <img src={preview} alt="Önizleme" className="max-h-40 rounded-xl mx-auto mb-4 shadow-md" />
                ) : (
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-accent" />
                  </div>
                )}
                <p className="text-sm font-semibold text-primary">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
                {!isProcessing && (
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="mt-3 text-xs text-slate-400 hover:text-danger flex items-center gap-1 mx-auto">
                    <X size={12}/> Kaldır
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UploadCloud size={28} className="text-slate-400" />
                </div>
                <p className="font-semibold text-primary mb-1">Dosya sürükleyin veya tıklayın</p>
                <p className="text-xs text-slate-400">PDF, JPG veya PNG · Maks. 10MB</p>
                <p className="text-[11px] text-slate-300 mt-2">Ctrl+V ile yapıştırabilirsiniz</p>
              </div>
            )}
          </div>

          {/* Client name */}
          <div>
            <label className="form-label">Müvekkil Adı (opsiyonel)</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="İsim Soyisim…" className="form-input" disabled={isProcessing} />
          </div>

          {/* Submit */}
          {isComplete ? (
            <div className="flex gap-3">
              <button onClick={() => navigate(`/petition/${petitionId}`)} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                Dilekçeyi Gör <ArrowRight size={16}/>
              </button>
              <button onClick={() => { setFile(null); setPreview(null); setPhase(-1); setPetitionId(null); setLogs([]); }}
                className="btn-secondary py-3">Yeni Yükle</button>
            </div>
          ) : (
            <button onClick={handleSubmit} disabled={!file || isProcessing} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {isProcessing ? <><Loader2 size={16} className="animate-spin"/> İşleniyor…</> : <><Sparkles size={16}/> AI Analizi Başlat</>}
            </button>
          )}
        </div>

        {/* Right: Progress + Logs */}
        <div className="md:col-span-2 space-y-4">
          {/* AI Progress Stepper */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-accent"/> AI Analiz Adımları
            </h3>
            <div className="space-y-3">
              {PHASES.map((ph, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    phase > i ? 'bg-success text-white' : phase === i ? 'bg-accent text-white animate-pulse' : 'bg-slate-100 text-slate-300'
                  }`}>
                    {phase > i ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm ${phase >= i ? 'text-primary font-medium' : 'text-slate-300'}`}>{ph}</span>
                </div>
              ))}
            </div>
            {isComplete && (
              <div className="mt-4 p-3 bg-success-muted rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success"/>
                <span className="text-sm font-medium text-success">Analiz tamamlandı!</span>
              </div>
            )}
          </div>

          {/* Logs */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-primary mb-3">İşlem Geçmişi</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {logs.length > 0 ? logs.map(l => (
                <div key={l.id} className="flex gap-2 items-start">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${l.type === 'success' ? 'bg-success' : l.type === 'error' ? 'bg-danger' : 'bg-accent'}`}/>
                  <div><p className="text-xs text-slate-600">{l.msg}</p><p className="text-[10px] text-slate-300">{l.time}</p></div>
                </div>
              )) : <p className="text-xs text-slate-300 text-center py-4">Henüz işlem yok</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
