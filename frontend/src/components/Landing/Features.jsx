import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, LibraryBig, Sparkles, ShieldCheck, Activity, Database, BarChart3, Lock } from 'lucide-react';

const features = [
  {
    icon: <FileSearch className="w-8 h-8" />,
    title: "Akıllı OCR Analizi",
    desc: "Yapay zeka, ceza tutanağını saniyeler içinde okur ve itiraza temel olacak kritik verileri anında tespit eder.",
    color: "text-accent",
    visual: (
      <div className="mt-6 h-12 flex items-end gap-1 px-2 border-b border-white/10 relative overflow-hidden group-hover:border-accent/30 transition-colors">
        {[40, 70, 45, 90, 65, 80, 30].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            transition={{ delay: i * 0.1, duration: 1 }}
            className="flex-1 bg-accent/20 rounded-t-sm"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    )
  },
  {
    icon: <LibraryBig className="w-8 h-8" />,
    title: "Emsal Karar Eşleştirme",
    desc: "Qdrant tabanlı RAG motorumuz, davanızla en çok örtüşen binlerce güncel mahkeme kararını otomatik olarak tarar.",
    color: "text-sky-400",
    visual: (
      <div className="mt-6 h-12 flex items-center justify-center gap-2 relative">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           className="w-10 h-10 border-2 border-sky-400/20 border-t-sky-400 rounded-full"
         />
         <div className="absolute text-[8px] font-black text-sky-400">RAG</div>
         <div className="flex flex-col gap-1 ml-4 opacity-40 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-1 bg-sky-400/30 rounded-full" />
            <div className="w-12 h-1 bg-sky-400/30 rounded-full" />
            <div className="w-6 h-1 bg-sky-400/30 rounded-full" />
         </div>
      </div>
    )
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "AI Dilekçe Yazarı",
    desc: "Resmi hukuk diline %100 hakim agentlarımız, itiraz gerekçelerinizi profesyonel bir dilekçeye dönüştürür.",
    color: "text-emerald-400",
    visual: (
      <div className="mt-6 h-12 relative flex flex-col justify-center gap-1.5 px-2">
        <motion.div 
          animate={{ x: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-full h-1.5 bg-emerald-500/10 rounded-full overflow-hidden"
        >
          <motion.div 
            animate={{ x: [-100, 100] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1/2 h-full bg-emerald-500/40 blur-sm"
          />
        </motion.div>
        <div className="w-3/4 h-1.5 bg-emerald-500/10 rounded-full" />
        <div className="w-1/2 h-1.5 bg-emerald-500/10 rounded-full" />
      </div>
    )
  },
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Veri Güvenliği",
    desc: "Tüm dosya ve verileriniz uçtan uca şifrelenir. Kişisel verileriniz asla üçüncü taraflarla paylaşılmaz.",
    color: "text-white",
    visual: (
      <div className="mt-6 h-12 flex items-center justify-center gap-3">
        <Lock className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors animate-pulse" />
        <div className="flex flex-wrap gap-1 w-20">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-white/10 rounded-sm group-hover:bg-emerald-500/40 transition-colors" />
          ))}
        </div>
      </div>
    )
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-deep-navy relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03)_0%,transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6"
          >
            <Activity size={12} className="text-accent" />
            <span>Veri Odaklı Kabiliyetler</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter"
          >
            Hukuki Savunmanın <br />
            <span className="text-accent italic underline decoration-4 decoration-accent/20">Dijital Röntgeni</span>
          </motion.h2>
          <p className="text-slate-400 font-bold max-w-2xl mx-auto text-xs uppercase tracking-[0.3em] opacity-50">
            ADVANCED AI MODULES — DATA INTEGRITY
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -5 }}
              className="p-8 dark-glass-strong rounded-[36px] border border-white/5 hover:border-accent/40 transition-all group relative overflow-hidden flex flex-col h-full"
            >
              {/* Card Glow Effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />

              <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform ${feature.color}`}>
                {feature.icon}
              </div>

              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">
                {feature.title}
              </h3>
              
              <p className="text-slate-400 font-medium leading-relaxed text-sm mb-auto">
                {feature.desc}
              </p>

              {/* Mini Visual Aid */}
              {feature.visual}

              {/* Decorative Corner */}
              <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-transparent to-accent/5 rounded-br-[36px] group-hover:to-accent/20 transition-all" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
