import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Search, Download, ArrowRight, Zap } from 'lucide-react';

const steps = [
  {
    icon: <UploadCloud className="w-8 h-8 md:w-10 md:h-10" />,
    title: "Veri Girişi",
    desc: "Ceza tutanağını saniyeler içinde tara veya PDF olarak yükle.",
    color: "from-amber-400/15 to-amber-600/5 text-amber-400",
    border: "border-amber-500/20",
    glow: "group-hover:shadow-[0_0_60px_rgba(251,191,36,0.15)]"
  },
  {
    icon: <Search className="w-8 h-8 md:w-10 md:h-10" />,
    title: "AI Pipeline",
    desc: "Emsal kararlar ve hukuki açıklar milisaniyeler içinde eşleşsin.",
    color: "from-sky-400/15 to-sky-600/5 text-sky-400",
    border: "border-sky-500/20",
    glow: "group-hover:shadow-[0_0_60px_rgba(56,189,248,0.15)]"
  },
  {
    icon: <Download className="w-8 h-8 md:w-10 md:h-10" />,
    title: "Akıllı Çıktı",
    desc: "En güçlü argümanlarla donatılmış profesyonel dilekçen hazır.",
    color: "from-emerald-400/15 to-emerald-600/5 text-emerald-400",
    border: "border-emerald-500/20",
    glow: "group-hover:shadow-[0_0_60px_rgba(52,211,153,0.15)]"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-deep-navy relative overflow-hidden">

      {/* 🌌 Arka Plan Dokusu */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* 🏔 Header */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-sky-400 uppercase tracking-[0.2em] mb-8 shadow-inner backdrop-blur-sm"
          >
            <Zap size={12} fill="currentColor" />
            <span>İşlem Akış Mimarisi</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
            Savunmanı <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">Otopilota Al.</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            Karmaşık bürokrasiyi, saniyeler süren dijital bir deneyime dönüştürdük.
          </p>
        </div>

        {/* 🚀 Adımlar */}
        <div className="grid lg:grid-cols-3 gap-8 relative">

          {/* Lazer Bağlantı Çizgisi (Desktop) - DÜZELTİLDİ */}
          <div className="hidden lg:block absolute top-[28%] left-[10%] right-[10%] h-[2px] bg-white/5 overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-40 h-full bg-gradient-to-r from-transparent via-sky-400 to-transparent"
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="relative group"
            >
              <div className={`relative z-10 flex flex-col items-center p-10 rounded-[48px] bg-gradient-to-b ${step.color} border border-white/[0.04] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-white/10 ${step.glow}`}>
                <div className="absolute top-6 right-8 text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                  0{i + 1}
                </div>
                <div className="w-20 h-20 rounded-3xl bg-white/[0.03] flex items-center justify-center mb-8 border border-white/5 shadow-inner backdrop-blur-sm">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-sky-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed text-center group-hover:text-slate-200 transition-colors">
                  {step.desc}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="lg:hidden flex justify-center my-6 text-white/10">
                  <ArrowRight className="rotate-90" size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 📊 Verimlilik Paneli */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-32 relative group"
        >
          <div className="absolute inset-0 bg-sky-500/5 blur-[100px] rounded-full group-hover:bg-sky-500/10 transition-all duration-700 opacity-60" />
          <div className="relative p-8 md:p-12 rounded-[56px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden group-hover:border-white/10 transition-all">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  Canlı Performans Verisi
                </div>
                <h4 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Geleneksel Yöntemlerden <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">1600 Kat Daha Hızlı.</span>
                </h4>
                <p className="text-slate-500 text-base font-medium leading-relaxed max-w-lg">
                  Yapay zeka motorumuz, bir hukukçunun saatler süren manuel tarama ve yazım sürecini milisaniyelere indirger.
                </p>
                <div className="flex items-center gap-8 pt-4 border-t border-white/5">
                  <div>
                    <div className="text-2xl font-black text-white group-hover:text-sky-400 transition-colors">~9s</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">AI Süresi</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div>
                    <div className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">%99.9</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Zaman Kazancı</div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[400px] p-8 rounded-3xl bg-black/30 border border-white/[0.04] space-y-8 backdrop-blur-sm shadow-inner group-hover:border-white/10 transition-colors">
                <div className="space-y-3">
                  <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-slate-500">Manuel Hazırlık</span>
                    <span className="text-red-400">4 SAAT</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-red-500/30 rounded-full" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-sky-400">CezaSavun AI</span>
                    <span className="text-sky-400">9 SANİYE</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '4%' }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-sky-500 to-sky-300 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.5)]"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-center">
                  <span className="text-[9px] text-slate-600 font-medium uppercase tracking-widest italic">
                    * Logaritmik zaman karşılaştırması
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}