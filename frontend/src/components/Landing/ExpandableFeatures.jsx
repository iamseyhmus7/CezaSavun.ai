import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Book, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';

const features = [
  {
    id: 'ocr',
    icon: <Search className="w-5 h-5" />,
    title: "Akıllı Belge Analizi (OCR)",
    short: "Tutanak verilerini saniyeler içinde dijitalleştirin.",
    details: [
      "Fahri müfettiş kodu ve ihlal maddesi tespiti",
      "Seri numarası ve tebliğ tarihi ayrıştırma",
      "%99.8 doğruluk payı ile sıfır hata",
      "Manuel veri girişi yükünü ortadan kaldırır"
    ],
    styles: {
      text: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "border-sky-400/20",
      glow: "shadow-[0_0_50px_rgba(56,189,248,0.15)]", // Parlama efekti lacivert üzerinde daha belirgin
      line: "bg-sky-400"
    }
  },
  {
    id: 'rag',
    icon: <Book className="w-5 h-5" />,
    title: "Dinamik Emsal Eşleştirme (RAG)",
    short: "Davanıza en uygun hukuki dayanakları bulun.",
    details: [
      "Yargıtay ve AYM güncel iptal kararları",
      "Madde 51/2-a, 47/1-c ve 61 özelinde tarama",
      "Gerekçeli karar metinlerinden otomatik alıntı",
      "Savunma argümantasyonunu veriyle güçlendirir"
    ],
    styles: {
      text: "text-indigo-400",
      bg: "bg-indigo-400/10",
      border: "border-indigo-400/20",
      glow: "shadow-[0_0_50px_rgba(129,140,248,0.15)]",
      line: "bg-indigo-400"
    }
  },
  {
    id: 'output',
    icon: <Sparkles className="w-5 h-5" />,
    title: "UYAP Uyumlu Resmi Çıktı",
    short: "Adli makam standartlarında profesyonel dilekçe.",
    details: [
      "Sulh Ceza Hakimliği formatına %100 uyum",
      "UYAP Vatandaş portalı üzerinden sunulmaya hazır",
      "Resmi hukuk dili ve profesyonel üslup",
      "İmzalanmaya hazır PDF veya DOCX çıktısı"
    ],
    styles: {
      text: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
      glow: "shadow-[0_0_50px_rgba(52,211,153,0.15)]",
      line: "bg-emerald-400"
    }
  }
];

export default function ExpandableFeatures() {
  const [expanded, setExpanded] = useState('ocr');

  return (
    // DÜZELTME: bg-slate-950 yerine projenin ana rengi olan bg-deep-navy kullanıldı.
    <section id="features" className="py-32 bg-deep-navy relative overflow-hidden">
      {/* Lacivert üzerinde daha derin görünen arka plan ışıltısı */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-sky-500/5 blur-[140px] rounded-full pointer-events-none opacity-60" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">

        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-300 uppercase tracking-widest mb-8 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-sky-400" />
            <span>İleri Seviye Kabiliyetler</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Hukuki Süreç Mimarlığında <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              Üstün Teknoloji
            </span>
          </h2>
          <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
            Statik araçların ötesinde, her itiraz için özel olarak kurgulanan algoritmik bir savunma altyapısı sunuyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {features.map((feature) => {
            const isExpanded = expanded === feature.id;

            return (
              <motion.div
                key={feature.id}
                layout
                onClick={() => setExpanded(isExpanded ? null : feature.id)}
                // Lacivert arka plan üzerinde premium "glass" etkisi
                className={`relative overflow-hidden cursor-pointer transition-all duration-500 ease-out rounded-3xl border backdrop-blur-sm ${isExpanded
                    ? `bg-white/[0.05] border-white/10 ${feature.styles.glow}`
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/10'
                  }`}
              >
                {/* Sol taraftaki parlayan aktif durum çizgisi */}
                <motion.div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${feature.styles.line}`}
                  initial={false}
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                />

                <div className="p-6 md:p-8 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5 md:gap-6">
                    <div className={`shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isExpanded ? `${feature.styles.bg} ${feature.styles.border} ${feature.styles.text}` : 'bg-white/5 border-white/10 text-slate-500'
                      }`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">{feature.title}</h3>
                      <p className="text-slate-400 font-medium text-sm md:text-base mt-1.5">{feature.short}</p>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${isExpanded ? 'bg-white/10 text-white' : 'text-slate-600'
                      }`}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      // Daha yumuşak, organik bir yaylanma animasyonu
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <div className="px-6 md:px-8 pb-8 pt-2">
                        {/* İç bölücü çizgi */}
                        <div className="w-full h-px bg-gradient-to-r from-white/10 to-transparent mb-6" />

                        {/* Detay maddeleri hiyerarşisi */}
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                          {feature.details.map((detail, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-start gap-3 group"
                            >
                              <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${feature.styles.text}`} />
                              <span className="text-slate-300 font-medium text-sm md:text-base leading-relaxed group-hover:text-white transition-colors">
                                {detail}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}