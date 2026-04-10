import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, ShieldAlert, Zap, Globe, Cpu, Database, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden navy-mesh-bg">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black text-accent mb-8 shadow-xl"
          >
            <Zap size={14} className="animate-pulse" />
            <span className="uppercase tracking-widest">Yapay Zeka Hukuk Ekosistemi</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.05] mb-8 tracking-tighter">
            Yıllık Binlerce <br />
            Hukuki Süreç <br />
            <span className="text-accent italic underline decoration-accent/20">Saniyelere</span> İniyor.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-medium mb-12 max-w-xl leading-relaxed">
            CezaSavun.ai, karmaşık trafik cezaları ve hukuki itiraz süreçlerini gelişmiş yapay zeka diagramları ve emsal karar motorları ile saniyeler içinde çözer.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <motion.button
              onClick={() => navigate('/auth/register')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full sm:w-auto px-10 py-5 bg-accent text-deep-navy font-black rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_50px_rgba(56,189,248,0.5)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
              <div className="relative flex items-center justify-center gap-2">
                Hemen Ücretsiz Başla
                <ChevronRight size={18} />
              </div>
            </motion.button>
            <button className="flex items-center gap-3 text-white font-bold hover:text-accent transition-colors group">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent/20 transition-all border-dashed">
                <Play size={18} fill="currentColor" />
              </div>
              Demo İzle
            </button>
          </div>

          {/* Verification Badges */}
          <div className="mt-16 flex flex-wrap items-center gap-8 opacity-80">
            <div className="flex items-center gap-2">
              <ShieldAlert size={24} className="text-accent" />
              <span className="text-[12px] font-black uppercase tracking-widest text-white italic">KVKK Uyumlu</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={24} className="text-accent" />
              <span className="text-[12px] font-black uppercase tracking-widest text-white italic">Ulusal Mevzuat</span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={24} className="text-accent" />
              <span className="text-[12px] font-black uppercase tracking-widest text-white italic">Emsal Veri Tabanı</span>
            </div>
          </div>
        </motion.div>

        {/* Right Visual - Sophisticated AI Ecosystem Diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative hidden lg:block"
        >
          {/* Central AI Hub */}
          <div className="relative w-[700px] h-[700px] flex items-center justify-center">

            {/* Spinning Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute w-[500px] h-[500px] border border-white/30 rounded-full border-dashed"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-[400px] h-[400px] border border-accent/40 rounded-full"
            />

            {/* Central Node */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-60 h-60 dark-glass-strong rounded-[48px] border border-accent/30 flex items-center justify-center relative z-20 shadow-[0_0_50px_rgba(56,189,248,0.2)]"
            >
              <Cpu className="text-accent w-26 h-26 animate-pulse" />

              {/* Pulsing Aura */}
              <div className="absolute inset-0 bg-accent/30 blur-3xl -z-10 rounded-full" />
            </motion.div>

            {/* Orbiting Satellite Nodes */}
            {[
              { icon: <Database />, label: "Veri", pos: "top-10 left-10", delay: 0 },
              { icon: <Globe />, label: "Mevzuat", pos: "top-10 right-10", delay: 0.5 },
              { icon: <ShieldAlert />, label: "Denetim", pos: "bottom-6 right-10", delay: 1 },
              { icon: <Search />, label: "Emsal", pos: "bottom-6 left-10", delay: 1.5 },
            ].map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + node.delay }}
                className={`absolute ${node.pos} flex flex-col items-center gap-2`}
              >
                <div className="w-24 h-24 dark-glass rounded-2xl border border-white/20 flex items-center justify-center text-white/80 hover:text-accent hover:border-accent/40 transition-all cursor-pointer group shadow-xl">
                  {node.icon}
                  {/* Connection Line to Center */}
                  <motion.div
                    animate={{ opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: node.delay }}
                    className="absolute w-20 h-px bg-accent/20 -z-10 rotate-45 origin-left"
                  />
                </div>
                <span className="text-[16] font-black uppercase tracking-widest text-slate-500 italic">{node.label}</span>
              </motion.div>
            ))}

            {/* Data Pulse Particles */}
            <AnimatePresence>
              {[1, 2, 3, 4].map((p) => (
                <motion.div
                  key={p}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.5],
                    opacity: [0, 0.5, 0],
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: p * 0.5 }}
                  className="absolute w-2 h-2 bg-accent rounded-full blur-[2px]"
                />
              ))}
            </AnimatePresence>

          </div>

          {/* Floating Metric Badge */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-16 left-43 p-5 dark-glass border border-white/20 rounded-3xl shadow-2xl backdrop-blur-3xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Zap size={40} />
              </div>
              <div>
                <div className="text-white font-black text-xl line-clamp-1 italic">Saniyeler İçinde</div>
                <div className="text-[15px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap italic">Dilekçe Hazırlama Süresi</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
