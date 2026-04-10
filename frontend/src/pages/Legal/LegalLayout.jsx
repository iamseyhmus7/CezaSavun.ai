import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ChevronLeft, ShieldCheck, Lock, FileText, ArrowRight } from 'lucide-react';
import { useNavigate, useParams, Link, Outlet, useLocation } from 'react-router-dom';

export default function LegalLayout() {
  const navigate = useNavigate();
  const { type } = useParams();
  const location = useLocation();

  const menuItems = [
    { id: 'terms', label: 'Kullanım Koşulları', icon: <FileText size={18} />, path: '/legal/terms' },
    { id: 'privacy', label: 'Gizlilik Politikası', icon: <Lock size={18} />, path: '/legal/privacy' },
    { id: 'kvkk', label: 'KVKK Aydınlatma', icon: <ShieldCheck size={18} />, path: '/legal/kvkk' },
  ];

  return (
    <div className="min-h-screen bg-deep-navy-dark font-inter">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* Header / Nav */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <Scale className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-white uppercase italic">
              cezaSavun<span className="text-accent underline decoration-2 decoration-accent/30 not-italic lowercase">.ai</span>
            </span>
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 font-bold hover:text-white transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Geri Dön
          </button>
        </header>

        <div className="grid lg:grid-cols-[300px_1fr] gap-12 items-start">
          
          {/* Sidebar - Sticky Menu */}
          <aside className="lg:sticky lg:top-12 space-y-4">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-6">YASAL MERKEZ</p>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all group ${
                    type === item.id 
                    ? 'bg-accent text-deep-navy border-accent shadow-lg shadow-accent/20 font-black' 
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/10 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {type === item.id && <ArrowRight size={16} />}
                </Link>
              ))}
            </nav>

            <div className="mt-12 p-6 dark-glass rounded-3xl border border-white/5">
              <p className="text-xs font-bold text-slate-500 mb-4 leading-relaxed">
                Bu dökümanlar en son 10 Nisan 2026 tarihinde güncellenmiştir. Sorularınız için:
              </p>
              <a href="mailto:hukuk@cezasavun.ai" className="text-accent text-sm font-black hover:underline tracking-tight">
                hukuk@cezasavun.ai
              </a>
            </div>
          </aside>

          {/* Content Area */}
          <main className="dark-glass p-8 md:p-16 rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden min-h-[600px]">
            {/* Top Shine */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="prose prose-invert max-w-none"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
}
