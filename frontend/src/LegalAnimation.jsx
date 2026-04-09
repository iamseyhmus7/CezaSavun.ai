import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, LibraryBig, Rocket, ShieldCheck, X, Sparkles } from 'lucide-react';

const icons = [
  {
    id: 'ocr',
    icon: <FileSearch size={64} />,
    color: 'text-accent',
    title: 'AI OCR Analizi',
    desc: 'Tutanak fotoğraflarındaki verileri yapay zeka ile %99 doğrulukla ayıklar ve dijitalleştirir.',
    pos: "top-[25%] right-[18%]"
  },
  {
    id: 'defense',
    icon: <LibraryBig size={64} />,
    color: 'text-white',
    title: 'Emsal Kararlar',
    desc: 'On binlerce iptal kararını saniyeler içinde tarayarak davanız için en güçlü emsal kararları bulur.',
    pos: "top-[48%] right-[8%]"
  },
  {
    id: 'speed',
    icon: <Rocket size={64} />,
    color: 'text-sky-300',
    title: 'Hızlı Dilekçe',
    desc: 'Tüm hukuki argümanları içeren profesyonel itiraz dilekçesini saniyeler içinde hazır hale getirir.',
    pos: "bottom-[18%] right-[22%]"
  },
  {
    id: 'security',
    icon: <ShieldCheck size={64} />,
    color: 'text-emerald-400',
    title: 'Hukuki Güvence',
    desc: 'Hazırlanan içerikler güncel KTK maddeleri ve yönetmeliklerle tam uyumlu şekilde denetlenir.',
    pos: "bottom-[42%] right-[32%]"
  }
];

export default function LegalAnimation() {
  const [activeFeature, setActiveFeature] = useState(null);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#001A33] to-[#003366] overflow-hidden">

      {/* AI Scanning Line */}
      <motion.div
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-40 z-10 shadow-[0_0_15px_rgba(56,189,248,0.6)]"
      />

      {/* Background Dots Grid */}
      <div className="absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
      />

      {/* Floating Interactive Showcase Items */}
      <div className="absolute inset-0">
        {icons.map((item, i) => (
          <motion.div
            key={item.id}
            className={`absolute z-20 ${item.pos}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, i % 2 === 0 ? -20 : 20, 0]
            }}
            transition={{
              y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
              opacity: { duration: 1 },
              scale: { duration: 1 }
            }}
          >
            {/* Animated Frame / Orbit */}
            <div className="relative group">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10px] border-4 border-dashed border-white/20 group-hover:border-accent/50 transition-colors rounded-[3rem]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-22px] border-2 border-white/10 rounded-[4rem]"
              />

              <motion.button
                onClick={() => setActiveFeature(item)}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(56, 189, 248, 0.3)" }}
                className={`w-36 h-36 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex items-center justify-center shadow-2xl transition-all cursor-pointer group ${item.color}`}
              >
                {item.icon}

                {/* Internal Scan Beam */}
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[10%] bg-accent/10 pointer-events-none"
                />

                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  BILGI
                </div>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Feature Showcase Modal */}
      <AnimatePresence>
        {activeFeature && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveFeature(null)}
              className="absolute inset-0 bg-[#001A33]/70 backdrop-blur-md z-30 cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="absolute z-40 inset-x-0 mx-auto max-w-sm top-[30%] bg-white/10 backdrop-blur-[32px] border border-white/20 p-10 rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.6)] flex flex-col items-center text-center"
            >
              <button
                onClick={() => setActiveFeature(null)}
                className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className={`w-24 h-24 rounded-[32px] bg-white/10 flex items-center justify-center mb-8 shadow-inner ${activeFeature.color}`}>
                {activeFeature.icon}
              </div>

              <h3 className="text-3xl font-black text-white mb-4 flex items-center gap-2 tracking-tight">
                {activeFeature.title}
                <Sparkles size={20} className="text-accent" />
              </h3>
              <p className="text-slate-300 text-base font-bold leading-relaxed px-4">
                {activeFeature.desc}
              </p>

              <button
                onClick={() => setActiveFeature(null)}
                className="mt-10 w-full py-5 bg-accent text-primary font-black text-sm rounded-2xl hover:bg-white hover:scale-[1.02] transition-all transform active:scale-[0.98] shadow-xl shadow-accent/20"
              >
                SİSTEMİ KEŞFET
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Deep Space Atmosphere */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[1000px] h-[1000px] bg-sky-900/20 rounded-full blur-[180px] -bottom-1/2 -right-1/2"
      />
    </div>
  );
}
