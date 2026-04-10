import React, { useState, useEffect, useRef } from "react";
import { Scan, Search, Scale, ShieldCheck, FileUp, FileSignature, Database, ArrowDown } from "lucide-react";
import { Bot } from 'lucide-react';
const agents = [
  {
    id: "classifier",
    step: "01",
    role: "OCR Asistanı",
    name: "Tasnif Ajanı",
    task: "Girdiğiniz tutanağı okur; ceza maddesi, plaka ve tarihi hatasız şekilde ayrıştırır.",
    accent: "#FBBF24",
    accentBg: "rgba(251, 191, 36, 0.08)",
    accentBorder: "rgba(251, 191, 36, 0.25)",
    icon: <Scan size={20} strokeWidth={2} />,
  },
  {
    id: "evidence",
    step: "02",
    role: "Adli Bilişim Uzmanı",
    name: "Kanıt Analiz Ajanı",
    task: "KGYS/EDS fotoğraflarını inceler. Işık ihlali veya plaka netliği gibi teknik açıkları arar.",
    accent: "#38BDF8",
    accentBg: "rgba(56, 189, 248, 0.08)",
    accentBorder: "rgba(56, 189, 248, 0.25)",
    icon: <Search size={20} strokeWidth={2} />,
  },
  {
    id: "writer",
    step: "03",
    role: "Kıdemli Avukat",
    name: "Hukuki Yazım Ajanı",
    task: "Bulunan açıkları ve RAG sisteminden çektiği emsal kararları birleştirerek savunmayı yazar.",
    accent: "#818CF8",
    accentBg: "rgba(129, 140, 248, 0.08)",
    accentBorder: "rgba(129, 140, 248, 0.25)",
    icon: <Scale size={20} strokeWidth={2} />,
  },
  {
    id: "quality",
    step: "04",
    role: "Hukuk Müşaviri",
    name: "Denetim Ajanı",
    task: "Yazılan dilekçeyi KTK maddelerine, emsal uyumuna ve hukuki formata göre son kez onaylar.",
    accent: "#34D399",
    accentBg: "rgba(52, 211, 153, 0.08)",
    accentBorder: "rgba(52, 211, 153, 0.25)",
    icon: <ShieldCheck size={20} strokeWidth={2} />,
  },
];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false); // ✅ DÜZELTİLDİ

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); }, // ✅ DÜZELTİLDİ
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]); // ✅ DÜZELTİLDİ

  return [ref, inView]; // ✅ DÜZELTİLDİ
}

function AgentCard({ agent, delay = 0 }) {
  const [ref, inView] = useInView(); // ✅ DÜZELTİLDİ
  const [hovered, setHovered] = useState(false); // ✅ DÜZELTİLDİ

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden p-6 rounded-3xl transition-all duration-300"
      style={{
        background: hovered ? agent.accentBg : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? agent.accentBorder : "rgba(255,255,255,0.05)"}`,
        cursor: "default",
        transform: inView ? (hovered ? "translateY(-4px)" : "translateY(0)") : "translateY(24px)",
        opacity: inView ? 1 : 0,
        transitionDelay: inView ? `${delay}ms` : "0ms",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 24, right: 24, height: 2,
        background: `linear-gradient(90deg, transparent, ${agent.accent}88, transparent)`,
        opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
      }} />

      <div className="flex items-start gap-4 mb-4">
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: agent.accentBg,
          border: `1px solid ${agent.accentBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: agent.accent,
          transition: "transform 0.3s",
          transform: hovered ? "scale(1.1)" : "scale(1)",
        }}>
          {agent.icon}
        </div>
        <div>
          <div className="text-xs font-black tracking-widest uppercase text-slate-500 mb-1">
            {agent.step} — {agent.role}
          </div>
          <div style={{ color: agent.accent }} className="text-lg font-black tracking-tight">
            {agent.name}
          </div>
        </div>
      </div>

      <p className="text-sm font-medium leading-relaxed text-slate-400 m-0">
        {agent.task}
      </p>

      <div style={{
        position: "absolute", bottom: -5, right: 10,
        fontSize: 64, fontWeight: 900, color: agent.accent,
        opacity: 0.05, pointerEvents: "none", userSelect: "none",
        lineHeight: 1,
      }}>
        {agent.step}
      </div>
    </div>
  );
}

function Connector({ label }) {
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      {label && (
        <div className="text-xs font-black text-slate-500 tracking-widest uppercase my-1">
          {label}
        </div>
      )}
      <ArrowDown size={14} className="text-white/20" />
    </div>
  );
}

function RagBadge() {
  const [ref, inView] = useInView(); // ✅ DÜZELTİLDİ
  return (
    <div ref={ref} className="flex items-center justify-center mb-8"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "scale(1)" : "scale(0.95)",
        transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.2s",
      }}>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
        <Database size={14} className="text-accent animate-pulse" />
        <span className="text-xs font-black text-slate-400 tracking-widest uppercase">
          RAG — Emsal Karar Arşivi
        </span>
      </div>
    </div>
  );
}

export default function ProcessDiagram() {
  const [titleRef, titleInView] = useInView(0.1); // ✅ DÜZELTİLDİ

  return (
    <section className="py-24 bg-deep-navy relative overflow-hidden font-sans">

      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">

        <div
          ref={titleRef}
          className="text-center mb-16"
          style={{
            opacity: titleInView ? 1 : 0,
            transform: titleInView ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-black text-accent uppercase tracking-widest mb-6">
            <Bot size={21} className="text-accent" />
            Çok-Ajanlı Sistem
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Arka Planda <span className="text-accent italic underline decoration-accent/20">Nasıl Çalışıyoruz?</span>
          </h2>
          <p className="text-base text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
            Tek bir belge yüklersiniz. Arkada 4 farklı yapay zeka uzmanı, saniyeler içinde tam teşekküllü bir hukuk departmanı gibi çalışır.
          </p>
        </div>

        <InputStep />
        <Connector label="Veri İşleme" />

        <div className="border border-white/10 rounded-3xl p-6 md:p-10 bg-white/5 backdrop-blur-md shadow-2xl relative">
          <div className="text-center mb-6 text-xs font-black text-slate-500 tracking-widest uppercase">
            Yapay Zeka İşlem Katmanı
          </div>

          <RagBadge />

          <div className="grid md:grid-cols-2 gap-4">
            {agents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} delay={i * 100} />
            ))}
          </div>
        </div>

        <Connector label="Sonuç Üretimi" />
        <OutputStep />

      </div>
    </section>
  );
}

function InputStep() {
  const [ref, inView] = useInView(); // ✅ DÜZELTİLDİ

  return (
    <div ref={ref} className="flex items-center justify-center">
      <div
        className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl w-full max-w-sm shadow-xl"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0">
          <FileUp size={24} />
        </div>
        <div>
          <div className="text-xs font-black text-slate-500 tracking-widest uppercase mb-1">
            Başlangıç Noktası
          </div>
          <div className="text-lg font-black text-white tracking-tight">
            Belge Yükleme
          </div>
          <div className="text-xs font-medium text-slate-400 mt-0.5">
            Ceza tutanağı veya ihlal fotoğrafı
          </div>
        </div>
      </div>
    </div>
  );
}

function OutputStep() {
  const [ref, inView] = useInView(); // ✅ DÜZELTİLDİ

  return (
    <div ref={ref} className="flex items-center justify-center">
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl w-full max-w-md relative overflow-hidden shadow-2xl"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <FileSignature size={24} />
        </div>
        <div className="flex-1">
          <div className="text-xs font-black text-emerald-500/80 tracking-widest uppercase mb-1">
            İşlem Tamamlandı
          </div>
          <div className="text-xl font-black text-white tracking-tight">
            Hazır İtiraz Dilekçesi
          </div>
          <div className="text-xs font-medium text-emerald-100/60 mt-0.5">
            İmzalanmaya ve UYAP'tan sunulmaya hazır
          </div>
        </div>
        <div className="shrink-0 mt-2 sm:mt-0">
          <div className="px-4 py-2 rounded-xl bg-emerald-500 text-deep-navy text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 text-center">
            İndir ↓
          </div>
        </div>
      </div>
    </div>
  );
}