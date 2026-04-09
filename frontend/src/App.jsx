import React, { useState, useEffect, useRef } from 'react';
import { 
  Scale, UploadCloud, FileText, CheckCircle2, ChevronRight, 
  Download, Eye, Sparkles, Clock, History, AlertTriangle, 
  Fingerprint, ShieldCheck, Loader2, Home, FolderOpen, 
  Users, Calendar, Settings, Search, Bell, ExternalLink,
  ChevronDown, Filter, LayoutGrid, MoreHorizontal, User, LogOut
} from 'lucide-react';

import Auth from './Auth';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [view, setView] = useState('login');
  const [step, setStep] = useState(1);
  const [analysisPhase, setAnalysisPhase] = useState(0);
  const [apiResult, setApiResult] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const fileInputRef = useRef();

  const addLog = (message, type = 'info') => {
    setLogs(prev => [{ id: Date.now(), message, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5));
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setStep(2); // "Analiz" aşaması görseli
    setIsProcessing(true);
    setAnalysisPhase(0);
    addLog(`${file.name} belgesi yüklendi, OCR başlatılıyor...`, 'process');

    const interval = setInterval(() => {
      setAnalysisPhase(prev => {
        if (prev >= 3) return 3;
        return prev + 1;
      });
    }, 2000);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/petitions/generate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setApiResult(data);
      addLog("AI Analizi tamamlandı, dilekçe hazır.", 'success');
    } catch (e) {
      console.error("Backend hatası:", e);
      addLog("AI Analizi sırasında hata oluştu.", 'error');
      setApiResult({ status: "error", quality_score: 0 });
    } finally {
      clearInterval(interval);
      setAnalysisPhase(4);
      setIsProcessing(false);
      setStep(3); // "Tamamlandı" aşaması
    }
  };

  const handleDownloadRaw = () => {
    if (!apiResult || !apiResult.draft_petition) return;
    const element = document.createElement("a");
    const file = new Blob([apiResult.draft_petition], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `itiraz_dilekcesi_${uploadedFileName.split('.')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (view === 'login' || view === 'register') {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <Auth setView={setView} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-8 shrink-0">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Scale className="text-white w-7 h-7" />
        </div>
        <nav className="flex flex-col gap-4">
          <SidebarItem icon={<Home size={22} />} active />
          <SidebarItem icon={<FolderOpen size={22} />} />
          <SidebarItem icon={<Users size={22} />} />
          <SidebarItem icon={<Calendar size={22} />} />
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <SidebarItem icon={<Settings size={22} />} />
          <div onClick={() => setView('login')} title="Çıkış Yap">
             <SidebarItem icon={<LogOut size={22} />} />
          </div>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. TOP HEADER */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-extrabold text-primary flex items-center gap-2">
              CezaSavun<span className="text-accent underline decoration-2 decoration-accent/30 lowercase">.ai</span>
              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-md ml-2 tracking-widest font-bold">PRO</span>
            </h1>
            <nav className="hidden md:flex gap-6 text-sm font-bold">
              <span className="text-primary bg-slate-100 px-4 py-2 rounded-xl cursor-pointer">Workspace</span>
              <span className="text-slate-400 hover:text-primary transition-colors cursor-pointer">Analytics</span>
              <span className="text-slate-400 hover:text-primary transition-colors cursor-pointer">Archived</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-slate-100/50 border border-slate-200 px-4 py-2 rounded-full text-xs font-bold text-primary">
              <Sparkles size={14} className="text-accent" />
              PRO PLAN: 142 DOSYA
            </div>
            <div className="flex items-center gap-2">
              <HeaderIcon icon={<Search size={20} />} />
              <HeaderIcon icon={<Bell size={20} />} badge />
              <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden ml-2 cursor-pointer">
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=0F172A&color=fff" alt="User" />
              </div>
            </div>
          </div>
        </header>

        {/* 3. CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8 animate-fade-in">
          
          {/* STATS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="TOPLAM AKTİF DOSYA" value="84" growth="+12%" />
            <StatCard label="AI ANALİZ TAMAMLANDI" value="512" sub="Bu Ay" />
            <StatCard label="BAŞARI ORANI (ORT.)" value="%92" sub="Yüksek" />
            <StatCard label="KAZANILAN İTİRAZLAR" value="₺12.4k" sub="Tasarruf" />
          </section>

          {/* ACTIVE CASES TABLE */}
          <section className="glass-card rounded-[32px] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <h2 className="font-extrabold text-lg text-primary tracking-tight">Aktif Dosya Yönetimi</h2>
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <span className="bg-white text-primary px-3 py-1.5 rounded-lg shadow-sm">Tümü</span>
                  <span className="text-slate-400 px-3 py-1.5 cursor-pointer">Sıradakiler</span>
                  <span className="text-slate-400 px-3 py-1.5 cursor-pointer">İncelemede</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Filter size={14} /> Filtrele
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">
                  <Download size={14} /> Dışa Aktar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-4">DOSYA ID</th>
                    <th className="px-4 py-4">MÜVEKKİL / PLAKA</th>
                    <th className="px-4 py-4">İHLAL TÜRÜ</th>
                    <th className="px-4 py-4">HUKUKİ DAYANAK</th>
                    <th className="px-4 py-4">OLASILIK</th>
                    <th className="px-4 py-4">DURUM</th>
                    <th className="px-8 py-4 text-center">İŞLEMLER</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <TableRow id="#AI-9821" name="Ahmet Yılmaz" plate="34 ABC 123" type="Hız İhlali (Radar)" base="Levha Hatası" prob="85" status="ready" probColor="bg-emerald-500" />
                  <TableRow id="#AI-9819" name="Zeynep Kaya" plate="06 ABC 456" type="Park İhlali" base="Süre Aşımı" prob="62" status="processing" probColor="bg-amber-500" />
                  <TableRow id="#AI-9815" name="Mehmet Can" plate="35 XYZ 789" type="Emniyet Kemeri" base="Kamera Açısı" prob="91" status="ready" probColor="bg-emerald-500" />
                  <TableRow id="#AI-9814" name="Fatma Nur" plate="16 BB 999" type="Kırmızı Işık" base="Sinyal Hatası" prob="78" status="waiting" probColor="bg-emerald-500" />
                </tbody>
              </table>
            </div>
            
            <div className="px-8 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
              <p>1-15 of 248 total cases</p>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white transition-colors">{"<"}</button>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white transition-colors">{">"}</button>
              </div>
            </div>
          </section>

          {/* BOTTOM SECTION */}
          <div className="grid lg:grid-cols-2 gap-8 pb-8">
            {/* AI LIVE FEED */}
            <section className="glass-card rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-primary flex items-center gap-2 tracking-tight">
                  AI Analiz Akışı
                  <span className="flex items-center gap-1.5 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> CANLI
                  </span>
                </h3>
              </div>
              <div className="space-y-6">
                {logs.length > 0 ? logs.map(log => (
                  <LogItem key={log.id} log={log} />
                )) : (
                  <>
                    <LogItem log={{ message: "#AI-9821 için Yargıtay 19. Ceza Dairesi emsal kararları tarandı.", type: 'info', time: 'Şimdi' }} />
                    <LogItem log={{ message: "Ahmet Yılmaz itiraz dilekçesi başarıyla oluşturuldu.", type: 'success', time: '2 dk önce' }} />
                    <LogItem log={{ message: "Zeynep Kaya: OCR taraması %98 doğrulukla tamamlandı.", type: 'info', time: '5 dk önce' }} />
                  </>
                )}
              </div>
            </section>

            {/* CONTACTS */}
            <section className="glass-card rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-extrabold text-primary tracking-tight">Müvekkil İletişim</h3>
                <span className="text-xs font-bold text-accent hover:underline cursor-pointer">HEPSİNİ GÖR</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ContactItem name="Ömer Faruk" desc="Hazır: İmzaya Bekliyor" />
                <ContactItem name="Ayşe Demir" desc="Eksik Belge: Ruhsat" />
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* 4. RIGHT ASISTANT PANEL */}
      <aside className="hidden xl:flex w-[400px] bg-white border-l border-slate-200 flex-col shrink-0 p-8 shadow-2xl relative z-40">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <Sparkles size={18} fill="currentColor" />
          </div>
          <h3 className="font-extrabold text-primary tracking-tight uppercase text-sm">YENİ DOSYA OLUŞTUR</h3>
        </div>

        {/* PROGRESS STEPPER */}
        <div className="flex justify-between items-center px-4 relative mb-12">
          <div className="absolute top-[18px] left-0 w-full h-0.5 bg-slate-100 -z-10" />
          <div 
            className="absolute top-[18px] left-0 h-0.5 bg-accent transition-all duration-700 -z-10" 
            style={{ width: `${(step-1) * 50}%` }}
          />
          <RightStepNode num={1} label="YÜKLE" active={step >= 1} current={step === 1} />
          <RightStepNode num={2} label="ANALİZ" active={step >= 2} current={step === 2} />
          <RightStepNode num={3} label="TAMAM" active={step >= 3} current={step === 3} />
        </div>

        {/* FORM & UPLOAD */}
        <div className="flex-1 space-y-8 overflow-y-auto pr-2 pb-6">
          <div 
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group relative overflow-hidden
              ${isProcessing ? 'border-accent bg-accent/5' : 'border-slate-200 hover:border-accent hover:bg-slate-50'}`}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 group-hover:-translate-y-1 transition-transform">
                {isProcessing ? <Loader2 className="animate-spin text-accent" /> : <UploadCloud className="text-slate-400 group-hover:text-accent" />}
              </div>
              <p className="font-bold text-sm text-primary mb-1">Dosyayı Buraya Bırak</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tutanak, E-Devlet Ekranı vb.</p>
              <button className="mt-6 bg-primary text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-colors">Dosya Seç</button>
            </div>
            {isProcessing && (
               <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100">
                  <div className="h-full bg-accent animate-[loading_20s_ease-in-out]" style={{width: `${(analysisPhase+1)*20}%`}} />
               </div>
            )}
          </div>

          <div className="space-y-6">
            <InputField label="MÜVEKKİL ADI" placeholder="İsim Soyisim" />
            <InputField label="PLAKA" placeholder="34 XXX 000" />
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-2 block">ÖNCELİK</label>
              <div className="relative cursor-pointer bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between group hover:border-slate-200 transition-colors">
                <span className="text-sm font-bold text-primary">Normal</span>
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* RESULTS ACTION */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          {step === 3 && apiResult ? (
            <div className="space-y-3 animate-fade-in">
              <button 
                onClick={handleDownloadRaw}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group transition-all"
              >
                <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                Dilekçeyi İndir
              </button>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest">ANALİZ SONUCU</span>
                  <span className="text-xs font-bold text-emerald-500">%{apiResult.quality_score} BAŞARI</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-3">
                  {apiResult.draft_petition?.substring(0, 150)}...
                </p>
              </div>
              <button onClick={() => {setStep(1); setApiResult(null); setUploadedFileName("");}} className="w-full py-3 text-xs font-bold text-slate-400 hover:text-primary transition-colors">Daha Önceki Dosyalara Dön</button>
            </div>
          ) : (
            <>
              <button 
                disabled={isProcessing}
                className={`w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all group
                  ${isProcessing ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02] active:scale-98 shadow-primary/20'}`}
              >
                <Sparkles size={20} fill="currentColor" />
                Analizi Başlat
              </button>
              <p className="text-[10px] text-center text-slate-400 font-bold tracking-wide italic">Tahmini işlem süresi: 8.4 saniye</p>
            </>
          )}
        </div>
      </aside>

      {/* MOBILE TRIGGER (Optional) */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center animate-bounce">
          <UploadCloud />
        </button>
      </div>

    </div>
  );
}

// SUB-COMPONENTS
function SidebarItem({ icon, active = false }) {
  return (
    <div className={`sidebar-item ${active ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}>
      {icon}
    </div>
  );
}

function HeaderIcon({ icon, badge = false }) {
  return (
    <div className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-all cursor-pointer relative">
      {icon}
      {badge && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />}
    </div>
  );
}

function StatCard({ label, value, growth, sub }) {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-3">{label}</p>
          <div className="flex items-baseline gap-3">
            <h4 className="text-3xl font-extrabold text-primary tracking-tight">{value}</h4>
            {growth && <span className="text-emerald-500 text-xs font-bold">{growth}</span>}
            {sub && <span className="text-slate-400 text-xs font-bold">{sub}</span>}
          </div>
        </div>
        <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl border border-slate-100">
           {growth ? <History className="text-emerald-500 w-5 h-5" /> : <Clock className="text-slate-300 w-5 h-5" />}
        </div>
      </div>
    </div>
  );
}

function TableRow({ id, name, plate, type, base, prob, status, probColor }) {
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-5 font-bold text-slate-400 text-xs tracking-tighter group-hover:text-primary transition-colors">{id}</td>
      <td className="px-4 py-5">
        <div className="flex flex-col">
          <span className="font-extrabold text-primary">{name}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plate}</span>
        </div>
      </td>
      <td className="px-4 py-5 text-xs font-bold text-slate-600">{type}</td>
      <td className="px-4 py-5">
        <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tight">{base}</span>
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center gap-3 w-28">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
             <div className={`h-full ${probColor} rounded-full`} style={{width: `${prob}%`}} />
          </div>
          <span className="text-xs font-extrabold text-primary">%{prob}</span>
        </div>
      </td>
      <td className="px-4 py-5 font-bold">
        <span className={`status-badge ${status === 'ready' ? 'status-ready' : status === 'processing' ? 'status-processing' : 'status-waiting'}`}>
          {status === 'ready' ? 'HAZIR' : status === 'processing' ? 'ANALİZDE' : 'BEKLEMEDE'}
        </span>
      </td>
      <td className="px-8 py-5 text-center">
        <button className="text-slate-300 hover:text-primary transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </td>
    </tr>
  );
}

function LogItem({ log }) {
  const isSuccess = log.type === 'success';
  return (
    <div className="flex gap-4 group animate-fade-in">
      <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 transition-all group-hover:scale-110 ${isSuccess ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-sky-500'}`}>
        {isSuccess ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-800 leading-relaxed mb-1">{log.message}</p>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.time}</span>
      </div>
    </div>
  );
}

function ContactItem({ name, desc }) {
  return (
    <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center gap-4 hover:bg-white transition-all cursor-pointer hover:shadow-dashboard">
      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
         <User size={20} className="text-slate-300" />
      </div>
      <div className="min-w-0">
        <h5 className="text-xs font-extrabold text-primary truncate">{name}</h5>
        <p className="text-[10px] text-slate-400 font-bold truncate">{desc}</p>
      </div>
    </div>
  );
}

function RightStepNode({ num, label, active, current }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all duration-500 border-2
        ${current ? 'bg-primary text-white border-primary scale-110 shadow-lg' : active ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-slate-300 border-slate-100'}`}>
        {num}
      </div>
      <span className={`text-[8px] font-black tracking-widest ${current ? 'text-primary' : active ? 'text-slate-600' : 'text-slate-300'}`}>{label}</span>
    </div>
  );
}

function InputField({ label, placeholder }) {
  return (
    <div>
      <label className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-2 block">{label}</label>
      <input 
        type="text" 
        placeholder={placeholder} 
        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-primary focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all outline-none placeholder:text-slate-300"
      />
    </div>
  );
}

