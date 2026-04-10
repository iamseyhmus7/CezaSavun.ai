import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, FileText, Lock, Scale } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import LegalAnimation from './LegalAnimation';

const features = [
  {
    icon: <Bot size={22} />,
    title: "Çok Ajanlı AI Motoru",
    desc: "LangGraph tabanlı 4 uzman agent birlikte çalışır"
  },
  {
    icon: <FileText size={22} />,
    title: "Otomatik Dilekçe",
    desc: "Hukuki dile uygun itiraz belgesi saniyeler içinde"
  },
  {
    icon: <Lock size={22} />,
    title: "Güvenli & Gizli",
    desc: "Verileriniz şifrelenmiş, üçüncü taraflarla paylaşılmaz"
  }
];

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="flex min-h-screen bg-bg-main overflow-hidden font-inter">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Left Panel - Premium Showcase */}
      <div className="hidden lg:flex flex-col w-[45%] relative overflow-hidden bg-[#001A33]">
        <div className="absolute inset-0 z-0 text-white">
          <LegalAnimation />
        </div>

        <div className="relative z-10 p-12 flex flex-col h-full bg-gradient-to-b from-[#001A33]/80 via-transparent to-[#001A33]/80">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="flex items-center gap-3 mb-16 cursor-pointer group w-fit"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:scale-105 transition-transform">
              <Scale className="text-white w-7 h-7" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white uppercase italic">
              cezaSavun<span className="text-accent underline decoration-4 decoration-accent/30 not-italic lowercase">.ai</span>
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-12">
            <h2 className="text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
              Cezanıza Karşı <span className="text-accent italic">Yapay Zeka</span> <br /> Savunmanız.
            </h2>
            <p className="text-slate-400 font-medium text-lg max-w-lg">
              Trafik cezaları ve hukuki itirazlarınızda AI destekli savunma belgelerinizi saniyeler içinde oluşturun.
            </p>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4 max-w-sm">
            {features.map((item, i) => (
              <motion.div key={i} variants={itemVariants} className="flex items-start gap-5 p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px]">
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">{item.icon}</div>
                <div>
                  <div className="text-base font-bold text-white tracking-tight">{item.title}</div>
                  <div className="text-sm font-medium text-slate-400 leading-snug">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif - AI v2.0-MVP
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-white relative">
        <div className="max-w-md w-full mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
